import React, { useState, useEffect, useRef } from 'react';
import { Phone, User, ArrowRight, Loader2, UserPlus, LogIn, AlertCircle, Pencil, RotateCw, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import api from '../lib/api';

export default function PhoneLogin({ onSuccess, onCancel, defaultMode = 'login', initialPhone = '', initialName = '' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [fullName, setFullName] = useState(initialName);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef(null);
  const setAuth = useUserStore((state) => state.setAuth);

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
  };

  const handleOtpChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    setError('');

    if (cleaned.length === 4 || cleaned.length === 6) {
      verifyOtpCode(cleaned);
    }
  };

  // Step 1: Send OTP via APITxT
  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Please enter your full name.');
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
        setTimeout(() => {
          otpInputRef.current?.focus?.();
        }, 200);
        return;
      }
      throw new Error(res?.data?.message || 'Failed to send OTP.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send OTP.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOtpCode = async (codeToVerify) => {
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
    const code = String(codeToVerify || otp || '').trim();

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (code.length !== 4) {
      setError('Please enter the 4-digit OTP.');
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
        setAuth({
          token: res.data.token,
          user: res.data.user,
        });
        onSuccess?.(res.data);
        return;
      }
      throw new Error(res?.data?.message || 'OTP verification failed.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid OTP.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e?.preventDefault?.();
    verifyOtpCode(otp);
  };

  const handleEditPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="w-full">
      {step === 'phone' ? (
        <>
          {/* Mode Switcher Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
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
              ? 'Enter your mobile number to receive a 4-digit SMS OTP.'
              : 'Enter your name and mobile number. We will send an SMS OTP to verify.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium leading-relaxed flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-3.5">
            {mode === 'register' && (
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
            )}

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
                  autoFocus={mode === 'login'}
                  disabled={isLoading}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                OTP will be delivered via SMS to your entered number.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                phoneNumber.length < 10 ||
                (mode === 'register' && !fullName.trim())
              }
              className="w-full h-11 bg-brand-green hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors touch-manipulation flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* STEP 2: ENTER OTP */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-emerald-700 font-medium">OTP sent to</p>
                <p className="font-mono font-bold text-xs text-emerald-950">+91 {phoneNumber}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEditPhone}
              className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium leading-relaxed flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 text-center">
                Enter 4-Digit SMS OTP
              </label>
              <div className="flex justify-center">
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="••••"
                  className="w-44 h-12 text-center font-mono font-bold text-xl tracking-[0.5em] bg-gray-50 focus:bg-white rounded-xl border-2 border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition-all"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="w-full h-11 bg-brand-green hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors touch-manipulation flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            {resendTimer > 0 ? (
              <p className="text-xs text-gray-500">
                Resend OTP in <span className="font-mono font-bold text-brand-green">{resendTimer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Resend OTP via SMS</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
