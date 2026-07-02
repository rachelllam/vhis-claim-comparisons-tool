// Lightweight bilingual (English / 繁體中文) layer — a React context + a typed
// string lookup, mirroring the OperationDataContext pattern. No i18n library:
// two languages, no plurals/ICU, and the surgery/plan content is already
// bilingual in data.ts, so a hand-rolled table keeps the single-file build lean
// and gives compile-time key checking for free.
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { STRINGS } from './strings';
import type { Lang, StringKey } from './strings';
import type { SurgeryCase, Ward } from './data';

export type { Lang, StringKey } from './strings';

const LANG_KEY = 'cc-lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LangCtx | null>(null);

// Default is 繁體中文 (Hong Kong customers + customer-facing WhatsApp output);
// staff can toggle to English and the choice is remembered.
function readInitial(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'zh') return v;
  } catch {
    /* private mode / storage disabled */
  }
  return 'zh';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = useCallback(() => setLang(lang === 'en' ? 'zh' : 'en'), [lang, setLang]);
  const t = useCallback((key: StringKey) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key, [lang]);
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}

// Pick the right field from an already-bilingual data object ({en, zh}). Falls
// back to the other language when the requested one is empty or the 'N/A'
// placeholder from data.ts, so Chinese-missing endpoint fields never render blank.
export function pick(obj: { en: string; zh: string }, lang: Lang): string {
  const primary = lang === 'zh' ? obj.zh : obj.en;
  const fallback = lang === 'zh' ? obj.en : obj.zh;
  if (primary && primary !== 'N/A') return primary;
  if (fallback && fallback !== 'N/A') return fallback;
  return 'N/A';
}

// Full case name in the current language (endpoint fills missing English with 'N/A').
export function pickCaseName(c: SurgeryCase, lang: Lang): string {
  return pick({ en: c.en, zh: c.zh }, lang);
}

// Short case name (falls back to the full name when no short name is available).
export function pickCaseShort(c: SurgeryCase, lang: Lang): string {
  const short = lang === 'zh' ? c.simpleZh : c.simple;
  if (short && short !== 'N/A') return short;
  return pickCaseName(c, lang);
}

// Ward class label in the current language.
export function wardLabel(ward: Ward, t: (key: StringKey) => string): string {
  return t(('ward.' + ward) as StringKey);
}
