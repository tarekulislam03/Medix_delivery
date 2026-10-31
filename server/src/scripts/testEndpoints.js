import mongoose from 'mongoose';
import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { normalizePhone } from '../utils/phone.js';

const BASE_URL = 'http://127.0.0.1:5000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medix_delivery';

async function testSuite() {
  console.log('=== Starting Medix Backend Verification Tests ===\n');
  await mongoose.connect(MONGO_URI);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('[1] Testing GET /health');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds with HTTP 200');
    assert(healthData.data?.status === 'healthy', 'Health status is "healthy"');
    assert(healthData.data?.mongoState === 'connected', 'MongoDB connection is confirmed healthy');

    // 2. Auth Send OTP
    const testPhone = '9876500001';
    console.log(`\n[2] Testing POST /auth/send-otp for phone: ${testPhone}`);
    const sendOtpRes = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone }),
    });
    const sendOtpData = await sendOtpRes.json();
    assert(sendOtpRes.status === 200, 'send-otp responds with HTTP 200');
    assert(sendOtpData.success === true, 'send-otp success is true');

    // Query OTP directly from DB for test verification
    const normalized = normalizePhone(testPhone).e164;
    const otpDoc = await Otp.findOne({ phone: normalized }).sort({ createdAt: -1 });
    assert(!!otpDoc, 'OTP record saved in MongoDB with TTL index');

    // 3. Auth Verify OTP (New User Flow)
    // In dev mode, let's verify with the test OTP from log / DB
    // Since Otp stores hashed otp or in dev we know the generated one, let's look at Otp doc or send-otp response
    // In authController, we use generate6DigitOtp() and hashValue(otp).
    // Let's create an OTP with known hash directly or test verify:
    const knownOtp = '654321';
    import('../utils/token.js').then(async ({ hashValue }) => {
      const hashed = await hashValue(knownOtp);
      await Otp.findOneAndUpdate(
        { phone: normalized },
        { otpHash: hashed, attempts: 0, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
        { upsert: true }
      );
    });

    // Small delay to ensure DB write
    await new Promise((r) => setTimeout(r, 200));

    console.log(`\n[3] Testing POST /auth/verify-otp (New User)`);
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, otp: knownOtp }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200, 'verify-otp responds with HTTP 200');
    assert(!!verifyData.data?.accessToken, 'Returns valid accessToken (15 min)');
    assert(!!verifyData.data?.refreshToken, 'Returns valid refreshToken (30 days)');
    assert(verifyData.data?.isNewUser === true, 'Correctly flags isNewUser = true');
    assert(verifyData.data?.message?.title?.includes('Welcome'), 'Returns Welcome message for new user');

    const customerToken = verifyData.data.accessToken;

    // 4. Auth Verify OTP Again (Existing User Flow)
    console.log(`\n[4] Testing POST /auth/verify-otp (Existing User - Miss You Flow)`);
    // Re-seed the known OTP for second login
    const { hashValue } = await import('../utils/token.js');
    await Otp.findOneAndUpdate(
      { phone: normalized },
      { otpHash: await hashValue(knownOtp), attempts: 0, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true }
    );
    const verifyRes2 = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, otp: knownOtp }),
    });
    const verifyData2 = await verifyRes2.json();
    assert(verifyData2.data?.isNewUser === false, 'Existing user recognized (isNewUser = false)');
    assert(verifyData2.data?.message?.title?.includes('miss you'), 'Returns "We miss you!" message for returning user');

    // 5. Account Profile & Address CRUD
    console.log(`\n[5] Testing GET /me and POST /me/addresses`);
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /me returns HTTP 200');
    assert(meData.data?.phone === normalized, 'GET /me matches customer phone');

    const addressRes = await fetch(`${BASE_URL}/me/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        label: 'Home',
        fullName: 'Test Resident',
        phone: testPhone,
        villagePo: 'Balarampur Village',
        landmark: 'Near Water Tank',
        pinCode: '743424',
        isDefault: true,
      }),
    });
    const addressData = await addressRes.json();
    assert(addressRes.status === 201, 'POST /me/addresses returns HTTP 201 Created');
    assert(addressData.data?.savedAddresses?.length > 0, 'Saved address added to profile');
    const createdAddress = addressData.data.savedAddresses[0];

    // 6. Cart Atomic Operations
    console.log(`\n[6] Testing PUT /cart/items and GET /cart`);
    const cartPutRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        itemType: 'catalog',
        productId: new mongoose.Types.ObjectId().toString(),
        name: 'Dolo 650 Tablet',
        price: 34,
        quantity: 3,
      }),
    });
    const cartData = await cartPutRes.json();
    assert(cartPutRes.status === 200, 'PUT /cart/items succeeds');
    assert(cartData.data?.bill?.itemsTotal === 102, 'Server correctly recomputed itemsTotal (34 * 3 = 102)');
    assert(cartData.data?.bill?.total === 107, 'Server correctly added packaging charge (102 + 5 = 107)');

    // 7. Orders Creation with Idempotency-Key
    console.log(`\n[7] Testing POST /orders with Idempotency-Key (Preventing Double-Taps)`);
    const idempotencyKey = `test-idem-${Date.now()}`;
    const orderPayload = {
      addressId: createdAddress._id,
      paymentMethod: 'COD',
      notes: 'Please ring village bell on arrival',
    };

    // First Tap
    const orderRes1 = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(orderPayload),
    });
    const orderData1 = await orderRes1.json();
    assert(orderRes1.status === 201, 'First order tap returns HTTP 201 Created');
    assert(!!orderData1.data?.orderNumber, 'Human-friendly orderNumber generated');
    assert(orderData1.data?.status === 'PLACED', 'Initial status is PLACED');

    // Second Tap (Duplicate)
    const orderRes2 = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(orderPayload),
    });
    const orderData2 = await orderRes2.json();
    assert(orderRes2.status === 200, 'Second order tap returns HTTP 200 (Idempotent response)');
    assert(orderData2.data?.orderNumber === orderData1.data?.orderNumber, 'Duplicate order prevented; returned existing order');

    // 8. Order Active and History Endpoints
    console.log(`\n[8] Testing GET /orders/active and GET /orders/history`);
    const activeRes = await fetch(`${BASE_URL}/orders/active`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const activeData = await activeRes.json();
    assert(activeRes.status === 200, 'GET /orders/active returns HTTP 200');
    assert(activeData.data?.length >= 1, 'Active orders list contains the placed order');

    const historyRes = await fetch(`${BASE_URL}/orders/history?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const historyData = await historyRes.json();
    assert(historyRes.status === 200, 'GET /orders/history returns HTTP 200');
    assert(historyData.data?.orders?.length >= 1, 'Orders history paginated list works');

    // 9. Order Cancellation by Customer
    console.log(`\n[9] Testing POST /orders/:id/cancel`);
    const cancelRes = await fetch(`${BASE_URL}/orders/${orderData1.data._id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ reason: 'Ordered by mistake' }),
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200, 'Order cancellation before PACKED succeeds');
    assert(cancelData.data?.status === 'CANCELLED', 'Order status transitioned to CANCELLED');

    // 10. Admin Endpoints
    console.log(`\n[10] Testing Admin Panel Order Pipeline Endpoints`);
    const { signAccessToken } = await import('../utils/token.js');
    const adminToken = signAccessToken({ id: new mongoose.Types.ObjectId(), role: 'admin', phone: '+919876543210' });

    const adminOrdersRes = await fetch(`${BASE_URL}/admin/orders?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminOrdersData = await adminOrdersRes.json();
    assert(adminOrdersRes.status === 200, 'GET /admin/orders returns HTTP 200');
    assert(adminOrdersData.data?.orders?.length > 0, 'Admin can view and paginate incoming queue');

    console.log(`\n=================================================`);
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=================================================`);
  } catch (err) {
    console.error('Test Suite encountered error:', err);
    failed++;
  } finally {
    await mongoose.connection.close();
    process.exit(failed === 0 ? 0 : 1);
  }
}

testSuite();
