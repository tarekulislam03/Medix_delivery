import express from 'express';
import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import Pharmacy from '../models/Pharmacy.js';
import Rider from '../models/Rider.js';
import User from '../models/User.js';
import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminOrderPricing,
} from '../controllers/adminController.js';
import { validate } from '../middleware/validate.js';
import {
  updateOrderStatusSchema,
  updateOrderPricingSchema,
} from '../validation/orderSchemas.js';

const router = express.Router();
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

/**
 * POST /api/admin/verify-pin
 */
router.post('/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (String(pin).trim() === ADMIN_PIN) {
    return res.json({ success: true, message: 'Admin authenticated successfully' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
});

/**
 * GET /api/admin/orders
 */
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ placedAt: -1, createdAt: -1 }).lean();

    const formatted = orders.map((o) => {
      const addr = o.address || {};
      const displayAddress = addr.fullAddress || addr.villagePo || addr.street || addr.city || (typeof addr === 'string' ? addr : '') || 'Your Address';
      const pinPart = addr.pinCode ? `, ${addr.pinCode}` : '';

      const totalBill = o.bill?.total || o.fees?.totalAmount || 0;
      const subtotalBill = o.bill?.subtotal || o.fees?.totalAmount || 0;
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
        items: (o.items || []).map((item) => ({
          id: item.id || item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          strength: item.strength || '',
          category: item.category || '',
          requiresRx: item.requiresRx !== undefined ? item.requiresRx : Boolean(item.prescriptionRequired),
        })),
        address: `${displayAddress}${pinPart && !displayAddress.includes(addr.pinCode) ? pinPart : ''}`.trim() || 'Your Address',
        rawAddress: o.address,
        paymentMethod: o.paymentMethod || 'Cash on Delivery',
        bill: {
          subtotal: subtotalBill,
          discount: o.bill?.discount || 0,
          delivery: o.bill?.delivery || o.fees?.deliveryFee || 0,
          platform: o.bill?.platform || o.fees?.serviceFee || 0,
          total: totalBill,
        },
        pharmacy: o.pharmacy?.name && !o.pharmacy.name.includes('Nearest Verified') ? o.pharmacy : null,
        rawPharmacy: o.pharmacy,
        rider: o.rider?.name ? o.rider : null,
        prescriptionUploaded: Boolean(o.prescriptionUploaded),
        cancellationReason: o.cancellationReason || null,
      };
    });

    const counts = {
      all: formatted.length,
      unallocated: formatted.filter((o) => ['SEARCHING', 'PLACED'].includes(o.status) && !o.pharmacy).length,
      confirmed: formatted.filter((o) => o.status === 'CONFIRMED').length,
      packed: formatted.filter((o) => o.status === 'PACKED').length,
      out_for_delivery: formatted.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
      delivered: formatted.filter((o) => o.status === 'DELIVERED').length,
      cancelled: formatted.filter((o) => o.status === 'CANCELLED').length,
    };

    return res.json({
      success: true,
      counts,
      orders: formatted,
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/orders/:id/allocate
 * Body: { pharmacy: { name, address, phone }, rider: { name, phone, vehicleNumber }, status, eta }
 */
router.put('/orders/:id/allocate', async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacy, rider, status, eta } = req.body;

    const conditions = [{ orderId: id }];
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      conditions.push({ _id: id });
    }

    const updates = {};
    if (pharmacy) {
      updates.pharmacy = {
        name: pharmacy.name || 'Partner Pharmacy',
        address: pharmacy.address || '',
        phone: String(pharmacy.phone || '').replace(/\D/g, '').slice(-10),
      };
      // Once assigned by Admin, set status to CONFIRMED for store to review and pack
      updates.status = 'CONFIRMED';
    }

    if (rider !== undefined) {
      if (rider && rider.name) {
        updates.rider = {
          name: rider.name,
          phone: String(rider.phone || '').replace(/\D/g, '').slice(-10),
          vehicleNumber: rider.vehicleNumber || '',
        };
      } else {
        updates.rider = null;
      }
    }

    if (status) {
      updates.status = status.toUpperCase();
    }

    if (eta) {
      updates.eta = eta;
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
      message: 'Order allocated successfully',
      order: updated,
    });
  } catch (err) {
    console.error('Error allocating order:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/orders/:id/status
 */
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const conditions = [{ orderId: id }];
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      conditions.push({ _id: id });
    }

    const updates = { status: status.toUpperCase() };
    if (cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }

    const updated = await Order.findOneAndUpdate(
      { $or: conditions },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, message: 'Status updated', order: updated });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Pharmacy partner CRUD
 */
