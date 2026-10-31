import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';
import { useScrollState } from '../lib/useScrollPosition';

export default function CartBar() {
  const t = useT();
  const location = useLocation();
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const medicinesCount = items.length;

  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isSearchPage = location.pathname === '/search';
  const isScrolled = useScrollState(24);

  // If on Search page OR on Home page when scrolled, View Cart moves to the bottom place
  const isAtBottomPlace = isSearchPage || (isHome && isScrolled);

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <>
          {/* Blurred gradient background scrim when View Cart is at the bottom place */}
          <motion.div
            initial={false}
            animate={{ opacity: isAtBottomPlace ? 1 : 0 }}
            transition={{ duration: 0.22 }}
            aria-hidden="true"
            style={{
              height: 'calc(5.8rem + env(safe-area-inset-bottom, 0px))',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%)',
            }}
            className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none select-none backdrop-blur-lg bg-gradient-to-t from-[#F7F4EC]/95 via-[#F7F4EC]/75 to-transparent"
          />

          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{
              y: isAtBottomPlace ? 0 : -78,
              opacity: 1,
            }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
            }}
            className="fixed left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none select-none"
          >
            <div className="max-w-md mx-auto pointer-events-auto">
              <Link
                to="/cart"
                className="block touch-manipulation transition-transform duration-150 active:scale-[0.97]"
              >
                <div
                  style={{
                    boxShadow: '0 14px 34px -6px rgba(0, 56, 32, 0.32)',
                  }}
                  className="w-full min-h-[60px] bg-[#003820] text-white rounded-[999px] pl-5 pr-2.5 py-2 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-white/80 leading-tight truncate tabular-nums">
                      {t.num(totalItems)} {totalItems === 1 ? t('item') : t('items')} · {t.num(medicinesCount)}{' '}
                      {medicinesCount === 1 ? t('medicine') : t('medicines')}
                    </p>
                    <p className="font-display font-bold text-[20px] text-white leading-tight tracking-[-0.02em] tabular-nums">
                      {formatPrice(Math.round(totalPrice))}
                    </p>
                  </div>

                  <div className="min-h-[44px] px-4 rounded-[999px] bg-[#C6F26B] text-[#0E1A14] font-display font-bold text-[15px] tracking-[-0.02em] flex items-center gap-1.5 shrink-0">
                    <span>{t('View Cart')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
