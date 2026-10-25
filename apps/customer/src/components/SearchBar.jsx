import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search as SearchIcon, MapPin, ChevronDown, User, Zap } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { useOrders } from '../lib/useOrders';
import { ACTIVE_STATUS_KEYS } from '../lib/orderStatus';
import { useT } from '../lib/i18n';

/**
 * Phosphor Icons — Bell (Bold weight, 20px)
 */
function PhosphorBellBold({ className = 'w-[20px] h-[20px]' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M225.29,165.93C216.61,151,212,129.57,212,104a84,84,0,0,0-168,0c0,25.58-4.59,47-13.27,61.93A20.08,20.08,0,0,0,30.66,186,19.77,19.77,0,0,0,48,196H84.18a44,44,0,0,0,87.64,0H208a19.77,19.77,0,0,0,17.31-10A20.08,20.08,0,0,0,225.29,165.93ZM128,212a20,20,0,0,1-19.6-16h39.2A20,20,0,0,1,128,212ZM54.66,172c9.39-18.32,13.34-42.6,13.34-68a60,60,0,0,1,120,0c0,25.38,4,49.68,13.34,68Z" />
    </svg>
  );
}

export default function SearchBar({ onOpenSearch, onOpenLocation }) {
  const t = useT();
  const navigate = useNavigate();

  const address = useLocationStore((state) => state.address);
  const villagePo = useLocationStore((state) => state.villagePo);
  const locationFullName = useLocationStore((state) => state.fullName);

  const phone = useUserStore((state) => state.phone);
  const name = useUserStore((state) => state.name);

  const { orders } = useOrders();
  const hasUnreadOrderUpdates =
    Boolean(phone) &&
    Array.isArray(orders) &&
    orders.some((o) => ACTIVE_STATUS_KEYS.includes(o.status));

  const isLoggedIn = Boolean(phone);
  const userInitial = (name || locationFullName || 'M').trim().charAt(0).toUpperCase();
  const displayLocation = villagePo || address || 'Nababpur Paschim para';

  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Smoothly fade and translate the location row out as the header collapses on scroll
  const locationOpacity = useTransform(scrollY, [0, 42], [1, 0], { clamp: true });
  const locationY = useTransform(scrollY, [0, 42], [0, -8], { clamp: true });

  useEffect(() => {
    const onScroll = () => {
      const scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 10;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* 1. Sticky Top Row (height 56px, padding 16px horizontal, safe-area-inset-top respected) */}
      <header
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: isScrolled
            ? 'rgba(0, 56, 32, 0.88)'
            : 'radial-gradient(120% 180% at 50% 0%, #0B4A2A 0%, #003820 100%)',
          backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
        }}
        className={`sticky top-0 z-40 w-full text-white select-none transition-shadow duration-200 ${
          isScrolled ? 'shadow-[0_6px_20px_rgba(0,56,32,0.22)]' : ''
        }`}
      >
        <div className="max-w-md mx-auto h-[56px] px-[16px] grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: 40px round button (44px tap target), lime #C6F26B bg, deep green initial in Poppins 700 or user icon */}
          <button
            type="button"
            onClick={() => navigate('/account')}
            aria-label="Account"
            className="justify-self-start p-[2px] -m-[2px] min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[999px] cursor-pointer touch-manipulation transition-transform duration-150 active:scale-[0.94]"
          >
            <span className="w-[40px] h-[40px] rounded-[999px] bg-[#C6F26B] text-[#003820] flex items-center justify-center">
              {isLoggedIn ? (
                <span className="font-display font-bold text-[16px] leading-none text-[#003820]">
                  {userInitial}
                </span>
              ) : (
                <User className="w-[20px] h-[20px] stroke-[2.4] text-[#003820]" />
              )}
            </span>
          </button>

          {/* Center: "medix." wordmark (always perfectly centered via 1fr auto 1fr grid) */}
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="min-h-[44px] px-2 font-display font-extrabold text-[30px] leading-none tracking-[-0.03em] text-white flex items-center justify-center cursor-pointer touch-manipulation transition-transform duration-150 active:scale-[0.94]"
            aria-label="medix home"
          >
            <span>medix</span>
            <span className="text-[#C6F26B]">.</span>
          </button>

          {/* Right: 40px round button (44px tap target), rgba(255,255,255,0.12) bg, Phosphor Bold 20px Bell + optional 8px lime dot */}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            aria-label="Notifications"
            className="justify-self-end p-[2px] -m-[2px] min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[999px] cursor-pointer touch-manipulation transition-transform duration-150 active:scale-[0.94]"
          >
            <span
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
              className="w-[40px] h-[40px] rounded-[999px] text-white flex items-center justify-center relative"
            >
              <PhosphorBellBold className="w-[20px] h-[20px] text-white" />
              {hasUnreadOrderUpdates && (
                <span className="absolute top-[7px] right-[7px] w-[8px] h-[8px] rounded-[999px] bg-[#C6F26B]" />
              )}
            </span>
          </button>
        </div>
      </header>

      {/* 2. Collapsible Location Row + 50%-Overlapping Search Bar */}
      <div className="w-full pb-4 select-none relative z-30">
        {/* Lower Green Block with 32px bottom radius */}
        <div
          style={{
            background: 'linear-gradient(180deg, #033F24 0%, #003820 100%)',
          }}
          className="w-full text-white px-[16px] pt-1 pb-[34px] rounded-b-[32px]"
        >
          <motion.div
            style={{
              opacity: locationOpacity,
              y: locationY,
            }}
            className="max-w-md mx-auto"
          >
            <button
              type="button"
              onClick={onOpenLocation}
              className="w-full min-h-[44px] flex items-center justify-between gap-2 text-left cursor-pointer touch-manipulation transition-transform duration-150 active:scale-[0.99]"
              aria-label={t('Change delivery location')}
            >
              {/* Left: pin icon + "To: Nababpur Paschim para" + chevron */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                <MapPin className="w-4 h-4 text-[#C6F26B] stroke-[2.4] shrink-0" />
                <span className="text-[14px] text-white/80 font-normal shrink-0">
                  {t('To:')}
                </span>
                <span className="text-[14px] font-bold text-white truncate">
                  {displayLocation}
                </span>
                <ChevronDown className="w-4 h-4 text-[#C6F26B] stroke-[2.4] shrink-0" />
              </div>

              {/* Right: pill with lime 1px outline, bolt icon and "20 min" in lime, 13px, Poppins 600 */}
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-[999px] border border-[#C6F26B] font-display font-semibold text-[13px] leading-none text-[#C6F26B]">
                <Zap className="w-3.5 h-3.5 text-[#C6F26B] fill-[#C6F26B] shrink-0" />
                <span>20 min</span>
              </span>
            </button>
          </motion.div>
        </div>

        {/* Search Bar Overlapping Header Bottom Edge by 50% (height 52px, -mt-[26px]) */}
        <div className="max-w-md mx-auto px-[16px] -mt-[26px] relative z-10">
          <button
            type="button"
            onClick={onOpenSearch}
            style={{
              boxShadow: '0 8px 24px -4px rgba(0, 56, 32, 0.2)',
            }}
            className="w-full h-[52px] bg-white rounded-[999px] px-4 flex items-center gap-3 text-left cursor-pointer touch-manipulation transition-transform duration-150 active:scale-[0.98]"
            aria-label={t('Search medicines and healthcare products')}
          >
            <SearchIcon className="w-5 h-5 text-[#003820] stroke-[2.4] shrink-0" />
            <span className="text-[15px] font-medium text-[#5E6B63] flex-1 truncate">
              {t('Search Dolo 650, Pan 40, fever, cough...')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
