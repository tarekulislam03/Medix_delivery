import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  Trash2,
  MapPin,
  User,
  Building,
  Navigation,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { useT } from '../lib/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function DeliveryAddress() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const fromCart = searchParams.get('fromCart') === 'true';

  const phone = useUserStore((state) => state.phone);
  const userName = useUserStore((state) => state.name);
  const setUser = useUserStore((state) => state.setUser);
  // Guests (no OTP login) only give name + phone + address at checkout
  const hasToken = Boolean(localStorage.getItem('medix_customer_token'));

  const savedAddresses = useLocationStore((state) => state.savedAddresses) || [];
  const activeAddressId = useLocationStore((state) => state.activeAddressId);
  const villagePoStored = useLocationStore((state) => state.villagePo);
  const pinCodeStored = useLocationStore((state) => state.pinCode);

  const fetchAddresses = useLocationStore((state) => state.fetchAddresses);
  const saveAddress = useLocationStore((state) => state.saveAddress);
  const setDeliveryAddress = useLocationStore((state) => state.setDeliveryAddress);
  const deleteAddress = useLocationStore((state) => state.deleteAddress);

  // If user has 0 saved addresses, default to adding new address
  const [isAddingNew, setIsAddingNew] = useState(savedAddresses.length === 0);
  const [fullName, setFullName] = useState(userName || '');
  const [guestPhone, setGuestPhone] = useState(phone || '');
  const [villagePo, setVillagePo] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync addresses from DB when page mounts
  useEffect(() => {
    if (phone && hasToken) {
      fetchAddresses().then((addresses) => {
        if (!addresses || addresses.length === 0) {
          setIsAddingNew(true);
        }
      });
    }
  }, [phone, hasToken, fetchAddresses]);

  // If list changes and empty, show form
  useEffect(() => {
    if (savedAddresses.length === 0) {
      setIsAddingNew(true);
    }
  }, [savedAddresses.length]);

  const handleGoBack = () => {
    if (redirectParam) {
      navigate(redirectParam, { replace: true });
    } else if (fromCart) {
      navigate('/cart', { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleSelectAddress = (item) => {
    setDeliveryAddress(item);
    if (redirectParam || fromCart) {
      handleGoBack();
    }
  };

  const handleSubmitNewAddress = async (e) => {
    e?.preventDefault?.();
    if (isSaving) return;

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(t('Please enter your full name.'));
      return;
    }
    if (!villagePo.trim() || villagePo.trim().length < 3) {
      setError(t('Please enter your Village & Post Office.'));
      return;
    }
    const cleanGuestPhone = guestPhone.replace(/\D/g, '').slice(-10);
    if (!hasToken && !/^[6-9]\d{9}$/.test(cleanGuestPhone)) {
      setError(t('Please enter a valid 10-digit mobile number.'));
      return;
    }
    const cleanPin = pinCode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setError(t('Please enter a valid 6-digit PIN Code.'));
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      if (!hasToken) {
        setUser({ name: fullName.trim(), phone: cleanGuestPhone, isVerified: false });
      }
      await saveAddress({
        fullName: fullName.trim(),
        villagePo: villagePo.trim(),
        pinCode: cleanPin,
        landmark: landmark.trim(),
        phone: hasToken ? phone : cleanGuestPhone,
      });

      handleGoBack();
    } catch (err) {
      console.error('Failed to save address:', err);
      setError(t('Could not save address. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F7F4EC] text-[#0E1A14] flex flex-col justify-start overflow-hidden antialiased select-none">
      {/* 
        1. MEDIX NATIVE HEADER
      */}
      <header
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        }}
        className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#0E1A14] shadow-card active:scale-95 transition-transform cursor-pointer touch-manipulation border border-[#EFEAD8]"
            aria-label={t('Go back')}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
          </button>

          <h1 className="font-display font-extrabold text-[28px] sm:text-[30px] leading-none tracking-[-0.02em] text-[#0E1A14]">
            {t('delivery address.')}
          </h1>
        </div>

        <LanguageSwitcher variant="light" />
      </header>

      {/* 
        2. TOP ~60% MAIN INTERACTIVE CONTENT
        Comfortably accommodates address selection or creation form,
        leaving the bottom ~40% completely unobstructed for virtual keyboard.
      */}
      <div className="w-full max-w-md mx-auto px-4 pt-1 shrink-0 overflow-y-auto max-h-[75dvh] no-scrollbar pb-6">
        {isAddingNew ? (
          /* ================= CASE B: ADD NEW ADDRESS FORM ================= */
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#EFEAD8] shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-[20px] tracking-[-0.02em] text-[#0E1A14]">
                  {savedAddresses.length === 0 ? t('Add delivery address') : t('Add another address')}
                  <span className="text-[#003820]">.</span>
                </h2>
                <p className="text-[13px] text-[#5E6B63] font-medium mt-0.5">
                  {t('Medicines will be delivered express to this location.')}
                </p>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs font-bold text-[#003820] hover:underline cursor-pointer touch-manipulation px-2 py-1"
                >
                  {t('Cancel')}
                </button>
              )}
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-2.5 rounded-[12px] bg-red-50 border border-red-200 text-[#D64538] text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#D64538]" />
                  <span className="leading-tight">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmitNewAddress} className="space-y-3">
              {/* Recipient Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1">
                  {t('Full Name')} *
                </label>
                <div className="relative flex items-center bg-[#F7F4EC] focus-within:bg-white rounded-[14px] border border-[#E5E0D5] focus-within:border-[#003820] focus-within:ring-2 focus-within:ring-[#003820]/10 transition-all overflow-hidden h-[48px] px-3.5">
                  <User className="w-4 h-4 text-[#003820] shrink-0 mr-2.5" />
                  <input
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError('');
                    }}
                    placeholder={t('Enter recipient full name')}
                    className="w-full h-full bg-transparent text-[16px] text-[#0E1A14] placeholder:text-[#5E6B63]/60 focus:outline-none font-medium"
                    autoFocus
                  />
                </div>
              </div>

              {/* Mobile number (guest checkout, no OTP) */}
              {!hasToken && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1">
                    {t('Mobile Number')} *
                  </label>
                  <div className="relative flex items-center bg-[#F7F4EC] focus-within:bg-white rounded-[14px] border border-[#E5E0D5] focus-within:border-[#003820] focus-within:ring-2 focus-within:ring-[#003820]/10 transition-all overflow-hidden h-[48px] px-3.5">
                    <span className="text-[16px] font-bold text-[#003820] mr-2">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={guestPhone}
                      onChange={(e) => {
                        setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        setError('');
                      }}
                      placeholder="98XXXXXXXX"
                      className="w-full h-full bg-transparent text-[16px] text-[#0E1A14] placeholder:text-[#5E6B63]/60 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Village & Post Office */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1">
                  {t('Village & Post Office')} *
                </label>
                <div className="relative flex items-center bg-[#F7F4EC] focus-within:bg-white rounded-[14px] border border-[#E5E0D5] focus-within:border-[#003820] focus-within:ring-2 focus-within:ring-[#003820]/10 transition-all overflow-hidden h-[48px] px-3.5">
                  <Building className="w-4 h-4 text-[#003820] shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={villagePo}
                    onChange={(e) => {
                      setVillagePo(e.target.value);
                      setError('');
                    }}
                    placeholder={t('e.g. Nababpur, PO: Chanditala')}
                    className="w-full h-full bg-transparent text-[16px] text-[#0E1A14] placeholder:text-[#5E6B63]/60 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* PIN Code & Landmark in 2 Columns */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1">
                    {t('PIN Code')} *
                  </label>
                  <div className="relative flex items-center bg-[#F7F4EC] focus-within:bg-white rounded-[14px] border border-[#E5E0D5] focus-within:border-[#003820] focus-within:ring-2 focus-within:ring-[#003820]/10 transition-all overflow-hidden h-[48px] px-3">
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => {
                        setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                      }}
                      placeholder="712701"
                      className="w-full h-full bg-transparent text-[16px] text-[#0E1A14] placeholder:text-[#5E6B63]/60 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1">
                    {t('Landmark')}
                  </label>
                  <div className="relative flex items-center bg-[#F7F4EC] focus-within:bg-white rounded-[14px] border border-[#E5E0D5] focus-within:border-[#003820] focus-within:ring-2 focus-within:ring-[#003820]/10 transition-all overflow-hidden h-[48px] px-3">
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => {
                        setLandmark(e.target.value);
                        setError('');
                      }}
                      placeholder={t('Near club/temple')}
                      className="w-full h-full bg-transparent text-[16px] text-[#0E1A14] placeholder:text-[#5E6B63]/60 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Medix Signature Pill Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="relative w-full min-h-[52px] bg-[#003820] disabled:bg-[#E3EFE8] disabled:text-[#5E6B63] text-white text-[15px] font-display font-bold tracking-[-0.02em] rounded-[999px] transition-transform duration-150 active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-between pl-6 pr-2 select-none shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)] mt-2"
              >
                <span>{isSaving ? t('Saving address...') : t('Save & Deliver Here')}</span>
                <div className="w-10 h-10 rounded-full bg-[#C6F26B] text-[#0E1A14] flex items-center justify-center shrink-0">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0E1A14]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.6]" />
                  )}
                </div>
              </button>
            </form>
          </div>
        ) : (
          /* ================= CASE C: SAVED ADDRESSES LIST ================= */
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[13px] font-bold uppercase tracking-wider text-[#5E6B63]">
                {t('Saved Addresses')} ({savedAddresses.length})
              </span>

              <button
                type="button"
                onClick={() => {
                  setFullName(userName || '');
                  setVillagePo('');
                  setPinCode('');
                  setLandmark('');
                  setIsAddingNew(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[999px] bg-white border border-[#EFEAD8] text-[#003820] font-bold text-xs shadow-2xs hover:bg-[#F7F4EC] active:scale-95 transition-all cursor-pointer touch-manipulation"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('Add another address')}</span>
              </button>
            </div>

            {/* List of Saved Address Cards */}
            <div className="space-y-2.5">
              {savedAddresses.map((item) => {
                const isSelected =
                  item.id === activeAddressId ||
                  (item.villagePo === villagePoStored && item.pinCode === pinCodeStored);

                return (
                  <div
                    key={item.id || item._id}
                    onClick={() => handleSelectAddress(item)}
                    className={`relative p-4 rounded-[18px] border transition-all cursor-pointer touch-manipulation flex items-start gap-3.5 select-none ${
                      isSelected
                        ? 'bg-white border-[#003820] shadow-card ring-2 ring-[#003820]/10'
                        : 'bg-white border-[#EFEAD8] hover:border-[#003820]/30 shadow-2xs'
                    }`}
                  >
                    {/* Radio Check Circle */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#003820] text-[#C6F26B]'
                          : 'border-2 border-[#D8D2C4] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Address Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-[15px] text-[#0E1A14] truncate">
                          {item.fullName || t('Customer')}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-[999px] bg-[#EEF8D2] text-[#003820] text-[10px] font-extrabold tracking-wide">
                            {t('Selected')}
                          </span>
                        )}
                      </div>

                      <p className="text-[14px] text-[#0E1A14] font-medium mt-1 leading-snug">
                        {item.villagePo}
                        {item.landmark && `, Near ${item.landmark}`}
                      </p>

                      <p className="text-[13px] text-[#5E6B63] font-mono font-semibold mt-0.5">
                        PIN: {item.pinCode}
                      </p>
                    </div>

                    {/* Delete Address Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(item.id || item._id);
                      }}
                      className="p-2 text-[#5E6B63] hover:text-[#D64538] active:scale-90 transition-transform cursor-pointer touch-manipulation"
                      aria-label={t('Delete address')}
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* If redirected from Cart, show primary "Deliver to this address" button */}
            {(redirectParam || fromCart) && (
              <button
                type="button"
                onClick={handleGoBack}
                className="w-full min-h-[52px] rounded-[999px] bg-[#003820] hover:bg-[#002615] active:scale-[0.98] text-white font-display font-bold text-[15px] flex items-center justify-between pl-6 pr-2 transition-transform shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)] cursor-pointer touch-manipulation mt-2"
              >
                <span>{t('Deliver to this address')}</span>
                <div className="w-10 h-10 rounded-full bg-[#C6F26B] text-[#0E1A14] flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4 stroke-[2.6]" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 
        3. BOTTOM COMFORT ZONE (~40% of Screen)
        Dedicated empty area for mobile on-screen keyboard ergonomics.
      */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 px-6 text-center select-none pointer-events-none opacity-70">
        <div className="flex items-center gap-2 text-[#5E6B63] text-xs font-semibold">
          <MapPin className="w-4 h-4 text-[#003820]" />
          <span>{t('100% Genuine Medicines · 24-hour Chemist Delivery')}</span>
        </div>
      </div>
    </div>
  );
}
