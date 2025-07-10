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

vite.config.ts
```
1 | import { defineConfig, loadEnv } from "vite";
2 | import react from "@vitejs/plugin-react-swc";
3 | import path from "path";
4 | import { componentTagger } from "lovable-tagger";
5 | 
6 | // https://vitejs.dev/config/
7 | export default defineConfig(({ mode }) => {
8 |   // Cargar variables de entorno
9 |   const env = loadEnv(mode, process.cwd(), '');
10 |   
11 |   return {
12 |     server: {
13 |       host: "::",
14 |       port: 8080,
15 |     },
16 |     plugins: [
17 |       react(),
18 |       mode === 'development' &&
19 |       componentTagger(),
20 |     ].filter(Boolean),
21 |     resolve: {
22 |       alias: {
23 |         "@": path.resolve(__dirname, "./src"),
24 |       },
25 |     },
26 |     envDir: './',
27 |     envPrefix: 'VITE_',
28 |     define: {
29 |       'process.env.VITE_ELEVENLABS_API_KEY': JSON.stringify(env.VITE_ELEVENLABS_API_KEY),
30 |     }
31 |   };
32 | });
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
