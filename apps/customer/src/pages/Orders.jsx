import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Package, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useOrders } from '../lib/useOrders';
import { ACTIVE_STATUS_KEYS, PAST_STATUS_KEYS, formatMonthYear } from '../lib/orderStatus';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';

import OrderCard from '../components/OrderCard';
import PastOrderCard from '../components/PastOrderCard';
import OrderDetailsSheet from '../components/OrderDetailsSheet';
import BottomSheet from '../components/BottomSheet';
import SkeletonCard from '../components/SkeletonCard';
import { useT } from '../lib/i18n';

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Takes too long',
  'Changed mind',
  'Found better price',
  'Other',
];

export default function Orders() {
  const t = useT();
  const navigate = useNavigate();
  const phone = useUserStore((state) => state.phone);
  const [selectedPastOrder, setSelectedPastOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [helpToast, setHelpToast] = useState(false);

  // TanStack Query orders hook
  const { orders, isLoading, isRefetching, refetch, cancelOrder, isCancelling } = useOrders();
  const addMultipleItems = useCartStore((state) => state.addMultipleItems);

  // Separate active and past orders
  const activeOrders = useMemo(() => {
    return orders.filter((o) => ACTIVE_STATUS_KEYS.includes(o.status));
  }, [orders]);

  const pastOrders = useMemo(() => {
    return orders.filter((o) => PAST_STATUS_KEYS.includes(o.status));
  }, [orders]);

  // Group past orders by Month/Year
  const groupedPastOrders = useMemo(() => {
    const groups = {};
    for (const order of pastOrders) {
      const monthYear = formatMonthYear(order.placedAt);
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(order);
    }
    return groups;
  }, [pastOrders, t.lang]);

  // Reorder Handler: adds items to cart and navigates to /cart
  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      addMultipleItems(order.items);
      navigate('/cart');
    }
  };

  // Confirm Order Cancellation
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    await cancelOrder({
      orderId: orderToCancel.id,
      reason: selectedReason,
    });
    setOrderToCancel(null);
  };

  const handleNeedHelp = () => {
    setHelpToast(true);
    setTimeout(() => setHelpToast(false), 3000);
  };

  const hasNoOrders = !isLoading && activeOrders.length === 0 && pastOrders.length === 0;

  return (
    <div
      style={{
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="max-w-md mx-auto px-4 min-h-screen bg-[#F2F2F7]/50 text-gray-950 antialiased select-none"
    >
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-2 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">{t('Your orders')}</h1>

        {/* Small Refresh Icon Button with Spin Indicator */}
        <motion.button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', damping: 20, stiffness: 400 }}
          className="w-9 h-9 rounded-full bg-white border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-center text-gray-600 hover:text-gray-950 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation cursor-pointer"
          aria-label={t('Refresh orders')}
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading || isRefetching ? 'animate-spin text-emerald-700' : ''}`}
          />
        </motion.button>
      </div>

      {/* 2. Loading State: skeleton cards */}
      {isLoading ? (
        <div className="space-y-3 pt-1">
          {[1, 2, 3].map((idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : !phone ? (
        /* Not logged in State */
        <div className="pt-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center mx-auto mb-4 text-emerald-700">
            <Package className="w-8 h-8 stroke-[1.75]" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-gray-950">{t('Sign in to view orders')}</h3>
          <p className="text-xs text-gray-500 font-medium mt-1.5 max-w-[260px] mx-auto leading-relaxed">
            {t('Log in with your mobile number to view active deliveries and past orders.')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/login?redirect=/orders')}
            className="mt-6 inline-flex h-11 items-center px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-xs touch-manipulation cursor-pointer transition-all"
          >
            {t('Sign in with Mobile')}
          </button>
        </div>
      ) : hasNoOrders ? (
        /* Empty State */
        <div className="pt-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center mx-auto mb-4 text-emerald-700">
            <Package className="w-8 h-8 stroke-[1.75]" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-gray-950">{t('No orders yet')}</h3>
          <p className="text-xs text-gray-500 font-medium mt-1.5 max-w-[240px] mx-auto leading-relaxed">
            {t('When you order medicines, live tracking and past orders will appear here.')}
          </p>
          <Link
            to="/search"
            className="mt-6 inline-flex h-11 items-center px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-xs touch-manipulation cursor-pointer transition-all"
          >
            {t('Search medicines')}
          </Link>
        </div>
      ) : (
        /* Single Unified Stream: Active Orders on top, Past Orders below */
        <div className="space-y-6">
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <section className="space-y-2.5">
              <div className="px-1">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {t('Active Orders ({n})', { n: activeOrders.length })}
                </h2>
              </div>

              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancelOrder={(ord) => setOrderToCancel(ord)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Orders Section */}
          {pastOrders.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                {t('Past Orders ({n})', { n: pastOrders.length })}
              </h2>

              <div className="space-y-4">
                {Object.entries(groupedPastOrders).map(([monthLabel, monthOrders]) => (
                  <div key={monthLabel} className="space-y-2">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-1">
                      {monthLabel}
                    </div>

                    <div className="space-y-2.5">
                      {monthOrders.map((order) => (
                        <PastOrderCard
                          key={order.id}
                          order={order}
                          onSelect={(ord) => setSelectedPastOrder(ord)}
                          onReorder={handleReorder}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Order Details Bottom Sheet (from Past Order) */}
      <OrderDetailsSheet
        order={selectedPastOrder}
        isOpen={!!selectedPastOrder}
        onClose={() => setSelectedPastOrder(null)}
        onNeedHelp={handleNeedHelp}
      />

      {/* Cancel Order Confirmation Bottom Sheet with Reason Chips */}
      <BottomSheet
        isOpen={!!orderToCancel}
        onClose={() => setOrderToCancel(null)}
        title={t('Cancel Order')}
      >
        <div className="space-y-4 pt-1 select-none">
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            {t('Please let us know why you want to cancel order')}{' '}
            <strong className="text-gray-950 font-mono">#{orderToCancel?.id}</strong>:
          </p>

          {/* Reason Chips */}
          <div className="flex flex-wrap gap-2">
            {CANCELLATION_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`h-9 px-3.5 rounded-full text-xs font-semibold border transition-all touch-manipulation cursor-pointer ${
                    isSelected
                      ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-300 shadow-2xs'
                      : 'bg-white text-gray-700 border-black/[0.06] hover:bg-gray-50'
                  }`}
                >
                  {t(reason)}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setOrderToCancel(null)}
              className="flex-1 h-11 px-4 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 touch-manipulation cursor-pointer"
            >
              {t('Keep order')}
            </button>
            <motion.button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
              className="flex-1 h-11 px-4 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-xs touch-manipulation disabled:opacity-50 cursor-pointer"
            >
              {isCancelling ? t('Cancelling...') : t('Cancel order')}
            </motion.button>
          </div>
        </div>
      </BottomSheet>

      {/* Toast Notification for Need Help */}
      <AnimatePresence>
        {helpToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-950/95 backdrop-blur-md text-white text-xs py-2.5 px-4 rounded-full shadow-elevated border border-white/10 flex items-center gap-2 whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{t('Support request logged. We will contact you shortly.')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
