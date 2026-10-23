import React, { useState } from 'react';
import { Phone, User, ArrowRight, Loader2, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import api from '../lib/api';

export default function PhoneLogin({ onSuccess, onCancel, defaultMode = 'login', initialPhone = '', initialName = '' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [fullName, setFullName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountNotFoundPhone, setAccountNotFoundPhone] = useState(null);

  const setAuth = useUserStore((state) => state.setAuth);

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setError('');
    setAccountNotFoundPhone(null);
  };

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAccountNotFoundPhone(null);

    try {
      const res = await api.post('/auth/login', { phone: cleanPhone });
      if (res?.data?.success) {
        setAuth({
          token: res.data.token,
          user: res.data.user,
        });
        onSuccess?.(res.data);
        return;
      }
      throw new Error(res?.data?.message || 'Login failed.');
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
      setError('Please enter your full name.');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
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
        setAuth({
          token: res.data.token,
          user: res.data.user,
        });
        onSuccess?.(res.data);
        return;
      }
      throw new Error(res?.data?.message || 'Account creation failed.');
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
    <div className="w-full">
      {/* Mode Switcher Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError('');
            setAccountNotFoundPhone(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'login'
              ? 'bg-white text-ink shadow-xs'
              : 'text-gray-500 hover:text-ink'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Log In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError('');
            setAccountNotFoundPhone(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'register'
              ? 'bg-white text-ink shadow-xs'
              : 'text-gray-500 hover:text-ink'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      <p className="text-xs text-ink-light mb-4">
        {mode === 'login'
          ? 'Enter your mobile number to sign in. No OTP required.'
          : 'Enter your name and mobile number to create your Medix account. No OTP or email needed.'}
      </p>

      {/* Account not found banner */}
      {accountNotFoundPhone && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              No account found for <span className="font-bold font-mono">+91 {accountNotFoundPhone}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={switchToRegisterWithPhone}
            className="w-full py-2 bg-brand-green hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account with this Number</span>
          </button>
        </div>
      )}

      {/* General error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium leading-relaxed flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === 'login' ? (
        /* LOGIN FORM: ONLY MOBILE NUMBER */
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-green" />
              <span>Mobile Number *</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-semibold text-gray-500 font-mono">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full h-11 pl-12 pr-3.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 text-sm text-ink placeholder:text-gray-400 focus:outline-none transition-all touch-manipulation font-mono font-medium tracking-wide"
                autoFocus
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Only mobile number needed to log in.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || phoneNumber.length < 10}
            className="w-full h-11 bg-brand-green hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors touch-manipulation flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* REGISTER FORM: NAME + MOBILE NUMBER */
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-green" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Rahul Sharma"
              className="w-full h-11 px-3.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 text-sm text-ink placeholder:text-gray-400 focus:outline-none transition-all touch-manipulation"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-green" />
              <span>Mobile Number *</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-semibold text-gray-500 font-mono">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full h-11 pl-12 pr-3.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 text-sm text-ink placeholder:text-gray-400 focus:outline-none transition-all touch-manipulation font-mono font-medium tracking-wide"
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Your mobile number is your unique ID.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !fullName.trim() || phoneNumber.length < 10}
            className="w-full h-11 bg-brand-green hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors touch-manipulation flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
