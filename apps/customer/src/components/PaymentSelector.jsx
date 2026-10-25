import React from 'react';
import { Banknote, Smartphone, Check } from 'lucide-react';
import { useT } from '../lib/i18n';

export default function PaymentSelector({ selectedMethod = 'cod', onSelectMethod }) {
  const t = useT();
  const options = [
    {
      id: 'cod',
      title: 'Cash on delivery',
      subtitle: 'Pay in cash when your medicines arrive',
      icon: Banknote,
      isAvailable: true,
    },
    {
      id: 'upi',
      title: 'UPI coming soon',
      subtitle: 'Google Pay, PhonePe, Paytm',
      icon: Smartphone,
      isAvailable: false,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-display font-extrabold text-[18px] tracking-[-0.02em] text-[#0E1A14] px-0.5">
        {t('payment.')}
      </h3>

      <div className="space-y-2.5">
        {options.map((opt) => {
          const isSelected = selectedMethod === opt.id && opt.isAvailable;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => {
                if (opt.isAvailable) {
                  onSelectMethod?.(opt.id);
                }
              }}
              className={`min-h-[68px] p-4 rounded-[16px] flex items-center justify-between gap-3 touch-manipulation select-none transition-transform duration-150 ${
                opt.isAvailable
                  ? 'bg-white cursor-pointer active:scale-[0.99]'
                  : 'bg-[#EFEAD8]/65 text-[#5E6B63] cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon
                  className={`w-5 h-5 stroke-[2.25] shrink-0 ${
                    opt.isAvailable ? 'text-[#003820]' : 'text-[#5E6B63]'
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-[15px] font-bold leading-snug ${
                      opt.isAvailable ? 'text-[#0E1A14]' : 'text-[#5E6B63]'
                    }`}
                  >
                    {t(opt.title)}
                  </p>
                  <p className="text-[14px] text-[#5E6B63] leading-snug mt-0.5 truncate">
                    {t(opt.subtitle)}
                  </p>
                </div>
              </div>

              {opt.isAvailable ? (
                <div
                  className={`w-6 h-6 rounded-[999px] flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#003820] text-[#C6F26B]'
                      : 'border-2 border-[#5E6B63]/40 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              ) : (
                <span className="text-[14px] font-medium text-[#5E6B63] shrink-0">
                  {t('Soon')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
