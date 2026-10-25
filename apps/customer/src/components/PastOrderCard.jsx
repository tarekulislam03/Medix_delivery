import React from 'react';
import { ArrowCounterClockwise, CaretRight, Pill } from '@phosphor-icons/react';
import { formatOrderTime } from '../lib/orderStatus';
import { useT } from '../lib/i18n';

const THUMB_BG_PALETTE = [
  'bg-[#E3EFE8] text-[#003820]',
  'bg-[#EEF8D2] text-[#003820]',
  'bg-[#EFEAD8] text-[#0E1A14]',
];

export function PastOrderCard({ order, onReorder, onViewDetails }) {
  const { t } = useT();
  const items = order.items || [];
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  const pharmacyName =
    order.pharmacy?.name || order.pharmacyName || t('Medix Verified Pharmacy');
  const formattedTime = formatOrderTime(order.createdAt);

  // First 2 medicine names + "+N more"
  const firstTwoNames = items
    .slice(0, 2)
    .map((item) => item.name || item.medicine?.name || t('Medicine'))
    .join(', ');
  const extraCount = Math.max(0, items.length - 2);

  // Up to 3 overlapping circular pack thumbnails
  const thumbItems = items.slice(0, 3);

  return (
    <article className="bg-white rounded-[16px] p-4 transition-transform">
      {/* Top Row: Pharmacy Name + Quiet Status Tag */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-[16px] text-[#0E1A14] leading-snug truncate">
            {pharmacyName}
          </h3>
          <p className="text-[14px] text-[#5E6B63] mt-0.5 tabular-nums">
            {formattedTime}
          </p>
        </div>

        {/* Status tag: Delivered = green, Cancelled = red, small and quiet */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[999px] text-[14px] font-semibold leading-none shrink-0 ${
            isDelivered
              ? 'bg-[#E3EFE8] text-[#003820]'
              : isCancelled
              ? 'bg-[#D64538]/10 text-[#D64538]'
              : 'bg-[#F7F4EC] text-[#5E6B63]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDelivered
                ? 'bg-[#003820]'
                : isCancelled
                ? 'bg-[#D64538]'
                : 'bg-[#5E6B63]'
            }`}
          />
          {isDelivered ? t('Delivered') : isCancelled ? t('Cancelled') : order.status}
        </span>
      </div>

      {/* Middle Row: Up to 3 overlapping circular pack thumbnails + First 2 medicine names + "+N more" + Total paid */}
      <div className="flex items-center justify-between gap-3 py-2.5 bg-[#F7F4EC]/65 rounded-[12px] px-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          {/* Overlapping circular pack thumbnails */}
          <div className="flex items-center -space-x-2.5 shrink-0">
            {thumbItems.map((item, idx) => {
              const label = (item.name || item.medicine?.name || 'M')
                .trim()
                .slice(0, 2)
                .toUpperCase();
              const colorClass = THUMB_BG_PALETTE[idx % THUMB_BG_PALETTE.length];
              return (
                <div
                  key={idx}
                  className={`w-9 h-9 rounded-full ring-2 ring-white flex items-center justify-center font-display font-bold text-[14px] ${colorClass}`}
                  title={item.name || item.medicine?.name}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || 'Pack'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    label || <Pill weight="bold" className="w-4 h-4" />
                  )}
                </div>
              );
            })}
          </div>

          {/* First 2 medicine names + "+3 more" */}
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-[#0E1A14] leading-snug line-clamp-2">
              {firstTwoNames}
              {extraCount > 0 && (
                <span className="font-bold text-[#003820] ml-1">
                  +{extraCount} {t('more')}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="text-right shrink-0 pl-2">
          <span className="font-display font-extrabold text-[17px] text-[#0E1A14] tabular-nums block">
            ₹{order.totalAmount}
          </span>
          <span className="text-[14px] text-[#5E6B63]">
            {order.paymentMethod || 'COD'}
          </span>
        </div>
      </div>

      {/* Actions Row: Secondary "View details" & Primary "Reorder" full pill */}
      <div className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="min-h-[44px] px-4 rounded-[999px] bg-[#F7F4EC] text-[#0E1A14] text-[14px] font-bold inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <span>{t('View details')}</span>
          <CaretRight weight="bold" className="w-4 h-4 text-[#5E6B63]" />
        </button>

        <button
          type="button"
          onClick={() => onReorder(order)}
          className="flex-1 min-h-[44px] px-5 rounded-[999px] bg-[#003820] text-white text-[14px] font-bold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <ArrowCounterClockwise weight="bold" className="w-4 h-4 text-[#C6F26B]" />
          <span>{t('Reorder')}</span>
        </button>
      </div>
    </article>
  );
}

export default PastOrderCard;
