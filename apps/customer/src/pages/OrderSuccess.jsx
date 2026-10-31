import React, { useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  ArrowRight,
  CreditCard,
  Zap,
  Copy,
  Check,
  PackageCheck,
  ShieldCheck,
  Home,
} from 'lucide-react';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

// Confetti pieces generation with Medix brand palette
const CONFETTI_COLORS = ['#003820', '#C6F26B', '#059669', '#10B981', '#F59E0B', '#14532D', '#84CC16'];
const CONFETTI_SHAPES = ['circle', 'rect', 'strip'];

export default function OrderSuccess() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState(false);
  const order = location.state?.order;

  // Invalidate and refetch orders so Orders tab stays up to date
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
  const customerName = payload.customerName || payload.address?.fullName || order?.customerName || order?.address?.fullName || 'Customer';
  const villagePo = payload.address?.villagePo || (typeof order?.address === 'object' ? order?.address?.villagePo : order?.address) || order?.rawAddress?.villagePo || 'Your Address';
  const pinCode = payload.address?.pinCode || (typeof order?.address === 'object' ? order?.address?.pinCode : '') || order?.rawAddress?.pinCode || '';
  const landmark = payload.address?.landmark || (typeof order?.address === 'object' ? order?.address?.landmark : '') || order?.rawAddress?.landmark || '';
  const totalAmount = order?.bill?.total || order?.totalAmount || payload.bill?.total || 0;
  const paymentMethod = order?.paymentMethod || payload.paymentMethod || 'cod';
  const deliveryOtp = order?.deliveryOtp || order?.handoverPin || '';
  const itemsCount = order?.items?.length || payload.itemsCount || 1;
  const displayOrderId = order?.orderNumber || order?.orderId || order?.id || order?._id || 'MDX';

  // Generate 28 confetti pieces with randomized angles and trajectories
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * 360 + (Math.random() * 20 - 10);
      const rad = (angle * Math.PI) / 180;
      const distance = 95 + Math.random() * 115;
      return {
        id: i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance - 20,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
        size: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
        delay: 0.08 + (i % 6) * 0.04,
      };
    });
  }, []);

  const handleCopyOrderId = () => {
    if (!displayOrderId) return;
    try {
      navigator.clipboard?.writeText(displayOrderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleGoToOrders = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.refetchQueries({ queryKey: ['orders'] });
    navigate('/orders', { replace: true });
  };

  const handleGoHome = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    navigate('/', { replace: true });
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#0E1A14] flex flex-col justify-between p-4 sm:p-6 pt-8 sm:pt-12 max-w-md mx-auto relative overflow-hidden select-none antialiased">
      {/* Background Radial Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#003820]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-64 h-64 bg-[#C6F26B]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center text-center justify-center relative z-10 py-4">
        {/* Animated Celebration Badge & Confetti */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-5">
          {/* Confetti Particles */}
          {confettiPieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                scale: [0, 1.25, 0.9, 0],
                x: [0, p.x, p.x * 1.15],
                y: [0, p.y, p.y + 65],
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
                borderRadius: p.shape === 'circle' ? '9999px' : '3px',
                backgroundColor: p.color,
              }}
            />
          ))}

          {/* Ripple Rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-[#C6F26B]"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-[#003820]/40"
          />

          {/* Core Forest Green Emblem with Lime Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 22,
              delay: 0.05,
            }}
            style={{
              boxShadow: '0 14px 38px -6px rgba(0, 56, 32, 0.42)',
            }}
            className="w-24 h-24 rounded-full bg-[#003820] text-white flex items-center justify-center relative z-10"
          >
            <svg
              className="w-12 h-12 text-[#C6F26B]"
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
                  duration: 0.45,
                  delay: 0.28,
                  ease: 'easeOut',
                }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Headline & Delivery Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
          className="space-y-1.5"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EFE8] text-[#003820] text-[12px] font-bold tracking-tight mb-0.5">
            <Zap className="w-3.5 h-3.5 text-[#003820] fill-[#003820]" />
            <span>24 hr Delivery</span>
          </div>

          <h1 className="font-display font-extrabold text-[32px] sm:text-[34px] tracking-[-0.03em] leading-tight text-[#0E1A14]">
            order placed<span className="text-[#003820]">.</span>
          </h1>

          <p className="text-[14px] text-[#5E6B63] max-w-[300px] mx-auto leading-relaxed">
            {t('Your order has been sent to our verified partner pharmacy in your area.')}
          </p>
        </motion.div>

        {/* Apple-Style Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{
            boxShadow: '0 10px 32px -6px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
          className="w-full mt-5 bg-white rounded-[22px] border border-[#0E1A14]/8 p-4 sm:p-5 text-left space-y-3.5"
        >
          {/* Order ID & Status Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#0E1A14]/6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6B63] block">
                {t('Order Number')}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="inline-flex items-center gap-1.5 font-mono text-[13px] font-bold text-[#0E1A14] hover:text-[#003820] cursor-pointer touch-manipulation transition-colors mt-0.5"
              >
                <span>#{displayOrderId}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#5E6B63]" />
                )}
              </button>
            </div>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EFE8] text-[#003820] text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t('Packing')}</span>
            </div>
          </div>

          {/* Delivery Handover PIN (if available) */}
          {deliveryOtp && (
            <div className="p-3 rounded-[14px] bg-[#F7F4EC] border border-[#0E1A14]/6 flex items-center justify-between">
              <div>
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#5E6B63] block">
                  {t('Delivery Handover PIN')}
                </span>
                <span className="text-[11.5px] text-[#5E6B63]">
                  {t('Share this PIN with rider upon delivery')}
                </span>
              </div>
              <span className="font-mono text-[20px] font-extrabold tracking-widest text-[#003820] bg-white px-3 py-1 rounded-[10px] border border-[#0E1A14]/10 shadow-2xs">
                {deliveryOtp}
              </span>
            </div>
          )}

          {/* Delivery Address */}
          <div className="flex items-start gap-3 pt-0.5">
            <div className="w-8 h-8 rounded-full bg-[#E3EFE8] text-[#003820] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold text-[#0E1A14] truncate">{customerName}</p>
              <p className="text-[13px] text-[#5E6B63] leading-snug mt-0.5">
                {villagePo}
                {landmark ? ` · Near ${landmark}` : ''}
                {pinCode ? ` · PIN ${pinCode}` : ''}
              </p>
            </div>
          </div>

          {/* Payment & Total Amount */}
          <div className="flex items-center justify-between pt-3 border-t border-[#0E1A14]/6">
            <div className="flex items-center gap-2 text-[#5E6B63] text-[13px] font-medium">
              <CreditCard className="w-4 h-4 text-[#003820] stroke-[2]" />
              <span className="capitalize">
                {paymentMethod === 'cod' ? t('Cash on delivery') : t('Online / UPI')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#5E6B63] uppercase tracking-wider mr-1.5">
                {t('Total')}
              </span>
              <span className="font-display text-[20px] font-extrabold text-[#003820] tabular-nums">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons: Track Order (Primary) & Back to Home (Secondary) */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
        className="w-full pt-3 pb-2 relative z-10 space-y-2.5"
      >
        <button
          type="button"
          onClick={handleGoToOrders}
          style={{
            boxShadow: '0 12px 32px -4px rgba(0, 56, 32, 0.32)',
          }}
          className="w-full h-[52px] bg-[#003820] hover:bg-[#004d2c] active:scale-[0.98] text-white text-[15px] font-bold font-display rounded-full transition-all touch-manipulation flex items-center justify-center gap-2 cursor-pointer"
        >
          <PackageCheck className="w-4 h-4 stroke-[2.4]" />
          <span>{t('Track Order')}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={handleGoHome}
          className="w-full h-[46px] bg-white hover:bg-neutral-50 active:scale-[0.98] text-[#003820] text-[14px] font-bold font-display rounded-full border border-[#0E1A14]/10 transition-all touch-manipulation flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Home className="w-4 h-4 stroke-[2.3]" />
          <span>{t('Back to Home')}</span>
        </button>
      </motion.div>
    </div>
  );
}
