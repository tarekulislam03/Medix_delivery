import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('medix_admin_auth') === 'true';
  });
  const [pinError, setPinError] = useState('');

  // Nav tabs: 'orders' | 'pharmacies' | 'riders'
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [pharmacies, setPharmacies] = useState([]);
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Allocation Modal (Admin selects Store and Rider, no status dropdown)
  const [allocatingOrder, setAllocatingOrder] = useState(null);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Partner / Rider Modals
  const [showAddPharmacy, setShowAddPharmacy] = useState(false);
  const [newPharmacy, setNewPharmacy] = useState({ name: '', phone: '', address: '', area: '', password: '' });
  const [showAddRider, setShowAddRider] = useState(false);
  const [newRider, setNewRider] = useState({ name: '', phone: '', vehicleNumber: '', password: '' });

  // Reset Password Modal
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Verify PIN
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    try {
      const res = await api.post('/admin/verify-pin', { pin });
      if (res.data?.success) {
        localStorage.setItem('medix_admin_auth', 'true');
        setIsAuthenticated(true);
      }
    } catch (err) {
      setPinError('Invalid passcode. Default PIN is 1234');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medix_admin_auth');
    setIsAuthenticated(false);
    setPin('');
  };

  // Fetch data
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [ordersRes, pharmaciesRes, ridersRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/pharmacies'),
        api.get('/admin/riders'),
      ]);

      if (ordersRes.data?.success) {
        setOrders(ordersRes.data.orders || []);
        setCounts(ordersRes.data.counts || {});
      }
      if (pharmaciesRes.data?.success) {
        setPharmacies(pharmaciesRes.data.pharmacies || []);
      }
      if (ridersRes.data?.success) {
        setRiders(ridersRes.data.riders || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  // Open Allocation (Select Store & Rider)
  const openAllocation = (order) => {
    setAllocatingOrder(order);
    const existingPharma = pharmacies.find((p) => p.name === order.pharmacy?.name);
    setSelectedPharmacyId(existingPharma ? existingPharma._id : pharmacies[0]?._id || '');

    const existingRider = riders.find((r) => r.name === order.rider?.name);
    setSelectedRiderId(existingRider ? existingRider._id : riders[0]?._id || '');
  };

  // Save Allocation - Assign Store & Rider; Status automatically sets to CONFIRMED for store to confirm & pack
  const handleSaveAllocation = async () => {
    if (!allocatingOrder || !selectedPharmacyId) return;
    setIsSubmitting(true);
    try {
      const pharmacyObj = pharmacies.find((p) => p._id === selectedPharmacyId);
      const riderObj = riders.find((r) => r._id === selectedRiderId);

      await api.put(`/admin/orders/${allocatingOrder.id}/allocate`, {
        pharmacy: pharmacyObj
          ? { name: pharmacyObj.name, address: pharmacyObj.address, phone: pharmacyObj.phone }
          : null,
        rider: riderObj
          ? { name: riderObj.name, phone: riderObj.phone, vehicleNumber: riderObj.vehicleNumber }
          : null,
        status: 'CONFIRMED',
      });

      setAllocatingOrder(null);
      await fetchData();
    } catch (err) {
      alert('Error assigning order: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Pharmacy
  const handleAddPharmacy = async (e) => {
    e.preventDefault();
    if (!newPharmacy.name || !newPharmacy.address || !newPharmacy.phone) return;
    try {
      await api.post('/admin/pharmacies', newPharmacy);
      setNewPharmacy({ name: '', phone: '', address: '', area: '', password: '' });
      setShowAddPharmacy(false);
      await fetchData();
    } catch (err) {
      alert('Error adding pharmacy: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete Pharmacy
  const handleDeletePharmacy = async (id) => {
    if (!confirm('Remove this pharmacy partner?')) return;
    try {
      await api.delete(`/admin/pharmacies/${id}`);
      await fetchData();
    } catch (err) {
      alert('Error deleting pharmacy');
    }
  };

  // Add Rider
  const handleAddRider = async (e) => {
    e.preventDefault();
    if (!newRider.name || !newRider.phone) return;
    try {
      await api.post('/admin/riders', newRider);
      setNewRider({ name: '', phone: '', vehicleNumber: '', password: '' });
      setShowAddRider(false);
      await fetchData();
    } catch (err) {
      alert('Error adding rider: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete Rider
  const handleDeleteRider = async (id) => {
    if (!confirm('Remove this delivery rider?')) return;
    try {
      await api.delete(`/admin/riders/${id}`);
      await fetchData();
    } catch (err) {
      alert('Error deleting rider');
    }
  };

  // Reset Password for Pharmacy or Rider
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordModal || !newPasswordInput) return;
    try {
      const endpoint =
        resetPasswordModal.type === 'pharmacy'
          ? `/admin/pharmacies/${resetPasswordModal.id}/password`
          : `/admin/riders/${resetPasswordModal.id}/password`;

      await api.put(endpoint, { password: newPasswordInput });
      alert(`Password updated successfully for ${resetPasswordModal.name}`);
      setResetPasswordModal(null);
      setNewPasswordInput('');
    } catch (err) {
      alert('Error resetting password: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.address.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'unallocated') {
      return ['SEARCHING', 'PLACED'].includes(o.status) && !o.pharmacy;
    }
    if (statusFilter === 'active') {
      return ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status);
    }
    if (statusFilter === 'delivered') return o.status === 'DELIVERED';
    if (statusFilter === 'cancelled') return o.status === 'CANCELLED';
    return true;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-card border border-gray-100 p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-ink font-display">Medix Admin Portal</h1>
            <p className="text-xs text-ink-light mt-1.5">Enter passcode to access control center</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Admin Passcode</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN (default 1234)"
                className="w-full min-h-[46px] px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:outline-none focus:border-brand-green"
                autoFocus
              />
              {pinError && <p className="text-xs text-red-500 font-medium mt-1.5">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] bg-brand-green hover:bg-brand-dark text-white font-bold text-xs sm:text-sm rounded-pill shadow-xs transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-screen bg-white md:bg-gray-50/50 md:pb-12"
    >
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-xl sm:text-2xl font-bold text-ink font-display">
              {activeTab === 'orders'
                ? 'Store & Rider Assignment'
                : activeTab === 'pharmacies'
                ? 'Partner Stores'
                : 'Delivery Fleet'}
            </h1>
          </div>
          <p className="text-xs text-ink-light mt-0.5">Medix Control Center · Order Allocation & Dispatch</p>
        </div>

        {/* Desktop Tab Switcher */}
        <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-pill gap-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-pill text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink hover:bg-gray-200'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pharmacies')}
            className={`px-4 py-2 rounded-pill text-xs font-bold transition-all ${
              activeTab === 'pharmacies'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink hover:bg-gray-200'
            }`}
          >
            Stores ({pharmacies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riders')}
            className={`px-4 py-2 rounded-pill text-xs font-bold transition-all ${
              activeTab === 'riders'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink hover:bg-gray-200'
            }`}
          >
            Fleet ({riders.length})
          </button>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="text-xs font-bold text-brand-green bg-brand-light hover:bg-emerald-100 px-3.5 py-2 rounded-pill transition-colors flex items-center gap-1.5"
          >
            {isLoading ? 'Updating...' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-ink-lighter hover:text-red-600 px-3 py-2 transition-colors rounded-pill hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Metrics Overview Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
        <div
          onClick={() => { setActiveTab('orders'); setStatusFilter('all'); }}
          className="bg-white rounded-card p-3.5 border border-gray-100 shadow-card cursor-pointer hover:border-gray-200 transition-all"
        >
          <span className="text-[11px] font-medium text-ink-light block">Total Orders</span>
          <span className="text-xl md:text-2xl font-bold text-ink mt-0.5 block">{orders.length}</span>
        </div>
        <div
          onClick={() => { setActiveTab('orders'); setStatusFilter('unallocated'); }}
          className={`rounded-card p-3.5 border shadow-card cursor-pointer transition-all ${
            (counts.unallocated || 0) > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-gray-100'
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-800 block">Needs Store Assignment</span>
          <span className="text-xl md:text-2xl font-bold text-amber-700 mt-0.5 block">{counts.unallocated || 0}</span>
        </div>
        <div
          onClick={() => { setActiveTab('pharmacies'); }}
          className="bg-white rounded-card p-3.5 border border-gray-100 shadow-card cursor-pointer hover:border-gray-200 transition-all"
        >
          <span className="text-[11px] font-medium text-ink-light block">Partner Chemist Stores</span>
          <span className="text-xl md:text-2xl font-bold text-brand-green mt-0.5 block">{pharmacies.length}</span>
        </div>
        <div
          onClick={() => { setActiveTab('riders'); }}
          className="bg-white rounded-card p-3.5 border border-gray-100 shadow-card cursor-pointer hover:border-gray-200 transition-all"
        >
          <span className="text-[11px] font-medium text-ink-light block">Delivery Fleet</span>
          <span className="text-xl md:text-2xl font-bold text-ink mt-0.5 block">{riders.length}</span>
        </div>
      </div>

      {/* TAB 1: ORDERS & ASSIGNMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search & Filters Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, customer name, phone, or village..."
                className="w-full min-h-[42px] px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-green"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 text-xs">
              {[
                { key: 'all', label: `All (${orders.length})` },
                { key: 'unallocated', label: `Needs Store (${counts.unallocated || 0})` },
                { key: 'active', label: 'In Progress' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === f.key
                      ? 'bg-ink text-white'
                      : 'bg-gray-100 text-ink-light hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-card border border-gray-100 p-12 text-center text-ink-lighter">
              <p className="font-semibold text-sm text-ink-light">No orders match the selected filter</p>
              <p className="text-xs text-ink-lighter mt-1">Try clearing your search query or changing status filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const isUnallocated =
                  ['SEARCHING', 'PLACED'].includes(order.status) && !order.pharmacy;

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-card shadow-card border p-4 flex flex-col justify-between space-y-3 transition-all ${
                      isUnallocated ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Line: Order ID, Time, and Read-Only Status Badge (NO manual status dropdown) */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-ink font-display">#{order.id}</span>
                          <span className="text-[11px] text-ink-light ml-1.5">
                            · {new Date(order.placedAt).toLocaleTimeString('en-IN', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border ${
                            isUnallocated
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : order.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : order.status === 'PACKED'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : order.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-ink-light border-gray-200'
                          }`}
                        >
                          {isUnallocated
                            ? 'Needs Store'
                            : order.status === 'CONFIRMED'
                            ? 'Pending Store Confirmation'
                            : order.status === 'PACKED'
                            ? 'Packed · Assigned to Rider'
                            : order.status === 'OUT_FOR_DELIVERY'
                            ? 'Out for Delivery'
                            : order.status === 'DELIVERED'
                            ? 'Delivered'
                            : order.status}
                        </span>
                      </div>

                      {/* Store Decline Notice if store previously declined */}
                      {order.cancellationReason && isUnallocated && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-xl font-medium">
                          <span className="font-bold block">Notice from store:</span>
                          {order.cancellationReason}
                        </div>
                      )}

                      {/* Customer & Address Details */}
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-ink">
                          {order.customerName}{' '}
                          <span className="font-normal text-ink-light font-mono">({order.customerPhone})</span>
                        </p>
                        <p className="text-ink-light leading-relaxed">{order.address}</p>
                        {order.rawAddress?.landmark && (
                          <p className="text-[11px] text-gray-400">Near: {order.rawAddress.landmark}</p>
                        )}
                      </div>

                      {/* Items and Bill */}
                      <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="text-ink font-medium leading-relaxed">
                          {(order.items || []).map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                        <div className="flex justify-between items-baseline pt-1.5 border-t border-gray-200 text-xs">
                          <span className="text-ink-light">Total (COD):</span>
                          <strong className="font-bold text-ink text-sm">
                            Rs. {(order.bill?.total || 0).toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      {/* Store & Rider Allocation Status */}
                      <div className="space-y-1.5 text-xs bg-surface-subtle p-2.5 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-ink-light">Assigned Store:</span>
                          <span className={`font-semibold ${order.pharmacy ? 'text-brand-green' : 'text-amber-600'}`}>
                            {order.pharmacy ? order.pharmacy.name : 'Not Assigned'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-ink-light">Assigned Rider:</span>
                          <span className={`font-semibold ${order.rider ? 'text-ink' : 'text-gray-400'}`}>
                            {order.rider ? `${order.rider.name} (${order.rider.phone})` : 'Unassigned'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 text-[11px]">
                          <span className="text-ink-light">Store Status:</span>
                          <span className="font-medium text-ink">
                            {!order.pharmacy
                              ? 'Awaiting Store'
                              : order.status === 'CONFIRMED'
                              ? 'Awaiting Store Confirmation'
                              : order.status === 'PACKED'
                              ? 'Confirmed & Packed'
                              : 'Fulfilled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Assign Store & Rider */}
                    <button
                      type="button"
                      onClick={() => openAllocation(order)}
                      className={`w-full min-h-[42px] rounded-pill font-bold text-xs transition-colors shadow-xs mt-2 ${
                        isUnallocated
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-brand-green hover:bg-brand-dark text-white'
                      }`}
                    >
                      {isUnallocated ? 'Assign Store & Rider' : 'Reassign Store & Rider'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PARTNER PHARMACIES */}
      {activeTab === 'pharmacies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-ink">Partner Chemist Network ({pharmacies.length})</h2>
              <p className="text-xs text-ink-light">Manage connected pharmacies that prepare and pack orders</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPharmacy(true)}
              className="min-h-[42px] px-5 bg-brand-green hover:bg-brand-dark text-white font-bold text-xs rounded-pill shadow-xs transition-colors"
            >
              + Add Partner Store
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacies.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-card shadow-card border border-gray-100 p-4 flex flex-col justify-between space-y-3 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-ink">{p.name}</h3>
                      {p.area && (
                        <span className="text-[10px] font-semibold text-brand-green bg-brand-light px-2 py-0.5 rounded-full mt-1 inline-block">
                          {p.area}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-ink-light leading-relaxed">{p.address}</p>
                  {p.phone && <p className="text-ink font-mono font-medium">Phone: {p.phone}</p>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setResetPasswordModal({ type: 'pharmacy', id: p._id, name: p.name });
                      setNewPasswordInput('');
                    }}
                    className="text-xs text-brand-green font-semibold hover:underline"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePharmacy(p._id)}
                    className="text-xs text-red-600 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY FLEET */}
      {activeTab === 'riders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-ink">Delivery Fleet ({riders.length})</h2>
              <p className="text-xs text-ink-light">Manage field riders delivering orders to customer doorsteps</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddRider(true)}
              className="min-h-[42px] px-5 bg-brand-green hover:bg-brand-dark text-white font-bold text-xs rounded-pill shadow-xs transition-colors"
            >
              + Add Delivery Rider
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riders.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-card shadow-card border border-gray-100 p-4 flex flex-col justify-between space-y-3 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-ink">{r.name}</h3>
                      {r.vehicleNumber && (
                        <span className="text-[10px] font-mono text-ink-light bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {r.vehicleNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-ink font-mono font-medium">Phone: {r.phone}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setResetPasswordModal({ type: 'rider', id: r._id, name: r.name });
                      setNewPasswordInput('');
                    }}
                    className="text-xs text-brand-green font-semibold hover:underline"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRider(r._id)}
                    className="text-xs text-red-600 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile-Only Bottom Navigation Bar */}
      <nav
        style={{
          paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
        }}
        className="md:hidden fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeTab === 'orders'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            Orders ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pharmacies')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeTab === 'pharmacies'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            Stores ({pharmacies.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riders')}
            className={`flex-1 py-2 text-center rounded-pill text-xs font-bold transition-colors ${
              activeTab === 'riders'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-ink-light hover:text-ink'
            }`}
          >
            Fleet ({riders.length})
          </button>
        </div>
      </nav>

      {/* ASSIGN STORE & RIDER MODAL (No status dropdown) */}
      {allocatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-elevated border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-ink font-display">
                Assign Order #{allocatingOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setAllocatingOrder(null)}
                className="text-ink-lighter hover:text-ink font-bold text-sm px-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-ink-light text-[10px] uppercase block">Customer Delivery Address:</span>
              <p className="font-semibold text-ink">{allocatingOrder.customerName} ({allocatingOrder.customerPhone})</p>
              <p className="text-ink-light">{allocatingOrder.address}</p>
            </div>

            {/* Select Store */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-ink block">Select Partner Store:</label>
              <select
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                className="w-full min-h-[46px] p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-ink focus:bg-white focus:outline-none focus:border-brand-green"
              >
                <option value="">-- Choose Partner Store --</option>
                {pharmacies.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.area ? `(${p.area})` : ''} — {p.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Rider */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-ink block">Select Delivery Rider:</label>
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="w-full min-h-[46px] p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-ink focus:bg-white focus:outline-none focus:border-brand-green"
              >
                <option value="">-- Unassigned (Rider will claim) --</option>
                {riders.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.phone}) {r.vehicleNumber ? `[${r.vehicleNumber}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-ink-light leading-relaxed bg-brand-light/60 p-2.5 rounded-xl border border-brand-green/20">
              The assigned store will receive this order to <strong>Confirm & Pack</strong>. Once confirmed & packed, it will be assigned to the rider for doorstep delivery.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setAllocatingOrder(null)}
                className="flex-1 min-h-[44px] rounded-pill border border-gray-200 text-ink-light font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !selectedPharmacyId}
                onClick={handleSaveAllocation}
                className="flex-1 min-h-[44px] rounded-pill bg-brand-green hover:bg-brand-dark text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PHARMACY MODAL */}
      {showAddPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-elevated border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-ink font-display">Add Partner Store</h3>
              <button
                type="button"
                onClick={() => setShowAddPharmacy(false)}
                className="text-ink-lighter hover:text-ink font-bold text-sm px-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPharmacy} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={newPharmacy.name}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
                  placeholder="e.g. Care Chemist & Druggist"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Contact Phone (10-digit mobile) *</label>
                <input
                  type="tel"
                  required
                  value={newPharmacy.phone}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, phone: e.target.value })}
                  placeholder="e.g. 9830778899"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Full Street Address *</label>
                <input
                  type="text"
                  required
                  value={newPharmacy.address}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, address: e.target.value })}
                  placeholder="e.g. Main Market, Nawabpur - 712701"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Service Area / Town</label>
                <input
                  type="text"
                  value={newPharmacy.area}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, area: e.target.value })}
                  placeholder="e.g. Nawabpur / Chanditala"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Portal Password (hashed on save)</label>
                <input
                  type="text"
                  value={newPharmacy.password}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, password: e.target.value })}
                  placeholder="Password (default is 123456)"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPharmacy(false)}
                  className="flex-1 min-h-[44px] rounded-pill border border-gray-200 text-ink-light font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-pill bg-brand-green hover:bg-brand-dark text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD RIDER MODAL */}
      {showAddRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-elevated border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-ink font-display">Add Delivery Rider</h3>
              <button
                type="button"
                onClick={() => setShowAddRider(false)}
                className="text-ink-lighter hover:text-ink font-bold text-sm px-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRider} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={newRider.name}
                  onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                  placeholder="e.g. Rahul Sen"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Contact Phone (10-digit mobile) *</label>
                <input
                  type="tel"
                  required
                  value={newRider.phone}
                  onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                  placeholder="e.g. 9876500001"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Vehicle / Bike Number</label>
                <input
                  type="text"
                  value={newRider.vehicleNumber}
                  onChange={(e) => setNewRider({ ...newRider, vehicleNumber: e.target.value })}
                  placeholder="e.g. WB-16-AB-1234"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Portal Password (hashed on save)</label>
                <input
                  type="text"
                  value={newRider.password}
                  onChange={(e) => setNewRider({ ...newRider, password: e.target.value })}
                  placeholder="Password (default is 123456)"
                  className="w-full min-h-[42px] px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRider(false)}
                  className="flex-1 min-h-[44px] rounded-pill border border-gray-200 text-ink-light font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-pill bg-brand-green hover:bg-brand-dark text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Save Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-elevated border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-ink font-display">
                Change Password for {resetPasswordModal.name}
              </h3>
              <button
                type="button"
                onClick={() => setResetPasswordModal(null)}
                className="text-ink-lighter hover:text-ink font-bold text-sm px-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (will be hashed)"
                  className="w-full min-h-[44px] px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:border-brand-green"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordModal(null)}
                  className="flex-1 min-h-[44px] rounded-pill border border-gray-200 text-ink-light font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-pill bg-brand-green hover:bg-brand-dark text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
