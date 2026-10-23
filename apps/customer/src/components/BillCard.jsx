import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, BASE_DELIVERY_FEE, DISCOUNT_PERCENT } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function BillCard({ bill }) {
  const t = useT();
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
    <div className="bg-white rounded-2xl border border-black/[0.05] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5 select-none">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-0.5">
        {t('Bill Details')}
      </h3>

      <div className="space-y-3 text-sm text-gray-700">
        {/* 1. Subtotal (Item Total) */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-600">{t('Subtotal')}</span>
          <span className="font-bold text-gray-950 tabular-nums text-sm">{formatPrice(subtotal)}</span>
        </div>

        {/* 2. Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-red-600 font-semibold">
            <span className="flex items-center gap-1.5">
              <span>{t('Discount')}</span>
            </span>
            <span className="tabular-nums font-bold text-sm">-{formatPrice(discount)}</span>
          </div>
        )}

        {/* 3. Delivery Fee (with 70% OFF above ₹1,500) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">{t('Delivery fee')}</span>
              {isDeliveryDiscounted && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  {t('70% OFF')}
                </span>
              )}
            </div>
            <div>
              {isDeliveryDiscounted ? (
                <div className="flex items-center gap-1.5">
                  <span className="line-through text-gray-400 text-xs tabular-nums">
                    {formatPrice(BASE_DELIVERY_FEE)}
                  </span>
                  <span className="text-emerald-700 font-bold text-sm tabular-nums">
                    {formatPrice(delivery)}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-gray-950 tabular-nums text-sm">{formatPrice(delivery)}</span>
              )}
            </div>
          </div>

          {/* Subtext directly below Delivery Fee */}
          {!isDeliveryDiscounted && toDeliveryDiscount > 0 && subtotal > 0 && (
            <p className="text-[11px] leading-snug text-amber-700 font-medium max-w-[215px] pt-0.5">
              {t('Add {amount} more to get 70% off delivery', { amount: formatPrice(toDeliveryDiscount) })}
            </p>
          )}
        </div>

        {/* 4. Platform Fee with Info Icon & Toggleable Note */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">{t('Platform fee')}</span>
              <button
                type="button"
                onClick={() => setShowPlatformInfo(!showPlatformInfo)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded-full hover:bg-gray-100 touch-manipulation cursor-pointer"
                aria-label={t('What is platform fee?')}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <span className="font-bold text-gray-950 tabular-nums text-sm">
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
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 leading-relaxed font-medium">
                  {t('This nominal fee helps us maintain our app, secure payment processing, and provide 24/7 customer support.')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hairline Divider & Total */}
      <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center">
        <div>
          <span className="text-base font-bold text-gray-950 tracking-tight">{t('To pay')}</span>
          <p className="text-xs text-gray-400 font-medium">{t('Includes all taxes and fees')}</p>
        </div>
        <span className="text-lg font-bold text-gray-950 tabular-nums">
          {formatPrice(total)}
        </span>
      </div>

      {/* Price update disclaimer */}
      <div className="pt-2 border-t border-gray-100/80 flex items-start gap-1.5 text-xs text-gray-400 font-medium">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-snug">
          {t('Final bill will be calculated at checkout based on actual MRP & applicable discounts.')}
        </p>
      </div>
    </div>
  );
}
