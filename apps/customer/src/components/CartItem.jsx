import React from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QtyStepper from './QtyStepper';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const t = useT();
  const lineTotal = item.price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.96,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        overflow: 'hidden',
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="bg-white rounded-2xl border border-black/[0.05] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Medicine Details */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="font-semibold text-sm text-gray-950 tracking-tight truncate">
            {item.name}
          </h4>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xs text-gray-400 font-medium tabular-nums">
              {t('{price} each', { price: formatPrice(item.price) })}
            </span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {formatPrice(lineTotal)}
            </span>
          </div>
        </div>

        {/* Stepper & Trash Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <QtyStepper
            quantity={item.quantity}
            onIncrement={() => onIncrement(item.id)}
            onDecrement={() => onDecrement(item.id)}
          />

          <motion.button
            type="button"
            onClick={() => onRemove(item.id)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', damping: 20, stiffness: 400 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 touch-manipulation transition-colors cursor-pointer select-none"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="w-4 h-4 stroke-[2]" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
