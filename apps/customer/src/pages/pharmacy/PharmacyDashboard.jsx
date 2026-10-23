import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function PharmacyDashboard() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Authentication state based on JWT token
  const [currentPharmacy, setCurrentPharmacy] = useState(() => {
    try {
      const saved = localStorage.getItem('medix_pharmacy_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(localStorage.getItem('medix_pharmacy_token'));

  // Orders & State
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'packed' | 'completed'
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject Dialog
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('Item out of stock');

  // Login handler with Phone and Password
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await api.post('/pharmacy/login', { phone, password });
      if (res.data?.success && res.data.token) {
        localStorage.setItem('medix_pharmacy_token', res.data.token);
        localStorage.setItem('medix_pharmacy_store', res.data.pharmacy.name);
        localStorage.setItem('medix_pharmacy_info', JSON.stringify(res.data.pharmacy));
        setCurrentPharmacy(res.data.pharmacy);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Check your phone number and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medix_pharmacy_token');
    localStorage.removeItem('medix_pharmacy_store');
    localStorage.removeItem('medix_pharmacy_info');
    setCurrentPharmacy(null);
    setPhone('');
    setPassword('');
  };

  // Fetch orders for this pharmacy
  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const params = {};
      if (currentPharmacy?.phone) {
        params.storePhone = currentPharmacy.phone;
      }
      if (currentPharmacy?.name) {
        params.storeName = currentPharmacy.name;
      }
      const res = await api.get('/pharmacy/orders', { params });
      if (res.data?.success) {
        setOrders(res.data.orders || []);
        setCounts(res.data.counts || {});
      }
    } catch (err) {
      console.error('Error fetching pharmacy orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentPharmacy?.phone, currentPharmacy?.name]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus, reason = null) => {
    setActionLoadingId(orderId);
    try {
      await api.put(`/pharmacy/orders/${orderId}/status`, {
        status: newStatus,
        reason,
      });
      await fetchOrders();
      if (rejectOrder) setRejectOrder(null);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingOrders = orders.filter((o) =>
    ['PLACED', 'CONFIRMED', 'SEARCHING', 'ASSIGNED'].includes((o.status || '').toUpperCase())
  );
  const packedOrders = orders.filter((o) => (o.status || '').toUpperCase() === 'PACKED');
  const completedOrders = orders.filter((o) =>
    ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes((o.status || '').toUpperCase())
  );

  const displayedOrders =
    activeTab === 'pending'
      ? pendingOrders
      : activeTab === 'packed'
      ? packedOrders
      : completedOrders;

  // Login Screen with Phone & Password
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 min-h-screen bg-white flex flex-col justify-center">
        <div className="bg-surface rounded-card shadow-card border border-gray-100 p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-ink font-display">Pharmacy Partner Login</h1>
            <p className="text-xs text-ink-light mt-1">Sign in with your registered store phone number and password</p>
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
                placeholder="Store password"
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
              {isLoggingIn ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-[11px] text-ink-lighter text-center">
            Default credentials for pre-registered stores: Password is 123456
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
        <div className="flex-1 mr-2">
          <h1 className="text-xl font-bold text-ink font-display truncate">
            {currentPharmacy?.name || 'Chemist Station'}
          </h1>
          <p className="text-xs text-ink-light">
            {currentPharmacy?.phone ? `+91 ${currentPharmacy.phone}` : 'Store Portal'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            <p className="font-semibold text-xs text-ink-light">No {activeTab} orders for this store</p>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isPending = ['PLACED', 'CONFIRMED'].includes(order.status);
            const isPacked = order.status === 'PACKED';
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
                    <span className="text-[11px] text-ink-light ml-1.5">
                      · {new Date(order.placedAt).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-ink">
                    {order.status}
                  </span>
                </div>

                {/* Ordered Medicines List */}
                <div className="space-y-1.5">
                  <div className="text-xs pb-1">
                    <span className="font-bold text-ink">
                      Medicines to Pack ({order.items?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">
                            {item.name}
                          </span>
                          {item.requiresRx && (
                            <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[9px] font-bold rounded">
                              Rx
                            </span>
                          )}
                        </div>

                        <div className="font-bold font-mono text-xs text-ink">
                          x {item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.prescriptionUploaded && (
                    <div className="p-2 bg-purple-50 text-purple-700 text-xs font-semibold rounded-xl">
                      Prescription Uploaded by Customer
                    </div>
                  )}
                </div>

                {/* Customer & Rider Info */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-2">
                  <div>
                    <span className="text-ink-lighter text-[10px] uppercase font-bold block">
                      Delivery Customer:
                    </span>
                    <p className="font-semibold text-ink">{order.customerName}</p>
                    <p className="text-ink-light text-[11px] leading-relaxed">{order.deliveryAddress}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <div>
                      <span className="text-ink-lighter text-[10px] uppercase font-bold block">
                        Pickup Rider:
                      </span>
                      <p className="font-semibold text-ink">
                        {order.rider ? `${order.rider.name} (${order.rider.phone})` : 'Unassigned'}
                      </p>
                    </div>

                    {order.rider?.phone && (
                      <a
                        href={`tel:${order.rider.phone}`}
                        className="text-xs font-bold text-brand-green bg-white px-3 py-1 rounded-pill border border-gray-200 shadow-xs"
                      >
                        Call Rider
                      </a>
                    )}
                  </div>
                </div>

                {/* Bill Row */}
                <div className="flex justify-between items-baseline text-xs font-bold px-1">
                  <span className="text-ink-light">Order Bill:</span>
                  <span className="text-sm font-display text-ink">
                    Rs. {(order.totalBill || 0).toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex gap-2">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => setRejectOrder(order)}
                        className="flex-1 min-h-[44px] rounded-pill border border-gray-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors"
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                        className="flex-2 min-h-[44px] rounded-pill text-white font-bold text-xs shadow-xs transition-colors bg-brand-green hover:bg-brand-dark"
                      >
                        {isProcessing ? 'Saving...' : 'Accept & Pack'}
                      </button>
                    </>
                  )}

                  {isPacked && (
                    <div className="w-full bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Pickup Verification OTP for Rider
                      </span>
                      <div className="text-3xl font-mono font-bold tracking-widest text-emerald-950 py-0.5">
                        {order.pickupOtp || '----'}
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-snug">
                        Share this 4-digit OTP with rider {order.rider?.name ? `(${order.rider.name})` : ''} to verify handoff. Delivery starts once rider enters this code.
                      </p>
                    </div>
                  )}
                </div>
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
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeTab === 'pending'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            To Pack ({pendingOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packed')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeTab === 'packed'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            Ready ({packedOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeTab === 'completed'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>
      </nav>

      {/* REJECT MODAL */}
      {rejectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-elevated border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-ink font-display">
                Reject Order #{rejectOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setRejectOrder(null)}
                className="text-ink-lighter hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-light">
              Select reason so the admin can reassign to another store:
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full min-h-[44px] p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-ink focus:bg-white focus:outline-none focus:border-brand-green"
            >
              <option value="Item out of stock">Item out of stock</option>
              <option value="Medicines expired/damaged">Medicines expired/damaged</option>
              <option value="Store closing soon">Store closing soon</option>
              <option value="Other">Other</option>
            </select>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setRejectOrder(null)}
                className="flex-1 min-h-[44px] rounded-pill border border-gray-200 text-ink-light font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(rejectOrder.id, 'REJECTED', rejectReason)}
                className="flex-1 min-h-[44px] rounded-pill bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
