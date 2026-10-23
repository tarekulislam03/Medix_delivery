import React, { useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Check,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

// Confetti pieces generation
const CONFETTI_COLORS = ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
const CONFETTI_SHAPES = ['circle', 'rect', 'strip'];

export default function OrderSuccess() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const order = location.state?.order;

  // Invalidate and refetch orders so Orders screen always has the latest data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);

  // If directly navigated without an active order, redirect to orders tab
  useEffect(() => {
    if (!order) {
      navigate('/orders', { replace: true });
    }
  }, [order, navigate]);

  const payload = location.state?.payload || {};
  const customerName = payload.customerName || payload.address?.fullName || 'Customer';
  const villagePo = payload.address?.villagePo || order?.address || 'Your Address';
  const pinCode = payload.address?.pinCode || '';
  const landmark = payload.address?.landmark || '';
  const totalAmount = order?.bill?.total || payload.bill?.total || 0;
  const paymentMethod = order?.paymentMethod || 'Cash on Delivery';

  // Generate 28 confetti pieces with randomized angles, distances, and delays
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * 360 + (Math.random() * 20 - 10);
      const rad = (angle * Math.PI) / 180;
      const distance = 90 + Math.random() * 110;
      return {
        id: i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance - 20,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
        size: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
        delay: 0.1 + (i % 6) * 0.04,
      };
    });
  }, []);

  const handleDone = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.refetchQueries({ queryKey: ['orders'] });
    navigate('/orders', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-gray-50 flex flex-col justify-between p-5 pt-10 sm:py-12 max-w-md mx-auto relative overflow-hidden select-none">
      {/* Background Decorative Blur Circles */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-60 h-60 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center text-center justify-center relative z-10 py-6">
        {/* Animated Checkmark and Confetti Burst */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          {/* Confetti Particles */}
          {confettiPieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                scale: [0, 1.2, 0.9, 0],
                x: [0, p.x, p.x * 1.15],
                y: [0, p.y, p.y + 60],
                opacity: [1, 1, 0.8, 0],
                rotate: [0, p.rotation, p.rotation + 180],
              }}
              transition={{
                duration: 1.6,
                delay: p.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.shape === 'strip' ? p.size * 2 : p.size,
                borderRadius: p.shape === 'circle' ? '9999px' : '2px',
                backgroundColor: p.color,
              }}
            />
          ))}

          {/* Single Entrance Ripple Rings (plays once, then stops) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.55, opacity: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-emerald-400"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-teal-300"
          />

          {/* Core Green Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 22,
              delay: 0.05,
            }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-green to-emerald-400 text-white flex items-center justify-center shadow-elevated relative z-10"
          >
            {/* SVG Animated Stroke Drawing Checkmark */}
            <svg
              className="w-12 h-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.28,
                  ease: 'easeOut',
                }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Headline & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
          className="space-y-1.5"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>{t('Order Confirmed')}</span>
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight font-display">
            {t('Order Placed Successfully!')}
          </h1>
          <p className="text-xs text-ink-light max-w-[280px] mx-auto leading-relaxed">
            {t('Your order has been sent to our verified partner pharmacy in your area.')}
          </p>
        </motion.div>

        {/* Estimated Time Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.45 }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-100 shadow-xs"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-ink">
            Estimated delivery <strong className="text-brand-green font-bold">within 24 hrs</strong>
          </span>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="w-full mt-6 bg-white rounded-2xl border border-gray-100 shadow-card p-4 text-left space-y-3"
        >
          {/* Order ID Row */}
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 text-xs">
            <span className="text-ink-lighter uppercase font-bold text-[10px] tracking-wider">
              {t('Order Number')}
            </span>
            <span className="font-mono font-bold text-ink bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              #{order.id}
            </span>
          </div>

          {/* Delivery To */}
          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-ink truncate">{customerName}</p>
              <p className="text-gray-500 text-[11px] leading-snug">
                {villagePo}
                {landmark ? ` (Near ${landmark})` : ''}
                {pinCode ? `, PIN: ${pinCode}` : ''}
              </p>
            </div>
          </div>

          {/* Payment & Amount */}
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500">
              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
              <span>{paymentMethod === 'cod' || paymentMethod === 'Cash on delivery' ? t('Cash on Delivery') : t('Online / UPI')}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-gray-400 uppercase">{t('Total:')}</span>
              <span className="text-sm font-bold text-brand-green tabular-nums">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Floating "Done" Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
        className="w-full pt-4 pb-2 relative z-10"
      >
        <button
          type="button"
          onClick={handleDone}
          className="w-full h-12 bg-brand-green hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold rounded-pill shadow-elevated transition-all touch-manipulation flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{t('Done')}</span>
        </button>
      </motion.div>
    </div>
  );
}
