import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';

// Eagerly import all primary tabs so they load into memory at startup
import Search from './pages/Search';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Account from './pages/Account';
import OrderSuccess from './pages/OrderSuccess';

export default function App() {
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

      {/* Catch-all redirects unknown paths to /search */}
      <Route path="*" element={<Navigate to="/search" replace />} />
    </Routes>
  );
}
