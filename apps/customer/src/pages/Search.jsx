import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Thermometer,
  Wind,
  Flame,
  Zap,
  Pill,
  HeartPulse,
  Sparkles,
  Cross,
  Sparkle,
} from 'lucide-react';

import SearchBar from '../components/SearchBar';
import FullScreenSearch from '../components/FullScreenSearch';
import LocationSheet from '../components/LocationSheet';
import MedicineCard from '../components/MedicineCard';
import SkeletonCard from '../components/SkeletonCard';
import CartBar from '../components/CartBar';
import ElasticScroll from '../components/ElasticScroll';

import { useCartStore } from '../store/cartStore';
import { useMedicines } from '../lib/useMedicines';
import { useT } from '../lib/i18n';

const HEALTH_SHORTCUTS = [
  { id: 'fever', label: 'Fever & Headache', query: 'dolo', icon: Thermometer, tint: 'bg-[#E3EFE8]' },
  { id: 'cough', label: 'Cough & Cold', query: 'ascoril', icon: Wind, tint: 'bg-[#EEF8D2]' },
  { id: 'acidity', label: 'Acidity & Gas', query: 'pan', icon: Flame, tint: 'bg-[#EFEAD8]' },
  { id: 'pain', label: 'Body & Joint Pain', query: 'combiflam', icon: Zap, tint: 'bg-[#E3EFE8]' },
  { id: 'vitamins', label: 'Daily Vitamins', query: 'zincovit', icon: Sparkles, tint: 'bg-[#EEF8D2]' },
  { id: 'heart', label: 'BP & Heart Care', query: 'telma', icon: HeartPulse, tint: 'bg-[#EFEAD8]' },
  { id: 'allergy', label: 'Allergy Relief', query: 'montair', icon: Pill, tint: 'bg-[#E3EFE8]' },
  { id: 'firstaid', label: 'First Aid & Skin', query: 'betadine', icon: Cross, tint: 'bg-[#EEF8D2]' },
];

