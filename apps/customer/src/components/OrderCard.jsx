import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Store,
  Phone,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusStepper from './StatusStepper';
import { formatOrderTime } from '../lib/orderStatus';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function OrderCard({ order, onCancelOrder }) {
  const t = useT();
  const [isExpanded, setIsExpanded] = useState(false);

  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const showPharmacy = ['CONFIRMED', 'PACKED'].includes(order.status) && order.pharmacy;
  const canCancel = ['SEARCHING', 'CONFIRMED', 'PLACED'].includes(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="bg-white rounded-2xl border border-black/[0.05] p-4 space-y-3 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none"
    >
      {/* Top Row: Order ID, Time & Price */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <h3 className="font-mono font-bold text-xs text-gray-950">#{order.id}</h3>
          <span className="text-[11px] text-gray-400 font-medium">· {formatOrderTime(order.placedAt)}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 font-medium">
            {t.num(order.items?.length || 0)} {t((order.items?.length || 0) === 1 ? 'item' : 'items')} ·{' '}
          </span>
          <strong className="text-xs text-gray-950 font-bold tabular-nums">
            {formatPrice(order.bill?.total)}
          </strong>
        </div>
      </div>

      {/* Vertical Status Timeline */}
      <StatusStepper status={order.status} deliveryOtp={order.deliveryOtp} />

      {/* Rider Row (when Out for Delivery and rider assigned) */}
      {isOutForDelivery && order.rider && (
        <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-2xl border border-black/[0.04] text-xs">
          <div>
            <p className="font-bold text-gray-950 leading-tight">{t('Delivery partner')}</p>
            <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">{order.rider.name || 'Assigned to your order'}</p>
          </div>

          <a
            href={`tel:${order.rider.phone}`}
            className="h-8 px-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs touch-manipulation transition-all shrink-0 cursor-pointer"
            aria-label={t('Call delivery partner')}
          >
            <Phone className="w-3 h-3 stroke-[2.25]" />
            <span>{t('Call')}</span>
          </a>
        </div>
      )}

      {/* Pharmacy Row (when Confirmed or Packed) */}
      {showPharmacy && (
        <div className="flex items-center gap-2.5 p-3 bg-gray-50/80 rounded-2xl border border-black/[0.04] text-xs">
          <Store className="w-4 h-4 text-emerald-700 shrink-0" />
          <p className="truncate text-xs">
            <span className="font-bold text-gray-950">{order.pharmacy.name}</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className="text-[11px] text-gray-500 font-medium">{order.pharmacy.address}</span>
          </p>
        </div>
      )}

      {/* Collapsible Items & Bill Summary */}
      <div className="border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-950 min-h-[36px] touch-manipulation transition-colors cursor-pointer"
        >
          <span>{isExpanded ? t('Hide order details') : t('View items & bill')}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[2]" /> : <ChevronDown className="w-4 h-4 stroke-[2]" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden space-y-2.5 pt-2 text-xs"
            >
              {/* Item List */}
              <div className="bg-gray-50/80 rounded-2xl p-3 divide-y divide-gray-200/60 border border-black/[0.03]">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-950">{item.name}</p>
                    </div>
                    <span className="font-medium text-gray-700 tabular-nums">
                      {t.num(item.quantity)} × {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="bg-gray-50/80 rounded-2xl p-3 space-y-1.5 border border-black/[0.03]">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>{t('Subtotal')}</span>
                  <span className="tabular-nums font-semibold text-gray-950">{formatPrice(order.bill?.subtotal)}</span>
                </div>
                {order.bill?.discount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>{t('Discount')}</span>
                    <span className="tabular-nums font-bold">-{formatPrice(order.bill?.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>{t('Delivery fee')}</span>
                    {order.bill?.delivery === 5 && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full">
                        {t('70% OFF')}
                      </span>
                    )}
                  </div>
                  <span className="tabular-nums font-semibold text-gray-950">
                    {order.bill?.delivery === 5 ? (
                      <span className="flex items-center gap-1">
                        <span className="line-through text-gray-400 text-[11px]">{formatPrice(18)}</span>
                        <span className="text-emerald-700 font-bold">{formatPrice(5)}</span>
                      </span>
                    ) : (
                      formatPrice(order.bill?.delivery)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>{t('Platform fee')}</span>
                  <span className="tabular-nums font-semibold text-gray-950">{formatPrice(order.bill?.platform)}</span>
                </div>
                <div className="border-t border-gray-200/80 pt-2 flex justify-between font-bold text-sm text-gray-950">
                  <span>{t('Total Amount')}</span>
                  <span className="text-gray-950 tabular-nums">
                    {formatPrice(order.bill?.total)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('Paid via {method}', { method: order.paymentMethod })}</span>
                  {order.address && (
                    <>
                      <span>·</span>
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{order.address}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel Order Action */}
      {canCancel && (
        <div className="border-t border-gray-100 pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onCancelOrder(order)}
            className="text-xs font-semibold text-red-500 hover:text-red-600 active:opacity-60 min-h-[36px] px-1 flex items-center touch-manipulation transition-opacity cursor-pointer"
          >
            {t('Cancel order')}
          </button>
        </div>
      )}
    </motion.div>
  );
}
