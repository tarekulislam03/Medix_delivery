import React, { memo } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QtyStepper from './QtyStepper';

const MedicineCard = memo(function MedicineCard({
  medicine,
  quantity = 0,
  onAdd,
  onIncrement,
  onDecrement,
}) {
  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="bg-surface rounded-card shadow-card border border-gray-100 p-4 flex items-center justify-between gap-3 transition-shadow"
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <h4 className="font-semibold text-sm text-ink truncate">{medicine.name}</h4>
          {medicine.requiresRx && (
            <span className="text-[11px] font-bold text-rose-600 shrink-0">
              Rx Required
            </span>
          )}
        </div>
        <p className="text-xs text-ink-light mt-0.5 truncate">{medicine.strength}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-sm font-bold text-brand-green font-display tabular-nums">
            ₹{medicine.price}
          </span>
          <span className="text-[10px] text-ink-lighter uppercase font-medium">MRP</span>
        </div>
      </div>

      <div className="flex-shrink-0">
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
              layout
              type="button"
              onClick={() => onAdd(medicine)}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="min-h-[44px] min-w-[76px] px-3.5 py-2 bg-surface border-2 border-brand-green hover:bg-brand-light text-brand-green text-xs font-bold rounded-pill flex items-center justify-center gap-1 shadow-sm touch-manipulation"
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
