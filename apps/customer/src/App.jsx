import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';

// Eagerly import all primary tabs so they load into memory at startup
import Search from './pages/Search';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Login from './pages/Login';
import DeliveryAddress from './pages/DeliveryAddress';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/admin/AdminDashboard';
import RiderDashboard from './pages/rider/RiderDashboard';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';

import { useUserStore } from './store/userStore';
import { useCartStore } from './store/cartStore';

export default function App() {
  const phone = useUserStore((state) => state.phone);
  const loadCartFromDb = useCartStore((state) => state.loadCartFromDb);

  // Restore saved active cart from MongoDB on startup if phone exists
  useEffect(() => {
    if (phone) {
      loadCartFromDb(phone);
    }
  }, [phone, loadCartFromDb]);

  return (
    <Routes>
      <Route path="/" element={<CustomerLayout />}>
        {/* Default route redirects / to /search */}
        <Route index element={<Navigate to="/search" replace />} />
        <Route path="search" element={<Search />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="account" element={<Account />} />
      </Route>

      {/* Dedicated Animated Order Placed Page */}
      <Route path="order-success" element={<OrderSuccess />} />

      {/* Dedicated Sign In / Create Account Page */}
      <Route path="login" element={<Login />} />
      <Route path="auth" element={<Navigate to="/login" replace />} />

      {/* Dedicated Delivery Address Page */}
      <Route path="address" element={<DeliveryAddress />} />
      <Route path="delivery-address" element={<Navigate to="/address" replace />} />
      <Route path="location" element={<Navigate to="/address" replace />} />

      {/* Admin Manual Allocation & Partner Management Panel */}
      <Route path="admin" element={<AdminDashboard />} />

      {/* Simple Rider Delivery Partner Panel */}
      <Route path="rider" element={<RiderDashboard />} />

      {/* Pharmacy Partner Store Fulfillment Panel */}
      <Route path="pharmacy" element={<PharmacyDashboard />} />

      {/* Catch-all redirects unknown paths to /search */}
      <Route path="*" element={<Navigate to="/search" replace />} />
    </Routes>
  );
}
