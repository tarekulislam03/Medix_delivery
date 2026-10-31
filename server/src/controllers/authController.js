import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { normalizePhone } from '../utils/phone.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashValue,
  compareHash,
  generate6DigitOtp,
  generate4DigitOtp,
} from '../utils/token.js';
import { sendOtpSms } from '../services/smsProvider.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * POST /auth/check-user
 * Body: { phone, sendOtpIfExisting?: boolean }
 */
export async function checkUser(req, res) {
  try {
    const { phone: rawPhone, sendOtpIfExisting = false } = req.body;
    const normalized = normalizePhone(rawPhone);

    if (!normalized) {
      return sendError(res, 'INVALID_PHONE', 'Please provide a valid 10-digit Indian mobile number', 400);
    }

    const { e164, national } = normalized;

    // Check if user exists (by e164 or national)
    const user = await User.findOne({
      $or: [{ phone: e164 }, { phone: national }],
    });

    const isTestNumber = national === '9876543210' || process.env.TEST_PHONE === national;

    if (!user) {
      return sendSuccess(res, {
        exists: false,
        phone: e164,
        national,
        name: '',
      }, 'New user. Please enter your name to register.');
    }

    let otpSent = false;
    let waitSeconds = 0;

    if (sendOtpIfExisting) {
      const existingOtp = await Otp.findOne({ phone: e164 }).sort({ createdAt: -1 });

      if (!isTestNumber && existingOtp && existingOtp.resendAvailableAt > new Date()) {
        waitSeconds = Math.ceil((existingOtp.resendAvailableAt.getTime() - Date.now()) / 1000);
        return sendSuccess(res, {
          exists: true,
          phone: e164,
          national,
          name: user.name || '',
          otpSent: true,
          cooldownSeconds: waitSeconds,
        }, `Welcome back! OTP already sent. Resend available in ${waitSeconds}s`);
      }

      const plainOtp = isTestNumber ? '1234' : generate4DigitOtp();
      const otpHash = await hashValue(plainOtp);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
      const resendAvailableAt = new Date(now.getTime() + 30 * 1000);

      await Otp.create({
        phone: e164,
        otpHash,
        attempts: 0,
        resendAvailableAt,
        expiresAt,
      });

      if (isTestNumber) {
        console.log(`\n======================================================`);
        console.log(`🧪 [TEST PHONE OTP] Phone: ${e164} (${national})`);
        console.log(`🔑 Test OTPs Accepted: 1234 (4-digit) or 123456 (6-digit)`);
        console.log(`======================================================\n`);
      }

      await sendOtpSms({ phone: e164, otp: plainOtp });
      otpSent = true;
    }

    return sendSuccess(res, {
      exists: true,
      phone: e164,
      national,
      name: user.name || '',
      otpSent,
      cooldownSeconds: isTestNumber ? 0 : 30,
    }, otpSent ? 'Welcome back! OTP sent successfully.' : 'User exists');
  } catch (err) {
    console.error('[checkUser Error]', err);
    return sendError(res, 'CHECK_USER_FAILED', 'Failed to check user: ' + err.message, 500);
  }
}

/**
 * POST /auth/send-otp
 * Body: { phone }
 */
export async function sendOtp(req, res) {
  try {
    const { phone: rawPhone } = req.body;
    const normalized = normalizePhone(rawPhone);

    if (!normalized) {
      return sendError(res, 'INVALID_PHONE', 'Please provide a valid 10-digit Indian mobile number', 400);
    }

    const { e164, national } = normalized;

    // Test bypass for designated test phone numbers (e.g. 9876543210)
    const isTestNumber = national === '9876543210' || process.env.TEST_PHONE === national;

    // Check 30-second resend cooldown (bypassed for test numbers to facilitate testing)
    const existingOtp = await Otp.findOne({ phone: e164 }).sort({ createdAt: -1 });

    if (!isTestNumber && existingOtp && existingOtp.resendAvailableAt > new Date()) {
      const waitSeconds = Math.ceil((existingOtp.resendAvailableAt.getTime() - Date.now()) / 1000);
      return sendError(
        res,
        'COOLDOWN_ACTIVE',
        `Please wait ${waitSeconds} seconds before requesting a new OTP`,
        429,
        { waitSeconds }
      );
    }

    // Generate OTP (fixed 1234 for designated dummy test number, random 4-digit for real users)
    const plainOtp = isTestNumber ? '1234' : generate4DigitOtp();
    const otpHash = await hashValue(plainOtp);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes TTL
    const resendAvailableAt = new Date(now.getTime() + 30 * 1000); // 30 seconds cooldown

    // Save hashed OTP in MongoDB
    await Otp.create({
      phone: e164,
      otpHash,
      attempts: 0,
      resendAvailableAt,
      expiresAt,
    });

    if (isTestNumber) {
      console.log(`\n======================================================`);
      console.log(`🧪 [TEST PHONE OTP] Phone: ${e164} (${national})`);
      console.log(`🔑 Test OTPs Accepted: 1234 (4-digit) or 123456 (6-digit)`);
      console.log(`======================================================\n`);
    }

    // Send via active SMS Provider
    await sendOtpSms({ phone: e164, otp: plainOtp });

    return sendSuccess(res, {
      phone: e164,
      cooldownSeconds: isTestNumber ? 0 : 30,
      expiresInMinutes: 5,
    }, 'OTP sent successfully to your mobile number');
  } catch (err) {
    console.error('[sendOtp Error]', err);
    return sendError(res, 'SMS_SEND_FAILED', 'Failed to dispatch OTP: ' + err.message, 500);
  }
}

