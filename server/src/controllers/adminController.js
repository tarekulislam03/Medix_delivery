import Order from '../models/Order.js';
import { isValidTransition } from './orderController.js';
import { socketEvents } from '../sockets/index.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /admin/orders
 * Filter by status, date range, search by customer phone or orderNumber
 */
export async function getAdminOrders(req, res) {
  try {
    const { status, search, fromDate, toDate, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const cleanSearch = search.trim();
      filter.$or = [
        { orderNumber: new RegExp(cleanSearch, 'i') },
        { orderId: new RegExp(cleanSearch, 'i') },
        { customerPhone: new RegExp(cleanSearch, 'i') },
        { customerName: new RegExp(cleanSearch, 'i') },
      ];
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    return sendError(res, 'ADMIN_ORDERS_FETCH_FAILED', err.message, 500);
  }
}

/**
 * GET /admin/orders/:id
 */
export async function getAdminOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }, { orderNumber: id }],
    }).lean();

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    return sendSuccess(res, order);
  } catch (err) {
    return sendError(res, 'SERVER_ERROR', err.message, 500);
  }
}

/**
 * PATCH /admin/orders/:id/status
 * Validates transition, appends statusHistory, emits socket events
 */
export async function updateAdminOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status: newStatus, note = '' } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }, { orderNumber: id }],
    });

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    // Validate transition
    if (order.status !== newStatus && !isValidTransition(order.status, newStatus)) {
      return sendError(
        res,
        'INVALID_STATUS_TRANSITION',
        `Cannot transition order from status ${order.status} to ${newStatus}`,
        400
      );
    }

    order.status = newStatus;
    const historyEntry = {
      status: newStatus,
      timestamp: new Date(),
      actor: 'admin',
      note: note || `Status updated to ${newStatus} by admin`,
    };
    order.statusHistory.push(historyEntry);

    await order.save();

    // Live socket emission to customer and admins
    socketEvents.orderStatusChanged(order.userId, order.orderNumber, newStatus, historyEntry);

    return sendSuccess(res, order, `Order status updated to ${newStatus}`);
  } catch (err) {
    return sendError(res, 'STATUS_UPDATE_FAILED', err.message, 500);
  }
}

/**
 * PATCH /admin/orders/:id/pricing
 * Admin sets final prices for prescription / strip items
 */
export async function updateAdminOrderPricing(req, res) {
  try {
    const { id } = req.params;
    const { items: priceUpdates = [], note = '' } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }, { orderNumber: id }],
    });

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    let subtotal = 0;

    // Apply item pricing
    order.items.forEach((item) => {
      const match = priceUpdates.find(
        (u) => u.itemId && (u.itemId === item._id.toString() || u.itemId === item.productId?.toString())
      );
      if (match) {
        item.price = Number(match.price);
        item.isPriced = true;
      }
      subtotal += Number(item.price || 0) * Number(item.quantity || 1);
    });

    // Recompute bill
    let discount = 0;
    if (subtotal >= 1500) {
      discount = Math.round(subtotal * 0.17);
    }
    const delivery = subtotal >= 1000 ? 0 : 25;
    const platform = 5;
    const total = Math.max(0, subtotal - discount + delivery + platform);

    order.bill = { subtotal, discount, delivery, platform, total };

    // Move order to AWAITING_CUSTOMER_CONFIRMATION
    const previousStatus = order.status;
    order.status = 'AWAITING_CUSTOMER_CONFIRMATION';

    const historyEntry = {
      status: 'AWAITING_CUSTOMER_CONFIRMATION',
      timestamp: new Date(),
      actor: 'admin',
      note: note || `Pharmacist completed pricing review. Total: Rs.${total}`,
    };
    order.statusHistory.push(historyEntry);

    await order.save();

    // Emit live socket event
    socketEvents.orderPriceUpdated(order.userId, order.orderNumber, order.bill, order.items);

    return sendSuccess(res, order, 'Order pricing updated and customer confirmation requested');
  } catch (err) {
    return sendError(res, 'PRICING_UPDATE_FAILED', err.message, 500);
  }
}
