import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QtyStepper from './QtyStepper';
import { useT } from '../lib/i18n';

const MedicineCard = memo(function MedicineCard({
  medicine,
  quantity = 0,
  onAdd,
  onIncrement,
  onDecrement,
}) {
  const t = useT();
  const location = useLocation();
  const isBabyCare = location.pathname.startsWith('/baby-care');

  const addBtnClasses = isBabyCare
    ? 'bg-[#CE6A85]/15 hover:bg-[#CE6A85]/25 active:bg-[#CE6A85]/30 text-[#BF5B76]'
    : 'bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/25 text-emerald-700';
  return (
    <motion.div
      layout
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-3.5 flex items-center justify-between gap-3 select-none hover:border-black/[0.1] transition-colors"
    >
      {/* Medicine Info */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center min-w-0">
          <h4 className="font-bold text-[15px] sm:text-base text-gray-950 truncate tracking-tight">
            {medicine.name}
          </h4>
        </div>

        {/* Price & MRP */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[15px] sm:text-base font-bold text-gray-950 tabular-nums">
            ₹{t.num(medicine.price)}
          </span>
          <span className="text-xs font-semibold text-gray-400 tracking-wide">MRP</span>
        </div>
      </div>

      {/* Action / Stepper Button */}
      <div className="shrink-0">
        <AnimatePresence mode="wait">
          {quantity > 0 ? (
            <QtyStepper
              key="stepper"
              quantity={quantity}
              onIncrement={() => onIncrement(medicine.id)}
              onDecrement={() => onDecrement(medicine.id)}
            />
          ) : (
            <motion.button
              key="add-btn"
              type="button"
              onClick={() => onAdd(medicine)}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', damping: 20, stiffness: 350 }}
              className={`min-h-[36px] min-w-[70px] px-3.5 py-1.5 ${addBtnClasses} text-xs font-bold rounded-full flex items-center justify-center gap-1 touch-manipulation cursor-pointer transition-colors`}
              aria-label={`Add ${medicine.name} to cart`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ADD</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default MedicineCard;
