import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneCall,
  Clock,
  Sparkles,
  ShieldCheck,
  Truck,
  Pill,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Tag,
  Zap,
  BadgePercent,
  HeartHandshake,
  FileText,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  BellRing
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useT, useLangStore } from '../lib/i18n';

// Official Contact details
const MEDIX_PHONE = '+918918237582';
const MEDIX_PHONE_DISPLAY = '+91 89182 37582';
const WHATSAPP_URL =
  'https://wa.me/918918237582?text=Hi%20Medix%2C%20I%20want%20to%20order%20medicines%20via%20WhatsApp.%20Please%20guide%20me.';

// Official Launch Date: 15th December, 2026, 09:00 AM IST
const LAUNCH_TARGET_DATE = new Date('2026-12-15T09:00:00+05:30').getTime();

export default function LandingPage() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  // Haptic feedback helper
  const haptic = (ms = 8) => {
    try {
      navigator.vibrate?.(ms);
    } catch {}
  };

  // State for phone copied notification
  const [copiedPhone, setCopiedPhone] = useState(false);
  const handleCopyPhone = () => {
    haptic(10);
    navigator.clipboard?.writeText?.(MEDIX_PHONE);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2200);
  };

  // Countdown calculations
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  function calculateTimeLeft() {
    const now = Date.now();
    const difference = Math.max(0, LAUNCH_TARGET_DATE - now);

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isLaunched: difference <= 0,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format numbers for current locale
  const formatDigit = (num) => {
    const formatted = String(num).padStart(2, '0');
    if (!isBn) return formatted;
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return formatted.replace(/\d/g, (d) => bnDigits[Number(d)]);
  };

  // FAQ Accordion states
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      q: isBn
        ? 'অ্যাপ লঞ্চের আগেই কি আমি ওষুধ অর্ডার করতে পারি?'
        : 'Can I order medicines right now before the official app launch?',
      a: isBn
        ? 'হ্যাঁ, অবশ্যই! আমাদের হোয়াটসঅ্যাপ এবং ফোন কল অর্ডার সার্ভিস বর্তমানে সম্পূর্ণ সক্রিয়। আপনি প্রেসক্রিপশনের ছবি পাঠিয়ে ২৪ ঘণ্টার মধ্যের মধ্যে হোম ডেলিভারি পেতে পারেন।'
        : 'Yes, absolutely! Our WhatsApp and Phone ordering services are 100% active and delivering right now. You can simply send your prescription photo on WhatsApp or call us, and our delivery partner will deliver to your doorstep within 24 hours.',
    },
    {
      q: isBn
        ? 'কীভাবে হোয়াটসঅ্যাপে প্রেসক্রিপশন পাঠাব?'
        : 'How do I send my prescription on WhatsApp to order?',
      a: isBn
        ? 'আমাদের "Order on WhatsApp" বোতামে চাপুন অথবা +91 89182 37582 নম্বরে আপনার ডাক্তারের প্রেসক্রিপশনের পরিষ্কার ছবি বা ওষুধের নামের তালিকা পাঠান। আমাদের রেজিস্টার্ড ফার্মাসিস্ট অবিলম্বে তা যাচাই করবেন।'
        : 'Click on the "Order on WhatsApp" button or message +91 89182 37582 directly. Snap a clear photo of your doctor\'s prescription or send the medicine names. Our registered pharmacist will review it instantly.',
    },
    {
      q: isBn
        ? '১২% এবং ১৭% ছাড়ের অফার কীভাবে পাব?'
        : 'How do the 12% and 17% discounts work?',
      a: isBn
        ? 'যেকোনো ৫০০ টাকার বেশি অর্ডারে আপনি পাচ্ছেন ফ্ল্যাট ১২% ছাড়। আর ১৫০০ টাকার বেশি অর্ডারে পাবেন সর্বোচ্চ ১৭% ফ্ল্যাট ছাড় এবং মাত্র ৫ টাকায় সুপারফাস্ট ডেলিভারি!'
        : 'Every order starting from ₹500 automatically receives a 12% flat discount. Orders of ₹1,500 and above unlock our maximum 17% flat discount plus delivery for just ₹5 (70% OFF delivery fee).',
    },
    {
      q: isBn
        ? 'ওষুধগুলো কি ১০০% আসল ও নির্ভরযোগ্য?'
        : 'Are the medicines genuine and verified?',
      a: isBn
        ? 'হ্যাঁ। মেডিএক্স শুধুমাত্র সরকারি ড্রাগ লাইসেন্সপ্রাপ্ত ও রেজিস্টার্ড ফার্মেসি থেকে সরাসরি ওষুধ সরবরাহ করে। প্রতিটি অর্ডারে নিরাপদ সিল এবং ব্যাচ নম্বর যাচাই করা হয়।'
        : 'Yes. Medix exclusively partners with government-licensed and verified local pharmacies. Every medicine is packaged with a tamper-proof security seal and checked by a certified pharmacist.',
    },
    {
      q: isBn
        ? 'পেমেন্ট কীভাবে করতে হবে?'
        : 'What payment methods can I use?',
      a: isBn
        ? 'ওষুধ হাতে পাওয়ার পর ক্যাশ অন ডেলিভারি (Cash on Delivery) অথবা যেকোনো UPI (Google Pay, PhonePe, Paytm) এর মাধ্যমে পেমেন্ট করতে পারেন।'
        : 'You only pay when you receive your package at your doorstep! We support both Cash on Delivery (COD) and all UPI apps (Google Pay, PhonePe, Paytm).',
    },
    {
      q: isBn
        ? '১৫ই ডিসেম্বর, ২০২৬ তারিখে কী হবে?'
        : 'What is happening on 15th December, 2026?',
      a: isBn
        ? '১৫ই ডিসেম্বর আমাদের অফিসিয়াল মোবাইল অ্যাপ সবার জন্য উন্মুক্ত হবে। অ্যাপের মাধ্যমে আপনি লাইভ রাইডার ট্র্যাকিং, ১-ট্যাপে রি-অর্ডার ও ফ্যামিলি হেলথ রেকর্ড সুবিধা পাবেন।'
        : 'On 15th December 2026, our full-featured mobile app goes live with live GPS rider tracking, 1-tap chronic refills, medicine expiry alerts, and family health accounts.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#0E1A14] flex flex-col antialiased selection:bg-[#C6F26B] selection:text-[#003820]">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#F7F4EC]/95 backdrop-blur-md border-b border-[#0E1A14]/8">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link
            to="/"
            onClick={() => haptic(8)}
            className="flex items-center gap-2.5 active:scale-[0.98] transition-transform"
          >
            <div className="relative">
              <img
                src="/medix_logo.png"
                alt="Medix"
                className="w-9 h-9 rounded-[10px] object-cover shadow-sm bg-[#003820]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-[20px] tracking-tight text-[#003820] leading-none">
                  MEDIX
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#C6F26B] text-[#003820] rounded-full">
                  LAUNCH
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#5E6B63] leading-none mt-0.5">
                {isBn ? 'ওষুধ ডেলিভারি সার্ভিস' : '20-Min Medicine Delivery'}
              </p>
            </div>
          </Link>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="light" />

            <Link
              to="/"
              onClick={() => haptic(8)}
              className="h-[38px] px-3.5 rounded-full bg-[#003820] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.96] transition-transform hover:bg-[#002615]"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#C6F26B]" />
              <span className="hidden sm:inline">{isBn ? 'অ্যাপ ব্রাউজ করুন' : 'Browse Store'}</span>
              <span className="sm:hidden">{isBn ? 'স্টোর' : 'Store'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-4 pb-28 space-y-6">
        {/* ========================================================== */}
        {/* 1. CRITICAL NOTICE: WHATSAPP ORDERS ARE ACTIVE RIGHT NOW */}
        {/* ========================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#003820] via-[#002B19] to-[#001D11] text-white p-5 sm:p-6 shadow-xl border border-[#C6F26B]/20"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C6F26B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#25D366]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Urgent Status Pill */}
          <div className="flex items-center gap-2 mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6F26B] text-[#003820] text-[12px] sm:text-[13px] font-extrabold tracking-wide uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#003820] animate-ping" />
              {isBn ? 'হোয়াটসঅ্যাপে অর্ডার চালু রয়েছে!' : 'WhatsApp Orders Started Now!'}
            </span>
            <span className="text-[12px] font-medium text-emerald-200/90 hidden sm:inline">
              {isBn ? 'কোনো অপেক্ষার প্রয়োজন নেই' : 'No Waiting Required'}
            </span>
          </div>

          {/* Primary Announcement Headline */}
          <h1 className="font-display font-extrabold text-[24px] sm:text-[30px] leading-tight text-white mb-2.5">
            {isBn ? (
              <>
                অফিসিয়াল অ্যাপ আসছে, কিন্তু{' '}
                <span className="text-[#C6F26B]">হোয়াটসঅ্যাপে অর্ডার চালু হয়ে গেছে!</span>
              </>
            ) : (
              <>
                App Launching Soon, But{' '}
                <span className="text-[#C6F26B]">WhatsApp Orders Are LIVE Now!</span>
              </>
            )}
          </h1>

          <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#E3EFE8] mb-5">
            {isBn
              ? 'আমাদের পূর্ণাঙ্গ অ্যাপ ১৫ই ডিসেম্বর ২০২৬ আনুষ্ঠানিকভাবে লঞ্চ হবে। তবে আপনার এখনই ওষুধের প্রয়োজন হলে অপেক্ষা করতে হবে না—প্রেসক্রিপশনের ছবি পাঠিয়ে অথবা সরাসরি ফোন করে যেকেউ যেকোনো সময় অর্ডার করতে পারেন। আমাদের ফার্মাসিস্ট ও ডেলিভারি পার্টনাররা প্রস্তুত আছেন!'
              : 'While our official mobile application launches on 15th December 2026, you DO NOT need to wait! Anyone who wants to order medicines can place orders through WhatsApp or Phone call right now. Sourced from verified pharmacies and delivered within 24 hours.'}
          </p>

          {/* Instant Order Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary WhatsApp Button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptic(12)}
              className="h-[52px] px-6 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/25 active:scale-[0.97] transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 12.99 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.48 11.14 9.6 11.01 9.73 10.89C9.84 10.78 9.98 10.6 10.1 10.45C10.22 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.6C10.27 9.48 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.35 9.01 7.34C8.86 7.33 8.7 7.33 8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.93 7.9 12.11 8.02 12.27C8.15 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.54C14.25 16.73 14.79 16.7 15.22 16.64C15.7 16.57 16.69 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99Z" />
              </svg>
              <span>{isBn ? 'হোয়াটসঅ্যাপে প্রেসক্রিপশন পাঠান' : 'Order via WhatsApp Now'}</span>
            </a>

            {/* Direct Phone Call Button */}
            <a
              href={`tel:${MEDIX_PHONE}`}
              onClick={() => haptic(12)}
              className="h-[52px] px-5 rounded-full bg-white/12 hover:bg-white/20 text-white font-bold text-[14px] flex items-center justify-center gap-2 border border-white/20 active:scale-[0.97] transition-all"
            >
              <PhoneCall className="w-4 h-4 text-[#C6F26B]" />
              <span>{isBn ? 'কল করুন: ' : 'Call to Order: '}</span>
              <span className="font-mono tracking-tight font-extrabold">{MEDIX_PHONE_DISPLAY}</span>
            </a>
          </div>

          {/* Quick Copy Feature */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-[12px] text-emerald-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C6F26B]" />
              {isBn ? '১০০% আসল ওষুধ • ক্যাশ অন ডেলিভারি' : '100% Genuine Medicine • Cash on Delivery'}
            </span>
            <button
              onClick={handleCopyPhone}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C6F26B]" />
                  <span>{isBn ? 'কপি হয়েছে' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 opacity-80" />
                  <span>{isBn ? 'নম্বর কপি করুন' : 'Copy number'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* 2. LAUNCH COUNTDOWN SECTION (15th December 2026) */}
        {/* ========================================================== */}
        <section className="bg-white rounded-[20px] p-5 sm:p-6 border border-[#0E1A14]/8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EFE8] text-[#003820] text-[11px] font-extrabold uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-[#003820]" />
                {isBn ? 'অফিসিয়াল অ্যাপ লঞ্চ কাউন্টডাউন' : 'Official App Launch Countdown'}
              </div>
              <h2 className="font-display font-extrabold text-[20px] sm:text-[24px] text-[#0E1A14] mt-1.5 tracking-tight">
                {isBn ? '১৫ই ডিসেম্বর, ২০২৬' : '15th December, 2026'}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[12px] font-medium text-[#5E6B63] block">
                {isBn ? 'মেডিএক্স মোবাইল অ্যাপ' : 'Medix Full App Experience'}
              </span>
              <span className="text-[13px] font-bold text-[#003820]">
                {isBn ? 'অ্যান্ড্রয়েড ও আইওএস' : 'Android & iOS Release'}
              </span>
            </div>
          </div>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: isBn ? 'দিন' : 'DAYS', value: timeLeft.days },
              { label: isBn ? 'ঘণ্টা' : 'HOURS', value: timeLeft.hours },
              { label: isBn ? 'মিনিট' : 'MINUTES', value: timeLeft.minutes },
              { label: isBn ? 'সেকেন্ড' : 'SECONDS', value: timeLeft.seconds },
            ].map((unit, index) => (
              <div
                key={index}
                className="bg-[#F7F4EC] rounded-[16px] p-3 sm:p-4 text-center border border-[#0E1A14]/6 flex flex-col justify-center items-center shadow-sm"
              >
                <span className="font-display font-black text-[26px] sm:text-[36px] text-[#003820] leading-none tracking-tight">
                  {formatDigit(unit.value)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#5E6B63] uppercase tracking-wider mt-1.5">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          {/* Reassurance reminder below timer */}
          <div className="mt-4 p-3 rounded-[14px] bg-[#EEF8D2] border border-[#C6F26B]/50 flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#003820] shrink-0" />
            <p className="text-[13px] font-medium text-[#003820] leading-snug">
              <strong>{isBn ? 'মনে রাখবেন:' : 'Remember:'}</strong>{' '}
              {isBn
                ? 'কাউন্টডাউন শেষ হওয়ার জন্য অপেক্ষা করতে হবে না। হোয়াটসঅ্যাপ ও ফোনে অর্ডার এখনই সম্পূর্ণ চালু রয়েছে!'
                : 'You do NOT need to wait for the timer to finish! WhatsApp & Phone ordering is 100% active today.'}
            </p>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 3. OFFERS & SAVINGS SHOWCASE */}
        {/* ========================================================== */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#003820]">
                <BadgePercent className="w-4 h-4 text-[#003820]" />
                {isBn ? 'বিশেষ ছাড় ও সুযোগ-সুবিধা' : 'Launch Offers & Discounts'}
              </div>
              <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] tracking-tight text-[#0E1A14] mt-0.5">
                {isBn ? 'সাশ্রয়ী মূল্যে আসল ওষুধ' : 'Guaranteed Savings on Every Order'}
              </h2>
            </div>
            <span className="text-[12px] font-semibold text-[#5E6B63] hidden sm:block">
              {isBn ? 'স্বয়ংক্রিয়ভাবে প্রযোজ্য' : 'Auto-applied'}
            </span>
          </div>

          {/* Featured 17% Discount Banner Image */}
          <div className="w-full rounded-[18px] overflow-hidden bg-[#003820] shadow-md border border-[#0E1A14]/8">
            <img
              src="/medix-17-discount-banner.png"
              alt="17% discount on orders above ₹1,500"
              className="w-full h-auto object-cover select-none pointer-events-none"
            />
          </div>

          {/* Cards for Offers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Offer 1: 17% Flat Off */}
            <div className="bg-white rounded-[18px] p-5 border border-[#003820]/15 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-[#003820] text-[#C6F26B] font-extrabold text-[11px] px-3 py-1 rounded-bl-[12px] tracking-wide uppercase">
                {isBn ? 'সেরা অফার' : 'Top Tier'}
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-[#E3EFE8] flex items-center justify-center text-[#003820] font-black text-[18px] mb-3">
                  17%
                </div>
                <h3 className="font-display font-bold text-[18px] text-[#003820] leading-snug">
                  {isBn ? '১৫০০+ টাকার অর্ডারে ১৭% ফ্ল্যাট ছাড়' : 'Flat 17% OFF on Orders Above ₹1,500'}
                </h3>
                <p className="text-[13px] text-[#5E6B63] mt-1.5 leading-relaxed">
                  {isBn
                    ? 'যেকোনো ১৫০০ টাকার বেশি ওষুধ অর্ডারে ১৭% তাৎক্ষণিক ছাড় এবং মাত্র ৫ টাকায় ডেলিভারি (৭০% ছাড়) পেয়ে যান।'
                    : 'Get flat 17% instant savings plus express delivery for just ₹5 (70% OFF delivery fee) on family medicine orders.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0E1A14]/6 flex items-center justify-between text-[12px] font-bold text-[#003820]">
                <span>{isBn ? 'ন্যূনতম অর্ডার: ₹১,৫০০' : 'Min Order: ₹1,500'}</span>
                <span className="text-[#25D366]">✓ {isBn ? 'সক্রিয় অফার' : 'Live Now'}</span>
              </div>
            </div>

            {/* Offer 2: 12% Instant Discount */}
            <div className="bg-white rounded-[18px] p-5 border border-[#0E1A14]/8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#EEF8D2] flex items-center justify-center text-[#003820] font-black text-[18px] mb-3">
                  12%
                </div>
                <h3 className="font-display font-bold text-[18px] text-[#0E1A14] leading-snug">
                  {isBn ? '৫০০+ টাকার অর্ডারে ১২% ফ্ল্যাট ছাড়' : 'Flat 12% OFF on Orders Above ₹500'}
                </h3>
                <p className="text-[13px] text-[#5E6B63] mt-1.5 leading-relaxed">
                  {isBn
                    ? 'জরুরি বা দৈনন্দিন ওষুধে কোনো কুপন কোড ছাড়া স্বয়ংক্রিয়ভাবে ১২% ক্যাশ ডিসকাউন্ট।'
                    : 'Immediate 12% savings on everyday fever, cough, digestive, or common health essentials without complex coupons.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0E1A14]/6 flex items-center justify-between text-[12px] font-bold text-[#003820]">
                <span>{isBn ? 'ন্যূনতম অর্ডার: ₹৫০০' : 'Min Order: ₹500'}</span>
                <span className="text-[#25D366]">✓ {isBn ? 'সক্রিয় অফার' : 'Live Now'}</span>
              </div>
            </div>
          </div>

          {/* Launch Special Offer Callout */}
          <div className="bg-gradient-to-r from-[#EEF8D2] to-[#E3EFE8] rounded-[16px] p-4 border border-[#C6F26B] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-[#003820] shrink-0">
              <Sparkles className="w-5 h-5 text-[#003820]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[14px] sm:text-[15px] text-[#003820]">
                {isBn ? 'হোয়াটসঅ্যাপে প্রথম অর্ডারে ফ্রি ডেলিভারি!' : 'Free Delivery on Your 1st WhatsApp Order!'}
              </h4>
              <p className="text-[12px] text-[#5E6B63] leading-snug mt-0.5">
                {isBn
                  ? 'হোয়াটসঅ্যাপে অর্ডার করার সময় "LAUNCHMEDIX" লিখুন এবং আপনার প্রথম অর্ডারে ১০০% ফ্রি ডেলিভারি উপভোগ করুন।'
                  : 'Mention "LAUNCHMEDIX" when chatting on WhatsApp to claim free doorstep delivery on your first order.'}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 4. PROCESS OF ORDER: STEP-BY-STEP */}
        {/* ========================================================== */}
        <section className="bg-white rounded-[20px] p-5 sm:p-6 border border-[#0E1A14]/8 shadow-card space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#003820]">
              <FileText className="w-4 h-4 text-[#003820]" />
              {isBn ? 'অর্ডার করার সহজ পদ্ধতি' : 'How Ordering Works (Process)'}
            </div>
            <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] tracking-tight text-[#0E1A14] mt-0.5">
              {isBn ? 'মাত্র ৪টি সহজ ধাপে ওষুধ পান' : 'Order in 4 Effortless Steps'}
            </h2>
            <p className="text-[13px] text-[#5E6B63] mt-1">
              {isBn
                ? 'বয়স্ক ও যেকোনো বয়সের মানুষের জন্য অত্যন্ত সহজ—টাইপ করার কোনো ঝামেলা নেই!'
                : 'Designed so simple that anyone of any age can order without typing.'}
            </p>
          </div>

          {/* Process Timeline */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-[16px] bg-[#F7F4EC] border border-[#0E1A14]/6">
              <div className="w-9 h-9 rounded-full bg-[#003820] text-[#C6F26B] font-display font-black text-[14px] flex items-center justify-center shrink-0">
                01
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-[#003820]">
                  {isBn ? 'প্রেসক্রিপশন পাঠান বা কল করুন' : 'Send Prescription or Make a Call'}
                </h3>
                <p className="text-[13px] text-[#5E6B63] leading-relaxed mt-1">
                  {isBn
                    ? 'আপনার মোবাইল ক্যামেরা দিয়ে ডাক্তারের প্রেসক্রিপশন অথবা ওষুধের পাতার ছবি তুলে আমাদের হোয়াটসঅ্যাপে পাঠান, অথবা সরাসরি ফোন নম্বরে কল করুন।'
                    : 'Take a clear photo of your doctor\'s prescription or medicine strip and send it on WhatsApp, or simply dial +91 89182 37582.'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-[16px] bg-[#F7F4EC] border border-[#0E1A14]/6">
              <div className="w-9 h-9 rounded-full bg-[#003820] text-[#C6F26B] font-display font-black text-[14px] flex items-center justify-center shrink-0">
                02
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-[#003820]">
                  {isBn ? 'ফার্মাসিস্ট যাচাই ও ছাড়যুক্ত বিল' : 'Pharmacist Verification & Bill Confirmation'}
                </h3>
                <p className="text-[13px] text-[#5E6B63] leading-relaxed mt-1">
                  {isBn
                    ? 'আমাদের রেজিস্টার্ড ফার্মাসিস্ট প্রেসক্রিপশন পরীক্ষা করবেন, ১২% বা ১৭% ডিসকাউন্ট যোগ করবেন এবং হোয়াটসঅ্যাপে পরিষ্কার বিল পাঠাবেন।'
                    : 'Our certified chemist reviews dosage, applies your 12% or 17% discount, and shares the transparent itemized bill for your confirmation.'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-[16px] bg-[#F7F4EC] border border-[#0E1A14]/6">
              <div className="w-9 h-9 rounded-full bg-[#003820] text-[#C6F26B] font-display font-black text-[14px] flex items-center justify-center shrink-0">
                03
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-[#003820]">
                  {isBn ? 'সিলগালা ও নিরাপদ প্যাকিং' : 'Tamper-Proof Safe Packaging'}
                </h3>
                <p className="text-[13px] text-[#5E6B63] leading-relaxed mt-1">
                  {isBn
                    ? 'নিকটস্থ রেজিস্টার্ড পার্টনার ফার্মেসি থেকে ওষুধগুলো সিলযুক্ত সুরক্ষিত প্যাকেটে প্যাক করে ডেলিভারি পার্টনারের হাতে তুলে দেওয়া হয়।'
                    : 'Your medicines are safely packed inside tamper-evident sealed pouches at the local licensed pharmacy partner with temperature control.'}
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-[16px] bg-[#F7F4EC] border border-[#0E1A14]/6">
              <div className="w-9 h-9 rounded-full bg-[#003820] text-[#C6F26B] font-display font-black text-[14px] flex items-center justify-center shrink-0">
                04
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-[#003820]">
                  {isBn ? '২৪ ঘণ্টার মধ্যে ডেলিভারি ও সুরক্ষিত OTP' : '24 Hr Doorstep Delivery with OTP'}
                </h3>
                <p className="text-[13px] text-[#5E6B63] leading-relaxed mt-1">
                  {isBn
                    ? 'ডেলিভারি রাইডার আপনার দরজায় পৌঁছালে ৪ ডিজিটের ডেলিভারি ওটিপি দিয়ে ওষুধ গ্রহণ করুন এবং ক্যাশ বা ইউপিআই দিয়ে পেমেন্ট করুন।'
                    : 'Rider arrives at your home. Confirm the order with your 4-digit handover OTP, inspect the medicines, and pay securely via Cash or UPI.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick CTA inside Process */}
          <div className="pt-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptic(10)}
              className="w-full min-h-[48px] rounded-full bg-[#003820] text-[#C6F26B] text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
            >
              <span>{isBn ? 'এখনই হোয়াটসঅ্যাপে প্রেসক্রিপশন পাঠিয়ে ট্রাই করুন' : 'Try WhatsApp Ordering Right Now'}</span>
              <ArrowRight className="w-4 h-4 text-[#C6F26B]" />
            </a>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 5. WHY CHOOSE MEDIX (Trust & Core Pillars) */}
        {/* ========================================================== */}
        <section className="space-y-3.5">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#003820]">
            <ShieldCheck className="w-4 h-4 text-[#003820]" />
            {isBn ? 'মেডিএক্স কেন বেছে নেবেন' : 'Why Choose Medix'}
          </div>
          <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] tracking-tight text-[#0E1A14]">
            {isBn ? 'নির্ভরযোগ্য স্বাস্থ্যসেবা আপনার কাছে' : 'Healthcare Built on Pure Trust'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-[16px] p-4 border border-[#0E1A14]/8 shadow-sm text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#E3EFE8] flex items-center justify-center mb-2.5">
                <Truck className="w-5 h-5 text-[#003820]" />
              </div>
              <span className="font-display font-extrabold text-[15px] text-[#003820] leading-tight">
                24 Hrs
              </span>
              <span className="text-[12px] text-[#5E6B63] mt-1 leading-tight">
                {isBn ? 'দ্রুত হোম ডেলিভারি' : 'Express Delivery'}
              </span>
            </div>

            <div className="bg-white rounded-[16px] p-4 border border-[#0E1A14]/8 shadow-sm text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#EEF8D2] flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-5 h-5 text-[#003820]" />
              </div>
              <span className="font-display font-extrabold text-[15px] text-[#003820] leading-tight">
                100%
              </span>
              <span className="text-[12px] text-[#5E6B63] mt-1 leading-tight">
                {isBn ? 'আসল লাইসেন্সড ওষুধ' : 'Genuine Medicines'}
              </span>
            </div>

            <div className="bg-white rounded-[16px] p-4 border border-[#0E1A14]/8 shadow-sm text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#E3EFE8] flex items-center justify-center mb-2.5">
                <Pill className="w-5 h-5 text-[#003820]" />
              </div>
              <span className="font-display font-extrabold text-[15px] text-[#003820] leading-tight">
                Up to 17%
              </span>
              <span className="text-[12px] text-[#5E6B63] mt-1 leading-tight">
                {isBn ? 'ফ্ল্যাট সেভিংস' : 'Flat Savings'}
              </span>
            </div>

            <div className="bg-white rounded-[16px] p-4 border border-[#0E1A14]/8 shadow-sm text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#EEF8D2] flex items-center justify-center mb-2.5">
                <HeartHandshake className="w-5 h-5 text-[#003820]" />
              </div>
              <span className="font-display font-extrabold text-[15px] text-[#003820] leading-tight">
                COD + UPI
              </span>
              <span className="text-[12px] text-[#5E6B63] mt-1 leading-tight">
                {isBn ? 'সহজ পেমেন্ট' : 'Easy Doorstep Pay'}
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 6. WHAT TO EXPECT IN THE APP (Coming Dec 15, 2026) */}
        {/* ========================================================== */}
        <section className="bg-gradient-to-br from-[#003820] to-[#002615] rounded-[20px] p-5 sm:p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C6F26B] text-[#003820] text-[11px] font-extrabold uppercase tracking-wide">
              {isBn ? 'লঞ্চের পর আসছে' : 'Coming on 15 Dec 2026'}
            </span>
          </div>

          <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] text-white tracking-tight">
            {isBn ? 'পূর্ণাঙ্গ মোবাইল অ্যাপে কী কী থাকছে?' : 'What Powers the Full Mobile App?'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] text-emerald-100">
            <div className="flex items-start gap-2.5 p-3 rounded-[12px] bg-white/6 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#C6F26B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">
                  {isBn ? 'লাইভ জিপিএস রাইডার ট্র্যাকিং' : 'Live GPS Rider Tracking'}
                </strong>
                <span>{isBn ? 'মানচিত্রে রাইডারের সঠিক অবস্থান ও সময় দেখুন।' : 'Watch your rider navigate to your doorstep in real time.'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-[12px] bg-white/6 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#C6F26B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">
                  {isBn ? '১-ট্যাপে রি-অর্ডার ও রিমাইন্ডার' : '1-Tap Reorders & Reminders'}
                </strong>
                <span>{isBn ? 'ডায়াবেটিস বা প্রেশারের নিয়মিত ওষুধ এক ক্লিকে অর্ডার।' : 'Monthly refill alerts before your chronic medicines run out.'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-[12px] bg-white/6 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#C6F26B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">
                  {isBn ? 'বাংলা ও কণ্ঠে অনুসন্ধান' : 'Bengali & Voice Search'}
                </strong>
                <span>{isBn ? 'মুখের কথায় সহজে যেকোনো ওষুধ খুঁজুন।' : 'Search medicines by talking naturally in Bengali or English.'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-[12px] bg-white/6 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#C6F26B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">
                  {isBn ? 'ডিজিটাল প্রেসক্রিপশন লকার' : 'Digital Prescription Locker'}
                </strong>
                <span>{isBn ? 'পরিবারের সকলের প্রেসক্রিপশন নিরাপদে ক্লাউডে সংরক্ষিত।' : 'Safe, encrypted cloud storage for your family health records.'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
        {/* ========================================================== */}
        <section className="bg-white rounded-[20px] p-5 sm:p-6 border border-[#0E1A14]/8 shadow-card space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#003820]">
              <HelpCircle className="w-4 h-4 text-[#003820]" />
              {isBn ? 'সাধারণ প্রশ্নোত্তর' : 'Frequently Asked Questions'}
            </div>
            <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] tracking-tight text-[#0E1A14] mt-0.5">
              {isBn ? 'আপনার যেকোনো প্রশ্নের উত্তর' : 'Everything You Need to Know'}
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-[16px] border border-[#0E1A14]/8 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      haptic(8);
                      setExpandedFaq(isOpen ? -1 : index);
                    }}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 bg-[#F7F4EC]/60 hover:bg-[#F7F4EC] transition-colors"
                  >
                    <span className="font-bold text-[14px] sm:text-[15px] text-[#0E1A14] leading-snug">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#003820] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#5E6B63] shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 py-3 bg-white text-[13px] sm:text-[14px] leading-relaxed text-[#5E6B63] border-t border-[#0E1A14]/6"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================== */}
        {/* 8. FOOTER / HELP BAR */}
        {/* ========================================================== */}
        <footer className="pt-4 text-center space-y-3 text-[12px] text-[#5E6B63]">
          <div className="flex items-center justify-center gap-4 font-bold text-[#003820]">
            <Link to="/" className="hover:underline">
              {isBn ? 'স্টোর প্রিভিউ' : 'Store Catalog'}
            </Link>
            <span>•</span>
            <a href={`tel:${MEDIX_PHONE}`} className="hover:underline">
              {MEDIX_PHONE_DISPLAY}
            </a>
            <span>•</span>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
              WhatsApp Support
            </a>
          </div>
          <p>
            © 2026 Medix Delivery. {isBn ? 'সকল অধিকার সংরক্ষিত।' : 'All rights reserved.'}
            <br />
            {isBn
              ? 'সরকারি ড্রাগ লাইসেন্স ও নিয়মানুযায়ী ফার্মেসি থেকে সরাসরি সরবরাহকৃত।'
              : 'Delivered directly through licensed and verified retail partner pharmacies.'}
          </p>
        </footer>
      </main>

      {/* ========================================================== */}
      {/* 9. STICKY BOTTOM ACTION BAR (MOBILE & DESKTOP) */}
      {/* ========================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-[#F7F4EC] via-[#F7F4EC]/95 to-transparent backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {/* Call Button */}
          <a
            href={`tel:${MEDIX_PHONE}`}
            onClick={() => haptic(8)}
            className="flex-1 h-[52px] rounded-full bg-white border border-[#0E1A14]/12 text-[#0E1A14] font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-[0.96] transition-transform hover:bg-neutral-50"
          >
            <Phone className="w-4 h-4 text-[#003820]" />
            <span>{isBn ? 'কল করে অর্ডার' : 'Call to Order'}</span>
          </a>

          {/* WhatsApp Primary Order Button */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptic(12)}
            className="flex-[1.5] h-[52px] rounded-full bg-[#003820] text-white font-extrabold text-[13px] sm:text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-[#003820]/25 active:scale-[0.96] transition-transform hover:bg-[#002615]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366] shrink-0" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 12.99 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.48 11.14 9.6 11.01 9.73 10.89C9.84 10.78 9.98 10.6 10.1 10.45C10.22 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.6C10.27 9.48 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.35 9.01 7.34C8.86 7.33 8.7 7.33 8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.93 7.9 12.11 8.02 12.27C8.15 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.54C14.25 16.73 14.79 16.7 15.22 16.64C15.7 16.57 16.69 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99Z" />
            </svg>
            <span className="text-[#C6F26B]">{isBn ? 'হোয়াটসঅ্যাপে অর্ডার' : 'WhatsApp Order'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
