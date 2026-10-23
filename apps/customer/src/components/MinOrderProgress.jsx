import React from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { MIN_ORDER, formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function MinOrderProgress({ bill }) {
  const t = useT();
  const { subtotal, canOrder, toMin } = bill;
  const progressRatio = Math.min(1, Math.max(0, subtotal / MIN_ORDER));

  return (
    <div className="bg-white rounded-2xl border border-black/[0.05] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      {!canOrder ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <ShoppingBag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {t('Add {amount} more to place your order', { amount: formatPrice(toMin) })}
              </span>
            </div>
            <span className="text-[11px] font-bold text-gray-400 tabular-nums">
              {formatPrice(subtotal)} / {formatPrice(MIN_ORDER)}
            </span>
          </div>

          {/* iOS-style clean progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-600 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progressRatio }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          </div>

          <p className="text-[11px] text-gray-500 font-medium">
            {t('Min. order {amount} unlocks 12% Discount', { amount: formatPrice(MIN_ORDER) })}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{t('Minimum order of {amount} reached!', { amount: formatPrice(MIN_ORDER) })}</span>
        </div>
      )}
    </div>
  );
}
