import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, X, SearchX, Loader2, Sparkles } from 'lucide-react';

import MedicineCard from '../components/MedicineCard';
import SkeletonCard from '../components/SkeletonCard';
import CartBar from '../components/CartBar';
import ElasticScroll from '../components/ElasticScroll';

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

const INITIAL_DISPLAY_LIMIT = 30;

export default function Search() {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_LIMIT);
  const inputRef = useRef(null);

  const haptic = (ms = 8) => {
    try {
      navigator.vibrate?.(ms);
    } catch {}
  };

  // Cart store
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const quantityMap = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  // Query medicines
  const { medicines, isLoading, isFetching } = useMedicines({
    query,
    popular: true,
    limit: query ? 80 : 30,
  });

  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_LIMIT);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
  };

  const handleTagClick = (tag) => {
    haptic(8);
    setQuery(tag);
    setSearchParams({ q: tag });
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const isTyping = query.trim().length > 0;
  const visibleMedicines = medicines.slice(0, displayCount);
  const hasMore = medicines.length > displayCount;

  return (
    <div className={`min-h-screen bg-[#F7F4EC] text-[#0E1A14] flex flex-col ${totalItems > 0 ? 'pb-24' : 'pb-8'}`}>
      {/* Sticky Native Search Header */}
      <header
        style={{
          paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))',
          background: 'radial-gradient(120% 180% at 50% 0%, #0B4A2A 0%, #003820 100%)',
          boxShadow: '0 6px 20px rgba(0, 56, 32, 0.22)',
        }}
        className="sticky top-0 z-40 w-full text-white pb-3.5 px-3 sm:px-4"
      >
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          {/* Back to Home Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/12 text-white flex items-center justify-center shrink-0 cursor-pointer touch-manipulation active:scale-[0.94] transition-transform"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.3]" />
          </button>

          {/* Search Input Box */}
          <div className="flex-1 h-11 bg-white rounded-full px-3.5 flex items-center gap-2.5 shadow-sm">
            <SearchIcon className="w-4 h-4 text-[#003820] stroke-[2.4] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder={t('Search Dolo 650, Pan 40, fever, cough...')}
              className="flex-1 bg-transparent text-[14px] sm:text-[15px] font-medium text-[#0E1A14] placeholder-[#5E6B63] outline-none"
            />
            {isFetching && <Loader2 className="w-4 h-4 text-[#003820] animate-spin shrink-0" />}
            {query && !isFetching && (
              <button
                type="button"
                onClick={handleClear}
                className="w-5 h-5 rounded-full bg-[#0E1A14]/10 hover:bg-[#0E1A14]/20 flex items-center justify-center shrink-0"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-[#0E1A14]" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Suggestion Tags */}
        <div className="max-w-md mx-auto mt-3 overflow-x-auto no-scrollbar -mx-3 px-3 flex items-center gap-1.5">
          {POPULAR_SEARCH_TAGS.map((tag) => {
            const isSelected = query.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap touch-manipulation transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C6F26B] text-[#003820] shadow-xs'
                    : 'bg-white/12 text-white/90 hover:bg-white/20'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Search Results Feed with Elastic iOS Rubber-Banding */}
      <ElasticScroll className="flex-1 w-full pt-3 pb-2">
        <main className="max-w-md mx-auto w-full px-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : visibleMedicines.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-[#5E6B63] uppercase tracking-wider">
                  {isTyping
                    ? `${medicines.length} ${medicines.length === 1 ? t('result') : t('results')} found`
                    : t('Popular Essentials')}
                </span>
              </div>

              {visibleMedicines.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  quantity={quantityMap[medicine.id] || 0}
                  onAdd={(med) => {
                    haptic(10);
                    addItem(med);
                  }}
                  onIncrement={increment}
                  onDecrement={decrement}
                />
              ))}

              {hasMore && (
                <div className="pt-2 pb-6 text-center">
                  <button
                    type="button"
                    onClick={() => setDisplayCount((prev) => prev + 25)}
                    className="px-5 py-2.5 bg-white border border-[#0E1A14]/10 rounded-full text-[13.5px] font-bold text-[#003820] shadow-xs touch-manipulation active:scale-[0.97]"
                  >
                    {t('Load more medicines')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 px-4 text-center space-y-3 bg-white rounded-2xl border border-[#0E1A14]/6 shadow-xs mt-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#003820]/8 flex items-center justify-center text-[#003820]">
                <SearchX className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="font-display text-[17px] font-bold text-[#0E1A14]">
                {t("No medicines found matching")} "{query}"
              </p>
              <p className="text-[13.5px] text-[#5E6B63] max-w-[260px] mx-auto">
                {t('Try searching with generic salt name (e.g. Paracetamol) or brand name.')}
              </p>
            </div>
          )}
        </main>
      </ElasticScroll>

      {/* Floating Cart Bar */}
      <CartBar />
    </div>
  );
}
