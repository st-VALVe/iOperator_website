import { useState, useEffect, useCallback } from 'react';
import { translations, getTranslation, type Language } from '../translations';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ru', 'tr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback(
    (key: string) => getTranslation(language, key as keyof typeof translations.en),
    [language]
  );

  return { language, setLanguage, t };
}
