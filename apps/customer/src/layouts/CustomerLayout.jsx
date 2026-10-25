import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function CustomerLayout() {
  const location = useLocation();
  const hideOn = ['/order-success', '/login', '/address'];
  const shouldHideBars = hideOn.includes(location.pathname);

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] bg-[#F7F4EC] text-[#0E1A14] flex flex-col antialiased selection:bg-[#C6F26B] selection:text-[#003820]">
      <main
        style={{
          paddingBottom: !shouldHideBars
            ? 'calc(4.5rem + env(safe-area-inset-bottom, 0px))'
            : '0px',
        }}
        className="flex-1 w-full min-w-0"
      >
        <Outlet />
      </main>

      {!shouldHideBars && <BottomNav hideOn={hideOn} />}
    </div>
  );
}
