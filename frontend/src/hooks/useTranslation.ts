import { useLocaleStore } from '../store/localeStore';

export const useTranslation = () => {
  const { locale, t, setLocale } = useLocaleStore();
  return { locale, t, setLocale };
};
