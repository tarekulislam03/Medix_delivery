import React, { useState, useEffect } from 'react';
import { MapPin, Phone, User, ShieldCheck, CreditCard, ChevronRight, ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function ConfirmOrderSheet({
  isOpen,
  onClose,
  onConfirm,
  onChangeAddress,
  fullName,
  phone,
  villagePo,
  pinCode,
  landmark,
  paymentMethod,
  bill,
  itemsCount = 1,
  isSubmitting = false,
}) {
  const t = useT();
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSwiping(false);
    }
  }, [isOpen]);

  const handleClick = () => {
    if (isSwiping || isSubmitting) return;
    setIsSwiping(true);

    // Left-to-right swipe animation runs for 280ms, then immediately confirms
    setTimeout(() => {
      onConfirm?.();
    }, 280);
  };
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('Confirm Delivery Details')}>
      <div className="pb-3 space-y-3.5">
        <p className="text-xs text-ink-light -mt-1 mb-3">
          {t('Please review your delivery details before placing your order')}
        </p>

        {/* Delivery Details Card */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('Delivering To')}
            </span>
            {onChangeAddress && (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onChangeAddress();
                }}
                className="text-xs font-semibold text-brand-green hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{t('Change')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Recipient Name */}
          <div className="flex items-center gap-2 text-ink">
            <User className="w-4 h-4 text-brand-green shrink-0" />
            <span className="text-xs font-bold truncate">
              {fullName || t('Customer')}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-ink">
            <MapPin className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 leading-snug">
              <p className="font-semibold text-ink">{villagePo || t('Your Address')}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {landmark ? t('Near {landmark}', { landmark }) + ' · ' : ''}{pinCode ? t('PIN: {pin}', { pin: pinCode }) : ''}
              </p>
            </div>
          </div>

          {/* Delivery Contact Phone */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-xs">
            <div className="flex items-center gap-2 text-gray-700 font-mono">
              <Phone className="w-3.5 h-3.5 text-brand-green" />
              <span>+91 {phone || t('Required')}</span>
            </div>
            <span className="text-[11px] font-medium text-gray-500">
              {t('Delivery Contact')}
            </span>
          </div>
        </div>

        {/* Order & Payment Summary Mini Card */}
        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-green" />
            <span className="text-xs text-ink font-medium">
              {paymentMethod === 'cod' ? t('Cash on Delivery') : t('Online / UPI')} · {t.num(itemsCount)} {t(itemsCount === 1 ? 'item' : 'items')}
            </span>
          </div>
          <span className="text-sm font-bold text-brand-green tabular-nums">
            {formatPrice(bill?.total || 0)}
          </span>
        </div>

        {/* Big Solid Confirm Order Button with Left-to-Right Swipe Animation */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={isSubmitting || isSwiping}
            className="relative w-full h-14 bg-brand-green hover:bg-emerald-700 active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl shadow-elevated transition-all touch-manipulation cursor-pointer flex items-center justify-between px-5 select-none overflow-hidden"
          >
            {/* Left-to-Right Progress Color Fill */}
            <motion.div
              initial={{ width: '0%' }}
              animate={isSwiping ? { width: '100%' } : { width: '0%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 bottom-0 bg-emerald-800/90 pointer-events-none"
            />

            {/* Left-to-Right Swipe Fill Wave */}
            {isSwiping && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.32, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
              />
            )}

            <div className="relative z-10 flex items-center gap-2.5">
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5 stroke-[3]" />
              )}
              <span>{isSubmitting ? t('Placing Order...') : isSwiping ? t('Confirming...') : t('Confirm & Place Order')}</span>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 tabular-nums text-base">
              <span>{formatPrice(bill?.total || 0)}</span>
              {!isSubmitting && (
                <motion.div
                  animate={isSwiping ? { x: [0, 8, 24], opacity: [1, 1, 0] } : {}}
                  transition={{ duration: 0.28, ease: 'easeIn' }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </div>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
