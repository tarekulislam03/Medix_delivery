import React from 'react';
import { RotateCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import { formatOrderTime } from '../lib/orderStatus';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function PastOrderCard({ order, onSelect, onReorder }) {
  const t = useT();

  const itemSummary = (() => {
    if (!order.items || order.items.length === 0) return t('No items');
    const firstItem = order.items[0];
    const firstTitle = firstItem.name;
    const remainingCount = order.items.length - 1;
    if (remainingCount > 0) {
      return `${firstTitle} ${t('+ {n} more', { n: remainingCount })}`;
    }
    return firstTitle;
  })();

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      onClick={() => onSelect(order)}
      className="bg-white rounded-2xl border border-black/[0.05] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-gray-300 transition-colors cursor-pointer space-y-2.5 select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-gray-950">#{order.id}</span>
            <span className="text-[11px] text-gray-400 font-medium">· {formatOrderTime(order.placedAt)}</span>
          </div>
          <p className="text-xs font-semibold text-gray-800 mt-1 truncate max-w-[220px]">
            {itemSummary}
          </p>
        </div>

        <div className="shrink-0">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-400 font-medium">{t('Total:')}</span>
          <span className="text-sm font-bold text-gray-950 tabular-nums">
            {formatPrice(order.bill?.total)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReorder(order);
            }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', damping: 20, stiffness: 400 }}
            className="h-8 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1.5 touch-manipulation transition-colors cursor-pointer shadow-2xs"
            aria-label={`Reorder items from #${order.id}`}
          >
            <RotateCw className="w-3 h-3 stroke-[2.25]" />
            <span>{t('Reorder')}</span>
          </motion.button>

          <div className="w-5 h-5 flex items-center justify-center text-gray-400">
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
