import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Package, User } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

const TABS = [
  { path: '/search', label: 'Search', icon: Search },
  { path: '/cart', label: 'Cart', icon: ShoppingBag },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/account', label: 'Account', icon: User },
];

export default function BottomNav({ hideOn = [] }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const totalCartItems = useCartStore((state) => state.getTotalItems());

  // Hide navbar on designated routes
  if (hideOn.includes(location.pathname)) {
    return null;
  }

  // Spring transition: fast and smooth with no overshoot wobble
  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 500, damping: 36 };

  const labelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' };

  const badgeTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: 'easeOut' };

  return (
    <nav
      aria-label="Bottom Navigation"
      style={{
        paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)]"
    >
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-between">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const isCart = tab.path === '/cart';

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex-1 h-12 rounded-pill flex items-center justify-center relative touch-manipulation min-w-[44px] select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`w-full h-full rounded-pill flex items-center justify-center relative transition-colors duration-150 ${
                  !isActive
                    ? 'text-gray-500 [@media(hover:hover)]:hover:text-brand-green [@media(hover:hover)]:hover:bg-brand-light/70'
                    : 'text-white'
                }`}
              >
                {/* Active sliding indicator pill in brand green */}
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-brand-green rounded-pill shadow-sm z-0"
                    transition={springTransition}
                  />
                )}

                {/* Tab content: icon + animated label */}
                <div className="relative z-10 flex items-center justify-center px-2">
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-5 h-5 flex-shrink-0" />

                    {/* Red cart counter badge */}
                    {isCart && (
                      <AnimatePresence>
                        {totalCartItems > 0 && (
                          <motion.span
                            key={totalCartItems}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={badgeTransition}
                            className={`absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none leading-none shadow-sm ${
                              isActive
                                ? 'bg-white text-brand-dark'
                                : 'bg-red-500 text-white'
                            }`}
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
                        className="overflow-hidden whitespace-nowrap text-xs font-semibold pl-1.5 leading-none"
                      >
                        {tab.label}
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
