import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [visibleHeight, setVisibleHeight] = useState('85dvh');
  const sheetRef = useRef(null);

  // Prevent background scrolling while open
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

  // Mobile Keyboard Detection via Visual Viewport API
  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => {
      if (typeof window === 'undefined' || !window.visualViewport) return;

      const vv = window.visualViewport;
      const windowH = window.innerHeight;
      const offset = Math.max(0, windowH - vv.height);

      if (offset > 60) {
        // Keyboard is active
        setKeyboardOffset(offset);
        setVisibleHeight(`${Math.max(240, Math.floor(vv.height - 16))}px`);
      } else {
        // Keyboard closed
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

  // Auto-scroll focused input into clear view above keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusIn = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          try {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch {
            // fallback
          }
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Sheet container */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              maxHeight: visibleHeight,
              marginBottom: keyboardOffset > 0 ? `${keyboardOffset}px` : '0px',
              transition: 'margin-bottom 0.2s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-elevated z-10 overflow-y-auto overscroll-contain"
          >
            {/* Grab handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header if title present */}
            {title && (
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <h3 className="text-base font-bold text-ink">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center touch-manipulation cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-600" />
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
