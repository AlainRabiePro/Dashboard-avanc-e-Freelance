'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define available languages
export const availableLanguages = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
};
export type Language = keyof typeof availableLanguages;

// Define the shape of the context
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  translations: Record<string, any>;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested values from an object using a dot-separated key
const getNestedTranslation = (translations: Record<string, any>, key: string): string => {
  return key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : key, translations);
};

// Create the provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && availableLanguages[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const translationsModule = await import(`@/locales/${language}.json`);
        setTranslations(translationsModule.default);
      } catch (error) {
        console.error(`Could not load translations for ${language}`, error);
        // Fallback to English
        const fallbackModule = await import(`@/locales/en.json`);
        setTranslations(fallbackModule.default);
      }
    };
    fetchTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };
  
  const t = useCallback((key: string): string => {
    return getNestedTranslation(translations, key);
  }, [translations]);


  const value = { language, setLanguage, t, translations };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
