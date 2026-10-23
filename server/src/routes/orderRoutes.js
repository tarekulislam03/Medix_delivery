import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/orders
 * Body: { customerName, customerPhone, address, items, paymentMethod, pharmacy, bill, prescriptionUploaded }
 */
router.post('/', optionalAuth, async (req, res) => {
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

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'A valid 10-digit customer phone number is required.',
      });
    }

    // Find or create user
    const user = await User.findOne({ phone: cleanPhone });

    const orderId = `MDX-${Date.now().toString().slice(-6)}`;

    const formattedAddress = {
      fullName: address?.fullName || customerName || user?.name || 'Customer',
      villagePo: address?.villagePo || (typeof address === 'string' ? address : ''),
      pinCode: address?.pinCode || '',
      landmark: address?.landmark || '',
      fullAddress: address?.fullAddress || address?.villagePo || (typeof address === 'string' ? address : ''),
    };

    const newOrder = new Order({
      orderId,
      customerId: req.user?.id || user?._id || null,
      customerPhone: cleanPhone,
      customerName: formattedAddress.fullName,
      status: 'SEARCHING',
      eta: 'within 24 hrs',
      items: (items || []).map((i) => ({
        id: i.id || String(Date.now()),
        name: i.name,
        quantity: Number(i.quantity) || 1,
        requiresRx: Boolean(i.requiresRx),
        price: Number(i.price) || 0,
        strength: i.strength || '',
        category: i.category || '',
      })),
      address: formattedAddress,
      pharmacy: {
        name: pharmacy?.name || 'Nearest Verified Partner Chemist',
        address: pharmacy?.address || 'Siliguri',
        phone: pharmacy?.phone || '',
      },
      paymentMethod: paymentMethod === 'cod' || paymentMethod === 'Cash on delivery' ? 'Cash on Delivery' : (paymentMethod || 'Cash on Delivery'),
      bill: {
        subtotal: Number(bill?.subtotal) || 0,
        discount: Number(bill?.discount) || 0,
        delivery: Number(bill?.delivery) || 0,
        platform: Number(bill?.platform) || 0,
        total: Number(bill?.total) || 0,
      },
      prescriptionUploaded: Boolean(prescriptionUploaded),
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      placedAt: new Date(),
    });

    const savedOrder = await newOrder.save();

    // Automatically clear user's saved cart in MongoDB upon order placement
    if (cleanPhone) {
      await User.updateOne({ phone: cleanPhone }, { $set: { cart: [] } }).catch(() => {});
    }

    console.log(`[Order] Successfully saved order #${orderId} in database for ${cleanPhone}`);

    return res.status(201).json({
      success: true,
      message: 'Order created and synced to database successfully',
      order: {
        id: savedOrder.orderId,
        _id: savedOrder._id,
        placedAt: savedOrder.placedAt,
        status: savedOrder.status,
        eta: savedOrder.eta,
        items: savedOrder.items,
        address: `${savedOrder.address.villagePo}${savedOrder.address.pinCode ? ', PIN: ' + savedOrder.address.pinCode : ''}`,
        rawAddress: savedOrder.address,
        paymentMethod: savedOrder.paymentMethod,
        bill: savedOrder.bill,
        pharmacy: savedOrder.pharmacy,
        rider: savedOrder.rider,
        prescriptionUploaded: savedOrder.prescriptionUploaded,
      },
    });
  } catch (err) {
    console.error('Error creating order in DB:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save order to database.',
      error: err.message,
    });
  }
});

/**
 * GET /api/orders
 * Secured by JWT user, with fallback to ?phone= for unauthenticated lookups
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    let filter = {};

    if (req.user?.id || req.user?.phone) {
      // Secure lookup using authenticated JWT identity
      const conditions = [];
      if (req.user.id) conditions.push({ customerId: req.user.id });
      if (req.user.phone) conditions.push({ customerPhone: req.user.phone });
      filter = { $or: conditions };
    } else {
      // Fallback for phone query if not yet authenticated
      const { phone } = req.query;
      const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

      if (cleanPhone && cleanPhone.length === 10) {
        const user = await User.findOne({ phone: cleanPhone });
        const conditions = [{ customerPhone: cleanPhone }];
        if (user) {
          conditions.push({ customerId: user._id });
        }
        filter = { $or: conditions };
      } else {
        // Do not leak other customers' orders if unauthenticated
        return res.status(200).json({
          success: true,
          orders: [],
        });
      }
    }

    const orders = await Order.find(filter).sort({ placedAt: -1, createdAt: -1 }).limit(50).lean();

    // Format orders for the frontend
    const formatted = orders.map((o) => {
      let st = (o.status || 'SEARCHING').toUpperCase();
      if (st === 'PENDING') st = 'SEARCHING';

      const placedDate = o.placedAt || o.createdAt || new Date();
      const addr = o.address || {};
      const displayAddress = addr.fullAddress || addr.villagePo || addr.street || addr.city || (typeof addr === 'string' ? addr : '') || 'Your Address';
      const pinPart = addr.pinCode ? `, ${addr.pinCode}` : '';

      const totalBill = o.bill?.total || o.fees?.totalAmount || 0;
      const subtotalBill = o.bill?.subtotal || o.fees?.totalAmount || 0;

      return {
        id: o.orderId || `MDX-${o._id.toString().slice(-6).toUpperCase()}`,
        _id: o._id,
        placedAt: placedDate,
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
        pharmacy: o.pharmacy?.name ? o.pharmacy : null,
        rider: o.rider?.name ? o.rider : null,
        prescriptionUploaded: Boolean(o.prescriptionUploaded),
        deliveryOtp: o.deliveryOtp || '',
        cancellationReason: o.cancellationReason || null,
      };
    });

    return res.status(200).json({
      success: true,
      orders: formatted,
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.',
      error: err.message,
    });
  }
});

/**
 * PUT /api/orders/:id/cancel
 * Body: { reason }
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const conditions = [{ orderId: id }];
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      conditions.push({ _id: id });
    }

    const order = await Order.findOneAndUpdate(
      { $or: conditions },
      {
        $set: {
          status: 'CANCELLED',
          cancellationReason: reason || 'Customer requested cancellation',
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order.',
    });
  }
});

export default router;
