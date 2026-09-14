import { createContext, useContext, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function detectBrowserLanguage() {
  try {
    const lang = (
      navigator.language ||
      navigator.userLanguage ||
      ''
    ).toLowerCase();
    if (lang.startsWith('tr')) {
      return 'tr';
    }
    return 'en';
  } catch (e) {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [languageMode, setLanguageModeState] = useState(() => {
    try {
      return localStorage.getItem('language_mode') || 'auto';
    } catch (e) {
      return 'auto';
    }
  });

  const [lang, setLangState] = useState(() => {
    try {
      const savedMode = localStorage.getItem('language_mode') || 'auto';
      if (savedMode === 'tr') return 'tr';
      if (savedMode === 'en') return 'en';
      return detectBrowserLanguage();
    } catch (e) {
      return detectBrowserLanguage();
    }
  });

  const setLanguageMode = (mode) => {
    setLanguageModeState(mode);
    try {
      localStorage.setItem('language_mode', mode);
    } catch (e) {
      console.error('Failed to save language mode:', e);
    }

    if (mode === 'tr') {
      setLangState('tr');
    } else if (mode === 'en') {
      setLangState('en');
    } else {
      setLangState(detectBrowserLanguage());
    }
  };

  const setLang = (newLang) => {
    setLangState(newLang);
  };

  const t = (key, params = {}) => {
    const dict = translations[lang] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    // Support parametric replacements e.g. {query}
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{ lang, languageMode, setLanguageMode, setLang, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