export default function Search() {
  const t = useT();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [activeSymptom, setActiveSymptom] = useState(null);

  const haptic = (ms = 8) => {
    try {
      navigator.vibrate?.(ms);
    } catch {}
  };

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
    haptic(6);
    setActiveSymptom((prev) => (prev === shortcut.id ? null : shortcut.id));
  };

  const clearAllFilters = () => {
    setActiveSymptom(null);
  };

  const handleAddToCart = (medicine) => {
    haptic(10);
    addItem(medicine);
  };

  const currentSymptomLabel = useMemo(() => {
    const match = HEALTH_SHORTCUTS.find((s) => s.id === activeSymptom);
    return match ? match.label : '';
  }, [activeSymptom]);

  return (
    <div
      className={`w-full bg-[#F7F4EC] text-[#0E1A14] antialiased ${
        cartItems.length > 0 ? 'pb-16' : 'pb-2'
      }`}
    >
      <div className="max-w-md mx-auto w-full relative">
        {/* 1. Deep Forest Green Brand Header (Sticky Top Row + Collapsible Location Row + 50% Overlapping Search) */}
        <SearchBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenLocation={() => navigate('/address?redirect=/search')}
        />

        {/* 2. Main Scrollable Body Content wrapped in ElasticScroll */}
        <ElasticScroll maxStretchTop={100} maxStretchBottom={120}>
          <div className="px-4 space-y-6">
            {/* Featured Discount Banner Image + Horizontal Call / WhatsApp Strip */}
            <div className="space-y-2.5">
              {/* Featured 17% Discount Ad Image Banner */}
              <div
                onClick={() => setIsSearchOpen(true)}
                className="w-full rounded-[16px] overflow-hidden bg-[#003820] cursor-pointer touch-manipulation select-none active:scale-[0.99] transition-transform duration-150"
              >
                <img
                  src="/medix-17-discount-banner.png?v=2"
                  alt="17% discount on orders over Rs 1500"
                  draggable={false}
                  className="w-full h-auto block object-cover select-none pointer-events-none"
                />
              </div>

              {/* Horizontal "Order on call / WhatsApp" Strip (2 equal columns, zero overflow) */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="tel:+918918237582"
                  draggable={false}
                  onClick={() => haptic(8)}
                  className="min-h-[44px] px-3 rounded-[999px] bg-white text-[#003820] text-[14px] font-bold flex items-center justify-center gap-2 touch-manipulation select-none active:scale-[0.96] transition-transform duration-150"
                >
                  <Phone className="w-4 h-4 stroke-[2.25] shrink-0" />
                  <span className="truncate">{t('Order on call')}</span>
                </a>

                <a
                  href="https://wa.me/918918237582?text=Hello%20Medix%2C%20I%20want%20to%20place%20a%20medicine%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  onClick={() => haptic(8)}
                  className="min-h-[44px] px-3 rounded-[999px] bg-[#003820] text-white text-[14px] font-bold flex items-center justify-center gap-2 touch-manipulation select-none active:scale-[0.96] transition-transform duration-150"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-[#C6F26B] shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 12.99 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.48 11.14 9.6 11.01 9.73 10.89C9.84 10.78 9.98 10.6 10.1 10.45C10.22 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.6C10.27 9.48 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.35 9.01 7.34C8.86 7.33 8.7 7.33 8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.93 7.9 12.11 8.02 12.27C8.15 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.54C14.25 16.73 14.79 16.7 15.22 16.64C15.7 16.57 16.69 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99Z" />
                  </svg>
                  <span className="truncate">{t('WhatsApp order')}</span>
                </a>
              </div>
            </div>

            {/* 2-Row Horizontal Scroll Colored Symptom Tiles */}
            <section className="space-y-3 w-full">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.02em] text-[#0E1A14]">
                  what do you need?
                </h2>
                {activeSymptom && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="min-h-[44px] px-2 text-[14px] font-bold text-[#003820] active:scale-[0.96] transition-transform duration-150 cursor-pointer flex items-center"
                  >
                    {t('Show all')}
                  </button>
                )}
              </div>

              <div
                style={{
                  overflowY: 'hidden',
                  touchAction: 'pan-x pan-y',
                }}
                className="grid grid-rows-2 grid-flow-col auto-cols-[152px] gap-2.5 overflow-x-auto no-scrollbar pb-1"
              >
              {HEALTH_SHORTCUTS.map((shortcut) => {
                const Icon = shortcut.icon;
                const isActive = activeSymptom === shortcut.id;
                return (
                  <button
                    key={shortcut.id}
                    type="button"
                    onClick={() => handleSelectSymptom(shortcut)}
                    className={`min-h-[60px] p-3 rounded-[16px] text-left flex items-center gap-2.5 transition-transform duration-150 active:scale-[0.96] touch-manipulation cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#003820] text-white'
                        : `${shortcut.tint} text-[#0E1A14]`
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 stroke-[2.25] shrink-0 ${
                        isActive ? 'text-[#C6F26B]' : 'text-[#003820]'
                      }`}
                    />
                    <span className="text-[14px] font-bold leading-tight">
                      {t(shortcut.label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Medicines Feed with Friendly Direct Microcopy */}
          <section className="space-y-3.5">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.02em] text-[#0E1A14]">
                  {activeSymptom ? `${currentSymptomLabel.toLowerCase()}.` : 'Fever? Sorted in 20 min.'}
                </h2>
                <p className="text-[14px] text-[#5E6B63] mt-0.5">
                  {activeSymptom
                    ? t('{n} verified medicines in stock nearby', { n: displayedMedicines.length })
                    : t('Genuine pharmacy essentials delivered to your doorstep.')}
                </p>
              </div>

              {activeSymptom && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="shrink-0 min-h-[44px] px-4 rounded-[999px] bg-[#EFEAD8] text-[14px] font-bold text-[#0E1A14] active:scale-[0.96] transition-transform duration-150 cursor-pointer flex items-center"
                >
                  {t('Clear')}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : displayedMedicines.length > 0 ? (
              <div className="space-y-3">
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
              <div className="py-10 px-5 text-center bg-white rounded-[16px] space-y-3">
                <p className="font-display text-[18px] font-bold text-[#0E1A14]">
                  {t('No medicines found in this selection.')}
                </p>
                <p className="text-[14px] text-[#5E6B63] max-w-[240px] mx-auto">
                  {t('Try searching by medicine name or browse all essentials.')}
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex min-h-[44px] items-center px-5 bg-[#003820] text-white text-[14px] font-bold rounded-[999px] cursor-pointer touch-manipulation active:scale-[0.96] transition-transform duration-150"
                >
                  {t('Browse all medicines')}
                </button>
              </div>
            )}
          </section>
          </div>
        </ElasticScroll>

        {/* Floating Cart Bar */}
        <CartBar />

        {/* Full-Screen Search Modal */}
        <FullScreenSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* Location Selection Sheet */}
        <LocationSheet
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
        />
      </div>
    </div>
  );
}
