'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Lang } from '@/lib/tarot/types';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('th');
  
  const toggleLang = () => {
    setLang(prev => prev === 'th' ? 'en' : 'th');
  };
  
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();
  
  return (
    <button
      onClick={toggleLang}
      className="px-3 py-1 text-sm font-medium rounded-lg border border-amber-700/30 hover:bg-amber-900/20 transition-colors"
    >
      {lang === 'th' ? 'EN' : 'ไทย'}
    </button>
  );
}
