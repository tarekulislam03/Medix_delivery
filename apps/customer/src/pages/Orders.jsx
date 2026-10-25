import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  Phone,
  WhatsappLogo,
  X,
  Flask,
} from '@phosphor-icons/react';
import { useOrders } from '../lib/useOrders';
import {
  ACTIVE_STATUS_KEYS,
  PAST_STATUS_KEYS,
  formatMonthYear,
} from '../lib/orderStatus';
import {
  MOCK_ACTIVE_ORDERS,
  MOCK_PAST_ORDERS,
} from '../lib/medixMockData';
import ActiveOrderCard from '../components/OrderCard';
import PastOrderCard from '../components/PastOrderCard';
import OrderDetailsSheet from '../components/OrderDetailsSheet';
import { useCartStore } from '../store/cartStore';
import { useT } from '../lib/i18n';

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-[#003820]/90 rounded-[16px] p-5 space-y-4 animate-pulse">
        <div className="flex justify-between">
          <div className="h-6 w-40 bg-white/15 rounded-[999px]" />
          <div className="h-5 w-24 bg-white/15 rounded-[999px]" />
        </div>
        <div className="h-8 w-56 bg-white/20 rounded-[12px]" />
        <div className="h-44 w-full bg-white/10 rounded-[16px]" />
        <div className="h-14 w-full bg-white/10 rounded-[16px]" />
      </div>
      {[1, 2].map((n) => (
        <div
          key={n}
          className="bg-white rounded-[16px] p-4 space-y-3 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-44 bg-[#0E1A14]/10 rounded" />
              <div className="h-4 w-28 bg-[#0E1A14]/8 rounded" />
            </div>
            <div className="h-6 w-20 bg-[#0E1A14]/10 rounded-[999px]" />
          </div>
          <div className="h-14 w-full bg-[#F7F4EC] rounded-[12px]" />
          <div className="flex gap-2.5">
            <div className="h-11 w-32 bg-[#F7F4EC] rounded-[999px]" />
            <div className="h-11 flex-1 bg-[#003820]/20 rounded-[999px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const { t } = useT();
  const navigate = useNavigate();
  const addMultipleItems = useCartStore((state) => state.addMultipleItems);

  const { orders: apiOrders = [], isLoading, cancelOrder } = useOrders();
  const [cancelledMockIds, setCancelledMockIds] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [supportOrder, setSupportOrder] = useState(null);
  const [pastFilter, setPastFilter] = useState('ALL'); // 'ALL' | 'DELIVERED' | 'CANCELLED'
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);
  const [reorderToast, setReorderToast] = useState(null);

  // Merge live API orders with realistic mock data when API returns empty so all states can be previewed immediately
  const allOrders = useMemo(() => {
    if (showEmptyDemo) return [];
    const baseList =
      apiOrders && apiOrders.length > 0
        ? apiOrders
        : [...MOCK_ACTIVE_ORDERS, ...MOCK_PAST_ORDERS];

    return baseList.map((order) =>
      cancelledMockIds.includes(order._id)
        ? {
            ...order,
            status: 'CANCELLED',
            cancelReason: 'Cancelled by you before packing.',
          }
        : order
    );
  }, [apiOrders, cancelledMockIds, showEmptyDemo]);

  const activeOrders = useMemo(
    () => allOrders.filter((o) => ACTIVE_STATUS_KEYS.includes(o.status)),
    [allOrders]
  );

  const pastOrders = useMemo(
    () => allOrders.filter((o) => PAST_STATUS_KEYS.includes(o.status)),
    [allOrders]
  );

  // Default to Active if one exists, otherwise Past
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [hasInitializedTab, setHasInitializedTab] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasInitializedTab) {
      setActiveTab(activeOrders.length > 0 ? 'ACTIVE' : 'PAST');
      setHasInitializedTab(true);
    }
  }, [isLoading, activeOrders.length, hasInitializedTab]);

  // Filtered past orders by chip: All | Delivered | Cancelled
  const filteredPastOrders = useMemo(() => {
    if (pastFilter === 'DELIVERED') {
      return pastOrders.filter((o) => o.status === 'DELIVERED');
    }
    if (pastFilter === 'CANCELLED') {
      return pastOrders.filter((o) => o.status === 'CANCELLED');
    }
    return pastOrders;
  }, [pastOrders, pastFilter]);

  // Group past orders by month with small uppercase labels
  const groupedPastOrders = useMemo(() => {
    const groups = [];
    const groupMap = new Map();

    filteredPastOrders.forEach((order) => {
      const monthLabel = order.monthGroup || formatMonthYear(order.createdAt);
      if (!groupMap.has(monthLabel)) {
        const entry = { month: monthLabel, orders: [] };
        groupMap.set(monthLabel, entry);
        groups.push(entry);
      }
      groupMap.get(monthLabel).orders.push(order);
    });

    return groups;
  }, [filteredPastOrders]);

  const handleCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      if (String(orderId).startsWith('ord_')) {
        setCancelledMockIds((prev) => [...prev, orderId]);
      } else {
        await cancelOrder({ orderId, reason: 'Cancelled by customer before packing' });
      }
    } catch {
      setCancelledMockIds((prev) => [...prev, orderId]);
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = (order) => {
    const items = order.items || [];
    let addedCount = 0;

    const normalizedMedicines = items.map((item, idx) => {
      const qty = Number(item.qty || item.quantity || 1);
      addedCount += qty;
      return {
        id:
          item.medicineId ||
          item.id ||
          item._id ||
          item.medicine?._id ||
          `med_${(item.name || 'item').toLowerCase().replace(/\s+/g, '_')}_${idx}`,
        name: item.name || item.medicine?.name || 'Medicine',
        price: Number(item.price || item.medicine?.price || 50),
        quantity: qty,
        requiresRx: Boolean(item.requiresRx || item.medicine?.requiresRx),
        strength: item.packSize || item.strength || item.medicine?.packSize || '1 Strip',
        category: item.category || item.medicine?.category || '',
      };
    });

    addMultipleItems(normalizedMedicines);

    setReorderToast({
      count: addedCount || items.length || 1,
      pharmacyName: order.pharmacy?.name || 'Medix Pharmacy',
    });

    setTimeout(() => {
      setReorderToast(null);
    }, 5000);
  };

  const displayedListEmpty =
    activeTab === 'ACTIVE'
      ? activeOrders.length === 0
      : filteredPastOrders.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#0E1A14] pb-6">
      {/* Sticky Header: "your orders." + Active | Past pill tabs */}
      <header className="sticky top-0 z-30 bg-[#F7F4EC]/95 backdrop-blur-md px-4 pt-5 pb-3.5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h1 className="font-display font-extrabold text-[28px] leading-[1.1] tracking-[-0.02em] text-[#0E1A14]">
              {t('your orders.')}
            </h1>

            {/* Subtle preview toggle to inspect Empty state */}
            <button
              type="button"
              onClick={() => setShowEmptyDemo((prev) => !prev)}
              className="min-h-[36px] px-3 rounded-[999px] bg-white text-[#5E6B63] text-[14px] font-semibold inline-flex items-center gap-1.5 active:scale-95 transition-transform"
              title="Toggle empty state preview"
            >
              <Flask weight="bold" className="w-4 h-4 text-[#003820]" />
              <span>{showEmptyDemo ? t('Show orders') : t('Empty view')}</span>
            </button>
          </div>

          {/* Two Pill Tabs: Active | Past */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-[999px]">
            <button
              type="button"
              onClick={() => setActiveTab('ACTIVE')}
              className={`min-h-[44px] rounded-[999px] text-[15px] font-bold inline-flex items-center justify-center gap-2 transition-all ${
                activeTab === 'ACTIVE'
                  ? 'bg-[#003820] text-white'
                  : 'text-[#5E6B63] hover:text-[#0E1A14]'
              }`}
            >
              <span>{t('Active')}</span>
              {activeOrders.length > 0 && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-[999px] text-[14px] font-extrabold leading-none tabular-nums ${
                    activeTab === 'ACTIVE'
                      ? 'bg-[#C6F26B] text-[#003820]'
                      : 'bg-[#E3EFE8] text-[#003820]'
                  }`}
                >
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PAST')}
              className={`min-h-[44px] rounded-[999px] text-[15px] font-bold inline-flex items-center justify-center gap-2 transition-all ${
                activeTab === 'PAST'
                  ? 'bg-[#003820] text-white'
                  : 'text-[#5E6B63] hover:text-[#0E1A14]'
              }`}
            >
              <span>{t('Past')}</span>
              {pastOrders.length > 0 && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-[999px] text-[14px] font-bold leading-none tabular-nums ${
                    activeTab === 'PAST'
                      ? 'bg-white/15 text-white'
                      : 'bg-[#F7F4EC] text-[#5E6B63]'
                  }`}
                >
                  {pastOrders.length}
                </span>
              )}
            </button>
          </div>

          {/* Past Orders Filter Chips: All | Delivered | Cancelled */}
          {activeTab === 'PAST' && pastOrders.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
              {[
                { key: 'ALL', label: t('All') },
                { key: 'DELIVERED', label: t('Delivered') },
                { key: 'CANCELLED', label: t('Cancelled') },
              ].map((chip) => {
                const isSelected = pastFilter === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setPastFilter(chip.key)}
                    className={`min-h-[44px] px-4 rounded-[999px] text-[14px] font-bold shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#003820] text-white'
                        : 'bg-white text-[#5E6B63] hover:text-[#0E1A14]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-2">
        {isLoading ? (
          <OrdersSkeleton />
        ) : displayedListEmpty ? (
          /* Illustration-free empty state with big text */
          <div className="bg-white rounded-[16px] px-6 py-12 text-center mt-2">
            <h2 className="font-display font-extrabold text-[28px] leading-[1.12] tracking-[-0.02em] text-[#0E1A14] mb-2">
              {t('nothing here yet.')}
            </h2>
            <p className="text-[15px] text-[#5E6B63] max-w-xs mx-auto mb-6">
              {t('Order your first medicine in 2 taps.')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="min-h-[48px] px-6 rounded-[999px] bg-[#003820] text-white text-[15px] font-bold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span>{t('Search medicines')}</span>
              <ArrowRight weight="bold" className="w-4 h-4 text-[#C6F26B]" />
            </button>
          </div>
        ) : activeTab === 'ACTIVE' ? (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <ActiveOrderCard
                key={order._id}
                order={order}
                onCancel={handleCancelOrder}
                isCancelling={cancellingId === order._id}
                onSupport={(ord) => setSupportOrder(ord)}
              />
            ))}
          </div>
        ) : (
          /* Past Orders grouped by month with small uppercase labels */
          <div className="space-y-6">
            {groupedPastOrders.map((group) => (
              <section key={group.month} className="space-y-3">
                <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#5E6B63] px-1">
                  {group.month}
                </h2>
                <div className="space-y-3">
                  {group.orders.map((order) => (
                    <PastOrderCard
                      key={order._id}
                      order={order}
                      onReorder={handleReorder}
                      onViewDetails={(ord) => setSelectedOrder(ord)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Order Details Bottom Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onReorder={handleReorder}
      />

      {/* Need Help? Support Sheet */}
      {supportOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0E1A14]/55 backdrop-blur-xs p-4"
          onClick={() => setSupportOrder(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-[16px] p-5 shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-extrabold text-[20px] text-[#0E1A14]">
                {t('need help.')}
              </h3>
              <button
                type="button"
                onClick={() => setSupportOrder(null)}
                aria-label="Close help"
                className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-[#5E6B63]"
              >
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[14px] text-[#5E6B63] mb-4">
              {t('Our pharmacist support team is available for order')}{' '}
              <span className="font-bold text-[#0E1A14]">
                {supportOrder.displayId ||
                  `#${String(supportOrder._id).slice(-6).toUpperCase()}`}
              </span>
              .
            </p>
            <div className="space-y-2.5">
              <a
                href="tel:+911800123456"
                className="w-full min-h-[48px] px-4 rounded-[999px] bg-[#003820] text-white text-[14px] font-bold flex items-center justify-center gap-2"
              >
                <Phone weight="bold" className="w-4 h-4 text-[#C6F26B]" />
                <span>{t('Call Pharmacist Support')}</span>
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi%20Medix%2C%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[48px] px-4 rounded-[999px] bg-[#F7F4EC] text-[#0E1A14] text-[14px] font-bold flex items-center justify-center gap-2"
              >
                <WhatsappLogo weight="bold" className="w-5 h-5 text-[#003820]" />
                <span>{t('Chat on WhatsApp')}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Toast with "View cart" action */}
      {reorderToast && (
        <div className="fixed left-4 right-4 bottom-24 z-50 max-w-md mx-auto">
          <div className="bg-[#0E1A14] text-white rounded-[999px] pl-4 pr-2 py-2 shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle
                weight="fill"
                className="w-5 h-5 text-[#C6F26B] shrink-0"
              />
              <span className="text-[14px] font-semibold truncate">
                {reorderToast.count} {t('items added to cart')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="min-h-[40px] px-4 rounded-[999px] bg-[#C6F26B] text-[#003820] text-[14px] font-extrabold shrink-0 active:scale-95 transition-transform"
            >
              {t('View cart')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
