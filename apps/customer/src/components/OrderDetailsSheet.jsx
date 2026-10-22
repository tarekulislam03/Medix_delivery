import React from 'react';
import { HelpCircle, MapPin, CreditCard, Store, Bike, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';
import StatusBadge from './StatusBadge';
import { formatPrice } from '../lib/fees';
import { formatOrderTime } from '../lib/orderStatus';

export default function OrderDetailsSheet({ order, isOpen, onClose, onNeedHelp }) {
  if (!order) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Order #${order.id}`}>
      <div className="space-y-4 pt-1 pb-4">
        {/* Status & Placed Time Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <p className="text-xs text-ink-light">Placed on</p>
            <p className="text-xs font-bold text-ink">{formatOrderTime(order.placedAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Pharmacy & Rider details if available */}
        {(order.pharmacy || order.rider) && (
          <div className="bg-gray-50 rounded-card p-3 space-y-2 border border-gray-100 text-xs">
            {order.pharmacy && (
              <div className="flex items-start gap-2">
                <Store className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-ink">{order.pharmacy.name}</p>
                  <p className="text-[11px] text-ink-light">{order.pharmacy.address}</p>
                </div>
              </div>
            )}
            {order.rider && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <div>
                    <p className="font-bold text-ink">{order.rider.name}</p>
                    <p className="text-[11px] text-ink-light">Delivery partner</p>
                  </div>
                </div>
                <a
                  href={`tel:${order.rider.phone}`}
                  className="px-2.5 py-1 bg-brand-light text-brand-green font-bold text-xs rounded-pill flex items-center gap-1 hover:bg-brand-green hover:text-white transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
            Items ({order.items?.length || 0})
          </h4>
          <div className="bg-surface rounded-card border border-gray-100 divide-y divide-gray-100 p-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="text-[11px] text-ink-light">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-bold text-ink tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-surface rounded-card border border-gray-100 p-3 space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-ink-muted text-[11px]">
            Bill Summary
          </h4>
          <div className="flex justify-between text-ink-light">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium text-ink">
              {formatPrice(order.bill?.subtotal)}
            </span>
          </div>
          {order.bill?.discount > 0 && (
            <div className="flex justify-between text-brand-green font-semibold">
              <span>17% Flat Discount</span>
              <span className="tabular-nums font-bold">-{formatPrice(order.bill?.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink-light">
            <div className="flex items-center gap-1.5">
              <span>Delivery Fee</span>
              {order.bill?.delivery === 5 && (
                <span className="text-[9px] font-bold text-brand-green bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">
                  70% OFF
                </span>
              )}
            </div>
            <span className="tabular-nums font-medium text-ink">
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
            <span>Platform Fee</span>
            <span className="tabular-nums font-medium text-ink">
              {formatPrice(order.bill?.platform)}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm text-ink">
            <span>Total Paid</span>
            <span className="text-brand-green font-display tabular-nums">
              {formatPrice(order.bill?.total)}
            </span>
          </div>
        </div>

        {/* Delivery Address & Payment */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-card p-3 border border-gray-100">
            <div className="flex items-center gap-1.5 text-ink-muted font-bold mb-1">
              <MapPin className="w-3.5 h-3.5 text-brand-green" />
              <span>Delivery Address</span>
            </div>
            <p className="font-semibold text-ink">{order.address}</p>
          </div>

          <div className="bg-gray-50 rounded-card p-3 border border-gray-100">
            <div className="flex items-center gap-1.5 text-ink-muted font-bold mb-1">
              <CreditCard className="w-3.5 h-3.5 text-brand-green" />
              <span>Payment</span>
            </div>
            <p className="font-semibold text-ink">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Need Help Button */}
        <motion.button
          type="button"
          onClick={onNeedHelp}
          whileTap={{ scale: 0.98 }}
          className="w-full min-h-[44px] py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-ink rounded-pill font-bold text-xs flex items-center justify-center gap-2 touch-manipulation transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-ink-light" />
          <span>Need help with this order?</span>
        </motion.button>
      </div>
    </BottomSheet>
  );
}
