import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Package, Clock, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useOrders } from '../lib/useOrders';
import { ACTIVE_STATUS_KEYS, PAST_STATUS_KEYS, formatMonthYear } from '../lib/orderStatus';
import { useCartStore } from '../store/cartStore';

import OrderCard from '../components/OrderCard';
import PastOrderCard from '../components/PastOrderCard';
import OrderDetailsSheet from '../components/OrderDetailsSheet';
import BottomSheet from '../components/BottomSheet';
import SkeletonCard from '../components/SkeletonCard';

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Takes too long',
  'Changed mind',
  'Found better price',
  'Other',
];

export default function Orders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'past'
  const [selectedPastOrder, setSelectedPastOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [helpToast, setHelpToast] = useState(false);

  // TanStack Query orders hook
  const { orders, isLoading, isRefetching, refetch, cancelOrder, isCancelling } = useOrders();
  const addItem = useCartStore((state) => state.addItem);

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
  }, [pastOrders]);

  // Reorder Handler: adds items to cart and navigates to /cart
  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        addItem(item);
      }
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

  return (
    <div
      style={{
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="max-w-md mx-auto p-4 min-h-screen bg-white"
    >
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-ink font-display">Your orders</h1>

        {/* Small Refresh Icon Button with Spin Indicator */}
        <motion.button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-ink-light hover:text-ink hover:bg-gray-100 transition-colors touch-manipulation"
          aria-label="Refresh orders"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading || isRefetching ? 'animate-spin text-brand-green' : ''}`}
          />
        </motion.button>
      </div>

      {/* Tabs with sliding underline indicator */}
      <div className="relative border-b border-gray-100 flex items-center mb-4">
        {[
          { key: 'active', label: 'Active', count: activeOrders.length },
          { key: 'past', label: 'Past', count: pastOrders.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-bold transition-colors relative touch-manipulation ${
                isActive ? 'text-brand-green' : 'text-ink-lighter hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-brand-light text-brand-green font-bold' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}

              {/* Sliding underline indicator (transform only) */}
              {isActive && (
                <motion.div
                  layoutId="orders-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Loading State: 3 skeleton cards */}
      {isLoading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : (
        /* Tab Content with Smooth Transitions */
        <AnimatePresence mode="wait">
          {activeTab === 'active' ? (
            <motion.div
              key="active-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-3.5"
            >
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancelOrder={(ord) => setOrderToCancel(ord)}
                  />
                ))
              ) : (
                /* Empty Active State */
                <div className="pt-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-3 text-brand-green">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-ink">No active orders</h3>
                  <p className="text-xs text-ink-light mt-1 max-w-[220px] mx-auto">
                    When you order medicines, live tracking will appear here.
                  </p>
                  <Link
                    to="/search"
                    className="mt-5 inline-flex min-h-[44px] items-center px-6 py-2.5 bg-brand-green hover:bg-brand-dark text-white text-xs font-bold rounded-pill shadow-sm touch-manipulation transition-colors"
                  >
                    Search medicines
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="past-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-4"
            >
              {Object.keys(groupedPastOrders).length > 0 ? (
                Object.entries(groupedPastOrders).map(([monthLabel, monthOrders]) => (
                  <div key={monthLabel} className="space-y-2.5">
                    {/* Sticky Month Label */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-1 px-1 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
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
                ))
              ) : (
                /* Empty Past State */
                <div className="pt-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-ink-lighter">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-ink">No orders yet</h3>
                  <p className="text-xs text-ink-light mt-1">
                    Your previous delivered orders will be listed here.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Order Details Bottom Sheet (from Past Tab) */}
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
        title="Cancel Order"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-ink-light leading-relaxed">
            Please let us know why you want to cancel order{' '}
            <strong className="text-ink">#{orderToCancel?.id}</strong>:
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
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-pill text-xs font-semibold border transition-colors touch-manipulation ${
                    isSelected
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                      : 'bg-surface text-ink-light border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => setOrderToCancel(null)}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-pill border border-gray-200 text-xs font-semibold text-ink hover:bg-gray-50 touch-manipulation"
            >
              Keep order
            </button>
            <motion.button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              whileTap={{ scale: 0.97 }}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-pill bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm touch-manipulation disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel order'}
            </motion.button>
          </div>
        </div>
      </BottomSheet>

      {/* Toast Notification for Need Help */}
      <AnimatePresence>
        {helpToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-ink-900 text-white text-xs py-2.5 px-4 rounded-pill shadow-elevated flex items-center gap-2 whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Support request logged. We will contact you shortly.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
