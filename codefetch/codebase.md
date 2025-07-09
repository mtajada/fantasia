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


tailwind.config.ts
```
1 | import type { Config } from "tailwindcss";
2 | 
3 | export default {
4 | 	darkMode: ["class"],
5 | 	content: [
6 | 		"./pages/**/*.{ts,tsx}",
7 | 		"./components/**/*.{ts,tsx}",
8 | 		"./app/**/*.{ts,tsx}",
9 | 		"./src/**/*.{ts,tsx}",
10 | 	],
11 | 	prefix: "",
12 | 	theme: {
13 | 		container: {
14 | 			center: true,
15 | 			padding: '2rem',
16 | 			screens: {
17 | 				'2xl': '1400px'
18 | 			}
19 | 		},
20 | 		extend: {
21 | 			fontFamily: {
22 | 				sans: ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
23 | 				heading: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
24 | 			},
25 | 			colors: {
26 | 				'brand': {
27 | 					'pink': '#FDDDE3',      // Rosa Base
28 | 					'purple': '#BB79D1',    // Morado
29 | 					'blue': '#7DC4E0',      // Azul Claro
30 | 					'yellow': '#F9DA60',    // Amarillo
31 | 				},
32 | 				border: 'hsl(var(--border))',
33 | 				input: 'hsl(var(--input))',
34 | 				ring: 'hsl(var(--ring))',
35 | 				background: '#FFFBF5',       // Un blanco muy suave con tinte rosa/amarillo
36 | 				foreground: 'hsl(var(--foreground))',
37 | 				primary: {
38 | 					DEFAULT: '#BB79D1',     // Morado como primario
39 | 					foreground: 'hsl(var(--primary-foreground))'
40 | 				},
41 | 				secondary: {
42 | 					DEFAULT: '#7DC4E0',     // Azul como secundario
43 | 					foreground: 'hsl(var(--secondary-foreground))'
44 | 				},
45 | 				destructive: {
46 | 					DEFAULT: 'hsl(var(--destructive))',
47 | 					foreground: 'hsl(var(--destructive-foreground))'
48 | 				},
49 | 				muted: {
50 | 					DEFAULT: 'hsl(var(--muted))',
51 | 					foreground: 'hsl(var(--muted-foreground))'
52 | 				},
53 | 				accent: {
54 | 					DEFAULT: '#F9DA60',     // Amarillo como acento
55 | 					foreground: 'hsl(var(--accent-foreground))'
56 | 				},
57 | 				popover: {
58 | 					DEFAULT: 'hsl(var(--popover))',
59 | 					foreground: 'hsl(var(--popover-foreground))'
60 | 				},
61 | 				card: {
62 | 					DEFAULT: '#FFFFFF',     // Blanco puro para tarjetas
63 | 					foreground: 'hsl(var(--card-foreground))'
64 | 				},
65 | 				'text-primary': '#4A4A4A',  // Gris oscuro para texto principal
66 | 				'text-secondary': '#757575', // Gris medio para texto secundario
67 | 				story: {
68 | 					purple: {
69 | 						DEFAULT: '#3F2E5D',
70 | 						50: '#F5F2FA',
71 | 						100: '#EBE6F5',
72 | 						200: '#D7CCE9',
73 | 						300: '#C3B3DE',
74 | 						400: '#AF99D2',
75 | 						500: '#9B80C7',
76 | 						600: '#8767BB',
77 | 						700: '#6E4CA6',
78 | 						800: '#563C82',
79 | 						900: '#3F2E5D',
80 | 						950: '#302246'
81 | 					},
82 | 					orange: {
83 | 						DEFAULT: '#F4A261',
84 | 						50: '#FEF5EE',
85 | 						100: '#FDEADC',
86 | 						200: '#FBCFAF',
87 | 						300: '#F9B383',
88 | 						400: '#F4A261',
89 | 						500: '#F08430',
90 | 						600: '#DD6A10',
91 | 						700: '#A64F0C',
92 | 						800: '#6F3608',
93 | 						900: '#371A04'
94 | 					},
95 | 					blue: {
96 | 						DEFAULT: '#457B9D',
97 | 						50: '#E9F0F4',
98 | 						100: '#D3E1E8',
99 | 						200: '#A7C3D1',
100 | 						300: '#7BAABF',
101 | 						400: '#5692AE',
102 | 						500: '#457B9D',
103 | 						600: '#345C75',
104 | 						700: '#233E4E',
105 | 						800: '#111F26',
106 | 						900: '#06090B'
107 | 					},
108 | 				}
109 | 			},
110 | 			borderRadius: {
111 | 				lg: 'var(--radius)',
112 | 				md: 'calc(var(--radius) - 2px)',
113 | 				sm: 'calc(var(--radius) - 4px)'
114 | 			},
115 | 			keyframes: {
116 | 				'accordion-down': {
117 | 					from: { height: '0' },
118 | 					to: { height: 'var(--radix-accordion-content-height)' }
119 | 				},
120 | 				'accordion-up': {
121 | 					from: { height: 'var(--radix-accordion-content-height)' },
122 | 					to: { height: '0' }
123 | 				},
124 | 				'fade-in': {
125 | 					'0%': { opacity: '0', transform: 'translateY(10px)' },
126 | 					'100%': { opacity: '1', transform: 'translateY(0)' }
127 | 				},
128 | 				'fade-out': {
129 | 					'0%': { opacity: '1', transform: 'translateY(0)' },
130 | 					'100%': { opacity: '0', transform: 'translateY(10px)' }
131 | 				},
132 | 				'scale-in': {
133 | 					'0%': { transform: 'scale(0.95)', opacity: '0' },
134 | 					'100%': { transform: 'scale(1)', opacity: '1' }
135 | 				},
136 | 				'scale-out': {
137 | 					from: { transform: 'scale(1)', opacity: '1' },
138 | 					to: { transform: 'scale(0.95)', opacity: '0' }
139 | 				},
140 | 				'slide-in-right': {
141 | 					'0%': { transform: 'translateX(100%)' },
142 | 					'100%': { transform: 'translateX(0)' }
143 | 				},
144 | 				'slide-out-right': {
145 | 					'0%': { transform: 'translateX(0)' },
146 | 					'100%': { transform: 'translateX(100%)' }
147 | 				},
148 | 				'pulse-subtle': {
149 | 					'0%, 100%': { opacity: '1' },
150 | 					'50%': { opacity: '0.8' }
151 | 				},
152 | 				'float': {
153 | 					'0%, 100%': { transform: 'translateY(0)' },
154 | 					'50%': { transform: 'translateY(-5px)' }
155 | 				}
156 | 			},
157 | 			animation: {
158 | 				'accordion-down': 'accordion-down 0.2s ease-out',
159 | 				'accordion-up': 'accordion-up 0.2s ease-out',
160 | 				'fade-in': 'fade-in 0.5s ease-out',
161 | 				'fade-out': 'fade-out 0.5s ease-out',
162 | 				'scale-in': 'scale-in 0.3s ease-out',
163 | 				'scale-out': 'scale-out 0.3s ease-out',
164 | 				'slide-in-right': 'slide-in-right 0.3s ease-out',
165 | 				'slide-out-right': 'slide-out-right 0.3s ease-out',
166 | 				'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
167 | 				'float': 'float 3s infinite ease-in-out'
168 | 			}
169 | 		}
170 | 	},
171 | 	plugins: [require("tailwindcss-animate")],
172 | } satisfies Config;
```

components.json
```
1 | {
2 |   "$schema": "https://ui.shadcn.com/schema.json",
3 |   "style": "default",
4 |   "rsc": false,
5 |   "tsx": true,
6 |   "tailwind": {
7 |     "config": "tailwind.config.ts",
8 |     "css": "src/index.css",
9 |     "baseColor": "slate",
10 |     "cssVariables": true,
11 |     "prefix": ""
12 |   },
13 |   "aliases": {
14 |     "components": "@/components",
15 |     "utils": "@/lib/utils",
16 |     "ui": "@/components/ui",
17 |     "lib": "@/lib",
18 |     "hooks": "@/hooks"
19 |   }
20 | }
```
