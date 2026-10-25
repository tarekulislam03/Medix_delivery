import React, { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES, useLangStore } from '../lib/i18n';

export default function LanguageSwitcher({ variant = 'dark' }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const btnClasses =
    variant === 'dark'
      ? 'bg-white/12 hover:bg-white/18 text-white'
      : 'bg-[#EFEAD8] text-[#0E1A14]';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={`h-[38px] px-3 rounded-[999px] flex items-center gap-1 text-[13px] font-bold transition-transform duration-150 active:scale-[0.96] touch-manipulation cursor-pointer ${btnClasses}`}
      >
        <Globe className="w-3.5 h-3.5 stroke-[2.2] opacity-85" />
        <span>{current.short}</span>
        <ChevronDown
          className={`w-3 h-3 stroke-[2.2] opacity-80 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          style={{
            boxShadow: '0 12px 32px -8px rgba(0, 56, 32, 0.22)',
          }}
          className="absolute right-0 top-full mt-2 min-w-[136px] z-50 py-1.5 rounded-[16px] bg-white overflow-hidden"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === lang}>
              <button
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className="w-full min-h-[42px] px-4 flex items-center justify-between gap-3 text-[14px] font-medium text-[#0E1A14] hover:bg-[#F7F4EC] active:bg-[#EFEAD8] cursor-pointer touch-manipulation"
              >
                <span>{l.label}</span>
                {l.code === lang && (
                  <Check className="w-4 h-4 text-[#003820] stroke-[2.5]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
