📁 Cuenta-Cuentos
│
├── 📁 .vscode
│   └── 📄 extensions.json
│
├── 📁 docs
│   ├── 📄 CAMBIO_MODELO_GEMINI.md
│   ├── 📄 EDGE_FUNCTIONS.md
│   ├── 📄 services.md
│   ├── 📄 store_arquitecture.md
│   ├── 📄 Stripe_integration.md
│   ├── 📄 supabase-integration-guide.md
│   ├── 📄 supabase_tables.sql
│   └── 📄 supabase_RLS.sql
│
├── 📁 node_modules
│
├── 📁 public
│   └── 📄 favicon.svg
│
├── 📁 src
│   ├── 📁 components
│   │   ├── 📁 ui
│   │   │   └── 📄 [~50 archivos *.tsx de UI genérica y específica]
│   │   ├── 📄 AudioPlayer.tsx
│   │   ├── 📄 AuthGuard.tsx
│   │   ├── 📄 BackButton.tsx
│   │   ├── 📄 ChallengeQuestion.tsx
│   │   ├── 📄 ChallengeSelector.tsx
│   │   ├── 📄 LanguageSelector.tsx
│   │   ├── 📄 LoadingAnimation.tsx
│   │   ├── 📄 ManageSubscriptionButton.tsx
│   │   ├── 📄 PageTransition.tsx
│   │   ├── 📄 PaymentButtons.tsx
│   │   ├── 📄 ProgressBar.tsx
│   │   ├── 📄 StoryAudioPlayer.tsx
│   │   ├── 📄 StoryButton.tsx
│   │   ├── 📄 StoryChapter.tsx
│   │   ├── 📄 StoryContinuationCustomInput.tsx
│   │   ├── 📄 StoryContinuationOptions.tsx
│   │   └── 📄 StoryOptionCard.tsx
│   │   └── 📄 VoiceSettings.tsx
│   ├── 📁 hooks
│   │   ├── 📄 use-mobile.tsx
│   │   └── 📄 use-toast.ts
│   ├── 📁 lib
│   │   └── 📄 utils.ts
│   ├── 📁 pages
│   │   ├── 📄 AuthCallback.tsx
│   │   ├── 📄 CharacterHobbies.tsx
│   │   ├── 📄 CharacterName.tsx
│   │   ├── 📄 CharacterPersonality.tsx
│   │   ├── 📄 CharacterProfession.tsx
│   │   ├── 📄 CharacterSelection.tsx
│   │   ├── 📄 CharacterType.tsx
│   │   ├── 📄 CharactersManagement.tsx
│   │   ├── 📄 DurationSelection.tsx
│   │   ├── 📄 ErrorPage.tsx
│   │   ├── 📄 GeneratingStory.tsx
│   │   ├── 📄 Home.tsx
│   │   ├── 📄 Index.tsx
│   │   ├── 📄 Login.tsx
│   │   ├── 📄 NotFound.tsx
│   │   ├── 📄 PaymentCancel.tsx
│   │   ├── 📄 PaymentSuccess.tsx
│   │   ├── 📄 PlansPage.tsx
│   │   ├── 📄 ProfileConfigPage.tsx # Handles initial profile setup & subsequent edits
│   │   ├── 📄 SavedStories.tsx
│   │   ├── 📄 SettingsPage.tsx
│   │   ├── 📄 Signup.tsx
│   │   ├── 📄 StoryAudioPage.tsx
│   │   ├── 📄 StoryContinuation.tsx
│   │   ├── 📄 StoryDetailsInput.tsx # Permite al usuario introducir detalles opcionales (texto libre) para la historia. Navega a /generating.
│   │   ├── 📄 StoryGenre.tsx
│   │   ├── 📄 StoryMoral.tsx
│   │   ├── 📄 StoryViewer.tsx
│   │   └── 📄 Welcome.tsx
│   ├── 📁 services
│   │   ├── 📁 ai
│   │   │   ├── 📄 ChallengeService.ts
│   │   │   ├── 📄 GenerateStoryService.ts
│   │   │   ├── 📄 StoryContinuationService.ts
│   │   │   └── 📄 ttsService.ts
│   │   ├── 📄 stripeService.ts
│   │   ├── 📄 supabase.ts
│   │   ├── 📄 supabaseAuth.ts
│   │   ├── 📄 supabaseClient.ts
│   │   └── 📄 syncService.ts
│   ├── 📁 store
│   │   ├── 📁 character
│   │   │   └── 📄 characterStore.ts
│   │   ├── 📁 core
│   │   │   ├── 📄 createStore.ts
│   │   │   └── 📄 utils.ts
│   │   ├── 📁 stories
│   │   │   ├── 📁 audio
│   │   │   │   └── 📄 audioStore.ts
│   │   │   ├── 📁 challenges
│   │   │   │   └── 📄 challengesStore.ts
│   │   │   ├── 📁 chapters
│   │   │   │   └── 📄 chaptersStore.ts
│   │   │   ├── 📄 storiesStore.ts
│   │   │   └── 📄 storyGenerator.ts
│   │   ├── 📁 storyOptions
│   │   │   └── 📄 storyOptionsStore.ts
│   │   ├── 📁 user
│   │   │   ├── 📄 userStore.ts
│   │   │   └── 📄 index.ts
│   │   └── 📁 types
│   │       └── 📄 storeTypes.ts
│   └── 📁 types
│       ├── 📄 index.ts
│       ├── 📄 jsx.d.ts
│       └── 📄 storeTypes.ts
│
├── 📁 supabase
│   ├── 📁 .branches
│   │   └── 📄 _current_branch
│   ├── 📁 .temp
│   │   ├── 📄 cli-latest
│   │   ├── 📄 gotrue-version
│   │   ├── 📄 pooler-url
│   │   ├── 📄 postgres-version
│   │   ├── 📄 project-ref
│   │   └── 📄 rest-version
│   ├── 📁 edge-functions
│   │   ├── 📁 _shared
│   │   │   └── 📄 cors.ts
│   │   ├── 📁 ai
│   │   │   ├── 📁 challenge
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 README.md
│   │   │   ├── 📁 generate-audio
│   │   │   │   ├── 📄 deno.jsonc
│   │   │   │   ├── 📄 import_map.json
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📁 generate-story
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 README.md
│   │   │   └── 📁 story-continuation
│   │   │       ├── 📄 index.ts
│   │   │       └── 📄 README.md
│   │   └── 📁 Stripe
│   │       ├── 📁 create-checkout-session
│   │       │   └── 📄 index.ts
│   │       ├── 📁 create-customer-portal-session
│   │       │   └── 📄 index.ts
│   │       └── 📁 stripe-webhook
│   │           └── 📄 index.ts
│   ├── 📁 migrations
│   │   ├── 📄 20230901000000_init_db.sql
│   │   └── 📄 20231027103000_schedule_monthly_reset.sql
│   └── 📁 sql-functions
│       ├── 📄 decrement_voice_credits.sql
│       ├── 📄 handle_new_user.sql
│       ├── 📄 increment_monthly_voice_usage.sql
│       ├── 📄 increment_story_count.sql
│       ├── 📄 increment_voice_credits.sql
│       ├── 📄 reset_monthly_counters.sql
│       └── 📄 update_modified_column.sql
│
├── 📄 config.toml
├── 📄 .env
├── 📄 .gitignore
├── 📄 bun.lockb
├── 📄 components.json
├── 📄 debug-edge-function.js
├── 📄 deno.jsonc
├── 📄 deno.lock
├── 📄 eslint.config.js
├── 📄 get-token.js
├── 📄 index.html
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 postcss.config.cjs
├── 📄 README.md
├── 📄 tailwind.config.ts
├── 📄 tsconfig.app.json
├── 📄 tsconfig.json
├── 📄 tsconfig.node.json
└── 📄 vite.config.ts