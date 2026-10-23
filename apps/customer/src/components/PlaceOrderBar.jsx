import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function PlaceOrderBar({ bill, onPlaceOrder, isSubmitting = false }) {
  const t = useT();
  const { total, canOrder, toMin } = bill;

  return (
    <div className="w-full pt-2">
      <motion.button
        type="button"
        onClick={onPlaceOrder}
        disabled={!canOrder || isSubmitting}
        whileTap={canOrder ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        className={`w-full h-12 px-5 rounded-2xl flex items-center justify-between font-bold text-sm tracking-tight transition-all select-none touch-manipulation ${
          canOrder
            ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-sm active:bg-emerald-900'
            : 'bg-gray-100 text-gray-400 border border-black/[0.04] cursor-not-allowed shadow-none'
        }`}
        aria-label={canOrder ? t('Place order · {amount}', { amount: formatPrice(total) }) : t('Add {amount} to place order', { amount: formatPrice(toMin) })}
      >
        {canOrder ? (
          <>
            <div className="flex items-center gap-2 tabular-nums">
              <Lock className="w-4 h-4 text-white/80" />
              <span>{t('Place order · {amount}', { amount: formatPrice(total) })}</span>
            </div>
            <ArrowRight className="w-4 h-4 stroke-[2.25] text-white/90" />
          </>
        ) : (
          <div className="w-full text-center">
            <span>{t('Add {amount} to place order', { amount: formatPrice(toMin) })}</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
