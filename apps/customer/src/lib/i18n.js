import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BN } from './bn';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'bn', label: 'বাংলা', short: 'বাং' },
];

export const useLangStore = create(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => {
        document.documentElement.lang = lang;
        set({ lang });
      },
    }),
    {
      name: 'medix-lang',
      onRehydrateStorage: () => (state) => {
        if (state?.lang) document.documentElement.lang = state.lang;
      },
    }
  )
);

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Convert western digits in a string/number to Bengali digits. */
export const toBnDigits = (value) =>
  String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

const RAW_VARS = new Set(['q', 'landmark', 'pin', 'method']);

/**
 * Translate an English source string. Falls back to the English text when
 * no Bengali entry exists (so database content like medicine names or
 * addresses is never altered). Supports {placeholders} via vars.
 */
export function translate(lang, text, vars) {
  const bn = lang === 'bn' ? BN[text] : undefined;
  let out = bn || text;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      const val = bn && !RAW_VARS.has(k) ? toBnDigits(v) : String(v);
      out = out.split(`{${k}}`).join(val);
    }
  }
  return out;
}

/** Locale-aware number (digits only) for the active language. */
export const formatNum = (lang, value) =>
  lang === 'bn' ? toBnDigits(value) : String(value);

/** React hook: const t = useT(); t('Search'); t.num(5) */
export function useT() {
  const lang = useLangStore((s) => s.lang);
  const t = (text, vars) => translate(lang, text, vars);
  t.num = (value) => formatNum(lang, value);
  t.lang = lang;
  return t;
}
