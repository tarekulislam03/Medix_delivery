import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import { formatPrice } from '../lib/fees';

export default function PlaceOrderBar({ bill, onPlaceOrder, isSubmitting = false }) {
  const { total, canOrder, toMin } = bill;

  return (
    <div className="w-full pt-3">
      <motion.button
        type="button"
        onClick={onPlaceOrder}
        disabled={!canOrder || isSubmitting}
        whileTap={canOrder ? { scale: 0.98 } : {}}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={`w-full min-h-[50px] px-5 py-3 rounded-pill flex items-center justify-between font-bold text-sm transition-colors touch-manipulation ${
          canOrder
            ? 'bg-brand-green hover:bg-brand-dark text-white cursor-pointer shadow-md'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
        }`}
        aria-label={canOrder ? `Place order of ${formatPrice(total)}` : `Add ${formatPrice(toMin)} to place order`}
      >
        {canOrder ? (
          <>
            <div className="flex items-center gap-2 font-display tabular-nums">
              <Lock className="w-4 h-4 text-white/80" />
              <span>Place order · {formatPrice(total)}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-white/90" />
          </>
        ) : (
          <div className="w-full text-center">
            <span>Add {formatPrice(toMin)} to place order</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
