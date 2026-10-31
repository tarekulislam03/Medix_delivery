import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { normalizePhone } from '../utils/phone.js';
import { calculateCartTotals } from './cartController.js';
import { socketEvents } from '../sockets/index.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Status transition matrix
const VALID_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'CANCELLED', 'REJECTED', 'AWAITING_CUSTOMER_CONFIRMATION'],
  AWAITING_CUSTOMER_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

export function isValidTransition(fromStatus, toStatus) {
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * Generate human-friendly orderNumber: MDX-<6 digits>
 */
function generateOrderNumber() {
  const num = crypto.randomInt(100000, 999999);
  return `MDX-${num}`;
}

/**
 * POST /orders
 * Convert active cart into an immutable order snapshot
 */
export async function createOrder(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];

    // If Idempotency-Key provided, prevent double placement
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey }).lean();
      if (existingOrder) {
        return sendSuccess(res, existingOrder, 'Order retrieved by idempotency key', 200);
      }
    }

    let userId = req.user?.id;
    let customerPhone = req.user?.phone;
    let customerName = req.body.customerName || req.user?.name || 'Customer';

    // Fallback if guest client provided phone/address in payload
    if (!customerPhone && req.body.address?.phone) {
      const norm = normalizePhone(req.body.address.phone);
      if (norm) customerPhone = norm.e164;
    }
    if (!customerPhone && req.body.customerPhone) {
      const norm = normalizePhone(req.body.customerPhone);
      if (norm) customerPhone = norm.e164;
    }

    if (!customerPhone) {
      return sendError(res, 'PHONE_REQUIRED', 'Customer phone number is required to place order', 400);
    }

    // Resolve user's cart or passed items
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ userId });
    }
    if (!cart && customerPhone) {
      cart = await Cart.findOne({ phone: customerPhone });
    }

    let itemsToOrder = [];
    if (cart && cart.items && cart.items.length > 0) {
      itemsToOrder = cart.items;
    } else if (Array.isArray(req.body.items) && req.body.items.length > 0) {
      itemsToOrder = req.body.items.map((it) => ({
        type: it.type || (it.imageUrl ? 'prescription' : 'catalog'),
        productId: it.productId || it.id || null,
        name: it.name || 'Medicine Item',
        strength: it.strength || it.packSize || '',
        category: it.category || '',
        qty: Number(it.qty || it.quantity || 1),
        imageUrl: it.imageUrl || null,
        note: it.note || '',
        requiresRx: Boolean(it.requiresRx),
      }));
    }

    if (itemsToOrder.length === 0) {
      return sendError(res, 'EMPTY_CART', 'Cannot create order with zero items in cart', 400);
    }

    // Recompute bill server-side
    const bill = await calculateCartTotals(itemsToOrder);

    // Resolve delivery address
    let deliveryAddress = null;
    if (req.body.addressId && userId) {
      const userDoc = await User.findById(userId).select('savedAddresses');
      if (userDoc) {
        const saved = userDoc.savedAddresses.id(req.body.addressId);
        if (saved) {
          deliveryAddress = {
            fullName: saved.fullName,
            phone: saved.phone,
            villagePo: saved.villagePo,
            landmark: saved.landmark,
            pinCode: saved.pinCode,
          };
          customerName = saved.fullName;
        }
      }
    }

    if (!deliveryAddress && req.body.address) {
      deliveryAddress = {
        fullName: req.body.address.fullName || customerName,
        phone: req.body.address.phone || customerPhone,
        villagePo: req.body.address.villagePo || '',
        landmark: req.body.address.landmark || '',
        pinCode: req.body.address.pinCode || '',
      };
      if (req.body.address.fullName) customerName = req.body.address.fullName;
    }

    if (!deliveryAddress || !deliveryAddress.villagePo) {
      return sendError(res, 'MISSING_ADDRESS', 'Delivery address (village/PO) is required', 400);
    }

    // Determine order type: catalog, prescription, strip, or mixed
    const hasCatalog = itemsToOrder.some((it) => it.type === 'catalog');
    const hasRx = itemsToOrder.some((it) => it.type === 'prescription');
    const hasStrip = itemsToOrder.some((it) => it.type === 'strip');

    let orderType = 'catalog';
    if ((hasRx || hasStrip) && hasCatalog) orderType = 'mixed';
    else if (hasRx) orderType = 'prescription';
    else if (hasStrip) orderType = 'strip';

    // If order has unpriced prescription/strip items, it requires review
    const hasUnpriced = itemsToOrder.some((it) => it.type !== 'catalog');
    const initialStatus = 'PLACED';

    const orderNumber = generateOrderNumber();
    const deliveryOtp = String(crypto.randomInt(1000, 9999)); // 4-digit handover PIN

    const newOrder = await Order.create({
      orderId: orderNumber,
      orderNumber,
      idempotencyKey: idempotencyKey || undefined,
      userId: userId || null,
      customerId: userId || null,
      customerPhone,
      customerName,
      orderType,
      items: bill.processedItems.map((it) => ({
        type: it.type,
        productId: it.productId,
        name: it.name,
        strength: it.strength,
        category: it.category,
        quantity: it.qty,
        price: it.priceSnapshot,
        isPriced: it.type === 'catalog',
        requiresRx: it.requiresRx,
        imageUrl: it.imageUrl,
        note: it.note,
      })),
      address: deliveryAddress,
      bill: {
        subtotal: bill.subtotal,
        discount: bill.discount,
        delivery: bill.deliveryFee,
        platform: bill.platformFee,
        total: bill.total,
      },
      paymentMethod: req.body.paymentMethod || 'cod',
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date(),
          actor: 'customer',
          note: 'Order placed by customer',
        },
      ],
      eta: '20 mins',
      deliveryOtp,
      prescriptionUploaded: hasRx || hasStrip,
      placedAt: new Date(),
    });

    // Clear user's active cart in MongoDB atomically
    if (cart) {
      await Cart.updateOne(
        { _id: cart._id },
        {
          $set: {
            items: [],
            subtotal: 0,
            discount: 0,
            deliveryFee: 0,
            platformFee: 0,
            total: 0,
          },
        }
      );
    }
    if (userId) {
      await User.updateOne({ _id: userId }, { $set: { cart: [] } }).catch(() => {});
    }

    // Emit live Socket.io events
    socketEvents.orderCreated(userId || customerPhone, newOrder);
    socketEvents.newOrderToAdmins(newOrder);

    const orderObj = newOrder.toObject ? newOrder.toObject() : newOrder;
    orderObj.id = newOrder.orderNumber || newOrder.orderId || newOrder._id?.toString();
    orderObj.displayId = newOrder.orderNumber || newOrder.orderId;
    orderObj.totalAmount = newOrder.bill?.total || 0;
    orderObj.deliveryFee = newOrder.bill?.delivery || 0;
    orderObj.subtotal = newOrder.bill?.subtotal || 0;

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: orderObj,
      order: orderObj,
    });
  } catch (err) {
    console.error('[createOrder Error]', err);
    return sendError(res, 'ORDER_CREATION_FAILED', err.message, 500);
  }
}

