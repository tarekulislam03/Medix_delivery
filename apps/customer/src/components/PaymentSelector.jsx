import React from 'react';
import { Smartphone, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSelector({ selectedMethod = 'cod', onSelectMethod }) {
  const options = [
    {
      id: 'cod',
      title: 'Cash on delivery',
      subtitle: 'Pay with cash upon receiving medicines',
      icon: Banknote,
      isAvailable: true,
    },
    {
      id: 'upi',
      title: 'UPI (Online)',
      subtitle: 'Google Pay, PhonePe, Paytm, QR',
      icon: Smartphone,
      isAvailable: false,
      unavailableTag: 'Unavailable',
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted px-0.5">
        Payment Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedMethod === opt.id && opt.isAvailable;
          const Icon = opt.icon;

          return (
            <motion.div
              key={opt.id}
              whileTap={opt.isAvailable ? { scale: 0.98 } : {}}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onClick={() => {
                if (opt.isAvailable) {
                  onSelectMethod?.(opt.id);
                }
              }}
              className={`p-3.5 rounded-card border transition-all flex items-center justify-between min-h-[54px] touch-manipulation ${
                opt.isAvailable
                  ? isSelected
                    ? 'border-brand-green bg-emerald-50/50 shadow-xs cursor-pointer'
                    : 'border-gray-200 bg-surface hover:border-gray-300 cursor-pointer'
                  : 'border-gray-200/70 bg-gray-50/70 opacity-65 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    opt.isAvailable
                      ? isSelected
                        ? 'bg-brand-light text-brand-green'
                        : 'bg-gray-100 text-gray-500'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-xs font-bold ${opt.isAvailable ? 'text-ink' : 'text-gray-500'}`}>
                      {opt.title}
                    </p>
                    {!opt.isAvailable && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 uppercase tracking-wide">
                        {opt.unavailableTag || 'Unavailable'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-light leading-none mt-1 truncate">
                    {opt.subtitle}
                  </p>
                </div>
              </div>

              {/* Radio Circle or Lock */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  opt.isAvailable
                    ? isSelected
                      ? 'border-brand-green bg-brand-green'
                      : 'border-gray-300 bg-white'
                    : 'border-gray-300 bg-gray-100'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
