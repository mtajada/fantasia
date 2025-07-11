/**
 * Language System Types
 * 
 * Comprehensive TypeScript types for the multi-language support system
 * supporting English, Spanish, French, German, and Italian.
 */

// ===========================================
// SUPPORTED LANGUAGES
// ===========================================

/**
 * Supported language codes using ISO 639-1 standard
 */
export type SupportedLanguages = 'en' | 'es' | 'fr' | 'de' | 'it';

/**
 * Language configuration object
 */
export interface Language {
  /** Language code (ISO 639-1) */
  value: SupportedLanguages;
  /** Display name in the target language */
  label: string;
  /** Flag emoji for visual representation */
  flag: string;
  /** Optional: Full country/region name */
  region?: string;
  /** Optional: RTL (Right-to-Left) support */
  rtl?: boolean;
}

/**
 * Complete language definitions matching ProfileConfigPage implementation
 */
export const SUPPORTED_LANGUAGES: readonly Language[] = [
  { value: 'en', label: 'English', flag: '🇺🇸', region: 'United States' },
  { value: 'es', label: 'Español', flag: '🇪🇸', region: 'Spain' },
  { value: 'fr', label: 'Français', flag: '🇫🇷', region: 'France' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪', region: 'Germany' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹', region: 'Italy' }
] as const;

// ===========================================
// TRANSLATION SYSTEM
// ===========================================

/**
 * Translation function type for type-safe translations
 */
export type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Translation key structure for nested translations
 */
export type TranslationKey = string;

/**
 * Translation dictionary structure
 */
export type TranslationDictionary = Record<string, string | Record<string, string>>;

/**
 * Complete translation set for all supported languages
 */
export type TranslationSet = Record<SupportedLanguages, TranslationDictionary>;

// ===========================================
// LANGUAGE CONTEXT
// ===========================================

/**
 * Language context state and methods
 */
export interface LanguageContextType {
  /** Current active language */
  currentLanguage: SupportedLanguages;
  
  /** Available languages */
  availableLanguages: readonly Language[];
  
  /** Change the current language */
  changeLanguage: (language: SupportedLanguages) => void;
  
  /** Get language configuration by code */
  getLanguage: (code: SupportedLanguages) => Language | undefined;
  
  /** Translation function */
  t: TranslationFunction;
  
  /** Check if language is supported */
  isSupported: (code: string) => code is SupportedLanguages;
  
  /** Get user's preferred language from profile */
  getUserLanguage: () => Promise<SupportedLanguages>;
  
  /** Update user's language preference */
  updateUserLanguage: (language: SupportedLanguages) => Promise<void>;
  
  /** Loading state for language operations */
  isLoading: boolean;
}

// ===========================================
// LANGUAGE PROVIDER PROPS
// ===========================================

/**
 * Props for the LanguageProvider component
 */
export interface LanguageProviderProps {
  /** Child components */
  children: React.ReactNode;
  
  /** Default language if user has no preference */
  defaultLanguage?: SupportedLanguages;
  
  /** Enable automatic language detection from browser */
  enableAutoDetection?: boolean;
  
  /** Enable localStorage persistence */
  enablePersistence?: boolean;
}

// ===========================================
// LANGUAGE DETECTION
// ===========================================

/**
 * Browser language detection configuration
 */
export interface LanguageDetectionConfig {
  /** Check navigator.language */
  checkNavigatorLanguage: boolean;
  
  /** Check localStorage */
  checkLocalStorage: boolean;
  
  /** Check user profile from Supabase */
  checkUserProfile: boolean;
  
  /** Fallback language if no detection succeeds */
  fallbackLanguage: SupportedLanguages;
}

// ===========================================
// STORY GENERATION LANGUAGE SUPPORT
// ===========================================

/**
 * Language-specific story generation settings
 */
export interface StoryLanguageConfig {
  /** Language code */
  language: SupportedLanguages;
  
  /** Default content for empty stories */
  defaultContent: string;
  
  /** Default title for empty stories */
  defaultTitle: string;
  
  /** Default chapter title format */
  defaultChapterTitle: string;
  
  /** Error messages in the target language */
  errorMessages: {
    generationFailed: string;
    contentEmpty: string;
    titleEmpty: string;
  };
  
  /** Language-specific prompt templates */
  promptTemplates: {
    systemPrompt: string;
    storyGeneration: string;
    storyContinuation: string;
  };
}

// ===========================================
// UTILITY TYPES
// ===========================================

/**
 * Language-aware component props
 */
export interface LanguageAwareProps {
  /** Override language for this component */
  language?: SupportedLanguages;
}

