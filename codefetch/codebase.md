Project Structure:
├── CHANGELOG.md
├── CLAUDE.md
├── GEMINI.md
├── README.md
├── bun.lockb
├── codefetch
│   ├── codebase.md
│   └── context.md
├── components.json
├── debug-edge-function.js
├── deno.lock
├── deploy-pm2.sh
├── dist
│   ├── index.html
│   ├── logo_fantasia.png
├── docs
│   ├── PAUTAS_DE_DISENO_ADULTO.md
│   ├── Stripe_integration.md
│   ├── preset_suggestions.sql
│   ├── project_structure.md
│   ├── provisional_logica_tts.md
│   ├── sql_supabase.sql
│   └── store_arquitecture.md
├── ecosystem.config.cjs
├── eslint.config.js
├── get-token.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.cjs
├── public
│   ├── logo_fantasia.png
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── env.d.ts
│   ├── index.css
│   ├── main.tsx
│   ├── supabaseAuth.ts
│   ├── supabaseClient.ts
│   └── vite-env.d.ts
├── supabase
│   ├── config.toml
├── tailwind.config.ts
├── tasks
├── test-edge-functions
│   ├── README.md
│   ├── test-data.js
│   └── test-simple.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts


src/supabaseClient.ts
```
1 | import { createClient } from "@supabase/supabase-js";
2 | 
3 | const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
4 | const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
5 | 
6 | export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

src/supabaseAuth.ts
```
1 | // Importa el cliente ÚNICO desde supabaseClient.ts
2 | import { supabase } from "./supabaseClient"; // Asegúrate que la ruta es correcta
3 | import { User } from "./types"; // Asume que estos tipos son correctos
4 | 
5 | // Listener de Auth simplificado (opcional, solo para logging)
6 | supabase.auth.onAuthStateChange((event, session) => {
7 |   console.log(`Auth Event: ${event}`, session ? `User: ${session.user.id}` : 'No session');
8 | });
9 | 
10 | // --- Funciones de Autenticación ---
11 | 
12 | export const signUp = async (
13 |   email: string,
14 |   password: string,
15 | ): Promise<{ user: User | null; error: Error | null }> => {
16 |   // Eliminada la llamada a clearSessionData
17 |   try {
18 |     const { data, error } = await supabase.auth.signUp({
19 |       email,
20 |       password,
21 |       // Opciones adicionales si las necesitas (e.g., data para metadata inicial)
22 |     });
23 | 
24 |     if (error) {
25 |       console.error("Error en signUp:", error.message);
26 |       return { user: null, error };
27 |     }
28 | 
29 |     // ¡Importante! signUp puede requerir verificación de email.
30 |     // data.user puede existir pero data.session ser null hasta la verificación.
31 |     // La lógica que llama a signUp debe manejar esto.
32 |     if (!data.user) {
33 |       // Esto no debería ocurrir si no hay error, pero por si acaso.
34 |       console.error("signUp exitoso pero no se devolvió usuario.");
35 |       return { user: null, error: new Error("User creation failed unexpectedly") };
36 |     }
37 | 
38 |     // Devolver solo la información básica del usuario creado.
39 |     // El proceso de login/checkAuth se encargará de establecer la sesión completa y cargar datos.
40 |     return {
41 |       user: {
42 |         id: data.user.id,
43 |         email: data.user.email || "",
44 |       },
45 |       error: null,
46 |     };
47 |   } catch (err) {
48 |     console.error("Error inesperado durante signUp:", err);
49 |     return { user: null, error: err as Error };
50 |   }
51 | };
52 | 
53 | export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
54 |   // Eliminada la llamada a clearSessionData
55 |   try {
56 |     const { error } = await supabase.auth.signInWithOAuth({
57 |       provider: "google",
58 |       options: {
59 |         // Asegúrate que esta URL está en la lista de URLs permitidas en Supabase Auth settings
60 |         redirectTo: `${window.location.origin}/auth/callback`, // o tu ruta de callback
61 |       },
62 |     });
63 | 
64 |     if (error) {
65 |       console.error("Error en signInWithGoogle:", error.message);
66 |       return { error };
67 |     }
68 |     // signInWithOAuth redirige, no devuelve usuario/sesión aquí.
69 |     // El manejo se hace en la página de callback.
70 |     return { error: null };
71 |   } catch (err) {
72 |     console.error("Error inesperado durante signInWithGoogle:", err);
73 |     return { error: err as Error };
74 |   }
75 | };
76 | 
77 | export const login = async (
78 |   email: string,
79 |   password: string,
80 | ): Promise<{ user: User | null; error: Error | null }> => {
81 |   // Eliminada la llamada a clearSessionData
82 |   try {
83 |     const { data, error } = await supabase.auth.signInWithPassword({
84 |       email,
85 |       password,
86 |     });
87 | 
88 |     if (error) {
89 |       console.error("Error en login:", error.message);
90 |       return { user: null, error };
91 |     }
92 | 
93 |     // signIn devuelve tanto user como session si es exitoso
94 |     if (!data.user || !data.session) {
95 |       console.error("Login exitoso pero faltan datos de usuario o sesión.");
96 |       return { user: null, error: new Error("Login failed unexpectedly") };
97 |     }
98 | 
99 |     // Devolver usuario básico. El userStore.checkAuth/loginUser
100 |     // se encargará de actualizar el estado global y cargar datos.
101 |     return {
102 |       user: {
103 |         id: data.user.id,
104 |         email: data.user.email || "",
105 |       },
106 |       error: null,
107 |     };
108 |   } catch (err) {
109 |     console.error("Error inesperado durante login:", err);
110 |     return { user: null, error: err as Error };
111 |   }
112 | };
113 | 
114 | export const logout = async (): Promise<{ error: Error | null }> => {
115 |   // Eliminada la llamada a clearSessionData
116 |   try {
117 |     // El userStore.logoutUser debería llamar a syncQueue.processQueue() ANTES de llamar a esta función.
118 |     const { error } = await supabase.auth.signOut();
119 | 
120 |     if (error) {
121 |       console.error("Error en logout:", error.message);
122 |       // Incluso si hay error, el estado local debe limpiarse. userStore lo hará.
123 |       return { error };
124 |     }
125 | 
126 |     // El estado local (stores, userStore.user) será limpiado por userStore.logoutUser
127 |     // después de llamar a esta función de signOut.
128 |     return { error: null };
129 |   } catch (err) {
130 |     console.error("Error inesperado durante logout:", err);
131 |     return { error: err as Error };
132 |   }
133 | };
134 | 
135 | // ELIMINADAS las funciones getProfile y updateProfile. Usar getUserProfile y syncUserProfile de supabase.ts
136 | 
137 | // getCurrentUser sigue siendo útil como una forma rápida de obtener el usuario básico.
138 | export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
139 |   try {
140 |     // getUser es preferible a getSession si solo necesitas el usuario y quieres forzar refresco si es necesario.
141 |     const { data: { user }, error } = await supabase.auth.getUser();
142 | 
143 |     if (error) {
144 |       // No loguear error aquí necesariamente, puede ser normal si no hay sesión.
145 |       return { user: null, error };
146 |     }
147 | 
148 |     if (!user) {
149 |       return { user: null, error: null }; // Sin usuario, sin error.
150 |     }
151 | 
152 |     return {
153 |       user: {
154 |         id: user.id,
155 |         email: user.email || "",
156 |       },
157 |       error: null,
158 |     };
159 |   } catch (err) {
160 |     // Capturar errores inesperados del propio método getUser
161 |     console.error("Error inesperado en getCurrentUser:", err);
162 |     return { user: null, error: err as Error };
163 |   }
164 | };
165 | 
166 | export const requestPasswordReset = async (
167 |   email: string,
168 | ): Promise<{ error: Error | null }> => {
169 |   try {
170 |     const { error } = await supabase.auth.resetPasswordForEmail(email, {
171 |       // Asegúrate que esta ruta existe y maneja la actualización de contraseña
172 |       redirectTo: `${window.location.origin}/update-password`, // Ruta para actualizar contraseña
173 |     });
174 | 
175 |     if (error) {
176 |       console.error("Error solicitando reseteo de contraseña:", error.message);
177 |       return { error };
178 |     }
179 | 
180 |     return { error: null };
181 |   } catch (err) {
182 |     console.error("Error inesperado solicitando reseteo de contraseña:", err);
183 |     return { error: err as Error };
184 |   }
185 | };
```

src/config/app.ts
```
1 | /**
2 |  * Global application configuration
3 |  * This file contains global parameters and settings that can be used throughout the app
4 |  */
5 | 
6 | export const APP_CONFIG = {
7 |   /**
8 |    * Current application version
9 |    * Format: major.minor.patch
10 |    */
11 |   version: '1.0.0',
12 | 
13 |   /**
14 |    * Application name
15 |    */
16 |   name: 'Fantasia',
17 |   
18 |   /**
19 |    * Website URL
20 |    */
21 |   websiteUrl: 'https://fantasia.app',
22 |   
23 |   /**
24 |    * Social media links
25 |    */
26 |   socialLinks: {
27 |     twitter: 'https://twitter.com/fantasia_app',
28 |     instagram: 'https://instagram.com/fantasia_app',
29 |     facebook: 'https://facebook.com/fantasiaapp'
30 |   },
31 | 
32 |   /**
33 |    * Footer URLs
34 |    */
35 |   footerLinks: {
36 |     terms: '/terms',
37 |     privacy: '/privacy-policy',
38 |     contact: '/contact',
39 |     changelog: '/changelog'
40 |   }
41 | }; 
```

CLAUDE.md
```
1 | # CLAUDE.md
2 | 
3 | This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
4 | 
5 | ## Project Overview
6 | 
7 | **Fantasia** is undergoing transformation from a children's storytelling application to an adult-oriented erotic content platform. The project generates personalized stories with voice narration and interactive elements, now targeting mature audiences with sophisticated adult themes.
8 | 
9 | **Current Version**: 1.1.4  
10 | **Main Branch**: master  
11 | **Project Type**: Single Page Application (SPA)  
12 | **Target Audience**: Adults (18+)  
13 | **Content Focus**: Adult erotic literature and interactive experiences  
14 | **Language**: English (migrating from Spanish)
15 | 
16 | ## Technology Stack
17 | 
18 | ### Frontend
19 | - **React 18.3.1** with TypeScript
20 | - **Vite** for build tooling and development server
21 | - **Tailwind CSS** for styling with custom configuration
22 | - **shadcn/ui** component library (extensive Radix UI components)
23 | - **Framer Motion** for animations and transitions
24 | - **Zustand** for state management
25 | - **React Router DOM** for navigation
26 | - **React Hook Form** with Zod validation
27 | - **TanStack Query** for server state management
28 | 
29 | ### Backend & Services
30 | - **Supabase** as Backend-as-a-Service (BaaS)
31 |   - Authentication and user management
32 |   - PostgreSQL database with Row Level Security (RLS)
33 |   - Edge Functions for serverless compute
34 |   - File storage for audio and images
35 | - **OpenAI** for AI-powered story generation and TTS
36 | - **Google Generative AI** (Gemini) for story generation
37 | - **Stripe** for payment processing and subscriptions
38 | - **ElevenLabs** for voice synthesis (via API)
39 | 
40 | ### Development Tools
41 | - **TypeScript** with strict configuration
42 | - **ESLint** with React and TypeScript rules
43 | - **PostCSS** with Tailwind CSS
44 | - **PM2** for production deployment
45 | - **Bun** as package manager (with npm fallback)
46 | 
47 | ## Project Structure
48 | 
49 | ```
50 | FantasIA/
51 | ├── src/
52 | │   ├── components/           # Reusable UI components
53 | │   │   ├── ui/              # shadcn/ui components (~49 files)
54 | │   │   └── [various].tsx    # App-specific components
55 | │   ├── pages/               # Route-based page components
56 | │   ├── services/            # API integration layer
57 | │   │   ├── ai/             # AI service wrappers
58 | │   │   └── [various].ts    # Database and third-party services
59 | │   ├── store/              # Zustand state management
60 | │   │   ├── character/      # Character management
61 | │   │   ├── stories/        # Story-related state
62 | │   │   ├── user/           # User profile and auth
63 | │   │   └── core/           # Store utilities
64 | │   ├── hooks/              # Custom React hooks
65 | │   ├── lib/                # Utility functions
66 | │   ├── types/              # TypeScript type definitions
67 | │   └── config/             # App configuration
68 | ├── supabase/
69 | │   ├── functions/          # Edge Functions
70 | │   ├── migrations/         # Database migrations
71 | │   └── sql-functions/      # Database functions
72 | ├── docs/                   # Project documentation
73 | └── public/                 # Static assets
74 | ```
75 | 
76 | ## Key Features
77 | 
78 | ### Story Generation
79 | - **Personalized Adult Stories**: AI-generated erotic tales based on character preferences, kinks, and interests
80 | - **Chapter System**: Multi-chapter stories with continuation options
81 | - **Story Format Choice**: Users can choose between 'single' self-contained stories or 'episodic' stories designed for multiple chapters
82 | - **Multiple Genres**: Romance, BDSM, fantasy, contemporary, etc.
83 | - **Character Customization**: Name, gender ('male', 'female', 'non-binary'), and free-text description
84 | 
85 | ### Audio Features
86 | - **Text-to-Speech**: Professional voice narration using OpenAI TTS with sensual voices
87 | - **Multiple Voices**: Different personality-matched voices for adult content
88 | - **Audio Player**: Custom audio player with progress tracking
89 | - **Voice Preview**: Sample voices before selection
90 | 
91 | ### Image Generation
92 | - **Currently Deactivated**: Image generation functionality is temporarily disabled
93 | - **Database Ready**: The schema includes a 'cover_image_url' field in the 'stories' table for future implementation
94 | - **Planned Features**: DALL-E 3 integration for story illustrations, cover images, and character portraits
95 | 
96 | ### Adult Content Features
97 | - **Content Warnings**: Appropriate warnings for different types of adult content
98 | - **Age Verification**: Robust age verification system
99 | - **Customizable Content**: User preferences for content intensity and themes
100 | - **Privacy Controls**: Enhanced privacy features for adult content
101 | 
102 | ### User Management
103 | - **Authentication**: Supabase Auth with email/password
104 | - **Profiles**: User preferences and adult content settings
105 | - **Subscriptions**: Stripe-powered payment system
106 | - **Usage Tracking**: Story and voice credit limits
107 | 
108 | ## Development Workflow
109 | 
110 | ### Local Development
111 | ```bash
112 | # Install dependencies
113 | npm install
114 | 
115 | # Start development server
116 | npm run dev
117 | 
118 | # Build for production
119 | npm run build:prod
120 | 
121 | # Preview production build
122 | npm run start:prod
123 | ```
124 | 
125 | ### Key Commands
126 | - `npm run dev` - Start development server (localhost:8080)
127 | - `npm run build` - Build for production
128 | - `npm run lint` - Run ESLint
129 | - `npm run deploy` - Build and start production server
130 | 
131 | ### Environment Setup
132 | Required environment variables:
133 | - `VITE_SUPABASE_URL` - Supabase project URL
134 | - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
135 | - `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
136 | - `VITE_ELEVENLABS_API_KEY` - ElevenLabs API key
137 | 
138 | ## Architecture Patterns
139 | 
140 | ### State Management
141 | - **Zustand stores** for global state
142 | - **Store separation** by domain (user, character, stories, etc.)
143 | - **Persistence** with localStorage for offline support
144 | - **Sync queue** for offline-first data handling
145 | 
146 | ### Service Layer
147 | - **Abstraction layer** between UI and backend
148 | - **Edge Function wrappers** for AI services
149 | - **Direct database access** with RLS security
150 | - **Error handling** with standardized response format
151 | 
152 | ### Component Architecture
153 | - **Atomic design** with reusable components
154 | - **Page-based routing** with React Router
155 | - **Custom hooks** for shared logic
156 | - **TypeScript** for type safety
157 | 
158 | ## Database Schema
159 | 
160 | ### Main Tables
161 | - `profiles` - User profiles with language settings and adult content preferences (free-text field for tastes, kinks, etc.)
162 | - `characters` - Simplified custom characters with only name, gender, and description
163 | - `stories` - Generated stories with metadata, including story_format ('single' or 'episodic'), flexible genre field, and cover_image_url for future use
164 | - `story_chapters` - Individual story chapters (used for stories marked as 'episodic')
165 | - `audio_files` - Generated audio recordings
166 | - `user_voices` - Voice preferences
167 | - `preset_suggestions` - Story prompt presets for generation
168 | 
169 | ### Security
170 | - **Row Level Security (RLS)** on all tables
171 | - **User-based access control**
172 | - **Secure API key management** in Edge Functions
173 | 
174 | ### SQL Documentation
175 | **IMPORTANT**: `/docs/sql_supabase.sql` is the **canonical reference** for the database schema. This is the definitive migration script that contains:
176 | - Complete table definitions and structure
177 | - All RLS policies and permissions
178 | - Database enums and constraints
179 | - The exact SQL to be executed in Supabase SQL Editor
180 | 
181 | **Development Guidelines**:
182 | - **Always refer to** `/docs/sql_supabase.sql` for any SQL-related queries or modifications
183 | - **Do NOT modify** this file unless absolutely necessary for new functionality
184 | - This script is designed to be executed in the Supabase SQL Editor to apply changes remotely
185 | - Other SQL files in `/docs/` may be outdated and should be considered legacy
186 | 
187 | Legacy files (may be outdated):
188 | - `/docs/supabase_tables.sql` - Legacy table definitions
189 | - `/docs/supabase_RLS.sql` - Legacy RLS policies
190 | 
191 | ## Testing
192 | 
193 | **Note**: Currently no test framework is configured. The project uses:
194 | - Manual testing in development
195 | - TypeScript for compile-time validation
196 | - ESLint for code quality
197 | - Production monitoring for runtime issues
198 | 
199 | ## Deployment
200 | 
201 | ### Production Setup
202 | - **PM2** for process management
203 | - **Nginx** reverse proxy (not included in repo)
204 | - **Environment variables** for configuration
205 | - **Supabase Edge Functions** for serverless compute
206 | 
207 | ### PM2 Configuration
208 | ```javascript
209 | // ecosystem.config.cjs
210 | {
211 |   name: "cuenta-cuentos",
212 |   script: "npm",
213 |   args: "run start:prod",
214 |   env: {
215 |     NODE_ENV: "production",
216 |     PORT: "8080"
217 |   }
218 | }
219 | ```
220 | 
221 | ## Development Guidelines
222 | 
223 | ### Design Work Guidelines
224 | **IMPORTANT**: When working as a designer or making UI/UX changes, always reference the adult design guidelines at `/docs/PAUTAS_DE_DISENO_ADULTO.md`. This document contains:
225 | - Adult-oriented color palette and visual system
226 | - Typography guidelines for mature content
227 | - Component patterns for erotic platform
228 | - **CRITICAL**: Functional preservation disclaimer - only modify visual aspects, never alter functionality
229 | 
230 | ### Transformation Rules
231 | 1. **Think First**: Read codebase for relevant files, write plan to tasks/todo.md
232 | 2. **Check Before Working**: Always verify plan with user before implementation
233 | 3. **High-Level Updates**: Give brief explanations of changes made
234 | 4. **Simple Changes**: Make every task as simple as possible, minimal code impact
235 | 5. **Review Documentation**: Add review section to todo.md with change summary
236 | 
237 | ### Project Transformation Context
238 | - **Content Migration**: Transform from children's stories to adult erotic content
239 | - **Language Migration**: Gradually change from Spanish to English (new features in English)
240 | - **Architecture Migration**: Replace Zustand local store with direct Supabase queries
241 | - **Simplicity Focus**: Avoid massive or complex changes, every change should be incremental
242 | 
243 | ### Code Style
244 | - **TypeScript strict mode** enabled
245 | - **ESLint** configuration with React rules
246 | - **Consistent naming** (camelCase for JS, snake_case for DB)
247 | - **Component organization** by feature/domain
248 | - **English-first approach** for new functions and components
249 | 
250 | ### Best Practices
251 | - **Prefer editing** existing files over creating new ones
252 | - **Use absolute imports** with `@/` alias
253 | - **Handle errors** gracefully with user feedback
254 | - **Implement loading states** for async operations
255 | - **Follow Tailwind CSS** utility-first approach
256 | - **Direct Supabase integration** for new features (avoid Zustand dependency)
257 | 
258 | ### State Management Migration
259 | - **Legacy**: Zustand stores with localStorage persistence
260 | - **Target**: Direct Supabase queries with real-time subscriptions
261 | - **Approach**: Gradual migration, maintain existing patterns during transition
262 | - **New Features**: Extract data directly from Supabase, don't use local stores
263 | 
264 | ## API Integration
265 | 
266 | ### Edge Functions
267 | - `generate-story` - AI adult story generation with mature themes
268 | - `story-continuation` - Story continuation options for adult narratives
269 | - `generate-audio` - Text-to-speech conversion with sensual voices
270 | - `upload-story-image` - Adult content image generation and storage (Currently Deactivated)
271 | - Stripe functions for payment processing
272 | 
273 | ### External APIs
274 | - **OpenAI** - GPT models and TTS
275 | - **Google Generative AI** - Gemini models
276 | - **Stripe** - Payment processing
277 | - **ElevenLabs** - Voice synthesis
278 | 
279 | ## Common Issues & Solutions
280 | 
281 | ### Authentication
282 | - **Race conditions** handled with auth guards
283 | - **Session management** through Supabase client
284 | - **Redirect handling** for auth callbacks
285 | 
286 | ### Performance
287 | - **Lazy loading** for route components
288 | - **Image optimization** with proper formats
289 | - **Audio streaming** for large files
290 | - **State persistence** to avoid refetching
291 | 
292 | ### Offline Support
293 | - **Sync queue** for failed operations
294 | - **localStorage persistence** for critical data
295 | - **Network detection** for connectivity changes
296 | 
297 | ## Transformation Roadmap
298 | 
299 | ### ✅ Phase 1: Content Migration (COMPLETED)
300 | - ✅ **Story Generation**: Adult content prompts fully implemented
301 | - ✅ **Character System**: Completely migrated to simplified structure (name, gender, description)
302 | - ✅ **Adult Profile System**: Preferences-based personalization implemented
303 | - ✅ **Authentication Flow**: Login/signup optimized for adult platform
304 | - ✅ **Content Warnings**: Age verification and content warnings integrated
305 | - ✅ **Language**: Core UI migrated to English with adult-appropriate messaging
306 | 
307 | ### 🔄 Phase 2: Architecture Migration (IN PROGRESS)
308 | - ✅ **Character Store Migration**: Zustand character store eliminated, direct Supabase queries implemented
309 | - ❌ **State Management**: **PRIORITY** - Replace remaining Zustand stores with direct Supabase queries
310 | - ❌ **Real-time Features**: Implement Supabase real-time subscriptions
311 | - ❌ **Database Optimization**: Optimize for adult content storage and retrieval
312 | 
313 | ### Phase 3: Enhanced Features (PLANNED)
314 | - **Advanced Personalization**: AI-driven content customization
315 | - **Community Features**: User-generated content and sharing
316 | - **Enhanced Privacy**: Advanced privacy controls for adult platform
317 | 
318 | ### Current Technical Debt (PRIORITY ORDER)
319 | - **🔥 HIGHEST PRIORITY**: Complete Zustand to Supabase migration for user/story stores
320 | - **Spanish Language Content**: Systematic translation of remaining legacy content
321 | - **Component Localization**: Final adult content UI adaptations
322 | - **Image Generation**: Re-enable functionality when ready for production
323 | 
324 | ## Implementation Guidelines
325 | 
326 | ### Adult Content Considerations
327 | - **Content Moderation**: Implement appropriate content filtering
328 | - **Privacy First**: Enhanced privacy features for sensitive content
329 | - **Age Verification**: Robust verification system
330 | - **Content Warnings**: Clear labeling of content types and intensity
331 | 
332 | ### Migration Strategy
333 | - **Incremental Changes**: Small, focused updates
334 | - **Backward Compatibility**: Maintain existing functionality during transition
335 | - **Testing**: Manual testing for each change
336 | - **Documentation**: Update docs as changes are implemented
337 | 
338 | ## Implementation Status
339 | 
340 | ### Completed Major Implementations
341 | The following major implementations have been completed and are documented in detail:
342 | 
343 | #### ✅ Adult Profile System - `/docs/IMPLEMENTATIONS/IMPLEMENTACION_PERFIL_ADULTO.md`
344 | - **Status**: COMPLETED - All phases implemented
345 | - **Achievement**: Complete migration from children's profile system to adult preferences-based system
346 | - **Impact**: Eliminates legacy `childAge`/`specialNeed` fields, introduces `preferences` field for adult content personalization
347 | - **Architecture**: Direct Supabase queries, no Zustand dependency
348 | 
349 | #### ✅ Character System Migration - `/docs/IMPLEMENTATIONS/PLAN_MIGRACION_PERSONAJES.md`
350 | - **Status**: COMPLETED - 100% migrated (Phases 1-8 complete)
351 | - **Achievement**: Simplified character system from 7 fields to 3 fields (name, gender, description)
352 | - **Impact**: Eliminates complex multi-page character creation, introduces single-page form optimized for adult content
353 | - **Architecture**: Full Zustand elimination, direct Supabase integration
354 | 
355 | #### ✅ Authentication Error Resolution - `/docs/IMPLEMENTATIONS/PLAN_RESOLUCION_ERRORES_AUTH.md`
356 | - **Status**: COMPLETED - All authentication issues resolved
357 | - **Achievement**: Eliminated 406 errors, fixed profile creation loops, optimized user flow
358 | - **Impact**: Seamless login → profile config → plans → home navigation
359 | - **Architecture**: Robust error handling, automatic profile creation triggers
360 | 
361 | ### Next Priority: Zustand Store Migration
362 | The **highest priority** remaining task is completing the migration from Zustand stores to direct Supabase queries for:
363 | - User store (partially migrated)
364 | - Story store (pending migration)
365 | - Real-time subscriptions implementation
366 | 
367 | ---
368 | 
369 | **Last Updated**: January 2025  
370 | **Version**: 1.2.0  
371 | **Transformation Status**: Phase 2 - Architecture Migration (In Progress)  
372 | **Maintainer**: Development Team
373 | 
374 | For detailed implementation guides, see the `/docs` directory, `/docs/IMPLEMENTATIONS/` directory, and `/tasks/todo.md`.
```

