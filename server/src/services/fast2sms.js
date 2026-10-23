/**
 * Fast2SMS Service for Sending OTP SMS
 * Docs: https://www.fast2sms.com/
 */

/**
 * Sends an OTP SMS via Fast2SMS API.
 * Uses route: 'otp' with variables_values.
 * 
 * @param {string} phone - 10 digit Indian mobile number
 * @param {string} otp - 4 or 6 digit OTP string
 * @returns {Promise<{ success: boolean, message?: string, simulated?: boolean }>}
 */
export async function sendOtpSms(phone, otp) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    throw new Error('A valid 10-digit mobile number is required.');
  }

  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn(`[Fast2SMS] FAST2SMS_API_KEY is not configured in environment.`);
    console.log(`[Fast2SMS DEV SIMULATION] OTP for +91 ${cleanPhone} is: [ ${otp} ]`);
    return {
      success: true,
      simulated: true,
      message: 'Fast2SMS simulated (check server console in development)',
    };
  }


  try {
    const payload = {
      route: 'otp',
      variables_values: String(otp),
      numbers: cleanPhone,
    };

    console.log(`[Fast2SMS] Sending OTP to +91 ${cleanPhone} via Fast2SMS...`);

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.return) {
      const errMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'SMS dispatch failed');
      console.error(`[Fast2SMS Error]`, errMsg);
      throw new Error(`Fast2SMS error: ${errMsg}`);
    }

    console.log(`[Fast2SMS Success] Sent OTP to +91 ${cleanPhone}. Request ID: ${data.request_id}`);
    return {
      success: true,
      requestId: data.request_id,
      message: 'OTP sent successfully to your mobile number',
    };
  } catch (error) {
    console.error(`[Fast2SMS Exception]`, error.message);
    throw error;
  }
}
