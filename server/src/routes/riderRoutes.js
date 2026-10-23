import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import Rider from '../models/Rider.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medix_secure_jwt_secret_key_2026';
const RIDER_PIN = process.env.RIDER_PIN || '5678';

/**
 * POST /api/rider/login
 * Authenticates delivery riders from User table (with Rider fallback & auto-sync)
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
    let user = await User.findOne({ phone: cleanPhone, role: 'rider' });
    let rider = await Rider.findOne({ phone: cleanPhone });

    if (!user && !rider) {
      return res.status(401).json({
        success: false,
        message: 'No delivery rider registered with this phone number',
      });
    }

    // Auto-sync into User table if only present in Rider collection
    if (!user && rider) {
      user = await User.findOneAndUpdate(
        { phone: cleanPhone, role: 'rider' },
        {
          name: rider.name,
          phone: cleanPhone,
          role: 'rider',
          password: rider.password,
          vehicleNumber: rider.vehicleNumber || '',
          isActive: true,
          isAvailable: true,
          riderRef: rider._id,
        },
        { upsert: true, new: true }
      );
    }

    const storedPassword = user?.password || rider?.password;
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
        riderId: rider?._id || user._id,
        role: 'rider',
        name: user.name || rider?.name,
        phone: cleanPhone,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Authenticated successfully',
      token,
      rider: {
        id: user._id,
        riderId: rider?._id || user._id,
        name: user.name || rider?.name,
        phone: cleanPhone,
        vehicleNumber: user.vehicleNumber || rider?.vehicleNumber || '',
      },
    });
  } catch (err) {
    console.error('Error in rider login:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

/**
 * Legacy PIN check fallback
 */
router.post('/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (String(pin).trim() === RIDER_PIN) {
    return res.json({ success: true, message: 'Rider authenticated successfully' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Rider PIN' });
});

/**
 * GET /api/rider/orders
 */
router.get('/orders', async (req, res) => {
  try {
    let { phone } = req.query;

    // Check JWT authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded?.phone) phone = phone || decoded.phone;
      } catch (e) {}
    }

    // Rider can view assigned orders before packaging (CONFIRMED), when packed (PACKED), en route, and delivered
    const filter = {
      status: {
        $in: [
          'CONFIRMED',
          'PACKED',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'confirmed',
          'packed',
          'out_for_delivery',
          'delivered',
        ],
      },
    };

    if (phone) {
      filter['rider.phone'] = String(phone).replace(/\D/g, '').slice(-10);
    }

    const orders = await Order.find(filter).sort({ updatedAt: -1, placedAt: -1 }).limit(30).lean();

    const formatted = orders.map((o) => {
      const addr = o.address || {};
      const displayAddress = addr.fullAddress || addr.villagePo || addr.street || addr.city || (typeof addr === 'string' ? addr : '') || 'Your Address';
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
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: o.paymentMethod || 'Cash on Delivery',
        codAmount: totalBill,
        pharmacy: o.pharmacy || {
          name: 'Partner Pharmacy',
          address: 'Siliguri',
          phone: '',
        },
        rider: o.rider,
      };
    });

    return res.json({
      success: true,
      orders: formatted,
    });
  } catch (err) {
    console.error('Error fetching rider orders:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/rider/orders/:id/status
 * Body: { status, otp, reason }
 */
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp, reason } = req.body;

    const conditions = [{ orderId: id }];
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      conditions.push({ _id: id });
    }

    const orderDoc = await Order.findOne({ $or: conditions });
    if (!orderDoc) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const newStatus = status ? status.toUpperCase() : orderDoc.status;
    const updates = { status: newStatus };

    if (reason) {
      updates.cancellationReason = reason;
    }

    // 1. Starting delivery (OUT_FOR_DELIVERY) requires verifying the Store Pickup OTP
    if (newStatus === 'OUT_FOR_DELIVERY') {
      if (orderDoc.status !== 'PACKED') {
        return res.status(400).json({
          success: false,
          message: 'Order has not been confirmed & packed by the pharmacy yet.',
        });
      }

      const cleanOtp = String(otp || '').trim();
      const expectedOtp = String(orderDoc.pickupOtp || '').trim();

      if (!cleanOtp || cleanOtp !== expectedOtp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Store Pickup OTP. Please ask the pharmacy for the 4-digit OTP shown on their screen.',
        });
      }

      // Ensure customer Delivery OTP is generated
      if (!orderDoc.deliveryOtp) {
        updates.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
      }
    }

    // 2. Completing delivery (DELIVERED) requires verifying the Customer Delivery OTP
    if (newStatus === 'DELIVERED') {
      const cleanOtp = String(otp || '').trim();
      const expectedOtp = String(orderDoc.deliveryOtp || '').trim();

      if (!cleanOtp || cleanOtp !== expectedOtp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Customer Delivery OTP. Please enter the 4-digit OTP shown on the customer\'s screen.',
        });
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
    console.error('Error updating status by rider:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
