import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { phone }
 * Logs in customer using ONLY Mobile Number (no OTP, no password, no email)
 */
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number.',
      });
    }

    const user = await User.findOne({ phone: cleanPhone, role: 'customer' });

    if (!user) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: `No account found for +91 ${cleanPhone}. Please create an account.`,
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'medix_jwt_secret_development_key_38472910482018374';
    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    console.log(`[Auth] Customer logged in: ${user.name || 'Customer'} (+91 ${cleanPhone})`);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: true,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to sign in. Please try again.',
      error: err.message,
    });
  }
});

/**
 * POST /api/auth/register (or /create-account)
 * Body: { name, phone, address }
 * Creates an account using ONLY Name and Mobile Number (no OTP, no password, no email)
 */
router.post(['/register', '/create-account'], async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const cleanName = String(name || '').trim();

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number.',
      });
    }

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your full name.',
      });
    }

    let user = await User.findOne({ phone: cleanPhone, role: 'customer' });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        name: cleanName,
        phone: cleanPhone,
        role: 'customer',
        isVerified: true,
      });

      if (address) {
        user.address = {
          fullName: address.fullName || cleanName,
          villagePo: address.villagePo || '',
          pinCode: address.pinCode || '',
          landmark: address.landmark || '',
          fullAddress: address.fullAddress || '',
        };
      }

      await user.save();
      console.log(`[Auth] Registered new customer: ${cleanName} (+91 ${cleanPhone})`);
    } else {
      user.name = cleanName;
      user.isVerified = true;
      if (address) {
        user.address = {
          fullName: address.fullName || user.name,
          villagePo: address.villagePo || user.address?.villagePo || '',
          pinCode: address.pinCode || user.address?.pinCode || '',
          landmark: address.landmark || user.address?.landmark || '',
          fullAddress: address.fullAddress || user.address?.fullAddress || '',
        };
      }
      await user.save();
      console.log(`[Auth] Updated and signed in customer: ${cleanName} (+91 ${cleanPhone})`);
    }

    const jwtSecret = process.env.JWT_SECRET || 'medix_jwt_secret_development_key_38472910482018374';
    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: isNewUser ? 'Account created successfully!' : 'Signed in successfully!',
      isNewUser,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: true,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('Error creating account:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.',
      error: err.message,
    });
  }
});

/**
 * Fallback route for backwards compatibility: POST /api/auth/verify-otp
 * Logs in or registers customer directly without requiring an actual OTP code
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, name, address } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number.',
      });
    }

    let user = await User.findOne({ phone: cleanPhone, role: 'customer' });
    const isNewUser = !user;

    if (!user) {
      user = new User({
        phone: cleanPhone,
        name: name ? name.trim() : 'Customer',
        role: 'customer',
        isVerified: true,
      });

      if (address) {
        user.address = {
          fullName: address.fullName || user.name,
          villagePo: address.villagePo || '',
          pinCode: address.pinCode || '',
          landmark: address.landmark || '',
          fullAddress: address.fullAddress || '',
        };
      }
      await user.save();
    } else {
      user.isVerified = true;
      if (name && name.trim()) user.name = name.trim();
      await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET || 'medix_jwt_secret_development_key_38472910482018374';
    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: isNewUser ? 'Account created successfully!' : 'Signed in successfully!',
      isNewUser,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: true,
        address: user.address,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Authentication error',
    });
  }
});

/**
 * Legacy stub for send-otp: immediately returns success without sending SMS
 */
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  return res.status(200).json({
    success: true,
    message: 'OTP verification is not required.',
    phone: cleanPhone,
  });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization required.' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'medix_jwt_secret_development_key_38472910482018374';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
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
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

/**
 * GET /api/auth/user/:phone
 */
router.get('/user/:phone', async (req, res) => {
  try {
    const cleanPhone = String(req.params.phone || '').replace(/\D/g, '').slice(-10);
    const user = await User.findOne({ phone: cleanPhone, role: 'customer' });

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
