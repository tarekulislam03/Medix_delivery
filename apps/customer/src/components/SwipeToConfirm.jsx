import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronRight, ArrowRight, Check } from 'lucide-react';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function SwipeToConfirm({ onConfirm, total = 0, isSubmitting = false }) {
  const t = useT();
  const trackRef = useRef(null);
  const [maxDrag, setMaxDrag] = useState(200);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const x = useMotionValue(0);

  // Measure track width dynamically
  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.offsetWidth;
        const thumbWidth = 44; // size of the draggable thumb
        const padding = 8;
        setMaxDrag(Math.max(60, trackWidth - thumbWidth - padding));
      }
    };

    updateWidth();
    // Run after layout renders
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Progress fill following the thumb
  const fillWidth = useTransform(x, (val) => `${val + 48}px`);
  const textOpacity = useTransform(x, [0, maxDrag * 0.55], [1, 0.05]);

  const handleDragEnd = (_, info) => {
    if (isConfirmed || isSubmitting) return;

    // If dragged beyond 68% or high flick velocity towards right
    if (x.get() >= maxDrag * 0.68 || (info && info.velocity.x > 250)) {
      setIsConfirmed(true);
      animate(x, maxDrag, { type: 'spring', stiffness: 500, damping: 30 });
      // Instantly trigger confirm without blocking
      setTimeout(() => {
        onConfirm?.();
      }, 100);
    } else {
      // Spring back to start
      animate(x, 0, { type: 'spring', stiffness: 450, damping: 28 });
    }
  };

  return (
    <div
      ref={trackRef}
      className="relative w-full h-13 bg-emerald-50 border border-emerald-200 rounded-full p-1 overflow-hidden select-none touch-none shadow-xs"
    >
      {/* Expanding gradient fill following the thumb */}
      <motion.div
        style={{ width: fillWidth }}
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600 to-brand-green rounded-full pointer-events-none"
      />

      {/* Shimmering Center Text */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-12"
      >
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-900 tracking-wide uppercase">
          <span>{t('Swipe to place order')}</span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center text-brand-green"
          >
            <ChevronRight className="w-3.5 h-3.5 -mr-1.5" />
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>
          {total > 0 && (
            <span className="font-bold text-brand-green ml-1 tabular-nums">
              · {formatPrice(total)}
            </span>
          )}
        </div>
      </motion.div>

      {/* Draggable Circle Thumb */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className="relative z-10 w-11 h-11 rounded-full bg-white border border-emerald-300 shadow-md flex items-center justify-center text-brand-green cursor-grab active:cursor-grabbing touch-none"
      >
        {isConfirmed ? (
          <Check className="w-5 h-5 text-brand-green stroke-[3]" />
        ) : (
          <ArrowRight className="w-5 h-5 text-brand-green stroke-[2.5]" />
        )}
      </motion.div>
    </div>
  );
}
