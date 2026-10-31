import React, { useState } from 'react';
import {
  Phone,
  CaretDown,
  CaretUp,
  Headset,
  Star,
  Check,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { ORDER_STATUSES } from '../lib/orderStatus';
import { useT } from '../lib/i18n';

/**
 * Vertical Timeline component used inside ActiveOrderCard (dark mode)
 * and OrderDetailsSheet (compact light mode).
 */
export function Timeline({ order, variant = 'dark', compact = false }) {
  const { t } = useT();
  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.PLACED;
  const activeStepIndex = statusConfig.stepIndex;
  const needsRxStep = Boolean(order.prescriptionRequired || order.rxUnderReview);
  const rxUnderReviewNow = Boolean(order.rxUnderReview && order.status !== 'DELIVERED' && order.status !== 'CANCELLED');

  const riderFirstName = (order.deliveryPartner?.name || 'Rahul').split(' ')[0];

  const getStepStatusLine = (key) => {
    if (order.statusSubtitle && (
      (rxUnderReviewNow && key === 'RX_REVIEW') ||
      (!rxUnderReviewNow && ORDER_STATUSES[key]?.stepIndex === activeStepIndex)
    )) {
      return order.statusSubtitle;
    }
    switch (key) {
      case 'PLACED':
        return t("We've sent your order to a nearby verified pharmacy.");
      case 'RX_REVIEW':
        return t("Our licensed pharmacist is verifying your uploaded Rx.");
      case 'CONFIRMED':
        return t("Pharmacy confirmed stock and started packing.");
      case 'PACKED':
        return t("Your order is packed. Rider's on the way.");
      case 'OUT_FOR_DELIVERY':
        return `${riderFirstName} is on the way`;
      case 'DELIVERED':
        return t("Delivered safely to your doorstep.");
      default:
        return '';
    }
  };

  const baseSteps = [
    {
      key: 'PLACED',
      label: t('Order placed'),
      timestamp: order.stepTimestamps?.PLACED || '11:42 PM',
      stepIdx: 0,
    },
    ...(needsRxStep
      ? [
          {
            key: 'RX_REVIEW',
            label: t('Prescription under review'),
            isRx: true,
            timestamp: order.stepTimestamps?.RX_REVIEW || (activeStepIndex >= 1 && !rxUnderReviewNow ? '11:43 PM' : ''),
            stepIdx: 0.5,
          },
        ]
      : []),
    {
      key: 'CONFIRMED',
      label: t('Pharmacy confirmed'),
      timestamp: order.stepTimestamps?.CONFIRMED || (activeStepIndex >= 1 && !rxUnderReviewNow ? '11:44 PM' : ''),
      stepIdx: 1,
    },
    {
      key: 'PACKED',
      label: t('Packed'),
      timestamp: order.stepTimestamps?.PACKED || (activeStepIndex >= 2 ? '11:48 PM' : ''),
      stepIdx: 2,
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: t('Out for delivery'),
      timestamp: order.stepTimestamps?.OUT_FOR_DELIVERY || (activeStepIndex >= 3 ? '11:51 PM' : ''),
      stepIdx: 3,
    },
    {
      key: 'DELIVERED',
      label: t('Delivered'),
      timestamp: order.stepTimestamps?.DELIVERED || (activeStepIndex >= 4 ? '11:58 PM' : ''),
      stepIdx: 4,
    },
  ];

  // Determine effective current step position (supports RX_REVIEW at 0.5)
  const effectivePosition = rxUnderReviewNow ? 0.5 : activeStepIndex;

  const isDark = variant === 'dark';

  return (
    <div className="relative">
      {baseSteps.map((step, idx) => {
        const isLast = idx === baseSteps.length - 1;
        const isDone =
          order.status === 'DELIVERED'
            ? true
            : step.stepIdx < effectivePosition;
        const isCurrent =
          order.status !== 'DELIVERED' &&
          order.status !== 'CANCELLED' &&
          step.stepIdx === effectivePosition;
        const isUpcoming = !isDone && !isCurrent;

        return (
          <div
            key={step.key}
            className={`relative flex items-start gap-3.5 ${
              isLast ? 'pb-0' : compact ? 'pb-4' : 'pb-5'
            }`}
          >
            {/* Connector Line to next step */}
            {!isLast && (
              <div
                aria-hidden="true"
                className={`absolute left-[11px] top-[22px] bottom-0 w-0 ${
                  isDone
                    ? isDark
                      ? 'border-l-2 border-solid border-[#C6F26B]'
                      : 'border-l-2 border-solid border-[#003820]'
                    : isDark
                    ? 'border-l-2 border-dashed border-white/25'
                    : 'border-l-2 border-dashed border-[#0E1A14]/20'
                }`}
              />
            )}

            {/* Step Dot */}
            <div className="relative z-10 flex items-center justify-center w-6 h-6 shrink-0 mt-0.5">
              {isDone && (
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-[#C6F26B] text-[#003820]' : 'bg-[#003820] text-[#C6F26B]'
                  }`}
                >
                  <Check weight="bold" className="w-2.5 h-2.5" />
                </span>
              )}

              {isCurrent && (
                <span className="relative flex items-center justify-center w-5 h-5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
                      isDark ? 'bg-[#C6F26B]' : 'bg-[#003820]'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full w-4 h-4 ${
                      isDark
                        ? 'bg-[#C6F26B] ring-4 ring-[#C6F26B]/25'
                        : 'bg-[#003820] ring-4 ring-[#003820]/20'
                    }`}
                  />
                </span>
              )}

              {isUpcoming && (
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 ${
                    isDark
                      ? 'border-white/35 bg-[#003820]'
                      : 'border-[#5E6B63]/45 bg-white'
                  }`}
                />
              )}
            </div>

            {/* Step Label + Timestamp + Status line */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span
                    className={`text-[15px] leading-snug ${
                      isCurrent
                        ? isDark
                          ? 'font-bold text-white'
                          : 'font-bold text-[#0E1A14]'
                        : isDone
                        ? isDark
                          ? 'font-medium text-white/90'
                          : 'font-medium text-[#0E1A14]'
                        : isDark
                        ? 'font-normal text-white/55'
                        : 'font-normal text-[#5E6B63]'
                    }`}
                  >
                    {step.label}
                  </span>

                  {step.isRx && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[999px] text-[14px] font-bold leading-none bg-[#D64538] text-white">
                      Rx
                    </span>
                  )}
                </div>

                {(isDone || isCurrent) && step.timestamp && (
                  <span
                    className={`text-[14px] tabular-nums shrink-0 ${
                      isDark ? 'text-white/75' : 'text-[#5E6B63]'
                    }`}
                  >
                    {step.timestamp}
                  </span>
                )}
              </div>

              {isCurrent && !compact && (
                <p
                  className={`mt-1 text-[14px] leading-relaxed ${
                    isDark ? 'text-[#C6F26B] font-medium' : 'text-[#5E6B63]'
                  }`}
                >
                  {getStepStatusLine(step.key)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * ActiveOrderCard — Deep green (#003820) hero card with white text and #C6F26B accents.
 */
export function ActiveOrderCard({
  order,
  onCancel,
  onSupport,
  isCancelling = false,
}) {
  const { t } = useT();
  const [billOpen, setBillOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const items = order.items || [];
  const itemCount = items.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
  const shortOrderId = order.displayId || `#${String(order._id || '').slice(-6).toUpperCase()}`;

  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.PLACED;
  const canCancel = statusConfig.stepIndex < 2; // Only before Packed (SEARCHING, PLACED, CONFIRMED)

  const etaHeadline = t('Arriving within 24 hrs');

  const partner = order.deliveryPartner || {
    name: 'Rahul Verma',
    rating: '4.9',
    phone: '+919876543210',
    otp: '4829',
  };

  const subtotal = order.subtotal || Math.max(0, (order.totalAmount || 0) - (order.deliveryFee || 0));
  const deliveryFee = order.deliveryFee ?? 0;

  return (
    <>
      <article className="bg-[#003820] text-white rounded-[16px] p-5 shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)] overflow-hidden">
        {/* Top Row: Live pill + Order ID & Item Count */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[999px] bg-white/10 text-[#C6F26B] text-[14px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#C6F26B] animate-pulse" />
            {order.pharmacy?.name || order.pharmacyName || 'Medix Verified Pharmacy'}
          </span>
          <span className="text-[14px] font-medium text-white/80 tabular-nums">
            {shortOrderId} · {itemCount} {itemCount === 1 ? t('item') : t('items')}
          </span>
        </div>

        {/* Big ETA Headline (Poppins 800, 28px) */}
        <h2 className="font-display font-extrabold text-[28px] leading-[1.15] tracking-[-0.02em] text-white mt-1 mb-5">
          {etaHeadline}
        </h2>

        {/* 5-Step Vertical Timeline (+ Rx review state when needed) */}
        <div className="bg-white/[0.06] rounded-[16px] p-4 mb-4">
          <Timeline order={order} variant="dark" />
        </div>

        {/* Delivery Partner Row: Name, Rating, Round Call button, 4-digit OTP in lime pill */}
        <div className="bg-white/[0.08] rounded-[16px] p-3.5 mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#C6F26B] text-[#003820] font-display font-extrabold text-[16px] flex items-center justify-center shrink-0">
              {(partner.name || 'R').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-white truncate">
                {partner.name}
              </p>
              <div className="flex items-center gap-1.5 text-[14px] text-white/80">
                <Star weight="fill" className="w-4 h-4 text-[#C6F26B] shrink-0" />
                <span className="font-bold text-white tabular-nums">{partner.rating || '4.9'}</span>
                <span className="text-white/60">· {t('Delivery Partner')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            {/* 4-digit delivery OTP shown in a lime pill */}
            <div
              className="inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-[999px] bg-[#C6F26B] text-[#003820]"
              title={t('Share this 4-digit OTP with your delivery partner')}
            >
              <span className="text-[14px] font-semibold uppercase tracking-wide">
                OTP
              </span>
              <span className="font-display font-extrabold text-[16px] tracking-wider tabular-nums">
                {partner.otp || '4829'}
              </span>
            </div>

            {/* Round Call Button */}
            <a
              href={`tel:${partner.phone || '+919876543210'}`}
              aria-label={`Call ${partner.name}`}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[999px] bg-white text-[#003820] flex items-center justify-center active:scale-95 transition-transform"
            >
              <Phone weight="bold" className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Collapsible "View items & bill" section below the timeline */}
        <div className="rounded-[16px] bg-white/[0.06] overflow-hidden mb-3">
          <button
            type="button"
            onClick={() => setBillOpen((prev) => !prev)}
            className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-left text-[15px] font-bold text-white active:bg-white/10 transition-colors"
          >
            <span>
              {t('View items & bill')} ({itemCount})
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[#C6F26B] tabular-nums">
                ₹{order.totalAmount}
              </span>
              {billOpen ? (
                <CaretUp weight="bold" className="w-4 h-4 text-white/80" />
              ) : (
                <CaretDown weight="bold" className="w-4 h-4 text-white/80" />
              )}
            </div>
          </button>

          {billOpen && (
            <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-2.5">
              {items.map((item, idx) => {
                const name = item.name || item.medicine?.name || 'Medicine';
                const qty = item.qty || item.quantity || 1;
                const price = (item.price || item.medicine?.price || 0) * qty;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 text-[14px] text-white/90"
                  >
                    <span className="truncate">
                      {qty} × {name}
                    </span>
                    <span className="font-semibold tabular-nums shrink-0">
                      ₹{price}
                    </span>
                  </div>
                );
              })}

              <div className="pt-2.5 border-t border-white/10 space-y-1.5 text-[14px]">
                <div className="flex items-center justify-between text-white/75">
                  <span>{t('Items total')}</span>
                  <span className="tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-white/75">
                  <span>{t('Delivery fee')}</span>
                  <span className="tabular-nums text-[#C6F26B] font-semibold">
                    {deliveryFee === 0 ? t('FREE') : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-white font-bold pt-1">
                  <span>
                    {t('Total')} ({order.paymentMethod || 'COD'})
                  </span>
                  <span className="font-display text-[16px] text-[#C6F26B] tabular-nums">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secondary actions: "Need help?" and "Cancel order" (only before Packed) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSupport && onSupport(order)}
            className="min-h-[44px] px-3 rounded-[999px] inline-flex items-center gap-2 text-[14px] font-bold text-white/90 hover:text-white active:scale-[0.98] transition-all"
          >
            <Headset weight="bold" className="w-4 h-4 text-[#C6F26B]" />
            {t('Need help?')}
          </button>

          {canCancel && onCancel && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => setConfirmCancelOpen(true)}
              className="min-h-[44px] px-3 rounded-[999px] text-[14px] font-semibold text-white/75 hover:text-white underline underline-offset-4 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isCancelling ? t('Cancelling...') : t('Cancel order')}
            </button>
          )}
        </div>
      </article>

      {/* Cancel Order Confirmation Dialog */}
      {confirmCancelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1A14]/60 backdrop-blur-xs"
          onClick={() => setConfirmCancelOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-[16px] p-5 shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#D64538]/10 text-[#D64538] flex items-center justify-center shrink-0">
                <WarningCircle weight="bold" className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(false)}
                aria-label="Close dialog"
                className="w-11 h-11 -mr-2 -mt-2 rounded-full flex items-center justify-center text-[#5E6B63]"
              >
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-display font-bold text-[18px] text-[#0E1A14] mb-1.5">
              {t('Cancel this order?')}
            </h3>
            <p className="text-[14px] text-[#5E6B63] leading-relaxed mb-5">
              {t('Your order')} <span className="font-semibold text-[#0E1A14]">{shortOrderId}</span>{' '}
              {t('has not been packed yet. Are you sure you want to cancel it?')}
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(false)}
                className="flex-1 min-h-[44px] rounded-[999px] bg-[#F7F4EC] text-[#0E1A14] text-[14px] font-bold active:scale-[0.98] transition-transform"
              >
                {t('Keep order')}
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => {
                  setConfirmCancelOpen(false);
                  onCancel(order._id);
                }}
                className="flex-1 min-h-[44px] rounded-[999px] bg-[#D64538] text-white text-[14px] font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {t('Yes, cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ActiveOrderCard;
