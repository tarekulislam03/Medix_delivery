import express from 'express';
import {
  createOrder,
  getOrders,
  getActiveOrders,
  getOrderHistory,
  getOrderById,
  cancelCustomerOrder,
  confirmOrderPricing,
} from '../controllers/orderController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cancelOrderSchema } from '../validation/orderSchemas.js';

const router = express.Router();

router.use(optionalAuth);

// Production endpoints per spec
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/active', getActiveOrders);
router.get('/history', getOrderHistory);
router.get('/:id', getOrderById);
router.post('/:id/cancel', validate(cancelOrderSchema), cancelCustomerOrder);
router.post('/:id/confirm-pricing', confirmOrderPricing);

export default router;
