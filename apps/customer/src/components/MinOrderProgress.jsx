import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { MIN_ORDER, DISCOUNTED_DELIVERY_AT, formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function MinOrderProgress({ bill }) {
  const t = useT();
  const {
    subtotal,
    canOrder,
    toMin,
    toDeliveryDiscount,
    isDeliveryDiscounted,
  } = bill;

  const deliveryRatio = Math.min(1, Math.max(0, subtotal / DISCOUNTED_DELIVERY_AT));

  return (
    <div className="bg-[#003820] text-white rounded-[16px] p-4 space-y-3 select-none">
      {!isDeliveryDiscounted ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Truck className="w-5 h-5 text-[#C6F26B] stroke-[2.25] shrink-0" />
              <p className="font-display font-bold text-[15px] tracking-[-0.01em] text-white leading-snug">
                {formatPrice(toDeliveryDiscount)} more for 70% off delivery
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-0.5 rounded-[999px] bg-[#C6F26B] text-[#0E1A14] text-[12px] font-bold tabular-nums">
              {Math.round(deliveryRatio * 100)}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-white/15 rounded-[999px] overflow-hidden">
            <div
              className="h-full bg-[#C6F26B] rounded-[999px] transition-all duration-300"
              style={{ width: `${Math.max(6, Math.round(deliveryRatio * 100))}%` }}
            />
          </div>

          <p className="text-[14px] text-white/80 leading-snug">
            {!canOrder
              ? t('Add {amount} more to reach the {min} minimum order (unlocks 12% off).', {
                  amount: formatPrice(toMin),
                  min: formatPrice(MIN_ORDER),
                })
              : t('12% discount active! Reach ₹1,500 for 17% off + ₹5 delivery.')}
          </p>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#C6F26B] stroke-[2.4] shrink-0" />
          <div>
            <p className="font-display font-bold text-[15px] tracking-[-0.01em] text-[#C6F26B]">
              70% off delivery + 17% max discount unlocked.
            </p>
            <p className="text-[14px] text-white/80">
              {t('You are getting our highest savings tier on this order.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
