import { create } from 'zustand';
import type { Locale, TranslationSchema } from '../i18n/translationSchema';
import { en } from '../i18n/locales/en';
import { fr } from '../i18n/locales/fr';

interface LocaleState {
  locale: Locale;
  t: TranslationSchema;
  setLocale: (locale: Locale) => void;
}

const translations: Record<Locale, TranslationSchema> = { en, fr };

const getInitialLocale = (): Locale => {
  const saved = localStorage.getItem('zikstock_language') as Locale | null;
  if (saved === 'en' || saved === 'fr') return saved;
  const browserLang = navigator.language || 'en';
  return browserLang.startsWith('fr') ? 'fr' : 'en';
};

const initialLocale = getInitialLocale();

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initialLocale,
  t: translations[initialLocale],
  setLocale: (locale: Locale) => {
    localStorage.setItem('zikstock_language', locale);
    set({ locale, t: translations[locale] });
  },
}));
