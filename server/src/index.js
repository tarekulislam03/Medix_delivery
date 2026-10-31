import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { initializeSocket } from './sockets/index.js';
import medicineRoutes from './routes/medicineRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import riderRoutes from './routes/riderRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';

dotenv.config();

// Validate Environment Variables at Startup
function validateEnvironment() {
  const warnings = [];
  const errors = [];

  if (!process.env.MONGO_URI) {
    warnings.push('MONGO_URI is not set. Defaulting to mongodb://127.0.0.1:27017/medix_delivery');
  }

  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('CRITICAL: JWT_SECRET must be defined in production environment!');
    } else {
      warnings.push('JWT_SECRET is not set. Using local development default secret.');
    }
  }

  if (warnings.length > 0) {
    warnings.forEach((msg) => console.warn(`[Config Warning] ${msg}`));
  }

  if (errors.length > 0) {
    errors.forEach((msg) => console.error(`[Config Error] ${msg}`));
    process.exit(1);
  }
}

validateEnvironment();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medix_delivery';

// Initialize live Socket.io service
initializeSocket(server);

// Security & Performance Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file hosting for optimized uploaded images
app.use('/uploads', express.static(uploadsDir));

// Rate limiting on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 OTP requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

// Mount Routes (supporting both /api/* and root /* per specification)
app.use(['/api/auth', '/auth'], authLimiter, authRoutes);
app.use(['/api/me', '/me'], accountRoutes);
app.use(['/api/cart', '/cart'], cartRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/uploads', '/uploads'], uploadRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/medicines', '/medicines'], medicineRoutes);
app.use(['/api/location', '/location'], locationRoutes);
app.use(['/api/rider', '/rider'], riderRoutes);
app.use(['/api/pharmacy', '/pharmacy'], pharmacyRoutes);

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'medix-backend',
      mongoState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Central 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist`,
    },
  });
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

// Connect to MongoDB with connection pooling
mongoose
  .connect(MONGO_URI, {
    maxPoolSize: 25,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 8000,
  })
  .then(() => {
    console.log('Connected to MongoDB successfully (pool: 25)');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Start Server with Socket.io attached
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.io attached`);
});

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (dbErr) {
      console.error('Error closing MongoDB:', dbErr);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forcefully terminating server after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
