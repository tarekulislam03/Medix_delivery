import express from 'express';
import User from '../models/User.js';

const router = express.Router();

/**
 * GET /api/cart?phone=9876543210
 * Fetch saved active cart items from MongoDB
 */
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(200).json({ success: true, items: [] });
    }

    const user = await User.findOne({ phone: cleanPhone }, { cart: 1 });
    return res.status(200).json({
      success: true,
      items: user?.cart || [],
    });
  } catch (err) {
    console.error('Error fetching cart from DB:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/cart
 * Body: { phone, items }
 * Save/update active cart items in MongoDB
 */
router.post('/', async (req, res) => {
  try {
    const { phone, items } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required to save cart',
      });
    }

    const sanitizedItems = (items || []).map((i) => ({
      id: String(i.id),
      name: String(i.name),
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      requiresRx: Boolean(i.requiresRx),
      strength: String(i.strength || ''),
      category: String(i.category || ''),
    }));

    await User.findOneAndUpdate(
      { phone: cleanPhone },
      { $set: { cart: sanitizedItems } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Cart synced to database successfully',
      count: sanitizedItems.length,
    });
  } catch (err) {
    console.error('Error syncing cart to DB:', err);
    return res.status(500).json({ success: false, message: 'Failed to sync cart' });
  }
});

/**
 * DELETE /api/cart?phone=9876543210
 * Clear saved active cart in MongoDB
 */
router.delete('/', async (req, res) => {
  try {
    const { phone } = req.query;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone && cleanPhone.length === 10) {
      await User.updateOne({ phone: cleanPhone }, { $set: { cart: [] } });
    }

    return res.status(200).json({ success: true, message: 'Cart cleared from database' });
  } catch (err) {
    console.error('Error clearing cart in DB:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
