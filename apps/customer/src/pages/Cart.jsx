import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  MapPin,
  ChevronRight,
  Store,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { calcBill, formatPrice } from '../lib/fees';
import { PARTNER_PHARMACIES } from '../lib/partnerPharmacies';
import api from '../lib/api';

import CartItem from '../components/CartItem';
import MinOrderProgress from '../components/MinOrderProgress';
import BillCard from '../components/BillCard';
import PaymentSelector from '../components/PaymentSelector';
import PlaceOrderBar from '../components/PlaceOrderBar';
import BottomSheet from '../components/BottomSheet';
import LocationSheet from '../components/LocationSheet';
import ConfirmOrderSheet from '../components/ConfirmOrderSheet';
import { useT } from '../lib/i18n';

export default function Cart() {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Cart Store
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Location & User Stores
  const address = useLocationStore((state) => state.address);
  const fullName = useLocationStore((state) => state.fullName);
  const villagePo = useLocationStore((state) => state.villagePo);
  const pinCode = useLocationStore((state) => state.pinCode);
  const landmark = useLocationStore((state) => state.landmark);

  const phone = useUserStore((state) => state.phone);

  // Local State
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isClearSheetOpen, setIsClearSheetOpen] = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [isConfirmOrderSheetOpen, setIsConfirmOrderSheetOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(PARTNER_PHARMACIES[0]);
  const [isPharmacySheetOpen, setIsPharmacySheetOpen] = useState(false);

  // Fetch partner pharmacies registered in database
  const { data: dbPharmacies = [] } = useQuery({
    queryKey: ['pharmacy-stores'],
    queryFn: async () => {
      try {
        const res = await api.get('/pharmacy/stores');
        return res.data?.stores || [];
      } catch (err) {
        console.error('Failed to load partner pharmacies:', err);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const pharmacyOptions = useMemo(() => {
    const autoOption = {
      id: 'auto',
      name: t('Auto-Assign (Fastest Delivery)'),
      area: '',
      address: '',
      isAuto: true,
    };

    if (!Array.isArray(dbPharmacies) || dbPharmacies.length === 0) {
      return [autoOption];
    }

    const stores = dbPharmacies.map((store) => ({
      id: store._id || store.id,
      name: store.name,
      area: store.area || store.address || '',
      address: store.address || '',
      phone: store.phone || '',
      isAuto: false,
    }));

    return [autoOption, ...stores];
  }, [dbPharmacies, t]);

  // Subtotal and Fee Breakdown
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const bill = useMemo(() => calcBill(subtotal), [subtotal]);

  // Step 1: Click "Place Order"
  const handlePlaceOrderClick = () => {
    if (!bill.canOrder) return;

    // A. If address not entered yet -> Navigate to dedicated address page
    if (!address || !villagePo) {
      navigate('/address?redirect=/cart');
      return;
    }

    // B. If user not logged in -> Redirect to separate login page
    if (!phone) {
      navigate('/login?redirect=/cart');
      return;
    }

    // C. Returning customer (both address & phone saved) -> Confirm address & place
    setIsConfirmOrderSheetOpen(true);
  };

  // Step 2: Once address is saved
  const handleAddressSaved = () => {
    setIsAddressSheetOpen(false);
    if (!phone) {
      setTimeout(() => {
        navigate('/login?redirect=/cart');
      }, 250);
    } else {
      setTimeout(() => {
        setIsConfirmOrderSheetOpen(true);
      }, 250);
    }
  };

  // Step 4: Final Confirmation and ultimate order placement
  const handleConfirmAndPlaceOrder = async () => {
    setIsSubmittingOrder(true);

    const orderPayload = {
      customerName: fullName || 'Customer',
      customerPhone: phone,
      address: {
        fullName: fullName || 'Customer',
        villagePo,
        pinCode,
        landmark,
        fullAddress: address,
      },
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        requiresRx: !!i.requiresRx,
      })),
      paymentMethod,
      pharmacy: selectedPharmacy?.isAuto
        ? { name: 'Auto-Assign', address: 'Nearest Partner Chemist' }
        : {
            id: selectedPharmacy?.id,
            name: selectedPharmacy?.name || 'Nearest Partner Chemist',
            address: selectedPharmacy?.address || selectedPharmacy?.area || 'Siliguri',
            phone: selectedPharmacy?.phone || '',
          },
      bill,
      prescriptionUploaded: false,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await api.post('/orders', orderPayload);
      if (res?.data?.success && res?.data?.order) {
        const createdOrder = res.data.order;

        queryClient.invalidateQueries({ queryKey: ['orders'] });

        setIsSubmittingOrder(false);
        setIsConfirmOrderSheetOpen(false);
        clearCart();
        navigate('/order-success', {
          state: {
            order: createdOrder,
            payload: orderPayload,
          },
        });
        return;
      }
      throw new Error(res?.data?.message || 'Failed to place order');
    } catch (err) {
      console.error('Backend order placement error:', err);
      const msg = err.response?.data?.message || err.message || t('Could not place order. Please try again.');
      setIsSubmittingOrder(false);
      alert(msg);
    }
  };

  // 1. Empty Cart State (Apple Minimalist Style)
  if (items.length === 0) {
    return (
      <div
        style={{
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
        }}
        className="max-w-md mx-auto px-5 min-h-screen bg-[#F2F2F7]/50 flex flex-col justify-center items-center text-center antialiased"
      >
        <div className="w-16 h-16 rounded-full bg-white border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center mb-4 text-emerald-700">
          <ShoppingBag className="w-7 h-7 stroke-[2]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-gray-950">{t('Your cart is empty')}</h2>
        <p className="text-xs text-gray-500 font-medium mt-1.5 max-w-[240px] leading-relaxed">
          {t('Browse our pharmacy catalog and add medicines to your cart.')}
        </p>
        <Link
          to="/search"
          className="mt-6 inline-flex h-11 items-center px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-xs touch-manipulation transition-all cursor-pointer"
        >
          {t('Search medicines')}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="max-w-md mx-auto px-4 min-h-screen bg-[#F2F2F7]/50 text-gray-950 space-y-4 antialiased select-none"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">{t('Your cart')}</h1>
          <p className="text-xs text-gray-500 font-medium">
            {t('{n} {unit} added', { n: items.length, unit: t(items.length === 1 ? 'medicine' : 'medicines') })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsClearSheetOpen(true)}
          className="text-xs font-semibold text-red-500 hover:text-red-600 active:opacity-60 min-h-[44px] px-2 flex items-center touch-manipulation cursor-pointer transition-opacity"
        >
          {t('Clear')}
        </button>
      </div>

      {/* 2. Minimum Order Progress Card */}
      <MinOrderProgress bill={bill} />

      {/* 3. Items List with Apple Physics Animation */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
          {t('Order Items')}
        </h2>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrement={increment}
                onDecrement={decrement}
                onRemove={removeItem}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Delivery Address & Fulfilling Pharmacy Grouped Cell */}
      <div className="space-y-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
          {t('Delivery Details')}
        </h2>

        <div className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Row 1: Deliver to */}
          <div
            onClick={() => navigate('/address?redirect=/cart')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 active:bg-gray-100/70 touch-manipulation transition-colors select-none"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 flex-shrink-0">
                <MapPin className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-400">{t('Deliver to')}</p>
                <p className="text-xs font-bold text-gray-950 truncate">
                  {address || <span className="text-emerald-700 font-semibold">{t('Select delivery address')}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 flex-shrink-0">
              <span>{t('Change')}</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.25] text-gray-400" />
            </div>
          </div>

          <div className="border-t border-gray-100/80 mx-3.5" />

          {/* Row 2: Fulfilling pharmacy */}
          <div
            onClick={() => setIsPharmacySheetOpen(true)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 active:bg-gray-100/70 touch-manipulation transition-colors select-none"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 flex-shrink-0">
                <Store className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-400">{t('Fulfilling pharmacy')}</p>
                <p className="text-xs font-bold text-gray-950 truncate">{selectedPharmacy.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 flex-shrink-0">
              <span>{t('Change')}</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.25] text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bill Details Card */}
      <BillCard bill={bill} />

      {/* 6. Payment Method Selector */}
      <PaymentSelector
        selectedMethod={paymentMethod}
        onSelectMethod={setPaymentMethod}
      />

      {/* 7. Place Order Bar */}
      <PlaceOrderBar
        bill={bill}
        onPlaceOrder={handlePlaceOrderClick}
        isSubmitting={isSubmittingOrder}
      />

      {/* Clear Cart Confirmation Bottom Sheet */}
      <BottomSheet
        isOpen={isClearSheetOpen}
        onClose={() => setIsClearSheetOpen(false)}
        title={t('Clear your cart?')}
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            {t('Are you sure you want to remove all {n} items from your cart? You will need to re-add medicines from the catalog.', { n: items.length })}
          </p>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsClearSheetOpen(false)}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 touch-manipulation cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setIsClearSheetOpen(false);
              }}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-xs touch-manipulation cursor-pointer"
            >
              {t('Clear all')}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Location / Address Selection Fallback Bottom Sheet */}
      <LocationSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        onSaved={handleAddressSaved}
      />

      {/* Final Address & Order Review Bottom Sheet */}
      <ConfirmOrderSheet
        isOpen={isConfirmOrderSheetOpen}
        onClose={() => setIsConfirmOrderSheetOpen(false)}
        onConfirm={handleConfirmAndPlaceOrder}
        onChangeAddress={() => navigate('/address?redirect=/cart')}
        fullName={fullName}
        phone={phone}
        villagePo={villagePo}
        pinCode={pinCode}
        landmark={landmark}
        paymentMethod={paymentMethod}
        bill={bill}
        itemsCount={items.length}
        isSubmitting={isSubmittingOrder}
      />

      {/* Choose Fulfilling Pharmacy Bottom Sheet */}
      <BottomSheet
        isOpen={isPharmacySheetOpen}
        onClose={() => setIsPharmacySheetOpen(false)}
        title={t('Select Pharmacy')}
      >
        <div className="space-y-3 pt-1 pb-4">
          <div className="space-y-2 pt-1">
            {pharmacyOptions.map((ph) => {
              const isSelected = selectedPharmacy.id === ph.id;
              return (
                <div
                  key={ph.id}
                  onClick={() => {
                    setSelectedPharmacy(ph);
                    setIsPharmacySheetOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all touch-manipulation select-none ${
                    isSelected
                      ? 'border-emerald-600/60 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/20'
                      : 'border-black/[0.05] bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-gray-950 truncate">{ph.name}</p>
                        {ph.distance && (
                          <span className="text-[10px] text-gray-400 font-medium">· {ph.distance}</span>
                        )}
                      </div>
                      {ph.address && (
                        <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{ph.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-700 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
