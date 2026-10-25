import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Prescription,
  ClockCounterClockwise,
  Translate,
  Bell,
  Wallet,
  PhoneCall,
  WhatsappLogo,
  Question,
  WarningCircle,
  FileText,
  ShieldCheck,
  Certificate,
  CaretRight,
  Copy,
  Check,
  X,
  PencilSimple,
  SignOut,
  Trash,
  Plus,
} from '@phosphor-icons/react';
import { useUserStore } from '../store/userStore';
import api from '../lib/api';
import { useT } from '../lib/i18n';
import {
  PHARMACY_LICENCE_NO,
  MOCK_SAVED_ADDRESSES,
  MOCK_PRESCRIPTIONS,
  MOCK_FAQS,
} from '../lib/medixMockData';

/**
 * SettingsGroup — Grouped list card labeled in small uppercase.
 */
export function SettingsGroup({ title, children }) {
  return (
    <section className="space-y-2">
      {title && (
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#5E6B63] px-1">
          {title}
        </h2>
      )}
      <div className="bg-white rounded-[16px] overflow-hidden">{children}</div>
    </section>
  );
}

/**
 * SettingsRow — Phosphor Bold icon on the left (NO tinted square background),
 * label, optional muted value on the right, chevron, 56px min row height, inset divider.
 */
