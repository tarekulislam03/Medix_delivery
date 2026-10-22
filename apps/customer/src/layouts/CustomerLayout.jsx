import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col antialiased">
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Floating Bottom Navbar */}
      <BottomNav />
    </div>
  );
}
