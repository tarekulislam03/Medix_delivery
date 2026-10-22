import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Search as SearchIcon, X, SearchX, Loader2, TrendingUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import MedicineCard from './MedicineCard';
import CartBar from './CartBar';
import { useCartStore } from '../store/cartStore';
import { useMedicines } from '../lib/useMedicines';

const POPULAR_SEARCH_TAGS = [
  'Augmentin',
  'Pan 40',
  'Calpol 650',
  'Dolo 650',
  'Azithral',
  'Telma 40',
  'Shelcal 500',
  'Thyronorm',
  'Liv 52',
  'Montair LC',
  'Becosules',
  'Electral',
];

const INITIAL_DISPLAY_LIMIT = 25;

export default function FullScreenSearch({ isOpen, onClose, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_LIMIT);
  const inputRef = useRef(null);

  // Cart Store selectors and actions
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);

  // Map of cart quantities
  const quantityMap = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  // Fetch medicines using cached TanStack Query with smart ranking
  const { medicines, isLoading, isFetching } = useMedicines({
    query,
    popular: true,
    limit: query ? 80 : 20,
  });

  // Reset display count when query changes
  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_LIMIT);
  }, [query]);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuery]);

  // Lock body scroll when search overlay is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const isTyping = query.trim().length > 0;
  const visibleMedicines = medicines.slice(0, displayCount);
  const hasMore = medicines.length > displayCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
      >
        {/* Top Sticky Search Header */}
        <div className="bg-white border-b border-gray-100 shadow-xs px-3 py-2.5 flex items-center gap-2">
          {/* Back button */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-light hover:text-ink hover:bg-gray-100 transition-colors touch-manipulation flex-shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Full-width Search Input */}
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 pointer-events-none flex items-center justify-center">
              {isFetching ? (
                <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
              ) : (
                <SearchIcon className="w-4 h-4 text-brand-green" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 6,500+ medicines, salts, syrups..."
              className="w-full h-11 pl-10 pr-10 bg-gray-50 focus:bg-white rounded-pill text-sm font-medium text-ink placeholder:text-gray-400 border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition-all touch-manipulation"
              aria-label="Search medicines input"
            />

            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors touch-manipulation"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4 pb-28">
          {/* Trending Suggestions when not searching */}
          {!isTyping && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                <span>Popular Searches</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-brand-green hover:border-emerald-200 border border-gray-200/70 rounded-full text-xs font-medium text-gray-700 transition-colors touch-manipulation"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              {isTyping ? `Matching Medicines (${medicines.length})` : 'Trending'}
            </h3>
            {isTyping ? (
              <span className="text-[11px] text-brand-green font-medium">Lightning-fast search</span>
            ) : (
              <span className="text-[11px] text-ink-lighter">Top 20 in India</span>
            )}
          </div>

          {/* Medicines List */}
          {visibleMedicines.length > 0 ? (
            <div className="space-y-2.5">
              {visibleMedicines.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  quantity={quantityMap[medicine.id] || 0}
                  onAdd={addItem}
                  onIncrement={increment}
                  onDecrement={decrement}
                />
              ))}

              {/* Show more button if search has many matches */}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setDisplayCount((prev) => prev + 25)}
                  className="w-full py-2.5 mt-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors touch-manipulation"
                >
                  <span>Show More Results ({medicines.length - visibleMedicines.length} remaining)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : isLoading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-brand-green animate-spin mb-2" />
              <p className="text-xs text-ink-light">Searching medicines database...</p>
            </div>
          ) : (
            /* Empty state */
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <SearchX className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-sm text-ink">No medicines found</h4>
              <p className="text-xs text-ink-light mt-1 max-w-[240px]">
                We couldn't find any medicine matching "{query}". Check spelling or search by chemical salt.
              </p>
            </div>
          )}
        </div>

        {/* Floating Cart Bar at bottom of full-screen search */}
        <CartBar />
      </motion.div>
    </AnimatePresence>
  );
}