router.get('/pharmacies', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().sort({ createdAt: -1 });
    return res.json({ success: true, pharmacies });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/pharmacies', async (req, res) => {
  try {
    const { name, phone, address, area, notes, password } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!name || !address || !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Name, address, and 10-digit phone are required' });
    }

    const hashedPassword = await bcrypt.hash(String(password || '123456'), 10);

    let pharmacy = await Pharmacy.findOne({ phone: cleanPhone });
    if (pharmacy) {
      pharmacy.name = name;
      pharmacy.address = address;
      pharmacy.area = area || pharmacy.area;
      pharmacy.notes = notes || pharmacy.notes;
      pharmacy.password = hashedPassword;
      await pharmacy.save();
    } else {
      pharmacy = await Pharmacy.create({
        name,
        phone: cleanPhone,
        address,
        area,
        notes,
        password: hashedPassword,
      });
    }

    // Also persist directly into User table
    await User.findOneAndUpdate(
      { phone: cleanPhone, role: 'pharmacy' },
      {
        name,
        phone: cleanPhone,
        role: 'pharmacy',
        password: hashedPassword,
        storeName: name,
        area: area || '',
        notes: notes || '',
        isOpen: true,
        acceptingOrders: true,
        pharmacyRef: pharmacy._id,
        address: {
          fullName: name,
          fullAddress: address,
          villagePo: area || '',
        },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true, pharmacy });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/pharmacies/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }
    const hashedPassword = await bcrypt.hash(String(password), 10);
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (pharmacy) {
      await User.findOneAndUpdate(
        { phone: pharmacy.phone, role: 'pharmacy' },
        { $set: { password: hashedPassword } }
      );
    }
    return res.json({ success: true, message: 'Pharmacy password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/pharmacies/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (pharmacy) {
      await User.findOneAndDelete({ phone: pharmacy.phone, role: 'pharmacy' });
    }
    return res.json({ success: true, message: 'Pharmacy removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Rider CRUD
 */
router.get('/riders', async (req, res) => {
  try {
    const riders = await Rider.find().select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, riders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/riders', async (req, res) => {
  try {
    const { name, phone, vehicleNumber, notes, password } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!name || !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Name and 10-digit phone are required' });
    }

    const hashedPassword = await bcrypt.hash(String(password || '123456'), 10);

    let rider = await Rider.findOne({ phone: cleanPhone });
    if (rider) {
      rider.name = name;
      rider.vehicleNumber = vehicleNumber || rider.vehicleNumber;
      rider.notes = notes || rider.notes;
      rider.password = hashedPassword;
      await rider.save();
    } else {
      rider = await Rider.create({
        name,
        phone: cleanPhone,
        vehicleNumber,
        notes,
        password: hashedPassword,
      });
    }

    // Also persist directly into User table
    await User.findOneAndUpdate(
      { phone: cleanPhone, role: 'rider' },
      {
        name,
        phone: cleanPhone,
        role: 'rider',
        password: hashedPassword,
        vehicleNumber: vehicleNumber || '',
        notes: notes || '',
        isActive: true,
        isAvailable: true,
        riderRef: rider._id,
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true, rider });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/riders/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }
    const hashedPassword = await bcrypt.hash(String(password), 10);
    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (rider) {
      await User.findOneAndUpdate(
        { phone: rider.phone, role: 'rider' },
        { $set: { password: hashedPassword } }
      );
    }
    return res.json({ success: true, message: 'Rider password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/riders/:id', async (req, res) => {
  try {
    const rider = await Rider.findByIdAndDelete(req.params.id);
    if (rider) {
      await User.findOneAndDelete({ phone: rider.phone, role: 'rider' });
    }
    return res.json({ success: true, message: 'Rider removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Production Admin Endpoints per spec
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), updateAdminOrderStatus);
router.patch('/orders/:id/pricing', validate(updateOrderPricingSchema), updateAdminOrderPricing);

export default router;