export function SettingsRow({
  icon: Icon,
  label,
  value,
  badge,
  onClick,
  rightElement,
  isLast = false,
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <div className="relative">
      <Wrapper
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={`w-full min-h-[56px] px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors ${
          onClick ? 'active:bg-[#F7F4EC]/70 cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {Icon && (
            <Icon
              weight="bold"
              className="w-5 h-5 text-[#003820] shrink-0"
            />
          )}
          <span className="text-[15px] font-semibold text-[#0E1A14] truncate">
            {label}
          </span>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[999px] text-[14px] font-bold bg-[#E3EFE8] text-[#003820] shrink-0">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {value && (
            <span className="text-[14px] font-medium text-[#5E6B63] max-w-[160px] truncate">
              {value}
            </span>
          )}
          {rightElement || (
            <CaretRight weight="bold" className="w-4 h-4 text-[#5E6B63]" />
          )}
        </div>
      </Wrapper>

      {/* Inset divider */}
      {!isLast && (
        <div className="ml-12 mr-4 border-b border-[#0E1A14]/8" />
      )}
    </div>
  );
}

export default function Account() {
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const { name: storedName, phone: storedPhone, token, setUser, setAuth, logout } = useUserStore();
  const user = storedName || storedPhone ? { name: storedName, phone: storedPhone } : null;

  // Display user (real logged-in user or realistic preview profile)
  const [localProfile, setLocalProfile] = useState({
    name: storedName || 'Tarekul Islam',
    phone: storedPhone ? `+91 ${storedPhone}` : '+91 98304 21890',
    address: 'Flat 4B, Shantiniketan Apt, Salt Lake Sector II',
  });

  const displayName = storedName || localProfile.name;
  const displayPhone = storedPhone ? `+91 ${storedPhone}` : localProfile.phone;
  const initialLetter = (displayName || 'M').trim().charAt(0).toUpperCase();

  // Dismissible lime referral card state
  const [referralDismissed, setReferralDismissed] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  // Language state (EN / বাংলা / हिन्दी)
  const [uiLangCode, setUiLangCode] = useState(lang === 'bn' ? 'bn' : 'en');

  // Notification toggles
  const [notifSettings, setNotifSettings] = useState({
    orderUpdates: true,
    offers: false,
    refillReminders: true,
  });

  // Saved addresses & prescriptions state
  const [addresses, setAddresses] = useState(MOCK_SAVED_ADDRESSES);
  const [prescriptions] = useState(MOCK_PRESCRIPTIONS);

  // Active sheet/modal state:
  // 'EDIT_PROFILE' | 'AUTH' | 'ADDRESSES' | 'PRESCRIPTIONS' | 'NOTIFICATIONS' | 'PAYMENT' | 'FAQS' | 'REPORT' | 'TERMS' | 'PRIVACY' | 'LICENCE' | 'DELETE_ACCOUNT' | null
  const [activeSheet, setActiveSheet] = useState(null);

  // Edit profile form
  const [editName, setEditName] = useState(displayName);
  const [editPhone, setEditPhone] = useState(displayPhone);
  const [savingProfile, setSavingProfile] = useState(false);

  // Auth form (for signing in / registering with live backend)
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    phone: '',
    password: '',
    address: '',
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Report problem state
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Delete account typed confirmation state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleCopyReferral = () => {
    const referralUrl = 'https://medix.app/r/TAREK50';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(referralUrl).catch(() => {});
    }
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2500);
  };

  const handleLanguageSelect = (code) => {
    setUiLangCode(code);
    if (code === 'bn') {
      setLang('bn');
    } else {
      setLang('en');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (token) {
        const res = await api.put('/auth/profile', {
          name: editName.trim(),
          address: localProfile.address,
        });
        setAuth({ user: res.data, token });
      } else {
        setUser({
          name: editName.trim() || localProfile.name,
          phone: editPhone.trim() || localProfile.phone,
        });
      }
      setLocalProfile((prev) => ({
        ...prev,
        name: editName.trim() || prev.name,
        phone: editPhone.trim() || prev.phone,
      }));
      setActiveSheet(null);
    } catch {
      setUser({
        name: editName.trim() || localProfile.name,
        phone: editPhone.trim() || localProfile.phone,
      });
      setLocalProfile((prev) => ({
        ...prev,
        name: editName.trim() || prev.name,
        phone: editPhone.trim() || prev.phone,
      }));
      setActiveSheet(null);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        authMode === 'login'
          ? { phone: authForm.phone, password: authForm.password }
          : { ...authForm, role: 'CUSTOMER' };
      const res = await api.post(endpoint, payload);
      setAuth({ user: res.data.user, token: res.data.token });
      setActiveSheet(null);
    } catch (err) {
      setAuthError(
        err.response?.data?.message ||
          t('Could not sign in. Please check your credentials.')
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const verifiedRxCount = prescriptions.filter((rx) => rx.verified).length;
  const activeNotifCount = Object.values(notifSettings).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#0E1A14] pb-8">
      {/* Deep Green (#003820) Header Block */}
      <header className="bg-[#003820] text-white px-4 pt-6 pb-6 rounded-b-[24px]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h1 className="font-display font-extrabold text-[28px] leading-[1.1] tracking-[-0.02em] text-white">
              {t('account.')}
            </h1>

            {!user && (
              <button
                type="button"
                onClick={() => setActiveSheet('AUTH')}
                className="min-h-[38px] px-3.5 rounded-[999px] bg-white/12 text-[#C6F26B] text-[14px] font-bold active:scale-95 transition-transform"
              >
                {t('Sign in')}
              </button>
            )}
          </div>

          {/* Large Initial Avatar (lime circle, deep green letter), Name, Phone, and small "Edit" pill */}
          <div className="flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-16 h-16 rounded-full bg-[#C6F26B] text-[#003820] font-display font-extrabold text-[26px] flex items-center justify-center shrink-0">
                {initialLetter}
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-[20px] text-white leading-tight truncate">
                  {displayName}
                </h2>
                <p className="text-[15px] text-white/80 tabular-nums mt-0.5 truncate">
                  {displayPhone}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditName(displayName);
                setEditPhone(displayPhone);
                setActiveSheet('EDIT_PROFILE');
              }}
              className="min-h-[44px] px-4 rounded-[999px] bg-white/12 text-white text-[14px] font-bold inline-flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
            >
              <PencilSimple weight="bold" className="w-4 h-4 text-[#C6F26B]" />
              <span>{t('Edit')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* One Lime Highlight Card: "Refer a friend, get ₹50 off" near the top with copy-link button, dismissible */}
        {!referralDismissed && (
          <section className="bg-[#C6F26B] text-[#003820] rounded-[16px] p-4 relative">
            <button
              type="button"
              onClick={() => setReferralDismissed(true)}
              aria-label="Dismiss referral card"
              className="absolute top-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center text-[#003820]/70 hover:text-[#003820]"
            >
              <X weight="bold" className="w-4 h-4" />
            </button>

            <div className="pr-8">
              <p className="font-display font-extrabold text-[18px] leading-snug text-[#003820]">
                {t('Refer a friend, get ₹50 off')}
              </p>
              <p className="text-[14px] text-[#003820]/85 mt-0.5 mb-3">
                {t('Your friend gets ₹50 off their first 20-minute medicine delivery too.')}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2.5 bg-white/75 rounded-[999px] pl-4 pr-1.5 py-1.5">
              <span className="text-[14px] font-bold text-[#003820] truncate tabular-nums">
                medix.app/r/TAREK50
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="min-h-[40px] px-4 rounded-[999px] bg-[#003820] text-white text-[14px] font-bold inline-flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
              >
                {referralCopied ? (
                  <>
                    <Check weight="bold" className="w-4 h-4 text-[#C6F26B]" />
                    <span>{t('Copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy weight="bold" className="w-4 h-4 text-[#C6F26B]" />
                    <span>{t('Copy link')}</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* 1. MY STUFF */}
        <SettingsGroup title={t('MY STUFF')}>
          <SettingsRow
            icon={MapPin}
            label={t('Saved addresses')}
            badge={defaultAddr ? `${defaultAddr.tag} · Default` : undefined}
            value={`${addresses.length}`}
            onClick={() => setActiveSheet('ADDRESSES')}
          />
          <SettingsRow
            icon={Prescription}
            label={t('Prescriptions')}
            value={`${verifiedRxCount} ${t('verified')}`}
            onClick={() => setActiveSheet('PRESCRIPTIONS')}
          />
          <SettingsRow
            icon={ClockCounterClockwise}
            label={t('Order history')}
            onClick={() => navigate('/orders')}
            isLast
          />
        </SettingsGroup>

        {/* 2. PREFERENCES */}
        <SettingsGroup title={t('PREFERENCES')}>
          <SettingsRow
            icon={Translate}
            label={t('Language')}
            rightElement={
              <div className="inline-flex items-center bg-[#F7F4EC] p-1 rounded-[999px]">
                {[
                  { code: 'en', label: 'EN' },
                  { code: 'bn', label: 'বাংলা' },
                  { code: 'hi', label: 'हिन्दी' },
                ].map((opt) => {
                  const active = uiLangCode === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLanguageSelect(opt.code);
                      }}
                      className={`min-h-[36px] px-3 rounded-[999px] text-[14px] font-bold transition-all ${
                        active
                          ? 'bg-[#003820] text-white'
                          : 'text-[#5E6B63] hover:text-[#0E1A14]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            }
          />
          <SettingsRow
            icon={Bell}
            label={t('Notifications')}
            value={`${activeNotifCount}/3 ${t('on')}`}
            onClick={() => setActiveSheet('NOTIFICATIONS')}
          />
          <SettingsRow
            icon={Wallet}
            label={t('Default payment')}
            value="COD"
            onClick={() => setActiveSheet('PAYMENT')}
            isLast
          />
        </SettingsGroup>

        {/* 3. HELP */}
        <SettingsGroup title={t('HELP')}>
          <SettingsRow
            icon={PhoneCall}
            label={t('Order on call')}
            value="1800-123-456"
            onClick={() => {
              window.location.href = 'tel:+911800123456';
            }}
          />
          <SettingsRow
            icon={WhatsappLogo}
            label={t('WhatsApp support')}
            value={t('24×7 chat')}
            onClick={() => {
              window.open(
                'https://wa.me/919876543210?text=Hi%20Medix%20Support',
                '_blank',
                'noopener,noreferrer'
              );
            }}
          />
          <SettingsRow
            icon={Question}
            label={t('FAQs')}
            onClick={() => setActiveSheet('FAQS')}
          />
          <SettingsRow
            icon={WarningCircle}
            label={t('Report a problem')}
            onClick={() => {
              setReportSent(false);
              setReportText('');
              setActiveSheet('REPORT');
            }}
            isLast
          />
        </SettingsGroup>

        {/* 4. LEGAL */}
        <SettingsGroup title={t('LEGAL')}>
          <SettingsRow
            icon={FileText}
            label={t('Terms')}
            onClick={() => setActiveSheet('TERMS')}
          />
          <SettingsRow
            icon={ShieldCheck}
            label={t('Privacy')}
            onClick={() => setActiveSheet('PRIVACY')}
          />
          <SettingsRow
            icon={Certificate}
            label={t('Licence info')}
            value={PHARMACY_LICENCE_NO}
            onClick={() => setActiveSheet('LICENCE')}
            isLast
          />
        </SettingsGroup>

        {/* 5. Footer Actions: Log out (quiet text button), Delete account (small, red, behind confirm dialog with typed confirmation), app version */}
        <footer className="pt-2 pb-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => {
                if (user) logout();
              }}
              className="min-h-[44px] px-4 rounded-[999px] inline-flex items-center gap-2 text-[15px] font-bold text-[#5E6B63] hover:text-[#0E1A14] active:scale-95 transition-transform"
            >
              <SignOut weight="bold" className="w-4 h-4" />
              <span>{t('Log out')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText('');
                setActiveSheet('DELETE_ACCOUNT');
              }}
              className="min-h-[44px] px-4 rounded-[999px] inline-flex items-center gap-1.5 text-[14px] font-bold text-[#D64538] active:scale-95 transition-transform"
            >
              <Trash weight="bold" className="w-4 h-4" />
              <span>{t('Delete account')}</span>
            </button>
          </div>

          <p className="text-[14px] text-[#5E6B63] tabular-nums">
            medix. v2.4.0 · DL {PHARMACY_LICENCE_NO}
          </p>
        </footer>
      </main>

      {/* ==================== BOTTOM SHEETS & DIALOGS ==================== */}
      {activeSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0E1A14]/55 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setActiveSheet(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-[24px] sm:rounded-[24px] max-h-[86vh] overflow-y-auto p-5 shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* EDIT PROFILE SHEET */}
            {activeSheet === 'EDIT_PROFILE' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {t('edit profile.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#5E6B63] mb-1.5">
                    {t('Full name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full min-h-[48px] px-4 rounded-[16px] bg-[#F7F4EC] text-[16px] font-semibold text-[#0E1A14] focus:outline-none focus:ring-2 focus:ring-[#003820]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#5E6B63] mb-1.5">
                    {t('Phone number')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full min-h-[48px] px-4 rounded-[16px] bg-[#F7F4EC] text-[16px] font-semibold text-[#0E1A14] focus:outline-none focus:ring-2 focus:ring-[#003820]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full min-h-[48px] rounded-[999px] bg-[#003820] text-white text-[15px] font-bold"
                >
                  {savingProfile ? t('Saving...') : t('Save changes')}
                </button>
              </form>
            )}

            {/* SAVED ADDRESSES SHEET */}
            {activeSheet === 'ADDRESSES' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {t('saved addresses.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() =>
                        setAddresses((prev) =>
                          prev.map((a) => ({
                            ...a,
                            isDefault: a.id === addr.id,
                          }))
                        )
                      }
                      className={`p-4 rounded-[16px] cursor-pointer transition-colors ${
                        addr.isDefault ? 'bg-[#E3EFE8]' : 'bg-[#F7F4EC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-[999px] bg-[#003820] text-white text-[14px] font-bold">
                            {addr.tag}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-[999px] bg-[#C6F26B] text-[#003820] text-[14px] font-extrabold">
                              {t('Default')}
                            </span>
                          )}
                        </div>
                        {addr.isDefault && (
                          <Check
                            weight="bold"
                            className="w-5 h-5 text-[#003820]"
                          />
                        )}
                      </div>
                      <p className="text-[15px] font-semibold text-[#0E1A14] mt-1">
                        {addr.addressLine}
                      </p>
                      <p className="text-[14px] text-[#5E6B63]">
                        {addr.landmark}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextId = `addr_${Date.now()}`;
                    setAddresses((prev) => [
                      ...prev,
                      {
                        id: nextId,
                        tag: 'Home',
                        isDefault: false,
                        addressLine: '12B Park Street, Mullick Bazar, Kolkata',
                        landmark: 'Opposite Allen Park',
                      },
                    ]);
                  }}
                  className="w-full min-h-[48px] rounded-[999px] bg-[#003820] text-white text-[15px] font-bold inline-flex items-center justify-center gap-2"
                >
                  <Plus weight="bold" className="w-4 h-4 text-[#C6F26B]" />
                  <span>{t('Add new address')}</span>
                </button>
              </div>
            )}

            {/* PRESCRIPTIONS SHEET */}
            {activeSheet === 'PRESCRIPTIONS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {t('prescriptions.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-4 rounded-[16px] bg-[#F7F4EC] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-bold text-[#0E1A14]">
                            {rx.doctorName}
                          </p>
                          <p className="text-[14px] text-[#5E6B63]">
                            {rx.clinic} · {rx.uploadedAt}
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-[999px] text-[14px] font-bold ${
                            rx.verified
                              ? 'bg-[#E3EFE8] text-[#003820]'
                              : 'bg-[#D64538]/10 text-[#D64538]'
                          }`}
                        >
                          {rx.verified ? t('Verified Rx') : t('Expired')}
                        </span>
                      </div>
                      <p className="text-[14px] font-medium text-[#0E1A14]">
                        {rx.medicines.join(', ')}
                      </p>
                      <p className="text-[14px] text-[#5E6B63]">
                        {rx.expiryLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TOGGLES SHEET */}
            {activeSheet === 'NOTIFICATIONS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {t('notifications.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      key: 'orderUpdates',
                      label: t('Order updates'),
                      desc: t('Live rider tracking, OTP, and pharmacy status'),
                    },
                    {
                      key: 'refillReminders',
                      label: t('Refill reminders'),
                      desc: t('Timely nudge before your monthly strip runs out'),
                    },
                    {
                      key: 'offers',
                      label: t('Offers & discounts'),
                      desc: t('Occasional savings on household essentials'),
                    },
                  ].map((item) => {
                    const enabled = notifSettings[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setNotifSettings((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                        className="w-full min-h-[64px] p-4 rounded-[16px] bg-[#F7F4EC] flex items-center justify-between gap-3 text-left"
                      >
                        <div>
                          <p className="text-[15px] font-bold text-[#0E1A14]">
                            {item.label}
                          </p>
                          <p className="text-[14px] text-[#5E6B63]">
                            {item.desc}
                          </p>
                        </div>
                        <div
                          className={`w-12 h-7 rounded-[999px] p-1 transition-colors flex items-center shrink-0 ${
                            enabled ? 'bg-[#003820] justify-end' : 'bg-[#5E6B63]/30 justify-start'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full ${
                              enabled ? 'bg-[#C6F26B]' : 'bg-white'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DEFAULT PAYMENT SHEET */}
            {activeSheet === 'PAYMENT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {t('default payment.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-[16px] bg-[#E3EFE8] flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-bold text-[#003820]">
                      {t('Cash on Delivery (COD)')}
                    </p>
                    <p className="text-[14px] text-[#5E6B63]">
                      {t('Pay by cash or UPI QR to the rider at your doorstep.')}
                    </p>
                  </div>
                  <Check weight="bold" className="w-5 h-5 text-[#003820] shrink-0" />
                </div>
              </div>
            )}

            {/* FAQs SHEET */}
            {activeSheet === 'FAQS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {t('frequently asked.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {MOCK_FAQS.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[16px] bg-[#F7F4EC] space-y-1"
                    >
                      <p className="text-[15px] font-bold text-[#0E1A14]">
                        {faq.q}
                      </p>
                      <p className="text-[14px] text-[#5E6B63] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REPORT A PROBLEM SHEET */}
            {activeSheet === 'REPORT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {t('report a problem.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                {reportSent ? (
                  <div className="p-5 rounded-[16px] bg-[#E3EFE8] text-[#003820] text-center space-y-2">
                    <p className="font-display font-bold text-[18px]">
                      {t('Thank you for letting us know.')}
                    </p>
                    <p className="text-[14px]">
                      {t('Our pharmacist team will reach out within 15 minutes.')}
                    </p>
                  </div>
                ) : (
                  <>
                    <textarea
                      rows={4}
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder={t('Tell us what went wrong with your order or app...')}
                      className="w-full p-4 rounded-[16px] bg-[#F7F4EC] text-[16px] text-[#0E1A14] focus:outline-none focus:ring-2 focus:ring-[#003820]"
                    />
                    <button
                      type="button"
                      onClick={() => setReportSent(true)}
                      className="w-full min-h-[48px] rounded-[999px] bg-[#003820] text-white text-[15px] font-bold"
                    >
                      {t('Submit report')}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* TERMS / PRIVACY / LICENCE SHEETS */}
            {(activeSheet === 'TERMS' ||
              activeSheet === 'PRIVACY' ||
              activeSheet === 'LICENCE') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {activeSheet === 'TERMS'
                      ? t('terms of service.')
                      : activeSheet === 'PRIVACY'
                      ? t('privacy policy.')
                      : t('pharmacy licence.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-[16px] bg-[#F7F4EC] space-y-2.5 text-[14px] text-[#0E1A14] leading-relaxed">
                  {activeSheet === 'LICENCE' ? (
                    <>
                      <p className="font-bold text-[16px] text-[#003820]">
                        Drug Licence No: {PHARMACY_LICENCE_NO}
                      </p>
                      <p className="text-[#5E6B63]">
                        All medicines on Medix are dispensed exclusively by licensed retail pharmacies under the supervision of registered pharmacists in compliance with the Drugs and Cosmetics Act, 1940.
                      </p>
                      <p className="text-[#5E6B63]">
                        Schedule H & H1 prescription medicines require a valid doctor prescription uploaded and verified before dispatch.
                      </p>
                    </>
                  ) : activeSheet === 'TERMS' ? (
                    <p className="text-[#5E6B63]">
                      Medix connects you with licensed neighbourhood pharmacies for 20-minute doorstep delivery. Orders may be cancelled free of charge before they are packed by the partner pharmacy.
                    </p>
                  ) : (
                    <p className="text-[#5E6B63]">
                      Your medical history, uploaded prescriptions, and phone number are encrypted and shared strictly with the dispensing pharmacist fulfilling your order. We never sell health data to third parties.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* DELETE ACCOUNT CONFIRM DIALOG (WITH TYPED CONFIRMATION) */}
            {activeSheet === 'DELETE_ACCOUNT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#D64538]">
                    {t('delete account.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[14px] text-[#5E6B63] leading-relaxed">
                  {t(
                    'This permanently deletes your saved addresses, uploaded prescriptions, and order history. Type DELETE below to confirm.'
                  )}
                </p>

                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full min-h-[48px] px-4 rounded-[16px] bg-[#F7F4EC] text-[16px] font-bold text-[#0E1A14] focus:outline-none focus:ring-2 focus:ring-[#D64538]"
                />

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="flex-1 min-h-[48px] rounded-[999px] bg-[#F7F4EC] text-[#0E1A14] text-[14px] font-bold"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                    onClick={() => {
                      logout();
                      setActiveSheet(null);
                      navigate('/search');
                    }}
                    className="flex-1 min-h-[48px] rounded-[999px] bg-[#D64538] text-white text-[14px] font-bold disabled:opacity-40"
                  >
                    {t('Delete forever')}
                  </button>
                </div>
              </div>
            )}

            {/* AUTH SIGN IN / REGISTER SHEET */}
            {activeSheet === 'AUTH' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-[22px] text-[#0E1A14]">
                    {authMode === 'login' ? t('sign in.') : t('create account.')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-11 h-11 rounded-full bg-[#F7F4EC] flex items-center justify-center"
                  >
                    <X weight="bold" className="w-5 h-5" />
                  </button>
                </div>

                {authError && (
                  <p className="p-3 rounded-[12px] bg-[#D64538]/10 text-[#D64538] text-[14px] font-semibold">
                    {authError}
                  </p>
                )}

                {authMode === 'register' && (
                  <input
                    type="text"
                    required
                    placeholder={t('Full name')}
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, name: e.target.value })
                    }
                    className="w-full min-h-[48px] px-4 rounded-[16px] bg-[#F7F4EC] text-[16px] text-[#0E1A14]"
                  />
                )}

                <input
                  type="tel"
                  required
                  placeholder={t('Phone number')}
                  value={authForm.phone}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, phone: e.target.value })
                  }
                  className="w-full min-h-[48px] px-4 rounded-[16px] bg-[#F7F4EC] text-[16px] text-[#0E1A14]"
                />

                <input
                  type="password"
                  required
                  placeholder={t('Password')}
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  className="w-full min-h-[48px] px-4 rounded-[16px] bg-[#F7F4EC] text-[16px] text-[#0E1A14]"
                />

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[48px] rounded-[999px] bg-[#003820] text-white text-[15px] font-bold"
                >
                  {authLoading
                    ? t('Please wait...')
                    : authMode === 'login'
                    ? t('Sign in')
                    : t('Create account')}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAuthMode(authMode === 'login' ? 'register' : 'login')
                  }
                  className="w-full min-h-[44px] text-[14px] font-bold text-[#003820]"
                >
                  {authMode === 'login'
                    ? t('New to Medix? Create an account')
                    : t('Already have an account? Sign in')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
