import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationDictionary, toolTranslations } from '../lib/i18n';
import { CategoryInfo, ToolInfo } from '../lib/toolRegistry';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  getCategoryName: (cat: CategoryInfo) => string;
  getToolName: (tool: ToolInfo) => string;
  getToolDesc: (tool: ToolInfo) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'devtoolbox_language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && (saved === 'zh-CN' || saved === 'en-US' || saved === 'ja-JP')) {
      return saved;
    }
    // Auto-detect browser language
    const navLang = navigator.language;
    if (navLang.startsWith('en')) return 'en-US';
    if (navLang.startsWith('ja')) return 'ja-JP';
    return 'zh-CN';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  // 动态映射分类名称
  const getCategoryName = (cat: CategoryInfo): string => {
    switch (cat.id) {
      case 'json': return t.catJson;
      case 'convert': return t.catConvert;
      case 'net': return t.catNet;
      case 'encode': return t.catEncode;
      case 'crypto': return t.catCrypto;
      case 'format': return t.catFormat;
      case 'css': return t.catCss;
      case 'text': return t.catText;
      case 'media': return t.catImage;
      case 'ref': return t.catRef;
      case 'misc': return t.catMisc;
      default: return cat.name;
    }
  };

  // 动态映射工具名称
  const getToolName = (tool: ToolInfo): string => {
    if (language === 'zh-CN') return tool.name;
    const trans = toolTranslations[language]?.[tool.id];
    return trans?.name || tool.name;
  };

  // 动态映射工具描述
  const getToolDesc = (tool: ToolInfo): string => {
    if (language === 'zh-CN') return tool.description;
    const trans = toolTranslations[language]?.[tool.id];
    return trans?.description || tool.description;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getCategoryName,
        getToolName,
        getToolDesc
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

