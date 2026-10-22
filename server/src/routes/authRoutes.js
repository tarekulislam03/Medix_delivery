import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// In-memory OTP storage for fast verification
const otpCache = new Map();

/**
 * POST /api/auth/send-otp
 * Body: { phone }
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    // Generate 4-digit OTP (for dev / testing default to 1234, or generate 4-digit code)
    const otp = '1234';
    otpCache.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    console.log(`[OTP] Generated OTP for ${cleanPhone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phone: cleanPhone,
      otp, // Provided for instant 1-tap testing
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { phone, otp, name, address }
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, address } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const cleanOtp = String(otp || '').trim();

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number',
      });
    }

    const cached = otpCache.get(cleanPhone);
    const isValid = cleanOtp === '1234' || (cached && cached.otp === cleanOtp && cached.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please use 1234.',
      });
    }

    // OTP is valid - clear from cache
    otpCache.delete(cleanPhone);

    // Save or update user in MongoDB
    const updateData = {
      phone: cleanPhone,
      isVerified: true,
      role: 'customer',
    };
    if (name) updateData.name = name.trim();
    if (address) {
      updateData.address = {
        fullName: address.fullName || name || '',
        villagePo: address.villagePo || '',
        pinCode: address.pinCode || '',
        landmark: address.landmark || '',
        fullAddress: address.fullAddress || '',
      };
    }

    const user = await User.findOneAndUpdate(
      { phone: cleanPhone },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
    });
  }
});

/**
 * GET /api/auth/user/:phone
 */
router.get('/user/:phone', async (req, res) => {
  try {
    const cleanPhone = String(req.params.phone || '').replace(/\D/g, '').slice(-10);
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
