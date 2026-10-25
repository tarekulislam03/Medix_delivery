import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useT } from '../lib/i18n';

export default function QtyStepper({ quantity, onIncrement, onDecrement }) {
  const t = useT();

  return (
    <div className="inline-flex items-center min-h-[44px] bg-[#003820] text-white rounded-[999px] p-1 select-none">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        aria-label={t('Decrease quantity')}
        className="w-9 h-9 rounded-[999px] bg-white/14 hover:bg-white/22 active:scale-[0.92] transition-all duration-150 flex items-center justify-center text-white cursor-pointer touch-manipulation"
      >
        <Minus className="w-4 h-4 stroke-[2.5]" />
      </button>

      <div className="px-2.5 min-w-[30px] text-center overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={quantity}
            initial={{ y: 8, opacity: 0, scale: 0.88 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
            className="font-display text-[15px] font-bold text-[#C6F26B] tabular-nums inline-block"
          >
            {t.num(quantity)}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        aria-label={t('Increase quantity')}
        className="w-9 h-9 rounded-[999px] bg-[#C6F26B] active:scale-[0.92] transition-all duration-150 flex items-center justify-center text-[#0E1A14] cursor-pointer touch-manipulation"
      >
        <Plus className="w-4 h-4 stroke-[2.6]" />
      </button>
    </div>
  );
}
