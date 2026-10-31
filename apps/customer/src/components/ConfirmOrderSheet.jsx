import React, { useState, useEffect } from 'react';
import { MapPin, Phone, User, CreditCard, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
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
  totalUnits = 1,
  isSubmitting = false,
  errorMessage = null,
}) {
  const t = useT();
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (!isOpen || !isSubmitting) {
      setIsSwiping(false);
    }
  }, [isOpen, isSubmitting]);

  const handleClick = () => {
    if (isSwiping || isSubmitting) return;
    setIsSwiping(true);

    setTimeout(() => {
      onConfirm?.();
    }, 260);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('confirm order.')}>
      <div className="pb-2 space-y-4">
        <p className="text-[15px] text-[#5E6B63] -mt-2">
          {t('Review your delivery address before placing your order.')}
        </p>

        {/* Delivery Details Card */}
        <div className="p-4 rounded-[16px] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#5E6B63]">
              {t('Delivering to')}
            </span>
            {onChangeAddress && (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onChangeAddress();
                }}
                className="min-h-[36px] px-3 rounded-[999px] bg-[#E3EFE8] text-[14px] font-bold text-[#003820] flex items-center gap-1 cursor-pointer active:scale-[0.96] transition-transform duration-150"
              >
                <span>{t('Change')}</span>
                <ChevronRight className="w-4 h-4 stroke-[2.25]" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-[#0E1A14]">
            <User className="w-4 h-4 text-[#003820] stroke-[2.25] shrink-0" />
            <span className="text-[15px] font-bold truncate select-text">
              {fullName || t('Customer')}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-[#0E1A14]">
            <MapPin className="w-4 h-4 text-[#003820] stroke-[2.25] shrink-0 mt-1" />
            <div className="text-[15px] text-[#0E1A14] leading-snug select-text">
              <p className="font-bold">{villagePo || t('Your Address')}</p>
              <p className="text-[14px] text-[#5E6B63] mt-0.5">
                {landmark ? t('Near {landmark}', { landmark }) + ' · ' : ''}
                {pinCode ? t('PIN: {pin}', { pin: pinCode }) : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-[#F7F4EC] text-[14px]">
            <div className="flex items-center gap-2 text-[#0E1A14] font-bold select-text">
              <Phone className="w-4 h-4 text-[#003820] stroke-[2.25]" />
              <span>+91 {phone || t('Required')}</span>
            </div>
            <span className="text-[14px] font-medium text-[#5E6B63]">
              {t('Contact')}
            </span>
          </div>
        </div>

        {/* Order & Payment Summary Mini Card */}
        <div className="p-4 rounded-[16px] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#003820] stroke-[2.25]" />
            <div>
              <p className="text-[15px] text-[#0E1A14] font-bold">
                {paymentMethod === 'cod' ? t('Cash on delivery') : t('UPI')}
              </p>
              <p className="text-[14px] text-[#5E6B63]">
                {t.num(totalUnits)} {totalUnits === 1 ? t('item') : t('items')} · {t.num(itemsCount)}{' '}
                {itemsCount === 1 ? t('medicine') : t('medicines')}
              </p>
            </div>
          </div>
          <span className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#003820] tabular-nums">
            {formatPrice(bill?.total || 0)}
          </span>
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-[13.5px] font-medium leading-snug">
            {errorMessage}
          </div>
        )}

        {/* Confirm Order Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleClick}
            disabled={isSubmitting || isSwiping}
            className="relative w-full min-h-[56px] bg-[#003820] disabled:bg-[#EFEAD8] text-white text-[16px] font-display font-bold tracking-[-0.02em] rounded-[999px] transition-transform duration-150 active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-between pl-6 pr-2.5 select-none overflow-hidden"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={isSwiping ? { width: '100%' } : { width: '0%' }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 bottom-0 bg-[#002615] pointer-events-none"
            />

            <div className="relative z-10 flex items-center gap-2.5">
              {isSubmitting && (
                <Loader2 className="w-5 h-5 animate-spin text-[#C6F26B]" />
              )}
              <span>
                {isSubmitting
                  ? t('Placing order...')
                  : isSwiping
                    ? t('Confirming...')
                    : t('Confirm & place order')}
              </span>
            </div>

            <div className="relative z-10 w-10 h-10 rounded-full bg-[#C6F26B] text-[#0E1A14] flex items-center justify-center shrink-0">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0E1A14]" />
              ) : (
                <ArrowRight className="w-4 h-4 stroke-[2.6]" />
              )}
            </div>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
