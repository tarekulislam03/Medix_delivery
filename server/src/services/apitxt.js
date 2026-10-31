/**
 * APITxT SMS Service Implementation
 * API Documentation Reference: prompt.txt
 * 
 * Endpoints:
 * - POST https://apitxt.com/api/sendMsg (Send SMS API: Transactional & Promotional)
 * - POST https://apitxt.com/api/sendOTP (OTP SMS API)
 */

/**
 * Sends SMS via APITxT sendMsg API
 * Reference: prompt.txt
 * 
 * @param {Object} options
 * @param {string} options.mobiles - 10-digit mobile number(s), comma-separated (e.g. 9830421890)
 * @param {string} options.message - The SMS text message
 * @param {string} [options.sender] - 6-character approved Sender ID (uppercase alphabetic)
 * @param {string} [options.route] - '4' for Transactional (default), '1' for Promotional
 * @param {string} [options.template_id] - DLT-registered Template ID from telecom portal
 * @param {string} [options.pe_id] - DLT-registered Principal Entity ID
 * @param {string} [options.schtime] - Optional schedule time (YYYY-MM-DD HH:mm:ss)
 * @param {number} [options.flash] - 0 = Normal, 1 = Flash (default: 0)
 * @param {number} [options.unicode] - 0 = English, 1 = Unicode/Non-English (default: 0)
 * @returns {Promise<{ success: boolean, requestId?: string, status: number, message: string }>}
 */
export async function sendSmsViaApitxt({
  mobiles,
  message,
  sender,
  route = '4',
  template_id,
  pe_id,
  schtime,
  flash = 0,
  unicode = 0,
}) {
  const authkey =
    process.env.APITXT_API_KEY ||
    'SQ3usuGf-6_78354q2OuDfnIxl-jcxuTLUw05v9h-YE';

  // Format comma-separated 10-digit mobiles (strip country code prefix if 12 digits starting with 91)
  const cleanMobiles = String(mobiles || '')
    .split(',')
    .map((m) => m.replace(/\D/g, '').slice(-10))
    .filter((m) => m.length === 10)
    .join(',');

  if (!cleanMobiles) {
    throw new Error('Valid 10-digit mobile number(s) required.');
  }

  const senderId = (sender || process.env.APITXT_SENDER_ID || 'MEDIXS').toUpperCase().trim();
  const templateId = String(template_id || process.env.APITXT_TEMPLATE_ID || '').trim();
  const peId = String(pe_id || process.env.APITXT_PE_ID || '').trim();
  const selectedRoute = String(route || process.env.APITXT_ROUTE || '4').trim();

  // Validate required parameters per prompt.txt specification
  if (!senderId || senderId.length !== 6) {
    throw new Error('Invalid sender ID. Must be exactly 6 uppercase alphabetic characters.');
  }

  if (!templateId) {
    throw new Error('Missing DLT Template ID (template_id). Please set APITXT_TEMPLATE_ID in .env.');
  }

  if (!peId) {
    throw new Error('Missing Principal Entity ID (pe_id). Please set APITXT_PE_ID in .env.');
  }

  console.log(`[APITxT sendMsg] Sending SMS to ${cleanMobiles} using Sender: ${senderId}, Route: ${selectedRoute}`);

  const params = new URLSearchParams();
  params.append('authkey', authkey.trim());
  params.append('mobiles', cleanMobiles);
  params.append('message', message);
  params.append('sender', senderId);
  params.append('route', selectedRoute);
  params.append('template_id', templateId);
  params.append('pe_id', peId);

  if (schtime) params.append('schtime', schtime);
  if (flash) params.append('flash', String(flash));
  if (unicode) params.append('unicode', String(unicode));

  const response = await fetch('https://apitxt.com/api/sendMsg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json().catch(() => null);

  // Parse response per prompt.txt documentation
  if (response.ok && data?.status === 200) {
    console.log(`[APITxT sendMsg Success] Request ID: ${data?.request_id}`);
    return {
      success: true,
      requestId: data?.request_id,
      status: 200,
      message: data?.message || 'success',
    };
  }

  const errorCode = data?.status || data?.code || response.status;
  const errorMsg = data?.message || data?.error || 'SMS dispatch failed';
  console.error(`[APITxT sendMsg Error ${errorCode}]: ${errorMsg}`, data);

  const errorMap = {
    101: 'Missing mobile number',
    102: 'Missing message',
    103: 'Missing sender Id',
    104: 'Missing Route',
    105: 'Missing Authentication Key',
    106: 'Missing country code',
    111: 'Missing Principal Entity Id (pe_id)',
    112: 'Missing DLT Template Id',
    113: 'Missing SMS Panel Template Id',
    202: 'Invalid mobile number (Must be at least 10 digits)',
    203: 'Invalid sender ID (Must be 6 characters, alphabetic)',
    204: 'Invalid Route or Flash value',
    301: 'Insufficient balance to process request',
    302: 'Route currently unavailable',
    303: 'Blocked user account',
    304: 'Method not allowed / Invalid Authentication Key',
    305: 'SMS Panel Template ID not matched',
    307: 'Sender ID does not match the template',
    311: 'Duplicate request discarded (within 15 seconds)',
  };

  const detailedMsg = errorMap[errorCode] ? `${errorMap[errorCode]} (${errorMsg})` : errorMsg;
  throw new Error(`APITxT Error ${errorCode}: ${detailedMsg}`);
}

/**
 * Sends an OTP SMS via APITxT sendOTP API
 * Used for fast user login & verification
 */
export async function sendOtpViaApitxt({ phone, otp, channel = 'sms' }) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    throw new Error('A valid 10-digit mobile number is required.');
  }

  const apiKey =
    process.env.APITXT_API_KEY ||
    'SQ3usuGf-6_78354q2OuDfnIxl-jcxuTLUw05v9h-YE';

  const mobileWithCountry = `91${cleanPhone}`;

  console.log(`[APITxT sendOTP] Dispatching OTP to +${mobileWithCountry}...`);

  const params = new URLSearchParams();
  params.append('authkey', apiKey.trim());
  params.append('mobile', mobileWithCountry);
  params.append('otp', String(otp));
  params.append('channel', channel);

  const response = await fetch('https://apitxt.com/api/sendOTP', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || (data && data.status !== 'success')) {
    const errorMsg =
      data?.message || data?.error || `HTTP ${response.status} failed`;
    console.error('[APITxT Error]', errorMsg, data);
    throw new Error(`APITxT error: ${errorMsg}`);
  }

  console.log(`[APITxT sendOTP Success] Request ID: ${data?.data?.request_id}`);
  return {
    success: true,
    requestId: data?.data?.request_id,
    message: data?.message || 'OTP sent successfully',
  };
}

