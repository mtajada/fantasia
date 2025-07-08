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
│   │   ├── browser-DwlrKuEJ.js
│   │   ├── index-BWB6Bb5y.js
│   │   ├── index-DZFj4YmF.css
│   │   ├── index.es-DED-MuZt.js
│   │   └── purify.es-CF4_YkFU.js
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
│   ├── PAUTAS_DE_DISENO.md
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
│   │   ├── IconLoadingAnimation.tsx
│   │   ├── LoadingAnimation.tsx
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
│   │   ├── StoryOptionCard.tsx
│   │   ├── StoryPdfPreview.tsx
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
│   │   ├── pdfService.ts
│   │   ├── storyPdfService.ts
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


supabase/functions/generate-story/index.ts
```
1 | // supabase/functions/generate-story/index.ts
2 | // v7.0 (OpenAI Client + JSON Output): Uses OpenAI client for Gemini, expects JSON.
3 | // IMPORTANT: prompt.ts has been updated to instruct AI for JSON output.
4 | import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
5 | import { corsHeaders } from '../_shared/cors.ts';
6 | import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
7 | import OpenAI from "npm:openai@^4.33.0"; // Using OpenAI client
8 | 
9 | // Importar funciones de prompt desde prompt.ts
10 | // createUserPrompt_JsonFormat (antes createUserPrompt_SeparatorFormat) ahora genera un prompt que pide JSON.
11 | import { createSystemPrompt, createUserPrompt_JsonFormat } from './prompt.ts';
12 | 
13 | // --- Helper Function (remains largely the same, adapted for potentially cleaner inputs from JSON) ---
14 | function cleanExtractedText(text: string | undefined | null, type: 'title' | 'content'): string {
15 |   const defaultText = type === 'title' ? `Aventura Inolvidable` : 'El cuento tiene un giro inesperado...';
16 |   if (text === null || text === undefined || typeof text !== 'string') {
17 |     console.warn(`[Helper v7.0] cleanExtractedText (${type}): Input empty/not string.`);
18 |     return defaultText;
19 |   }
20 |   console.log(`[Helper v7.0] cleanExtractedText (${type}) - BEFORE: "${text.substring(0, 150)}..."`);
21 |   let cleaned = text.trim();
22 | 
23 |   // These might be less necessary if AI strictly adheres to JSON values, but good for robustness
24 |   cleaned = cleaned.replace(/^Título:\s*/i, '').trim();
25 |   cleaned = cleaned.replace(/^Contenido:\s*/i, '').trim();
26 |   if (type === 'content') {
27 |     cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // Eliminar numeración de listas
28 |     cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, ''); // Eliminar viñetas de listas
29 |   }
30 |   if (type === 'title') {
31 |     cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim(); // Quitar comillas alrededor del título
32 |   }
33 |   cleaned = cleaned.replace(/^(Respuesta|Aquí tienes el título|El título es):\s*/i, '').trim();
34 |   cleaned = cleaned.replace(/^(Aquí tienes el cuento|El cuento es):\s*/i, '').trim();
35 | 
36 |   console.log(`[Helper v7.0] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
37 |   return cleaned || defaultText; // Ensure non-empty string or default
38 | }
39 | 
40 | // --- Interface for Structured AI Response ---
41 | interface StoryGenerationResult {
42 |   title: string;
43 |   content: string;
44 | }
45 | 
46 | function isValidStoryResult(data: any): data is StoryGenerationResult {
47 |   return data &&
48 |     typeof data.title === 'string' &&
49 |     typeof data.content === 'string';
50 | }
51 | 
52 | // --- Main Handler ---
53 | serve(async (req: Request) => {
54 |   const functionVersion = "v7.0 (OpenAI Client + JSON)";
55 |   // 1. MANEJAR PREFLIGHT PRIMERO
56 |   if (req.method === "OPTIONS") {
57 |     console.log(`[${functionVersion}] Handling OPTIONS preflight request...`);
58 |     return new Response("ok", { headers: corsHeaders });
59 |   }
60 | 
61 |   // --- Configuración para Grok ---
62 |   const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
63 |   const GROK_API_BASE_URL = 'https://api.x.ai/v1';
64 |   const MODEL_NAME = 'grok-3-mini'; // Modelo explícito
65 | 
66 |   if (!GROK_API_KEY) {
67 |     throw new Error("La variable de entorno GROK_API_KEY no está configurada.");
68 |   }
69 | 
70 |   // --- Inicializar cliente OpenAI para Grok ---
71 |   const openai = new OpenAI({
72 |     apiKey: GROK_API_KEY,
73 |     baseURL: GROK_API_BASE_URL,
74 |   });
75 |   console.log(`[${functionVersion}] Cliente OpenAI configurado para el modelo Grok '${MODEL_NAME}' vía baseURL: ${openai.baseURL}`);
76 | 
77 |   const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
78 |   const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
79 | 
80 |   if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
81 |     console.error("Supabase URL or Service Role Key not set");
82 |     throw new Error("Supabase URL or Service Role Key not set");
83 |   }
84 |   const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
85 | 
86 |   // 2. Verificar Método POST
87 |   if (req.method !== 'POST') {
88 |     console.log(`[${functionVersion}] Method ${req.method} not allowed.`);
89 |     return new Response(JSON.stringify({ error: 'Método no permitido. Usar POST.' }), {
90 |       status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
91 |     });
92 |   }
93 | 
94 |   let userId: string | null = null;
95 |   let userIdForIncrement: string | null = null;
96 | 
97 |   try {
98 |     // 3. AUTENTICACIÓN
99 |     console.log(`[${functionVersion}] Handling POST request...`);
100 |     const authHeader = req.headers.get('Authorization');
101 |     if (!authHeader || !authHeader.startsWith('Bearer ')) {
102 |       console.error("Authorization header missing or invalid.");
103 |       return new Response(JSON.stringify({ error: 'Token inválido o ausente.' }), {
104 |         status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
105 |       });
106 |     }
107 |     const token = authHeader.replace('Bearer ', '');
108 |     const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
109 | 
110 |     if (authError || !user) {
111 |       console.error("Auth Error:", authError);
112 |       return new Response(JSON.stringify({ error: authError?.message || 'No autenticado.' }), {
113 |         status: authError?.status || 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
114 |       });
115 |     }
116 |     userId = user.id;
117 |     console.log(`[${functionVersion}] User Auth: ${userId}`);
118 | 
119 |     // 4. Perfil y Límites
120 |     const { data: profile, error: profileError } = await supabaseAdmin
121 |       .from('profiles')
122 |       .select('subscription_status, monthly_stories_generated, language, preferences')
123 |       .eq('id', userId)
124 |       .maybeSingle();
125 | 
126 |     if (profileError) {
127 |       console.error(`Error fetching profile for ${userId}:`, profileError);
128 |       throw new Error(`Error al obtener perfil de usuario: ${profileError.message}`);
129 |     }
130 | 
131 |     let isPremiumUser = false;
132 |     if (profile) {
133 |       isPremiumUser = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
134 |     } else {
135 |       console.warn(`Perfil no encontrado para ${userId}. Tratando como gratuito.`);
136 |     }
137 | 
138 |     const currentStoriesGenerated = profile?.monthly_stories_generated ?? 0;
139 |     const FREE_STORY_LIMIT = 10;
140 | 
141 |     if (!isPremiumUser) {
142 |       userIdForIncrement = userId;
143 |       console.log(`[${functionVersion}] Free user ${userId}. Stories: ${currentStoriesGenerated}/${FREE_STORY_LIMIT}`);
144 |       if (currentStoriesGenerated >= FREE_STORY_LIMIT) {
145 |         return new Response(JSON.stringify({
146 |           error: `Límite mensual (${FREE_STORY_LIMIT}) alcanzado.`
147 |         }), {
148 |           status: 429,
149 |           headers: { ...corsHeaders, "Content-Type": "application/json" }
150 |         });
151 |       }
152 |     } else {
153 |       console.log(`[${functionVersion}] Premium user ${userId}.`);
154 |     }
155 | 
156 |     // 5. Body y Validación
157 |     let params: any;
158 |     try {
159 |       params = await req.json();
160 |       console.log(`[${functionVersion}] Params Received:`, JSON.stringify(params, null, 2));
161 |       console.log(`[${functionVersion}] Validating basic structure...`);
162 |       console.log(`[${functionVersion}] profile.language:`, profile?.language, typeof profile?.language);
163 |       console.log(`[${functionVersion}] profile.preferences:`, profile?.preferences ? 'provided' : 'none');
164 |       console.log(`[${functionVersion}] params.options:`, params.options);
165 |       if (params.options) {
166 |         console.log(`[${functionVersion}] params.options.format:`, params.options.format, typeof params.options.format);
167 |         console.log(`[${functionVersion}] params.options.genre:`, params.options.genre, typeof params.options.genre);
168 |         console.log(`[${functionVersion}] params.options.characters:`, params.options.characters);
169 |         console.log(`[${functionVersion}] params.options.character:`, params.options.character);
170 |       }
171 | 
172 |       // More detailed validation with debugging
173 |       console.log(`[${functionVersion}] Starting detailed validation...`);
174 | 
175 |       if (!params) {
176 |         console.error("[VALIDATION ERROR] params is null/undefined");
177 |         throw new Error("Parámetros inválidos: datos no recibidos.");
178 |       }
179 | 
180 |       if (typeof params !== 'object') {
181 |         console.error("[VALIDATION ERROR] params is not an object:", typeof params);
182 |         throw new Error("Parámetros inválidos: formato incorrecto.");
183 |       }
184 | 
185 |       if (!params.options) {
186 |         console.error("[VALIDATION ERROR] params.options is missing");
187 |         throw new Error("Parámetros inválidos: falta 'options'.");
188 |       }
189 | 
190 |       if (typeof params.options !== 'object') {
191 |         console.error("[VALIDATION ERROR] params.options is not an object:", typeof params.options);
192 |         throw new Error("Parámetros inválidos: 'options' debe ser un objeto.");
193 |       }
194 | 
195 |       // Validate individual fields with more detailed error messages
196 |       const errors = [];
197 | 
198 |       // Language and preferences come from profile, not params
199 |       if (!profile?.language || typeof profile.language !== 'string') {
200 |         errors.push('User profile must have a valid language setting');
201 |         console.error("[VALIDATION ERROR] profile.language:", profile?.language, typeof profile?.language);
202 |       }
203 | 
204 |       if (typeof params.options.format !== 'string' || !params.options.format) {
205 |         errors.push('options.format must be a non-empty string');
206 |         console.error("[VALIDATION ERROR] format:", params.options.format, typeof params.options.format);
207 |       }
208 | 
209 |       if (typeof params.options.genre !== 'string' || !params.options.genre) {
210 |         errors.push('options.genre must be a non-empty string');
211 |         console.error("[VALIDATION ERROR] genre:", params.options.genre, typeof params.options.genre);
212 |       }
213 | 
214 |       if (errors.length > 0) {
215 |         console.error("[VALIDATION ERROR] Basic validation failed:", errors);
216 |         throw new Error(`Invalid basic parameters: ${errors.join(', ')}.`);
217 |       }
218 | 
219 |       console.log(`[${functionVersion}] Basic validation passed!`);
220 | 
221 |       // Validate character data - support both legacy (character) and new (characters) formats
222 |       const hasMultipleCharacters = params.options.characters && Array.isArray(params.options.characters) && params.options.characters.length > 0;
223 |       const hasSingleCharacter = params.options.character && typeof params.options.character === 'object' && params.options.character.name;
224 | 
225 |       if (!hasMultipleCharacters && !hasSingleCharacter) {
226 |         console.error("Validation failed. No valid character data found:", {
227 |           hasCharacters: !!params.options.characters,
228 |           charactersIsArray: Array.isArray(params.options.characters),
229 |           charactersLength: params.options.characters?.length,
230 |           hasCharacter: !!params.options.character,
231 |           hasCharacterName: !!params.options.character?.name
232 |         });
233 |         throw new Error("Se requiere al menos un personaje válido (options.character.name o options.characters[] con al menos un elemento).");
234 |       }
235 | 
236 |       // Normalize to characters array for internal processing
237 |       let charactersArray;
238 |       if (hasMultipleCharacters) {
239 |         charactersArray = params.options.characters;
240 |         console.log(`[${functionVersion}] Multiple characters mode: ${charactersArray.length} characters`);
241 |       } else {
242 |         charactersArray = [params.options.character];
243 |         console.log(`[${functionVersion}] Single character mode (legacy): ${params.options.character.name}`);
244 |       }
245 | 
246 |       // Validate characters array (1-4 characters)
247 |       if (charactersArray.length > 4) {
248 |         throw new Error("Máximo 4 personajes permitidos por historia.");
249 |       }
250 | 
251 |       const invalidCharacters = charactersArray.filter(char =>
252 |         !char || typeof char !== 'object' || !char.name || typeof char.name !== 'string'
253 |       );
254 | 
255 |       if (invalidCharacters.length > 0) {
256 |         console.error("Validation failed. Invalid characters found:", invalidCharacters);
257 |         throw new Error("Todos los personajes deben tener un nombre válido.");
258 |       }
259 | 
260 |       console.log(`[${functionVersion}] Characters validated: ${charactersArray.map(c => c.name).join(', ')}`);
261 | 
262 |       // Store normalized characters array for use in prompts
263 |       params.options.characters = charactersArray;
264 | 
265 |     } catch (error) {
266 |       console.error(`[${functionVersion}] Failed to parse/validate JSON body for user ${userId}. Error:`, error);
267 |       const message = error instanceof Error ? error.message : "Error desconocido al procesar JSON.";
268 |       throw new Error(`Invalid/empty/incomplete JSON in body: ${message}.`);
269 |     }
270 | 
271 |     // 6. Generación IA con OpenAI Client y Esperando JSON
272 |     const systemPrompt = createSystemPrompt(profile?.language || 'en', profile?.preferences || null);
273 |     const userPrompt = createUserPrompt_JsonFormat({ // Esta función ahora genera un prompt pidiendo JSON
274 |       options: params.options,
275 |       additionalDetails: params.additionalDetails
276 |     });
277 |     const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
278 | 
279 |     console.log(`[${functionVersion}] Calling AI (${MODEL_NAME}) for JSON output (User: ${userId}). Prompt length: ${combinedPrompt.length}`);
280 | 
281 |     const chatCompletion = await openai.chat.completions.create({
282 |       model: MODEL_NAME, // Usando el modelo Grok explícito
283 |       messages: [{ role: "user", content: combinedPrompt }],
284 |       response_format: { type: "json_object" }, // Request JSON output
285 |       temperature: 0.8,
286 |       top_p: 0.95,
287 |       max_tokens: 8000 // Ajustado a un límite razonable para Sonnet
288 |     });
289 | 
290 |     const aiResponseContent = chatCompletion.choices[0]?.message?.content;
291 |     const finishReason = chatCompletion.choices[0]?.finish_reason;
292 | 
293 |     console.log(`[${functionVersion}] Raw AI JSON response (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No text received)'}... Finish Reason: ${finishReason}`);
294 | 
295 |     if (finishReason === 'length') {
296 |       console.warn(`[${functionVersion}] AI generation may have been truncated due to 'length' finish_reason.`);
297 |     }
298 |     // Nota: blockReason específico como en GoogleGenerativeAI no está directamente disponible.
299 |     // Se confía en finish_reason o contenido vacío para problemas.
300 | 
301 |     // 7. Procesar Respuesta JSON de la IA
302 |     let finalTitle = 'Aventura Inolvidable'; // Default
303 |     let finalContent = ''; // Default
304 |     let parsedSuccessfully = false;
305 | 
306 |     if (aiResponseContent) {
307 |       try {
308 |         const storyResult: StoryGenerationResult = JSON.parse(aiResponseContent);
309 |         if (isValidStoryResult(storyResult)) {
310 |           finalTitle = cleanExtractedText(storyResult.title, 'title');
311 |           finalContent = cleanExtractedText(storyResult.content, 'content');
312 |           parsedSuccessfully = true;
313 |           console.log(`[${functionVersion}] Parsed AI JSON successfully. Title: "${finalTitle}"`);
314 |         } else {
315 |           console.warn(`[${functionVersion}] AI response JSON structure is invalid. Received: ${aiResponseContent.substring(0, 500)}...`);
316 |         }
317 |       } catch (parseError) {
318 |         console.error(`[${functionVersion}] Failed to parse JSON from AI response. Error: ${parseError.message}. Raw content: ${aiResponseContent.substring(0, 500)}...`);
319 |       }
320 |     } else {
321 |       console.error(`[${functionVersion}] AI response was empty or text could not be extracted. Finish Reason: ${finishReason}`);
322 |     }
323 | 
324 |     if (!parsedSuccessfully) {
325 |       console.warn(`[${functionVersion}] Using fallback: Default title, and attempting to use raw AI response (if any) as content (after cleaning).`);
326 |       finalContent = cleanExtractedText(aiResponseContent, 'content'); // aiResponseContent could be null here
327 |       // finalTitle remains the default 'Aventura Inolvidable'
328 |     }
329 | 
330 |     if (!finalContent) {
331 |       console.error(`[${functionVersion}] Content is empty even after JSON parsing/fallback and cleaning.`);
332 |       // Considerar devolver la respuesta cruda o un mensaje de error específico
333 |       finalContent = "Hubo un problema al generar el contenido del cuento, pero aquí está la respuesta cruda de la IA (puede no estar formateada): " + (aiResponseContent || "No se recibió respuesta de la IA.");
334 |     }
335 | 
336 |     console.log(`[${functionVersion}] Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);
337 | 
338 |     // 8. Incrementar Contador
339 |     if (userIdForIncrement) {
340 |       console.log(`[${functionVersion}] Incrementing count for ${userIdForIncrement}...`);
341 |       const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
342 |         user_uuid: userIdForIncrement
343 |       });
344 |       if (incrementError) {
345 |         console.error(`[${functionVersion}] CRITICAL: Failed count increment for ${userIdForIncrement}: ${incrementError.message}`);
346 |       } else {
347 |         console.log(`[${functionVersion}] Count incremented for ${userIdForIncrement}.`);
348 |       }
349 |     }
350 | 
351 |     // 9. Respuesta Final
352 |     return new Response(JSON.stringify({
353 |       content: finalContent,
354 |       title: finalTitle
355 |     }), {
356 |       status: 200,
357 |       headers: { ...corsHeaders, "Content-Type": "application/json" }
358 |     });
359 | 
360 |   } catch (error) {
361 |     // 10. Manejo de Errores
362 |     console.error(`[${functionVersion}] Error (User: ${userId || 'UNKNOWN'}):`, error);
363 |     let statusCode = 500;
364 |     const message = error instanceof Error ? error.message : "Error interno desconocido.";
365 | 
366 |     if (error instanceof Error) {
367 |       const lowerMessage = message.toLowerCase();
368 |       if (lowerMessage.includes("autenticado") || lowerMessage.includes("token inválido")) statusCode = 401;
369 |       else if (lowerMessage.includes("límite")) statusCode = 429;
370 |       else if (lowerMessage.includes("inválido") || lowerMessage.includes("json in body") || lowerMessage.includes("parámetros")) statusCode = 400;
371 |       // Actualizado para errores de IA con JSON
372 |       else if (lowerMessage.includes("ai response was not valid json") || lowerMessage.includes("ai response was empty") || lowerMessage.includes("ai response json structure is invalid") || lowerMessage.includes("blocked") || lowerMessage.includes("filter")) statusCode = 502; // Bad Gateway
373 |     }
374 | 
375 |     return new Response(JSON.stringify({
376 |       error: `Error procesando solicitud: ${message}`
377 |     }), {
378 |       status: statusCode,
379 |       headers: { ...corsHeaders, "Content-Type": "application/json" }
380 |     });
381 |   }
382 | });
```

supabase/functions/generate-story/prompt.ts
```
1 | // supabase/edge-functions/generate-story/prompt.ts
2 | // v8.0 (Adult Content + Preferences): Contiene las funciones para generar los prompts de contenido adulto.
3 | // createUserPrompt_JsonFormat ahora instruye a la IA para devolver JSON con contenido erótico.
4 | 
5 | // createSystemPrompt: El contenido textual de la guía para la IA ahora enfocado en contenido adulto.
6 | export function createSystemPrompt(language: string, preferences?: string | null): string {
7 |     console.log(`[Adult Content v8.0] createSystemPrompt: lang=${language}, preferences=${preferences ? 'provided' : 'none'}`);
8 | 
9 |     let base = `You are an expert writer creating personalized erotic stories for adults. Write always in ${language}, with sophisticated and sensual language appropriate for mature audiences (18+).`;
10 |     
11 |     if (preferences && preferences.trim()) {
12 |         base += ` The user has specified these preferences and interests: "${preferences.trim()}". Incorporate these elements thoughtfully and naturally into the story to create a personalized experience.`;
13 |         base += ` Guidelines for user preferences:\n`;
14 |         base += `   - **Respect Boundaries:** Only include elements that align with the specified preferences\n`;
15 |         base += `   - **Natural Integration:** Weave preferences into the plot organically, don't force them\n`;
16 |         base += `   - **Quality Focus:** Prioritize good storytelling over just including fetishes\n`;
17 |         base += `   - **Consent & Positivity:** All interactions should be consensual and positive\n`;
18 |         base += `   - **Character Development:** Use preferences to enhance character depth and relationships\n`;
19 |     } else {
20 |         base += ` Since no specific preferences were provided, create a sensual and engaging story with broad adult appeal, focusing on romance, attraction, and intimate connections.`;
21 |     }
22 |     
23 |     base += ` The story should follow a clear narrative structure: an engaging beginning that sets the mood, development with building tension and desire, and a satisfying climax and resolution.`;
24 |     base += ` Use sophisticated and evocative language that creates atmosphere and emotional connection. Focus on character development, sensual descriptions, and meaningful intimate moments.`;
25 |     base += ` Ensure all content is consensual, positive, and celebrates adult sexuality in a healthy and appealing way.`;
26 |     
27 |     return base;
28 | }
29 | 
30 | // Definición de tipos para las opciones del prompt de usuario (actualizado para múltiples personajes)
31 | interface CharacterOptions {
32 |     name: string;
33 |     gender: 'male' | 'female' | 'non-binary';
34 |     description: string;
35 | }
36 | 
37 | interface UserPromptOptions {
38 |     characters: CharacterOptions[];   // Unified: array de personajes (1-4)
39 |     genre: string;
40 |     format?: string;
41 |     language?: string;
42 | }
43 | 
44 | interface CreateUserPromptParams {
45 |     options: UserPromptOptions;
46 |     additionalDetails?: string;
47 | }
48 | 
49 | // createUserPrompt_JsonFormat: Anteriormente createUserPrompt_SeparatorFormat.
50 | // Modificada para instruir a la IA a devolver un objeto JSON con contenido adulto.
51 | export function createUserPrompt_JsonFormat({ options, additionalDetails }: CreateUserPromptParams): string {
52 |     console.log(`[Adult Content v8.0] createUserPrompt_JsonFormat:`, options, `details=`, additionalDetails);
53 |     const storyFormat = options.format || 'episodic';
54 |     const language = options.language || 'en';
55 | 
56 |     // Unified character system - always use characters array (1-4 characters)
57 |     const characters = options.characters || [];
58 |     const isMultipleCharacters = characters.length > 1;
59 | 
60 |     // Create base request with character handling
61 |     let request = `Create an erotic story for adults. Genre: ${options.genre}. `;
62 |     
63 |     if (isMultipleCharacters) {
64 |         request += `Main Characters (${characters.length}): `;
65 |         characters.forEach((char, index) => {
66 |             request += `${index + 1}. ${char.name}`;
67 |             request += `, gender: ${char.gender}`;
68 |             request += `, description: ${char.description}`;
69 |             if (index < characters.length - 1) request += '; ';
70 |         });
71 |         request += `.\n\n`;
72 |         
73 |         // Add specific instructions for multiple characters
74 |         request += `**Instructions for multiple characters:**\n`;
75 |         request += `- Ensure ALL characters have significant participation in the story\n`;
76 |         request += `- Each character should contribute uniquely based on their gender and personal description\n`;
77 |         request += `- Create natural and dynamic interactions between characters\n`;
78 |         request += `- Develop romantic/erotic tension and relationships between characters as appropriate\n`;
79 |         request += `- Keep the story focused and coherent despite multiple protagonists\n\n`;
80 |     } else {
81 |         const char = characters[0];
82 |         request += `Main Character: ${char.name}`;
83 |         request += `, gender: ${char.gender}`;
84 |         request += `, description: ${char.description}`;
85 |         request += `.\n\n`;
86 |     }
87 | 
88 |     // Content and structure instructions for adult content
89 |     request += `**Content, Length and Structure Instructions:**\n`;
90 |     request += `1. **Story Format:** '${storyFormat}'.\n`;
91 |     
92 |     if (storyFormat === 'single') {
93 |         request += `    * Complete Story: ~2150 tokens (~1600-1800 words).\n`;
94 |         request += `    * This should be a complete story with clear beginning, development, climax, and satisfying conclusion.\n`;
95 |         request += `    * Include full character development and resolve all plot elements.\n`;
96 |     } else {
97 |         request += `    * Episodic Chapter: ~1350 tokens (~1000-1200 words).\n`;
98 |         request += `    * This should be the first chapter of an ongoing story with an open ending.\n`;
99 |         request += `    * Leave room for future chapters and continuation of the adventure.\n`;
100 |         request += `    * Focus on establishing characters, setting, and initial erotic tension.\n`;
101 |     }
102 | 
103 |     // Additional user details (if any)
104 |     if (additionalDetails && typeof additionalDetails === 'string' && additionalDetails.trim()) {
105 |         request += `\n**Additional user instructions:**\n${additionalDetails.trim()}\n`;
106 |     }
107 | 
108 |     request += `2. **Structure Guidelines:**\n`;
109 |     if (storyFormat === 'single') {
110 |         request += `    * Clear beginning, development, climax, and satisfying conclusion\n`;
111 |         request += `    * Complete character arcs and resolution of conflicts\n`;
112 |         request += `    * Full exploration of the erotic theme and relationship dynamics\n`;
113 |     } else {
114 |         request += `    * Engaging opening that establishes setting and characters\n`;
115 |         request += `    * Build initial attraction and erotic tension\n`;
116 |         request += `    * End with anticipation and desire for continuation\n`;
117 |     }
118 |     request += `3. **Tone and Style:** Use sophisticated, sensual language that builds atmosphere and emotional connection. Create vivid scenes that engage the reader's imagination.\n`;
119 |     request += `4. **Adult Content Guidelines:** All interactions must be consensual and positive. Focus on emotional connection alongside physical attraction. Build tension and desire naturally through the narrative.\n`;
120 |     request += `5. **Character Development:** Create believable, complex characters with desires and motivations. Show their emotional journey alongside the physical story.\n`;
121 |     
122 |     request += `6. **Title:** Generate an extraordinary title (memorable, evocative, intriguing). The title should follow "Sentence case" style. The title must be written in the same language selected for the story: ${language}.\n`;
123 | 
124 |     // JSON format instructions (unchanged)
125 |     request += `\n**Response format instructions (VERY IMPORTANT!):**\n`;
126 |     request += `* You must respond with a SINGLE JSON object.\n`;
127 |     request += `* The JSON object must have exactly two keys: "title" and "content".\n`;
128 |     request += `* The "title" key value should be a string containing ONLY the generated title (ideally 4-7 words), following the title guidelines above (${language} language, "Sentence case").\n`;
129 |     request += `* The "content" key value should be a string with ALL the story content, starting directly with the first sentence of the story.\n`;
130 |     request += `* Example of expected JSON format: {"title": "An extraordinary title here", "content": "Once upon a time in a distant place..."}\n`;
131 |     request += `* Do NOT include ANYTHING before the '{' character that starts the JSON object.\n`;
132 |     request += `* Do NOT include ANYTHING after the '}' character that ends the JSON object.\n`;
133 |     request += `* Ensure the JSON is valid and complete.\n`;
134 |     request += `* Do NOT use markdown or any other formatting INSIDE the JSON strings unless it's part of the natural story text.\n`;
135 | 
136 |     return request;
137 | }
```

supabase/functions/story-continuation/index.ts
```
1 | // supabase/edge-functions/story-continuation/index.ts
2 | // v8.0 (Adult Content + Preferences): Uses OpenAI client for Gemini, expects structured JSON. Adult content with preferences.
3 | import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
4 | import { corsHeaders } from '../_shared/cors.ts';
5 | import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
6 | import OpenAI from "npm:openai@^4.33.0";
7 | 
8 | import {
9 |   createContinuationOptionsPrompt,
10 |   createContinuationPrompt,
11 |   type Story, // Assuming Story type is defined in prompt.ts
12 |   type Chapter, // Assuming Chapter type is defined in prompt.ts
13 |   type ContinuationContextType,
14 | } from './prompt.ts';
15 | 
16 | // --- Configuración Global para Grok ---
17 | const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
18 | const GROK_API_BASE_URL = 'https://api.x.ai/v1';
19 | const MODEL_NAME = 'grok-3-mini'; // Modelo explícito
20 | 
21 | if (!GROK_API_KEY) {
22 |   throw new Error("La variable de entorno GROK_API_KEY no está configurada.");
23 | }
24 | 
25 | const openai = new OpenAI({
26 |   apiKey: GROK_API_KEY,
27 |   baseURL: GROK_API_BASE_URL,
28 | });
29 | const functionVersion = "v8.0 (Adult Content + Preferences)";
30 | console.log(`story-continuation ${functionVersion}: Using model ${MODEL_NAME} via ${openai.baseURL}`);
31 | 
32 | const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
33 | const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
34 | if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase URL or Service Role Key not set");
35 | const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
36 | 
37 | // --- Interfaces for AI JSON Responses ---
38 | interface AiContinuationOption {
39 |   summary: string;
40 | }
41 | interface AiContinuationOptionsResponse {
42 |   options: AiContinuationOption[];
43 | }
44 | interface AiContinuationResponse {
45 |   title: string;
46 |   content: string;
47 | }
48 | 
49 | // --- Validation functions for AI responses ---
50 | function isValidOptionsResponse(data: any): data is AiContinuationOptionsResponse {
51 |   return data &&
52 |     Array.isArray(data.options) &&
53 |     data.options.every((opt: any) => typeof opt.summary === 'string' && opt.summary.trim() !== '');
54 | }
55 | 
56 | function isValidContinuationResponse(data: any): data is AiContinuationResponse {
57 |   return data &&
58 |     typeof data.title === 'string' && // Title can be empty initially, cleanExtractedText handles default
59 |     typeof data.content === 'string' && data.content.trim() !== '';
60 | }
61 | 
62 | 
63 | // --- Funciones Helper ---
64 | async function generateContinuationOptions(
65 |   story: Story,
66 |   chapters: Chapter[],
67 |   language: string = 'en',
68 |   preferences: string | null = null,
69 | ): Promise<AiContinuationOptionsResponse> {
70 |   console.log(`[${functionVersion}] generateContinuationOptions for story ${story?.id}`);
71 | 
72 |   if (!story || !story.id || !story.title || !story.content || !story.options) {
73 |     throw new Error("Datos de historia inválidos/incompletos para generar opciones.");
74 |   }
75 |   if (!Array.isArray(chapters)) {
76 |     throw new Error("Datos de capítulos inválidos para generar opciones.");
77 |   }
78 | 
79 |   const prompt = createContinuationOptionsPrompt(story, chapters, language, preferences);
80 |   console.log(`[${functionVersion}] Prompt para generación de opciones (lang: ${language}):\n---\n${prompt.substring(0, 300)}...\n---`);
81 | 
82 |   let aiResponseContent: string | null = null;
83 |   try {
84 |     const chatCompletion = await openai.chat.completions.create({
85 |       model: MODEL_NAME,
86 |       messages: [{ role: "user", content: prompt }],
87 |       response_format: { type: "json_object" },
88 |       temperature: 0.7,
89 |       max_tokens: 8000, // Ajustado
90 |     });
91 | 
92 |     aiResponseContent = chatCompletion.choices[0]?.message?.content;
93 |     const finishReason = chatCompletion.choices[0]?.finish_reason;
94 | 
95 |     console.log(`[${functionVersion}] Raw AI JSON for options (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No content received)'}... Finish Reason: ${finishReason}`);
96 | 
97 |     if (finishReason === 'length') {
98 |       console.warn(`[${functionVersion}] AI option generation may have been truncated.`);
99 |     }
100 |     if (!aiResponseContent) {
101 |       throw new Error("Respuesta vacía de la IA para las opciones.");
102 |     }
103 | 
104 |     const parsedResponse = JSON.parse(aiResponseContent);
105 | 
106 |     if (isValidOptionsResponse(parsedResponse)) {
107 |       console.log(`[${functionVersion}] Opciones JSON parseadas y validadas:`, parsedResponse.options);
108 |       return parsedResponse; // Return the whole object: { options: [...] }
109 |     }
110 |     console.error(`[${functionVersion}] Formato de opciones inválido después de parsear. Data:`, parsedResponse);
111 |     throw new Error("Formato de opciones inválido después de parsear el JSON de la IA.");
112 | 
113 |   } catch (e: any) {
114 |     console.error(`[${functionVersion}] Error procesando la respuesta de la IA para las opciones: ${e.message}. Raw response: ${aiResponseContent?.substring(0, 500)}`, e);
115 |     // Fallback
116 |     const defaultOptions = [
117 |       { summary: language.startsWith('en') ? "Continue the intimate encounter" : "Continuar el encuentro íntimo" },
118 |       { summary: language.startsWith('en') ? "Explore deeper desires" : "Explorar deseos más profundos" },
119 |       { summary: language.startsWith('en') ? "Try something new together" : "Probar algo nuevo juntos" }
120 |     ].map(opt => ({ summary: `${opt.summary} (${language.startsWith('en') ? 'default option' : 'opción por defecto'})` }));
121 |     return { options: defaultOptions };
122 |   }
123 | }
124 | 
125 | // cleanExtractedText: Se mantiene, ya que procesa strings provenientes de la IA (dentro del JSON).
126 | function cleanExtractedText(text: string | undefined | null, type: 'title' | 'content'): string {
127 |   const defaultText = type === 'title' ? `A New Chapter` : 'The story continues mysteriously...';
128 |   if (text === null || text === undefined || typeof text !== 'string') { // Allow empty string from AI, will return default
129 |     console.warn(`[${functionVersion}] cleanExtractedText (${type}): Input null, undefined, or not a string.`);
130 |     return defaultText;
131 |   }
132 |   // No console.log BEFORE for potentially very long content strings.
133 |   let cleaned = text;
134 |   // Markdown fences around the *whole string* should not happen with response_format: json_object,
135 |   // but if AI puts them *inside* a JSON string value, this might be useful.
136 |   // However, the primary instruction is AI should not use markdown *inside* string values unless natural.
137 |   // cleaned = cleaned.replace(/^```(?:json|text)?\s*([\s\S]*?)\s*```$/gm, '$1').trim(); // Less likely needed now
138 | 
139 |   cleaned = cleaned.trim(); // Trim first
140 |   cleaned = cleaned.replace(/^(Título|Title|Contenido|Content|Respuesta|Response):\s*/i, '').trim();
141 |   cleaned = cleaned.replace(/^(Aquí tienes el (título|contenido|cuento|capítulo)|Claro, aquí está el (título|contenido|cuento|capítulo)):\s*/i, '').trim();
142 |   cleaned = cleaned.replace(/\n\n\(Espero que te guste.*$/i, '').trim();
143 |   cleaned = cleaned.replace(/\n\n\[.*?\]$/i, '').trim();
144 | 
145 |   if (type === 'content') {
146 |     cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
147 |     cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, '');
148 |   }
149 |   if (type === 'title') {
150 |     cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim();
151 |   }
152 |   cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
153 |   // console.log(`[${functionVersion}] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
154 |   return cleaned.trim() || defaultText; // Ensure it returns default if cleaning results in empty
155 | }
156 | // --- Fin Funciones Helper ---
157 | 
158 | serve(async (req: Request) => {
159 |   if (req.method === "OPTIONS") {
160 |     return new Response("ok", { headers: corsHeaders });
161 |   }
162 |   if (req.method !== 'POST') {
163 |     return new Response(JSON.stringify({ error: 'Método no permitido. Usar POST.' }), {
164 |       status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
165 |     });
166 |   }
167 | 
168 |   let requestedAction = 'unknown';
169 |   let userId: string | null = null;
170 | 
171 |   try {
172 |     console.log(`[${functionVersion}] Handling POST request...`);
173 |     const authHeader = req.headers.get('Authorization');
174 |     if (!authHeader || !authHeader.startsWith('Bearer ')) {
175 |       console.error("Authorization header missing or invalid.");
176 |       return new Response(JSON.stringify({ error: 'Token inválido o ausente.' }), {
177 |         status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
178 |       });
179 |     }
180 |     const token = authHeader.replace('Bearer ', '');
181 |     const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
182 |     if (authError || !user) {
183 |       console.error("Auth Error:", authError);
184 |       return new Response(JSON.stringify({ error: authError?.message || 'No autenticado.' }), {
185 |         status: authError?.status || 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
186 |       });
187 |     }
188 |     userId = user.id;
189 |     console.log(`[${functionVersion}] User Auth: ${userId}`);
190 | 
191 |     let body: any;
192 |     try {
193 |       body = await req.json();
194 |       if (!body || typeof body !== 'object') throw new Error("Parsed body is not an object.");
195 |     } catch (error: any) {
196 |       console.error(`[${functionVersion}] Failed to parse JSON body for user ${userId}. Error:`, error);
197 |       throw new Error(`Invalid/empty JSON in body: ${error.message}.`);
198 |     }
199 | 
200 |     const { action, story, chapters = [], selectedOptionSummary, userDirection } = body;
201 |     requestedAction = action || 'unknown';
202 |     const story_id = story?.id;
203 | 
204 |     const isContinuationAction = ['freeContinuation', 'optionContinuation', 'directedContinuation'].includes(action);
205 |     const requiresStoryForContext = isContinuationAction || action === 'generateOptions';
206 | 
207 |     // Validaciones de entrada (largely same as v6.1)
208 |     if (!action) throw new Error("'action' es requerida.");
209 |     if (requiresStoryForContext) {
210 |       if (!story || typeof story !== 'object' || !story_id) {
211 |         throw new Error(`Objeto 'story' (con 'id') inválido/ausente para la acción '${action}'.`);
212 |       }
213 |       // Validate story has required content and at least one character
214 |       const hasCharacterData = (story.options.characters && story.options.characters.length > 0) || story.options.character?.name;
215 |       if (!story.content || !story.options || !hasCharacterData || !story.title) {
216 |         console.error("Story validation failed:", {
217 |           hasContent: !!story.content,
218 |           hasOptions: !!story.options,
219 |           hasCharacterData: hasCharacterData,
220 |           hasTitle: !!story.title,
221 |           charactersCount: story.options.characters?.length || 0,
222 |           primaryCharacterName: story.options.characters?.[0]?.name
223 |         });
224 |         throw new Error("Datos incompletos en el objeto 'story' recibido (content, options con al menos un personaje, title son necesarios).");
225 |       }
226 |       if (!Array.isArray(chapters)) {
227 |         throw new Error(`Array 'chapters' requerido (puede ser vacío) para la acción '${action}'.`);
228 |       }
229 |     }
230 |     if (action === 'optionContinuation' && (typeof selectedOptionSummary !== 'string' || !selectedOptionSummary.trim())) {
231 |       throw new Error("'selectedOptionSummary' (string no vacío) requerido para 'optionContinuation'.");
232 |     }
233 |     if (action === 'directedContinuation' && (typeof userDirection !== 'string' || !userDirection.trim())) {
234 |       throw new Error("'userDirection' (string no vacío) requerido para 'directedContinuation'.");
235 |     }
236 | 
237 |     // Get preferences from profile instead of legacy parameters
238 |     const { data: profile } = await supabaseAdmin
239 |       .from('profiles')
240 |       .select('language, preferences')
241 |       .eq('id', userId)
242 |       .single();
243 | 
244 |     const language = profile?.language || story?.options?.language || 'en';
245 |     const preferences = profile?.preferences || null;
246 |     const storyFormat = body.storyFormat || story?.options?.format || 'episodic';
247 | 
248 |     // Límites (largely same logic as v6.1)
249 |     if (isContinuationAction) {
250 |       const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('subscription_status').eq('id', userId).maybeSingle();
251 |       if (profileError) throw new Error("Error al verificar el perfil de usuario para límites.");
252 | 
253 |       const isPremium = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
254 |       if (!isPremium) {
255 |         const { count: chapterCount, error: countError } = await supabaseAdmin.from('story_chapters')
256 |           .select('*', { count: 'exact', head: true })
257 |           .eq('story_id', story_id);
258 |         if (countError) throw new Error("Error al verificar límites de continuación.");
259 | 
260 |         const FREE_CHAPTER_LIMIT = 2; // Límite de capítulos *adicionales* generables (no se si el capitulo 0 lo cuenta)
261 |         if (chapterCount !== null && chapterCount >= FREE_CHAPTER_LIMIT) {
262 |           return new Response(JSON.stringify({ error: 'Límite de continuaciones gratuitas alcanzado.' }), {
263 |             status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
264 |           });
265 |         }
266 |       }
267 |     }
268 | 
269 |     // --- Ejecutar Acción Principal ---
270 |     let responsePayload: any = {}; // Use 'any' for flexibility, or a union type
271 |     console.log(`[${functionVersion}] Executing action: ${action} for user ${userId}, story ${story_id || 'N/A'}`);
272 | 
273 |     if (action === 'generateOptions') {
274 |       const optionsResponse = await generateContinuationOptions(story as Story, chapters as Chapter[], language, preferences);
275 |       responsePayload = optionsResponse; // This is already { options: [...] }
276 |     } else if (isContinuationAction) {
277 |       const continuationContext: ContinuationContextType = {};
278 |       if (action === 'optionContinuation') continuationContext.optionSummary = selectedOptionSummary;
279 |       if (action === 'directedContinuation') continuationContext.userDirection = userDirection;
280 | 
281 |       const continuationPrompt = createContinuationPrompt(
282 |         action as 'freeContinuation' | 'optionContinuation' | 'directedContinuation',
283 |         story as Story,
284 |         chapters as Chapter[],
285 |         continuationContext,
286 |         language,
287 |         preferences,
288 |         storyFormat
289 |       );
290 | 
291 |       console.log(`[${functionVersion}] Calling AI for continuation. Prompt start: ${continuationPrompt.substring(0, 200)}...`);
292 | 
293 |       const chatCompletion = await openai.chat.completions.create({
294 |         model: MODEL_NAME,
295 |         messages: [{ role: "user", content: continuationPrompt }],
296 |         response_format: { type: "json_object" },
297 |         temperature: 0.8,
298 |         top_p: 0.95,
299 |         max_tokens: 8000 // Ajustado
300 |       });
301 | 
302 |       const aiResponseContent = chatCompletion.choices[0]?.message?.content;
303 |       const finishReason = chatCompletion.choices[0]?.finish_reason;
304 |       console.log(`[${functionVersion}] Raw AI JSON for continuation (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No content received)'}... Finish Reason: ${finishReason}`);
305 | 
306 |       if (finishReason === 'content_filter') {
307 |         console.error(`[${functionVersion}] AI Continuation Generation BLOCKED due to content filter.`);
308 |         throw new Error(`Generación de continuación bloqueada por seguridad: filtro de contenido.`);
309 |       }
310 |       if (finishReason === 'length') {
311 |         console.warn(`[${functionVersion}] AI continuation generation may have been truncated.`);
312 |       }
313 |       if (!aiResponseContent) {
314 |         throw new Error("Fallo al generar continuación: Respuesta IA vacía (sin bloqueo explícito).");
315 |       }
316 | 
317 |       let finalTitle = 'Un Nuevo Capítulo'; // Default
318 |       let finalContent = '';
319 |       let parsedSuccessfully = false;
320 | 
321 |       try {
322 |         const parsedResponse = JSON.parse(aiResponseContent);
323 |         if (isValidContinuationResponse(parsedResponse)) {
324 |           finalTitle = cleanExtractedText(parsedResponse.title, 'title');
325 |           finalContent = cleanExtractedText(parsedResponse.content, 'content');
326 |           parsedSuccessfully = true;
327 |           console.log(`[${functionVersion}] Parsed AI continuation JSON successfully.`);
328 |         } else {
329 |           console.warn(`[${functionVersion}] AI continuation response JSON structure invalid. Data:`, parsedResponse);
330 |         }
331 |       } catch (parseError: any) {
332 |         console.error(`[${functionVersion}] Failed to parse JSON from AI continuation response. Error: ${parseError.message}. Raw: ${aiResponseContent.substring(0, 300)}`);
333 |       }
334 | 
335 |       if (!parsedSuccessfully) {
336 |         console.warn(`[${functionVersion}] Using fallback for continuation: Default title, full raw response as content (if available).`);
337 |         finalContent = cleanExtractedText(aiResponseContent, 'content'); // aiResponseContent might be the non-JSON string
338 |       }
339 | 
340 |       if (!finalContent) { // If content is still empty after parsing/fallback and cleaning
341 |         console.error(`[${functionVersion}] Critical error: Final continuation content is empty after all processing.`);
342 |         finalContent = language.startsWith('en') ? "The story couldn't continue this time. Try another option or a new direction." : "La historia no pudo continuar esta vez. Intenta con otra opción o una nueva dirección.";
343 |         // Optionally throw, but providing a message might be better UX for continuations
344 |       }
345 | 
346 |       console.log(`[${functionVersion}] Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);
347 |       responsePayload = { content: finalContent, title: finalTitle };
348 | 
349 |     } else {
350 |       throw new Error(`Acción no soportada: ${action}`);
351 |     }
352 | 
353 |     console.log(`[${functionVersion}] Action ${action} completed successfully for ${userId}.`);
354 |     return new Response(JSON.stringify(responsePayload), {
355 |       status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
356 |     });
357 | 
358 |   } catch (error: any) {
359 |     console.error(`Error in ${functionVersion} (User: ${userId || 'UNKNOWN'}, Action: ${requestedAction}):`, error.message, error.stack);
360 |     let statusCode = 500;
361 |     const lowerMessage = error.message.toLowerCase();
362 | 
363 |     if (lowerMessage.includes("token inválido") || lowerMessage.includes("no autenticado")) statusCode = 401;
364 |     else if (lowerMessage.includes("límite de continuaciones")) statusCode = 403;
365 |     else if (lowerMessage.includes("json in body") || lowerMessage.includes("inválido/ausente") || lowerMessage.includes("requerido")) statusCode = 400;
366 |     else if (lowerMessage.includes("bloqueada por seguridad") || lowerMessage.includes("respuesta ia vacía") || lowerMessage.includes("filtro de contenido")) statusCode = 502;
367 |     else if (lowerMessage.includes("acción no soportada")) statusCode = 400;
368 | 
369 |     return new Response(JSON.stringify({ error: `Error procesando solicitud (${requestedAction}): ${error.message}` }), {
370 |       status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
371 |     });
372 |   }
373 | });
```

supabase/functions/story-continuation/prompt.ts
```
1 | // supabase/edge-functions/story-continuation/prompt.ts
2 | // v8.0 (Adult Content + Preferences): Prompts para la continuación de historias adultas.
3 | // Ahora incluye el contenido COMPLETO de los capítulos anteriores en el contexto.
4 | 
5 | // --- Tipos (asumidos/definidos según el uso en index.ts) ---
6 | export interface CharacterOptions {
7 |     name: string;
8 |     gender: 'male' | 'female' | 'non-binary';
9 |     description: string;
10 | }
11 | 
12 | export interface StoryOptions {
13 |     characters: CharacterOptions[];   // Unified: array de personajes (1-4)
14 |     genre: string;
15 |     format?: string; // 'single', 'episodic'
16 |     language?: string;
17 | }
18 | 
19 | export interface Story {
20 |     id: string;
21 |     title: string; // Título general de la historia
22 |     content: string; // Contenido del capítulo inicial (o la historia base si no hay capítulos)
23 |     options: StoryOptions;
24 | }
25 | 
26 | export interface Chapter {
27 |     id: string;
28 |     chapter_number: number;
29 |     title: string;
30 |     content: string;
31 | }
32 | 
33 | export interface ContinuationContextType {
34 |     optionSummary?: string;
35 |     userDirection?: string;
36 | }
37 | 
38 | // --- Funciones de Prompt ---
39 | 
40 | /**
41 |  * Crea el prompt para generar opciones de continuación para contenido adulto.
42 |  * Ahora incluye el contenido completo de la historia y capítulos anteriores.
43 |  */
44 | export function createContinuationOptionsPrompt(
45 |     story: Story,
46 |     chapters: Chapter[],
47 |     language: string = 'en',
48 |     preferences: string | null = null,
49 | ): string {
50 |     const functionVersion = "v8.0 (Adult Content + Preferences)";
51 |     console.log(`[Prompt Helper ${functionVersion}] createContinuationOptionsPrompt for story ID: ${story.id}, lang: ${language}`);
52 | 
53 |     let prompt = `You are a creative assistant expert in generating interesting and coherent continuations for erotic stories for adults.
54 |   Primary Story Language: ${language}. Target Audience: Adults (18+).`;
55 | 
56 |     if (preferences && preferences.trim()) {
57 |         prompt += `\nConsider the user's preferences when suggesting continuations: "${preferences.trim()}". Incorporate these elements naturally and appropriately.`;
58 |     }
59 | 
60 |     prompt += `\n\n--- COMPLETE STORY CONTEXT SO FAR ---`;
61 |     prompt += `\n\n**Original Story (General Title: "${story.title}")**`;
62 |     
63 |     // Character handling (unchanged)
64 |     const characters = story.options.characters || [];
65 |     
66 |     if (characters.length > 1) {
67 |         prompt += `\nMain Characters (${characters.length}): `;
68 |         characters.forEach((char, index) => {
69 |             prompt += `${index + 1}. ${char.name}`;
70 |             prompt += ` (${char.gender}, ${char.description})`;
71 |             if (index < characters.length - 1) prompt += ', ';
72 |         });
73 |         prompt += `.`;
74 |     } else if (characters.length === 1) {
75 |         prompt += `\nMain Character: ${characters[0].name} (${characters[0].gender}, ${characters[0].description}).`;
76 |     }
77 |     
78 |     prompt += `\n\n**Story Beginning:**\n${story.content}\n`;
79 | 
80 |     if (chapters && chapters.length > 0) {
81 |         prompt += `\n\n**Previous Chapters:**`;
82 |         chapters.forEach((chap) => {
83 |             prompt += `\n\n**Chapter ${chap.chapter_number}: "${chap.title}"**\n${chap.content}\n`;
84 |         });
85 |     }
86 |     prompt += `\n--- END OF COMPLETE CONTEXT ---\n`;
87 | 
88 |     prompt += `\n\nBased on the current state of the story (considering ALL the context provided above), generate 3 concise and attractive options to continue the erotic story. Each option should be a brief summary (10-20 words) of a possible next step in the adult adventure.`;
89 |     prompt += `\nThe options should be varied, offering different paths or approaches for continuation that maintain the erotic/romantic tension.`;
90 |     prompt += `\nEnsure the options explore clearly distinct themes or actions (for example: one option about exploring a new location, another about the introduction of a new character or element, and another about deepening intimacy or trying something new).`;
91 |     prompt += `\nThey must be written in ${language}.`;
92 | 
93 |     // JSON format instructions (unchanged)
94 |     prompt += `\n\n**Response format instructions (VERY IMPORTANT!):**`;
95 |     prompt += `\n* You must respond with a SINGLE JSON object.`;
96 |     prompt += `\n* The JSON object must have a single key called "options".`;
97 |     prompt += `\n* The value of the "options" key must be an array (list) of exactly 3 objects.`;
98 |     prompt += `\n* Each object within the "options" array must have a single key called "summary".`;
99 |     prompt += `\n* The value of the "summary" key should be a text string with the continuation option summary (10-20 words in ${language}).`;
100 |     prompt += `\n* Example of expected JSON format:`;
101 |     prompt += `\n{`;
102 |     prompt += `\n  "options": [`;
103 |     prompt += `\n    { "summary": "The character decides to explore the mysterious bedroom." },`;
104 |     prompt += `\n    { "summary": "A new romantic interest appears unexpectedly." },`;
105 |     prompt += `\n    { "summary": "The character remembers a secret fantasy to explore." }`;
106 |     prompt += `\n  ]`;
107 |     prompt += `\n}`;
108 |     prompt += `\n* Do NOT include ANYTHING before the '{' character that starts the JSON object.`;
109 |     prompt += `\n* Do NOT include ANYTHING after the '}' character that ends the JSON object.`;
110 |     prompt += `\n* Ensure the JSON is valid and complete.`;
111 | 
112 |     return prompt;
113 | }
114 | 
115 | /**
116 |  * Crea el prompt para generar la continuación de un capítulo para contenido adulto.
117 |  * Ahora incluye el contenido completo de la historia y capítulos anteriores.
118 |  */
119 | export function createContinuationPrompt(
120 |     action: 'freeContinuation' | 'optionContinuation' | 'directedContinuation',
121 |     story: Story,
122 |     chapters: Chapter[],
123 |     context: ContinuationContextType,
124 |     language: string = 'en',
125 |     preferences: string | null = null,
126 |     storyFormat: string = 'episodic'
127 | ): string {
128 |     const functionVersion = "v8.0 (Adult Content + Preferences)";
129 |     console.log(`[Prompt Helper ${functionVersion}] createContinuationPrompt for story ID: ${story.id}, action: ${action}, lang: ${language}`);
130 | 
131 |     let prompt = `You are an expert writer continuing erotic stories for adults.
132 |   Write always in ${language}, with sophisticated and sensual language appropriate for mature audiences (18+).
133 |   The original story has a genre of '${story.options.genre}'.`;
134 | 
135 |     // Chapter length guidance based on story format
136 |     prompt += `\n\n**Chapter length guide based on story format:**`;
137 |     if (storyFormat === 'single') {
138 |         prompt += `\n* Complete Story: ~2150 tokens (approx. 1600-1800 words).`;
139 |         prompt += `\n* This should conclude the story with a satisfying ending.`;
140 |     } else {
141 |         prompt += `\n* Episodic Chapter: ~1350 tokens (approx. 1000-1200 words).`;
142 |         prompt += `\n* This should continue the story with room for future chapters.`;
143 |     }
144 |     prompt += `\nThese figures are approximate and serve as reference for the expected length.`;
145 | 
146 |     if (preferences && preferences.trim()) {
147 |         prompt += `\nIncorporate the user's preferences naturally into the continuation: "${preferences.trim()}". Ensure all content remains consensual and positive while exploring these interests.`;
148 |         prompt += ` Guidelines for preferences:\n`;
149 |         prompt += `   - **Natural Integration:** Weave preferences into the plot organically\n`;
150 |         prompt += `   - **Consensual Content:** All interactions must be consensual and positive\n`;
151 |         prompt += `   - **Character Consistency:** Maintain character personalities while exploring preferences\n`;
152 |         prompt += `   - **Quality Storytelling:** Prioritize good narrative flow over just including elements\n`;
153 |     }
154 | 
155 |     // Complete context (unchanged structure, but content focus is now adult)
156 |     prompt += `\n\n--- COMPLETE STORY CONTEXT SO FAR ---`;
157 |     prompt += `\n\n**Original Story (General Title: "${story.title}")**`;
158 |     
159 |     const characters = story.options.characters || [];
160 |     
161 |     if (characters.length > 1) {
162 |         prompt += `\nMain Characters (${characters.length}): `;
163 |         characters.forEach((char, index) => {
164 |             prompt += `${index + 1}. ${char.name}`;
165 |             prompt += `, Gender: ${char.gender}`;
166 |             prompt += `, Description: ${char.description}`;
167 |             if (index < characters.length - 1) prompt += '; ';
168 |         });
169 |         prompt += `.`;
170 |         
171 |         prompt += `\n\n**IMPORTANT for multiple characters:** In this chapter, ensure all characters maintain their consistency and that each has relevant participation according to the story development and their established relationships.`;
172 |     } else if (characters.length === 1) {
173 |         const char = characters[0];
174 |         prompt += `\nMain Character: ${char.name}`;
175 |         prompt += `, Gender: ${char.gender}`;
176 |         prompt += `, Description: ${char.description}`;
177 |         prompt += `.`;
178 |     }
179 |     
180 |     prompt += `\n\n**Story Beginning:**\n${story.content}\n`;
181 | 
182 |     if (chapters && chapters.length > 0) {
183 |         prompt += `\n\n**Previous Chapters:**`;
184 |         chapters.forEach((chap) => {
185 |             prompt += `\n\n**Chapter ${chap.chapter_number}: "${chap.title}"**\n${chap.content}\n`;
186 |         });
187 |     }
188 |     prompt += `\n--- END OF COMPLETE CONTEXT ---\n`;
189 | 
190 |     prompt += `\n\n--- YOUR TASK ---`;
191 |     prompt += `\nConsidering ALL the context provided above, write the NEXT CHAPTER of this adult story.`;
192 | 
193 |     if (action === 'optionContinuation' && context.optionSummary) {
194 |         prompt += `\nThe continuation should be based on the following option chosen by the user: "${context.optionSummary}"`;
195 |     } else if (action === 'directedContinuation' && context.userDirection) {
196 |         prompt += `\nThe continuation should follow this specific direction provided by the user: "${context.userDirection}"`;
197 |     } else {
198 |         prompt += `\nContinue the story freely and creatively, maintaining coherence with previous events and characters.`;
199 |     }
200 | 
201 |     prompt += `\n\nGuides for the New Chapter:`;
202 |     prompt += `\n1. **Chapter Content:** Aim for '${storyFormat}' format.`;
203 |     if (storyFormat === 'single') {
204 |         prompt += ` (approximately 1600-1800 words) - Complete the story with a satisfying conclusion.`;
205 |     } else {
206 |         prompt += ` (approximately 1000-1200 words) - Continue the story with room for future development.`;
207 |     }
208 | 
209 |     prompt += `\n2. **Chapter Structure:** Should have clear narrative flow, connecting with the previous chapter and advancing the overall plot. Can introduce new erotic elements or deepen existing relationships.`;
210 |     prompt += `\n3. **Tone and Style:** Maintain the tone and style of the original story. Use sophisticated, sensual language that creates atmosphere and emotional connection. Build tension and desire naturally.`;
211 |     prompt += `\n4. **Coherence:** Ensure characters behave consistently and that new events fit logically in the story while maintaining the erotic tension.`;
212 |     prompt += `\n5. **Chapter Title:** Generate a brief, attractive and relevant title for the content of this new chapter. Must be in ${language} and in "Sentence case".`;
213 |     prompt += `\n6. **Adult Content:** All interactions must be consensual and positive. Focus on emotional connection alongside physical attraction. Create engaging, erotic content that celebrates adult sexuality healthily.`;
214 | 
215 |     // JSON format instructions (unchanged)
216 |     prompt += `\n\n**Response format instructions (VERY IMPORTANT!):**`;
217 |     prompt += `\n* You must respond with a SINGLE JSON object.`;
218 |     prompt += `\n* The JSON object must have exactly two keys: "title" and "content".`;
219 |     prompt += `\n* The "title" key value should be a text string containing ONLY the generated title for this new chapter, following the guidelines in point 5 of the "Guides for the New Chapter".`;
220 |     prompt += `\n* The "content" key value should be a text string with ALL the content of this new chapter, starting directly with the first sentence.`;
221 |     const exampleCharacterName = characters.length > 0 ? characters[0].name : 'the protagonist';
222 |     prompt += `\n* Example of expected JSON format: {"title": "The Unexpected Encounter", "content": "The next morning, ${exampleCharacterName} woke up feeling a strange energy in the air..."}`;
223 |     prompt += `\n* Do NOT include ANYTHING before the '{' character that starts the JSON object.`;
224 |     prompt += `\n* Do NOT include ANYTHING after the '}' character that ends the JSON object.`;
225 |     prompt += `\n* Ensure the JSON is valid and complete.`;
226 |     prompt += `\n* Do NOT use markdown or any other formatting INSIDE the JSON strings unless it's part of the natural story text.`;
227 | 
228 |     return prompt;
229 | }
```

src/services/ai/GenerateStoryService.ts
```
1 | // src/services/ai/GenerateStoryService.ts
2 | import { StoryOptions, Story } from "../../types"; // Importar Story si no está
3 | import { supabase } from "../../supabaseClient";
4 | 
5 | export interface GenerateStoryParams {
6 |   options: Partial<StoryOptions>; // O el tipo completo si siempre está completo
7 |   language?: string;
8 |   additionalDetails?: string; // <-- Añadir nueva propiedad
9 | }
10 | 
11 | // Definir el tipo de respuesta esperada de la Edge Function
12 | export interface GenerateStoryResponse {
13 |   content: string;
14 |   title: string;
15 | }
16 | 
17 | export class GenerateStoryService {
18 |   /**
19 |    * Generates initial story content and title using the 'generate-story' Edge Function.
20 |    */
21 |   public static async generateStoryWithAI(params: GenerateStoryParams): Promise<GenerateStoryResponse> {
22 |     try {
23 |       console.log('Sending request to generate-story Edge Function with params:', params); // Log parameters
24 | 
25 |       // Make sure to pass the authentication token if the function requires it (it does)
26 |       const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
27 |       if (sessionError || !sessionData.session) {
28 |         throw new Error(sessionError?.message || 'User not authenticated.');
29 |       }
30 |       const token = sessionData.session.access_token;
31 | 
32 |       // Validate character structure to ensure compatibility with new schema
33 |       if (params.options.characters && params.options.characters.length > 0) {
34 |         const validGenders = ['male', 'female', 'non-binary'];
35 |         for (const character of params.options.characters) {
36 |           if (!character.name || typeof character.name !== 'string' || character.name.trim().length === 0) {
37 |             throw new Error(`Invalid character: missing or empty name field`);
38 |           }
39 |           if (!character.gender || !validGenders.includes(character.gender)) {
40 |             throw new Error(`Invalid character "${character.name}": gender must be one of ${validGenders.join(', ')}`);
41 |           }
42 |           if (!character.description || typeof character.description !== 'string' || character.description.trim().length === 0) {
43 |             throw new Error(`Invalid character "${character.name}": missing or empty description field`);
44 |           }
45 |         }
46 |         console.log('✅ Character structure validation passed');
47 |       }
48 | 
49 |       // DEBUG: Log the exact payload being sent including character info
50 |       const charactersInfo = `Characters (${params.options.characters?.length || 0}): ${params.options.characters?.map(c => `${c.name} (${c.gender})`).join(', ') || 'None'}`;
51 |       console.log(`>>> Payload being sent to generate-story: ${charactersInfo}`);
52 |       console.log(">>> Full payload:", JSON.stringify(params, null, 2));
53 | 
54 |       const { data, error } = await supabase.functions.invoke<GenerateStoryResponse>('generate-story', { // Specify response type <T>
55 |         body: params, // Body already contains options, language, etc. and additionalDetails
56 |         headers: {
57 |           'Authorization': `Bearer ${token}` // Pass the token
58 |         }
59 |       });
60 | 
61 |       if (error) {
62 |         console.error('Error in generate-story Edge Function:', error);
63 |         // You can try to get more error details if it's an HttpError
64 |         let message = error.message;
65 |         if ((error as any).context) { // Supabase FunctionsHttpError has 'context'
66 |           message = `${message} - ${JSON.stringify((error as any).context)}`;
67 |         }
68 |         throw new Error(message);
69 |       }
70 | 
71 |       // Validate that the response has the expected format { content: string, title: string }
72 |       if (!data || typeof data.content !== 'string' || typeof data.title !== 'string') {
73 |         console.error('Unexpected response from generate-story:', data);
74 |         throw new Error('The generate-story response does not contain valid content and title.');
75 |       }
76 | 
77 |       console.log('Response from generate-story received (title):', data.title);
78 |       return data; // Return the complete { content, title } object
79 | 
80 |     } catch (error) {
81 |       console.error('Error in GenerateStoryService.generateStoryWithAI:', error);
82 |       // Re-throw so the caller (storyGenerator) can handle it
83 |       throw error;
84 |     }
85 |   }
86 | }
```

src/services/ai/StoryContinuationService.ts
```
1 | // src/services/StoryContinuationService.ts
2 | import { Story, StoryChapter } from "../../types"; // Importa tus tipos
3 | import { supabase } from "../../supabaseClient";
4 | 
5 | // Definir el tipo de respuesta esperada para continuaciones
6 | interface ContinuationResponse {
7 |   content: string;
8 |   title: string;
9 | }
10 | // Definir tipo para opciones generadas
11 | interface OptionsResponse {
12 |   options: { summary: string }[];
13 | }
14 | 
15 | 
16 | export class StoryContinuationService {
17 | 
18 |   /**
19 |    * Llama a la Edge Function 'story-continuation' para diferentes acciones.
20 |    * @param action La acción a realizar ('generateOptions', 'freeContinuation', etc.)
21 |    * @param payload Los datos específicos para esa acción.
22 |    * @returns La respuesta de la Edge Function (depende de la acción).
23 |    */
24 |   private static async invokeContinuationFunction<T = any>(action: string, payload: object): Promise<T> {
25 |     console.log(`Enviando solicitud a la Edge Function story-continuation (action: ${action})...`);
26 | 
27 |     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
28 |     if (sessionError || !sessionData.session) {
29 |       throw new Error(sessionError?.message || 'Usuario no autenticado.');
30 |     }
31 |     const token = sessionData.session.access_token;
32 | 
33 |     const bodyPayload = {
34 |       action: action,
35 |       ...payload // Incluir el resto de los datos (story, chapters, etc.)
36 |     };
37 | 
38 |     // Log character information for debugging (consistent with GenerateStoryService)
39 |     if (bodyPayload.story && bodyPayload.story.options && bodyPayload.story.options.characters) {
40 |       const characters = bodyPayload.story.options.characters;
41 |       const charactersInfo = `Characters (${characters.length}): ${characters.map(c => `${c.name} (${c.gender})`).join(', ')}`;
42 |       console.log(`[StoryContinuationService] ${charactersInfo}`);
43 |     }
44 | 
45 |     try {
46 |       const jsonBodyString = JSON.stringify(bodyPayload, null, 2); // Pretty print
47 |       console.log(`[StoryContinuationService_DEBUG] Body payload AFTER stringify (length: ${jsonBodyString?.length}):\n---\n${jsonBodyString}\n---`);
48 |     } catch (stringifyError) {
49 |         console.error('[StoryContinuationService_DEBUG] Error during JSON.stringify:', stringifyError, 'Payload was:', bodyPayload);
50 |         throw new Error('Failed to stringify payload before sending to edge function.'); // Re-throw or handle
51 |     }
52 | 
53 |     const { data, error } = await supabase.functions.invoke<T>('story-continuation', { // Usar tipo genérico o específico
54 |       body: bodyPayload, // PASAR EL OBJETO DIRECTAMENTE
55 |       headers: {
56 |         'Authorization': `Bearer ${token}`
57 |         // 'Content-Type': 'application/json' // DEJAR QUE INVOKE LO MANEJE
58 |       }
59 |     });
60 | 
61 |     if (error) {
62 |       console.error(`Error en Edge Function story-continuation (action: ${action}):`, error);
63 |       let message = error.message;
64 |       if ((error as any).context) {
65 |         message = `${message} - ${JSON.stringify((error as any).context)}`;
66 |       }
67 |       throw new Error(message);
68 |     }
69 | 
70 |     console.log(`Respuesta recibida de story-continuation (action: ${action})`);
71 |     return data as T; // Devolver datos (casteo puede ser necesario)
72 |   }
73 | 
74 |   /**
75 |    * Genera opciones de continuación.
76 |    */
77 |   public static async generateContinuationOptions(
78 |     story: Story, 
79 |     chapters: StoryChapter[]
80 |   ): Promise<OptionsResponse> {
81 |     const response = await this.invokeContinuationFunction<OptionsResponse>('generateOptions', { 
82 |       story, 
83 |       chapters, 
84 |       language: story.options.language
85 |     });
86 |     if (!response || !Array.isArray(response.options)) {
87 |       console.error("Respuesta inválida para generateOptions:", response);
88 |       throw new Error("No se pudieron generar las opciones de continuación.");
89 |     }
90 |     return response;
91 |   }
92 | 
93 |   /**
94 |    * Genera una continuación libre (contenido y título).
95 |    */
96 |   public static async generateFreeContinuation(story: Story, chapters: StoryChapter[]): Promise<ContinuationResponse> {
97 |     const response = await this.invokeContinuationFunction<ContinuationResponse>('freeContinuation', { 
98 |       story, 
99 |       chapters, 
100 |       language: story.options.language 
101 |     });
102 |     if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
103 |       console.error("Respuesta inválida para freeContinuation:", response);
104 |       throw new Error("No se pudo generar la continuación libre.");
105 |     }
106 |     return response;
107 |   }
108 | 
109 |   /**
110 |    * Genera una continuación basada en una opción seleccionada (contenido y título).
111 |    */
112 |   public static async generateOptionContinuation(story: Story, chapters: StoryChapter[], selectedOptionSummary: string): Promise<ContinuationResponse> {
113 |     const response = await this.invokeContinuationFunction<ContinuationResponse>('optionContinuation', { 
114 |       story, 
115 |       chapters, 
116 |       selectedOptionSummary, 
117 |       language: story.options.language 
118 |     });
119 |     if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
120 |       console.error("Respuesta inválida para optionContinuation:", response);
121 |       throw new Error("No se pudo generar la continuación de opción.");
122 |     }
123 |     return response;
124 |   }
125 | 
126 |   /**
127 |    * Genera una continuación basada en la dirección del usuario (contenido y título).
128 |    */
129 |   public static async generateDirectedContinuation(story: Story, chapters: StoryChapter[], userDirection: string): Promise<ContinuationResponse> {
130 |     const response = await this.invokeContinuationFunction<ContinuationResponse>('directedContinuation', { 
131 |       story, 
132 |       chapters, 
133 |       userDirection, 
134 |       language: story.options.language 
135 |     });
136 |     if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
137 |       console.error("Respuesta inválida para directedContinuation:", response);
138 |       throw new Error("No se pudo generar la continuación dirigida.");
139 |     }
140 |     return response;
141 |   }
142 | 
143 |   // generateChapterTitle ya no es necesaria para el flujo principal
144 |   // public static async generateChapterTitle(content: string): Promise<{ title: string }> {
145 |   //    // ... (código anterior si quieres mantenerla por alguna razón, pero no se llamará desde generateStory)
146 |   // }
147 | }
```

src/services/ai/imageGenerationService.ts
```
1 | import { SYSTEM_PROMPT_BASE, IMAGES_TYPE } from '@/constants/story-images.constant';
2 | import { supabase } from '@/supabaseClient';
3 | import OpenAI from "openai";
4 | 
5 | interface ImageGenerationOptions {
6 |   title: string;
7 |   content: string;
8 |   storyId: string;
9 |   chapterId?: string | number;
10 | }
11 | 
12 | interface GeneratedImage {
13 |   type: string;
14 |   url: string;
15 |   prompt: string;
16 | }
17 | 
18 | interface ImageGenerationResult {
19 |   success: boolean;
20 |   images: GeneratedImage[];
21 |   error?: string;
22 | }
23 | 
24 | /**
25 |  * Service for generating story images using OpenAI GPT-4.1-mini with image generation tools
26 |  */
27 | export class ImageGenerationService {
28 |   private static readonly MODEL = 'gpt-image-1';
29 |   private static openai = new OpenAI({
30 |     apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
31 |     dangerouslyAllowBrowser: true // Solo para desarrollo, en producción usar Edge Functions
32 |   });
33 | 
34 |   /**
35 |    * Generates all story images (cover, scenes, character) asynchronously
36 |    * @param options Story data for image generation
37 |    * @returns Promise with generation results
38 |    */
39 |   static async generateStoryImages(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
40 |     const { title, content, storyId, chapterId = 1 } = options;
41 |     
42 |     try {
43 |       console.log('[ImageGeneration] Starting image generation for story:', storyId);
44 |       
45 |       // Create prompts for each image type
46 |       const prompts = this.createImagePrompts(title, content);
47 |       
48 |       // Generate all images concurrently for speed
49 |       const imagePromises = Object.entries(prompts).map(([imageType, prompt]) =>
50 |         this.generateSingleImage(imageType, prompt, storyId, chapterId)
51 |       );
52 |       
53 |       const results = await Promise.allSettled(imagePromises);
54 |       
55 |       // Process results
56 |       const successfulImages: GeneratedImage[] = [];
57 |       const errors: string[] = [];
58 |       
59 |       results.forEach((result, index) => {
60 |         const imageType = Object.keys(prompts)[index];
61 |         
62 |         if (result.status === 'fulfilled' && result.value.success) {
63 |           successfulImages.push(result.value.image!);
64 |         } else if (result.status === 'rejected') {
65 |           errors.push(`${imageType}: ${result.reason}`);
66 |         } else if (result.status === 'fulfilled' && !result.value.success) {
67 |           errors.push(`${imageType}: ${result.value.error}`);
68 |         }
69 |       });
70 |       
71 |       console.log(`[ImageGeneration] Generated ${successfulImages.length}/${Object.keys(prompts).length} images successfully`);
72 |       
73 |       return {
74 |         success: successfulImages.length > 0,
75 |         images: successfulImages,
76 |         error: errors.length > 0 ? errors.join('; ') : undefined
77 |       };
78 |       
79 |     } catch (error) {
80 |       console.error('[ImageGeneration] Error generating story images:', error);
81 |       return {
82 |         success: false,
83 |         images: [],
84 |         error: error instanceof Error ? error.message : 'Error desconocido'
85 |       };
86 |     }
87 |   }
88 | 
89 |   /**
90 |    * Creates specific prompts for each image type
91 |    * CHARACTER is generated first to establish visual consistency for scenes
92 |    */
93 |   private static createImagePrompts(title: string, content: string): Record<string, string> {
94 |     const baseContext = `**Cuento:**
95 | Título: ${title}
96 | Cuento: ${content}`;
97 | 
98 |     return {
99 |     [IMAGES_TYPE.COVER]: `${SYSTEM_PROMPT_BASE}
100 | 
101 | ${baseContext}
102 | 
103 | Genera una imagen de PORTADA que capture la esencia del cuento. Debe incluir el título de manera artística y elementos visuales que representen la historia principal, manteniendo la misma estética del personaje principal. Estilo acuarela tradicional de cuento infantil.`,
104 | 
105 |       [IMAGES_TYPE.SCENE_1]: `${SYSTEM_PROMPT_BASE}
106 | 
107 | ${baseContext}
108 | 
109 | Genera una imagen de la PRIMERA ESCENA más importante del cuento, donde el PERSONAJE PRINCIPAL debe ser el elemento central de la composición. Debe mostrar un momento clave de la historia con el protagonista en acción, manteniendo las características visuales establecidas del personaje. Estilo acuarela tradicional de cuento infantil.`,
110 | 
111 |       [IMAGES_TYPE.SCENE_2]: `${SYSTEM_PROMPT_BASE}
112 | 
113 | ${baseContext}
114 | 
115 | Genera una imagen de la SEGUNDA ESCENA más importante del cuento, donde el PERSONAJE PRINCIPAL debe ser prominente en la escena. Debe representar otro momento crucial diferente al anterior, mostrando al protagonista en una situación distinta pero manteniendo continuidad visual y las características del personaje establecidas. Estilo acuarela tradicional de cuento infantil.`
116 |     };
117 |   }
118 | 
119 |   /**
120 |    * Generates a single image and uploads it to Supabase
121 |    */
122 |   private static async generateSingleImage(
123 |     imageType: string, 
124 |     prompt: string, 
125 |     storyId: string, 
126 |     chapterId: string | number
127 |   ): Promise<{ success: boolean; image?: GeneratedImage; error?: string }> {
128 |     try {
129 |       console.log(`[ImageGeneration] Generating ${imageType} image...`);
130 |       
131 |       // Generate image with OpenAI
132 |       const imageBase64 = await this.callOpenAIImageGeneration(prompt);
133 |       
134 |       if (!imageBase64) {
135 |         throw new Error('No image data returned from OpenAI');
136 |       }
137 |       
138 |       // Upload to Supabase via Edge Function
139 |       const uploadResult = await this.uploadImageToSupabase(imageBase64, imageType, storyId, chapterId);
140 |       
141 |       if (!uploadResult.success) {
142 |         throw new Error(`Upload failed: ${uploadResult.error}`);
143 |       }
144 |       
145 |       console.log(`[ImageGeneration] Successfully generated and uploaded ${imageType}`);
146 |       
147 |       return {
148 |         success: true,
149 |         image: {
150 |           type: imageType,
151 |           url: uploadResult.publicUrl!,
152 |           prompt: prompt
153 |         }
154 |       };
155 |       
156 |     } catch (error) {
157 |       console.error(`[ImageGeneration] Error generating ${imageType}:`, error);
158 |       return {
159 |         success: false,
160 |         error: error instanceof Error ? error.message : 'Error desconocido'
161 |       };
162 |     }
163 |   }
164 | 
165 |   /**
166 |    * Calls OpenAI API to generate image using GPT-4.1-mini with image generation tools
167 |    */
168 |   private static async callOpenAIImageGeneration(prompt: string): Promise<string | null> {
169 |     try {
170 |       const response = await this.openai.images.generate({
171 |         model: this.MODEL,
172 |         prompt: prompt,
173 |         n: 1,
174 |         quality: "medium",
175 |         size: "1024x1536",
176 |         background: "opaque"
177 |       });
178 | 
179 | 
180 |       return response.data[0].b64_json;
181 |     } catch (error) {
182 |       console.error('[ImageGeneration] OpenAI API error:', error);
183 |       throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
184 |     }
185 |   }
186 | 
187 |   /**
188 |    * Uploads generated image to Supabase storage via Edge Function
189 |    */
190 |   private static async uploadImageToSupabase(
191 |     imageBase64: string, 
192 |     imageType: string, 
193 |     storyId: string, 
194 |     chapterId: string | number
195 |   ): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
196 |     try {
197 |       console.log(`[ImageGeneration] Uploading ${imageType} via Supabase invoke...`);
198 | 
199 |       const { data: functionResponse, error: functionError } = await supabase.functions.invoke(
200 |         'upload-story-image',
201 |         {
202 |           body: {
203 |             imageBase64,
204 |             imageType,
205 |             storyId,
206 |             chapterId: chapterId.toString()
207 |           }
208 |         }
209 |       );
210 | 
211 |       if (functionError) {
212 |         console.error('[ImageGeneration] Function error:', functionError);
213 |         throw new Error(`Function error: ${functionError.message}`);
214 |       }
215 | 
216 |       if (!functionResponse?.success) {
217 |         const errorMsg = functionResponse?.error || functionResponse?.details || 'Unknown upload error';
218 |         throw new Error(`Upload failed: ${errorMsg}`);
219 |       }
220 | 
221 |       console.log(`[ImageGeneration] Successfully uploaded ${imageType}:`, functionResponse.publicUrl);
222 | 
223 |       return {
224 |         success: true,
225 |         publicUrl: functionResponse.publicUrl
226 |       };
227 |       
228 |     } catch (error) {
229 |       console.error('[ImageGeneration] Upload error:', error);
230 |       return {
231 |         success: false,
232 |         error: error instanceof Error ? error.message : 'Error de subida'
233 |       };
234 |     }
235 |   }
236 | } 
```

src/services/ai/ttsService.ts
```
1 | // src/services/ai/ttsService.ts
2 | import { SYSTEM_PROMPT } from '@/constants/story-voices.constant';
3 | import OpenAI from 'openai';
4 | 
5 | /**
6 |  * Servicio para generar audio a partir de texto usando la API REST de OpenAI
7 |  * No usa Supabase ni funciones edge; realiza un fetch directo con tu clave.
8 |  */
9 | export type OpenAIVoiceType =
10 |   | 'alloy'
11 |   | 'echo'
12 |   | 'fable'
13 |   | 'onyx'
14 |   | 'nova'
15 |   | 'shimmer'
16 |   | 'coral'
17 |   | 'sage'
18 |   | 'ash';
19 | 
20 | export interface TTSOptions {
21 |   text: string;
22 |   voice?: OpenAIVoiceType;
23 |   model?: string;
24 |   instructions?: string;
25 | }
26 | 
27 | interface OpenAIError {
28 |   status?: number;
29 |   code?: string | number;
30 |   message?: string;
31 | }
32 | 
33 | function isOpenAIError(error: unknown): error is OpenAIError {
34 |   return typeof error === 'object' && error !== null;
35 | }
36 | 
37 | // Voces disponibles en OpenAI
38 | export const OPENAI_VOICES = [
39 |   { id: 'alloy' as const, name: 'Alloy', description: 'Alloy (Neutral)' },
40 |   { id: 'echo' as const, name: 'Echo', description: 'Echo (Masculino)' },
41 |   { id: 'fable' as const, name: 'Fable', description: 'Fable (Fantasía)' },
42 |   { id: 'onyx' as const, name: 'Onyx', description: 'Onyx (Masculino)' },
43 |   { id: 'nova' as const, name: 'Nova', description: 'Nova (Femenina)' },
44 |   { id: 'shimmer' as const, name: 'Shimmer', description: 'Shimmer (Femenina)' },
45 |   { id: 'coral' as const, name: 'Coral', description: 'Coral (Femenina)' },
46 |   { id: 'sage' as const, name: 'Sage', description: 'Sage (Narrador)' },
47 |   { id: 'ash' as const, name: 'Ash', description: 'Ash (Juvenil)' }
48 | ];
49 | 
50 | // Inicializar cliente de OpenAI
51 | const openai = new OpenAI({
52 |   apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
53 |   dangerouslyAllowBrowser: true // Permitir uso en el navegador
54 | });
55 | 
56 | // Función para obtener las voces disponibles
57 | export const getAvailableVoices = async () => {
58 |   return OPENAI_VOICES;
59 | };
60 | 
61 | /**
62 |  * Genera audio a partir de texto usando la API del cliente oficial de OpenAI
63 |  */
64 | export const generateSpeech = async ({
65 |   text,
66 |   voice = 'nova',
67 |   model,
68 |   instructions
69 | }: TTSOptions): Promise<Blob> => {
70 |   if (!text || text.trim() === '') {
71 |     throw new Error('El texto es requerido');
72 |   }
73 | 
74 |   // Limpiar el texto antes de procesarlo
75 |   const cleanedText = cleanTextForSpeech(text);
76 | 
77 |   // Combinar el system prompt con las instrucciones específicas del narrador
78 |   const fullInstructions = instructions 
79 |     ? `${SYSTEM_PROMPT} ${instructions}`
80 |     : SYSTEM_PROMPT;
81 | 
82 |   console.log(`Iniciando generación de audio... Texto limpio: ${cleanedText.length} caracteres`);
83 | 
84 |   console.log(`Configuración: Voz=${voice}, Modelo=${model}`);
85 |   
86 |   try {
87 |     // Llamar directamente a la API de OpenAI usando el cliente oficial
88 |     const response = await openai.audio.speech.create({
89 |       model,
90 |       voice,
91 |       input: cleanedText,
92 |       instructions: fullInstructions
93 |     });
94 | 
95 |     // Convertir la respuesta a un Blob usando arrayBuffer
96 |     const buffer = await response.arrayBuffer();
97 |     const audioBlob = new Blob([buffer], { type: 'audio/mpeg' });
98 |     
99 |     console.log("Blob de audio creado:", audioBlob.size, "bytes");
100 |     console.log('Audio generado correctamente');
101 |     
102 |     return audioBlob;
103 |   } catch (error: unknown) {
104 |     console.error('Error en generación de voz:', error);
105 |     
106 |     const openAIError = isOpenAIError(error) ? error as OpenAIError : null;
107 |     
108 |     // Manejar específicamente el error 429 (Too Many Requests)
109 |     if (openAIError?.status === 429 || openAIError?.code === 429) {
110 |       throw new Error('Alcanzaste el máximo de créditos para generar un audio');
111 |     }
112 |     
113 |     if (openAIError?.status === 401 || openAIError?.code === 'invalid_api_key') {
114 |       throw new Error('Error de autenticación con el servicio de voz');
115 |     }
116 |     
117 |     if (openAIError?.status === 400) {
118 |       throw new Error('El texto proporcionado no es válido para generar audio');
119 |     }
120 |     
121 |     if (openAIError?.status && openAIError.status >= 500) {
122 |       throw new Error('El servicio de voz no está disponible temporalmente');
123 |     }
124 |     
125 |     const errorMessage = error instanceof Error ? error.message : 'Error inesperado al generar el audio';
126 |     throw new Error(errorMessage);
127 |   }
128 | };
129 | 
130 | function cleanTextForSpeech(text: string): string {
131 |   return text
132 |     // Mantener caracteres especiales españoles
133 |     .replace(/[^\w\s.,!?áéíóúñÁÉÍÓÚÑ-]/g, '')
134 |     // Normalizar espacios
135 |     .replace(/\s+/g, ' ')
136 |     // Agregar pausas naturales
137 |     .replace(/([.!?])\s+/g, '$1\n')
138 |     .replace(/([.,])\s+/g, '$1 ')
139 |     // Eliminar líneas vacías múltiples
140 |     .replace(/\n\s*\n/g, '\n')
141 |     .trim();
142 | }
```

src/store/stories/storiesStore.ts
```
1 | import { StoriesState } from "../types/storeTypes";
2 | import { createPersistentStore } from "../core/createStore";
3 | import { getUserStories, syncQueue, syncStory } from "../../services/supabase";
4 | import { useUserStore } from "../user/userStore";
5 | 
6 | // Estado inicial
7 | const initialState: Pick<
8 |   StoriesState,
9 |   "generatedStories" | "isGeneratingStory" | "isLoadingStories"
10 | > = {
11 |   generatedStories: [],
12 |   isGeneratingStory: false,
13 |   isLoadingStories: false,
14 | };
15 | 
16 | export const useStoriesStore = createPersistentStore<StoriesState>(
17 |   initialState,
18 |   (set, get) => ({
19 |     setIsGeneratingStory: (isGenerating) =>
20 |       set({
21 |         isGeneratingStory: isGenerating,
22 |       }),
23 | 
24 |     addGeneratedStory: async (story) => {
25 |       console.log("🚀 ~ addGeneratedStory: ~ story:", story)
26 |       // Guardar localmente primero
27 |       set((state) => ({
28 |         generatedStories: [story, ...state.generatedStories],
29 |       }));
30 | 
31 |       // Luego sincronizar con Supabase
32 |       try {
33 |         const user = useUserStore.getState().user;
34 | 
35 |         if (user) {
36 |           const { success } = await syncStory(user.id, story);
37 | 
38 |           if (!success) {
39 |             // Si falla, agregar a la cola de sincronización
40 |             syncQueue.addToQueue("stories", "insert", {
41 |               id: story.id,
42 |               user_id: user.id,
43 |               title: story.title,
44 |               content: story.content,
45 |               audio_url: story.audioUrl,
46 |               genre: story.options.genre,
47 |               story_format: story.options.format,
48 |               character_id: story.options.characters[0]?.id, // Primary character
49 |               additional_details: story.additional_details,
50 |             });
51 |           }
52 |         }
53 |       } catch (error) {
54 |         console.error("Error sincronizando historia con Supabase:", error);
55 |       }
56 |     },
57 | 
58 |     getStoryById: (id) => {
59 |       return get().generatedStories.find((story) => story.id === id);
60 |     },
61 | 
62 |     loadStoriesFromSupabase: async (userId?: string) => {
63 |       const user = useUserStore.getState().user;
64 |       if (!user) return;
65 | 
66 |       set({ isLoadingStories: true });
67 |       try {
68 |         console.log(`Cargando historias para usuario ${user.id}`);
69 | 
70 |         // IMPORTANTE: Limpiar antes de cargar
71 |         set({ generatedStories: [] });
72 | 
73 |         const { success, stories } = await getUserStories(user.id);
74 | 
75 |         if (success && stories) {
76 |           console.log(`Cargadas ${stories.length} historias de Supabase`);
77 |           set({ generatedStories: stories });
78 |         } else {
79 |           console.warn("No se encontraron historias o hubo un error");
80 |         }
81 |       } catch (error) {
82 |         console.error("Error al cargar historias:", error);
83 |       } finally {
84 |         set({ isLoadingStories: false });
85 |       }
86 |     },
87 |   }),
88 |   "stories",
89 | );
```

src/store/stories/storyGenerator.ts
```
1 | // src/store/stories/storyGenerator.ts
2 | import { toast } from "sonner";
3 | import { Story, StoryOptions, StoryChapter } from "../../types";
4 | import { useStoriesStore } from "./storiesStore";
5 | import { useUserStore } from "../user/userStore";
6 | import { charactersService } from "../../services/charactersService";
7 | import { useStoryOptionsStore } from "../storyOptions/storyOptionsStore";
8 | import { generateId } from "../core/utils";
9 | import { GenerateStoryService, GenerateStoryParams } from "@/services/ai/GenerateStoryService";
10 | import { useChaptersStore } from "./chapters/chaptersStore";
11 | import { StoryCharacter } from "../../types";
12 | 
13 | /**
14 |  * Genera una historia completa (Capítulo 1 + Título) a partir de las opciones
15 |  */
16 | export const generateStory = async (options: Partial<StoryOptions>): Promise<Story | null> => {
17 |   const storiesStore = useStoriesStore.getState();
18 |   const chaptersStore = useChaptersStore.getState();
19 |   const storyOptionsState = useStoryOptionsStore.getState();
20 |   const userStore = useUserStore.getState();
21 | 
22 |   console.log("🔍 DEBUG - Opciones generación historia:", JSON.stringify(options, null, 2));
23 |   console.log("🔍 DEBUG - Detalles Adicionales:", storyOptionsState.additionalDetails);
24 | 
25 |   storiesStore.setIsGeneratingStory(true);
26 | 
27 |   try {
28 |     const storyId = generateId();
29 |     const profileSettings = userStore.profileSettings;
30 |     const user = userStore.user;
31 |     const additionalDetails = storyOptionsState.additionalDetails;
32 | 
33 |     if (!user) {
34 |       throw new Error("Usuario no autenticado");
35 |     }
36 | 
37 |     // Obtener personajes seleccionados desde sessionStorage en lugar del store
38 |     const selectedCharactersData = sessionStorage.getItem('selectedCharacters');
39 |     let selectedCharacters: StoryCharacter[] = [];
40 |     
41 |     if (selectedCharactersData) {
42 |       try {
43 |         selectedCharacters = JSON.parse(selectedCharactersData);
44 |         console.log("🔍 DEBUG - Characters loaded from sessionStorage:", selectedCharacters.length);
45 |       } catch (error) {
46 |         console.error("Error parsing selectedCharacters from sessionStorage:", error);
47 |       }
48 |     } else {
49 |       console.warn("No selectedCharacters found in sessionStorage");
50 |     }
51 | 
52 |     // --- DEBUG: Detailed parameter logging BEFORE building payload --- 
53 |     console.log("🔍 DEBUG PRE-PAYLOAD: Profile Data ->", JSON.stringify(profileSettings, null, 2));
54 |     console.log("🔍 DEBUG PRE-PAYLOAD: Selected Characters ->", JSON.stringify(selectedCharacters, null, 2));
55 |     console.log("🔍 DEBUG PRE-PAYLOAD: Options Received (function) ->", JSON.stringify(options, null, 2));
56 |     console.log("🔍 DEBUG PRE-PAYLOAD: Format (store) ->", storyOptionsState.currentStoryOptions.format);
57 |     console.log("🔍 DEBUG PRE-PAYLOAD: Additional Details ->", additionalDetails);
58 |     // --- END DEBUG ---
59 | 
60 |     if (!profileSettings) throw new Error("User profile not loaded.");
61 |     if (!selectedCharacters || selectedCharacters.length === 0) throw new Error("No characters selected.");
62 | 
63 |     // --- SINGLE call to service that invokes 'generate-story' EF ---
64 |     const payload: GenerateStoryParams = {
65 |       options: {
66 |         characters: selectedCharacters,
67 |         genre: options.genre,
68 |         format: storyOptionsState.currentStoryOptions.format,
69 |       },
70 |       language: profileSettings.language,
71 |       additionalDetails: additionalDetails || undefined,
72 |     };
73 | 
74 |     console.log("Sending request to generate-story Edge Function with params:", payload);
75 | 
76 |     const storyResponse = await GenerateStoryService.generateStoryWithAI(payload);
77 |     // storyResponse ahora es { content: string, title: string }
78 |     console.log(`[storyGenerator_DEBUG] Title received from Service: "${storyResponse.title}"`);
79 | 
80 |     // Los personajes seleccionados ya están guardados, no necesitamos save individual
81 |     // Solo guardamos currentCharacter si se usó para creación de personaje nuevo
82 | 
83 |     // Crear el objeto historia con título y contenido de la respuesta
84 |     const story: Story = {
85 |       id: storyId,
86 |       title: storyResponse.title,
87 |       content: storyResponse.content,
88 |       options: {
89 |         characters: selectedCharacters,
90 |         genre: options.genre || "adventure",
91 |         format: storyOptionsState.currentStoryOptions.format || "episodic",
92 |         language: payload.language,
93 |       },
94 |       additional_details: additionalDetails,
95 |       createdAt: new Date().toISOString(),
96 |       // audioUrl se añadirá después si se genera
97 |     };
98 | 
99 |     console.log("🔍 DEBUG - Story Created:", JSON.stringify(story.options, null, 2));
100 |     console.log(`[storyGenerator_DEBUG] Title being saved to store: "${story.title}"`);
101 | 
102 |     // 1. Save the main story (as before)
103 |     // Save the generated story in the store
104 |     await storiesStore.addGeneratedStory(story);
105 | 
106 |     // 2. Create and save Chapter 1
107 |     const firstChapter: StoryChapter = {
108 |       id: generateId(),
109 |       chapterNumber: 1,
110 |       title: story.title,
111 |       content: story.content,
112 |       generationMethod: 'free',
113 |       createdAt: new Date().toISOString(),
114 |       // customInput doesn't apply here
115 |     };
116 |     await chaptersStore.addChapter(story.id, firstChapter);
117 | 
118 |     // Clear temporarily stored story options and sessionStorage
119 |     storyOptionsState.resetStoryOptions();
120 |     sessionStorage.removeItem('selectedCharacters');
121 |     console.log("🔍 DEBUG - Cleared sessionStorage after successful story generation");
122 | 
123 |     return story;
124 | 
125 |   } catch (error: any) {
126 |     console.error("Error generating story in storyGenerator:", error);
127 |     toast.error("Error generating story", {
128 |       description: error?.message || "Please try again.",
129 |     });
130 |     // Consider if you should also call resetStoryOptions here
131 |     storyOptionsState.resetStoryOptions();
132 |     return null;
133 |   } finally {
134 |     storiesStore.setIsGeneratingStory(false);
135 |   }
136 | };
```

src/store/stories/audio/audioStore.ts
```
1 | import { create } from 'zustand';
2 | import { persist } from 'zustand/middleware';
3 | import { AudioState } from "../../types/storeTypes";
4 | import { createPersistentStore } from "../../core/createStore";
5 | import {
6 |   getCurrentVoice,
7 |   getUserAudios,
8 |   setCurrentVoice,
9 |   syncAudioFile,
10 |   syncQueue,
11 | } from "../../../services/supabase";
12 | import { useUserStore } from "../../user/userStore";
13 | 
14 | // Tipos
15 | type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';
16 | 
17 | interface AudioStateEntry {
18 |   url: string;
19 |   generatedAt: number;
20 |   // Eliminamos referencia a S3, solo usamos URLs locales (blob)
21 | }
22 | 
23 | interface AudioGenerationStatus {
24 |   status: GenerationStatus;
25 |   progress: number;
26 | }
27 | 
28 | interface AudioStore {
29 |   // Cache de audio
30 |   audioCache: Record<string, AudioStateEntry>; // storyId_chapterId_voiceId -> AudioStateEntry
31 |   
32 |   // Estado de generación
33 |   generationStatus: Record<string, AudioGenerationStatus>; // storyId_chapterId -> status
34 |   
35 |   // Preferencia de voz
36 |   currentVoice: string | null;
37 |   
38 |   // Acciones
39 |   addAudioToCache: (storyId: string, chapterId: string | number, voiceId: string, url: string) => void;
40 |   getAudioFromCache: (storyId: string, chapterId: string | number, voiceId: string) => string | null;
41 |   clearAudioCache: () => void;
42 |   removeAudioFromCache: (storyId: string, chapterId: string | number, voiceId: string) => void;
43 |   
44 |   // Acciones para generación
45 |   setGenerationStatus: (storyId: string, chapterId: string | number, status: GenerationStatus, progress?: number) => void;
46 |   getGenerationStatus: (storyId: string, chapterId: string | number) => AudioGenerationStatus;
47 |   
48 |   // Acciones preferencia de voz
49 |   setCurrentVoice: (voiceId: string) => void;
50 |   getCurrentVoice: () => string | null;
51 | }
52 | 
53 | // Crear store con persistencia
54 | export const useAudioStore = create<AudioStore>()(
55 |   persist(
56 |     (set, get) => ({
57 |       // Estado inicial
58 |       audioCache: {},
59 |       generationStatus: {},
60 |       currentVoice: null,
61 |       
62 |       // Acciones para cache de audio
63 |       addAudioToCache: (storyId, chapterId, voiceId, url) => {
64 |         const key = `${storyId}_${chapterId}_${voiceId}`;
65 |         set(state => ({
66 |           audioCache: {
67 |             ...state.audioCache,
68 |             [key]: {
69 |               url,
70 |               generatedAt: Date.now()
71 |             }
72 |           }
73 |         }));
74 |       },
75 |       
76 |       getAudioFromCache: (storyId, chapterId, voiceId) => {
77 |         const key = `${storyId}_${chapterId}_${voiceId}`;
78 |         const entry = get().audioCache[key];
79 |         return entry?.url || null;
80 |       },
81 |       
82 |       clearAudioCache: () => {
83 |         // Liberar URLs de blob antes de limpiar el cache
84 |         Object.values(get().audioCache).forEach(entry => {
85 |           if (entry.url.startsWith('blob:')) {
86 |             URL.revokeObjectURL(entry.url);
87 |           }
88 |         });
89 |         
90 |         set({ audioCache: {} });
91 |       },
92 |       
93 |       removeAudioFromCache: (storyId, chapterId, voiceId) => {
94 |         const key = `${storyId}_${chapterId}_${voiceId}`;
95 |         const entry = get().audioCache[key];
96 |         
97 |         // Si es un blob URL, liberarla
98 |         if (entry && entry.url.startsWith('blob:')) {
99 |           URL.revokeObjectURL(entry.url);
100 |         }
101 |         
102 |         set(state => {
103 |           const newCache = { ...state.audioCache };
104 |           delete newCache[key];
105 |           return { audioCache: newCache };
106 |         });
107 |       },
108 |       
109 |       // Acciones para estado de generación
110 |       setGenerationStatus: (storyId, chapterId, status, progress = 0) => {
111 |         const key = `${storyId}_${chapterId}`;
112 |         set(state => ({
113 |           generationStatus: {
114 |             ...state.generationStatus,
115 |             [key]: { status, progress }
116 |           }
117 |         }));
118 |       },
119 |       
120 |       getGenerationStatus: (storyId, chapterId) => {
121 |         const key = `${storyId}_${chapterId}`;
122 |         return get().generationStatus[key] || { status: 'idle', progress: 0 };
123 |       },
124 |       
125 |       // Acciones para preferencia de voz
126 |       setCurrentVoice: (voiceId) => {
127 |         set({ currentVoice: voiceId });
128 |       },
129 |       
130 |       getCurrentVoice: () => {
131 |         return get().currentVoice;
132 |       }
133 |     }),
134 |     {
135 |       name: 'audio-storage', // Nombre de la clave en localStorage
136 |     }
137 |   )
138 | );
```

src/store/stories/chapters/chaptersStore.ts
```
1 | import { ChaptersState } from "../../types/storeTypes";
2 | import { StoryWithChapters } from "../../../types";
3 | import { createPersistentStore } from "../../core/createStore";
4 | import { useStoriesStore } from "../storiesStore";
5 | import {
6 |   getStoryChapters,
7 |   syncChapter,
8 |   syncQueue,
9 | } from "../../../services/supabase";
10 | 
11 | // Estado inicial
12 | const initialState: Pick<ChaptersState, "storyChapters"> = {
13 |   storyChapters: [],
14 | };
15 | 
16 | export const useChaptersStore = createPersistentStore<ChaptersState>(
17 |   initialState,
18 |   (set, get) => ({
19 |     getChaptersByStoryId: (storyId) => {
20 |       const storyWithChapters = get().storyChapters.find((s) =>
21 |         s.id === storyId
22 |       );
23 |       return storyWithChapters ? storyWithChapters.chapters : [];
24 |     },
25 | 
26 |     addChapter: async (storyId, chapter) => {
27 |       console.log("🚀 ~ addChapter: ~ chapter:", chapter)
28 |       console.log("🚀 ~ addChapter: ~ storyId:", storyId)
29 |       try {
30 |         // 1. Intentar sincronizar con Supabase PRIMERO
31 |         const { success } = await syncChapter(chapter, storyId);
32 | 
33 |         if (success) {
34 |           // 2. SI la sincronización es exitosa, AHORA actualizar el store local
35 |           set((state) => {
36 |             const storyWithChapters = state.storyChapters.find((s) =>
37 |               s.id === storyId
38 |             );
39 | 
40 |             if (storyWithChapters) {
41 |               // Actualizar los capítulos existentes
42 |               return {
43 |                 storyChapters: state.storyChapters.map((s) =>
44 |                   s.id === storyId
45 |                     ? { ...s, chapters: [...s.chapters, chapter] }
46 |                     : s
47 |                 ),
48 |               };
49 |             } else {
50 |               // Crear nueva entrada para la historia
51 |               const storiesStore = useStoriesStore.getState();
52 |               const story = storiesStore.getStoryById(storyId);
53 | 
54 |               if (!story) return state; // Historia no encontrada
55 | 
56 |               const newStoryWithChapters: StoryWithChapters = {
57 |                 id: storyId,
58 |                 title: story.title,
59 |                 content: story.content,
60 |                 options: story.options,
61 |                 createdAt: story.createdAt,
62 |                 audioUrl: story.audioUrl,
63 |                 chapters: [chapter],
64 |               };
65 | 
66 |               return {
67 |                 storyChapters: [...state.storyChapters, newStoryWithChapters],
68 |               };
69 |             }
70 |           });
71 |         } else {
72 |            // 3. Si falla la sincronización directa, agregar a la cola SIN actualizar el estado local
73 |            console.warn("Sincronización directa de capítulo fallida, añadiendo a la cola.");
74 |            syncQueue.addToQueue("story_chapters", "insert", {
75 |              story_id: storyId,
76 |              chapter_number: chapter.chapterNumber,
77 |              title: chapter.title,
78 |              content: chapter.content,
79 |              generation_method: chapter.generationMethod,
80 |              custom_input: chapter.customInput,
81 |            });
82 |            // Lanzar un error para que el frontend sepa que no se guardó (opcional pero recomendado)
83 |            throw new Error("No se pudo guardar el capítulo en la base de datos.");
84 |         }
85 |       } catch (error) {
86 |         console.error("Error sincronizando capítulo con Supabase:", error);
87 |         // 4. Si hay un error en el try, agregar a la cola SIN actualizar el estado local
88 |         syncQueue.addToQueue("story_chapters", "insert", {
89 |           story_id: storyId,
90 |           chapter_number: chapter.chapterNumber,
91 |           title: chapter.title,
92 |           content: chapter.content,
93 |           generation_method: chapter.generationMethod,
94 |           custom_input: chapter.customInput,
95 |         });
96 |         // Propagar el error para que el frontend pueda manejarlo
97 |         throw error;
98 |       }
99 |     },
100 | 
101 |     getLastChapterByStoryId: (storyId) => {
102 |       const chapters = get().getChaptersByStoryId(storyId);
103 |       if (chapters.length === 0) return undefined;
104 | 
105 |       // Ordenar capítulos y devolver el último
106 |       return [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];
107 |     },
108 | 
109 |     loadChaptersFromSupabase: async (storyId) => {
110 |       try {
111 |         const { success, chapters } = await getStoryChapters(storyId);
112 | 
113 |         if (success && chapters && chapters.length > 0) {
114 |           const storiesStore = useStoriesStore.getState();
115 |           const story = storiesStore.getStoryById(storyId);
116 | 
117 |           if (!story) return; // Historia no encontrada
118 | 
119 |           set((state) => {
120 |             const existingStoryIndex = state.storyChapters.findIndex((s) =>
121 |               s.id === storyId
122 |             );
123 | 
124 |             if (existingStoryIndex >= 0) {
125 |               // Actualizar capítulos de la historia existente
126 |               const updatedStoryChapters = [...state.storyChapters];
127 |               updatedStoryChapters[existingStoryIndex] = {
128 |                 ...updatedStoryChapters[existingStoryIndex],
129 |                 chapters,
130 |               };
131 | 
132 |               return { storyChapters: updatedStoryChapters };
133 |             } else {
134 |               // Crear nueva entrada para la historia
135 |               const newStoryWithChapters: StoryWithChapters = {
136 |                 id: storyId,
137 |                 title: story.title,
138 |                 content: story.content,
139 |                 options: story.options,
140 |                 createdAt: story.createdAt,
141 |                 audioUrl: story.audioUrl,
142 |                 chapters,
143 |               };
144 | 
145 |               return {
146 |                 storyChapters: [...state.storyChapters, newStoryWithChapters],
147 |               };
148 |             }
149 |           });
150 |         }
151 |       } catch (error) {
152 |         console.error("Error cargando capítulos desde Supabase:", error);
153 |       }
154 |     },
155 |   }),
156 |   "chapters",
157 | );
```
