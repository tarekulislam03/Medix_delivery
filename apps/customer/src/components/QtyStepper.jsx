import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QtyStepper({ quantity, onIncrement, onDecrement }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="inline-flex items-center bg-brand-light border border-brand-green/30 rounded-pill shadow-sm overflow-hidden"
    >
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        aria-label="Decrease quantity"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-dark hover:bg-brand-green/10 touch-manipulation"
      >
        <Minus className="w-3.5 h-3.5" />
      </motion.button>

      <span className="px-2 min-w-[20px] text-center text-xs font-bold text-brand-dark select-none">
        {quantity}
      </span>

      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        aria-label="Increase quantity"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-dark hover:bg-brand-green/10 touch-manipulation"
      >
        <Plus className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}
