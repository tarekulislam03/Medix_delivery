import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon, MapPin, ChevronDown, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import LanguageSwitcher from './LanguageSwitcher';
import { useT, useLangStore } from '../lib/i18n';

const CATEGORY_TABS = [
  { id: 'general', label: 'General', path: '/search' },
  { id: 'baby-care', label: 'Baby Care', path: '/baby-care' },
];

export default function SearchBar({ onOpenSearch, onOpenLocation, onOpenSignIn }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useLangStore((state) => state.lang);
  const address = useLocationStore((state) => state.address);
  const villagePo = useLocationStore((state) => state.villagePo);
  const phone = useUserStore((state) => state.phone);
  const name = useUserStore((state) => state.name);

  const activeTab = location.pathname.startsWith('/baby-care') ? 'baby-care' : 'general';
  const isBabyCare = activeTab === 'baby-care';
  const displayLocation = villagePo || address || t('Select location');

  return (
    <header className="w-full bg-white/75 backdrop-blur-2xl saturate-[190%] border-b border-white/80 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.06),0_1px_0_0_rgba(0,0,0,0.04)] select-none">
      {/* Top USP Banner Strip */}
      <div
        style={{
          paddingTop: 'calc(0.35rem + env(safe-area-inset-top, 0px))',
        }}
        className={`w-full text-white px-4 py-2 text-center shadow-xs transition-colors duration-200 ${
          isBabyCare ? 'bg-[#88304E]' : 'bg-emerald-800'
        }`}
      >
        <p className="text-[13px] sm:text-sm font-bold tracking-wide">
          {lang === 'bn' ? (
            <>
              ₹১৫০০ টাকার উপরে অর্ডারে <span className="underline underline-offset-2 font-bold decoration-white/90">১৭% ছাড় পান</span>
            </>
          ) : (
            <>
              Get <span className="underline underline-offset-2 font-bold decoration-white/90">17% Off</span> on above ₹1500
            </>
          )}
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 pt-2.5 pb-3 space-y-2.5">
        {/* Apple Animated Category Switcher (Same sliding pill as bottom bar) */}
        <div className="flex justify-center">
          <div className="relative flex items-center p-1 bg-gray-100/90 rounded-full border border-black/[0.04] w-full max-w-[320px]">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const activeTextColor =
                tab.id === 'baby-care' ? 'text-[#88304E] font-bold' : 'text-emerald-950 font-bold';

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(tab.path)}
                  className={`relative flex-1 h-9 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-semibold transition-colors duration-150 z-10 active:scale-95 touch-manipulation cursor-pointer select-none ${
                    isActive ? activeTextColor : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="apple-top-category-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.04] z-0"
                      transition={{ type: 'spring', damping: 28, stiffness: 360 }}
                    />
                  )}
                  <span className="relative z-10">{t(tab.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Status & Location Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Location button - Native Apple style */}
          <button
            type="button"
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 min-w-0 text-left active:opacity-70 transition-opacity touch-manipulation cursor-pointer group"
            aria-label={t('Change delivery location')}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isBabyCare ? 'bg-[#CE6A85]/15' : 'bg-emerald-500/10'
              }`}
            >
              <MapPin
                className={`w-3.5 h-3.5 transition-colors ${
                  isBabyCare ? 'text-[#BF5B76]' : 'text-emerald-600'
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  {t('Deliver to')}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 transition-colors" />
              </div>
              <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[260px] leading-tight">
                {displayLocation}
              </p>
            </div>
          </button>

          {/* Right Action: User Profile / Sign In */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            {phone ? (
              <button
                type="button"
                onClick={onOpenSignIn}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center text-gray-700 font-bold text-[11px] cursor-pointer"
                title={name || phone}
              >
                {name ? name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSignIn}
                className={`text-xs font-bold underline underline-offset-2 active:opacity-70 transition-opacity cursor-pointer px-1.5 py-1 ${
                  isBabyCare
                    ? 'text-[#BF5B76] hover:text-[#88304E]'
                    : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Apple Glassmorphic Search Bar with Adaptive Dynamic Theme */}
        <div
          onClick={onOpenSearch}
          className={`relative flex items-center h-12 backdrop-blur-2xl saturate-[190%] rounded-2xl px-4 active:scale-[0.985] transition-all duration-150 cursor-pointer touch-manipulation group ${
            isBabyCare
              ? 'bg-[#FDF2F4]/90 hover:bg-[#FBEAEE] active:bg-[#F7DEE4] border border-[#CE6A85]/35 hover:border-[#CE6A85]/55 active:border-[#88304E]/60 shadow-[0_4px_20px_-2px_rgba(206,106,133,0.12),0_1px_2px_0_rgba(0,0,0,0.03),inset_0_1px_1.5px_0_rgba(255,255,255,0.85)]'
              : 'bg-emerald-50/75 hover:bg-emerald-100/70 active:bg-emerald-100/90 border border-emerald-700/30 hover:border-emerald-700/45 active:border-emerald-800/60 shadow-[0_4px_20px_-2px_rgba(5,150,105,0.08),0_1px_2px_0_rgba(0,0,0,0.03),inset_0_1px_1.5px_0_rgba(255,255,255,0.85)]'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenSearch?.();
            }
          }}
          aria-label={t('Search medicines and healthcare products')}
        >
          <SearchIcon
            className={`w-5 h-5 shrink-0 mr-3 stroke-[2.25] transition-colors ${
              isBabyCare ? 'text-[#BF5B76]' : 'text-emerald-700'
            }`}
          />
          <span
            className={`text-[14.5px] sm:text-base font-normal tracking-normal select-none flex-1 truncate transition-colors ${
              isBabyCare ? 'text-[#6E2137]/80' : 'text-emerald-950/75'
            }`}
          >
            {isBabyCare ? t('Search baby diapers, food, care...') : t('Search medicine name here..')}
          </span>
        </div>
      </div>
    </header>
  );
}
