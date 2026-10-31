import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';

// Eagerly import all primary tabs so they load into memory at startup
import Home from './pages/Home';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Login from './pages/Login';
import DeliveryAddress from './pages/DeliveryAddress';
import OrderSuccess from './pages/OrderSuccess';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import RiderDashboard from './pages/rider/RiderDashboard';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';

import { useUserStore } from './store/userStore';
import { useCartStore } from './store/cartStore';
import { useLocationStore } from './store/locationStore';
import { usePWA } from './lib/usePWA';

export default function App() {
  const phone = useUserStore((state) => state.phone);
  const loadCartFromDb = useCartStore((state) => state.loadCartFromDb);
  const fetchAddresses = useLocationStore((state) => state.fetchAddresses);
  const clearAddresses = useLocationStore((state) => state.clearAddresses);

  // Initialize PWA detection & allow browser's in-built install prompt
  usePWA();

  // Restore saved active cart & addresses from MongoDB on startup if phone exists
  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('medix_customer_token'));
    if (phone && hasToken) {
      loadCartFromDb(phone);
      fetchAddresses();
    } else if (!phone) {
      clearAddresses();
    }
  }, [phone, loadCartFromDb, fetchAddresses, clearAddresses]);

  return (
    <Routes>
        <Route path="/" element={<CustomerLayout />}>
          {/* Main Home Screen at / */}
          <Route index element={<Home />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="search" element={<Search />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="account" element={<Account />} />
        </Route>

        {/* Dedicated Animated Order Placed Page */}
        <Route path="order-success" element={<OrderSuccess />} />

        {/* Dedicated Launch & WhatsApp Orders Landing Page */}
        <Route path="landing-page" element={<LandingPage />} />
        <Route path="launch" element={<Navigate to="/landing-page" replace />} />
        <Route path="preorder" element={<Navigate to="/landing-page" replace />} />

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
