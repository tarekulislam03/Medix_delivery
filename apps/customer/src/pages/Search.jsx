import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import SearchBar from '../components/SearchBar';
import FullScreenSearch from '../components/FullScreenSearch';
import LocationSheet from '../components/LocationSheet';
import MedicineCard from '../components/MedicineCard';
import SkeletonCard from '../components/SkeletonCard';
import CartBar from '../components/CartBar';

import { useCartStore } from '../store/cartStore';
import { useMedicines } from '../lib/useMedicines';
import { useT } from '../lib/i18n';

const HEALTH_SHORTCUTS = [
  { id: 'fever', label: 'Fever & Headache', query: 'dolo' },
  { id: 'cough', label: 'Cough & Cold', query: 'cough' },
  { id: 'acidity', label: 'Acidity & Gas', query: 'pan' },
  { id: 'pain', label: 'Pain & Sprain', query: 'pain' },
  { id: 'vitamins', label: 'Vitamins & Energy', query: 'zincovit' },
];

export default function Search() {
  const t = useT();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [activeSymptom, setActiveSymptom] = useState(null);

  // Cart Store selectors
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);

  // Map cart quantities
  const quantityMap = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  // Current active query based on selected symptom shortcut
  const activeSymptomQuery = useMemo(() => {
    if (!activeSymptom) return '';
    const match = HEALTH_SHORTCUTS.find((s) => s.id === activeSymptom);
    return match ? match.query : '';
  }, [activeSymptom]);

  // Medicines list
  const { medicines: displayedMedicines, isLoading } = useMedicines({
    query: activeSymptomQuery,
    popular: !activeSymptom,
    limit: !activeSymptom ? 24 : 50,
  });

  const handleSelectSymptom = (shortcut) => {
    setActiveSymptom((prev) => (prev === shortcut.id ? null : shortcut.id));
  };

  const clearAllFilters = () => {
    setActiveSymptom(null);
  };

  const handleAddToCart = (medicine) => {
    addItem(medicine);
  };

  const currentSymptomLabel = useMemo(() => {
    const match = HEALTH_SHORTCUTS.find((s) => s.id === activeSymptom);
    return match ? match.label : '';
  }, [activeSymptom]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-32 antialiased">
      <div className="max-w-md mx-auto relative">
        {/* 1. Translucent Frosted Glass Header */}
        <div className="sticky top-0 z-30">
          <SearchBar
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenLocation={() => navigate('/address?redirect=/search')}
            onOpenSignIn={() => navigate('/login?redirect=/search')}
          />
        </div>

        {/* 2. Main Body Content */}
        <div className="p-4 space-y-4">
          {/* Quick Relief by Health Symptom (Apple Capsule Grid) */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('Quick Relief by Symptom')}
              </span>
              {activeSymptom && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-emerald-600 font-semibold hover:underline active:opacity-70 transition-opacity"
                >
                  {t('Show all')}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x py-1 -mx-4 px-4">
              {HEALTH_SHORTCUTS.map((shortcut) => {
                const isActive = activeSymptom === shortcut.id;
                return (
                  <button
                    key={shortcut.id}
                    type="button"
                    onClick={() => handleSelectSymptom(shortcut)}
                    className={`shrink-0 h-10 px-4 rounded-2xl text-[13.5px] sm:text-sm font-semibold tracking-tight transition-all duration-150 touch-manipulation cursor-pointer flex items-center justify-center active:scale-95 select-none ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-gray-800 border border-black/[0.08] hover:bg-gray-50'
                    }`}
                  >
                    <span>{t(shortcut.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medicines Feed */}
          <div>
            <div className="flex items-baseline justify-between mb-3 px-1">
              <div>
                <h2 className="text-base font-bold text-gray-950 tracking-tight font-display">
                  {activeSymptom ? t(currentSymptomLabel) : t('Popular & Essential Medicines')}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeSymptom
                    ? t('{n} verified products available', { n: displayedMedicines.length })
                    : t('In stock nearby for 20-min delivery')}
                </p>
              </div>

              {activeSymptom && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  {t('Clear filter')}
                </button>
              )}
            </div>

            {/* Loading state: Skeleton cards */}
            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : displayedMedicines.length > 0 ? (
              /* Results List */
              <div className="space-y-2.5">
                {displayedMedicines.map((medicine) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    quantity={quantityMap[medicine.id] || 0}
                    onAdd={handleAddToCart}
                    onIncrement={increment}
                    onDecrement={decrement}
                  />
                ))}
              </div>
            ) : (
              /* Actionable Apple Recovery Empty State */
              <div className="py-12 px-4 text-center bg-white rounded-2xl border border-black/[0.04] space-y-3">
                <p className="text-sm font-semibold text-gray-900">
                  {t('No medicines found in this selection')}
                </p>
                <p className="text-xs text-gray-400 max-w-[240px] mx-auto">
                  {t('Try searching by medicine name or browse our popular essentials.')}
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex min-h-[38px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer touch-manipulation"
                >
                  {t('Browse All Medicines')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 5. Floating Cart Bar */}
        <CartBar />

        {/* 6. Full-Screen Search Modal */}
        <FullScreenSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* 7. Location Selection Sheet */}
        <LocationSheet
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
        />
      </div>
    </div>
  );
}