/**
 * GET /orders
 * Returns all orders for current user or phone
 */
export async function getOrders(req, res) {
  try {
    const query = {};

    if (req.user?.id) {
      query.$or = [{ userId: req.user.id }, { customerId: req.user.id }, { customerPhone: req.user.phone }];
    } else if (req.query.phone) {
      const norm = normalizePhone(req.query.phone);
      if (norm) {
        query.customerPhone = { $in: [norm.e164, norm.national] };
      }
    } else {
      return res.status(200).json({ success: true, orders: [], data: [] });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    const formattedOrders = orders.map((o) => ({
      ...o,
      id: o.orderNumber || o.orderId || o._id?.toString(),
      displayId: o.orderNumber || o.orderId,
      totalAmount: o.totalAmount || o.bill?.total || 0,
      deliveryFee: o.deliveryFee ?? o.bill?.delivery ?? 0,
      subtotal: o.subtotal || o.bill?.subtotal || 0,
    }));

    return res.status(200).json({
      success: true,
      orders: formattedOrders,
      data: formattedOrders,
    });
  } catch (err) {
    return sendError(res, 'SERVER_ERROR', err.message, 500);
  }
}

/**
 * GET /orders/active
 * Returns active orders (not DELIVERED, CANCELLED, or REJECTED)
 */
export async function getActiveOrders(req, res) {
  try {
    const query = {
      status: { $nin: ['DELIVERED', 'CANCELLED', 'REJECTED'] },
    };

    if (req.user?.id) {
      query.$or = [{ userId: req.user.id }, { customerId: req.user.id }, { customerPhone: req.user.phone }];
    } else if (req.query.phone) {
      const norm = normalizePhone(req.query.phone);
      if (norm) {
        query.customerPhone = { $in: [norm.e164, norm.national] };
      }
    } else {
      return sendError(res, 'AUTH_REQUIRED', 'Please sign in or provide phone to view active orders', 401);
    }

    const activeOrders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return sendSuccess(res, activeOrders);
  } catch (err) {
    return sendError(res, 'SERVER_ERROR', err.message, 500);
  }
}

/**
 * GET /orders/history
 * Paginated cursor-based order history (newest first)
 */
export async function getOrderHistory(req, res) {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const query = {};

    if (req.user?.id) {
      query.$or = [{ userId: req.user.id }, { customerId: req.user.id }, { customerPhone: req.user.phone }];
    } else if (req.query.phone) {
      const norm = normalizePhone(req.query.phone);
      if (norm) {
        query.customerPhone = { $in: [norm.e164, norm.national] };
      }
    } else {
      return sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Cursor pagination using createdAt
    if (req.query.cursor) {
      const cursorDate = new Date(req.query.cursor);
      if (!isNaN(cursorDate.getTime())) {
        query.createdAt = { $lt: cursorDate };
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(limit + 1).lean();

    let hasMore = false;
    let nextCursor = null;

    if (orders.length > limit) {
      hasMore = true;
      orders.pop();
      nextCursor = orders[orders.length - 1].createdAt;
    }

    return sendSuccess(res, {
      orders,
      hasMore,
      nextCursor,
    });
  } catch (err) {
    return sendError(res, 'SERVER_ERROR', err.message, 500);
  }
}

/**
 * GET /orders/:id
 */
export async function getOrderById(req, res) {
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
 * POST /orders/:id/cancel
 * Customer cancel allowed only before PACKED
 */
export async function cancelCustomerOrder(req, res) {
  try {
    const { id } = req.params;
    const reason = req.body.reason || 'Cancelled by customer before packing';

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }, { orderNumber: id }],
    });

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    // Only allow cancellation before PACKED
    if (['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      return sendError(
        res,
        'CANNOT_CANCEL',
        `Order is already ${order.status.toLowerCase()} and cannot be cancelled`,
        400
      );
    }

    if (['CANCELLED', 'REJECTED'].includes(order.status)) {
      return sendError(res, 'ALREADY_CANCELLED', 'Order is already cancelled or rejected', 400);
    }

    order.status = 'CANCELLED';
    order.cancellationReason = reason;
    const historyEntry = {
      status: 'CANCELLED',
      timestamp: new Date(),
      actor: 'customer',
      note: reason,
    };
    order.statusHistory.push(historyEntry);

    await order.save();

    // Socket notification to admins & tracking rooms
    socketEvents.orderCancelledByCustomer(order.orderNumber || order.orderId, reason);

    return sendSuccess(res, order, 'Order cancelled successfully');
  } catch (err) {
    return sendError(res, 'CANCEL_FAILED', err.message, 500);
  }
}

