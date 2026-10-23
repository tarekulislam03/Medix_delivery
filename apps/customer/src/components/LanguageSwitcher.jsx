import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES, useLangStore } from '../lib/i18n';

export default function LanguageSwitcher() {
  const location = useLocation();
  const isBabyCare = location.pathname.startsWith('/baby-care');
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Close on outside press / Escape
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={`h-7 pl-1.5 pr-1 rounded-full flex items-center gap-1 text-[11px] font-semibold active:scale-95 transition-all touch-manipulation cursor-pointer ${
          isBabyCare
            ? 'text-[#88304E] bg-[#FBEAEE] border border-[#CE6A85]/35 hover:bg-[#F9E5EA]'
            : 'text-emerald-800 bg-emerald-50 border border-emerald-700/20 hover:bg-emerald-100/70'
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.short}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1.5 min-w-[120px] z-50 py-1 rounded-xl bg-white/90 backdrop-blur-2xl saturate-[190%] border border-black/[0.06] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === lang}>
              <button
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-between gap-3 text-xs font-medium text-gray-800 cursor-pointer touch-manipulation transition-colors ${
                  isBabyCare
                    ? 'hover:bg-[#FDF2F4] active:bg-[#FBEAEE]'
                    : 'hover:bg-emerald-50 active:bg-emerald-100'
                }`}
              >
                <span>{l.label}</span>
                {l.code === lang && (
                  <Check
                    className={`w-3.5 h-3.5 ${isBabyCare ? 'text-[#BF5B76]' : 'text-emerald-600'}`}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
