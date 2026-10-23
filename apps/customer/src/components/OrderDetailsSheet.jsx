import React from 'react';
import { HelpCircle, MapPin, CreditCard, Store, Bike, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';
import StatusBadge from './StatusBadge';
import { formatPrice } from '../lib/fees';
import { formatOrderTime } from '../lib/orderStatus';
import { useT } from '../lib/i18n';

export default function OrderDetailsSheet({ order, isOpen, onClose, onNeedHelp }) {
  const t = useT();
  if (!order) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`${t('Order')} #${order.id}`}>
      <div className="space-y-4 pt-1 pb-4 select-none">
        {/* Status & Placed Time Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium">{t('Placed on')}</p>
            <p className="text-xs font-bold text-gray-950 mt-0.5">{formatOrderTime(order.placedAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Delivery OTP when Out For Delivery */}
        {order.status === 'OUT_FOR_DELIVERY' && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                {t('Delivery Verification OTP')}
              </span>
              <span className="text-[11px] text-gray-600 font-medium">{t('Give to rider upon receiving order:')}</span>
            </div>
            <span className="text-xl font-mono font-bold tracking-widest text-emerald-900 bg-white px-3 py-1 rounded-xl border border-emerald-200/60 shadow-xs">
              {order.deliveryOtp || '----'}
            </span>
          </div>
        )}

        {/* Pharmacy & Rider details if available */}
        {(order.pharmacy || order.rider) && (
          <div className="bg-gray-50/80 rounded-2xl p-3 space-y-2.5 border border-black/[0.04] text-xs">
            {order.pharmacy && (
              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-950">{order.pharmacy.name}</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">{order.pharmacy.address}</p>
                </div>
              </div>
            )}
            {order.rider && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                <div className="flex items-center gap-2.5">
                  <Bike className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-950">{order.rider.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{t('Delivery partner')}</p>
                  </div>
                </div>
                <a
                  href={`tel:${order.rider.phone}`}
                  className="h-8 px-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3 h-3 stroke-[2.25]" />
                  <span>{t('Call')}</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-0.5">
            {t('Items ({n})', { n: order.items?.length || 0 })}
          </h4>
          <div className="bg-white rounded-2xl border border-black/[0.05] divide-y divide-gray-100 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-gray-950">{item.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {t.num(item.quantity)} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-bold text-gray-950 tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-2xl border border-black/[0.05] p-3.5 space-y-2 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h4 className="font-bold uppercase tracking-wider text-gray-400 text-[11px]">
            {t('Bill Summary')}
          </h4>
          <div className="flex justify-between text-gray-500 font-medium">
            <span>{t('Subtotal')}</span>
            <span className="tabular-nums font-semibold text-gray-950">
              {formatPrice(order.bill?.subtotal)}
            </span>
          </div>
          {order.bill?.discount > 0 && (
            <div className="flex justify-between text-red-600 font-semibold">
              <span>{t('Discount')}</span>
              <span className="tabular-nums font-bold">-{formatPrice(order.bill?.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span>{t('Delivery fee')}</span>
              {order.bill?.delivery === 5 && (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full">
                  {t('70% OFF')}
                </span>
              )}
            </div>
            <span className="tabular-nums font-semibold text-gray-950">
              {order.bill?.delivery === 5 ? (
                <span className="flex items-center gap-1">
                  <span className="line-through text-gray-400 text-[11px]">{formatPrice(18)}</span>
                  <span className="text-emerald-700 font-bold">{formatPrice(5)}</span>
                </span>
              ) : (
                formatPrice(order.bill?.delivery)
              )}
            </span>
          </div>
          <div className="flex justify-between text-gray-500 font-medium">
            <span>{t('Platform fee')}</span>
            <span className="tabular-nums font-semibold text-gray-950">
              {formatPrice(order.bill?.platform)}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm text-gray-950">
            <span>{t('Total Paid')}</span>
            <span className="text-gray-950 tabular-nums">
              {formatPrice(order.bill?.total)}
            </span>
          </div>
        </div>

        {/* Delivery Address & Payment */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50/80 rounded-2xl p-3 border border-black/[0.04]">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('Delivery Address')}</span>
            </div>
            <p className="font-semibold text-gray-950 truncate">{order.address}</p>
          </div>

          <div className="bg-gray-50/80 rounded-2xl p-3 border border-black/[0.04]">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold mb-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('Payment')}</span>
            </div>
            <p className="font-semibold text-gray-950">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Need Help Button */}
        <motion.button
          type="button"
          onClick={onNeedHelp}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', damping: 20, stiffness: 400 }}
          className="w-full h-11 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 touch-manipulation transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-gray-500" />
          <span>{t('Need help with this order?')}</span>
        </motion.button>
      </div>
    </BottomSheet>
  );
}
