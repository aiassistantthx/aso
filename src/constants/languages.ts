import { Language } from '../types';

export const APP_STORE_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English' },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English' },
  { code: 'en-CA', name: 'English (Canada)', nativeName: 'English' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-Hant', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ca-ES', name: 'Catalan', nativeName: 'Català' },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk' },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski' },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română' },
  { code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
];

export const getLanguageName = (code: string): string => {
  const lang = APP_STORE_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
};
