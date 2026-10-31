import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, X, SearchX, Loader2, TrendingUp, ChevronDown } from 'lucide-react';

import MedicineCard from './MedicineCard';
import CartBar from './CartBar';
import { useCartStore } from '../store/cartStore';
import { useMedicines } from '../lib/useMedicines';
import { useT } from '../lib/i18n';

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
  const t = useT();
  const location = useLocation();
  const isBabyCare = location.pathname.startsWith('/baby-care');
  const [query, setQuery] = useState(initialQuery);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_LIMIT);
  const inputRef = useRef(null);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);

  const quantityMap = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  const { medicines, isLoading, isFetching } = useMedicines({
    query,
    popular: true,
    limit: query ? 80 : 20,
  });

  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_LIMIT);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuery]);

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
    <div className="fixed inset-0 z-50 bg-[#F7F4EC] text-[#0E1A14] flex flex-col overflow-hidden">
      {/* Top Deep Green Search Header */}
      <div
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        }}
        className="bg-[#003820] px-5 pb-4 flex items-center gap-3"
      >
        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 rounded-[999px] bg-white/12 hover:bg-white/18 active:scale-[0.95] transition-transform duration-150 flex items-center justify-center text-white touch-manipulation shrink-0 cursor-pointer"
          aria-label={t('Back to home')}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
        </button>

        <div className="relative flex-1 flex items-center">
          <div className="absolute left-4 pointer-events-none flex items-center justify-center">
            {isFetching ? (
              <Loader2 className="w-5 h-5 text-[#003820] animate-spin" />
            ) : (
              <SearchIcon className="w-5 h-5 text-[#003820] stroke-[2.4]" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isBabyCare
                ? t('Search diapers, formula, baby care...')
                : t('Search medicines, salts, symptoms...')
            }
            className="w-full h-[48px] pl-12 pr-11 bg-white rounded-[999px] text-[16px] font-medium text-[#0E1A14] placeholder:text-[#5E6B63] focus:outline-none touch-manipulation"
            aria-label={t('Search medicines input')}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 w-9 h-9 rounded-[999px] bg-[#EFEAD8] active:scale-[0.94] transition-transform duration-150 flex items-center justify-center text-[#0E1A14] touch-manipulation cursor-pointer"
              aria-label={t('Clear search')}
            >
              <X className="w-4 h-4 stroke-[2.4]" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Results Area */}
      <div className="flex-1 overflow-y-auto overscroll-contain max-w-md w-full mx-auto px-5 py-5 space-y-5 pb-32">
        {!isTyping && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[14px] font-bold text-[#5E6B63]">
              <TrendingUp className="w-4 h-4 text-[#003820] stroke-[2.25]" />
              <span>{t('Most searched medicines')}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="min-h-[40px] px-4 bg-white rounded-[999px] text-[14px] font-medium text-[#0E1A14] active:scale-[0.96] transition-transform duration-150 touch-manipulation cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-1">
          <h3 className="font-display font-extrabold text-[22px] tracking-[-0.02em] text-[#0E1A14]">
            {isTyping ? `${t.num(medicines.length)} results.` : 'essential medicines.'}
          </h3>
          <span className="text-[14px] text-[#5E6B63] font-medium">
            {isTyping ? t('Verified stock') : t('24-hr delivery')}
          </span>
        </div>

        {visibleMedicines.length > 0 ? (
          <div className="space-y-3">
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

            {hasMore && (
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 25)}
                className="w-full min-h-[48px] mt-3 bg-white rounded-[999px] text-[14px] font-bold text-[#003820] flex items-center justify-center gap-2 touch-manipulation cursor-pointer active:scale-[0.98] transition-transform duration-150"
              >
                <span>{t('Show more ({n} remaining)', { n: medicines.length - visibleMedicines.length })}</span>
                <ChevronDown className="w-4 h-4 stroke-[2.4]" />
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#003820] animate-spin mb-3" />
            <p className="text-[14px] text-[#5E6B63] font-medium">{t('Searching pharmacy catalog...')}</p>
          </div>
        ) : (
          <div className="py-12 px-6 bg-white rounded-[16px] text-center flex flex-col items-center justify-center space-y-2">
            <SearchX className="w-8 h-8 text-[#5E6B63] stroke-[2] mb-1" />
            <h4 className="font-display font-bold text-[18px] text-[#0E1A14]">{t('No medicines found.')}</h4>
            <p className="text-[14px] text-[#5E6B63] max-w-[260px]">
              {t('We couldn\'t find "{q}". Check spelling or search by salt name.', { q: query })}
            </p>
          </div>
        )}
      </div>

      <CartBar />
    </div>
  );
}
