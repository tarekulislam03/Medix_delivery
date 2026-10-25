import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../lib/i18n';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const t = useT();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [visibleHeight, setVisibleHeight] = useState('85dvh');
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setKeyboardOffset(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => {
      if (typeof window === 'undefined' || !window.visualViewport) return;

      const vv = window.visualViewport;
      const windowH = window.innerHeight;
      const offset = Math.max(0, windowH - vv.height);

      if (offset > 60) {
        setKeyboardOffset(offset);
        setVisibleHeight(`${Math.max(240, Math.floor(vv.height - 16))}px`);
      } else {
        setKeyboardOffset(0);
        setVisibleHeight('85dvh');
      }
    };

    handleViewportChange();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', handleViewportChange);
      vv.addEventListener('scroll', handleViewportChange);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', handleViewportChange);
        vv.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleFocusIn = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          try {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch {}
        }, 220);
      }
    };

    const container = sheetRef.current;
    container?.addEventListener('focusin', handleFocusIn);
    return () => container?.removeEventListener('focusin', handleFocusIn);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0E1A14]/45"
          />

          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
            style={{
              maxHeight: visibleHeight,
              marginBottom: keyboardOffset > 0 ? `${keyboardOffset}px` : '0px',
              paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
              boxShadow: '0 -12px 36px rgba(14, 26, 20, 0.18)',
            }}
            className="relative w-full max-w-md bg-[#F7F4EC] text-[#0E1A14] rounded-t-[24px] sm:rounded-[24px] p-5 z-10 overflow-y-auto overscroll-contain"
          >
            <div className="w-10 h-1.5 bg-[#5E6B63]/30 rounded-[999px] mx-auto mb-3 sm:hidden" />

            {title && (
              <div className="flex items-center justify-between pb-3 mb-3">
                <h3 className="font-display font-extrabold text-[22px] tracking-[-0.02em] text-[#0E1A14]">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 rounded-[999px] bg-white active:scale-[0.94] transition-transform duration-150 flex items-center justify-center touch-manipulation cursor-pointer"
                  aria-label={t('Close')}
                >
                  <X className="w-5 h-5 text-[#0E1A14] stroke-[2.25]" />
                </button>
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
