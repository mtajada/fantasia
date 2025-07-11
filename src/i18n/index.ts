/**
 * i18n Configuration and Utilities
 * 
 * Main internationalization configuration for the Fantasia application.
 * Provides translation loading, language detection, and utility functions.
 */

import { SupportedLanguages, SUPPORTED_LANGUAGES, LANGUAGE_DEFAULTS } from '@/types/language';

// ===========================================
// TRANSLATION LOADING
// ===========================================

/**
 * Translation dictionaries type
 */
export type TranslationDictionary = Record<string, any>;

/**
 * Translation set for all supported languages
 */
export type TranslationSet = Record<SupportedLanguages, TranslationDictionary>;

/**
 * Cache for loaded translations
 */
const translationCache = new Map<SupportedLanguages, TranslationDictionary>();

/**
 * Load translations for a specific language
 * @param language - Language code to load
 * @returns Promise resolving to translation dictionary
 */
export const loadTranslations = async (language: SupportedLanguages): Promise<TranslationDictionary> => {
  // Check cache first
  if (translationCache.has(language)) {
    return translationCache.get(language)!;
  }

  try {
    let translations: TranslationDictionary;
    
    // Dynamic import based on language
    switch (language) {
      case 'en':
        translations = (await import('./translations/en.json')).default;
        break;
      case 'es':
        translations = (await import('./translations/es.json')).default;
        break;
      case 'fr':
        translations = (await import('./translations/fr.json')).default;
        break;
      case 'de':
        translations = (await import('./translations/de.json')).default;
        break;
      case 'it':
        translations = (await import('./translations/it.json')).default;
        break;
      default:
        // Fallback to English
        translations = (await import('./translations/en.json')).default;
        break;
    }

    // Cache the loaded translations
    translationCache.set(language, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for language: ${language}`, error);
    
    // Fallback to English if not already trying English
    if (language !== 'en') {
      return loadTranslations('en');
    }
    
    throw error;
  }
};

/**
 * Load all translations for supported languages
 * @returns Promise resolving to complete translation set
 */
export const loadAllTranslations = async (): Promise<TranslationSet> => {
  const translations: Partial<TranslationSet> = {};
  
  for (const lang of SUPPORTED_LANGUAGES) {
    try {
      translations[lang.value] = await loadTranslations(lang.value);
    } catch (error) {
      console.error(`Failed to load translations for ${lang.value}:`, error);
    }
  }
  
  return translations as TranslationSet;
};

// ===========================================
// LANGUAGE DETECTION
// ===========================================

/**
 * Language detection configuration
 */
export interface LanguageDetectionConfig {
  checkNavigatorLanguage: boolean;
  checkLocalStorage: boolean;
  checkUserProfile: boolean;
  fallbackLanguage: SupportedLanguages;
}

/**
 * Default language detection configuration
 */
export const DEFAULT_DETECTION_CONFIG: LanguageDetectionConfig = {
  checkNavigatorLanguage: true,
  checkLocalStorage: true,
  checkUserProfile: true,
  fallbackLanguage: LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE,
};

/**
 * Detect language from browser
 * @returns Detected language code or null
 */
export const detectBrowserLanguage = (): SupportedLanguages | null => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = SUPPORTED_LANGUAGES.map(lang => lang.value);
  
  if (supportedLanguages.includes(browserLang as SupportedLanguages)) {
    return browserLang as SupportedLanguages;
  }
  
  return null;
};

/**
 * Detect language from localStorage
 * @returns Stored language code or null
 */
export const detectStoredLanguage = (): SupportedLanguages | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_DEFAULTS.STORAGE_KEY);
    if (stored) {
      const supportedLanguages = SUPPORTED_LANGUAGES.map(lang => lang.value);
      if (supportedLanguages.includes(stored as SupportedLanguages)) {
        return stored as SupportedLanguages;
      }
    }
  } catch (error) {
    console.error('Failed to read language from localStorage:', error);
  }
  
  return null;
};

/**
 * Store language preference in localStorage
 * @param language - Language code to store
 */
export const storeLanguagePreference = (language: SupportedLanguages): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LANGUAGE_DEFAULTS.STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to store language preference:', error);
  }
};

/**
 * Detect language using multiple sources
 * @param config - Detection configuration
 * @returns Promise resolving to detected language
 */
export const detectLanguage = async (
  config: LanguageDetectionConfig = DEFAULT_DETECTION_CONFIG
): Promise<SupportedLanguages> => {
  // 1. Check localStorage if enabled
  if (config.checkLocalStorage) {
    const stored = detectStoredLanguage();
    if (stored) {
      return stored;
    }
  }

  // 2. Check browser language if enabled
  if (config.checkNavigatorLanguage) {
    const browser = detectBrowserLanguage();
    if (browser) {
      return browser;
    }
  }

  // 3. Use fallback language
  return config.fallbackLanguage;
};

// ===========================================
// TRANSLATION UTILITIES
// ===========================================

/**
 * Translation function type
 */
export type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Get nested value from object using dot notation
 * @param obj - Object to search
 * @param path - Dot notation path
 * @returns Value at path or undefined
 */
const getNestedValue = (obj: any, path: string): any => {
  // Defensive programming: handle null/undefined paths
  if (!path || typeof path !== 'string') {
    console.warn('getNestedValue called with invalid path:', path);
    return undefined;
  }
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Replace parameters in translation string
 * @param text - Text with parameter placeholders
 * @param params - Parameters to replace
 * @returns Text with parameters replaced
 */
const replaceParams = (text: string, params: Record<string, string | number>): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
};

/**
 * Create translation function for a specific language
 * @param translations - Translation dictionary
 * @param fallbackTranslations - Fallback translation dictionary
 * @returns Translation function
 */
export const createTranslationFunction = (
  translations: TranslationDictionary,
  fallbackTranslations?: TranslationDictionary
): TranslationFunction => {
  return (key: string, params?: Record<string, string | number>) => {
    // Defensive check for null/undefined keys
    if (!key) {
      console.error('Translation called with null/undefined key:', key);
      return 'MISSING_KEY';
    }
    
    // Try to get translation from primary dictionary
    let translation = getNestedValue(translations, key);
    
    // If not found and fallback provided, try fallback
    if (translation === undefined && fallbackTranslations) {
      translation = getNestedValue(fallbackTranslations, key);
    }
    
    // If still not found, return the key as fallback
    if (translation === undefined) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // If translation is not a string, return the key
    if (typeof translation !== 'string') {
      console.warn(`Translation for key ${key} is not a string:`, translation);
      return key;
    }
    
    // Replace parameters if provided
    if (params) {
      return replaceParams(translation, params);
    }
    
    return translation;
  };
};

// ===========================================
// LANGUAGE CONFIGURATION
// ===========================================

/**
 * Get supported languages configuration
 * @returns Array of supported languages
 */
export const getSupportedLanguages = () => {
  return SUPPORTED_LANGUAGES;
};

/**
 * Check if language is supported
 * @param language - Language code to check
 * @returns True if supported, false otherwise
 */
export const isLanguageSupported = (language: string): language is SupportedLanguages => {
  return SUPPORTED_LANGUAGES.some(lang => lang.value === language);
};

/**
 * Get language configuration by code
 * @param code - Language code
 * @returns Language configuration or undefined
 */
export const getLanguageConfig = (code: string) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.value === code);
};

/**
 * Validate and normalize language code
 * @param code - Language code to validate
 * @returns Normalized language code
 */
export const normalizeLanguageCode = (code: string): SupportedLanguages => {
  if (isLanguageSupported(code)) {
    return code;
  }
  
  // Try to match by prefix (e.g., 'en-US' -> 'en')
  const prefix = code.split('-')[0];
  if (isLanguageSupported(prefix)) {
    return prefix;
  }
  
  // Return default language as fallback
  return LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;
};

// ===========================================
// CACHE MANAGEMENT
// ===========================================

/**
 * Clear translation cache
 */
export const clearTranslationCache = (): void => {
  translationCache.clear();
};

/**
 * Get cache size
 * @returns Number of cached languages
 */
export const getCacheSize = (): number => {
  return translationCache.size;
};

/**
 * Check if language is cached
 * @param language - Language code to check
 * @returns True if cached, false otherwise
 */
export const isLanguageCached = (language: SupportedLanguages): boolean => {
  return translationCache.has(language);
};

// ===========================================
// EXPORTS
// ===========================================

// Re-export types from language.ts
export type {
  SupportedLanguages,
  Language,
  LanguageContextType,
  LanguageProviderProps,
  UseLanguageReturn,
  TranslationKey,
} from '@/types/language';

// Export constants
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_DEFAULTS,
  getBrowserLanguage,
  isSupportedLanguage,
  validateLanguageCode,
} from '@/types/language';

// Export translation utilities
export { createTranslationFunction as createT };

// Default export for main configuration
export default {
  loadTranslations,
  loadAllTranslations,
  detectLanguage,
  createTranslationFunction,
  getSupportedLanguages,
  isLanguageSupported,
  getLanguageConfig,
  normalizeLanguageCode,
  storeLanguagePreference,
  clearTranslationCache,
  DEFAULT_DETECTION_CONFIG,
};