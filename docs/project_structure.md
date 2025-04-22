# Estructura del Proyecto Cuenta-Cuentos

Este documento describe la estructura de carpetas y archivos principales del proyecto. Utiliza un formato de árbol para facilitar la comprensión de la organización del código y los recursos. Los comentarios explicativos se presentan después de los nombres de archivos, precedidos por `#`.

```text
Cuenta-Cuentos/
├── .vscode/
│   └── extensions.json
├── docs/
│   ├── EDGE_FUNCTIONS.md
│   ├── PAUTAS_DE_DISENO.md
│   ├── Stripe_integration.md
│   ├── project_files_content.md
│   ├── project_structure.md
│   ├── services.md
│   ├── store_arquitecture.md
│   ├── supabase-integration-guide.md
│   ├── supabase_RLS.sql
│   ├── supabase_presets_data.sql
│   └── supabase_tables.sql
├── node_modules/
├── public/
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── components/
│   │   ├── AudioPlayer.tsx
│   │   ├── AuthGuard.tsx
│   │   ├── BackButton.tsx
│   │   ├── ChallengeQuestion.tsx
│   │   ├── ChallengeSelector.tsx
│   │   ├── IconLoadingAnimation.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── LoadingAnimation.tsx
│   │   ├── ManageSubscriptionButton.tsx
│   │   ├── PageTransition.tsx
│   │   ├── PaymentButtons.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StoryAudioPlayer.tsx
│   │   ├── StoryButton.tsx
│   │   ├── StoryChapter.tsx
│   │   ├── StoryContinuationCustomInput.tsx
│   │   ├── StoryContinuationOptions.tsx
│   │   ├── StoryOptionCard.tsx
│   │   ├── VoiceSettings.tsx
│   │   └── ui/                   # Componentes reutilizables (~49 archivos *.tsx)
│   ├── env.d.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.tsx
│   ├── index.css
│   ├── lib/
│   │   └── utils.ts
│   ├── main.tsx
│   ├── pages/
│   │   ├── AuthCallback.tsx
│   │   ├── CharacterHobbies.tsx
│   │   ├── CharacterName.tsx
│   │   ├── CharacterPersonality.tsx
│   │   ├── CharacterProfession.tsx
│   │   ├── CharacterSelection.tsx
│   │   ├── CharactersManagement.tsx
│   │   ├── DurationSelection.tsx
│   │   ├── ErrorPage.tsx
│   │   ├── GeneratingStory.tsx
│   │   ├── Home.tsx
│   │   ├── Index.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   ├── PaymentCancel.tsx
│   │   ├── PaymentSuccess.tsx
│   │   ├── PlansPage.tsx
│   │   ├── ProfileConfigPage.tsx
│   │   ├── SavedStories.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── Signup.tsx
│   │   ├── StoryAudioPage.tsx
│   │   ├── StoryContinuation.tsx
│   │   ├── StoryDetailsInput.tsx
│   │   ├── StoryGenre.tsx
│   │   ├── StoryMoral.tsx
│   │   ├── StoryViewer.tsx
│   │   └── Welcome.tsx
│   ├── services/
│   │   ├── ai/
│   │   │   ├── ChallengeService.ts
│   │   │   ├── GenerateStoryService.ts
│   │   │   ├── StoryContinuationService.ts
│   │   │   └── ttsService.ts
│   │   ├── stripeService.ts
│   │   ├── supabase.ts
│   │   └── syncService.ts
│   ├── store/
│   │   ├── character/
│   │   │   └── characterStore.ts
│   │   ├── core/
│   │   │   ├── createStore.ts
│   │   │   └── utils.ts
│   │   ├── index.ts
│   │   ├── stories/
│   │   │   ├── audio/
│   │   │   │   └── audioStore.ts
│   │   │   ├── challenges/
│   │   │   │   └── challengesStore.ts
│   │   │   ├── chapters/
│   │   │   │   └── chaptersStore.ts
│   │   │   ├── storiesStore.ts
│   │   │   └── storyGenerator.ts
│   │   ├── storyOptions/
│   │   │   └── storyOptionsStore.ts
│   │   ├── types/
│   │   │   └── storeTypes.ts
│   │   └── user/
│   │       └── userStore.ts
│   ├── supabaseAuth.ts
│   ├── supabaseClient.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── storeTypes.ts
│   └── vite-env.d.ts
├── supabase/
│   ├── .branches/
│   ├── .temp/
│   ├── config.toml
│   ├── functions/
│   │   ├── Stripe/
│   │   │   ├── create-checkout-session/
│   │   │   │   └── index.ts
│   │   │   ├── create-customer-portal-session/
│   │   │   │   └── index.ts
│   │   │   └── stripe-webhook/
│   │   │       └── index.ts
│   │   ├── _shared/
│   │   │   └── cors.ts
│   │   ├── ai/
│   │   │   ├── challenge/
│   │   │   │   ├── index.ts
│   │   │   │   └── README.md
│   │   │   ├── generate-audio/
│   │   │   │   ├── deno.jsonc
│   │   │   │   ├── import_map.json
│   │   │   │   └── index.ts
│   │   │   ├── generate-story/
│   │   │   │   ├── index.ts
│   │   │   │   └── README.md
│   │   │   └── story-continuation/
│   │   │       ├── index.ts
│   │   │       └── README.md
│   │   └── deno.jsonc
│   ├── migrations/
│   │   ├── 20230901000000_init_db.sql
│   │   └── 20231027103000_schedule_monthly_reset.sql
│   ├── sql-functions/
│   │   ├── decrement_voice_credits.sql
│   │   ├── handle_new_user.sql
│   │   ├── increment_monthly_voice_usage.sql
│   │   ├── increment_story_count.sql
│   │   ├── increment_voice_credits.sql
│   │   ├── reset_monthly_counters.sql
│   │   └── update_modified_column.sql
│   └── config.toml
├── .env
├── .gitignore
├── bun.lockb
├── components.json
├── debug-edge-function.js
├── eslint.config.js
├── get-token.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.cjs
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
```

> **Nota:** Este esquema puede variar ligeramente si se agregan o eliminan archivos/carpetas. Consulta el repositorio para la versión más actualizada.
