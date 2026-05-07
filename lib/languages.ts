export const languages = {
  ar: {
    name: 'العربية',
    code: 'ar',
    flag: '🇸🇦'
  },
  zh: {
    name: '中文',
    code: 'zh',
    flag: '🇨🇳'
  },
  de: {
    name: 'Deutsch',
    code: 'de',
    flag: '🇩🇪'
  },
  en: {
    name: 'English',
    code: 'en',
    flag: '🇺🇸'
  },
  es: {
    name: 'Español',
    code: 'es',
    flag: '🇪🇸'
  },
  it: {
    name: 'Italiano',
    code: 'it',
    flag: '🇮🇹'
  },
  ja: {
    name: '日本語',
    code: 'ja',
    flag: '🇯🇵'
  },
  pt: {
    name: 'Português',
    code: 'pt',
    flag: '🇵🇹'
  },
  tr: {
    name: 'Türkçe',
    code: 'tr',
    flag: '🇹🇷'
  }
};

export type LanguageCode = keyof typeof languages;