/**
 * POST /orders/:id/confirm-pricing
 * Customer accepts updated pricing for prescription order
 */
export async function confirmOrderPricing(req, res) {
  try {
    const { id } = req.params;
    const { accept = true } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }, { orderNumber: id }],
    });

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (order.status !== 'AWAITING_CUSTOMER_CONFIRMATION') {
      return sendError(res, 'INVALID_STATE', 'Order is not awaiting price confirmation', 400);
    }

    if (!accept) {
      order.status = 'CANCELLED';
      order.cancellationReason = 'Customer rejected revised pricing';
      order.statusHistory.push({
        status: 'CANCELLED',
        timestamp: new Date(),
        actor: 'customer',
        note: 'Customer rejected revised pricing',
      });
      await order.save();
      socketEvents.orderCancelledByCustomer(order.orderNumber, 'Rejected revised pricing');
      return sendSuccess(res, order, 'Order cancelled due to price rejection');
    }

    order.status = 'CONFIRMED';
    const historyEntry = {
      status: 'CONFIRMED',
      timestamp: new Date(),
      actor: 'customer',
      note: 'Customer accepted revised pricing',
    };
    order.statusHistory.push(historyEntry);
    await order.save();

    socketEvents.orderStatusChanged(order.userId, order.orderNumber, 'CONFIRMED', historyEntry);

    return sendSuccess(res, order, 'Pricing accepted and order confirmed');
  } catch (err) {
    return sendError(res, 'CONFIRM_PRICING_FAILED', err.message, 500);
  }
}
