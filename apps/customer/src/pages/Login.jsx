import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, User, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';
import api from '../lib/api';
import { useT } from '../lib/i18n';

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/search';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountNotFoundPhone, setAccountNotFoundPhone] = useState(null);

  const currentUserPhone = useUserStore((state) => state.phone);
  const setAuth = useUserStore((state) => state.setAuth);
  const loadCartFromDb = useCartStore((state) => state.loadCartFromDb);

  useEffect(() => {
    if (currentUserPhone) {
      navigate(redirectPath, { replace: true });
    }
  }, [currentUserPhone, navigate, redirectPath]);

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setError('');
    setAccountNotFoundPhone(null);
  };

  const handleSuccess = (authData) => {
    setAuth({
      token: authData.token,
      user: authData.user,
    });

    if (authData?.user?.phone) {
      loadCartFromDb(authData.user.phone);
    }

    navigate(redirectPath, { replace: true });
  };

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setError(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    setIsLoading(true);
    setError('');
    setAccountNotFoundPhone(null);

    try {
      const res = await api.post('/auth/login', { phone: cleanPhone });
      if (res?.data?.success) {
        handleSuccess(res.data);
        return;
      }
      throw new Error(res?.data?.message || t('Login failed.'));
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Failed to sign in.';

      if (status === 404 || err?.response?.data?.exists === false) {
        setAccountNotFoundPhone(cleanPhone);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    const cleanName = String(fullName || '').trim();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (!cleanName) {
      setError(t('Please enter your full name.'));
      return;
    }

    if (cleanPhone.length !== 10) {
      setError(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        name: cleanName,
        phone: cleanPhone,
      });

      if (res?.data?.success) {
        handleSuccess(res.data);
        return;
      }
      throw new Error(res?.data?.message || t('Account creation failed.'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create account.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToRegisterWithPhone = () => {
    setMode('register');
    setError('');
    setAccountNotFoundPhone(null);
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
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-[5px] bg-white border border-[#C6C6C8] active:bg-[#E5E5EA] flex items-center justify-center text-[#000000] transition-colors cursor-pointer touch-manipulation"
          aria-label={t('Go back')}
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.25]" />
        </button>

        <h1 className="text-base font-bold text-[#000000] tracking-tight">
          {mode === 'login' ? t('Sign In') : t('Create Account')}
        </h1>

        <div className="w-9 h-9" />
      </header>

      {/* Top 30% Area: Minimal Form Controls Directly on Flat Canvas */}
      <main className="w-full max-w-md mx-auto px-5 pt-2 pb-4 shrink-0">
        {/* Classic Native Segmented Switcher */}
        <div className="relative flex items-center p-[2px] bg-[#E5E5EA] border border-[#C6C6C8]/80 rounded-[6px] mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setAccountNotFoundPhone(null);
            }}
            className={`relative flex-1 h-8 rounded-[4px] flex items-center justify-center text-xs font-semibold transition-colors duration-150 z-10 touch-manipulation cursor-pointer select-none ${
              mode === 'login' ? 'bg-white text-[#000000] font-bold shadow-2xs' : 'text-[#3C3C43]'
            }`}
          >
            <span className="relative z-10">{t('Sign In')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setAccountNotFoundPhone(null);
            }}
            className={`relative flex-1 h-8 rounded-[4px] flex items-center justify-center text-xs font-semibold transition-colors duration-150 z-10 touch-manipulation cursor-pointer select-none ${
              mode === 'register' ? 'bg-white text-[#000000] font-bold shadow-2xs' : 'text-[#3C3C43]'
            }`}
          >
            <span className="relative z-10">{t('Create Account')}</span>
          </button>
        </div>

        {/* Account Not Found Alert Banner */}
        <AnimatePresence>
          {accountNotFoundPhone && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 24, stiffness: 340 }}
              className="mb-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed space-y-2"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {t('No account found for')} <span className="font-bold font-mono">+91 {accountNotFoundPhone}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={switchToRegisterWithPhone}
                className="w-full h-8.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-transform text-white font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer touch-manipulation shadow-xs"
              >
                <span>{t('Create Account with this Number')}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="mb-3.5 p-2.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium leading-relaxed flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Inputs & Action Button Directly on Flat Background */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <div className="relative flex items-center bg-gray-50 focus-within:bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden h-12">
                <div className="pl-3.5 pr-2.5 flex items-center gap-1 text-gray-500 border-r border-gray-200 shrink-0 font-medium select-none">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-semibold text-sm text-gray-700">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  enterKeyHint="done"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={t('Enter 10-digit number')}
                  className="w-full h-full px-3.5 bg-transparent text-base text-gray-950 placeholder:text-gray-400 focus:outline-none font-mono font-medium tracking-wide"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
              disabled={isLoading || phoneNumber.length < 10}
              className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-sm tracking-tight shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t('Sign In')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <div className="relative flex items-center bg-gray-50 focus-within:bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden h-12">
                <div className="pl-3.5 pr-2.5 flex items-center text-emerald-600 border-r border-gray-200 shrink-0 select-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  enterKeyHint="next"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError('');
                  }}
                  placeholder={t('e.g. Rahul Sharma')}
                  className="w-full h-full px-3.5 bg-transparent text-base text-gray-950 placeholder:text-gray-400 focus:outline-none font-medium"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="relative flex items-center bg-gray-50 focus-within:bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden h-12">
                <div className="pl-3.5 pr-2.5 flex items-center gap-1 text-gray-500 border-r border-gray-200 shrink-0 font-medium select-none">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-semibold text-sm text-gray-700">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  enterKeyHint="done"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={t('Enter 10-digit number')}
                  className="w-full h-full px-3.5 bg-transparent text-base text-gray-950 placeholder:text-gray-400 focus:outline-none font-mono font-medium tracking-wide"
                  disabled={isLoading}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
              disabled={isLoading || !fullName.trim() || phoneNumber.length < 10}
              className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-sm tracking-tight shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t('Create Account')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                </>
              )}
            </motion.button>
          </form>
        )}
      </main>

      {/* Remaining 70% of the screen is kept empty */}
      <div className="flex-1" />
    </div>
  );
}
