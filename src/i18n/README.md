# Fantasia i18n System

This directory contains the internationalization (i18n) system for the Fantasia application.

## Structure

```
src/i18n/
├── index.ts              # Main i18n configuration and utilities
├── translations/         # Translation files directory
│   ├── en.json          # English (base language)
│   ├── es.json          # Spanish (complete)
│   ├── fr.json          # French (basic)
│   ├── de.json          # German (basic)
│   └── it.json          # Italian (basic)
└── README.md            # This file
```

## Supported Languages

- **English (en)**: Base language, fully implemented
- **Spanish (es)**: Complete translations with adult content appropriate context
- **French (fr)**: Basic translations (partial implementation)
- **German (de)**: Basic translations (partial implementation) 
- **Italian (it)**: Basic translations (partial implementation)

## Translation Key Structure

The translation files use a nested structure for organization:

```json
{
  "auth": {
    "login": {
      "welcome": "Welcome back, gorgeous! 🔥",
      "form": {
        "email": "Email address",
        "password": "Password"
      }
    }
  },
  "profileConfig": {
    "title": "Configure Your Profile",
    "preferences": {
      "label": "Your Preferences & Interests"
    }
  }
}
```

## Usage

### Import the i18n system

```typescript
import { loadTranslations, createTranslationFunction } from '@/i18n';
```

### Load translations

```typescript
const translations = await loadTranslations('es');
const t = createTranslationFunction(translations);
```

### Use translations

```typescript
const title = t('profileConfig.title');
const emailLabel = t('auth.login.form.email');
const withParams = t('profileConfig.preferences.charactersCount', { count: 250 });
```

## Adding New Translations

1. Add the translation key to the English file (en.json)
2. Add the corresponding translation to other language files
3. Use the translation in your components via the `t()` function

## Parameter Interpolation

Use `{{parameter}}` syntax for dynamic values:

```json
{
  "message": "You have {{count}} new messages"
}
```

Usage:
```typescript
t('message', { count: 5 }) // "You have 5 new messages"
```

## Adult Content Guidelines

When translating adult content:
- Maintain the sensual/erotic tone appropriate for the platform
- Consider cultural appropriateness for the target language
- Preserve emojis and special characters where appropriate
- Keep the adult context consistent across languages

## File Validation

All JSON files are validated for:
- Valid JSON syntax
- Consistent key structure across languages
- Proper character encoding (UTF-8)

## Integration with TypeScript

The i18n system is fully typed with TypeScript, providing:
- Type-safe translation keys
- IntelliSense support
- Compile-time validation
- Proper parameter typing

## Dependencies

- `@/types/language.ts` - TypeScript type definitions
- React Context API for state management
- Dynamic imports for efficient loading
- localStorage for persistence