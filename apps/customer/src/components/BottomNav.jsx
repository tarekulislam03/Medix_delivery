import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MagnifyingGlass,
  ShoppingBag,
  Package,
  User,
} from '@phosphor-icons/react';
import { useCartStore } from '../store/cartStore';
import { useOrders } from '../lib/useOrders';
import { ACTIVE_STATUS_KEYS } from '../lib/orderStatus';
import { MOCK_ACTIVE_ORDERS } from '../lib/medixMockData';
import { useT } from '../lib/i18n';

const TABS = [
  { path: '/search', label: 'Search', icon: MagnifyingGlass },
  { path: '/cart', label: 'Cart', icon: ShoppingBag },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/account', label: 'Account', icon: User },
];

export default function BottomNav({ hideOn = [] }) {
  const t = useT();
  const location = useLocation();
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const { orders: apiOrders = [] } = useOrders();

  const effectiveOrders =
    apiOrders && apiOrders.length > 0 ? apiOrders : MOCK_ACTIVE_ORDERS;
  const hasActiveOrder = effectiveOrders.some((o) =>
    ACTIVE_STATUS_KEYS.includes(o.status)
  );

  if (hideOn.includes(location.pathname)) {
    return null;
  }

  return (
    <nav
      aria-label={t('Main Navigation')}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 24px rgba(14, 26, 20, 0.06)',
      }}
      className="fixed bottom-0 left-0 right-0 w-full z-50 apple-material border-t border-white/60 select-none"
    >
      <div className="max-w-md mx-auto h-[64px] px-3 flex items-stretch justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.path ||
            (tab.path === '/search' && location.pathname === '/');
          const isCart = tab.path === '/cart';
          const isOrders = tab.path === '/orders';

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 relative touch-manipulation select-none outline-none transition-transform duration-150 active:scale-[0.95] ${
                isActive ? 'text-[#003820]' : 'text-[#5E6B63]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon weight="bold" className="w-[22px] h-[22px]" />

                {/* Subtle lime dot on Orders tab when an order is active (not a number) */}
                {isOrders && hasActiveOrder && (
                  <span
                    aria-label="Active order in progress"
                    className="absolute -top-0.5 -right-1.5 w-2.5 h-2.5 rounded-[999px] bg-[#C6F26B] ring-2 ring-white"
                  />
                )}

                {/* Subtle lime dot when cart has items — no heavy badge */}
                {isCart && totalCartItems > 0 && !isActive && (
                  <span className="absolute -top-0.5 -right-1.5 w-2.5 h-2.5 rounded-[999px] bg-[#C6F26B] ring-2 ring-white" />
                )}
              </div>

              <span
                className={`text-[14px] leading-none ${
                  isActive ? 'font-bold text-[#003820]' : 'font-medium text-[#5E6B63]'
                }`}
              >
                {t(tab.label)}
              </span>

              {/* Small lime active state indicator */}
              <span
                className={`w-1.5 h-1.5 rounded-[999px] transition-opacity duration-150 ${
                  isActive ? 'bg-[#C6F26B] opacity-100' : 'opacity-0'
                }`}
              />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
