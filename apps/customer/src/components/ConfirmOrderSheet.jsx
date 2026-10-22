import React, { useState, useEffect } from 'react';
import { MapPin, Phone, User, ShieldCheck, CreditCard, ChevronRight, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';
import { formatPrice } from '../lib/fees';

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
  const [isSwiping, setIsSwiping] = useState(false);

  // Reset animation state whenever sheet opens or closes
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Confirm Delivery Address">
      <div className="pb-3 space-y-3.5">
        <p className="text-xs text-ink-light -mt-1 mb-3">
          Please review your delivery details before placing
        </p>

        {/* Delivery Details Card */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Delivering To
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
                <span>Change</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Recipient Name */}
          <div className="flex items-center gap-2 text-ink">
            <User className="w-4 h-4 text-brand-green shrink-0" />
            <span className="text-xs font-bold truncate">
              {fullName || 'Customer'}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-ink">
            <MapPin className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 leading-snug">
              <p className="font-semibold text-ink">{villagePo || 'Your Address'}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {landmark ? `Near ${landmark} · ` : ''}{pinCode ? `PIN: ${pinCode}` : ''}
              </p>
            </div>
          </div>

          {/* Verified Phone */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-xs">
            <div className="flex items-center gap-2 text-gray-700 font-mono">
              <Phone className="w-3.5 h-3.5 text-brand-green" />
              <span>+91 {phone || 'Not verified'}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-green">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Order & Payment Summary Mini Card */}
        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-green" />
            <span className="text-xs text-ink font-medium">
              {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / UPI'} · {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <span className="text-sm font-bold text-brand-green font-display">
            {formatPrice(bill?.total || 0)}
          </span>
        </div>

        {/* Simple Clickable Button with Left-to-Right Swipe Animation */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleClick}
            disabled={isSwiping || isSubmitting}
            className="relative w-full h-12 bg-brand-green hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md overflow-hidden transition-all touch-manipulation cursor-pointer flex items-center justify-between px-4 select-none active:scale-[0.99]"
          >
            {/* Left-to-Right Swipe Fill Wave */}
            {isSwiping && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.32, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
              />
            )}

            {/* Left-to-Right Progress Color Fill */}
            <motion.div
              initial={{ width: '0%' }}
              animate={isSwiping ? { width: '100%' } : { width: '0%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 bottom-0 bg-emerald-800/80 pointer-events-none"
            />

            {/* Button Text */}
            <div className="relative z-10 flex items-center gap-2">
              {isSwiping ? (
                <motion.div
                  initial={{ x: 0, opacity: 0.8 }}
                  animate={{ x: 12, opacity: 1 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Placing Order...</span>
                </motion.div>
              ) : (
                <span>Confirm & Place Order</span>
              )}
            </div>

            {/* Amount and Arrow */}
            <div className="relative z-10 flex items-center gap-1 font-display">
              <span>{formatPrice(bill?.total || 0)}</span>
              <motion.div
                animate={isSwiping ? { x: [0, 8, 24], opacity: [1, 1, 0] } : {}}
                transition={{ duration: 0.28, ease: 'easeIn' }}
              >
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.div>
            </div>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
