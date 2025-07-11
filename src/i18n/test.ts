/**
 * i18n System Test
 * 
 * Simple test to verify the i18n system is working correctly
 */

import {
  loadTranslations,
  createTranslationFunction,
  detectLanguage,
  isLanguageSupported,
  normalizeLanguageCode,
  getSupportedLanguages,
} from './index';

// Test function
async function testI18nSystem() {
  console.log('🌐 Testing Fantasia i18n System...\n');

  // Test supported languages
  console.log('✅ Supported Languages:');
  const supportedLanguages = getSupportedLanguages();
  supportedLanguages.forEach(lang => {
    console.log(`   ${lang.flag} ${lang.label} (${lang.value})`);
  });
  console.log();

  // Test language detection
  console.log('🔍 Language Detection:');
  const detectedLanguage = await detectLanguage();
  console.log(`   Detected language: ${detectedLanguage}`);
  console.log();

  // Test language validation
  console.log('🔧 Language Validation:');
  console.log(`   'en' is supported: ${isLanguageSupported('en')}`);
  console.log(`   'es' is supported: ${isLanguageSupported('es')}`);
  console.log(`   'fr' is supported: ${isLanguageSupported('fr')}`);
  console.log(`   'xyz' is supported: ${isLanguageSupported('xyz')}`);
  console.log(`   Normalize 'en-US': ${normalizeLanguageCode('en-US')}`);
  console.log(`   Normalize 'invalid': ${normalizeLanguageCode('invalid')}`);
  console.log();

  // Test translation loading
  console.log('📚 Translation Loading:');
  
  try {
    // Load English translations
    const enTranslations = await loadTranslations('en');
    const enT = createTranslationFunction(enTranslations);
    
    console.log('   English translations loaded successfully');
    console.log(`   profileConfig.title: "${enT('profileConfig.title')}"`);
    console.log(`   auth.login.welcome: "${enT('auth.login.welcome')}"`);
    console.log(`   Parameter test: "${enT('profileConfig.preferences.charactersCount', { count: 250 })}"`);
    
    // Load Spanish translations
    const esTranslations = await loadTranslations('es');
    const esT = createTranslationFunction(esTranslations);
    
    console.log('   Spanish translations loaded successfully');
    console.log(`   profileConfig.title: "${esT('profileConfig.title')}"`);
    console.log(`   auth.login.welcome: "${esT('auth.login.welcome')}"`);
    console.log(`   Parameter test: "${esT('profileConfig.preferences.charactersCount', { count: 250 })}"`);
    
    // Test fallback functionality
    console.log('   Testing fallback for missing key:');
    console.log(`   Missing key: "${enT('nonexistent.key')}"`);
    
  } catch (error) {
    console.error('❌ Error loading translations:', error);
  }

  console.log('\n🎉 i18n System Test Complete!');
}

// Run test if this file is executed directly
if (require.main === module) {
  testI18nSystem().catch(console.error);
}

export default testI18nSystem;