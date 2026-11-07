import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'am' ? 'en' : 'am';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold-500/40 bg-navy-800 text-gold-400 hover:bg-navy-700 hover:text-gold-300 transition-colors text-sm font-medium"
      title="ቋንቋ ቀይር / Switch Language"
    >
      <Globe className="w-4 h-4 text-gold-400" />
      <span>{i18n.language === 'am' ? 'English' : 'አማርኛ'}</span>
    </button>
  );
};
