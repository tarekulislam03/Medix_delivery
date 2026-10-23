import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Package, User } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useT } from '../lib/i18n';

const TABS = [
  { path: '/search', label: 'Search', icon: Search },
  { path: '/cart', label: 'Cart', icon: ShoppingBag },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/account', label: 'Account', icon: User },
];

export default function BottomNav({ hideOn = [] }) {
  const t = useT();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const totalCartItems = useCartStore((state) => state.getTotalItems());

  // Hide navbar on designated routes (e.g. /login, /order-success)
  if (hideOn.includes(location.pathname)) {
    return null;
  }

  // Apple-spec spring: critically damped, fast settle without wobble
  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', damping: 28, stiffness: 360 };

  const labelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', damping: 26, stiffness: 340 };

  const badgeTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', damping: 20, stiffness: 400 };

  return (
    <nav
      aria-label={t('Main Navigation')}
      style={{
        paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white/75 backdrop-blur-2xl saturate-[190%] border-t border-white/80 shadow-[0_-4px_24px_-2px_rgba(0,0,0,0.06),0_-1px_0_0_rgba(0,0,0,0.04)] select-none"
    >
      <div className="max-w-md mx-auto px-3.5 py-1.5 flex items-center justify-between gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isBabyCare = location.pathname.startsWith('/baby-care');
          const isActive =
            location.pathname === tab.path || (tab.path === '/search' && isBabyCare);
          const isCart = tab.path === '/cart';

          const activeTextColor =
            isBabyCare && tab.path === '/search' ? 'text-[#BF5B76]' : 'text-emerald-700';

          const pillBg =
            isBabyCare && tab.path === '/search'
              ? 'bg-[#CE6A85]/[0.16] border-[#CE6A85]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(206,106,133,0.16)]'
              : 'bg-emerald-500/[0.12] border-emerald-500/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(16,185,129,0.12)]';

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex-1 h-12 rounded-full flex items-center justify-center relative touch-manipulation min-w-[48px] select-none outline-none group"
            >
              <motion.div
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', damping: 20, stiffness: 450 }}
                className={`w-full h-full rounded-full flex items-center justify-center relative transition-colors duration-150 ${
                  isActive
                    ? activeTextColor
                    : 'text-gray-400 hover:text-gray-700 active:text-gray-900'
                }`}
              >
                {/* Active Apple Glass Capsule Pill */}
                {isActive && (
                  <motion.span
                    layoutId="apple-nav-pill"
                    className={`absolute inset-0 rounded-full border z-0 ${pillBg}`}
                    transition={springTransition}
                  />
                )}

                {/* Tab content: Icon + dynamic label */}
                <div className="relative z-10 flex items-center justify-center px-2">
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-5 h-5 flex-shrink-0 stroke-[2.1]" />

                    {/* Apple System Red Notification Badge */}
                    {isCart && (
                      <AnimatePresence>
                        {totalCartItems > 0 && (
                          <motion.span
                            key={totalCartItems}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={badgeTransition}
                            className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold font-mono rounded-full flex items-center justify-center pointer-events-none leading-none bg-[#ff3b30] text-white shadow-[0_2px_6px_rgba(255,59,48,0.4)] border border-white/80"
                          >
                            {totalCartItems}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Expanding label for active tab */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={labelTransition}
                        className="overflow-hidden whitespace-nowrap text-xs font-semibold pl-1.5 leading-none tracking-tight"
                      >
                        {t(tab.label)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
