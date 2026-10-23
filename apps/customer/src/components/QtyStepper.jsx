import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '../lib/i18n';

export default function QtyStepper({ quantity, onIncrement, onDecrement }) {
  const t = useT();

  return (
    <div className="inline-flex items-center bg-gray-100/90 rounded-full p-0.5 border border-black/[0.04] select-none">
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        aria-label={t('Decrease quantity')}
        className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] cursor-pointer touch-manipulation transition-colors"
      >
        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
      </motion.button>

      <span className="px-2 min-w-[26px] text-center text-xs font-bold text-gray-950 font-mono tabular-nums">
        {t.num(quantity)}
      </span>

      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        aria-label={t('Increase quantity')}
        className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] cursor-pointer touch-manipulation transition-colors"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </motion.button>
    </div>
  );
}
