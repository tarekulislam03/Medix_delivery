import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { useT } from '../lib/i18n';

export default function DeliveryAddress() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const currentFullName = useLocationStore((state) => state.fullName);
  const currentVillagePo = useLocationStore((state) => state.villagePo);
  const currentPinCode = useLocationStore((state) => state.pinCode);
  const currentLandmark = useLocationStore((state) => state.landmark);
  const savedAddresses = (useLocationStore((state) => state.savedAddresses) || []).filter(Boolean);
  const saveAddress = useLocationStore((state) => state.saveAddress);
  const setDeliveryAddress = useLocationStore((state) => state.setDeliveryAddress);

  const userName = useUserStore((state) => state.name);
  const setUserName = useUserStore((state) => state.setUser);

  const [fullName, setFullName] = useState(currentFullName || userName || '');
  const [villagePo, setVillagePo] = useState(currentVillagePo || '');
  const [pinCode, setPinCode] = useState(currentPinCode || '');
  const [landmark, setLandmark] = useState(currentLandmark || '');
  const [error, setError] = useState('');
  const [isSwiping, setIsSwiping] = useState(false);

  const handleGoBack = () => {
    if (redirectParam) {
      navigate(redirectParam, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (isSwiping) return;

    if (!fullName.trim()) {
      setError(t('Please enter your name'));
      return;
    }
    if (!villagePo.trim()) {
      setError(t('Please enter your Village & Post Office'));
      return;
    }
    if (!pinCode.trim() || pinCode.trim().length < 6) {
      setError(t('Please enter a valid 6-digit PIN Code'));
      return;
    }

    setError('');
    setIsSwiping(true);

    // Left-to-right swipe animation runs for 280ms, then saves and redirects
    setTimeout(() => {
      saveAddress({
        fullName: fullName.trim(),
        villagePo: villagePo.trim(),
        pinCode: pinCode.trim(),
        landmark: landmark.trim(),
      });

      setUserName({ name: fullName.trim() });
      handleGoBack();
    }, 280);
  };

  const handleSelectSaved = (saved) => {
    if (!saved) return;
    setDeliveryAddress(saved);
    if (saved.fullName) {
      setUserName({ name: saved.fullName });
    }
    setFullName(saved.fullName || '');
    setVillagePo(saved.villagePo || '');
    setPinCode(saved.pinCode || '');
    setLandmark(saved.landmark || '');

    handleGoBack();
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-white text-gray-900 flex flex-col justify-start overflow-hidden antialiased select-none">
      {/* Top Header Bar */}
      <header
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        }}
        className="w-full max-w-md mx-auto px-5 py-3 flex items-center justify-between shrink-0"
      >
        <button
          type="button"
          onClick={handleGoBack}
          className="w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-gray-800 transition-colors cursor-pointer touch-manipulation"
          aria-label={t('Go back')}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
        </button>

        <h1 className="text-base font-bold text-gray-950 tracking-tight">
          {t('Delivery Address')}
        </h1>

        <div className="w-10 h-10" />
      </header>

      {/* Top 40% Main Content Area */}
      <main className="w-full max-w-md mx-auto px-5 pt-1 pb-4 shrink-0">
        {/* Saved Addresses Chips (if any exist) */}
        {savedAddresses.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-3">
            {savedAddresses.map((saved) => {
              const isSelected = saved.villagePo === villagePo && saved.pinCode === pinCode;
              return (
                <button
                  key={saved.id}
                  type="button"
                  onClick={() => handleSelectSaved(saved)}
                  className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold flex items-center justify-center transition-all active:scale-95 cursor-pointer touch-manipulation select-none ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="truncate max-w-[150px]">{saved.villagePo}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="mb-3 px-3.5 py-2.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium leading-relaxed"
            >
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flat Minimal Apple Form without icons */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Full Name */}
          <div className="relative flex items-center bg-gray-50 focus-within:bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden h-11 px-3.5">
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError('');
              }}
              placeholder={t('Your Name *')}
              className="w-full h-full bg-transparent text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none font-medium"
              autoFocus
            />
          </div>

          {/* Village & Post Office */}
          <div className="relative flex items-center bg-gray-50 focus-within:bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden h-11 px-3.5">
            <input
              type="text"
              value={villagePo}
              onChange={(e) => {
                setVillagePo(e.target.value);
                setError('');
              }}
              placeholder={t('Village & Post Office *')}
              className="w-full h-full bg-transparent text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none font-medium"
            />
          </div>

          {/* PIN Code & Landmark in 2 columns */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative flex items-center bg-gray-50 focus-within:bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden h-11 px-3.5">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder={t('PIN Code *')}
                className="w-full h-full bg-transparent text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none font-mono font-medium"
              />
            </div>

            <div className="relative flex items-center bg-gray-50 focus-within:bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden h-11 px-3.5">
              <input
                type="text"
                value={landmark}
                onChange={(e) => {
                  setLandmark(e.target.value);
                  setError('');
                }}
                placeholder={t('Nearest Landmark')}
                className="w-full h-full bg-transparent text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Save & Continue Button with Left-to-Right Swipe Animation */}
          <button
            type="submit"
            disabled={isSwiping}
            className="relative w-full h-11 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm tracking-tight shadow-xs overflow-hidden transition-all cursor-pointer flex items-center justify-center select-none mt-1"
          >
            {/* Left-to-Right Progress Color Fill */}
            <motion.div
              initial={{ width: '0%' }}
              animate={isSwiping ? { width: '100%' } : { width: '0%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 bottom-0 bg-emerald-900 pointer-events-none"
            />

            {/* Left-to-Right Swipe Wave Shimmer */}
            {isSwiping && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.32, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
              />
            )}

            {/* Button Text */}
            <div className="relative z-10 flex items-center justify-center">
              <motion.span
                animate={isSwiping ? { x: [0, 8, 16], opacity: [1, 1, 0.9] } : {}}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                {isSwiping ? t('Saving...') : t('Save & Continue')}
              </motion.span>
            </div>
          </button>
        </form>
      </main>

      {/* Remaining 60% of Screen Kept Clean and Empty */}
      <div className="flex-1" />
    </div>
  );
}
