import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function RiderDashboard() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Authentication state based on JWT token
  const [currentRider, setCurrentRider] = useState(() => {
    try {
      const saved = localStorage.getItem('medix_rider_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(localStorage.getItem('medix_rider_token'));

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'delivered'
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [otpInputs, setOtpInputs] = useState({});

  // Authenticate with Phone and Password
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await api.post('/rider/login', { phone, password });
      if (res.data?.success && res.data.token) {
        localStorage.setItem('medix_rider_token', res.data.token);
        localStorage.setItem('medix_rider_info', JSON.stringify(res.data.rider));
        setCurrentRider(res.data.rider);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Check your mobile number and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medix_rider_token');
    localStorage.removeItem('medix_rider_info');
    setCurrentRider(null);
    setPhone('');
    setPassword('');
  };

  // Fetch rider orders
  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const params = {};
      if (currentRider?.phone) {
        params.phone = currentRider.phone;
      }
      const res = await api.get('/rider/orders', { params });
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching rider orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentRider?.phone]);

  // Status transition handlers with OTP verification
  const handleUpdateStatus = async (orderId, newStatus, otp = '') => {
    setActionLoadingId(orderId);
    try {
      await api.put(`/rider/orders/${orderId}/status`, { status: newStatus, otp });
      setOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating delivery: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeTasks = orders.filter((o) =>
    ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'].includes((o.status || '').toUpperCase())
  );
  const deliveredTasks = orders.filter((o) => (o.status || '').toUpperCase() === 'DELIVERED');

  const displayedOrders = activeFilter === 'active' ? activeTasks : deliveredTasks;

  // Login Screen with Phone and Password
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 min-h-screen bg-white flex flex-col justify-center">
        <div className="bg-surface rounded-card shadow-card border border-gray-100 p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-ink font-display">Delivery Rider Login</h1>
            <p className="text-xs text-ink-light mt-1">Sign in with your registered rider phone and password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Registered Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full min-h-[46px] px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-ink focus:bg-white focus:outline-none focus:border-brand-green"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Rider password"
                className="w-full min-h-[46px] px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-ink focus:bg-white focus:outline-none focus:border-brand-green"
                required
              />
              {loginError && <p className="text-xs text-red-500 font-medium mt-1.5">{loginError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full min-h-[44px] bg-brand-green hover:bg-brand-dark disabled:opacity-50 text-white font-bold text-xs rounded-pill shadow-xs transition-colors"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Start Shift'}
            </button>
          </form>

          <p className="text-[11px] text-ink-lighter text-center">
            Default credentials for pre-registered riders: Password is 123456
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="max-w-md mx-auto p-4 min-h-screen bg-white"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <h1 className="text-xl font-bold text-ink font-display">
            {currentRider?.name || 'Rider Console'}
          </h1>
          <p className="text-xs text-ink-light">
            {currentRider?.phone ? `+91 ${currentRider.phone}` : 'Active Shift'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isLoading}
            className="text-xs font-bold text-brand-green bg-brand-light hover:bg-emerald-100 px-3 py-1.5 rounded-pill transition-colors"
          >
            {isLoading ? 'Updating...' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-ink-lighter hover:text-red-600 px-2 py-1 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {displayedOrders.length === 0 ? (
          <div className="bg-surface rounded-card border border-gray-100 p-8 text-center text-ink-lighter">
            <p className="font-semibold text-xs text-ink-light">No {activeFilter} deliveries assigned</p>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
            const isProcessing = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-surface rounded-card shadow-card border border-gray-100 p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <div>
                    <span className="font-bold text-xs text-ink font-display">#{order.id}</span>
                    <span className="text-[11px] text-ink-light ml-1.5">({order.eta})</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isDelivered
                      ? 'bg-emerald-50 text-emerald-700'
                      : isOutForDelivery
                      ? 'bg-indigo-50 text-indigo-700'
                      : order.status === 'PACKED'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {isDelivered
                      ? 'DELIVERED'
                      : isOutForDelivery
                      ? 'EN ROUTE'
                      : order.status === 'PACKED'
                      ? 'READY FOR PICKUP'
                      : 'AWAITING PACKING'}
                  </span>
                </div>

                {/* COD Cash Amount Box */}
                <div className="bg-brand-light/70 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-brand-dark uppercase tracking-wider block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-xs text-ink-light">Collect from customer:</span>
                  </div>
                  <strong className="text-base font-bold text-brand-dark font-display">
                    Rs. {(order.codAmount || 0).toFixed(2)}
                  </strong>
                </div>

                {/* Step 1: Store Pickup */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-lighter text-[10px] font-bold uppercase">
                      Step 1: Store Pickup
                    </span>
                    {order.pharmacy?.phone && (
                      <a
                        href={`tel:${order.pharmacy.phone}`}
                        className="text-[11px] font-bold text-brand-green bg-white px-3 py-1 rounded-pill border border-gray-200 shadow-xs"
                      >
                        Call Store
                      </a>
                    )}
                  </div>
                  <p className="font-bold text-ink">{order.pharmacy?.name || 'Assigned Store'}</p>
                  <p className="text-ink-light text-[11px] leading-relaxed">{order.pharmacy?.address || 'Siliguri'}</p>
                </div>

                {/* Step 2: Customer Delivery */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-lighter text-[10px] font-bold uppercase">
                      Step 2: Customer Dropoff
                    </span>
                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[11px] font-bold text-brand-green bg-white px-3 py-1 rounded-pill border border-gray-200 shadow-xs"
                      >
                        Call Customer
                      </a>
                    )}
                  </div>
                  <p className="font-bold text-ink">{order.customerName}</p>
                  <p className="text-ink-light text-[11px] leading-relaxed">{order.deliveryAddress}</p>
                  {order.landmark && (
                    <p className="text-gray-400 text-[10px]">Near: {order.landmark}</p>
                  )}
                </div>

                {/* Items Summary */}
                <div className="text-[11px] text-ink-light px-1">
                  Package contains:{' '}
                  <span className="font-semibold text-ink">
                    {(order.items || []).map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </span>
                </div>

                {/* Action Buttons with OTP Verification */}
                {!isDelivered && (
                  <div className="pt-1">
                    {order.status === 'CONFIRMED' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl space-y-1">
                        <span className="font-bold block">Awaiting Store Packaging</span>
                        <p className="text-[11px] leading-relaxed text-blue-700">
                          Pharmacy is preparing and packing this order. The store will provide a 4-digit Pickup OTP once packed to start your delivery journey.
                        </p>
                      </div>
                    )}

                    {order.status === 'PACKED' && (
                      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                            Enter Store Pickup OTP
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">Shown on store screen</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            inputMode="numeric"
                            placeholder="4-digit OTP"
                            value={otpInputs[order.id] || ''}
                            onChange={(e) =>
                              setOtpInputs({
                                ...otpInputs,
                                [order.id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                              })
                            }
                            className="w-32 min-h-[44px] px-3 bg-white border border-emerald-300 rounded-xl font-mono text-center text-sm font-bold tracking-widest focus:outline-none focus:border-brand-green"
                          />
                          <button
                            type="button"
                            disabled={isProcessing || (otpInputs[order.id] || '').length < 4}
                            onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY', otpInputs[order.id])}
                            className="flex-1 min-h-[44px] bg-brand-green hover:bg-brand-dark disabled:opacity-50 text-white font-bold text-xs rounded-pill shadow-xs transition-colors"
                          >
                            {isProcessing ? 'Verifying...' : 'Verify & Start Delivery'}
                          </button>
                        </div>
                      </div>
                    )}

                    {isOutForDelivery && (
                      <div className="p-3.5 bg-brand-light/80 border border-emerald-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">
                            Enter Customer Delivery OTP
                          </span>
                          <span className="text-[10px] text-ink-light font-medium">Shown on customer screen</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            inputMode="numeric"
                            placeholder="4-digit OTP"
                            value={otpInputs[order.id] || ''}
                            onChange={(e) =>
                              setOtpInputs({
                                ...otpInputs,
                                [order.id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                              })
                            }
                            className="w-32 min-h-[44px] px-3 bg-white border border-emerald-300 rounded-xl font-mono text-center text-sm font-bold tracking-widest focus:outline-none focus:border-brand-green"
                          />
                          <button
                            type="button"
                            disabled={isProcessing || (otpInputs[order.id] || '').length < 4}
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED', otpInputs[order.id])}
                            className="flex-1 min-h-[44px] bg-brand-green hover:bg-brand-dark disabled:opacity-50 text-white font-bold text-xs rounded-pill shadow-xs transition-colors"
                          >
                            {isProcessing ? 'Verifying...' : `Confirm Delivered (Rs. ${order.codAmount.toFixed(2)})`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Customer-Style Bottom Navigation Bar */}
      <nav
        style={{
          paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
        }}
        className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeFilter === 'active'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            Active Tasks ({activeTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('delivered')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeFilter === 'delivered'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            Completed ({deliveredTasks.length})
          </button>
        </div>
      </nav>
    </div>
  );
}
