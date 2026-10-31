import { verifyAccessToken } from '../utils/token.js';
import { sendError } from '../utils/response.js';

/**
 * Middleware requiring a valid JWT Bearer token
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, 'TOKEN_EXPIRED', 'Session expired. Please refresh token or log in again.', 401);
  }
}

/**
 * Middleware optionally attaching decoded JWT if present
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Role-based middleware for admin-only endpoints
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 'FORBIDDEN', 'Access denied. Administrator privileges required.', 403);
  }
  next();
}

/**
 * Verify JWT token for Socket.io handshake authentication
 */
export function verifyTokenForSocket(token) {
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
