import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import amTranslation from './locales/am.json';
import enTranslation from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      am: { translation: amTranslation },
      en: { translation: enTranslation }
    },
    lng: 'am', // Default language is Amharic (am-ET) as per specification
    fallbackLng: 'am',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
