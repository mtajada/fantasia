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
│   ├── assets
│   │   ├── browser-Eg4D0ZhZ.js
│   │   ├── index-D-n-Pc6R.js
│   │   └── index-DY0wsQTR.css
│   ├── index.html
│   └── previews
│       ├── animado.mp3
│       ├── hada.mp3
│       └── sabio.mp3
├── docs
│   ├── IMPLEMENTATIONS
│   │   ├── IMPLEMENTACION_PERFIL_ADULTO.md
│   │   ├── PLAN_MIGRACION_PERSONAJES.md
│   │   └── PLAN_RESOLUCION_ERRORES_AUTH.md
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
│   ├── logo_fantasia.PNG
│   └── previews
│       ├── animado.mp3
│       ├── hada.mp3
│       └── sabio.mp3
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── components
│   │   ├── AudioPlayer.tsx
│   │   ├── AuthGuard.tsx
│   │   ├── BackButton.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   ├── ManageSubscriptionButton.tsx
│   │   ├── PageTransition.tsx
│   │   ├── PaymentButtons.tsx
│   │   ├── PreviewVoiceModal.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StoryAudioPlayer.tsx
│   │   ├── StoryButton.tsx
│   │   ├── StoryChapter.tsx
│   │   ├── StoryContinuationCustomInput.tsx
│   │   ├── StoryContinuationOptions.tsx
│   │   ├── StoryLoadingPage.tsx
│   │   ├── StoryOptionCard.tsx
│   │   ├── VoiceSettings.tsx
│   │   ├── WaveForm.tsx
│   ├── config
│   │   └── app.ts
│   ├── constants
│   │   ├── story-images.constant.ts
│   │   └── story-voices.constant.ts
│   ├── env.d.ts
│   ├── hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useChangelog.ts
│   ├── index.css
│   ├── lib
│   │   └── utils.ts
│   ├── main.tsx
│   ├── pages
│   │   ├── AuthCallback.tsx
│   │   ├── Changelog.tsx
│   │   ├── CharacterName.tsx
│   │   ├── CharacterSelection.tsx
│   │   ├── CharactersManagement.tsx
│   │   ├── Contact.tsx
│   │   ├── ErrorPage.tsx
│   │   ├── GeneratingStory.tsx
│   │   ├── Home.tsx
│   │   ├── Index.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   ├── PaymentCancel.tsx
│   │   ├── PaymentSuccess.tsx
│   │   ├── PlansPage.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   ├── ProfileConfigPage.tsx
│   │   ├── SavedStories.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── Signup.tsx
│   │   ├── SignupSuccess.tsx
│   │   ├── StoryAudioPage.tsx
│   │   ├── StoryContinuation.tsx
│   │   ├── StoryDetailsInput.tsx
│   │   ├── StoryGenre.tsx
│   │   ├── StoryViewer.tsx
│   │   ├── TermsAndConditions.tsx
│   │   └── Welcome.tsx
│   ├── services
│   │   ├── charactersService.ts
│   │   ├── stripeService.ts
│   │   ├── supabase.ts
│   │   └── syncService.ts
│   ├── store
│   │   ├── index.ts
│   ├── supabaseAuth.ts
│   ├── supabaseClient.ts
│   ├── types
│   │   ├── index.ts
│   │   └── jsx.d.ts
│   └── vite-env.d.ts
├── supabase
│   ├── config.toml
│   ├── functions
│   │   ├── deno.jsonc
│   │   ├── deno.lock
│   └── migrations
│       ├── 20230901000000_init_db.sql
│       └── 20231027103000_schedule_monthly_reset.sql
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


index.html
```
1 | <!DOCTYPE html>
2 | <html lang="en">
3 | 
4 | <head>
5 |   <meta charset="UTF-8" />
6 |   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
7 |   <title>Fantasia</title>
8 |   <meta name="description" content="Fantasia - Adult erotic stories powered by AI" />
9 |   <meta name="author" content="" />
10 |   
11 |   <!-- Favicon configuración -->
12 |   <link rel="icon" href="/favicon_v2.png" />
13 |   <link rel="apple-touch-icon" href="/favicon_v2.png" />
14 |   <link rel="shortcut icon" type="image/png" href="/favicon_v2.png" />
15 |   <meta property="og:image" content="/favicon_v2.png" />
16 |   <meta name="theme-color" content="#ffffff" />
17 |   
18 |   <link rel="preconnect" href="https://fonts.googleapis.com">
19 |   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
20 |   <link
21 |     href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Quicksand:wght@500;600;700&display=swap"
22 |     rel="stylesheet">
23 | </head>
24 | 
25 | <body>
26 |   <div id="root"></div>
27 |   <script type="module" src="/src/main.tsx"></script>
28 | </body>
29 | 
30 | </html>
```

