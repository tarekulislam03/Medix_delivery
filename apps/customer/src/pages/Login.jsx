import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  User as UserIcon,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Pencil,
  RotateCw,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';
import api from '../lib/api';
import { useT } from '../lib/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/cart';

  // Flow step: 'phone' -> 'name' (for new user) -> 'otp'
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const phoneInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const otpInputRef = useRef(null);

  const currentUserPhone = useUserStore((state) => state.phone);
  const setAuth = useUserStore((state) => state.setAuth);
  const loadCartFromDb = useCartStore((state) => state.loadCartFromDb);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (currentUserPhone) {
      navigate(redirectPath, { replace: true });
    }
  }, [currentUserPhone, navigate, redirectPath]);

  // Resend countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setError('');
    setInfoMessage('');
  };

  const handleOtpChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    setError('');

    // Auto-verify when 4 or 6 digits entered
    if (cleaned.length === 4 || cleaned.length === 6) {
      verifyOtpCode(cleaned);
    }
  };

  const handleSuccess = (authData) => {
    setAuth({
      token: authData.token || authData.accessToken,
      user: authData.user,
    });

    if (authData?.user?.phone) {
      loadCartFromDb(authData.user.phone);
    }

    navigate(redirectPath, { replace: true });
  };

  // STEP 1: Check if user exists & send OTP if existing
  const handleCheckUser = async (e) => {
    e?.preventDefault?.();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setError(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await api.post('/auth/check-user', {
        phone: cleanPhone,
        sendOtpIfExisting: true,
      });

      if (res?.data?.success) {
        const { exists, name: uName, otpSent, cooldownSeconds = 30 } = res.data.data;

        if (exists) {
          // Existing user -> Move straight to OTP verification
          setIsExistingUser(true);
          setExistingUserName(uName || '');
          setStep('otp');
          setOtp('');
          setResendTimer(cooldownSeconds > 0 ? cooldownSeconds : 30);
          setInfoMessage(
            uName
              ? t(`Welcome back, {name}!`, { name: uName })
              : t('Welcome back!')
          );
          setTimeout(() => {
            otpInputRef.current?.focus?.();
          }, 200);
        } else {
          // New user -> Stays on this page, prompts for Full Name
          setIsExistingUser(false);
          setStep('name');
          setInfoMessage(t('New to Medix? Please enter your full name to create an account.'));
          setTimeout(() => {
            nameInputRef.current?.focus?.();
          }, 200);
        }
        return;
      }

      throw new Error(res?.data?.message || t('Failed to check mobile number.'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('Failed to check mobile number.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 (For New User): Submit Full Name & Send OTP
  const handleSendOtpForNewUser = async (e) => {
    e?.preventDefault?.();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setError(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(t('Please enter your full name.'));
      nameInputRef.current?.focus?.();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/send-otp', { phone: cleanPhone });
      if (res?.data?.success) {
        setStep('otp');
        setOtp('');
        setResendTimer(30);
        setInfoMessage(t('OTP sent to your mobile number via SMS.'));
        setTimeout(() => {
          otpInputRef.current?.focus?.();
        }, 200);
        return;
      }
      throw new Error(res?.data?.message || t('Failed to send OTP.'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('Failed to send OTP.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Verify OTP
  const verifyOtpCode = async (codeToVerify) => {
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
    const code = String(codeToVerify || otp || '').trim();

    if (cleanPhone.length !== 10) {
      setError(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    if (code.length < 4 || code.length > 6) {
      setError(t('Please enter a valid OTP.'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-otp', {
        phone: cleanPhone,
        otp: code,
        name: fullName.trim() || undefined,
      });

      if (res?.data?.success) {
        handleSuccess(res.data.data || res.data);
        return;
      }
      throw new Error(res?.data?.message || t('OTP verification failed.'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('Invalid OTP.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e?.preventDefault?.();
    verifyOtpCode(otp);
  };

  // Resend OTP action
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/send-otp', { phone: cleanPhone });
      if (res?.data?.success) {
        setResendTimer(30);
        setInfoMessage(t('A new OTP has been sent to your mobile number.'));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('Failed to resend OTP.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setInfoMessage('');
    setTimeout(() => {
      phoneInputRef.current?.focus?.();
    }, 150);
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F7F4EC] text-[#0E1A14] flex flex-col justify-start overflow-hidden antialiased select-none">
      {/* 
        1. MEDIX NATIVE HEADER
        Seamless cream background with round white back button, bold typography & LanguageSwitcher
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
            onClick={() => {
              if (step === 'otp') {
                if (!isExistingUser) {
                  setStep('name');
                } else {
                  handleResetToPhone();
                }
              } else if (step === 'name') {
                handleResetToPhone();
              } else {
                navigate(redirectPath, { replace: true });
              }
            }}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#0E1A14] shadow-card active:scale-95 transition-transform cursor-pointer touch-manipulation border border-[#EFEAD8]"
            aria-label={t('Go back')}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
          </button>

          <h1 className="font-display font-extrabold text-[28px] sm:text-[30px] leading-none tracking-[-0.02em] text-[#0E1A14]">
            {step === 'otp' ? (
              <>
                {t('verify otp.')}
                <span className="text-[#003820]">.</span>
              </>
            ) : step === 'name' ? (
              <>
                {t('sign up.')}
                <span className="text-[#003820]">.</span>
              </>
            ) : (
              <>
                {t('sign in.')}
                <span className="text-[#003820]">.</span>
              </>
            )}
          </h1>
        </div>

        <LanguageSwitcher variant="light" />
      </header>

      {/* 
        2. TOP 40% MAIN CARD CANVAS
        All interactive form fields and the signature Medix button are placed inside
        the top 40% of the screen so that the mobile on-screen keyboard never covers them.
      */}
      <div className="w-full max-w-md mx-auto px-4 pt-1 shrink-0">
        <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#EFEAD8] shadow-card space-y-3.5">
          {/* Subtitle / Prompt */}
          <p className="text-[14px] text-[#5E6B63] font-medium leading-relaxed -mt-0.5">
            {step === 'otp'
              ? t('Enter SMS verification code')
              : step === 'name'
              ? t('New to Medix? Please enter your full name to create an account.')
              : t('We will verify your number & send an SMS code')}
          </p>

          {/* Dynamic Error / Info Banners */}
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="p-2.5 rounded-[12px] bg-red-50 border border-red-200 text-[#D64538] text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D64538]" />
                <span className="leading-tight">{error}</span>
              </motion.div>
            ) : infoMessage && step !== 'name' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="p-2.5 rounded-[12px] bg-[#EEF8D2] border border-[#C6F26B]/80 text-[#003820] text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#003820]" />
                <span className="leading-tight">{infoMessage}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ================= STEP 1: PHONE NUMBER INPUT ================= */}
          {step === 'phone' && (
            <form onSubmit={handleCheckUser} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1.5">
                  {t('Enter mobile number')}
                </label>
                <div className="relative flex items-center bg-[#F7F4EC] focus-within:bg-white rounded-[16px] border border-[#E5E0D5] focus-within:border-[#003820] focus-within:ring-2 focus-within:ring-[#003820]/10 transition-all overflow-hidden h-[52px]">
                  <div className="pl-4 pr-3 flex items-center gap-1.5 text-[#5E6B63] border-r border-[#E5E0D5] shrink-0 font-medium select-none">
                    <Phone className="w-4 h-4 text-[#003820]" />
                    <span className="font-display font-bold text-sm text-[#0E1A14]">
                      +91
                    </span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    enterKeyHint="done"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={t('Enter 10-digit mobile number')}
                    className="w-full h-full px-3.5 bg-transparent text-[16px] text-[#0E1A14] placeholder:text-[#5E6B63]/60 focus:outline-none font-sans font-semibold tracking-wider"
                    autoFocus
                    disabled={isLoading}
                  />
                  {phoneNumber && (
                    <button
                      type="button"
                      onClick={() => setPhoneNumber('')}
                      className="px-3.5 text-xs text-[#5E6B63] hover:text-[#0E1A14] active:scale-95 touch-manipulation cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Medix Signature Pill Button */}
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length < 10}
                className="relative w-full min-h-[54px] bg-[#003820] disabled:bg-[#E3EFE8] disabled:text-[#5E6B63] text-white text-[16px] font-display font-bold tracking-[-0.02em] rounded-[999px] transition-transform duration-150 active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-between pl-6 pr-2 select-none shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)] disabled:cursor-not-allowed"
              >
                <span>{isLoading ? t('Checking...') : t('Continue')}</span>

                <div className="w-10 h-10 rounded-full bg-[#C6F26B] text-[#0E1A14] flex items-center justify-center shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0E1A14]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.6]" />
                  )}
                </div>
              </button>
            </form>
          )}

          {/* ================= STEP 2: NEW USER FULL NAME INPUT ================= */}
          {step === 'name' && (
            <form onSubmit={handleSendOtpForNewUser} className="space-y-3.5">
              {/* Confirmed Mobile Pill with Change Button */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-[14px] bg-[#EEF8D2] border border-[#C6F26B]/80 text-[#003820]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-[#003820] shrink-0" />
                  <span className="font-display text-xs font-bold text-[#003820]">
                    +91 {phoneNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetToPhone}
                  className="text-xs font-bold text-[#003820] hover:underline flex items-center gap-1 active:scale-95 transition-transform cursor-pointer touch-manipulation"
                >
                  <Pencil className="w-3 h-3" />
                  <span>{t('Change number')}</span>
                </button>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1.5">
                  {t('Full Name')}
                </label>
                <div className="relative flex items-center bg-[#F7F4EC] focus-within:bg-white rounded-[16px] border border-[#E5E0D5] focus-within:border-[#003820] focus-within:ring-2 focus-within:ring-[#003820]/10 transition-all overflow-hidden h-[52px]">
                  <div className="pl-4 pr-3 flex items-center text-[#003820] border-r border-[#E5E0D5] shrink-0 select-none">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    ref={nameInputRef}
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    enterKeyHint="done"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError('');
                    }}
                    placeholder={t('Enter your name')}
                    className="w-full h-full px-3.5 bg-transparent text-[16px] text-[#0E1A14] placeholder:text-[#5E6B63]/60 focus:outline-none font-sans font-medium"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Medix Signature Pill Button */}
              <button
                type="submit"
                disabled={isLoading || !fullName.trim() || fullName.trim().length < 2}
                className="relative w-full min-h-[54px] bg-[#003820] disabled:bg-[#E3EFE8] disabled:text-[#5E6B63] text-white text-[16px] font-display font-bold tracking-[-0.02em] rounded-[999px] transition-transform duration-150 active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-between pl-6 pr-2 select-none shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)] disabled:cursor-not-allowed"
              >
                <span>{isLoading ? t('Sending OTP...') : t('Create Account & Send OTP')}</span>

                <div className="w-10 h-10 rounded-full bg-[#C6F26B] text-[#0E1A14] flex items-center justify-center shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0E1A14]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.6]" />
                  )}
                </div>
              </button>
            </form>
          )}

          {/* ================= STEP 3: OTP VERIFICATION ================= */}
          {step === 'otp' && (
            <form onSubmit={handleVerifySubmit} className="space-y-3.5">
              {/* Phone Status Pill */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-[14px] bg-[#E3EFE8] border border-[#003820]/15 text-[#003820]">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#003820] shrink-0" />
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#003820] truncate">
                      {isExistingUser && existingUserName
                        ? existingUserName
                        : fullName || t('Customer')}
                    </span>
                    <span className="font-display text-xs font-bold text-[#003820]">
                      (+91 {phoneNumber})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetToPhone}
                  className="px-2.5 py-1 rounded-[999px] bg-white border border-[#003820]/20 text-[#003820] text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer shrink-0 touch-manipulation"
                >
                  <Pencil className="w-2.5 h-2.5" />
                  <span>{t('Change')}</span>
                </button>
              </div>

              {/* OTP Input Field */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5E6B63] mb-1.5 text-center">
                  {t('Enter SMS verification code')}
                </label>
                <div className="flex justify-center">
                  <input
                    ref={otpInputRef}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    placeholder="••••"
                    className="w-48 h-[52px] text-center font-display font-extrabold text-[24px] tracking-[0.35em] text-[#003820] bg-[#F7F4EC] focus:bg-white rounded-[16px] border border-[#E5E0D5] focus:border-[#003820] focus:ring-2 focus:ring-[#003820]/10 focus:outline-none transition-all"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Medix Signature Pill Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className="relative w-full min-h-[54px] bg-[#003820] disabled:bg-[#E3EFE8] disabled:text-[#5E6B63] text-white text-[16px] font-display font-bold tracking-[-0.02em] rounded-[999px] transition-transform duration-150 active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-between pl-6 pr-2 select-none shadow-[0_12px_32px_-8px_rgba(0,56,32,0.22)] disabled:cursor-not-allowed"
              >
                <span>{isLoading ? t('Verifying...') : t('Verify & Proceed')}</span>

                <div className="w-10 h-10 rounded-full bg-[#C6F26B] text-[#0E1A14] flex items-center justify-center shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0E1A14]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.6]" />
                  )}
                </div>
              </button>

              {/* Resend Link */}
              <div className="text-center pt-0.5">
                {resendTimer > 0 ? (
                  <p className="text-[13px] text-[#5E6B63] font-medium">
                    {t('Resend in {n}s', { n: resendTimer })}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#003820] hover:underline active:scale-95 transition-transform cursor-pointer touch-manipulation"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t('Resend code')}</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 
        3. BOTTOM COMFORT ZONE (approx ~60% screen)
        Dedicated free area designed for the mobile software keyboard.
        Displays Medix reassurance indicators when keyboard is closed.
      */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 px-6 text-center select-none pointer-events-none">
        <div className="flex items-center gap-2 text-[#5E6B63] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#003820]" />
          <span>{t('100% Genuine Medicines · 24-hour Chemist Delivery')}</span>
        </div>
      </div>
    </div>
  );
}
