import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

// Later you can add more languages like this:
// import in from './in.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      // in: { translation: in },
    },
    lng: Localization.getLocales()[0]?.languageCode, // Set the initial language from the device locale
    fallbackLng: 'en', // Fallback language if the device locale is not available
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;