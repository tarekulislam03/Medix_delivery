import React, { useState, useEffect } from 'react';
import { MapPin, Check, Building2, Hash, Landmark, User } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { useT } from '../lib/i18n';

export default function LocationSheet({ isOpen, onClose, onSaved }) {
  const t = useT();
  const currentFullName = useLocationStore((state) => state.fullName);
  const currentAddress = useLocationStore((state) => state.address);
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

  // Sync inputs with current store when opening
  useEffect(() => {
    if (isOpen) {
      setFullName(currentFullName || userName || '');
      setVillagePo(currentVillagePo || '');
      setPinCode(currentPinCode || '');
      setLandmark(currentLandmark || '');
      setError('');
    }
  }, [isOpen, currentFullName, userName, currentVillagePo, currentPinCode, currentLandmark]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
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

    const saved = saveAddress({
      fullName: fullName.trim(),
      villagePo: villagePo.trim(),
      pinCode: pinCode.trim(),
      landmark: landmark.trim(),
    });

    setUserName({ name: fullName.trim() });
    setError('');
    onSaved?.(saved);
    onClose?.();
  };

  const handleSelectSaved = (saved) => {
    if (!saved) return;
    setDeliveryAddress(saved);
    if (saved.fullName) {
      setUserName({ name: saved.fullName });
    }
    onSaved?.(saved);
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('Delivery Address')}>
      <div className="pb-3">
        <p className="text-xs text-ink-light -mt-1 mb-3">
          {t('Enter where to deliver your medicines')}
        </p>

        {/* Manual Address Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-green" />
              <span>{t('Your Name *')}</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-11 px-3.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 text-sm text-ink placeholder:text-gray-400 focus:outline-none transition-all touch-manipulation font-medium"
              autoFocus
            />
          </div>

          {/* 2. Village & Post Office */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-green" />
              <span>{t('Village & Post Office *')}</span>
            </label>
            <input
              type="text"
              value={villagePo}
              onChange={(e) => setVillagePo(e.target.value)}
              placeholder="Enter your Village, P.O."
              className="w-full h-11 px-3.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 text-sm text-ink placeholder:text-gray-400 focus:outline-none transition-all touch-manipulation font-medium"
            />
          </div>

          {/* 3. PIN Code */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-brand-green" />
              <span>{t('PIN Code *')}</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter your PIN Code"
              className="w-full h-11 px-3.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 text-sm text-ink placeholder:text-gray-400 focus:outline-none transition-all touch-manipulation font-mono font-medium tracking-wide"
            />
          </div>

          {/* 4. Nearest Landmark */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-brand-green" />
              <span>{t('Nearest Landmark')}</span>
              <span className="text-[11px] font-normal text-gray-400">{t('(Optional)')}</span>
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Enter your nearest landmark"
              className="w-full h-11 px-3.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 text-sm text-ink placeholder:text-gray-400 focus:outline-none transition-all touch-manipulation font-medium"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full h-11 mt-2 bg-brand-green hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors touch-manipulation flex items-center justify-center gap-1.5 tracking-wide uppercase cursor-pointer"
          >
            <span>{t('Save & Continue')}</span>
          </button>
        </form>

        {/* Saved Addresses list if any exist */}
        {savedAddresses.length > 0 && (
          <div className="pt-5 mt-4 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">
              {t('Saved Addresses')}
            </span>

            <div className="space-y-2 max-h-44 overflow-y-auto">
              {savedAddresses.map((item, idx) => {
                const isSelected = currentAddress === item?.address;
                return (
                  <div
                    key={item?.id || item?.address || idx}
                    onClick={() => handleSelectSaved(item)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors touch-manipulation ${
                      isSelected
                        ? 'bg-emerald-50/70 border-brand-green shadow-xs'
                        : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <MapPin
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected ? 'text-brand-green' : 'text-gray-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink truncate">
                          {item?.fullName ? `${item.fullName} · ` : ''}{item?.villagePo || item?.address}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {item?.landmark ? t('Near {landmark}', { landmark: item.landmark }) + ' · ' : ''}{t('PIN: {pin}', { pin: item?.pinCode || '' })}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