/**
 * Language preference from user profile
 */
export interface UserLanguagePreference {
  /** User's preferred language */
  language: SupportedLanguages;
  
  /** When the preference was last updated */
  updatedAt: string;
}

/**
 * Language validation result
 */
export interface LanguageValidationResult {
  /** Whether the language is valid */
  isValid: boolean;
  
  /** The validated language code */
  language: SupportedLanguages;
  
  /** Whether fallback was used */
  usedFallback: boolean;
}

// ===========================================
// LANGUAGE HOOKS
// ===========================================

/**
 * Return type for useLanguage hook
 */
export interface UseLanguageReturn {
  /** Current language */
  language: SupportedLanguages;
  
  /** Available languages */
  languages: readonly Language[];
  
  /** Change language function */
  changeLanguage: (language: SupportedLanguages) => void;
  
  /** Translation function */
  t: TranslationFunction;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
}

/**
 * Return type for useLanguageDetection hook
 */
export interface UseLanguageDetectionReturn {
  /** Detected language */
  detectedLanguage: SupportedLanguages | null;
  
  /** Detection method used */
  detectionMethod: 'browser' | 'localStorage' | 'userProfile' | 'fallback' | null;
  
  /** Whether detection is complete */
  isDetectionComplete: boolean;
  
  /** Detection confidence score (0-1) */
  confidence: number;
}

// ===========================================
// CONSTANTS
// ===========================================

/**
 * Default language settings
 */
export const LANGUAGE_DEFAULTS = {
  /** Default language code */
  DEFAULT_LANGUAGE: 'en' as const,
  
  /** LocalStorage key for language preference */
  STORAGE_KEY: 'fantasia-language-preference',
  
  /** Cookie name for language preference */
  COOKIE_NAME: 'fantasia-lang',
  
  /** Cookie expiration in days */
  COOKIE_EXPIRATION: 365,
} as const;

/**
 * Language-specific configurations
 */
export const LANGUAGE_CONFIGS: Record<SupportedLanguages, Partial<StoryLanguageConfig>> = {
  en: {
    language: 'en',
    defaultContent: 'Story content will appear here...',
    defaultTitle: 'Untitled Story',
    defaultChapterTitle: 'Chapter {number}',
  },
  es: {
    language: 'es',
    defaultContent: 'El contenido de la historia aparecerá aquí...',
    defaultTitle: 'Historia sin título',
    defaultChapterTitle: 'Capítulo {number}',
  },
  fr: {
    language: 'fr',
    defaultContent: 'Le contenu de l\'histoire apparaîtra ici...',
    defaultTitle: 'Histoire sans titre',
    defaultChapterTitle: 'Chapitre {number}',
  },
  de: {
    language: 'de',
    defaultContent: 'Geschichtsinhalt wird hier angezeigt...',
    defaultTitle: 'Unbenannte Geschichte',
    defaultChapterTitle: 'Kapitel {number}',
  },
  it: {
    language: 'it',
    defaultContent: 'Il contenuto della storia apparirà qui...',
    defaultTitle: 'Storia senza titolo',
    defaultChapterTitle: 'Capitolo {number}',
  },
} as const;

// ===========================================
// TYPE GUARDS
// ===========================================

/**
 * Type guard to check if a string is a supported language
 */
export function isSupportedLanguage(code: string): code is SupportedLanguages {
  return ['en', 'es', 'fr', 'de', 'it'].includes(code);
}

/**
 * Type guard to check if a language object is valid
 */
export function isValidLanguage(obj: any): obj is Language {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    isSupportedLanguage(obj.value) &&
    typeof obj.label === 'string' &&
    typeof obj.flag === 'string'
  );
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get language configuration by code
 */
export function getLanguageConfig(code: SupportedLanguages): Language {
  return SUPPORTED_LANGUAGES.find(lang => lang.value === code) || SUPPORTED_LANGUAGES[0];
}

/**
 * Validate and normalize language code
 */
export function validateLanguageCode(code: string): LanguageValidationResult {
  if (isSupportedLanguage(code)) {
    return {
      isValid: true,
      language: code,
      usedFallback: false,
    };
  }
  
  return {
    isValid: false,
    language: LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE,
    usedFallback: true,
  };
}

/**
 * Get browser language preference
 */
export function getBrowserLanguage(): SupportedLanguages {
  if (typeof navigator === 'undefined') {
    return LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;
  }
  
  const browserLang = navigator.language.split('-')[0];
  return isSupportedLanguage(browserLang) ? browserLang : LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;
}