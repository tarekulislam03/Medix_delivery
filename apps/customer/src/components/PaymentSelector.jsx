import React from 'react';
import { Smartphone, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '../lib/i18n';

export default function PaymentSelector({ selectedMethod = 'cod', onSelectMethod }) {
  const t = useT();
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
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-0.5">
        {t('Payment Method')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedMethod === opt.id && opt.isAvailable;
          const Icon = opt.icon;

          return (
            <motion.div
              key={opt.id}
              whileTap={opt.isAvailable ? { scale: 0.98 } : {}}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
              onClick={() => {
                if (opt.isAvailable) {
                  onSelectMethod?.(opt.id);
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between min-h-[56px] touch-manipulation select-none ${
                opt.isAvailable
                  ? isSelected
                    ? 'border-emerald-600/50 bg-emerald-50/40 shadow-xs cursor-pointer ring-1 ring-emerald-600/20'
                    : 'border-black/[0.06] bg-white hover:border-gray-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer'
                  : 'border-black/[0.04] bg-gray-50/70 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    opt.isAvailable
                      ? isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-xs font-bold tracking-tight ${opt.isAvailable ? 'text-gray-950' : 'text-gray-500'}`}>
                      {t(opt.title)}
                    </p>
                    {!opt.isAvailable && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 uppercase tracking-wider">
                        {t(opt.unavailableTag || 'Unavailable')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">
                    {t(opt.subtitle)}
                  </p>
                </div>
              </div>

              {/* iOS-style Radio Circle */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  opt.isAvailable
                    ? isSelected
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-gray-300 bg-white'
                    : 'border-gray-300 bg-gray-100'
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                    className="w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
