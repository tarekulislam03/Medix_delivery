import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  MapPin,
  ChevronRight,
  Store,
  Check,
  ArrowLeft,
} from 'lucide-react';

import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { calcBill } from '../lib/fees';
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
import ElasticScroll from '../components/ElasticScroll';
import { useT } from '../lib/i18n';

export default function Cart() {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Cart Store
  const items = useCartStore((state) => state.items);
  const totalUnits = useCartStore((state) => state.getTotalItems());
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
  const [orderError, setOrderError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(PARTNER_PHARMACIES[0]);
  const [isPharmacySheetOpen, setIsPharmacySheetOpen] = useState(false);

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

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const bill = useMemo(() => calcBill(subtotal), [subtotal]);

  const handlePlaceOrderClick = () => {
    setOrderError(null);
    if (!bill.canOrder) return;

    if (!address || !villagePo) {
      navigate('/address?redirect=/cart');
      return;
    }

    if (!phone) {
      navigate('/address?redirect=/cart');
      return;
    }

    setIsConfirmOrderSheetOpen(true);
  };

  const handleAddressSaved = () => {
    setIsAddressSheetOpen(false);
    setTimeout(() => {
      setIsConfirmOrderSheetOpen(true);
    }, 250);
  };

  const handleConfirmAndPlaceOrder = async () => {
    setIsSubmittingOrder(true);
    setOrderError(null);

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
      const createdOrder = res?.data?.order || res?.data?.data;
      if (res?.data?.success && createdOrder) {
        const orderToPass = {
          ...createdOrder,
          id: createdOrder.id || createdOrder.orderNumber || createdOrder.orderId || createdOrder._id,
        };

        queryClient.invalidateQueries({ queryKey: ['orders'] });

        setIsSubmittingOrder(false);
        setIsConfirmOrderSheetOpen(false);
        setOrderError(null);
        clearCart();
        navigate('/order-success', {
          state: {
            order: orderToPass,
            payload: orderPayload,
          },
        });
        return;
      }
      throw new Error(res?.data?.error?.message || res?.data?.message || 'Failed to place order');
    } catch (err) {
      console.error('Backend order placement error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || t('Could not place order. Please try again.');
      setIsSubmittingOrder(false);
      setOrderError(msg);
    }
  };

  // 1. Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-[#F7F4EC] text-[#0E1A14] pb-4 antialiased select-none">
        <header
          style={{
            paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
          }}
          className="px-5 pb-4 flex items-center gap-3"
        >
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="w-11 h-11 rounded-[999px] bg-white flex items-center justify-center text-[#0E1A14] active:scale-[0.95] transition-transform duration-150 cursor-pointer touch-manipulation"
            aria-label={t('Back to medicines')}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
          </button>
          <h1 className="font-display font-extrabold text-[30px] tracking-[-0.02em] text-[#0E1A14]">
            your cart<span className="text-[#003820]">.</span>
          </h1>
        </header>

        <div className="px-5 pt-4">
          <div className="bg-white rounded-[16px] p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-[999px] bg-[#E3EFE8] flex items-center justify-center mx-auto text-[#003820]">
              <ShoppingBag className="w-7 h-7 stroke-[2.25]" />
            </div>
            <h2 className="font-display font-extrabold text-[22px] tracking-[-0.02em] text-[#0E1A14]">
              {t('your cart is empty.')}
            </h2>
            <p className="text-[15px] text-[#5E6B63] max-w-[260px] mx-auto leading-relaxed">
              {t('Add fever, cold, or daily medicines and get them within 24 hours.')}
            </p>
            <Link
              to="/search"
              className="mt-2 inline-flex min-h-[48px] items-center px-6 bg-[#003820] text-white font-display text-[15px] font-bold rounded-[999px] touch-manipulation cursor-pointer active:scale-[0.96] transition-transform duration-150"
            >
              {t('Browse medicines')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#F7F4EC] text-[#0E1A14] pb-4 antialiased select-none">
      {/* 1. Confident Sticky Header with Units vs. Medicines & Quiet Clear Button */}
      <header
        style={{
          paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
        }}
        className="sticky top-0 z-20 apple-material px-5 pb-4 flex items-end justify-between gap-3"
      >
        <div>
          <h1 className="font-display font-extrabold text-[30px] sm:text-[32px] leading-none tracking-[-0.02em] text-[#0E1A14]">
            your cart<span className="text-[#003820]">.</span>
          </h1>
          <p className="text-[15px] text-[#5E6B63] font-medium mt-1.5 tabular-nums">
            {t.num(totalUnits)} {totalUnits === 1 ? t('item') : t('items')} · {t.num(items.length)}{' '}
            {items.length === 1 ? t('medicine') : t('medicines')}
          </p>
        </div>

        {/* Quiet Text Button for Clear */}
        <button
          type="button"
          onClick={() => setIsClearSheetOpen(true)}
          className="min-h-[44px] px-3 rounded-[999px] text-[14px] font-medium text-[#5E6B63] hover:text-[#D64538] active:scale-[0.96] transition-all duration-150 touch-manipulation cursor-pointer"
        >
          {t('Clear')}
        </button>
      </header>

      <ElasticScroll maxStretchTop={100} maxStretchBottom={120}>
        <div className="px-5 pt-2 space-y-5">
        {/* 2. Free / 70% Off Delivery Progress Bar at the Top */}
        <MinOrderProgress bill={bill} />

        {/* 3. Cart Items Stack */}
        <div className="space-y-3">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* 4. Delivery Address & Fulfilling Pharmacy */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-[18px] tracking-[-0.02em] text-[#0E1A14] px-0.5">
            {t('delivery.')}
          </h2>

          <div className="bg-white rounded-[16px] divide-y divide-[#F7F4EC] overflow-hidden">
            {/* Row 1: Deliver to */}
            <div
              onClick={() => {
                navigate('/address?redirect=/cart');
              }}
              className="min-h-[68px] p-4 flex items-center justify-between cursor-pointer active:bg-[#F7F4EC] touch-manipulation transition-colors select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <MapPin className="w-5 h-5 text-[#003820] stroke-[2.25] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#5E6B63]">{t('Deliver to')}</p>
                  <p className="text-[15px] font-bold text-[#0E1A14] truncate mt-0.5 select-text">
                    {!phone ? (
                      <span className="text-[#D64538] font-semibold">{t('No address added · Tap to sign in')}</span>
                    ) : (
                      (villagePo || address) || (
                        <span className="text-[#D64538] font-semibold">{t('No address added · Tap to add')}</span>
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[14px] font-bold text-[#003820] shrink-0">
                <span>{!phone || (!villagePo && !address) ? t('Add') : t('Change')}</span>
                <ChevronRight className="w-4 h-4 stroke-[2.25]" />
              </div>
            </div>

            {/* Row 2: Fulfilling pharmacy */}
            <div
              onClick={() => setIsPharmacySheetOpen(true)}
              className="min-h-[68px] p-4 flex items-center justify-between cursor-pointer active:bg-[#F7F4EC] touch-manipulation transition-colors select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <Store className="w-5 h-5 text-[#003820] stroke-[2.25] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#5E6B63]">{t('Fulfilling pharmacy')}</p>
                  <p className="text-[15px] font-bold text-[#0E1A14] truncate mt-0.5">{selectedPharmacy.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[14px] font-bold text-[#003820] shrink-0">
                <span>{t('Change')}</span>
                <ChevronRight className="w-4 h-4 stroke-[2.25]" />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Bill Details Card (with self-explaining discount line) */}
        <BillCard bill={bill} />

        {/* 6. Payment Method Selector (with UPI coming soon in neutral gray) */}
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
        </div>
      </ElasticScroll>

      {/* Clear Cart Confirmation Dialog */}
      <BottomSheet
        isOpen={isClearSheetOpen}
        onClose={() => setIsClearSheetOpen(false)}
        title={t('clear cart?')}
      >
        <div className="space-y-5 pt-1">
          <p className="text-[15px] text-[#5E6B63] leading-relaxed">
            {t('Remove all {units} items ({meds} medicines) from your cart?', {
              units: totalUnits,
              meds: items.length,
            })}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsClearSheetOpen(false)}
              className="flex-1 min-h-[48px] px-4 rounded-[999px] bg-white text-[15px] font-bold text-[#0E1A14] active:scale-[0.97] transition-transform duration-150 touch-manipulation cursor-pointer"
            >
              {t('Keep items')}
            </button>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setIsClearSheetOpen(false);
              }}
              className="flex-1 min-h-[48px] px-4 rounded-[999px] bg-[#D64538] text-white text-[15px] font-bold active:scale-[0.97] transition-transform duration-150 touch-manipulation cursor-pointer"
            >
              {t('Yes, clear')}
            </button>
          </div>
        </div>
      </BottomSheet>

      <LocationSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        onSaved={handleAddressSaved}
      />

      <ConfirmOrderSheet
        isOpen={isConfirmOrderSheetOpen}
        onClose={() => {
          setIsConfirmOrderSheetOpen(false);
          setOrderError(null);
        }}
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
        totalUnits={totalUnits}
        isSubmitting={isSubmittingOrder}
        errorMessage={orderError}
      />

      <BottomSheet
        isOpen={isPharmacySheetOpen}
        onClose={() => setIsPharmacySheetOpen(false)}
        title={t('select pharmacy.')}
      >
        <div className="space-y-2.5 pt-1 pb-2">
          {pharmacyOptions.map((ph) => {
            const isSelected = selectedPharmacy.id === ph.id;
            return (
              <div
                key={ph.id}
                onClick={() => {
                  setSelectedPharmacy(ph);
                  setIsPharmacySheetOpen(false);
                }}
                className={`min-h-[64px] p-4 rounded-[16px] flex items-center justify-between cursor-pointer touch-manipulation select-none transition-transform duration-150 active:scale-[0.99] ${
                  isSelected ? 'bg-[#E3EFE8]' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <Store className="w-5 h-5 text-[#003820] stroke-[2.25] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#0E1A14] truncate">{ph.name}</p>
                    {ph.address && (
                      <p className="text-[14px] text-[#5E6B63] truncate mt-0.5">{ph.address}</p>
                    )}
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-[999px] flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#003820] text-[#C6F26B]'
                      : 'border-2 border-[#5E6B63]/40 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
