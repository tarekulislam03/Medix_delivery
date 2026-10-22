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

export default function OrderCard({ order, onCancelOrder }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const showPharmacy = ['CONFIRMED', 'PACKED'].includes(order.status) && order.pharmacy;
  const canCancel = ['SEARCHING', 'CONFIRMED'].includes(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-surface rounded-card shadow-card border border-gray-100 p-4 space-y-3 relative overflow-hidden"
    >
      {/* Top Row: Order ID, Time & Price */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-xs text-ink font-display">#{order.id}</h3>
          <span className="text-[11px] text-ink-light">· {formatOrderTime(order.placedAt)}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-light">
            {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'} ·{' '}
          </span>
          <strong className="text-xs text-ink font-bold tabular-nums">
            {formatPrice(order.bill?.total)}
          </strong>
        </div>
      </div>

      {/* Vertical Status Timeline */}
      <StatusStepper status={order.status} />

      {/* Rider Row (when Out for Delivery and rider assigned) */}
      {isOutForDelivery && order.rider && (
        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <div>
            <p className="font-semibold text-ink leading-tight">Delivery partner</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">Assigned to your order</p>
          </div>

          <a
            href={`tel:${order.rider.phone}`}
            className="min-h-[32px] px-3 bg-brand-green hover:bg-brand-dark text-white rounded-pill text-xs font-bold flex items-center gap-1.5 shadow-xs touch-manipulation transition-colors shrink-0"
            aria-label="Call delivery partner"
          >
            <Phone className="w-3 h-3" />
            <span>Call rider</span>
          </a>
        </div>
      )}

      {/* Pharmacy Row (when Confirmed or Packed) */}
      {showPharmacy && (
        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-ink-light">
          <Store className="w-4 h-4 text-brand-green shrink-0" />
          <p className="truncate text-xs">
            <span className="font-semibold text-ink">{order.pharmacy.name}</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className="text-[11px] text-gray-500">{order.pharmacy.address}</span>
          </p>
        </div>
      )}

      {/* Collapsible Items & Bill Summary */}
      <div className="border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-ink-light hover:text-ink min-h-[36px] touch-manipulation transition-colors"
        >
          <span>{isExpanded ? 'Hide order details' : 'View items & bill'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
              <div className="bg-gray-50 rounded-xl p-3 divide-y divide-gray-200/60">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between">
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-[11px] text-ink-light">{item.strength}</p>
                    </div>
                    <span className="font-medium text-ink tabular-nums">
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-ink-light">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatPrice(order.bill?.subtotal)}</span>
                </div>
                {order.bill?.discount > 0 && (
                  <div className="flex justify-between text-brand-green font-semibold">
                    <span>17% Flat Discount</span>
                    <span className="tabular-nums font-bold">-{formatPrice(order.bill?.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-light">
                  <div className="flex items-center gap-1.5">
                    <span>Delivery fee</span>
                    {order.bill?.delivery === 5 && (
                      <span className="text-[9px] font-bold text-brand-green bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">
                        70% OFF
                      </span>
                    )}
                  </div>
                  <span className="tabular-nums font-medium">
                    {order.bill?.delivery === 5 ? (
                      <span className="flex items-center gap-1">
                        <span className="line-through text-ink-lighter text-[11px]">₹18</span>
                        <span className="text-brand-green font-bold">₹5</span>
                      </span>
                    ) : (
                      formatPrice(order.bill?.delivery)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-ink-light">
                  <span>Platform fee</span>
                  <span className="tabular-nums font-medium">{formatPrice(order.bill?.platform)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-ink">
                  <span>Total Amount</span>
                  <span className="text-brand-green font-display tabular-nums">
                    {formatPrice(order.bill?.total)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-lighter pt-1">
                  <CreditCard className="w-3 h-3" />
                  <span>Paid via {order.paymentMethod}</span>
                  <span>·</span>
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{order.address}</span>
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
            className="text-xs font-semibold text-red-500 hover:text-red-700 min-h-[36px] px-1 flex items-center touch-manipulation transition-colors"
          >
            Cancel order
          </button>
        </div>
      )}
    </motion.div>
  );
}
