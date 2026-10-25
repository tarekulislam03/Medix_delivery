import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function PlaceOrderBar({ bill, onPlaceOrder, isSubmitting = false }) {
  const t = useT();
  const { total, canOrder, toMin } = bill;

  return (
    <div className="w-full pt-2">
      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={!canOrder || isSubmitting}
        style={
          canOrder
            ? { boxShadow: '0 14px 32px -8px rgba(0, 56, 32, 0.28)' }
            : undefined
        }
        className={`w-full min-h-[58px] pl-6 pr-2.5 py-2 rounded-[999px] flex items-center justify-between font-display font-bold text-[16px] tracking-[-0.02em] transition-transform duration-150 select-none touch-manipulation ${
          canOrder
            ? 'bg-[#003820] text-white cursor-pointer active:scale-[0.98]'
            : 'bg-[#EFEAD8] text-[#5E6B63] cursor-not-allowed'
        }`}
        aria-label={
          canOrder
            ? t('Place order · {amount}', { amount: formatPrice(total) })
            : t('Add {amount} to place order', { amount: formatPrice(toMin) })
        }
      >
        {canOrder ? (
          <>
            <div className="text-left">
              <span className="block text-[12px] font-sans font-medium text-white/75 tracking-normal">
                {t('Total payable')}
              </span>
              <span className="font-display text-[20px] font-bold text-white tabular-nums">
                {formatPrice(total)}
              </span>
            </div>

            <div className="min-h-[44px] px-5 rounded-[999px] bg-[#C6F26B] text-[#0E1A14] font-display font-bold text-[15px] flex items-center gap-2">
              <span>{t('Place order')}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.6]" />
            </div>
          </>
        ) : (
          <div className="w-full text-center text-[15px] font-sans font-bold">
            <span>{t('Add {amount} more to place order', { amount: formatPrice(toMin) })}</span>
          </div>
        )}
      </button>
    </div>
  );
}
