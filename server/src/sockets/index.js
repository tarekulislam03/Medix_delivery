import { Server } from 'socket.io';
import { verifyTokenForSocket } from '../middleware/auth.js';

let ioInstance = null;

export async function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
    pingTimeout: 30000,
    pingInterval: 15000,
  });

  // Optional Redis Adapter hook for horizontal multi-instance scaling
  if (process.env.REDIS_URL) {
    try {
      const { createClient } = await import('redis');
      const { createAdapter } = await import('@socket.io/redis-adapter');
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.io] Connected to Redis adapter for horizontal scaling');
    } catch (redisErr) {
      console.warn('[Socket.io] Redis adapter hook skipped (module not installed or connection error):', redisErr.message);
    }
  }

  // Handshake authentication middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      // Allow unauthenticated connection but without room access
      socket.user = null;
      return next();
    }

    const decoded = verifyTokenForSocket(token);
    if (!decoded) {
      return next(new Error('Authentication failed: invalid token'));
    }

    socket.user = decoded;
    return next();
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    if (user) {
      // Join customer private room
      socket.join(`user:${user.id}`);

      // If user is admin, join admins room
      if (user.role === 'admin') {
        socket.join('admins');
      }
    }

    // Allow tracking a specific order room
    socket.on('join:order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on('leave:order', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      // cleanup handled automatically by Socket.io
    });
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  return ioInstance;
}

/**
 * Socket Notification Dispatchers (Called after DB operations succeed)
 */
export const socketEvents = {
  // Notify customer of order creation
  orderCreated(userId, order) {
    if (!ioInstance) return;
    ioInstance.to(`user:${userId}`).emit('order:created', order);
    ioInstance.to(`order:${order.orderNumber || order.orderId || order._id}`).emit('order:created', order);
  },

  // Notify customer of status change
  orderStatusChanged(userId, orderId, newStatus, historyEntry) {
    if (!ioInstance) return;
    const payload = { orderId, status: newStatus, historyEntry, updatedAt: new Date() };
    ioInstance.to(`user:${userId}`).emit('order:status_changed', payload);
    ioInstance.to(`order:${orderId}`).emit('order:status_changed', payload);
    ioInstance.to('admins').emit('order:updated', payload);
  },

  // Notify customer of price update for prescription order
  orderPriceUpdated(userId, orderId, updatedBill, items) {
    if (!ioInstance) return;
    const payload = { orderId, bill: updatedBill, items, status: 'AWAITING_CUSTOMER_CONFIRMATION', updatedAt: new Date() };
    ioInstance.to(`user:${userId}`).emit('order:price_updated', payload);
    ioInstance.to(`order:${orderId}`).emit('order:price_updated', payload);
  },

  // Notify customer of ETA change
  orderEtaUpdated(userId, orderId, eta) {
    if (!ioInstance) return;
    const payload = { orderId, eta, updatedAt: new Date() };
    ioInstance.to(`user:${userId}`).emit('order:eta_updated', payload);
    ioInstance.to(`order:${orderId}`).emit('order:eta_updated', payload);
  },

  // Notify admin room of new incoming order
  newOrderToAdmins(order) {
    if (!ioInstance) return;
    const leanPayload = {
      id: order._id,
      orderNumber: order.orderNumber || order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      itemCount: order.items?.length || 0,
      orderType: order.orderType,
      total: order.bill?.total || 0,
      status: order.status,
      createdAt: order.createdAt,
    };
    ioInstance.to('admins').emit('order:new', { summary: leanPayload, fullOrder: order });
  },

  // Notify admin room of order cancellation
  orderCancelledByCustomer(orderId, reason) {
    if (!ioInstance) return;
    ioInstance.to('admins').emit('order:cancelled_by_customer', { orderId, reason, timestamp: new Date() });
    ioInstance.to(`order:${orderId}`).emit('order:status_changed', { orderId, status: 'CANCELLED', reason });
  },
};
