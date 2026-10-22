import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Upload,
  CheckCircle2,
  X,
  FileCheck,
  Store,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { calcBill, formatPrice } from '../lib/fees';
import { addMockOrder } from '../lib/mockOrders';
import { PARTNER_PHARMACIES } from '../lib/partnerPharmacies';
import api from '../lib/api';

import CartItem from '../components/CartItem';
import MinOrderProgress from '../components/MinOrderProgress';
import BillCard from '../components/BillCard';
import PaymentSelector from '../components/PaymentSelector';
import PlaceOrderBar from '../components/PlaceOrderBar';
import BottomSheet from '../components/BottomSheet';
import LocationSheet from '../components/LocationSheet';
import PhoneOtpSheet from '../components/PhoneOtpSheet';
import ConfirmOrderSheet from '../components/ConfirmOrderSheet';

export default function Cart() {
  const navigate = useNavigate();

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
  const isPhoneVerified = useUserStore((state) => state.isVerified);

  // Local State
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [rxPreviewUrl, setRxPreviewUrl] = useState(null);
  const [isClearSheetOpen, setIsClearSheetOpen] = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [isOtpSheetOpen, setIsOtpSheetOpen] = useState(false);
  const [isConfirmOrderSheetOpen, setIsConfirmOrderSheetOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(PARTNER_PHARMACIES[0]);
  const [isPharmacySheetOpen, setIsPharmacySheetOpen] = useState(false);

  const rxInputRef = useRef(null);

  // Subtotal and Fee Breakdown
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const bill = useMemo(() => calcBill(subtotal), [subtotal]);
  const hasRxItem = useMemo(() => items.some((item) => item.requiresRx), [items]);

  // Handle Prescription Upload
  const handleRxFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRxPreviewUrl(url);
    }
  };

  const handleRemoveRx = (e) => {
    e.stopPropagation();
    if (rxPreviewUrl) {
      URL.revokeObjectURL(rxPreviewUrl);
    }
    setRxPreviewUrl(null);
    if (rxInputRef.current) {
      rxInputRef.current.value = '';
    }
  };

  // Step 1: Click "Place Order"
  const handlePlaceOrderClick = () => {
    if (!bill.canOrder) return;

    // A. If address not entered yet -> Ask for address
    if (!address || !villagePo) {
      setIsAddressSheetOpen(true);
      return;
    }

    // B. If phone not verified yet -> Ask for phone & OTP
    if (!phone || !isPhoneVerified) {
      setIsOtpSheetOpen(true);
      return;
    }

    // C. Returning customer (both already saved) -> Confirm address & place
    setIsConfirmOrderSheetOpen(true);
  };

  // Step 2: Once address is saved
  const handleAddressSaved = () => {
    setIsAddressSheetOpen(false);
    // If phone not verified yet, smoothly transition to OTP sheet
    if (!phone || !isPhoneVerified) {
      setTimeout(() => {
        setIsOtpSheetOpen(true);
      }, 250);
    } else {
      setTimeout(() => {
        setIsConfirmOrderSheetOpen(true);
      }, 250);
    }
  };

  // Step 3: Once phone is verified with OTP
  const handlePhoneVerified = () => {
    setIsOtpSheetOpen(false);
    // Transition to final address confirmation
    setTimeout(() => {
      setIsConfirmOrderSheetOpen(true);
    }, 250);
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
      pharmacy: selectedPharmacy.isAuto
        ? { name: 'Roy Medical Hall', address: 'Sevoke Road, Siliguri' }
        : { name: selectedPharmacy.name, address: selectedPharmacy.address },
      bill,
      prescriptionUploaded: !!rxPreviewUrl,
      timestamp: new Date().toISOString(),
    };

    // 1. Immediately register order locally for instant, zero-lag response
    const createdOrder = addMockOrder({
      ...orderPayload,
      address: `${villagePo}, ${pinCode}`,
    });
    console.log('Order Placed Successfully:', createdOrder);

    // 2. Persist to MongoDB in background asynchronously
    api.post('/orders', orderPayload).catch((err) => {
      console.warn('Backend order sync error, saved in mock store:', err.message);
    });

    // 3. Immediately close sheet, clear cart, and navigate without delay
    setIsSubmittingOrder(false);
    setIsConfirmOrderSheetOpen(false);
    clearCart();
    navigate('/order-success', {
      state: {
        order: createdOrder,
        payload: orderPayload,
      },
    });
  };

  // 1. Empty Cart State
  if (items.length === 0) {
    return (
      <div
        style={{
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
        }}
        className="max-w-md mx-auto p-4 min-h-screen bg-white"
      >
        <div className="pt-12 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-3 text-brand-green">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-ink">Your cart is empty</h2>
          <p className="text-xs text-ink-light mt-1 max-w-[220px] mx-auto">
            Browse our pharmacy catalog and add medicines to your cart.
          </p>
          <Link
            to="/search"
            className="mt-5 inline-flex min-h-[44px] items-center px-6 py-2.5 bg-brand-green hover:bg-brand-dark text-white text-xs font-bold rounded-pill shadow-sm touch-manipulation transition-colors"
          >
            Search medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="max-w-md mx-auto p-4 min-h-screen bg-white space-y-4"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-lg font-bold text-ink">Your cart</h1>
          <p className="text-xs text-ink-light">
            {items.length} {items.length === 1 ? 'medicine' : 'medicines'} added
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsClearSheetOpen(true)}
          className="text-xs font-semibold text-red-500 hover:text-red-700 min-h-[44px] px-2 flex items-center touch-manipulation"
        >
          Clear
        </button>
      </div>

      {/* 2. Minimum Order Progress Card */}
      <MinOrderProgress bill={bill} />

      {/* 3. Items List with Smooth Animation */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted px-0.5">
          Order Items
        </h2>
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

      {/* 4. Prescription Note (if any item requiresRx) */}
      {hasRxItem && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-card p-3.5 space-y-2.5">
          <input
            ref={rxInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleRxFileChange}
            className="hidden"
            aria-label="Upload Prescription"
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Prescription required. Upload it at checkout
                </h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  One or more medicines in your cart require a valid prescription.
                </p>
              </div>
            </div>

            {!rxPreviewUrl && (
              <motion.button
                type="button"
                onClick={() => rxInputRef.current?.click()}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="min-h-[44px] px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-pill shadow-xs flex items-center gap-1.5 flex-shrink-0 touch-manipulation"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </motion.button>
            )}
          </div>

          {/* Uploaded Thumbnail Preview */}
          <AnimatePresence>
            {rxPreviewUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="pt-2 border-t border-amber-200/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-300 bg-white flex-shrink-0">
                    <img
                      src={rxPreviewUrl}
                      alt="Prescription preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Prescription attached</span>
                    </div>
                    <span className="text-[10px] text-amber-800">Ready to verify</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleRemoveRx}
                  whileTap={{ scale: 0.95 }}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-800 hover:text-red-600 touch-manipulation"
                  aria-label="Remove uploaded prescription"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 5. Delivery Address & Fulfilling Pharmacy */}
      <div className="space-y-2">
        <div
          onClick={() => setIsAddressSheetOpen(true)}
          className="bg-surface rounded-card shadow-card border border-gray-100 p-3.5 flex items-center justify-between cursor-pointer hover:border-gray-200 touch-manipulation transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-green flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-ink-light">Deliver to</p>
              <p className="text-xs font-bold text-ink truncate">
                {address || <span className="text-brand-green font-semibold">Select delivery address</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-brand-green flex-shrink-0">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Fulfilling Pharmacy Row */}
        <div
          onClick={() => setIsPharmacySheetOpen(true)}
          className="bg-surface rounded-card shadow-card border border-gray-100 p-3.5 flex items-center justify-between cursor-pointer hover:border-gray-200 touch-manipulation transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-brand-green flex-shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-ink-light">Fulfilling pharmacy</p>
              <p className="text-xs font-bold text-ink truncate">{selectedPharmacy.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{selectedPharmacy.area}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-brand-green flex-shrink-0">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 6. Bill Details Card */}
      <BillCard bill={bill} />

      {/* 7. Payment Method Selector */}
      <PaymentSelector
        selectedMethod={paymentMethod}
        onSelectMethod={setPaymentMethod}
      />

      {/* 8. Sticky Place Order Bar */}
      <PlaceOrderBar
        bill={bill}
        onPlaceOrder={handlePlaceOrderClick}
        isSubmitting={isSubmittingOrder}
      />

      {/* Clear Cart Confirmation Bottom Sheet */}
      <BottomSheet
        isOpen={isClearSheetOpen}
        onClose={() => setIsClearSheetOpen(false)}
        title="Clear your cart?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-ink-light leading-relaxed">
            Are you sure you want to remove all {items.length} items from your cart? You will
            need to re-add medicines from the catalog.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsClearSheetOpen(false)}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-pill border border-gray-200 text-xs font-semibold text-ink hover:bg-gray-50 touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setIsClearSheetOpen(false);
              }}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-pill bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm touch-manipulation"
            >
              Clear all
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* 1. Location / Address Selection Bottom Sheet */}
      <LocationSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        onSaved={handleAddressSaved}
      />

      {/* 2. Phone OTP Verification Bottom Sheet */}
      <PhoneOtpSheet
        isOpen={isOtpSheetOpen}
        onClose={() => setIsOtpSheetOpen(false)}
        onVerified={handlePhoneVerified}
      />

      {/* 3. Final Address & Order Review Bottom Sheet */}
      <ConfirmOrderSheet
        isOpen={isConfirmOrderSheetOpen}
        onClose={() => setIsConfirmOrderSheetOpen(false)}
        onConfirm={handleConfirmAndPlaceOrder}
        onChangeAddress={() => setIsAddressSheetOpen(true)}
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
        title="Select Pharmacy"
      >
        <div className="space-y-3 pt-1 pb-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Choose your preferred local chemist in Siliguri. All partner pharmacies supply 100% genuine, sealed medicines.
          </p>

          <div className="space-y-2 pt-1">
            {PARTNER_PHARMACIES.map((ph) => {
              const isSelected = selectedPharmacy.id === ph.id;
              return (
                <div
                  key={ph.id}
                  onClick={() => {
                    setSelectedPharmacy(ph);
                    setIsPharmacySheetOpen(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all touch-manipulation ${
                    isSelected
                      ? 'border-brand-green bg-emerald-50/60 shadow-xs'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-ink truncate">{ph.name}</p>
                        {ph.distance && (
                          <span className="text-[10px] text-gray-400">· {ph.distance}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{ph.area}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-brand-green bg-brand-green text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[10px] text-gray-400 text-center leading-relaxed">
            If an item is temporarily out of stock at your chosen chemist, we source it from the nearest verified partner to ensure complete delivery.
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
