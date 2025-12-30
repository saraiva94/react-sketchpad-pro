import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Language, Translations } from '@/lib/i18n';


interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred-language';

const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'pt') return 'pt';
  if (browserLang === 'es') return 'es';
  if (browserLang === 'en') return 'en';
  return 'pt'; // default
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'pt' || stored === 'en' || stored === 'es')) {
      return stored as Language;
    }
    return detectBrowserLanguage();
  });

  const setLanguage = useCallback((lang: Language) => {
    // Manter cache para que a troca de idioma seja instantânea e consistente
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);


  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
