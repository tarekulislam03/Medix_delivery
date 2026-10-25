import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { formatPrice, BASE_DELIVERY_FEE } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function BillCard({ bill }) {
  const t = useT();
  const [showPlatformInfo, setShowPlatformInfo] = useState(false);

  const {
    subtotal,
    discount,
    discountPercent,
    delivery,
    platform,
    total,
    isDeliveryDiscounted,
    toDeliveryDiscount,
  } = bill;

  const discountExplanation =
    discountPercent === 17
      ? t('17% instant discount (order above ₹1,500)')
      : discountPercent === 12
        ? t('12% instant discount (order above ₹500)')
        : t('Medicine discount (unlocks 12% off at ₹500)');

  return (
    <div className="bg-white rounded-[16px] p-5 space-y-4 select-none">
      <h3 className="font-display font-extrabold text-[18px] tracking-[-0.02em] text-[#0E1A14]">
        {t('bill summary.')}
      </h3>

      <div className="space-y-3 text-[15px] text-[#0E1A14]">
        {/* 1. Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-[#5E6B63] font-medium">{t('MRP total')}</span>
          <span className="font-bold text-[#0E1A14] tabular-nums">{formatPrice(subtotal)}</span>
        </div>

        {/* 2. Self-Explaining Discount Line */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#003820] font-bold">{discountExplanation}</span>
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-[999px] bg-[#C6F26B] text-[#0E1A14] text-[12px] font-bold">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <span className="font-display font-bold text-[#003820] tabular-nums shrink-0">
            {discount > 0 ? `-${formatPrice(discount)}` : formatPrice(0)}
          </span>
        </div>

        {/* 3. Delivery Fee */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#5E6B63] font-medium">{t('Delivery fee')}</span>
              {isDeliveryDiscounted && (
                <span className="px-2 py-0.5 rounded-[999px] bg-[#C6F26B] text-[#0E1A14] text-[12px] font-bold">
                  {t('70% OFF')}
                </span>
              )}
            </div>
            <div>
              {isDeliveryDiscounted ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-[#5E6B63] text-[14px] tabular-nums">
                    {formatPrice(BASE_DELIVERY_FEE)}
                  </span>
                  <span className="font-bold text-[#003820] tabular-nums">
                    {formatPrice(delivery)}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-[#0E1A14] tabular-nums">{formatPrice(delivery)}</span>
              )}
            </div>
          </div>

          {!isDeliveryDiscounted && toDeliveryDiscount > 0 && subtotal > 0 && (
            <p className="text-[14px] text-[#5E6B63]">
              {t('Add {amount} more for ₹5 delivery (70% off)', { amount: formatPrice(toDeliveryDiscount) })}
            </p>
          )}
        </div>

        {/* 4. Platform Fee */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[#5E6B63] font-medium">{t('Platform fee')}</span>
              <button
                type="button"
                onClick={() => setShowPlatformInfo(!showPlatformInfo)}
                className="w-7 h-7 rounded-[999px] text-[#5E6B63] hover:text-[#0E1A14] flex items-center justify-center active:scale-[0.94] touch-manipulation cursor-pointer"
                aria-label={t('What is platform fee?')}
              >
                <Info className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
            <span className="font-bold text-[#0E1A14] tabular-nums">
              {formatPrice(platform)}
            </span>
          </div>

          {showPlatformInfo && (
            <div className="p-3 rounded-[12px] bg-[#F7F4EC] text-[14px] text-[#5E6B63] leading-relaxed">
              {t('Helps us run cold-chain storage, verified pharmacist checks, and live support.')}
            </div>
          )}
        </div>
      </div>

      {/* Total Row */}
      <div className="pt-4 border-t border-[#EFEAD8] flex justify-between items-baseline">
        <div>
          <span className="font-display font-extrabold text-[18px] tracking-[-0.02em] text-[#0E1A14]">
            {t('To pay')}
          </span>
          <p className="text-[14px] text-[#5E6B63]">{t('Inclusive of all taxes')}</p>
        </div>
        <span className="font-display text-[24px] font-extrabold tracking-[-0.02em] text-[#0E1A14] tabular-nums">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
