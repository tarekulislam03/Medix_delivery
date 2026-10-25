import React, { useEffect, useState } from 'react';
import {
  X,
  ArrowCounterClockwise,
  DownloadSimple,
  MapPin,
  Storefront,
  CreditCard,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { formatOrderTime } from '../lib/orderStatus';
import { Timeline } from './OrderCard';
import { useT } from '../lib/i18n';
import { PHARMACY_LICENCE_NO } from '../lib/medixMockData';

export default function OrderDetailsSheet({
  order,
  onClose,
  onReorder,
}) {
  const { t } = useT();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!order) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [order, onClose]);

  if (!order) return null;

  const items = order.items || [];
  const shortOrderId =
    order.displayId || `#${String(order._id || '').slice(-6).toUpperCase()}`;
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  const subtotal =
    order.subtotal ||
    items.reduce(
      (acc, item) =>
        acc +
        (item.price || item.medicine?.price || 0) *
          (item.qty || item.quantity || 1),
      0
    ) ||
    order.totalAmount;
  const deliveryFee = order.deliveryFee ?? 0;

  const handleDownloadInvoice = () => {
    setDownloading(true);
    setTimeout(() => {
      const invoiceLines = [
        `MEDIX PHARMACY TAX INVOICE`,
        `====================================`,
        `Order ID: ${shortOrderId}`,
        `Date: ${formatOrderTime(order.createdAt)}`,
        `Pharmacy: ${order.pharmacy?.name || 'Medix Verified Pharmacy'}`,
        `Drug Licence: ${order.pharmacy?.licenceNo || PHARMACY_LICENCE_NO}`,
        `Status: ${order.status}`,
        `Payment Method: ${order.paymentMethod || 'Cash on Delivery (COD)'}`,
        `------------------------------------`,
        `ITEMS:`,
        ...items.map((item) => {
          const name = item.name || item.medicine?.name || 'Medicine';
          const qty = item.qty || item.quantity || 1;
          const unitPrice = item.price || item.medicine?.price || 0;
          return `${qty}x ${name}  -  Rs.${unitPrice * qty}`;
        }),
        `------------------------------------`,
        `Items Subtotal: Rs.${subtotal}`,
        `Delivery Fee: ${deliveryFee === 0 ? 'FREE' : `Rs.${deliveryFee}`}`,
        `Total Paid: Rs.${order.totalAmount}`,
        `====================================`,
        `Thank you for ordering with Medix.`,
      ].join('\n');

      const blob = new Blob([invoiceLines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Medix-Invoice-${shortOrderId.replace('#', '')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0E1A14]/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#F7F4EC] rounded-t-[24px] sm:rounded-[24px] max-h-[88vh] flex flex-col overflow-hidden shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-full flex justify-center pt-3 pb-1 bg-white">
          <div className="w-10 h-1.5 rounded-full bg-[#0E1A14]/15" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3.5 bg-white flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-[20px] text-[#0E1A14]">
                {t('order details.')}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[999px] text-[14px] font-semibold ${
                  isDelivered
                    ? 'bg-[#E3EFE8] text-[#003820]'
                    : isCancelled
                    ? 'bg-[#D64538]/10 text-[#D64538]'
                    : 'bg-[#EEF8D2] text-[#003820]'
                }`}
              >
                {isDelivered
                  ? t('Delivered')
                  : isCancelled
                  ? t('Cancelled')
                  : order.status}
              </span>
            </div>
            <p className="text-[14px] text-[#5E6B63] tabular-nums mt-0.5">
              {shortOrderId} · {formatOrderTime(order.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#F7F4EC] text-[#0E1A14] flex items-center justify-center active:scale-95 transition-transform"
          >
            <X weight="bold" className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Compact Full Timeline */}
          <section className="bg-white rounded-[16px] p-4">
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#5E6B63] mb-3">
              {t('Order Timeline')}
            </h3>
            {isCancelled ? (
              <div className="flex items-start gap-3 p-3 rounded-[12px] bg-[#D64538]/10 text-[#D64538]">
                <WarningCircle weight="bold" className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-[14px]">
                  <p className="font-bold">{t('Order was cancelled')}</p>
                  <p className="text-[#5E6B63] mt-0.5">
                    {order.cancelReason ||
                      t('Cancelled before packing. No amount was charged.')}
                  </p>
                </div>
              </div>
            ) : (
              <Timeline order={order} variant="light" compact />
            )}
          </section>

          {/* Itemised Bill */}
          <section className="bg-white rounded-[16px] p-4">
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#5E6B63] mb-3">
              {t('Itemised Bill')} ({items.length})
            </h3>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const name = item.name || item.medicine?.name || t('Medicine');
                const pack = item.packSize || item.medicine?.packSize || '';
                const qty = item.qty || item.quantity || 1;
                const unitPrice = item.price || item.medicine?.price || 0;
                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 text-[15px]"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0E1A14] leading-snug">
                        {qty} × {name}
                      </p>
                      {pack && (
                        <p className="text-[14px] text-[#5E6B63]">{pack}</p>
                      )}
                    </div>
                    <span className="font-display font-bold text-[#0E1A14] tabular-nums shrink-0">
                      ₹{unitPrice * qty}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#0E1A14]/10 space-y-2 text-[14px]">
              <div className="flex items-center justify-between text-[#5E6B63]">
                <span>{t('Items subtotal')}</span>
                <span className="tabular-nums font-medium text-[#0E1A14]">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5E6B63]">
                <span>{t('Delivery fee')}</span>
                <span className="tabular-nums font-bold text-[#003820]">
                  {deliveryFee === 0 ? t('FREE') : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#0E1A14]/10">
                <span className="font-bold text-[15px] text-[#0E1A14]">
                  {t('Total paid')}
                </span>
                <span className="font-display font-extrabold text-[18px] text-[#003820] tabular-nums">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </section>

          {/* Payment Method + Pharmacy + Delivery Address */}
          <section className="bg-white rounded-[16px] p-4 space-y-3.5">
            <div className="flex items-start gap-3">
              <CreditCard
                weight="bold"
                className="w-5 h-5 text-[#003820] shrink-0 mt-0.5"
              />
              <div>
                <p className="text-[14px] text-[#5E6B63]">{t('Payment method')}</p>
                <p className="text-[15px] font-bold text-[#0E1A14]">
                  {order.paymentMethod || t('Cash on Delivery (COD)')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-[#0E1A14]/8">
              <Storefront
                weight="bold"
                className="w-5 h-5 text-[#003820] shrink-0 mt-0.5"
              />
              <div>
                <p className="text-[14px] text-[#5E6B63]">{t('Dispensed by')}</p>
                <p className="text-[15px] font-bold text-[#0E1A14]">
                  {order.pharmacy?.name || t('Medix Verified Pharmacy')}
                </p>
                <p className="text-[14px] text-[#5E6B63]">
                  DL No: {order.pharmacy?.licenceNo || PHARMACY_LICENCE_NO}
                </p>
              </div>
            </div>

            {order.deliveryAddress?.addressLine && (
              <div className="flex items-start gap-3 pt-3 border-t border-[#0E1A14]/8">
                <MapPin
                  weight="bold"
                  className="w-5 h-5 text-[#003820] shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[14px] text-[#5E6B63]">
                    {t('Delivered to')}
                  </p>
                  <p className="text-[14px] font-medium text-[#0E1A14] leading-snug">
                    {order.deliveryAddress.addressLine}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Bottom Sheet Sticky Actions: "Download invoice" + "Reorder" */}
        <div className="p-4 bg-white border-t border-[#0E1A14]/8 flex items-center gap-2.5 pb-safe">
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex-1 min-h-[48px] px-4 rounded-[999px] bg-[#F7F4EC] text-[#0E1A14] text-[14px] font-bold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {downloaded ? (
              <>
                <CheckCircle weight="bold" className="w-4 h-4 text-[#003820]" />
                <span>{t('Invoice saved')}</span>
              </>
            ) : (
              <>
                <DownloadSimple weight="bold" className="w-4 h-4 text-[#003820]" />
                <span>
                  {downloading ? t('Downloading...') : t('Download invoice')}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onReorder(order);
            }}
            className="flex-1 min-h-[48px] px-5 rounded-[999px] bg-[#003820] text-white text-[14px] font-bold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ArrowCounterClockwise
              weight="bold"
              className="w-4 h-4 text-[#C6F26B]"
            />
            <span>{t('Reorder')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
