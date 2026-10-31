import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import SearchBar from '../components/SearchBar';
import LocationSheet from '../components/LocationSheet';
import CartBar from '../components/CartBar';
import ElasticScroll from '../components/ElasticScroll';

import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { useT } from '../lib/i18n';

// 4 Demo Categories with 7 curated products each
export const DEMO_CATEGORIES = [
  {
    id: 'general',
    title: 'General',
    subtitle: 'Daily essentials & first aid',
    products: [
      {
        id: 'gen_1',
        name: 'Dolo 650mg Tablet',
        salt: 'Paracetamol 650mg',
        pack: 'Strip of 15 tablets',
        mrp: 34,
        price: 30,
        requiresRx: false,
        category: 'General',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'gen_2',
        name: 'Pan-D Capsule',
        salt: 'Pantoprazole + Domperidone',
        pack: 'Strip of 15 capsules',
        mrp: 199,
        price: 175,
        requiresRx: true,
        category: 'General',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'gen_3',
        name: 'Augmentin 625 Duo Tablet',
        salt: 'Amoxycillin + Clavulanic Acid',
        pack: 'Strip of 10 tablets',
        mrp: 223,
        price: 196,
        requiresRx: true,
        category: 'General',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'gen_4',
        name: 'Azithral 500mg Tablet',
        salt: 'Azithromycin Dihydrate',
        pack: 'Strip of 5 tablets',
        mrp: 132,
        price: 116,
        requiresRx: true,
        category: 'General',
        image: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'gen_5',
        name: 'Combiflam Tablet',
        salt: 'Ibuprofen + Paracetamol',
        pack: 'Strip of 20 tablets',
        mrp: 46,
        price: 40,
        requiresRx: false,
        category: 'General',
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'gen_6',
        name: 'Becosules Z Capsule',
        salt: 'B-Complex + Zinc + Vitamin C',
        pack: 'Strip of 20 capsules',
        mrp: 52,
        price: 45,
        requiresRx: false,
        category: 'General',
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'gen_7',
        name: 'Digene Gel Mint Flavour',
        salt: 'Antacid & Antigas Oral Liquid',
        pack: '200 ml bottle',
        mrp: 165,
        price: 145,
        requiresRx: false,
        category: 'General',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'baby-care',
    title: 'Baby Care',
    subtitle: 'Gentle care & infant nutrition',
    products: [
      {
        id: 'baby_1',
        name: 'Pampers All Round Protection (S)',
        salt: 'Anti-Rash Baby Diapers',
        pack: 'Pack of 46 diapers',
        mrp: 599,
        price: 527,
        requiresRx: false,
        category: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'baby_2',
        name: 'Himalaya Baby Massage Oil',
        salt: 'Olive & Winter Cherry Extract',
        pack: '200 ml bottle',
        mrp: 230,
        price: 202,
        requiresRx: false,
        category: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'baby_3',
        name: 'Sebamed Baby Cleansing Bar',
        salt: 'Soap-Free pH 5.5 Gentle Wash',
        pack: '100 g bar',
        mrp: 260,
        price: 228,
        requiresRx: false,
        category: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1608248597359-53e970b8e234?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'baby_4',
        name: "Johnson's Baby Gentle Powder",
        salt: 'Pure Cornstarch & Floral Fragrance',
        pack: '200 g bottle',
        mrp: 195,
        price: 171,
        requiresRx: false,
        category: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'baby_5',
        name: "Woodward's Gripe Water",
        salt: 'Ayurvedic Colic & Gas Relief',
        pack: '130 ml bottle',
        mrp: 75,
        price: 66,
        requiresRx: false,
        category: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'baby_6',
        name: 'MamyPoko Soft Baby Wipes',
        salt: '99% Pure Water & Coconut Extract',
        pack: 'Pack of 72 wipes',
        mrp: 140,
        price: 123,
        requiresRx: false,
        category: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'baby_7',
        name: 'Nan Pro 1 Infant Formula',
        salt: 'Stage 1 DHA & ARA Milk Nutrition',
        pack: '400 g refill box',
        mrp: 825,
        price: 726,
        requiresRx: false,
        category: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'chronic-illness',
    title: 'Chronic Illness',
    subtitle: 'Daily BP, diabetes & thyroid care',
    products: [
      {
        id: 'chr_1',
        name: 'Telma 40mg Tablet',
        salt: 'Telmisartan 40mg (Hypertension)',
        pack: 'Strip of 30 tablets',
        mrp: 265,
        price: 233,
        requiresRx: true,
        category: 'Chronic Illness',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'chr_2',
        name: 'Glycomet-GP 2 Tablet',
        salt: 'Glimepiride 2mg + Metformin 500mg SR',
        pack: 'Strip of 15 tablets',
        mrp: 172,
        price: 151,
        requiresRx: true,
        category: 'Chronic Illness',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'chr_3',
        name: 'Thyronorm 50mcg Tablet',
        salt: 'Thyroxine Sodium (Hypothyroidism)',
        pack: 'Bottle of 120 tablets',
        mrp: 185,
        price: 162,
        requiresRx: true,
        category: 'Chronic Illness',
        image: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'chr_4',
        name: 'Atorva 20mg Tablet',
        salt: 'Atorvastatin Calcium (Cholesterol)',
        pack: 'Strip of 15 tablets',
        mrp: 280,
        price: 246,
        requiresRx: true,
        category: 'Chronic Illness',
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'chr_5',
        name: 'Ecosprin 75mg Tablet',
        salt: 'Enteric Coated Aspirin (Heart Care)',
        pack: 'Strip of 14 tablets',
        mrp: 12,
        price: 10,
        requiresRx: false,
        category: 'Chronic Illness',
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'chr_6',
        name: 'Cilacar 10mg Tablet',
        salt: 'Cilnidipine 10mg (Calcium Channel)',
        pack: 'Strip of 15 tablets',
        mrp: 148,
        price: 130,
        requiresRx: true,
        category: 'Chronic Illness',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'chr_7',
        name: 'Galvus Met 50mg/500mg',
        salt: 'Vildagliptin + Metformin (Diabetes)',
        pack: 'Strip of 10 tablets',
        mrp: 310,
        price: 272,
        requiresRx: true,
        category: 'Chronic Illness',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'others',
    title: 'Others',
    subtitle: 'Pain relief, sprays & wellness',
    products: [
      {
        id: 'oth_1',
        name: 'Volini Pain Relief Gel',
        salt: 'Diclofenac Rapid Muscle Pain Relief',
        pack: '30 g tube',
        mrp: 125,
        price: 110,
        requiresRx: false,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'oth_2',
        name: 'Electral ORS Powder Sachet',
        salt: 'WHO Oral Rehydration Electrolyte',
        pack: '21.8 g sachet',
        mrp: 24,
        price: 21,
        requiresRx: false,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'oth_3',
        name: 'Dettol Antiseptic Liquid',
        salt: 'Chloroxylenol Disinfectant Solution',
        pack: '250 ml bottle',
        mrp: 155,
        price: 136,
        requiresRx: false,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'oth_4',
        name: 'Himalaya Liv.52 DS Tablets',
        salt: 'Ayurvedic Liver Care Formula',
        pack: 'Pack of 60 tablets',
        mrp: 210,
        price: 184,
        requiresRx: false,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'oth_5',
        name: 'Vicks VapoRub Balm',
        salt: 'Camphor, Menthol & Eucalyptus Oil',
        pack: '25 g jar',
        mrp: 95,
        price: 83,
        requiresRx: false,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'oth_6',
        name: 'Moov Fast Pain Relief Spray',
        salt: 'Wintergreen Oil & Mint Extract Spray',
        pack: '50 g can',
        mrp: 180,
        price: 158,
        requiresRx: false,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'oth_7',
        name: 'Cipladine 5% Antiseptic Cream',
        salt: 'Povidone Iodine First Aid Ointment',
        pack: '20 g tube',
        mrp: 58,
        price: 51,
        requiresRx: false,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&auto=format&fit=crop&q=80',
      },
    ],
  },
];

// Popular category tiles (image on soft pink card + 2-line label)
const POPULAR_CATEGORIES = [
  { name: 'Ayurvedic & Herbal', query: 'Ayurvedic', image: '/ayurvedic.webp' },
  { name: 'Devices, Aids & Wellness', query: 'Devices', image: '/devices.webp' },
  { name: 'Safety Essentials', query: 'Safety', image: '/safety_essentials.webp' },
  { name: 'Mom & Baby Care', query: 'Baby', image: '/mon_babycare.webp' },
  { name: 'Orthopaedics & Supports', query: 'Orthopaedic', image: '/orthopedic.webp' },
  { name: 'Nutritional Supplements', query: 'Supplement', image: '/nutrional.webp' },
  { name: 'Beauty & Personal Care', query: 'Beauty', image: '/beauty_personalcare.webp' },
  { name: 'Health Food & Beverages', query: 'Health Food', image: '/healthy_food.webp' },
  { name: 'Protein Supplement', query: 'Protein', image: '/protein.webp' },
  { name: 'Oral & Dental Care', query: 'Dental', image: '/dental_care.webp' },
  { name: 'Digestive Care Essentials', query: 'Digestive', image: '/digestive.webp' },
  { name: 'Cold, Cough & Pain Relief', query: 'Pain Relief', image: '/pain_releaf.webp' },
];

// Horizontal Drag & Touch Enabled Track
function HorizontalCatalogTrack({ id, children }) {
  const trackRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Mouse drag support for desktop/laptops
  const handleMouseDown = (e) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDown.current = false;
  };

  return (
    <div
      id={id}
      ref={trackRef}
      data-horizontal-scroll="true"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x pan-y',
        overscrollBehaviorX: 'contain',
      }}
      className="flex gap-3 overflow-x-auto no-scrollbar px-4 -mx-4 pb-2 pt-0.5 cursor-grab active:cursor-grabbing select-none"
    >
      {children}
    </div>
  );
}

// Horizontal Product Card Item
function HorizontalProductCard({
  product,
  quantity = 0,
  onAdd,
  onIncrement,
  onDecrement,
  t,
}) {
  const discountPercent = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100
  );

  return (
    <div className="w-[164px] sm:w-[184px] shrink-0 bg-white rounded-[16px] p-3 border border-[#0E1A14]/8 shadow-card flex flex-col justify-between select-none">
      <div>
        {/* Medicine Image Container */}
        <div className="w-full h-[112px] rounded-[12px] bg-[#F7F4EC] relative overflow-hidden flex items-center justify-center p-2 mb-2 pointer-events-none select-none">
          <img
            src={product.image}
            alt={product.name}
            draggable={false}
            className="w-full h-full object-contain mix-blend-multiply pointer-events-none select-none"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/pills-bottle.png';
            }}
          />

          {discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#C6F26B] text-[#003820] text-[10px] font-extrabold tracking-tight shadow-xs pointer-events-none">
              {discountPercent}% OFF
            </span>
          )}

          {product.requiresRx && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#D64538]/12 text-[#D64538] text-[10px] font-bold pointer-events-none">
              Rx
            </span>
          )}
        </div>

        {/* Product Name (clamped to 2 lines) */}
        <h4
          className="font-display font-bold text-[13px] sm:text-[14px] text-[#0E1A14] leading-snug line-clamp-2 min-h-[36px]"
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Pack Size / Salt */}
        <p
          className="text-[11px] text-[#5E6B63] truncate mt-0.5"
          title={`${product.salt} · ${product.pack}`}
        >
          {product.pack}
        </p>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="mt-3 pt-2.5 border-t border-[#0E1A14]/6 flex items-center justify-between gap-1.5">
        <div className="flex flex-col min-w-0">
          <span className="font-display font-extrabold text-[15px] sm:text-[16px] text-[#003820] leading-none tabular-nums">
            ₹{t.num(product.price)}
          </span>
          <span className="text-[11px] font-medium text-[#5E6B63] line-through leading-none mt-1 tabular-nums">
            ₹{t.num(product.mrp)}
          </span>
        </div>

        <div className="shrink-0">
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 bg-[#F7F4EC] rounded-full p-0.5 border border-[#003820]/15">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDecrement(product.id);
                }}
                className="w-6 h-6 rounded-full bg-white text-[#003820] flex items-center justify-center font-bold text-[13px] active:scale-90 transition-transform shadow-xs"
                aria-label={`Decrease ${product.name} quantity`}
              >
                -
              </button>
              <span className="font-display font-bold text-[12px] text-[#003820] min-w-[14px] text-center tabular-nums">
                {t.num(quantity)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onIncrement(product.id);
                }}
                className="w-6 h-6 rounded-full bg-[#003820] text-white flex items-center justify-center font-bold text-[13px] active:scale-90 transition-transform shadow-xs"
                aria-label={`Increase ${product.name} quantity`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
              className="h-[32px] px-3 bg-[#003820] hover:bg-[#002615] text-white text-[12px] font-bold rounded-full flex items-center justify-center gap-1 active:scale-[0.95] transition-transform shadow-xs touch-manipulation cursor-pointer"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-3.5 h-3.5 text-[#C6F26B] stroke-[2.8]" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const t = useT();
  const navigate = useNavigate();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const phone = useUserStore((state) => state.phone);

  const handleOpenLocation = () => {
    navigate('/address');
  };

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

  // Map cart quantities for instant sync
  const quantityMap = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  const handleAddToCart = (product) => {
    haptic(10);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      requiresRx: product.requiresRx,
      strength: product.salt || '',
      category: product.category || '',
    });
  };

  const handleIncrement = (id) => {
    haptic(8);
    increment(id);
  };

  const handleDecrement = (id) => {
    haptic(8);
    decrement(id);
  };

  const handleScrollTrack = (categoryId, delta) => {
    haptic(6);
    const el = document.getElementById(`track-${categoryId}`);
    if (el) {
      el.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F4EC] text-[#0E1A14] select-none pb-1">
      {/* 
        Native Header: SearchBar contains its own sticky top 56px header (Logo + Lang + Cart).
        The location and search input bar scroll away naturally with the page.
      */}
      <SearchBar
        onOpenSearch={() => navigate('/search')}
        onOpenLocation={handleOpenLocation}
      />

      <div className="relative z-10">
        <ElasticScroll
          className="pt-2"
          footerClassName="w-full h-12 flex items-center justify-center pointer-events-none"
          footer={
            <p className="text-center font-display font-extrabold text-[15px] tracking-[-0.02em] text-[#5E6B63]">
              that&apos;s everything<span className="text-[#003820]">.</span>
            </p>
          }
        >
          <div className="px-4 space-y-6">
            {/* Featured Discount Banner Image */}
            <div>
              <div
                onClick={() => navigate('/search')}
                className="w-full rounded-[16px] overflow-hidden bg-[#003820] cursor-pointer touch-manipulation select-none active:scale-[0.99] transition-transform duration-150"
              >
                <img
                  src="/medix-17-discount-banner.png?v=2"
                  alt="17% discount on orders over Rs 1500"
                  draggable={false}
                  className="w-full h-auto block object-cover select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Popular Categories Grid */}
            <section>
              <h2 className="font-display font-extrabold text-[20px] sm:text-[22px] tracking-tight text-[#0E1A14] leading-tight mb-3">
                {t('Popular Categories')}
              </h2>
              <div className="grid grid-cols-4 gap-x-2.5 gap-y-4">
                {POPULAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(cat.query)}`)}
                    className="flex flex-col items-center text-center cursor-pointer touch-manipulation active:scale-[0.96] transition-transform duration-150"
                  >
                    <span className="w-full aspect-square rounded-[12px] bg-[#FDECEC] block overflow-hidden">
                      <img
                        src={cat.image}
                        alt=""
                        draggable={false}
                        loading="lazy"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/pills-bottle.png';
                        }}
                      />
                    </span>
                    <span className="mt-2 text-[12px] sm:text-[13px] font-medium leading-snug text-[#2B3A33] line-clamp-2">
                      {t(cat.name)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Footer: soft grey block with brand messages */}
          <footer className="mt-6 w-full bg-[#E9ECE8] px-5 pt-6 pb-6 select-none">
            <div className="max-w-md mx-auto">
              <p className="font-display font-extrabold text-[26px] sm:text-[28px] leading-[1.35] tracking-[-0.02em] text-[#9AA39D]">
                {t('Medix wishes you')}
                <br />
                {t('Health & Happiness')}
              </p>
              <p className="mt-4 font-display font-bold text-[16px] leading-snug text-[#B3BBB5]">
                {t('Genuine medicines, delivered to your door within 24 hours.')}
              </p>
            </div>
          </footer>
        </ElasticScroll>

        {/* Floating Cart Bar */}
        <CartBar />

        {/* Location Selection Sheet */}
        <LocationSheet
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
        />
      </div>
    </div>
  );
}
