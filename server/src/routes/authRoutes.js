import express from 'express';
import { checkUser, sendOtp, verifyOtp, refreshToken, logout } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { checkUserSchema, sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from '../validation/authSchemas.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public OTP Auth Routes
router.post('/check-user', validate(checkUserSchema), checkUser);
router.post('/send-otp', validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Authenticated Logout Route
router.post('/logout', requireAuth, logout);

export default router;
