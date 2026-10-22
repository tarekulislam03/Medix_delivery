import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, BASE_DELIVERY_FEE, DISCOUNT_PERCENT } from '../lib/fees';

export default function BillCard({ bill }) {
  const [showPlatformInfo, setShowPlatformInfo] = useState(false);

  const {
    subtotal,
    discount,
    delivery,
    platform,
    total,
    isDeliveryDiscounted,
    toDeliveryDiscount,
  } = bill;

  return (
    <div className="bg-surface rounded-card shadow-card border border-gray-100 p-4 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
        Bill Details
      </h3>

      <div className="space-y-2.5 text-xs text-ink-light">
        {/* 1. Subtotal (Item Total) */}
        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span className="font-medium text-ink tabular-nums">{formatPrice(subtotal)}</span>
        </div>

        {/* 2. 17% Flat Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-brand-green font-semibold">
            <span className="flex items-center gap-1.5">
              <span>{DISCOUNT_PERCENT}% Flat Discount</span>
            </span>
            <span className="tabular-nums font-bold">-{formatPrice(discount)}</span>
          </div>
        )}

        {/* 3. Delivery Fee (with 70% OFF above ₹1,500) */}
        <div className="space-y-0.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span>Delivery fee</span>
              {isDeliveryDiscounted && (
                <span className="text-[10px] font-bold text-brand-green bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">
                  70% OFF
                </span>
              )}
            </div>
            <div>
              {isDeliveryDiscounted ? (
                <div className="flex items-center gap-1.5">
                  <span className="line-through text-ink-lighter tabular-nums">
                    {formatPrice(BASE_DELIVERY_FEE)}
                  </span>
                  <span className="text-brand-green font-bold tabular-nums">
                    {formatPrice(delivery)}
                  </span>
                </div>
              ) : (
                <span className="font-medium text-ink tabular-nums">{formatPrice(delivery)}</span>
              )}
            </div>
          </div>

          {/* Subtext directly below Delivery Fee */}
          {!isDeliveryDiscounted && toDeliveryDiscount > 0 && subtotal > 0 && (
            <p className="text-[10px] text-amber-600 font-medium">
              Add {formatPrice(toDeliveryDiscount)} more to get 70% off delivery (₹5 only)
            </p>
          )}
        </div>

        {/* 4. Platform Fee with Info Icon & Toggleable Note */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span>Platform fee</span>
              <button
                type="button"
                onClick={() => setShowPlatformInfo(!showPlatformInfo)}
                className="text-gray-400 hover:text-ink transition-colors p-0.5 rounded-full hover:bg-gray-100 touch-manipulation"
                aria-label="What is platform fee?"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <span className="font-medium text-ink tabular-nums">
              {formatPrice(platform)}
            </span>
          </div>

          <AnimatePresence>
            {showPlatformInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-[10px] text-gray-500 leading-relaxed">
                  This nominal fee helps us maintain our app, secure payment processing, and provide 24/7 customer support.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Divider & Total */}
      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
        <div>
          <span className="text-sm font-bold text-ink">To pay</span>
          <p className="text-[10px] text-ink-lighter">Includes all taxes and fees</p>
        </div>
        <span className="text-base font-bold text-brand-green font-display tabular-nums">
          {formatPrice(total)}
        </span>
      </div>

      {/* Price update disclaimer */}
      <div className="pt-2 border-t border-gray-100 flex items-start gap-1.5 text-[10px] text-ink-muted">
        <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-snug text-gray-500">
          Medicine prices can change based on pharmacy batch MRP. We'll notify you if there is any price update.
        </p>
      </div>
    </div>
  );
}
