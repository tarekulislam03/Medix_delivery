import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

import SearchBar from '../components/SearchBar';
import FullScreenSearch from '../components/FullScreenSearch';
import LocationSheet from '../components/LocationSheet';
import PrescriptionCard from '../components/PrescriptionCard';
import MedicineCard from '../components/MedicineCard';
import SkeletonCard from '../components/SkeletonCard';
import CartBar from '../components/CartBar';

import { useCartStore } from '../store/cartStore';
import { useMedicines, useMedicineCategories } from '../lib/useMedicines';

const DEFAULT_CATEGORIES = [
  'All',
  'Tablets',
  'Syrups & Liquids',
  'Baby Care',
  'Eye & Ear Drops',
  'Creams & Ointments',
  'Capsules',
  'Personal Care',
  'Powders & Supplements',
  'Inhalers & Sprays',
];

export default function Search() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart store selectors and actions
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);

  // Map of cart quantities by item ID
  const quantityMap = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  // Fetch dynamic categories from backend
  const { data: serverCategories = [] } = useMedicineCategories();
  const categories = useMemo(() => {
    if (serverCategories.length > 0) {
      return ['All', ...serverCategories.map((c) => c.name)];
    }
    return DEFAULT_CATEGORIES;
  }, [serverCategories]);

  // Dynamic medicines from backend via cached TanStack Query
  const { medicines: displayedMedicines, isLoading } = useMedicines({
    category: selectedCategory,
    popular: selectedCategory === 'All',
    limit: selectedCategory === 'All' ? 20 : 50,
  });

  const handleSelectCategory = (category) => {
    setSelectedCategory((prev) => (prev === category ? 'All' : category));
  };

  return (
    <div className="min-h-screen bg-white text-ink pb-28">
      <div className="max-w-md mx-auto relative">
        {/* 1. Sticky Header: SearchBar (Trigger for FullScreenSearch) */}
        <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md">
          <SearchBar
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenLocation={() => setIsLocationOpen(true)}
          />
        </div>

        <div className="p-4 space-y-4">
          {/* Promotional Advertisement Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl py-2.5 px-3.5 text-white shadow-sm border border-emerald-500/40 text-center">
            {/* Subtle Left-to-Right Shimmer Light Sweep */}
            <motion.div
              initial={{ x: '-150%' }}
              animate={{ x: '300%' }}
              transition={{
                repeat: Infinity,
                repeatType: 'loop',
                duration: 2.2,
                ease: 'easeInOut',
                repeatDelay: 1.2,
              }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] pointer-events-none z-10"
            />

            <div className="relative z-0 flex flex-col items-center justify-center text-center">
              <h3 className="text-sm sm:text-base font-black text-white leading-tight font-display tracking-wider uppercase">
                17% FLAT DISCOUNT!
              </h3>

              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-0.5 leading-snug">
                On all medicines · Get 70% off delivery on orders above{' '}
                <strong className="font-bold text-white tabular-nums">₹1,500</strong>
              </p>
            </div>
          </div>

          {/* 2. Upload prescription card */}
          <PrescriptionCard />

          {/* 3. Category Filter Chips */}
          <div>
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Categories
              </span>
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="text-[11px] text-brand-green font-medium hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x overflow-y-hidden py-0.5 -mx-4 px-4">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors touch-pan-x flex items-center justify-center border ${
                      isSelected
                        ? 'bg-brand-green text-white border-brand-green shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200/80 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 4. Medicines Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <h2 className="text-sm font-bold text-ink">
                {selectedCategory !== 'All' ? `${selectedCategory} (${displayedMedicines.length})` : 'Trending'}
              </h2>
              <span className="text-[11px] text-ink-lighter">
                {selectedCategory !== 'All' ? 'Filtered by category' : '6,500+ items available'}
              </span>
            </div>

            {/* Loading state: 5 skeleton cards */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : displayedMedicines.length > 0 ? (
              /* Results List */
              <div className="space-y-3">
                {displayedMedicines.map((medicine) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    quantity={quantityMap[medicine.id] || 0}
                    onAdd={addItem}
                    onIncrement={increment}
                    onDecrement={decrement}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                No medicines found in this category.
              </div>
            )}
          </div>
        </div>

        {/* 5. Floating Cart Bar */}
        <CartBar />

        {/* 6. Dedicated Full-Screen Search View */}
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
