import axios from 'axios';
import { sendSmsViaApitxt } from './apitxt.js';

/**
 * Login OTP SMS text. This must match the DLT-registered template exactly,
 * with the OTP in the variable slot.
 */
export function buildLoginOtpMessage(otp) {
  return `Your login OTP is ${otp}, do not share with anyone. Team Medix`;
}

/**
 * Abstract SMS Provider Interface
 */
class BaseSmsProvider {
  async sendOtp({ phone, otp }) {
    throw new Error('sendOtp method must be implemented');
  }
}

/**
 * Development Console Stub Provider
 */
class ConsoleSmsProvider extends BaseSmsProvider {
  async sendOtp({ phone, otp }) {
    console.log(`[SMS Console Stub] To: ${phone} | OTP: ${otp} (valid for 5 mins)`);
    return { success: true, provider: 'console', messageId: `STUB-${Date.now()}` };
  }
}

/**
 * APITxT Provider (India SMS & Multi-channel OTP)
 */
class ApitxtSmsProvider extends BaseSmsProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async sendOtp({ phone, otp }) {
    // Custom wording: send our own text via sendMsg when the DLT OTP template is configured.
    const otpTemplateId = process.env.APITXT_OTP_TEMPLATE_ID;
    if (otpTemplateId && process.env.APITXT_PE_ID && process.env.APITXT_SENDER_ID) {
      try {
        const result = await sendSmsViaApitxt({
          mobiles: phone,
          message: buildLoginOtpMessage(otp),
          sender: process.env.APITXT_SENDER_ID,
          route: '4',
          template_id: otpTemplateId,
          pe_id: process.env.APITXT_PE_ID,
        });
        return { success: true, provider: 'apitxt', messageId: result.requestId };
      } catch (err) {
        console.error('[APITxT custom OTP SMS failed, using default OTP channel]:', err.message);
      }
    }

    // APITxT expects clean 10-digit number prefixed with country code 91
    const clean10 = String(phone).replace(/\D/g, '').slice(-10);
    const apitxtNumber = `91${clean10}`;

    const params = new URLSearchParams();
    params.append('authkey', this.apiKey.trim());
    params.append('mobile', apitxtNumber);
    params.append('otp', String(otp));
    params.append('channel', 'sms');

    const res = await axios.post(
      'https://apitxt.com/api/sendOTP',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    if (res.data?.status === 'success' || res.data?.status === true) {
      return { success: true, provider: 'apitxt', messageId: res.data?.data?.request_id || res.data?.request_id };
    }

    throw new Error(res.data?.message || 'Failed to dispatch OTP via APITxT');
  }
}

/**
 * Fast2SMS Provider
 */
class Fast2smsProvider extends BaseSmsProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async sendOtp({ phone, otp }) {
    const clean10 = String(phone).replace(/\D/g, '').slice(-10);
    const res = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        variables_values: String(otp),
        route: 'otp',
        numbers: clean10,
      },
      {
        headers: {
          authorization: this.apiKey,
        },
        timeout: 10000,
      }
    );

    if (res.data?.return === true) {
      return { success: true, provider: 'fast2sms', messageId: res.data?.request_id };
    }

    throw new Error(res.data?.message?.[0] || 'Fast2SMS dispatch failed');
  }
}

// Factory to resolve active provider based on environment variables
export function getSmsProvider() {
  const apitxtKey = process.env.APITXT_API_KEY;
  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  if (apitxtKey) {
    return new ApitxtSmsProvider(apitxtKey);
  }

  if (fast2smsKey) {
    return new Fast2smsProvider(fast2smsKey);
  }

  return new ConsoleSmsProvider();
}

/**
 * Unified sendOtp method that dispatches via the active provider,
 * and logs to console in development.
 */
export async function sendOtpSms({ phone, otp }) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n========================================`);
    console.log(`[DEV OTP DISPATCH] Phone: ${phone} | OTP: ${otp}`);
    console.log(`========================================\n`);
  }

  const provider = getSmsProvider();
  try {
    return await provider.sendOtp({ phone, otp });
  } catch (err) {
    // In development, gracefully fall back to console delivery rather than blocking authentication
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[SMS Provider Warning] ${provider.constructor.name} failed (${err.message}). Proceeding with Dev console stub.`);
      return { success: true, provider: 'console-fallback', messageId: `DEV-${Date.now()}` };
    }
    throw err;
  }
}
