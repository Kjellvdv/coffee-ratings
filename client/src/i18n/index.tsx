import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, LOCALES, type Lang, type TranslationKey } from './translations';

export type { Lang, TranslationKey };

const STORAGE_KEY = 'coffee-rater-lang';

type Vars = Record<string, string | number>;

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    // Storage blocked (private mode): fall through to the browser language
  }
  const browser = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase();
  return browser.startsWith('en') ? 'en' : 'es';
}

// Module-level copy of the language, for code outside React (fetch helpers,
// the error boundary). The provider keeps it in sync.
let currentLang: Lang = detectInitialLang();

export function getLang(): Lang {
  return currentLang;
}

function format(lang: Lang, key: TranslationKey, vars?: Vars): string {
  let text = translations[lang][key] ?? translations.es[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

/** Translate outside React, using the current language. */
export function translate(key: TranslationKey, vars?: Vars): string {
  return format(currentLang, key, vars);
}

type ValueGroup = 'roast' | 'process' | 'beans' | 'note' | 'profile';

interface I18nContextValue {
  lang: Lang;
  locale: string;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
  /** Display label for a value stored in Spanish; unknown values pass through. */
  tv: (group: ValueGroup, value: string | null | undefined) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLang);

  useEffect(() => {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = format(lang, 'app.title');
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Not persisted; the choice still holds for this visit
    }
  }, [lang]);

  const setLang = (next: Lang) => {
    currentLang = next;
    setLangState(next);
  };

  const t = (key: TranslationKey, vars?: Vars) => format(lang, key, vars);

  const tv = (group: ValueGroup, value: string | null | undefined) => {
    if (!value) return '';
    const key = `${group}.${value}` as TranslationKey;
    return key in translations[lang] ? format(lang, key) : value;
  };

  return (
    <I18nContext.Provider value={{ lang, locale: LOCALES[lang], setLang, t, tv }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
