import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useT } from '../lib/i18n';

export default function CartBar() {
  const t = useT();
  const location = useLocation();
  const isBabyCare = location.pathname.startsWith('/baby-care');
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  // Lock position to stable screen height so opening the virtual keyboard never shifts or moves it
  const [stableHeight, setStableHeight] = useState(null);

  useEffect(() => {
    const updateStableHeight = () => {
      // If user is currently typing/focused in an input, keyboard is open -> freeze position
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);
      if (isInputFocused) return;

      if (typeof window !== 'undefined') {
        setStableHeight(window.innerHeight);
      }
    };

    updateStableHeight();
    window.addEventListener('resize', updateStableHeight);
    window.addEventListener('orientationchange', updateStableHeight);
    return () => {
      window.removeEventListener('resize', updateStableHeight);
      window.removeEventListener('orientationchange', updateStableHeight);
    };
  }, []);

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <div
          style={{
            position: 'fixed',
            top: stableHeight
              ? `calc(${stableHeight}px - 4.85rem - 52px - env(safe-area-inset-bottom, 0px))`
              : 'calc(100svh - 4.85rem - 52px - env(safe-area-inset-bottom, 0px))',
            bottom: 'auto',
          }}
          className="left-0 right-0 z-40 px-4 pointer-events-none select-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="max-w-md mx-auto pointer-events-auto"
          >
            <Link to="/cart" className="block touch-manipulation">
              <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                className={`w-full h-[52px] min-h-[52px] backdrop-blur-xl saturate-[180%] text-white rounded-full px-5 py-3 border border-white/25 flex items-center justify-between font-medium cursor-pointer transition-colors duration-200 ${
                  isBabyCare
                    ? 'bg-[#88304E] hover:bg-[#782943] active:bg-[#682038] shadow-[0_8px_28px_rgba(136,48,78,0.42),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                    : 'bg-emerald-800 hover:bg-emerald-850 active:bg-emerald-900 shadow-[0_8px_28px_rgba(6,95,70,0.38),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold tracking-tight tabular-nums">
                    {t('View Cart')} · {t.num(totalItems)} {t(totalItems === 1 ? 'item' : 'items')} · ₹{t.num(Number(totalPrice || 0).toFixed(2))}
                  </span>
                </div>

                <div className="flex items-center text-white/90">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
