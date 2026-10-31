import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Search as SearchIcon, MapPin, ChevronDown, ShoppingCart, Zap } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { useCartStore } from '../store/cartStore';
import { useT } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

const ROTATING_WORDS = ['product', 'medicine', 'category'];

export default function SearchBar({ onOpenSearch, onOpenLocation }) {
  const t = useT();
  const navigate = useNavigate();

  const address = useLocationStore((state) => state.address);
  const villagePo = useLocationStore((state) => state.villagePo);

  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const displayLocation = villagePo || address || t('No address added');

  const [isScrolled, setIsScrolled] = useState(false);

  // Rotating placeholder word: product -> medicine -> category -> product ...
  const reduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);
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
      {/* 1. Sticky Top Row: Logo on Left, Language Changer & Account on Right */}
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
        <div className="max-w-md mx-auto h-[56px] px-[16px] flex items-center justify-between gap-3">
          {/* Left: "medix." Logo Wordmark */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-display font-extrabold text-[28px] sm:text-[30px] leading-none tracking-[-0.03em] text-white flex items-center cursor-pointer touch-manipulation transition-transform duration-150 active:scale-[0.96]"
            aria-label="medix home"
          >
            <span>medix</span>
            <span className="text-[#C6F26B]">.</span>
          </button>

          {/* Right: Language Changer & Cart Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher variant="dark" />

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label={t('View Cart')}
              className="p-[2px] -m-[2px] min-w-[42px] min-h-[42px] inline-flex items-center justify-center rounded-[999px] cursor-pointer touch-manipulation transition-transform duration-150 active:scale-[0.94]"
            >
              <span className="w-[38px] h-[38px] rounded-[999px] bg-white/12 text-white flex items-center justify-center relative shadow-xs">
                <ShoppingCart className="w-[19px] h-[19px] stroke-[2.2] text-white" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C6F26B] text-[#003820] text-[11px] font-bold font-mono flex items-center justify-center shadow-xs">
                    {totalCartItems}
                  </span>
                )}
              </span>
            </button>
          </div>
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

              {/* Right: pill with lime 1px outline, bolt icon and "24 hrs" in lime, 13px, Poppins 600 */}
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-[999px] border border-[#C6F26B] font-display font-semibold text-[13px] leading-none text-[#C6F26B]">
                <Zap className="w-3.5 h-3.5 text-[#C6F26B] fill-[#C6F26B] shrink-0" />
                <span>24 hrs</span>
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
            <span className="text-[15px] font-medium text-[#5E6B63] flex-1 flex items-center gap-1 overflow-hidden whitespace-nowrap">
              <span>{t('Search the')}</span>
              <span className="relative inline-block h-[22px] overflow-hidden align-middle">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={ROTATING_WORDS[wordIndex]}
                    initial={reduceMotion ? { opacity: 0 } : { y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { y: -18, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block leading-[22px] text-[#003820] font-semibold"
                  >
                    {t(ROTATING_WORDS[wordIndex])}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