package.json
```
1 | {
2 |   "name": "vite_react_shadcn_ts",
3 |   "private": true,
4 |   "version": "0.0.0",
5 |   "type": "module",
6 |   "scripts": {
7 |     "dev": "vite",
8 |     "build": "vite build",
9 |     "build:dev": "vite build --mode development",
10 |     "build:prod": "vite build --mode production",
11 |     "start": "vite preview --host --port 8080",
12 |     "start:prod": "NODE_ENV=production vite preview --host --port 8080",
13 |     "deploy": "npm run build:prod && npm run start:prod",
14 |     "lint": "eslint .",
15 |     "preview": "vite preview"
16 |   },
17 |   "dependencies": {
18 |     "@google/generative-ai": "^0.24.0",
19 |     "@hookform/resolvers": "^3.9.0",
20 |     "@radix-ui/react-accordion": "^1.2.0",
21 |     "@radix-ui/react-alert-dialog": "^1.1.1",
22 |     "@radix-ui/react-aspect-ratio": "^1.1.0",
23 |     "@radix-ui/react-avatar": "^1.1.0",
24 |     "@radix-ui/react-checkbox": "^1.1.1",
25 |     "@radix-ui/react-collapsible": "^1.1.0",
26 |     "@radix-ui/react-context-menu": "^2.2.1",
27 |     "@radix-ui/react-dialog": "^1.1.2",
28 |     "@radix-ui/react-dropdown-menu": "^2.1.1",
29 |     "@radix-ui/react-hover-card": "^1.1.1",
30 |     "@radix-ui/react-label": "^2.1.0",
31 |     "@radix-ui/react-menubar": "^1.1.1",
32 |     "@radix-ui/react-navigation-menu": "^1.2.0",
33 |     "@radix-ui/react-popover": "^1.1.1",
34 |     "@radix-ui/react-progress": "^1.1.0",
35 |     "@radix-ui/react-radio-group": "^1.2.0",
36 |     "@radix-ui/react-scroll-area": "^1.1.0",
37 |     "@radix-ui/react-select": "^2.1.1",
38 |     "@radix-ui/react-separator": "^1.1.0",
39 |     "@radix-ui/react-slider": "^1.2.0",
40 |     "@radix-ui/react-slot": "^1.1.0",
41 |     "@radix-ui/react-switch": "^1.1.0",
42 |     "@radix-ui/react-tabs": "^1.1.0",
43 |     "@radix-ui/react-toast": "^1.2.1",
44 |     "@radix-ui/react-toggle": "^1.1.0",
45 |     "@radix-ui/react-toggle-group": "^1.1.0",
46 |     "@radix-ui/react-tooltip": "^1.1.4",
47 |     "@stripe/stripe-js": "^7.0.0",
48 |     "@supabase/supabase-js": "^2.49.3",
49 |     "@tanstack/react-query": "^5.56.2",
50 |     "@types/howler": "^2.2.12",
51 |     "@types/uuid": "^10.0.0",
52 |     "class-variance-authority": "^0.7.1",
53 |     "clsx": "^2.1.1",
54 |     "cmdk": "^1.0.0",
55 |     "date-fns": "^3.6.0",
56 |     "embla-carousel-react": "^8.3.0",
57 |     "framer-motion": "^10.16.4",
58 |     "howler": "^2.2.4",
59 |     "input-otp": "^1.2.4",
60 |     "lucide-react": "^0.462.0",
61 |     "next-themes": "^0.3.0",
62 |     "openai": "^4.104.0",
63 |     "react": "^18.3.1",
64 |     "react-day-picker": "^8.10.1",
65 |     "react-dom": "^18.3.1",
66 |     "react-hook-form": "^7.53.0",
67 |     "react-resizable-panels": "^2.1.3",
68 |     "react-router-dom": "^6.26.2",
69 |     "recharts": "^2.12.7",
70 |     "sonner": "^1.7.4",
71 |     "tailwind-merge": "^2.5.2",
72 |     "tailwindcss-animate": "^1.0.7",
73 |     "uuid": "^11.1.0",
74 |     "vaul": "^0.9.3",
75 |     "zod": "^3.23.8",
76 |     "zustand": "^4.5.6"
77 |   },
78 |   "devDependencies": {
79 |     "@eslint/js": "^9.9.0",
80 |     "@tailwindcss/typography": "^0.5.15",
81 |     "@types/node": "^22.5.5",
82 |     "@types/react": "^18.3.3",
83 |     "@types/react-dom": "^18.3.0",
84 |     "@vitejs/plugin-react-swc": "^3.5.0",
85 |     "autoprefixer": "^10.4.20",
86 |     "eslint": "^9.9.0",
87 |     "eslint-plugin-react-hooks": "^5.1.0-rc.0",
88 |     "eslint-plugin-react-refresh": "^0.4.9",
89 |     "globals": "^15.9.0",
90 |     "lovable-tagger": "^1.1.7",
91 |     "postcss": "^8.4.47",
92 |     "tailwindcss": "^3.4.11",
93 |     "typescript": "^5.5.3",
94 |     "typescript-eslint": "^8.0.1",
95 |     "vite": "^5.4.1"
96 |   }
97 | }
```