src/App.tsx
```
1 | import { Toaster } from "@/components/ui/toaster";
2 | import { Toaster as Sonner } from "@/components/ui/sonner";
3 | import { TooltipProvider } from "@/components/ui/tooltip";
4 | import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
5 | import React from 'react';
6 | import { BrowserRouter, Routes, Route } from "react-router-dom";
7 | import { AnimatePresence } from "framer-motion";
8 | import AuthGuard from "./components/AuthGuard";
9 | import MainLayout from "./components/MainLayout";
10 | 
11 | // Pages
12 | import Welcome from "./pages/Welcome";
13 | import Login from "./pages/Login";
14 | import Signup from "./pages/Signup";
15 | import SignupSuccess from "./pages/SignupSuccess";
16 | // import ProfileSetup from "./pages/ProfileSetup"; 
17 | import Home from "./pages/Home";
18 | import CharacterSelection from "./pages/CharacterSelection";
19 | import CharacterName from "./pages/CharacterName";
20 | 
21 | import StoryGenre from "./pages/StoryGenre";
22 | 
23 | import GeneratingStory from "./pages/GeneratingStory";
24 | import StoryViewer from "./pages/StoryViewer";
25 | import StoryAudioPage from "./pages/StoryAudioPage";
26 | import StoryContinuation from "./pages/StoryContinuation";
27 | import SavedStories from "./pages/SavedStories";
28 | import ErrorPage from "./pages/ErrorPage";
29 | import NotFound from "./pages/NotFound";
30 | import AuthCallback from "./pages/AuthCallback";
31 | import CharactersManagement from "./pages/CharactersManagement";
32 | import PaymentSuccess from "./pages/PaymentSuccess";
33 | import PaymentCancel from "./pages/PaymentCancel";
34 | import StoryDetailsInput from "./pages/StoryDetailsInput";
35 | import TermsAndConditions from "./pages/TermsAndConditions";
36 | import PrivacyPolicy from "./pages/PrivacyPolicy";
37 | import Contact from "./pages/Contact";
38 | import Changelog from "./pages/Changelog";
39 | 
40 | // New Pages for Refactor
41 | import ProfileConfigPage from './pages/ProfileConfigPage';
42 | import SettingsPage from './pages/SettingsPage';
43 | import PlansPage from './pages/PlansPage';
44 | 
45 | const queryClient = new QueryClient();
46 | 
47 | const App = () => {
48 |   return (
49 |     <QueryClientProvider client={queryClient}>
50 |       <TooltipProvider>
51 |         <Toaster />
52 |         <Sonner />
53 |         <BrowserRouter>
54 |           <AnimatePresence mode="wait">
55 |             <MainLayout>
56 |               <Routes>
57 |                 {/* Public routes */}
58 |                 <Route path="/" element={<Welcome />} />
59 |                 <Route path="/login" element={<Login />} />
60 |                 <Route path="/signup" element={<Signup />} />
61 |                 <Route path="/signup-success" element={<SignupSuccess />} />
62 |                 <Route path="/error" element={<ErrorPage />} />
63 |                 <Route path="*" element={<NotFound />} />
64 |                 <Route path="/auth/callback" element={<AuthCallback />} />
65 |                 <Route path="/terms" element={<TermsAndConditions />} />
66 |                 <Route path="/privacy-policy" element={<PrivacyPolicy />} />
67 |                 <Route path="/contact" element={<Contact />} />
68 |                 <Route path="/changelog" element={<Changelog />} />
69 | 
70 |                 {/* Payment routes */}
71 |                 <Route path="/payment-success" element={<AuthGuard><PaymentSuccess /></AuthGuard>} />
72 |                 <Route path="/payment-cancel" element={<AuthGuard><PaymentCancel /></AuthGuard>} />
73 | 
74 |                 {/* Protected routes */}
75 |                 <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
76 | 
77 |                 <Route path="/characters-management" element={<AuthGuard><CharactersManagement /></AuthGuard>} />
78 |                 <Route path="/character-selection" element={<AuthGuard><CharacterSelection /></AuthGuard>} />
79 |                 <Route path="/character-name" element={<AuthGuard><CharacterName /></AuthGuard>} />
80 |                 <Route path="/story-genre" element={<AuthGuard><StoryGenre /></AuthGuard>} />
81 | 
82 |                 <Route path="/story-details-input" element={<AuthGuard><StoryDetailsInput /></AuthGuard>} />
83 |                 <Route path="/generating" element={<AuthGuard><GeneratingStory /></AuthGuard>} />
84 |                 <Route path="/story/:storyId" element={<AuthGuard><StoryViewer /></AuthGuard>} />
85 |                 <Route path="/story/:storyId/audio/:chapterId?" element={<AuthGuard><StoryAudioPage /></AuthGuard>} />
86 |                 <Route path="/story/:storyId/continue" element={<AuthGuard><StoryContinuation /></AuthGuard>} />
87 |                 <Route path="/stories" element={<AuthGuard><SavedStories /></AuthGuard>} />
88 | 
89 |                 {/* New Protected Routes */}
90 |                 <Route path="/profile-config" element={<AuthGuard><ProfileConfigPage /></AuthGuard>} />
91 |                 <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
92 |                 <Route path="/plans" element={<AuthGuard><PlansPage /></AuthGuard>} />
93 |               </Routes>
94 |             </MainLayout>
95 |           </AnimatePresence>
96 |         </BrowserRouter>
97 |       </TooltipProvider>
98 |     </QueryClientProvider>
99 |   );
100 | };
101 | 
102 | export default App;
```

src/main.tsx
```
1 | import { createRoot } from 'react-dom/client'
2 | import { useEffect } from 'react'
3 | import App from './App.tsx'
4 | import './index.css'
5 | import { useUserStore } from './store/user/userStore'
6 | import { initSyncService } from './services/syncService'
7 | 
8 | // Component to handle authentication check on app load
9 | const AppWithAuth = () => {
10 |   const { checkAuth } = useUserStore()
11 | 
12 |   useEffect(() => {
13 |     // Check authentication status when app loads
14 |     const initAuth = async () => {
15 |       await checkAuth()
16 |       // Inicializar el servicio de sincronización después de verificar autenticación
17 |       initSyncService()
18 |     }
19 |     
20 |     initAuth()
21 |   }, [checkAuth])
22 | 
23 |   return <App />
24 | }
25 | 
26 | createRoot(document.getElementById("root")!).render(<AppWithAuth />)
```
