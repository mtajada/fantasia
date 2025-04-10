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
│   └── 📄 supabase-integration-guide.md
│
├── 📁 node_modules
│
├── 📁 public
│   └── 📄 favicon.svg
│
├── 📁 src
│   ├── 📁 components
│   │   └── 📁 ui
│   │       └── 📄 [~50 archivos *.tsx de UI genérica y específica]
│   │
│   ├── 📁 hooks
│   │   ├── 📄 use-mobile.tsx
│   │   └── 📄 use-toast.ts
│   │
│   ├── 📁 lib
│   │   └── 📄 utils.ts
│   │
│   ├── 📁 pages
│   │   └── 📄 [~26 archivos *.tsx de navegación principal]
│   │
│   ├── 📁 services
│   │   ├── 📁 ai
│   │   │   ├── 📄 ChallengeService.ts
│   │   │   ├── 📄 GenerateStoryService.ts
│   │   │   ├── 📄 StoryContinuationService.ts
│   │   │   └── 📄 ttsService.ts
│   │   ├── 📄 stripeService.ts
│   │   ├── 📄 supabase.ts
│   │   └── 📄 syncService.ts
│   │
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
│   │
│   └── 📁 types
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
│   │
│   ├── 📁 migrations
│   │   ├── 📄 20230901000000_init_db.sql
│   │   └── 📄 20231027103000_schedule_monthly_reset.sql
│   │
│   └── 📁 sql-functions
│       ├── 📄 decrement_voice_credits.sql
│       ├── 📄 handle_new_user.sql
│       ├── 📄 increment_story_count.sql
│       ├── 📄 increment_voice_credits.sql
│       ├── 📄 reset_monthly_story_counts.sql
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