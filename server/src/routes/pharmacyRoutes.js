import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import Pharmacy from '../models/Pharmacy.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medix_secure_jwt_secret_key_2026';
const PHARMACY_PIN = process.env.PHARMACY_PIN || '9999';

/**
 * POST /api/pharmacy/login
 * Authenticates pharmacy partners from User table (with Pharmacy fallback & auto-sync)
 * Body: { phone, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // 1. Check in User table first
    let user = await User.findOne({ phone: cleanPhone, role: 'pharmacy' });
    let pharmacy = await Pharmacy.findOne({ phone: cleanPhone });

    if (!user && !pharmacy) {
      return res.status(401).json({
        success: false,
        message: 'No partner pharmacy registered with this phone number',
      });
    }

    // Auto-sync if only present in Pharmacy collection
    if (!user && pharmacy) {
      user = await User.findOneAndUpdate(
        { phone: cleanPhone, role: 'pharmacy' },
        {
          name: pharmacy.name,
          phone: cleanPhone,
          role: 'pharmacy',
          password: pharmacy.password,
          storeName: pharmacy.name,
          area: pharmacy.area || '',
          pharmacyRef: pharmacy._id,
          address: {
            fullName: pharmacy.name,
            fullAddress: pharmacy.address || '',
            villagePo: pharmacy.area || '',
          },
        },
        { upsert: true, new: true }
      );
    }

    const storedPassword = user?.password || pharmacy?.password;
    if (!storedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Password not set. Please ask Admin to set password in Admin Panel.',
      });
    }

    const isMatch = await bcrypt.compare(String(password), storedPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        pharmacyId: pharmacy?._id || user._id,
        role: 'pharmacy',
        name: user.name || pharmacy?.name,
        phone: cleanPhone,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Authenticated successfully',
      token,
      pharmacy: {
        id: user._id,
        pharmacyId: pharmacy?._id || user._id,
        name: user.name || user.storeName || pharmacy?.name,
        phone: cleanPhone,
        address: user.address?.fullAddress || pharmacy?.address || '',
        area: user.area || pharmacy?.area || '',
      },
    });
  } catch (err) {
    console.error('Error in pharmacy login:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

/**
 * Legacy PIN check fallback
 */
router.post('/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (String(pin).trim() === PHARMACY_PIN) {
    return res.json({ success: true, message: 'Pharmacy authenticated successfully' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Pharmacy PIN' });
});

/**
 * GET /api/pharmacy/stores
 */
router.get('/stores', async (req, res) => {
  try {
    const stores = await Pharmacy.find({ isOpen: true }).select('-password').sort({ name: 1 });
    return res.json({ success: true, stores });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/pharmacy/orders
 * Query: ?storeName=... or ?storePhone=...
 */
router.get('/orders', async (req, res) => {
  try {
    let { storeName, storePhone } = req.query;

    // Also extract store details from JWT token if Authorization header is present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded?.phone) storePhone = storePhone || decoded.phone;
        if (decoded?.name) storeName = storeName || decoded.name;
      } catch (e) {
        // Token invalid or expired, continue with query params
      }
    }

    const filter = {};

    const orConditions = [];
    if (storePhone) {
      const cleanPhone = String(storePhone).replace(/\D/g, '').slice(-10);
      orConditions.push({ 'pharmacy.phone': cleanPhone });
    }
    if (storeName && storeName !== 'all') {
      const escaped = storeName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orConditions.push({ 'pharmacy.name': new RegExp(`^${escaped}$`, 'i') });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    } else {
      filter['pharmacy.name'] = { $exists: true, $ne: 'Nearest Verified Chemist' };
    }

    const orders = await Order.find(filter).sort({ updatedAt: -1, placedAt: -1 }).limit(60).lean();

    const formatted = orders.map((o) => {
      const addr = o.address || {};
      const displayAddress = addr.fullAddress || addr.villagePo || addr.street || addr.city || (typeof addr === 'string' ? addr : '') || 'Customer Address';
      const pinPart = addr.pinCode ? `, ${addr.pinCode}` : '';
      const totalBill = o.bill?.total || o.fees?.totalAmount || 0;
      const st = (o.status || 'SEARCHING').toUpperCase();

      return {
        id: o.orderId || `MDX-${o._id.toString().slice(-6).toUpperCase()}`,
        _id: o._id,
        orderId: o.orderId,
        customerName: o.customerName || addr.fullName || 'Customer',
        customerPhone: o.customerPhone || '',
        placedAt: o.placedAt || o.createdAt,
        status: st,
        eta: o.eta || 'within 24 hrs',
        deliveryAddress: `${displayAddress}${pinPart && !displayAddress.includes(addr.pinCode) ? pinPart : ''}`.trim() || 'Customer Address',
        landmark: addr.landmark || '',
        items: (o.items || []).map((item) => ({
          id: item.id || item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          strength: item.strength || '',
          category: item.category || '',
          requiresRx: item.requiresRx !== undefined ? item.requiresRx : Boolean(item.prescriptionRequired),
        })),
        paymentMethod: o.paymentMethod || 'Cash on Delivery',
        totalBill,
        pharmacy: o.pharmacy,
        rider: o.rider?.name ? o.rider : null,
        prescriptionUploaded: Boolean(o.prescriptionUploaded),
        pickupOtp: o.pickupOtp || '',
        cancellationReason: o.cancellationReason || null,
      };
    });

    const counts = {
      all: formatted.length,
      pending: formatted.filter((o) => ['PLACED', 'CONFIRMED'].includes(o.status)).length,
      packed: formatted.filter((o) => o.status === 'PACKED').length,
      out_for_delivery: formatted.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
      delivered: formatted.filter((o) => o.status === 'DELIVERED').length,
    };

    return res.json({
      success: true,
      counts,
      orders: formatted,
    });
  } catch (err) {
    console.error('Error fetching pharmacy orders:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/pharmacy/orders/:id/status
 */
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const conditions = [{ orderId: id }];
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      conditions.push({ _id: id });
    }

    const updates = {};
    if (status.toUpperCase() === 'REJECTED' || status.toUpperCase() === 'DECLINED') {
      // Revert order back to SEARCHING and unassign pharmacy so Admin can reassign to another store
      updates.status = 'SEARCHING';
      updates.pharmacy = null;
      updates.cancellationReason = reason ? `Declined by store: ${reason}` : 'Store declined to fulfill';
    } else {
      updates.status = status.toUpperCase();
      if (reason) {
        updates.cancellationReason = reason;
      }
      // When store marks order as PACKED, ensure 4-digit pickupOtp & deliveryOtp exist
      if (status.toUpperCase() === 'PACKED') {
        const existingDoc = await Order.findOne({ $or: conditions });
        if (!existingDoc?.pickupOtp) {
          updates.pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
        }
        if (!existingDoc?.deliveryOtp) {
          updates.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        }
      }
    }

    const updated = await Order.findOneAndUpdate(
      { $or: conditions },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updated,
    });
  } catch (err) {
    console.error('Error updating status by pharmacy:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
