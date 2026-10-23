import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import QtyStepper from '../components/QtyStepper';
import CartBar from '../components/CartBar';
import LocationSheet from '../components/LocationSheet';
import FullScreenSearch from '../components/FullScreenSearch';
import { useCartStore } from '../store/cartStore';
import { useMedicines } from '../lib/useMedicines';
import { useT } from '../lib/i18n';

// Clean, high-resolution photography mapped to baby product types
const BABY_PRODUCT_IMAGES = {
  diaper: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
  wipes: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
  wash: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=600&q=80',
  lotion: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  oil: 'https://images.unsplash.com/photo-1608248597359-5633519c2586?auto=format&fit=crop&w=600&q=80',
  food: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
  soap: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  powder: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  health: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
};

function resolveProductImage(name = '') {
  const n = name.toLowerCase();
  if (n.includes('diaper') || n.includes('pant') || n.includes('pampers') || n.includes('mamypoko')) {
    return BABY_PRODUCT_IMAGES.diaper;
  }
  if (n.includes('wipe')) {
    return BABY_PRODUCT_IMAGES.wipes;
  }
  if (n.includes('shampoo') || n.includes('wash') || n.includes('bath') || n.includes('cleans')) {
    return BABY_PRODUCT_IMAGES.wash;
  }
  if (n.includes('lotion') || n.includes('cream') || n.includes('dermadew') || n.includes('moistur')) {
    return BABY_PRODUCT_IMAGES.lotion;
  }
  if (n.includes('oil') || n.includes('massage')) {
    return BABY_PRODUCT_IMAGES.oil;
  }
  if (n.includes('cerelac') || n.includes('dexolac') || n.includes('nusobee') || n.includes('wheat') || n.includes('rice') || n.includes('food')) {
    return BABY_PRODUCT_IMAGES.food;
  }
  if (n.includes('soap')) {
    return BABY_PRODUCT_IMAGES.soap;
  }
  if (n.includes('powder')) {
    return BABY_PRODUCT_IMAGES.powder;
  }
  return BABY_PRODUCT_IMAGES.health;
}

function resolveBrandTag(name = '') {
  const n = name.toLowerCase();
  if (n.includes('pampers')) return 'Pampers';
  if (n.includes('mamypoko')) return 'MamyPoko';
  if (n.includes('himalaya')) return 'Himalaya';
  if (n.includes('cetaphil')) return 'Cetaphil Baby';
  if (n.includes('dermadew')) return 'Dermadew';
  if (n.includes('sebamed')) return 'Sebamed';
  if (n.includes('cerelac')) return 'Nestlé Cerelac';
  if (n.includes('dexolac')) return 'Dexolac';
  if (n.includes('woodward')) return "Woodward's";
  if (n.includes('johnson')) return "Johnson's";
  return 'Care Essential';
}

// Curated top baby essentials catalogue
const FEATURED_BABY_ESSENTIALS = [
  {
    id: 'pampers-active-baby-m',
    name: 'Pampers All round Protection Pants (M)',
    price: 499,
    category: 'Baby Care',
    subcategory: 'diapers',
    requiresRx: false,
  },
  {
    id: 'himalaya-baby-wipes-72',
    name: 'Himalaya Gentle Baby Wipes (72 Wipes)',
    price: 175,
    category: 'Baby Care',
    subcategory: 'diapers',
    requiresRx: false,
  },
  {
    id: 'cetaphil-baby-wash-shampoo-230',
    name: 'Cetaphil Baby Gentle Wash & Shampoo 230ml',
    price: 849,
    category: 'Baby Care',
    subcategory: 'bath',
    requiresRx: false,
  },
  {
    id: 'dermadew-baby-lotion-150',
    name: 'Dermadew Calming Baby Lotion 150ml',
    price: 176,
    category: 'Baby Care',
    subcategory: 'lotion',
    requiresRx: false,
  },
  {
    id: 'cerelac-wheat-apple-300',
    name: 'Nestle Cerelac Wheat Apple (from 6 Months)',
    price: 280,
    category: 'Baby Care',
    subcategory: 'food',
    requiresRx: false,
  },
  {
    id: 'dexolac-1-infant-formula',
    name: 'Dexolac Stage 1 Infant Formula 400g Jar',
    price: 495,
    category: 'Baby Care',
    subcategory: 'food',
    requiresRx: false,
  },
  {
    id: 'woodwards-gripe-water-130',
    name: "Woodward's Celebrated Gripe Water 130ml",
    price: 65,
    category: 'Baby Care',
    subcategory: 'health',
    requiresRx: false,
  },
  {
    id: 'sebamed-baby-soap-100',
    name: 'Sebamed Baby Cleansing Bar 100g',
    price: 275,
    category: 'Baby Care',
    subcategory: 'bath',
    requiresRx: false,
  },
];

const FILTER_TAGS = [
  { id: 'all', label: 'All' },
  { id: 'diapers', label: 'Diapers & Wipes' },
  { id: 'bath', label: 'Bath & Gentle Wash' },
  { id: 'lotion', label: 'Lotions & Oils' },
  { id: 'food', label: 'Baby Food & Nutrition' },
  { id: 'health', label: 'Health & Drops' },
];

