import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

export default function CartBar() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="max-w-md mx-auto pointer-events-auto"
          >
            <Link to="/cart" className="block touch-manipulation">
              <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-full min-h-[52px] bg-brand-green hover:bg-brand-dark text-white rounded-pill px-5 py-3 shadow-elevated flex items-center justify-between font-medium cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide font-display tabular-nums">
                    View cart · {totalItems} {totalItems === 1 ? 'item' : 'items'} · ₹{totalPrice}
                  </span>
                </div>

                <div className="flex items-center text-white/90">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
