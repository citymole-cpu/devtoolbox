import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from './I18nProvider';
import { Language } from '../lib/i18n';
import { Languages, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const langOptions: { id: Language; label: string; enLabel: string; flag: string }[] = [
    { id: 'zh-CN', label: '简体中文', enLabel: 'Simplified Chinese', flag: '🇨🇳' },
    { id: 'en-US', label: 'English', enLabel: 'US English', flag: '🇺🇸' },
    { id: 'ja-JP', label: '日本語', enLabel: 'Japanese', flag: '🇯🇵' },
  ];

  const currentOption = langOptions.find(o => o.id === language) || langOptions[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
        title={t.languageSelect}
      >
        <span className="text-sm">{currentOption.flag}</span>
        <span className="hidden sm:inline font-mono">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1.5 shadow-xl z-50 animate-fade-in text-xs">
          <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800 mb-1">
            {t.languageSelect}
          </div>
          <div className="space-y-0.5">
            {langOptions.map(opt => {
              const active = opt.id === language;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setLanguage(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{opt.flag}</span>
                    <div className="text-left">
                      <div>{opt.label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                        {opt.enLabel}
                      </div>
                    </div>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

