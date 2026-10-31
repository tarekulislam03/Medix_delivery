import express from 'express';
import { getCart, updateCartItem, clearCart } from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cartItemSchema } from '../validation/cartSchemas.js';

const router = express.Router();

router.use(optionalAuth);

// Production endpoints per spec
router.get('/', getCart);
router.put('/items', validate(cartItemSchema), updateCartItem);
router.delete('/', clearCart);

// Legacy backward-compatibility endpoints
router.get('/items', getCart);
router.post('/sync', async (req, res, next) => {
  // If client posts full items array during legacy sync
  req.method = 'GET';
  return getCart(req, res, next);
});

export default router;
