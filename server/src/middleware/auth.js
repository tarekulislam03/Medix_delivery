import jwt from 'jsonwebtoken';

/**
 * Middleware requiring a valid JWT token in Authorization: Bearer <token>
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'medix_jwt_secret_development_key_38472910482018374';
    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.',
    });
  }
}

/**
 * Middleware that optionally attaches decoded JWT user if present
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'medix_jwt_secret_development_key_38472910482018374';
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
    }
  } catch (err) {
    // Non-blocking if token is invalid or expired
    req.user = null;
  }
  next();
}