/**
 * POST /auth/verify-otp
 * Body: { phone, otp }
 */
export async function verifyOtp(req, res) {
  try {
    const { phone: rawPhone, otp, name } = req.body;
    const normalized = normalizePhone(rawPhone);

    if (!normalized) {
      return sendError(res, 'INVALID_PHONE', 'Invalid mobile number format', 400);
    }

    const { e164, national } = normalized;
    const isTestNumber = national === '9876543210' || process.env.TEST_PHONE === national;
    const isTestOtpMatch = isTestNumber && (otp === '1234' || otp === '123456');

    if (!isTestOtpMatch) {
      // Find the latest active OTP for this phone
      const activeOtp = await Otp.findOne({ phone: e164 }).sort({ createdAt: -1 });

      if (!activeOtp || activeOtp.expiresAt < new Date()) {
        return sendError(res, 'OTP_EXPIRED', 'OTP has expired or does not exist. Please request a new one.', 400);
      }

      if (activeOtp.attempts >= 5) {
        await Otp.deleteOne({ _id: activeOtp._id });
        return sendError(res, 'MAX_ATTEMPTS_EXCEEDED', 'Too many invalid attempts. Please request a fresh OTP.', 429);
      }

      // Verify OTP hash
      const isValid = await compareHash(otp, activeOtp.otpHash);

      if (!isValid) {
        activeOtp.attempts += 1;
        await activeOtp.save();
        const remaining = 5 - activeOtp.attempts;
        return sendError(res, 'INVALID_OTP', `Incorrect OTP. You have ${remaining} attempts remaining.`, 400, {
          remainingAttempts: remaining,
        });
      }
    }

    // OTP is valid! Delete used OTP
    await Otp.deleteMany({ phone: e164 });

    // Check if user exists (checking both e164 and national 10-digit formats for compatibility)
    let user = await User.findOne({
      $or: [{ phone: e164 }, { phone: national }],
    });

    let isNewUser = false;
    let message = '';
    let welcomeDescription = '';

    if (!user) {
      isNewUser = true;
      user = await User.create({
        phone: e164,
        name: (name || '').trim(),
        role: 'customer',
        isNewUser: true,
        hasSeenWelcome: false,
        lastLoginAt: new Date(),
      });
      message = 'Welcome to Medix! Your medicines, delivered to your doorstep.';
      welcomeDescription = 'Genuine healthcare essentials and daily medicines delivered express to your home.';
    } else {
      user.lastLoginAt = new Date();
      if (name && !user.name) user.name = name.trim();
      // Ensure phone is stored in E.164
      if (user.phone !== e164) user.phone = e164;
      message = 'We miss you!';
      welcomeDescription = 'Your cart and past orders are right where you left them.';
    }

    // Issue tokens
    const tokenPayload = {
      id: user._id.toString(),
      phone: user.phone,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Hash and store rotated refresh token
    user.refreshTokenHash = await hashValue(refreshToken);
    await user.save();

    const userProfile = {
      id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isNewUser,
      hasSeenWelcome: user.hasSeenWelcome,
      defaultAddressId: user.defaultAddressId,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };

    return sendSuccess(
      res,
      {
        token: accessToken,
        accessToken,
        refreshToken,
        user: userProfile,
        isNewUser,
        message,
        description: welcomeDescription,
      },
      message
    );
  } catch (err) {
    console.error('[verifyOtp Error]', err);
    return sendError(res, 'VERIFY_FAILED', 'Verification failed: ' + err.message, 500);
  }
}

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 */
export async function refreshToken(req, res) {
  try {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
      return sendError(res, 'MISSING_TOKEN', 'Refresh token is required', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingToken);
    } catch {
      return sendError(res, 'INVALID_REFRESH_TOKEN', 'Expired or invalid refresh token. Please sign in again.', 401);
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid session', 401);
    }

    // Verify stored refresh token hash
    const isTokenMatch = await compareHash(incomingToken, user.refreshTokenHash);

    if (!isTokenMatch) {
      // Possible token reuse attack — revoke all tokens for this user
      user.refreshTokenHash = null;
      await user.save();
      return sendError(res, 'TOKEN_REUSE_DETECTED', 'Session compromised. Please sign in again.', 403);
    }

    // Issue new access token and rotated refresh token
    const tokenPayload = {
      id: user._id.toString(),
      phone: user.phone,
      role: user.role,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    user.refreshTokenHash = await hashValue(newRefreshToken);
    await user.save();

    return sendSuccess(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, 'Tokens rotated successfully');
  } catch (err) {
    console.error('[refreshToken Error]', err);
    return sendError(res, 'REFRESH_FAILED', 'Could not refresh session', 500);
  }
}

/**
 * POST /auth/logout
 * Revoke refresh token
 */
export async function logout(req, res) {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { $set: { refreshTokenHash: null } });
    }
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    return sendError(res, 'LOGOUT_FAILED', err.message, 500);
  }
}
