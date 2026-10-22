import React from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { MIN_ORDER, formatPrice } from '../lib/fees';

export default function MinOrderProgress({ bill }) {
  const { subtotal, canOrder, toMin } = bill;
  const progressRatio = Math.min(1, Math.max(0, subtotal / MIN_ORDER));

  return (
    <div className="bg-surface rounded-card shadow-card border border-gray-100 p-3.5 transition-all">
      {!canOrder ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-ink">
              <ShoppingBag className="w-4 h-4 text-brand-green flex-shrink-0" />
              <span>
                Add <strong className="text-brand-green font-display tabular-nums">{formatPrice(toMin)}</strong> more to place your order
              </span>
            </div>
            <span className="text-[11px] font-bold text-ink-light font-display tabular-nums">
              {formatPrice(subtotal)} / {formatPrice(MIN_ORDER)}
            </span>
          </div>

          {/* Progress bar using scaleX transform for performance */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-green rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progressRatio }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>

          <p className="text-[10px] text-gray-500">
            Min. order {formatPrice(MIN_ORDER)} unlocks 17% Flat Discount
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-green">
          <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
          <span>Minimum order of {formatPrice(MIN_ORDER)} reached!</span>
        </div>
      )}
    </div>
  );
}
