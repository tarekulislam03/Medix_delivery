import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  Globe,
  PackageCheck,
  Phone,
  MessageSquare,
  Trash2,
  Check,
  X,
  ChevronDown,
  Lock,
  Edit2,
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useLocationStore } from '../store/locationStore';
import { useLangStore, LANGUAGES, useT } from '../lib/i18n';

export default function Account() {
  const t = useT();
  const navigate = useNavigate();

  // User store state
  const name = useUserStore((state) => state.name);
  const phone = useUserStore((state) => state.phone);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);

  // Location store state
  const locationName = useLocationStore((state) => state.fullName);
  const address = useLocationStore((state) => state.address);
  const fullAddress = useLocationStore((state) => state.fullAddress);

  // Language store state
  const lang = useLangStore((state) => state.lang);
  const setLang = useLangStore((state) => state.setLang);

  // Display Name resolution
  const displayName = name || locationName || '';

  // Sheets state
  const [activeSheet, setActiveSheet] = useState(null); // 'language' | 'notifications' | 'support' | 'privacy' | 'profile' | 'logout'

  // Notification Preferences (saved in localStorage)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('medix_notif_prefs');
      return saved
        ? JSON.parse(saved)
        : {
            orderAlerts: true,
            whatsappUpdates: true,
            promosAndHealth: false,
          };
    } catch {
      return { orderAlerts: true, whatsappUpdates: true, promosAndHealth: false };
    }
  });

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('medix_notif_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  // Profile Edit State
  const [editName, setEditName] = useState(displayName);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Privacy Action State
  const [cacheCleared, setCacheCleared] = useState(false);

  // FAQ Accordion State inside Support
  const [openFaq, setOpenFaq] = useState(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setUser({ name: editName.trim() });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveSheet(null);
    }, 900);
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('medix_recent_searches');
    } catch {}
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  // Close sheet with Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveSheet(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 pb-32">
      {/* Top Header */}
      <div
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        }}
        className="max-w-md mx-auto px-4 pt-3 pb-2"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('Account')}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {t('Personal settings & preferences')}
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6 mt-2">
        {/* Apple ID Style Profile Card */}
        <div className="bg-white rounded-2xl p-4 border border-black/[0.04] shadow-xs">
          {phone ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-6 h-6 text-white" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 leading-snug truncate">
                    {displayName || t('Medix Customer')}
                  </h2>
                  <p className="text-xs text-gray-500 font-mono tracking-tight mt-0.5">
                    +91 {phone}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Customer
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditName(displayName);
                  setActiveSheet('profile');
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/80 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Edit2 className="w-3 h-3 text-gray-500" />
                <span>Edit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 leading-snug">
                    {t('Sign in to Medix')}
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                    Sync orders, addresses & prescriptions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login?redirect=/account')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-gray-900 hover:bg-black active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                {t('Sign In')}
              </button>
            </div>
          )}
        </div>

        {/* Group 1: Orders & Delivery */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
            {t('Orders & Delivery')}
          </div>
          <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs divide-y divide-black/[0.05] overflow-hidden">
            {/* My Orders Row */}
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <PackageCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {t('My Orders & Prescriptions')}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {t('Track active deliveries & past receipts')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {/* Saved Delivery Address Row */}
            <button
              type="button"
              onClick={() => navigate('/address')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {t('Saved Delivery Address')}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {fullAddress || address || t('Add your village, PO & PIN code')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[11px] text-gray-400">
                  {address ? 'Edit' : 'Add'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Group 2: Preferences */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
            {t('Preferences')}
          </div>
          <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs divide-y divide-black/[0.05] overflow-hidden">
            {/* App Language Row */}
            <button
              type="button"
              onClick={() => setActiveSheet('language')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#5856D6] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Globe className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {t('App Language')}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    English / বাংলা
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                  {lang === 'bn' ? 'বাংলা' : 'English'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Notifications & Alerts Row */}
            <button
              type="button"
              onClick={() => setActiveSheet('notifications')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FF3B30] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {t('Notifications & Alerts')}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {notifPrefs.orderAlerts ? 'Order alerts on' : 'Alerts muted'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[11px] text-emerald-600 font-medium">
                  {notifPrefs.orderAlerts ? 'Active' : 'Off'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Group 3: Help & Privacy */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
            {t('Support & Trust')}
          </div>
          <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs divide-y divide-black/[0.05] overflow-hidden">
            {/* Help & Support Row */}
            <button
              type="button"
              onClick={() => setActiveSheet('support')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FF9500] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {t('Help & Customer Support')}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Hotline, WhatsApp & FAQs
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {/* Privacy & Security Row */}
            <button
              type="button"
              onClick={() => setActiveSheet('privacy')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Shield className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {t('Privacy & Data Security')}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Data storage, prescriptions & cache
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* Group 4: Sign Out (Only when logged in) */}
        {phone ? (
          <div>
            <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveSheet('logout')}
                className="w-full py-3.5 px-4 flex items-center justify-center gap-2 text-red-600 font-semibold text-[13px] hover:bg-red-50/50 active:bg-red-100/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>{t('Sign out')}</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Footer info */}
        <div className="text-center pt-2 pb-4 space-y-1">
          <p className="text-[11px] font-medium text-gray-400">
            Medix Pharmacy Delivery • v2.4.1
          </p>
          <p className="text-[10px] text-gray-400">
            Licensed Pharmacy Partner Network • Safe & Verified
          </p>
        </div>
      </div>

      {/* =====================================================================
          INTERACTIVE APPLE SHEETS / MODALS
      ====================================================================== */}
      <AnimatePresence>
        {activeSheet && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Scrim Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveSheet(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Sheet Canvas */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-[#F2F2F7] rounded-t-[28px] sm:rounded-2xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl border-t sm:border border-black/[0.06] z-10"
            >
              {/* Grabber indicator */}
              <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

              {/* SHEET 1: LANGUAGE PICKER */}
              {activeSheet === 'language' && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {t('Select Language')}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Choose your preferred app interface language
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="w-7 h-7 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-300 active:scale-90 transition-transform cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs divide-y divide-black/[0.05] overflow-hidden">
                    {LANGUAGES.map((l) => {
                      const isSelected = lang === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setLang(l.code);
                            setTimeout(() => setActiveSheet(null), 250);
                          }}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer text-left"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {l.label}
                            </p>
                            <p className="text-xs text-gray-400">
                              {l.code === 'bn' ? 'বাংলা সংস্করণ' : 'English Edition'}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SHEET 2: NOTIFICATIONS PREFERENCES */}
              {activeSheet === 'notifications' && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {t('Notifications')}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Control how Medix contacts you about orders
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="w-7 h-7 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-300 active:scale-90 transition-transform cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs divide-y divide-black/[0.05] overflow-hidden">
                    {/* Switch 1: Order Alerts */}
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-gray-900">
                          Order Status Alerts
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Real-time dispatch, pharmacist packing & delivery alerts
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotif('orderAlerts')}
                        aria-pressed={notifPrefs.orderAlerts}
                        className={`w-12 h-7 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                          notifPrefs.orderAlerts ? 'bg-[#34C759]' : 'bg-[#E9E9EB]'
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                            notifPrefs.orderAlerts ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Switch 2: WhatsApp Updates */}
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-gray-900">
                          WhatsApp Live Tracking
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Receive live receipt and rider contact on WhatsApp
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotif('whatsappUpdates')}
                        aria-pressed={notifPrefs.whatsappUpdates}
                        className={`w-12 h-7 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                          notifPrefs.whatsappUpdates ? 'bg-[#34C759]' : 'bg-[#E9E9EB]'
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                            notifPrefs.whatsappUpdates ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Switch 3: Promos */}
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="pr-3">
                        <p className="text-xs font-semibold text-gray-900">
                          Health Tips & Discounts
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Notices about tiered medicine discounts and wellness
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotif('promosAndHealth')}
                        aria-pressed={notifPrefs.promosAndHealth}
                        className={`w-12 h-7 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                          notifPrefs.promosAndHealth ? 'bg-[#34C759]' : 'bg-[#E9E9EB]'
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform ${
                            notifPrefs.promosAndHealth ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 px-1 text-center">
                    Settings update immediately and sync on this device.
                  </p>
                </div>
              )}

              {/* SHEET 3: HELP & CUSTOMER SUPPORT */}
              {activeSheet === 'support' && (
                <div className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {t('Help & Support')}
                      </h3>
                      <p className="text-xs text-gray-500">
                        We are here to assist with your medicines & orders
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="w-7 h-7 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-300 active:scale-90 transition-transform cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Direct Contact Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href="tel:+918918237582"
                      className="p-3.5 bg-white rounded-2xl border border-black/[0.04] shadow-xs flex flex-col items-center justify-center text-center gap-1.5 hover:bg-emerald-50/50 active:scale-98 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">Call Support</span>
                      <span className="text-[10px] text-gray-500 font-mono">+91 8918237582</span>
                    </a>

                    <a
                      href="https://wa.me/918918237582?text=Hello%20Medix%20Support%2C%20I%20have%20a%20question%20about%20my%20delivery"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-white rounded-2xl border border-black/[0.04] shadow-xs flex flex-col items-center justify-center text-center gap-1.5 hover:bg-emerald-50/50 active:scale-98 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">WhatsApp Chat</span>
                      <span className="text-[10px] text-gray-500">Instant Reply</span>
                    </a>
                  </div>

                  {/* Frequently Asked Questions */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2">
                      Frequently Asked Questions
                    </p>
                    <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs divide-y divide-black/[0.05] overflow-hidden text-left">
                      {[
                        {
                          q: 'How fast is medicine delivery?',
                          a: 'Most orders are verified by the assigned local partner pharmacy and delivered within 45 to 60 minutes in active zones.',
                        },
                        {
                          q: 'What are the current discount rules?',
                          a: 'Orders from ₹500 to ₹1,500 receive 12% off. Orders above ₹1,500 receive 17% off automatically in the bill details.',
                        },
                        {
                          q: 'Can I return medicines if damaged or incorrect?',
                          a: 'Yes, if any item is sealed incorrectly or damaged during delivery, you can verify and refuse receipt with the rider for a full refund.',
                        },
                        {
                          q: 'How do prescription medicines work?',
                          a: 'Schedule H medicines are checked by our certified partner pharmacists before packing. Ensure patient details match.',
                        },
                      ].map((item, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                          <div key={item.q} className="overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setOpenFaq(isOpen ? null : idx)}
                              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <span className="text-xs font-semibold text-gray-900 pr-2">
                                {item.q}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180 text-emerald-600' : ''
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="px-3.5 pb-3.5 text-[11px] text-gray-600 leading-relaxed bg-gray-50/60">
                                {item.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SHEET 4: PRIVACY & DATA SECURITY */}
              {activeSheet === 'privacy' && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {t('Privacy & Security')}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Your health information is confidential
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="w-7 h-7 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-300 active:scale-90 transition-transform cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          End-to-End Pharmacy Privacy
                        </p>
                        <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                          Order details and medicines are shared only with the designated licensed partner pharmacy packing your order.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          No Third-Party Advertising
                        </p>
                        <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                          We never sell customer phone numbers or order history to advertisers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cache & Local Search History Reset */}
                  <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        Clear Search & Local Cache
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Clears temporary medicine searches
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearCache}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${
                        cacheCleared
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cacheCleared ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Cleared!</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                          <span>Clear</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SHEET 5: EDIT PROFILE */}
              {activeSheet === 'profile' && (
                <form onSubmit={handleSaveProfile} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Edit Profile
                      </h3>
                      <p className="text-xs text-gray-500">
                        Update your customer display name
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="w-7 h-7 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-300 active:scale-90 transition-transform cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-black/[0.04] shadow-xs p-3.5 space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`+91 ${phone}`}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed font-mono"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Mobile number is tied to your verified login
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!editName.trim()}
                    className={`w-full py-3 rounded-full text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                      saveSuccess
                        ? 'bg-emerald-600'
                        : 'bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Saved Successfully</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </form>
              )}

              {/* SHEET 6: LOGOUT CONFIRMATION */}
              {activeSheet === 'logout' && (
                <div className="p-4 space-y-4">
                  <div className="text-center pt-2 pb-1 space-y-1">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
                      <LogOut className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                      Sign Out of Medix?
                    </h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      You will need to enter your phone number to access your saved delivery addresses and past orders again.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setActiveSheet(null);
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      Sign Out
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-semibold text-xs active:scale-98 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
