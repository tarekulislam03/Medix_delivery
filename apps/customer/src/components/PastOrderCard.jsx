import React from 'react';
import { RotateCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import { formatOrderTime } from '../lib/orderStatus';
import { formatPrice } from '../lib/fees';

export default function PastOrderCard({ order, onSelect, onReorder }) {
  // Format items summary: "Paracetamol 500mg + 2 more"
  const itemSummary = (() => {
    if (!order.items || order.items.length === 0) return 'No items';
    const firstItem = order.items[0];
    const firstTitle = firstItem.name;
    const remainingCount = order.items.length - 1;
    if (remainingCount > 0) {
      return `${firstTitle} + ${remainingCount} more`;
    }
    return firstTitle;
  })();

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={() => onSelect(order)}
      className="bg-surface rounded-card shadow-card border border-gray-100 p-3.5 hover:border-gray-200 transition-colors cursor-pointer space-y-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-ink">#{order.id}</span>
            <span className="text-[11px] text-ink-light">· {formatOrderTime(order.placedAt)}</span>
          </div>
          <p className="text-xs font-medium text-ink mt-0.5 truncate max-w-[220px]">
            {itemSummary}
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-ink-light">Total:</span>
          <span className="text-sm font-bold text-ink font-display tabular-nums">
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
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="min-h-[44px] px-3 py-1.5 bg-brand-light hover:bg-brand-green hover:text-white text-brand-green font-bold text-xs rounded-pill flex items-center gap-1.5 touch-manipulation transition-colors"
            aria-label={`Reorder items from #${order.id}`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reorder</span>
          </motion.button>

          <div className="w-6 h-6 flex items-center justify-center text-ink-lighter">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