docs/sql_supabase.sql
```
1 | -- =============================================================================
2 | -- || DATABASE MIGRATION SCRIPT FOR FANTASIA (ADULT VERSION)                ||
3 | -- ||                                                                         ||
4 | -- || This script transforms the database schema from the children's version  ||
5 | -- || to the new adult content platform.                                      ||
6 | -- ||                                                                         ||
7 | -- || Execute this script in your Supabase SQL Editor.                        ||
8 | -- || It is highly recommended to perform a backup before execution.          ||
9 | -- =============================================================================
10 | 
11 | BEGIN;
12 | 
13 | -- =============================================================================
14 | -- STEP 1: CLEANUP OF OBSOLETE TABLES
15 | -- We remove tables related to "challenges", which no longer exist.
16 | -- =============================================================================
17 | 
18 | DROP TABLE IF EXISTS public.challenge_questions;
19 | DROP TABLE IF EXISTS public.challenges;
20 | 
21 | 
22 | -- =============================================================================
23 | -- STEP 2: CREATION OF CUSTOM DATA TYPES (ENUMS)
24 | -- We define fixed data types to ensure data consistency.
25 | -- =============================================================================
26 | 
27 | -- Gender options for characters.
28 | DO $$ BEGIN
29 |     CREATE TYPE public.gender_options AS ENUM ('male', 'female', 'non-binary');
30 | EXCEPTION
31 |     WHEN duplicate_object THEN null;
32 | END $$;
33 | 
34 | -- Story format: single story or episodic.
35 | DO $$ BEGIN
36 |     CREATE TYPE public.story_format AS ENUM ('single', 'episodic');
37 | EXCEPTION
38 |     WHEN duplicate_object THEN null;
39 | END $$;
40 | 
41 | 
42 | -- =============================================================================
43 | -- STEP 3: TABLE DEFINITIONS
44 | -- We recreate and/or alter tables to fit the new data model.
45 | -- =============================================================================
46 | 
47 | -- 'profiles' table: Updated to reflect adult preferences.
48 | DROP TABLE IF EXISTS public.profiles;
49 | CREATE TABLE public.profiles (
50 |     id uuid NOT NULL,
51 |     language text NOT NULL,
52 |     preferences text NULL,
53 |     created_at timestamp with time zone NOT NULL DEFAULT now(),
54 |     updated_at timestamp with time zone NOT NULL DEFAULT now(),
55 |     stripe_customer_id text NULL,
56 |     subscription_status text NULL,
57 |     voice_credits integer NOT NULL DEFAULT 0,
58 |     current_period_end timestamp with time zone NULL,
59 |     monthly_stories_generated integer NOT NULL DEFAULT 0,
60 |     subscription_id text NULL,
61 |     plan_id text NULL,
62 |     period_start_date timestamp with time zone NULL,
63 |     monthly_voice_generations_used integer NULL DEFAULT 0,
64 |     has_completed_setup boolean NOT NULL DEFAULT false,
65 |     CONSTRAINT profiles_pkey PRIMARY KEY (id),
66 |     CONSTRAINT profiles_stripe_customer_id_key UNIQUE (stripe_customer_id),
67 |     CONSTRAINT profiles_subscription_id_key UNIQUE (subscription_id),
68 |     CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
69 | );
70 | COMMENT ON COLUMN public.profiles.preferences IS 'User preferences and tastes for story generation (e.g., kinks, fetishes).';
71 | 
72 | -- 'characters' table: Completely simplified for the new scope.
73 | DROP TABLE IF EXISTS public.characters;
74 | CREATE TABLE public.characters (
75 |     id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
76 |     user_id uuid NOT NULL,
77 |     name text NOT NULL,
78 |     gender public.gender_options NOT NULL,
79 |     description text NOT NULL,
80 |     created_at timestamp with time zone NOT NULL DEFAULT now(),
81 |     updated_at timestamp with time zone NOT NULL DEFAULT now(),
82 |     CONSTRAINT characters_pkey PRIMARY KEY (id),
83 |     CONSTRAINT characters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
84 | );
85 | COMMENT ON TABLE public.characters IS 'Stores user-created characters for stories. Simplified for adult content.';
86 | 
87 | -- 'stories' table: Adapted to the new story options.
88 | DROP TABLE IF EXISTS public.stories;
89 | CREATE TABLE public.stories (
90 |     id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
91 |     user_id uuid NOT NULL,
92 |     title text NOT NULL,
93 |     content text NOT NULL,
94 |     audio_url text NULL,
95 |     genre text NULL, -- Kept as text to allow for custom user-defined genres.
96 |     story_format public.story_format NOT NULL DEFAULT 'single'::public.story_format,
97 |     cover_image_url text NULL, -- For future use with image generation.
98 |     character_id uuid NULL,
99 |     additional_details text NULL, -- For the final optional customization prompt.
100 |     spiciness_level integer NOT NULL DEFAULT 2, -- Adult content intensity level (1=Sensual, 2=Passionate, 3=Intense)
101 |     created_at timestamp with time zone NOT NULL DEFAULT now(),
102 |     updated_at timestamp with time zone NOT NULL DEFAULT now(),
103 |     CONSTRAINT stories_pkey PRIMARY KEY (id),
104 |     CONSTRAINT stories_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
105 |     CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
106 |     CONSTRAINT stories_spiciness_level_check CHECK (spiciness_level >= 1 AND spiciness_level <= 3)
107 | );
108 | COMMENT ON COLUMN public.stories.story_format IS 'Indicates if the story is a single one-off or episodic with chapters.';
109 | COMMENT ON COLUMN public.stories.genre IS 'Story genre. Can be a preset (e.g., Erotic Romance) or a custom user value.';
110 | COMMENT ON COLUMN public.stories.cover_image_url IS 'URL for the story''s cover image. Functionality disabled for now but schema is ready.';
111 | 
112 | 
113 | -- Tables with no structural changes (recreated for a clean script) --
114 | DROP TABLE IF EXISTS public.story_chapters;
115 | CREATE TABLE public.story_chapters (
116 |     id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
117 |     story_id uuid NOT NULL,
118 |     chapter_number integer NOT NULL,
119 |     title text NOT NULL,
120 |     content text NOT NULL,
121 |     generation_method text NULL,
122 |     custom_input text NULL,
123 |     created_at timestamp with time zone NOT NULL DEFAULT now(),
124 |     updated_at timestamp with time zone NOT NULL DEFAULT now(),
125 |     CONSTRAINT story_chapters_pkey PRIMARY KEY (id),
126 |     CONSTRAINT story_chapters_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
127 | );
128 | 
129 | DROP TABLE IF EXISTS public.audio_files;
130 | CREATE TABLE public.audio_files (
131 |     id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
132 |     user_id uuid NOT NULL,
133 |     story_id uuid NULL,
134 |     chapter_id uuid NULL,
135 |     voice_id text NOT NULL,
136 |     url text NOT NULL,
137 |     created_at timestamp with time zone NOT NULL DEFAULT now(),
138 |     CONSTRAINT audio_files_pkey PRIMARY KEY (id),
139 |     CONSTRAINT audio_files_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES story_chapters(id) ON DELETE CASCADE,
140 |     CONSTRAINT audio_files_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
141 |     CONSTRAINT audio_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
142 | );
143 | 
144 | DROP TABLE IF EXISTS public.preset_suggestions;
145 | CREATE TABLE public.preset_suggestions (
146 |     id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
147 |     text_prompt text NOT NULL,
148 |     category text NULL,
149 |     language_code character varying(5) NOT NULL DEFAULT 'en'::character varying,
150 |     is_active boolean NOT NULL DEFAULT true,
151 |     created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
152 |     CONSTRAINT preset_suggestions_pkey PRIMARY KEY (id)
153 | );
154 | COMMENT ON TABLE public.preset_suggestions IS 'Stores preset prompts for story generation (e.g., scenarios, settings). To be populated later.';
155 | 
156 | 
157 | DROP TABLE IF EXISTS public.user_voices;
158 | CREATE TABLE public.user_voices (
159 |     id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
160 |     user_id uuid NOT NULL,
161 |     voice_id text NOT NULL,
162 |     is_current boolean NULL DEFAULT false,
163 |     created_at timestamp with time zone NOT NULL DEFAULT now(),
164 |     updated_at timestamp with time zone NOT NULL DEFAULT now(),
165 |     CONSTRAINT user_voices_pkey PRIMARY KEY (id),
166 |     CONSTRAINT user_voices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
167 | );
168 | 
169 | 
170 | -- =============================================================================
171 | -- STEP 4: ENABLE AND CONFIGURE ROW LEVEL SECURITY (RLS)
172 | -- Security first: we ensure that each user can only see and modify their own data.
173 | -- =============================================================================
174 | 
175 | -- Enable RLS on all relevant tables
176 | ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
177 | ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
178 | ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
179 | ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;
180 | ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
181 | ALTER TABLE public.user_voices ENABLE ROW LEVEL SECURITY;
182 | ALTER TABLE public.preset_suggestions ENABLE ROW LEVEL SECURITY;
183 | 
184 | -- Policies for 'profiles'
185 | DROP POLICY IF EXISTS "Users can manage their own profile." ON public.profiles;
186 | CREATE POLICY "Users can manage their own profile."
187 |     ON public.profiles FOR ALL
188 |     TO authenticated
189 |     USING (auth.uid() = id)
190 |     WITH CHECK (auth.uid() = id);
191 | 
192 | -- Policies for 'characters'
193 | DROP POLICY IF EXISTS "Users can manage their own characters." ON public.characters;
194 | CREATE POLICY "Users can manage their own characters."
195 |     ON public.characters FOR ALL
196 |     TO authenticated
197 |     USING (auth.uid() = user_id)
198 |     WITH CHECK (auth.uid() = user_id);
199 | 
200 | -- Policies for 'stories'
201 | DROP POLICY IF EXISTS "Users can manage their own stories." ON public.stories;
202 | CREATE POLICY "Users can manage their own stories."
203 |     ON public.stories FOR ALL
204 |     TO authenticated
205 |     USING (auth.uid() = user_id)
206 |     WITH CHECK (auth.uid() = user_id);
207 | 
208 | -- Policies for 'story_chapters' (Access via parent story)
209 | DROP POLICY IF EXISTS "Users can manage chapters for their own stories." ON public.story_chapters;
210 | CREATE POLICY "Users can manage chapters for their own stories."
211 |     ON public.story_chapters FOR ALL
212 |     TO authenticated
213 |     USING (auth.uid() IN (SELECT stories.user_id FROM public.stories WHERE stories.id = story_chapters.story_id))
214 |     WITH CHECK (auth.uid() IN (SELECT stories.user_id FROM public.stories WHERE stories.id = story_chapters.story_id));
215 | 
216 | -- Policies for 'audio_files'
217 | DROP POLICY IF EXISTS "Users can manage their own audio files." ON public.audio_files;
218 | CREATE POLICY "Users can manage their own audio files."
219 |     ON public.audio_files FOR ALL
220 |     TO authenticated
221 |     USING (auth.uid() = user_id)
222 |     WITH CHECK (auth.uid() = user_id);
223 | 
224 | -- Policies for 'user_voices'
225 | DROP POLICY IF EXISTS "Users can manage their own voice settings." ON public.user_voices;
226 | CREATE POLICY "Users can manage their own voice settings."
227 |     ON public.user_voices FOR ALL
228 |     TO authenticated
229 |     USING (auth.uid() = user_id)
230 |     WITH CHECK (auth.uid() = user_id);
231 | 
232 | -- Policies for 'preset_suggestions' (Read-only access for users)
233 | DROP POLICY IF EXISTS "Authenticated users can read active presets." ON public.preset_suggestions;
234 | CREATE POLICY "Authenticated users can read active presets."
235 |     ON public.preset_suggestions FOR SELECT
236 |     TO authenticated
237 |     USING (is_active = true);
238 | 
239 | 
240 | COMMIT;
241 | 
242 | 
243 | -- =============================================================================
244 | -- ||                 FINAL SQL FUNCTIONS FOR FANTASIA                        ||
245 | -- =============================================================================
246 | 
247 | -- Function to decrement voice credits when an audio is generated
248 | CREATE OR REPLACE FUNCTION public.decrement_voice_credits(user_uuid uuid)
249 | RETURNS integer LANGUAGE plpgsql SECURITY INVOKER AS $$
250 | DECLARE updated_credits INTEGER;
251 | BEGIN
252 |   UPDATE public.profiles SET voice_credits = voice_credits - 1
253 |   WHERE id = user_uuid AND voice_credits > 0
254 |   RETURNING voice_credits INTO updated_credits;
255 |   RETURN COALESCE(updated_credits, -1);
256 | END;
257 | $$;
258 | 
259 | -- Trigger function to create a profile for a new user
260 | -- UPDATED: Default language is now 'en'
261 | CREATE OR REPLACE FUNCTION public.handle_new_user()
262 | RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
263 | BEGIN
264 |   INSERT INTO public.profiles (id, language, has_completed_setup)
265 |   VALUES (new.id, 'en', false);
266 |   RETURN new;
267 | END;
268 | $$;
269 | 
270 | -- Function to increment the monthly voice generation usage counter
271 | CREATE OR REPLACE FUNCTION public.increment_monthly_voice_usage(user_uuid uuid)
272 | RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
273 | BEGIN
274 |   UPDATE public.profiles
275 |   SET monthly_voice_generations_used = COALESCE(monthly_voice_generations_used, 0) + 1
276 |   WHERE id = user_uuid;
277 | END;
278 | $$;
279 | 
280 | -- Function to increment the monthly story generation usage counter
281 | CREATE OR REPLACE FUNCTION public.increment_story_count(user_uuid uuid)
282 | RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
283 | BEGIN
284 |   UPDATE public.profiles
285 |   SET monthly_stories_generated = COALESCE(monthly_stories_generated, 0) + 1
286 |   WHERE id = user_uuid;
287 | END;
288 | $$;
289 | 
290 | -- Function to add voice credits to a user (e.g., after a purchase)
291 | CREATE OR REPLACE FUNCTION public.increment_voice_credits(user_uuid uuid, credits_to_add integer)
292 | RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
293 | BEGIN
294 |   UPDATE public.profiles
295 |   SET voice_credits = COALESCE(voice_credits, 0) + credits_to_add
296 |   WHERE id = user_uuid;
297 | END;
298 | $$;
299 | 
300 | -- Scheduled function to reset usage counters for non-premium users
301 | CREATE OR REPLACE FUNCTION public.reset_monthly_counters()
302 | RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
303 | BEGIN
304 |   UPDATE public.profiles
305 |   SET monthly_stories_generated = 0
306 |   WHERE (subscription_status IS NULL OR subscription_status NOT IN ('active', 'trialing'))
307 |     AND monthly_stories_generated > 0;
308 |   RAISE LOG 'Monthly story counters for free users have been reset.';
309 | END;
310 | $$;
311 | 
312 | -- Generic trigger function to automatically update the 'updated_at' timestamp on modification
313 | CREATE OR REPLACE FUNCTION public.update_modified_column()
314 | RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
315 | BEGIN
316 |    NEW.updated_at = NOW();
317 |    RETURN NEW;
318 | END;
319 | $$;
320 | 
321 | -- =============================================================================
322 | -- ||                             TRIGGERS                                  ||
323 | -- =============================================================================
324 | 
325 | -- Crear trigger para auto-generar perfiles en el registro de nuevos usuarios
326 | CREATE TRIGGER trigger_create_profile_on_signup
327 |     AFTER INSERT ON auth.users
328 |     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
329 | 
330 | -- Triggers para actualizar timestamps automáticamente en 'updated_at'
331 | CREATE TRIGGER trigger_profiles_updated_at
332 |     BEFORE UPDATE ON public.profiles
333 |     FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
334 | 
335 | CREATE TRIGGER trigger_characters_updated_at
336 |     BEFORE UPDATE ON public.characters
337 |     FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
338 | 
339 | CREATE TRIGGER trigger_stories_updated_at
340 |     BEFORE UPDATE ON public.stories
341 |     FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
342 | 
343 | CREATE TRIGGER trigger_story_chapters_updated_at
344 |     BEFORE UPDATE ON public.story_chapters
345 |     FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
346 | 
347 | CREATE TRIGGER trigger_user_voices_updated_at
348 |     BEFORE UPDATE ON public.user_voices
349 |     FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
350 | 
351 | 
352 | -- =============================================================================
353 | -- ||                                END OF SCRIPT                              ||
354 | -- =============================================================================
```