export default function BabyCare() {
  const t = useT();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Cart Store
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decrement = useCartStore((state) => state.decrement);

  const quantityMap = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  // Fetch real Baby Care products from MongoDB via API
  const { medicines: apiMedicines, isLoading } = useMedicines({
    category: 'Baby Care',
    limit: 60,
  });

  // Combine curated essentials with database medicines
  const allProducts = useMemo(() => {
    const map = new Map();
    for (const p of FEATURED_BABY_ESSENTIALS) {
      map.set(p.name.toLowerCase(), p);
    }
    if (Array.isArray(apiMedicines)) {
      for (const m of apiMedicines) {
        if (!map.has(m.name.toLowerCase())) {
          map.set(m.name.toLowerCase(), {
            id: m.id || m._id,
            name: m.name,
            price: Number(m.price) || 120,
            category: 'Baby Care',
            requiresRx: Boolean(m.requiresRx),
          });
        }
      }
    }
    return Array.from(map.values());
  }, [apiMedicines]);

  // Subcategory filter matcher
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return allProducts;

    return allProducts.filter((p) => {
      const n = p.name.toLowerCase();
      if (activeFilter === 'diapers') {
        return n.includes('diaper') || n.includes('pant') || n.includes('wipe') || n.includes('pampers');
      }
      if (activeFilter === 'bath') {
        return (
          n.includes('shampoo') ||
          n.includes('wash') ||
          n.includes('bath') ||
          n.includes('soap') ||
          n.includes('cleans')
        );
      }
      if (activeFilter === 'lotion') {
        return (
          n.includes('lotion') ||
          n.includes('oil') ||
          n.includes('cream') ||
          n.includes('dermadew') ||
          n.includes('powder')
        );
      }
      if (activeFilter === 'food') {
        return (
          n.includes('cerelac') ||
          n.includes('dexolac') ||
          n.includes('nusobee') ||
          n.includes('wheat') ||
          n.includes('rice') ||
          n.includes('food')
        );
      }
      if (activeFilter === 'health') {
        return (
          n.includes('gripe') ||
          n.includes('rab') ||
          n.includes('drop') ||
          n.includes('domstal') ||
          n.includes('vitamin')
        );
      }
      return true;
    });
  }, [allProducts, activeFilter]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32 select-none">
      {/* 1. Translucent Frosted Glass Header */}
      <div className="sticky top-0 z-30">
        <SearchBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenLocation={() => navigate('/address?redirect=/baby-care')}
          onOpenSignIn={() => navigate('/login?redirect=/baby-care')}
        />
      </div>

      {/* 2. Main Content Container */}
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Subcategories (Matches General page categories layout & styling) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('Baby Care Categories')}
            </span>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="text-xs text-[#BF5B76] font-semibold hover:underline active:opacity-70 transition-opacity cursor-pointer"
              >
                {t('Show all')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x py-1 -mx-4 px-4">
            {FILTER_TAGS.map((tag) => {
              const isActive = activeFilter === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setActiveFilter(tag.id)}
                  className={`shrink-0 h-10 px-4 rounded-2xl text-[13.5px] sm:text-sm font-semibold tracking-tight transition-all duration-150 touch-manipulation cursor-pointer flex items-center justify-center active:scale-95 select-none ${
                    isActive
                      ? 'bg-[#CE6A85] text-white shadow-[0_2px_10px_rgba(206,106,133,0.32)]'
                      : 'bg-white text-gray-800 border border-black/[0.08] hover:bg-gray-50'
                  }`}
                >
                  <span>{t(tag.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Small 2-Column Apple Catalogue Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('Catalogue ({n})', { n: filteredProducts.length })}
            </span>
          </div>

          {isLoading && filteredProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2.5">
              <Loader2 className="w-6 h-6 animate-spin text-[#BF5B76]" />
              <p className="text-xs font-medium">{t('Loading catalogue...')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {filteredProducts.map((product) => {
                const quantity = quantityMap[product.id] || 0;
                const imageUrl = resolveProductImage(product.name);
                const brandTag = resolveBrandTag(product.name);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    className="bg-white rounded-3xl border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3 flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-black/[0.09] transition-all group relative"
                  >
                    {/* Top Image Showcase Stage */}
                    <div className="relative w-full aspect-square rounded-2xl bg-[#FAFAFC] group-hover:bg-[#F2F4F7] transition-colors overflow-hidden flex items-center justify-center p-3 mb-2.5">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain rounded-xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-300 ease-out"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Bottom Info: Brand Tag, Title, Price, Action */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#88304E] bg-[#FBEAEE] px-1.5 py-0.5 rounded-md inline-block mb-1">
                          {brandTag}
                        </span>
                        <h4 className="font-semibold text-xs sm:text-[13.5px] text-gray-950 line-clamp-2 leading-snug tracking-tight min-h-[34px]">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-black/[0.04]">
                        <div className="flex items-baseline gap-1.5 mb-2.5">
                          <span className="text-[15px] sm:text-base font-bold text-gray-950 tabular-nums tracking-tight">
                            ₹{t.num(product.price)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold tracking-wider">
                            MRP
                          </span>
                        </div>

                        {/* Direct Feedback Add to Cart / Qty Stepper */}
                        {quantity > 0 ? (
                          <div className="w-full h-9">
                            <QtyStepper
                              quantity={quantity}
                              onIncrement={() => addItem(product)}
                              onDecrement={() => decrement(product.id)}
                            />
                          </div>
                        ) : (
                          <motion.button
                            type="button"
                            onClick={() => addItem(product)}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                            className="w-full h-9 rounded-xl bg-[#CE6A85] hover:bg-[#BF5B76] active:bg-[#88304E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(206,106,133,0.3)] transition-all cursor-pointer touch-manipulation"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
                            <span>{t('ADD')}</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom CartBar */}
      <CartBar />

      {/* Sheets & Search Overlays */}
      <LocationSheet
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      <FullScreenSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
