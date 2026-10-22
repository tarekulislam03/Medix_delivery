import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/orders
 * Body: { customerName, customerPhone, address, items, paymentMethod, pharmacy, bill, prescriptionUploaded }
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      address,
      items,
      paymentMethod,
      pharmacy,
      bill,
      prescriptionUploaded,
    } = req.body;

    const cleanPhone = String(customerPhone || '').replace(/\D/g, '').slice(-10);

    // Find or link user
    let user = null;
    if (cleanPhone) {
      user = await User.findOne({ phone: cleanPhone });
    }

    const orderNumber = `MDX-${Date.now().toString().slice(-6)}`;

    const newOrder = new Order({
      customerId: user?._id || null,
      status: 'placed',
      items: (items || []).map((i) => ({
        name: i.name,
        quantity: i.quantity || 1,
        prescriptionRequired: Boolean(i.requiresRx),
        price: Number(i.price) || 0,
      })),
      address: {
        street: address?.fullAddress || address?.villagePo || String(address || ''),
        city: address?.villagePo || 'Siliguri',
      },
      fees: {
        deliveryFee: bill?.deliveryFee || 0,
        serviceFee: bill?.serviceFee || 0,
        totalAmount: bill?.total || 0,
      },
    });

    const savedOrder = await newOrder.save();

    console.log(`[Order] Successfully created order ${orderNumber} for ${cleanPhone}`);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: orderNumber,
        dbId: savedOrder._id,
        items,
        address,
        bill,
        paymentMethod: paymentMethod || 'COD',
        pharmacy: pharmacy || { name: 'Nearest Verified Chemist' },
        createdAt: savedOrder.createdAt,
      },
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.',
    });
  }
});

/**
 * GET /api/orders
 * Query: ?phone=9876543210
 */
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    let filter = {};

    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      const user = await User.findOne({ phone: cleanPhone });
      if (user) {
        filter.customerId = user._id;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
