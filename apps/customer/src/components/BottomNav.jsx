import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Phone, User, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '../lib/i18n';
import { useScrollState } from '../lib/useScrollPosition';
import { useUiStore } from '../store/uiStore';

export default function BottomNav({ hideOn = [] }) {
  const t = useT();
  const location = useLocation();

  if (hideOn.includes(location.pathname)) {
    return null;
  }

  const isBottomNavHidden = useUiStore((state) => state.isBottomNavHidden);
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isScrolled = useScrollState(24);
  const shouldHide = (isHome && isScrolled) || isBottomNavHidden;

  const haptic = (ms = 8) => {
    try {
      navigator.vibrate?.(ms);
    } catch {}
  };

  return (
    <>
      {/* Blurred gradient scrim below the bottom bar */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: shouldHide ? 0 : 1 }}
        transition={{ duration: 0.22 }}
        style={{
          height: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%)',
        }}
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none select-none backdrop-blur-lg bg-gradient-to-t from-[#F7F4EC]/95 via-[#F7F4EC]/75 to-transparent"
      />

      <motion.nav
        aria-label="Bottom Navigation Bar"
        initial={false}
        animate={{
          y: shouldHide ? 80 : 0,
          opacity: shouldHide ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        style={{
          bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
          pointerEvents: shouldHide ? 'none' : undefined,
        }}
        className="fixed left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none select-none"
      >
      <div className="max-w-md mx-auto pointer-events-auto flex items-center gap-2">
        {/* Left Wide Container: Order on Call & Send Prescription */}
        <div
          style={{
            boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
          className="flex-1 h-[62px] bg-white rounded-full border border-[#0E1A14]/8 flex items-center justify-evenly px-1 sm:px-2"
        >
          {/* Order on Call Button */}
          <a
            href="tel:+918918237582"
            draggable={false}
            onClick={() => haptic(8)}
            className="flex-1 h-[52px] flex flex-col items-center justify-center rounded-full touch-manipulation active:scale-[0.96] transition-transform select-none hover:bg-neutral-50"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Phone className="w-[18px] h-[18px] text-[#003820] stroke-[2.4]" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-bold text-[#0E1A14] mt-0.5 leading-none tracking-tight whitespace-nowrap">
              {t('Order on Call')}
            </span>
          </a>

          {/* Hairline Divider */}
          <div className="w-[1px] h-6 bg-[#0E1A14]/8 shrink-0" />

          {/* Send Prescription / WhatsApp Chat Button */}
          <a
            href="https://wa.me/918918237582?text=Hi%20Medix%2C%20I%20want%20to%20send%20my%20prescription%20to%20order%20medicines"
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onClick={() => haptic(8)}
            className="flex-1 h-[52px] flex flex-col items-center justify-center rounded-full touch-manipulation active:scale-[0.96] transition-transform select-none hover:bg-neutral-50"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[18px] h-[18px] text-[#25D366] shrink-0"
                aria-hidden="true"
              >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 12.99 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.48 11.14 9.6 11.01 9.73 10.89C9.84 10.78 9.98 10.6 10.1 10.45C10.22 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.6C10.27 9.48 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.35 9.01 7.34C8.86 7.33 8.7 7.33 8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.93 7.9 12.11 8.02 12.27C8.15 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.54C14.25 16.73 14.79 16.7 15.22 16.64C15.7 16.57 16.69 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99Z" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-[12px] font-bold text-[#0E1A14] mt-0.5 leading-none tracking-tight whitespace-nowrap">
              {t('Send Prescription')}
            </span>
          </a>
        </div>

        {/* Right Pill: Toggle between Account & Home based on current route */}
        <Link
          to={isHome ? '/account' : '/'}
          draggable={false}
          onClick={() => haptic(8)}
          style={{
            boxShadow: '0 10px 30px -4px rgba(0, 56, 32, 0.35), 0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
          className={`h-[62px] px-3.5 sm:px-4 min-w-[72px] sm:min-w-[80px] rounded-full bg-[#003820] text-white flex flex-col items-center justify-center touch-manipulation active:scale-[0.96] transition-all shrink-0 border ${
            !isHome ? 'border-[#C6F26B]/50' : 'border-white/10'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            {isHome ? (
              <User className="w-[19px] h-[19px] stroke-[2.3] text-[#C6F26B]" />
            ) : (
              <Home className="w-[19px] h-[19px] stroke-[2.3] text-[#C6F26B]" />
            )}
          </div>
          <span className="text-[11px] sm:text-[12px] font-bold text-white mt-0.5 leading-none tracking-tight whitespace-nowrap">
            {isHome ? t('Account') : t('Home')}
          </span>
        </Link>
      </div>
    </motion.nav>
  </>);
}