/**
 * High-level Order Placed notification sender
 * Composes the "Order Placed" message with order number, price details, and sends via APITxT
 */
export async function sendOrderPlacedSms({
  phone,
  orderId,
  totalAmount,
  deliveryOtp,
  customerName = 'Customer',
  paymentMethod = 'Cash on Delivery',
  itemsCount = 1,
}) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    console.warn(`[Order SMS] Invalid recipient phone: ${phone}`);
    return;
  }

  // Construct message format
  const message = `Order Placed! Dear ${customerName}, your Medix order #${orderId} of Rs.${totalAmount || 0} (${paymentMethod}) is confirmed. Delivery PIN: ${deliveryOtp}. Medix Pharmacy.`;

  console.log(`[Order SMS] Composed message: "${message}"`);

  const templateId = process.env.APITXT_TEMPLATE_ID;
  const peId = process.env.APITXT_PE_ID;
  const senderId = process.env.APITXT_SENDER_ID;

  // If DLT credentials are configured, send the exact custom message via sendMsg API
  if (templateId && peId && senderId) {
    try {
      const result = await sendSmsViaApitxt({
        mobiles: cleanPhone,
        message,
        sender: senderId,
        route: '4',
        template_id: templateId,
        pe_id: peId,
      });
      return result;
    } catch (err) {
      console.error(`[Order SMS sendMsg failed]:`, err.message);
    }
  } else {
    console.log(
      `[Order SMS Notice] APITXT_TEMPLATE_ID / APITXT_PE_ID / APITXT_SENDER_ID not yet set in .env. Falling back to OTP channel for delivery PIN.`
    );
  }

  // Fallback: If custom text DLT credentials are not yet entered, send Delivery PIN via sendOTP
  try {
    return await sendOtpViaApitxt({
      phone: cleanPhone,
      otp: String(deliveryOtp || '1234'),
      channel: 'sms',
    });
  } catch (err) {
    console.error(`[Order SMS Fallback Failed]:`, err.message);
  }
}
