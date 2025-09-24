import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonEn from '../locales/en/common.json';
import pharmacyEn from '../locales/en/pharmacy.json';

// Define resources
const resources = {
  en: {
    common: commonEn,
    pharmacy: pharmacyEn,
  },
};

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en', // fallback language

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'pharmacy'],

    // Interpolation configuration
    interpolation: {
      escapeValue: false, // react already does escaping
    },

    // React configuration
    react: {
      useSuspense: false, // disable suspense for SSR compatibility
    },

    // Debug configuration
    debug: import.meta.env.DEV,

    // Load configuration
    load: 'languageOnly', // remove region code from language (e.g., 'en-US' becomes 'en')

    // Detection configuration
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag'],

      // keys or params to lookup language from
      lookupLocalStorage: 'curex40-language',

      // cache user language on
      caches: ['localStorage'],

      // only detect languages that are in the whitelist
      checkWhitelist: true,
    },

    // Whitelist of supported languages
    supportedLngs: ['en'],

    // Remove console warnings about missing translations in production
    missingKeyHandler: (lng, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation: ${lng}:${ns}:${key}`);
      }
    },

    // Custom key separator (default is '.')
    keySeparator: '.',

    // Custom namespace separator (default is ':')
    nsSeparator: ':',

    // Pluralization configuration
    pluralSeparator: '_',
    contextSeparator: '_',

    // Postprocessor configuration
    postProcess: false,

    // Return objects instead of strings for complex structures
    returnObjects: false,

    // Return empty string for missing keys instead of the key itself
    returnEmptyString: false,

    // Return null for missing keys
    returnNull: false,

    // Join arrays with this separator when returning them as strings
    joinArrays: false,

    // Override options
    overloadTranslationOptionHandler: (args: string[]) => ({
      defaultValue: args[1],
    }),
  });

// Add custom formatting functions
i18n.services.formatter?.add('currency', (value: number, lng: string | undefined, options: any) => {
  const currency = options.currency || 'USD';
  const locale = lng || 'en';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
});

i18n.services.formatter?.add('date', (value: string | Date, lng: string | undefined, options: any) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const locale = lng || 'en';
  const formatOptions = {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
    ...options,
  };
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
});

i18n.services.formatter?.add('time', (value: string | Date, lng: string | undefined, options: any) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const locale = lng || 'en';
  const formatOptions = {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    ...options,
  };
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
});

i18n.services.formatter?.add('relative', (value: string | Date, lng: string | undefined) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const locale = lng || 'en';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const now = new Date();
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;

  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(Math.round(diffInDays), 'day');
  } else if (Math.abs(diffInHours) >= 1) {
    return rtf.format(Math.round(diffInHours), 'hour');
  } else if (Math.abs(diffInMinutes) >= 1) {
    return rtf.format(Math.round(diffInMinutes), 'minute');
  } else {
    return rtf.format(Math.round(diffInSeconds), 'second');
  }
});

export default i18n;

// Export type for better TypeScript support
export type I18nKeys = {
  common: keyof typeof commonEn;
  pharmacy: keyof typeof pharmacyEn;
};

// Helper function to change language
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('curex40-language', lng);
};

// Helper function to get current language
export const getCurrentLanguage = () => i18n.language;

// Helper function to get supported languages
export const getSupportedLanguages = () => i18n.options.supportedLngs || ['en'];
