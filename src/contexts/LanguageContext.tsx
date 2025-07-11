import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { 
  LanguageContextType, 
  SupportedLanguages, 
  SUPPORTED_LANGUAGES,
  TranslationFunction 
} from '../types/language';
import { 
  loadTranslations, 
  createTranslationFunction, 
  LANGUAGE_DEFAULTS 
} from '../i18n';
import { getBrowserLanguage } from '../types/language';

// Create Context
const LanguageContext = createContext<LanguageContextType | null>(null);

// Provider Props
interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguages;
}

// Provider Component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  initialLanguage 
}) => {
  // State
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(
    initialLanguage || LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [translationFunction, setTranslationFunction] = useState<TranslationFunction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cache for loaded translations
  const [translationCache, setTranslationCache] = useState<Map<string, any>>(new Map());

  // Get current user
  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }, []);

  // Load user language preference from Supabase
  const loadUserLanguage = useCallback(async (): Promise<SupportedLanguages> => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        // No user - use browser language or default
        const browserLang = getBrowserLanguage();
        return browserLang || LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('language')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user language:', error);
        return LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;
      }

      const userLang = data?.language as SupportedLanguages;
      return SUPPORTED_LANGUAGES.find(lang => lang.value === userLang)?.value || LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Error in loadUserLanguage:', error);
      return LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;
    }
  }, [getCurrentUser]);

  // Save language to Supabase
  const saveLanguageToSupabase = useCallback(async (language: SupportedLanguages): Promise<void> => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        // No user - save to localStorage only
        localStorage.setItem('fantasia-language', language);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          language: language
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving language to Supabase:', error);
        throw error;
      }

      // Also save to localStorage for faster access
      localStorage.setItem('fantasia-language', language);
    } catch (error) {
      console.error('Error in saveLanguageToSupabase:', error);
      throw error;
    }
  }, [getCurrentUser]);

  // Load translations for a specific language
  const loadLanguageTranslations = useCallback(async (language: SupportedLanguages) => {
    try {
      // Check cache first
      if (translationCache.has(language)) {
        return translationCache.get(language);
      }

      // Load from i18n system
      const translations = await loadTranslations(language);
      
      // Cache the translations
      setTranslationCache(prev => new Map(prev).set(language, translations));
      
      return translations;
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error);
      // Return empty object as fallback
      return {};
    }
  }, [translationCache]);

  // Change language function
  const changeLanguage = useCallback(async (newLanguage: SupportedLanguages): Promise<void> => {
    if (newLanguage === currentLanguage) return;

    setIsChanging(true);
    setError(null);

    try {
      // Load translations for new language
      const translations = await loadLanguageTranslations(newLanguage);
      
      // Create translation function
      const newTranslationFunction = createTranslationFunction(translations);
      
      // Save to Supabase
      await saveLanguageToSupabase(newLanguage);
      
      // Update state
      setCurrentLanguage(newLanguage);
      setTranslationFunction(newTranslationFunction);

      console.log(`Language changed to: ${newLanguage}`);
    } catch (error) {
      console.error('Error changing language:', error);
      setError(error instanceof Error ? error.message : 'Failed to change language');
      throw error;
    } finally {
      setIsChanging(false);
    }
  }, [currentLanguage, loadLanguageTranslations, saveLanguageToSupabase]);

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check localStorage first for faster loading
        const cachedLanguage = localStorage.getItem('fantasia-language') as SupportedLanguages;
        let targetLanguage = initialLanguage || LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE;

        if (cachedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.value === cachedLanguage)) {
          targetLanguage = cachedLanguage;
        } else {
          // Load from user profile
          targetLanguage = await loadUserLanguage();
        }

        // Load translations
        const translations = await loadLanguageTranslations(targetLanguage);
        
        // Create translation function
        const newTranslationFunction = createTranslationFunction(translations);
        
        // Update state
        setCurrentLanguage(targetLanguage);
        setTranslationFunction(newTranslationFunction);

        console.log(`Language initialized: ${targetLanguage}`);
      } catch (error) {
        console.error('Error initializing language:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize language');
        
        // Fallback to default language
        try {
          const fallbackTranslations = await loadLanguageTranslations(LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE);
          const fallbackFunction = createTranslationFunction(fallbackTranslations);
          setCurrentLanguage(LANGUAGE_DEFAULTS.DEFAULT_LANGUAGE);
          setTranslationFunction(fallbackFunction);
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [initialLanguage, loadUserLanguage, loadLanguageTranslations]);

  // Listen for auth changes to reload language
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - reload their language preference
        try {
          const userLanguage = await loadUserLanguage();
          if (userLanguage !== currentLanguage) {
            await changeLanguage(userLanguage);
          }
        } catch (error) {
          console.error('Error reloading language after auth change:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out - keep current language but clear cache
        localStorage.removeItem('fantasia-language');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentLanguage, loadUserLanguage, changeLanguage]);

  // Default translation function fallback
  const defaultTranslationFunction: TranslationFunction = useCallback((key: string, params?: Record<string, any>) => {
    console.warn(`Translation function not ready, key: ${key}`);
    return key;
  }, []);

  // Safe loading translation function
  const loadingTranslationFunction: TranslationFunction = useCallback((key: string) => {
    console.warn(`Translation called during loading, returning key: ${key}`);
    return key;
  }, []);

  // Memoized context value
  const contextValue: LanguageContextType = useMemo(() => {
    // During loading or if no translation function is ready, use safe fallback
    let finalTranslationFunction: TranslationFunction;
    
    if (isLoading || isChanging) {
      finalTranslationFunction = loadingTranslationFunction;
    } else if (translationFunction) {
      finalTranslationFunction = translationFunction;
    } else {
      finalTranslationFunction = defaultTranslationFunction;
    }
    
    // Debug logging to understand context state
    console.log('LanguageContext contextValue creation:', {
      currentLanguage,
      isLoading,
      isChanging,
      hasTranslationFunction: !!translationFunction,
      hasDefaultFunction: !!defaultTranslationFunction,
      finalFunctionType: typeof finalTranslationFunction,
      finalFunctionIsFunction: typeof finalTranslationFunction === 'function',
      finalFunctionValue: finalTranslationFunction.toString().substring(0, 100)
    });
    
    // Additional safety check
    if (typeof finalTranslationFunction !== 'function') {
      console.error('CRITICAL: finalTranslationFunction is not a function!', finalTranslationFunction);
      finalTranslationFunction = loadingTranslationFunction;
    }
    
    return {
      currentLanguage,
      availableLanguages: SUPPORTED_LANGUAGES,
      isLoading,
      changeLanguage,
      t: finalTranslationFunction,
      // Required interface functions
      getLanguage: (code: SupportedLanguages) => {
        return SUPPORTED_LANGUAGES.find(lang => lang.value === code);
      },
      isSupported: (lang: string): lang is SupportedLanguages => {
        return SUPPORTED_LANGUAGES.some(supported => supported.value === lang);
      },
      getUserLanguage: loadUserLanguage,
      updateUserLanguage: saveLanguageToSupabase
    };
  }, [
    currentLanguage,
    isLoading,
    isChanging,
    changeLanguage,
    translationFunction,
    defaultTranslationFunction,
    loadingTranslationFunction,
    loadUserLanguage,
    saveLanguageToSupabase
  ]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

// Export context for advanced usage
export { LanguageContext };

// Export types for external use
export type { LanguageContextType, LanguageProviderProps };