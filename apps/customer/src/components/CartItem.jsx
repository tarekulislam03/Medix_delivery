import React from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QtyStepper from './QtyStepper';
import { formatPrice } from '../lib/fees';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const lineTotal = item.price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        overflow: 'hidden',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-surface rounded-card shadow-card border border-gray-100 p-4 relative"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Medicine Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-semibold text-sm text-ink truncate">{item.name}</h4>
            {item.requiresRx && (
              <span className="text-[11px] font-bold text-rose-600 shrink-0">
                Rx Required
              </span>
            )}
          </div>
          <p className="text-xs text-ink-light mt-0.5 truncate">{item.strength}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xs text-ink-lighter tabular-nums">{formatPrice(item.price)} each</span>
            <span className="text-sm font-bold text-brand-green font-display tabular-nums">
              {formatPrice(lineTotal)}
            </span>
          </div>
        </div>

        {/* Stepper & Trash Action */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <QtyStepper
            quantity={item.quantity}
            onIncrement={() => onIncrement(item.id)}
            onDecrement={() => onDecrement(item.id)}
          />

          <motion.button
            type="button"
            onClick={() => onRemove(item.id)}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full touch-manipulation transition-colors"
            aria-label={`Remove ${item.name} from cart`}
          >
            <div className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
