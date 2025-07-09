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


src/pages/SavedStories.tsx
```
1 | import { useState } from "react";
2 | import { useNavigate } from "react-router-dom";
3 | import { Book, Calendar, ChevronDown, ChevronRight, Bookmark, User, Clock, SortAsc, SortDesc, Filter } from "lucide-react";
4 | import { motion, AnimatePresence } from "framer-motion";
5 | import { useStoriesStore } from "../store/stories/storiesStore";
6 | import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
7 | import BackButton from "../components/BackButton";
8 | import PageTransition from "../components/PageTransition";
9 | import { StoryWithChapters } from "../types";
10 | 
11 | export default function SavedStories() {
12 |   const navigate = useNavigate();
13 |   const { generatedStories } = useStoriesStore();
14 |   const { getChaptersByStoryId } = useChaptersStore();
15 |   const [expandedStories, setExpandedStories] = useState<{[key: string]: boolean}>({});
16 |   const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
17 |   
18 |   const formatDate = (dateString: string) => {
19 |     const date = new Date(dateString);
20 |     return new Intl.DateTimeFormat('es-ES', { 
21 |       year: 'numeric', 
22 |       month: 'short', 
23 |       day: 'numeric' 
24 |     }).format(date);
25 |   };
26 |   
27 |   const container = {
28 |     hidden: { opacity: 0 },
29 |     show: {
30 |       opacity: 1,
31 |       transition: {
32 |         staggerChildren: 0.1
33 |       }
34 |     }
35 |   };
36 |   
37 |   const item = {
38 |     hidden: { y: 20, opacity: 0 },
39 |     show: { y: 0, opacity: 1 }
40 |   };
41 | 
42 |   const toggleExpand = (storyId: string) => {
43 |     setExpandedStories(prev => ({
44 |       ...prev,
45 |       [storyId]: !prev[storyId]
46 |     }));
47 |   };
48 | 
49 |   const toggleSortOrder = () => {
50 |     setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
51 |   };
52 | 
53 |   // Group stories that have chapters
54 |   const storiesWithChaptersInfo = generatedStories.map(story => {
55 |     const chapters = getChaptersByStoryId(story.id);
56 |     return {
57 |       ...story,
58 |       hasMultipleChapters: chapters.length > 1,
59 |       chaptersCount: chapters.length,
60 |       chapters
61 |     } as StoryWithChapters;
62 |   });
63 |   
64 |   // Sort stories based on sort order
65 |   const sortedStories = [...storiesWithChaptersInfo].sort((a, b) => {
66 |     const dateA = new Date(a.createdAt).getTime();
67 |     const dateB = new Date(b.createdAt).getTime();
68 |     return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
69 |   });
70 |   
71 |   return (
72 |     <PageTransition>
73 |       <div
74 |         className="min-h-screen flex flex-col items-center justify-center relative"
75 |         style={{
76 |           backgroundColor: 'black',
77 |         }}
78 |       >
79 |         <BackButton />
80 |         
81 |         <div className="w-full max-w-2xl mx-auto px-4 py-8">
82 |           <h1 className="text-3xl font-bold text-[#BB79D1] text-center mb-4 font-heading drop-shadow-lg">
83 |             Mis Historias
84 |           </h1>
85 |           
86 |           {storiesWithChaptersInfo.length > 0 && (
87 |             <div 
88 |               className="flex justify-center mb-6 bg-white/70 rounded-xl p-1 max-w-xs mx-auto shadow-md"
89 |               onClick={toggleSortOrder}
90 |             >
91 |               <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortOrder === 'newest' ? 'bg-[#BB79D1] text-white shadow-md' : 'hover:bg-white/80 text-[#222]'}`}>
92 |                 <SortDesc size={16} />
93 |                 <span>Más recientes</span>
94 |               </button>
95 |               <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortOrder === 'oldest' ? 'bg-[#BB79D1] text-white shadow-md' : 'hover:bg-white/80 text-[#222]'}`}>
96 |                 <SortAsc size={16} />
97 |                 <span>Más antiguas</span>
98 |               </button>
99 |             </div>
100 |           )}
101 |           
102 |           {sortedStories.length === 0 ? (
103 |             <div className="text-center bg-white/70 rounded-xl p-6 shadow-md">
104 |               <p className="text-[#222] font-medium">No tienes historias guardadas.</p>
105 |             </div>
106 |           ) : (
107 |             <motion.div
108 |               variants={container}
109 |               initial="hidden"
110 |               animate="show"
111 |               className="space-y-4"
112 |             >
113 |               {sortedStories.map((story) => (
114 |                 <motion.div
115 |                   key={story.id}
116 |                   variants={item}
117 |                   className="bg-white/80 rounded-xl overflow-hidden shadow-md"
118 |                 >
119 |                   <div 
120 |                     className="story-card p-4 cursor-pointer hover:bg-white/90 transition-all"
121 |                     onClick={() => story.hasMultipleChapters 
122 |                       ? toggleExpand(story.id) 
123 |                       : navigate(`/story/${story.id}`)}
124 |                   >
125 |                     <div className="flex items-center">
126 |                       <div className="w-12 h-12 rounded-full bg-[#F6A5B7]/20 flex items-center justify-center mr-4 shrink-0 border-2 border-[#F6A5B7]/40">
127 |                         <Book size={20} className="text-[#F6A5B7]" />
128 |                       </div>
129 |                       <div className="flex-1 min-w-0">
130 |                         <h3 className="text-[#222] font-semibold text-lg truncate">{story.title}</h3>
131 |                         <div className="flex items-center text-[#555] text-sm">
132 |                           <Calendar size={14} className="mr-1 shrink-0" />
133 |                           <span className="mr-3">{formatDate(story.createdAt)}</span>
134 |                           {story.hasMultipleChapters && (
135 |                             <span className="text-[#BB79D1] flex items-center">
136 |                               <Bookmark size={14} className="mr-1" />
137 |                               {story.chaptersCount} capítulos
138 |                             </span>
139 |                           )}
140 |                         </div>
141 |                       </div>
142 |                       {story.hasMultipleChapters && (
143 |                         <div className="ml-2">
144 |                           {expandedStories[story.id] ? (
145 |                             <ChevronDown size={20} className="text-[#BB79D1]" />
146 |                           ) : (
147 |                             <ChevronRight size={20} className="text-[#BB79D1]" />
148 |                           )}
149 |                         </div>
150 |                       )}
151 |                     </div>
152 |                     
153 |                     {/* Character info */}
154 |                     <div className="mt-3 pt-3 border-t border-[#BB79D1]/10 flex items-center">
155 |                       <div className="bg-[#7DC4E0]/20 h-8 w-8 rounded-full flex items-center justify-center mr-2 border border-[#7DC4E0]/40">
156 |                         <User size={14} className="text-[#7DC4E0]" />
157 |                       </div>
158 |                       <div className="text-[#222] text-sm flex-1">
159 |                         <span className="font-medium">
160 |                           {story.options.characters?.map(char => char.name).join(', ') || "Sin personajes"}
161 |                         </span>
162 |                         {story.options.characters && story.options.characters.length > 0 && story.options.characters[0].profession && (
163 |                           <span className="ml-2 text-[#555]">• {story.options.characters[0].profession}</span>
164 |                         )}
165 |                       </div>
166 |                       <div className="flex gap-2">
167 |                         {story.options.genre && (
168 |                           <div className="px-2 py-1 text-xs rounded-full bg-[#BB79D1]/10 text-[#BB79D1] border border-[#BB79D1]/30">
169 |                             {story.options.genre}
170 |                           </div>
171 |                         )}
172 |                         <div className="px-2 py-1 text-xs rounded-full bg-[#F9DA60]/20 text-[#222] border border-[#F9DA60]/40 flex items-center gap-1">
173 |                           <Clock size={11} className="text-[#F9DA60]" />
174 |                           {story.options.format === 'single' ? 'Complete' : 'Chapters'}
175 |                         </div>
176 |                       </div>
177 |                     </div>
178 |                   </div>
179 |                   
180 |                   {/* Chapters list for expanded stories */}
181 |                   <AnimatePresence>
182 |                     {story.hasMultipleChapters && expandedStories[story.id] && (
183 |                       <motion.div
184 |                         initial={{ height: 0, opacity: 0 }}
185 |                         animate={{ height: "auto", opacity: 1 }}
186 |                         exit={{ height: 0, opacity: 0 }}
187 |                         transition={{ duration: 0.3 }}
188 |                         className="overflow-hidden"
189 |                       >
190 |                         <div className="bg-[#F6A5B7]/5 border-t border-[#F6A5B7]/10">
191 |                           {story.chapters.map((chapter, index) => (
192 |                             <div 
193 |                               key={`${story.id}-chapter-${index}`}
194 |                               className="px-4 py-3 border-b border-[#F6A5B7]/5 last:border-b-0 hover:bg-[#F6A5B7]/10 cursor-pointer"
195 |                               onClick={() => navigate(`/story/${story.id}?chapter=${index}`)}
196 |                             >
197 |                               <div className="flex items-center">
198 |                                 <div className="w-8 h-8 rounded-full bg-[#BB79D1]/20 flex items-center justify-center mr-3 shrink-0 border border-[#BB79D1]/30">
199 |                                   <span className="text-sm text-[#BB79D1] font-medium">
200 |                                     {index + 1}
201 |                                   </span>
202 |                                 </div>
203 |                                 <div>
204 |                                   <h4 className="text-[#222] font-medium">
205 |                                     {chapter.title || `Capítulo ${index + 1}`}
206 |                                   </h4>
207 |                                   <span className="text-[#555] text-xs">
208 |                                     {formatDate(chapter.createdAt)}
209 |                                   </span>
210 |                                 </div>
211 |                               </div>
212 |                             </div>
213 |                           ))}
214 |                         </div>
215 |                       </motion.div>
216 |                     )}
217 |                   </AnimatePresence>
218 |                 </motion.div>
219 |               ))}
220 |             </motion.div>
221 |           )}
222 |         </div>
223 |       </div>
224 |     </PageTransition>
225 |   );
226 | }
```

docs/PAUTAS_DE_DISENO_ADULTO.md
```
1 | # Adult Design Guidelines – Fantasia Platform
2 | 
3 | ## ⚠️ CRITICAL DISCLAIMER: FUNCTIONAL PRESERVATION
4 | 
5 | **ABSOLUTELY ESSENTIAL: When applying these design guidelines, NEVER alter existing functionality.**
6 | 
7 | - **Preserve all logic intact:** Only modify visual aspects (colors, spacing, typography, backgrounds)
8 | - **Never remove or add interactive elements:** All buttons, inputs, and interactive components must remain exactly as they are
9 | - **Maintain all states:** Ensure hover, active, disabled, loading states continue to work correctly
10 | - **Keep event handlers unchanged:** All onClick, onChange, and similar functions must remain untouched
11 | - **Preserve data structure:** Do not alter how data is stored, processed, or transmitted
12 | - **Respect user permissions:** All free/premium restrictions and access controls must remain functional
13 | 
14 | **The goal is EXCLUSIVELY visual transformation** while maintaining 100% functional integrity. Any change affecting application behavior is strictly prohibited.
15 | 
16 | ---
17 | 
18 | ## 1. Project Context & Transformation
19 | 
20 | ### Platform Evolution
21 | **Fantasia** has transformed from a children's storytelling application to a sophisticated adult-oriented erotic content platform, targeting mature audiences (18+) with personalized adult stories, voice narration, and interactive experiences.
22 | 
23 | ### Target Audience
24 | - **Age Group:** Adults 18+ only
25 | - **Content Focus:** Adult erotic literature and interactive experiences
26 | - **User Experience:** Sophisticated, sensual, and privacy-focused
27 | - **Language:** English (migrated from Spanish)
28 | 
29 | ### Design Philosophy
30 | The new design emphasizes:
31 | - **Sophistication over playfulness**
32 | - **Sensuality over innocence**
33 | - **Privacy and discretion**
34 | - **Modern dark aesthetics**
35 | - **Premium feel and quality**
36 | 
37 | ---
38 | 
39 | ## 2. Color Palette: Adult-Oriented Dark Theme
40 | 
41 | ### Primary Color System
42 | ```css
43 | /* Core Background Colors */
44 | --primary-bg: #000000;           /* Pure black for main backgrounds */
45 | --card-bg: rgba(17, 24, 39, 0.9); /* Dark gray with opacity (gray-900/90) */
46 | --glass-bg: rgba(31, 41, 55, 0.8); /* Glass-morphism dark (gray-800/80) */
47 | 
48 | /* Accent Colors */
49 | --gradient-pink: #ec4899;        /* Pink-500 for primary gradients */
50 | --gradient-violet: #8b5cf6;     /* Violet-500 for primary gradients */
51 | --gradient-purple: #a855f7;     /* Purple-600 for secondary gradients */
52 | 
53 | /* Text Colors */
54 | --text-primary: #f9fafb;         /* Light gray for primary text (gray-50) */
55 | --text-secondary: #d1d5db;       /* Medium gray for secondary text (gray-300) */
56 | --text-muted: #9ca3af;           /* Muted gray for tertiary text (gray-400) */
57 | --text-accent: #a78bfa;          /* Violet-400 for accent text */
58 | ```
59 | 
60 | ### Interactive States
61 | ```css
62 | /* Hover States */
63 | --hover-bg: rgba(55, 65, 81, 0.8);  /* Gray-700/80 for hover backgrounds */
64 | --hover-scale: 1.05;                /* Subtle scale on hover */
65 | 
66 | /* Active/Selected States */
67 | --active-ring: #8b5cf6;            /* Violet-500 for focus rings */
68 | --active-bg: rgba(139, 92, 246, 0.2); /* Violet-500/20 for active backgrounds */
69 | 
70 | /* Disabled States */
71 | --disabled-bg: #374151;            /* Gray-700 for disabled backgrounds */
72 | --disabled-text: #6b7280;         /* Gray-500 for disabled text */
73 | ```
74 | 
75 | ### Gradient Definitions
76 | ```css
77 | /* Primary Gradients */
78 | .gradient-primary { 
79 |   background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); 
80 | }
81 | 
82 | .gradient-secondary { 
83 |   background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); 
84 | }
85 | 
86 | .gradient-text { 
87 |   background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
88 |   -webkit-background-clip: text;
89 |   -webkit-text-fill-color: transparent;
90 |   background-clip: text;
91 | }
92 | ```
93 | 
94 | ---
95 | 
96 | ## 3. Typography & Messaging
97 | 
98 | ### Font System
99 | ```css
100 | /* Font Families */
101 | --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
102 | --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
103 | 
104 | /* Font Sizes */
105 | --text-xs: 0.75rem;      /* 12px */
106 | --text-sm: 0.875rem;     /* 14px */
107 | --text-base: 1rem;       /* 16px */
108 | --text-lg: 1.125rem;     /* 18px */
109 | --text-xl: 1.25rem;      /* 20px */
110 | --text-2xl: 1.5rem;      /* 24px */
111 | --text-3xl: 1.875rem;    /* 30px */
112 | --text-4xl: 2.25rem;     /* 36px */
113 | --text-5xl: 3rem;        /* 48px */
114 | ```
115 | 
116 | ### Heading Styles
117 | ```css
118 | /* Primary Headings */
119 | .heading-primary {
120 |   font-size: var(--text-4xl);
121 |   font-weight: 700;
122 |   line-height: 1.1;
123 |   background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
124 |   -webkit-background-clip: text;
125 |   -webkit-text-fill-color: transparent;
126 |   background-clip: text;
127 | }
128 | 
129 | /* Secondary Headings */
130 | .heading-secondary {
131 |   font-size: var(--text-2xl);
132 |   font-weight: 600;
133 |   color: var(--text-primary);
134 |   margin-bottom: 1rem;
135 | }
136 | ```
137 | 
138 | ### Tone & Language Guidelines
139 | 
140 | #### Language Requirements
141 | - **English Only:** All user-facing text must be in English
142 | - **No Spanish:** The platform has migrated from Spanish to English
143 | - **Console Logs:** All console.log statements must also be in English
144 | - **Error Messages:** All error messages and notifications in English
145 | - **Comments:** Code comments should be in English
146 | 
147 | #### Adult-Oriented Language
148 | - **Sophisticated:** Use mature, refined language
149 | - **Sensual:** Incorporate tasteful sensual undertones
150 | - **Playful:** Strategic use of adult-appropriate emojis
151 | - **Confident:** Direct, confident messaging
152 | - **Inclusive:** Respectful of diverse adult preferences
153 | 
154 | #### Emoji Usage
155 | ```
156 | 🤫 - For privacy/discretion
157 | 🌶️ - For spicy/intense content
158 | ✨ - For magic/special features
159 | 🪄 - For AI generation
160 | 🔥 - For hot/popular content
161 | 💫 - For premium features
162 | 🎭 - For roleplay/fantasy
163 | 💎 - For premium/exclusive content
164 | ```
165 | 
166 | #### Example Transformations
167 | ```
168 | Before: "¡Crea tu cuento mágico!"
169 | After: "Create your intimate story ✨"
170 | 
171 | Before: "Detalles adicionales"
172 | After: "Any juicy details? 🤫"
173 | 
174 | Before: "Generar historia"
175 | After: "Let's make magic! 🪄"
176 | 
177 | Before: console.log("Error al generar historia");
178 | After: console.log("Error generating story");
179 | 
180 | Before: toast.error("No se pudo crear la historia");
181 | After: toast.error("Could not create story");
182 | ```
183 | 
184 | #### Common UI Text Examples
185 | ```
186 | // Navigation & Actions
187 | "Back" (not "Volver")
188 | "Continue" (not "Continuar")
189 | "Generate" (not "Generar")
190 | "Save" (not "Guardar")
191 | "Delete" (not "Eliminar")
192 | "Edit" (not "Editar")
193 | "Share" (not "Compartir")
194 | 
195 | // Story-related
196 | "Story" (not "Historia")
197 | "Chapter" (not "Capítulo")
198 | "Character" (not "Personaje")
199 | "Generate Story" (not "Generar Historia")
200 | "Continue Story" (not "Continuar Historia")
201 | "Story Details" (not "Detalles de Historia")
202 | 
203 | // User Interface
204 | "Loading..." (not "Cargando...")
205 | "Please wait" (not "Por favor espera")
206 | "Try again" (not "Intenta de nuevo")
207 | "Success!" (not "¡Éxito!")
208 | "Error" (not "Error")
209 | "Warning" (not "Advertencia")
210 | 
211 | // Forms
212 | "Name" (not "Nombre")
213 | "Description" (not "Descripción")
214 | "Settings" (not "Configuración")
215 | "Profile" (not "Perfil")
216 | "Preferences" (not "Preferencias")
217 | ```
218 | 
219 | ---
220 | 
221 | ## 4. Background & Layout System
222 | 
223 | ### Background Treatment
224 | ```css
225 | /* Primary Background */
226 | .app-background {
227 |   background-color: #000000;
228 |   min-height: 100vh;
229 |   position: relative;
230 | }
231 | 
232 | /* No decorative backgrounds */
233 | /* OLD: background-image: url(/fondo_png.png) */
234 | /* NEW: Solid black backgrounds for sophistication */
235 | ```
236 | 
237 | ### Container System
238 | ```css
239 | /* Main Content Container */
240 | .content-container {
241 |   width: 100%;
242 |   max-width: 48rem; /* 768px */
243 |   margin: 0 auto;
244 |   padding: 1rem;
245 |   display: flex;
246 |   flex-direction: column;
247 |   align-items: center;
248 |   min-height: 100vh;
249 | }
250 | 
251 | /* Responsive Breakpoints */
252 | @media (min-width: 640px) {
253 |   .content-container {
254 |     padding: 1.5rem;
255 |   }
256 | }
257 | ```
258 | 
259 | ### Spacing System
260 | ```css
261 | /* Spacing Scale */
262 | --space-xs: 0.25rem;   /* 4px */
263 | --space-sm: 0.5rem;    /* 8px */
264 | --space-md: 1rem;      /* 16px */
265 | --space-lg: 1.5rem;    /* 24px */
266 | --space-xl: 2rem;      /* 32px */
267 | --space-2xl: 3rem;     /* 48px */
268 | --space-3xl: 4rem;     /* 64px */
269 | ```
270 | 
271 | ---
272 | 
273 | ## 5. Component Patterns
274 | 
275 | ### Card System
276 | 
277 | #### Glass-Morphism Cards
278 | ```css
279 | .glass-card {
280 |   background: rgba(17, 24, 39, 0.9);
281 |   backdrop-filter: blur(12px);
282 |   border: 1px solid rgba(55, 65, 81, 0.8);
283 |   border-radius: 1rem;
284 |   box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
285 |   transition: all 0.3s ease;
286 | }
287 | 
288 | .glass-card:hover {
289 |   background: rgba(31, 41, 55, 0.9);
290 |   transform: translateY(-2px);
291 |   box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
292 | }
293 | ```
294 | 
295 | #### Content Cards
296 | ```css
297 | .content-card {
298 |   background: rgba(17, 24, 39, 0.9);
299 |   backdrop-filter: blur(12px);
300 |   border: 1px solid rgba(55, 65, 81, 0.8);
301 |   border-radius: 1rem;
302 |   padding: 2rem;
303 |   margin-bottom: 2rem;
304 |   color: #f9fafb;
305 |   line-height: 1.7;
306 |   box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
307 | }
308 | 
309 | .content-card p {
310 |   margin-bottom: 1rem;
311 |   font-size: 1.08em;
312 |   word-wrap: break-word;
313 |   color: #e5e7eb;
314 | }
315 | ```
316 | 
317 | ### Button System
318 | 
319 | #### Primary Buttons
320 | ```css
321 | .btn-primary {
322 |   display: flex;
323 |   align-items: center;
324 |   justify-content: center;
325 |   padding: 0.75rem 1.5rem;
326 |   border-radius: 1rem;
327 |   font-weight: 600;
328 |   font-size: 1.125rem;
329 |   background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
330 |   color: white;
331 |   border: none;
332 |   cursor: pointer;
333 |   transition: all 0.3s ease;
334 |   box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
335 | }
336 | 
337 | .btn-primary:hover {
338 |   background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
339 |   transform: translateY(-1px);
340 |   box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
341 | }
342 | 
343 | .btn-primary:disabled {
344 |   background: #374151;
345 |   color: #6b7280;
346 |   cursor: not-allowed;
347 |   transform: none;
348 |   box-shadow: none;
349 | }
350 | ```
351 | 
352 | #### Secondary Buttons
353 | ```css
354 | .btn-secondary {
355 |   display: flex;
356 |   align-items: center;
357 |   justify-content: center;
358 |   padding: 0.75rem 1.5rem;
359 |   border-radius: 1rem;
360 |   font-weight: 600;
361 |   font-size: 1rem;
362 |   background: rgba(31, 41, 55, 0.8);
363 |   color: #d1d5db;
364 |   border: 1px solid rgba(55, 65, 81, 0.8);
365 |   cursor: pointer;
366 |   transition: all 0.3s ease;
367 |   backdrop-filter: blur(8px);
368 | }
369 | 
370 | .btn-secondary:hover {
371 |   background: rgba(55, 65, 81, 0.8);
372 |   transform: translateY(-1px);
373 |   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
374 | }
375 | ```
376 | 
377 | #### Action Buttons (Narrate, Continue)
378 | ```css
379 | .btn-narrate {
380 |   background: linear-gradient(135deg, #ec4899 0%, #fb7185 100%);
381 |   box-shadow: 0 4px 15px rgba(236, 72, 153, 0.25);
382 | }
383 | 
384 | .btn-continue {
385 |   background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
386 |   box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
387 | }
388 | ```
389 | 
390 | ### Form Elements
391 | 
392 | #### Input Fields
393 | ```css
394 | .form-input {
395 |   width: 100%;
396 |   padding: 1rem;
397 |   background: rgba(17, 24, 39, 0.9);
398 |   border: 2px solid rgba(55, 65, 81, 0.8);
399 |   border-radius: 0.5rem;
400 |   color: white;
401 |   font-size: 1rem;
402 |   transition: all 0.3s ease;
403 |   backdrop-filter: blur(8px);
404 | }
405 | 
406 | .form-input::placeholder {
407 |   color: rgba(156, 163, 175, 0.7);
408 | }
409 | 
410 | .form-input:focus {
411 |   outline: none;
412 |   border-color: #8b5cf6;
413 |   box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
414 | }
415 | ```
416 | 
417 | #### Textarea
418 | ```css
419 | .form-textarea {
420 |   width: 100%;
421 |   padding: 1rem;
422 |   background: rgba(17, 24, 39, 0.9);
423 |   border: 2px solid rgba(55, 65, 81, 0.8);
424 |   border-radius: 0.5rem;
425 |   color: white;
426 |   font-size: 1rem;
427 |   min-height: 8rem;
428 |   resize: none;
429 |   transition: all 0.3s ease;
430 |   backdrop-filter: blur(8px);
431 | }
432 | 
433 | .form-textarea:focus {
434 |   outline: none;
435 |   border-color: #8b5cf6;
436 |   box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
437 | }
438 | ```
439 | 
440 | ### Selection Components
441 | 
442 | #### Choice Cards
443 | ```css
444 | .choice-card {
445 |   padding: 1.5rem;
446 |   border-radius: 0.75rem;
447 |   border: 2px solid rgba(55, 65, 81, 0.8);
448 |   background: rgba(31, 41, 55, 0.5);
449 |   cursor: pointer;
450 |   transition: all 0.3s ease;
451 |   backdrop-filter: blur(8px);
452 | }
453 | 
454 | .choice-card:hover {
455 |   background: rgba(55, 65, 81, 0.7);
456 |   transform: translateY(-2px);
457 |   box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
458 | }
459 | 
460 | .choice-card.selected {
461 |   border-color: #8b5cf6;
462 |   background: rgba(139, 92, 246, 0.2);
463 |   box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5);
464 | }
465 | ```
466 | 
467 | #### Format Selector
468 | ```css
469 | .format-selector {
470 |   display: grid;
471 |   grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
472 |   gap: 1rem;
473 |   margin-bottom: 1.5rem;
474 | }
475 | 
476 | .format-option {
477 |   padding: 1.5rem;
478 |   border-radius: 0.75rem;
479 |   border: 2px solid rgba(55, 65, 81, 0.8);
480 |   background: rgba(31, 41, 55, 0.5);
481 |   cursor: pointer;
482 |   transition: all 0.3s ease;
483 |   text-align: center;
484 | }
485 | 
486 | .format-option.episodic:hover {
487 |   border-color: #8b5cf6;
488 |   background: rgba(139, 92, 246, 0.1);
489 | }
490 | 
491 | .format-option.single:hover {
492 |   border-color: #ec4899;
493 |   background: rgba(236, 72, 153, 0.1);
494 | }
495 | 
496 | .format-option.episodic.selected {
497 |   border-color: #8b5cf6;
498 |   background: rgba(139, 92, 246, 0.2);
499 |   box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
500 | }
501 | 
502 | .format-option.single.selected {
503 |   border-color: #ec4899;
504 |   background: rgba(236, 72, 153, 0.2);
505 |   box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.5);
506 | }
507 | ```
508 | 
509 | ---
510 | 
511 | ## 6. Navigation & Interactive Elements
512 | 
513 | ### Back Button
514 | ```css
515 | .back-button {
516 |   position: absolute;
517 |   top: 1.5rem;
518 |   left: 1.5rem;
519 |   width: 3rem;
520 |   height: 3rem;
521 |   display: flex;
522 |   align-items: center;
523 |   justify-content: center;
524 |   border-radius: 50%;
525 |   background: rgba(31, 41, 55, 0.8);
526 |   backdrop-filter: blur(8px);
527 |   border: 2px solid rgba(55, 65, 81, 0.6);
528 |   color: #8b5cf6;
529 |   cursor: pointer;
530 |   transition: all 0.3s ease;
531 |   z-index: 20;
532 | }
533 | 
534 | .back-button:hover {
535 |   background: rgba(55, 65, 81, 0.8);
536 |   color: #7dc4e0;
537 |   transform: scale(1.05);
538 | }
539 | ```
540 | 
541 | ### Share Button
542 | ```css
543 | .share-button {
544 |   width: 2.75rem;
545 |   height: 2.75rem;
546 |   border-radius: 50%;
547 |   background: rgba(31, 41, 55, 0.8);
548 |   backdrop-filter: blur(12px);
549 |   border: 1px solid rgba(55, 65, 81, 0.8);
550 |   display: flex;
551 |   align-items: center;
552 |   justify-content: center;
553 |   color: #a78bfa;
554 |   cursor: pointer;
555 |   transition: all 0.3s ease;
556 |   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
557 | }
558 | 
559 | .share-button:hover {
560 |   background: rgba(55, 65, 81, 0.8);
561 |   transform: scale(1.05);
562 |   box-shadow: 0 6px 20px rgba(139, 92, 246, 0.25);
563 | }
564 | ```
565 | 
566 | ### Chapter Navigation
567 | ```css
568 | .chapter-nav {
569 |   display: flex;
570 |   justify-content: space-between;
571 |   align-items: center;
572 |   margin-bottom: 1.5rem;
573 |   padding: 0 1rem;
574 | }
575 | 
576 | .chapter-nav-btn {
577 |   display: flex;
578 |   align-items: center;
579 |   gap: 0.25rem;
580 |   color: #a78bfa;
581 |   background: rgba(31, 41, 55, 0.8);
582 |   border: 1px solid rgba(55, 65, 81, 0.8);
583 |   border-radius: 0.75rem;
584 |   padding: 0.5rem 0.75rem;
585 |   font-size: 0.875rem;
586 |   font-weight: 600;
587 |   cursor: pointer;
588 |   transition: all 0.3s ease;
589 |   backdrop-filter: blur(8px);
590 | }
591 | 
592 | .chapter-nav-btn:hover:not(:disabled) {
593 |   background: rgba(55, 65, 81, 0.8);
594 | }
595 | 
596 | .chapter-nav-btn:disabled {
597 |   opacity: 0.4;
598 |   cursor: not-allowed;
599 | }
600 | 
601 | .chapter-indicator {
602 |   color: #d1d5db;
603 |   font-size: 1.125rem;
604 |   font-weight: 700;
605 |   background: rgba(31, 41, 55, 0.8);
606 |   border: 1px solid rgba(55, 65, 81, 0.8);
607 |   padding: 0.25rem 0.75rem;
608 |   border-radius: 0.75rem;
609 |   backdrop-filter: blur(8px);
610 | }
611 | ```
612 | 
613 | ---
614 | 
615 | ## 7. Animation & Transitions
616 | 
617 | ### Framer Motion Variants
618 | ```typescript
619 | // Page transitions
620 | const pageTransition = {
621 |   hidden: { opacity: 0, y: 20 },
622 |   visible: { 
623 |     opacity: 1, 
624 |     y: 0,
625 |     transition: { duration: 0.5 }
626 |   }
627 | };
628 | 
629 | // Staggered animations
630 | const containerVariants = {
631 |   hidden: { opacity: 0 },
632 |   show: {
633 |     opacity: 1,
634 |     transition: {
635 |       staggerChildren: 0.05
636 |     }
637 |   }
638 | };
639 | 
640 | const itemVariants = {
641 |   hidden: { y: 10, opacity: 0 },
642 |   show: { y: 0, opacity: 1 }
643 | };
644 | 
645 | // Title animations
646 | const titleAnimation = {
647 |   initial: { opacity: 0, y: -20 },
648 |   animate: { opacity: 1, y: 0 },
649 |   transition: { duration: 0.5 }
650 | };
651 | ```
652 | 
653 | ### CSS Transitions
654 | ```css
655 | /* Standard transitions */
656 | .transition-all {
657 |   transition: all 0.3s ease;
658 | }
659 | 
660 | .transition-transform {
661 |   transition: transform 0.3s ease;
662 | }
663 | 
664 | .transition-colors {
665 |   transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
666 | }
667 | 
668 | /* Hover effects */
669 | .hover-lift:hover {
670 |   transform: translateY(-2px);
671 | }
672 | 
673 | .hover-scale:hover {
674 |   transform: scale(1.05);
675 | }
676 | 
677 | .hover-glow:hover {
678 |   box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
679 | }
680 | ```
681 | 
682 | ---
683 | 
684 | ## 8. Responsive Design
685 | 
686 | ### Breakpoint System
687 | ```css
688 | /* Mobile First Approach */
689 | .responsive-container {
690 |   padding: 1rem;
691 | }
692 | 
693 | /* Tablet */
694 | @media (min-width: 640px) {
695 |   .responsive-container {
696 |     padding: 1.5rem;
697 |   }
698 | }
699 | 
700 | /* Desktop */
701 | @media (min-width: 1024px) {
702 |   .responsive-container {
703 |     padding: 2rem;
704 |   }
705 | }
706 | ```
707 | 
708 | ### Responsive Typography
709 | ```css
710 | /* Fluid typography */
711 | .responsive-title {
712 |   font-size: clamp(1.875rem, 4vw, 3rem);
713 |   line-height: 1.1;
714 | }
715 | 
716 | .responsive-text {
717 |   font-size: clamp(1rem, 2vw, 1.125rem);
718 |   line-height: 1.6;
719 | }
720 | ```
721 | 
722 | ### Mobile Optimizations
723 | ```css
724 | /* Touch-friendly buttons */
725 | .mobile-button {
726 |   min-height: 44px;
727 |   min-width: 44px;
728 |   padding: 0.75rem 1.5rem;
729 | }
730 | 
731 | /* Mobile-specific layouts */
732 | @media (max-width: 639px) {
733 |   .mobile-stack {
734 |     flex-direction: column;
735 |     gap: 1rem;
736 |   }
737 |   
738 |   .mobile-full-width {
739 |     width: 100%;
740 |   }
741 | }
742 | ```
743 | 
744 | ---
745 | 
746 | ## 9. Accessibility & Privacy
747 | 
748 | ### Accessibility Guidelines
749 | ```css
750 | /* Focus indicators */
751 | .focus-visible {
752 |   outline: 2px solid #8b5cf6;
753 |   outline-offset: 2px;
754 | }
755 | 
756 | /* High contrast text */
757 | .high-contrast {
758 |   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
759 | }
760 | 
761 | /* Screen reader only */
762 | .sr-only {
763 |   position: absolute;
764 |   width: 1px;
765 |   height: 1px;
766 |   padding: 0;
767 |   margin: -1px;
768 |   overflow: hidden;
769 |   clip: rect(0, 0, 0, 0);
770 |   white-space: nowrap;
771 |   border: 0;
772 | }
773 | ```
774 | 
775 | ### Privacy Considerations
776 | - **Discrete Design:** Avoid obvious adult content indicators
777 | - **Quick Exit:** Provide easy navigation away from content
778 | - **Minimal Branding:** Subtle branding for discretion
779 | - **Private Browsing:** Design with private browsing in mind
780 | 
781 | ### Development Practices
782 | 
783 | #### Logging Guidelines
784 | ```javascript
785 | // ✅ CORRECT - English logging
786 | console.log("Story generation started");
787 | console.log("User authenticated successfully");
788 | console.log("Error fetching story data:", error);
789 | console.error("Failed to save story:", error.message);
790 | 
791 | // ❌ INCORRECT - Spanish logging
792 | console.log("Generación de historia iniciada");
793 | console.log("Usuario autenticado exitosamente");
794 | console.log("Error al obtener datos de historia:", error);
795 | console.error("Falló al guardar historia:", error.message);
796 | ```
797 | 
798 | #### Error Handling
799 | ```javascript
800 | // ✅ CORRECT - English error messages
801 | try {
802 |   await generateStory();
803 | } catch (error) {
804 |   console.error("Story generation failed:", error);
805 |   toast.error("Could not generate story", { 
806 |     description: "Please try again or check your connection." 
807 |   });
808 | }
809 | 
810 | // ❌ INCORRECT - Spanish error messages
811 | try {
812 |   await generateStory();
813 | } catch (error) {
814 |   console.error("Generación de historia falló:", error);
815 |   toast.error("No se pudo generar la historia", { 
816 |     description: "Por favor intenta de nuevo o verifica tu conexión." 
817 |   });
818 | }
819 | ```
820 | 
821 | #### Code Comments
822 | ```javascript
823 | // ✅ CORRECT - English comments
824 | // Initialize story generation with user preferences
825 | const initializeStoryGeneration = async (userId, preferences) => {
826 |   // Validate user authentication
827 |   if (!userId) {
828 |     throw new Error("User ID is required");
829 |   }
830 |   
831 |   // Prepare story parameters
832 |   const storyParams = {
833 |     userId,
834 |     preferences,
835 |     timestamp: Date.now()
836 |   };
837 |   
838 |   return storyParams;
839 | };
840 | 
841 | // ❌ INCORRECT - Spanish comments
842 | // Inicializar generación de historia con preferencias del usuario
843 | const initializeStoryGeneration = async (userId, preferences) => {
844 |   // Validar autenticación del usuario
845 |   if (!userId) {
846 |     throw new Error("Se requiere ID de usuario");
847 |   }
848 |   
849 |   // Preparar parámetros de historia
850 |   const storyParams = {
851 |     userId,
852 |     preferences,
853 |     timestamp: Date.now()
854 |   };
855 |   
856 |   return storyParams;
857 | };
858 | ```
859 | 
860 | #### Debug Messages
861 | ```javascript
862 | // ✅ CORRECT - English debug messages
863 | if (process.env.NODE_ENV === 'development') {
864 |   console.log("Debug: Story format selected:", format);
865 |   console.log("Debug: Character preferences:", character);
866 |   console.log("Debug: API response received:", response);
867 | }
868 | 
869 | // ❌ INCORRECT - Spanish debug messages
870 | if (process.env.NODE_ENV === 'development') {
871 |   console.log("Debug: Formato de historia seleccionado:", format);
872 |   console.log("Debug: Preferencias de personaje:", character);
873 |   console.log("Debug: Respuesta de API recibida:", response);
874 | }
875 | ```
876 | 
877 | ---
878 | 
879 | ## 10. Implementation Examples
880 | 
881 | ### Before/After Transformations
882 | 
883 | #### Page Header
884 | ```jsx
885 | // BEFORE (Children's Theme)
886 | <h1 className="text-4xl font-bold text-center mb-6 text-purple-600">
887 |   ¡Crea tu cuento mágico!
888 | </h1>
889 | 
890 | // AFTER (Adult Theme)
891 | <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 
892 |                font-heading bg-clip-text text-transparent 
893 |                bg-gradient-to-r from-pink-500 to-violet-500">
894 |   Any <span className="text-pink-400">juicy details</span>? 🤫
895 | </h1>
896 | ```
897 | 
898 | #### Card Component
899 | ```jsx
900 | // BEFORE (Children's Theme)
901 | <div className="bg-white/70 rounded-3xl p-6 border-2 border-purple-200">
902 |   <p className="text-purple-800">Content here</p>
903 | </div>
904 | 
905 | // AFTER (Adult Theme)
906 | <div className="bg-gray-900/90 backdrop-blur-md border border-gray-800 
907 |                 rounded-2xl p-6 sm:p-8 shadow-2xl ring-1 ring-gray-700/50">
908 |   <p className="text-gray-200">Content here</p>
909 | </div>
910 | ```
911 | 
912 | #### Button Component
913 | ```jsx
914 | // BEFORE (Children's Theme)
915 | <button className="bg-purple-500 hover:bg-purple-600 text-white 
916 |                    px-8 py-4 rounded-2xl font-semibold shadow-lg">
917 |   Generar Historia
918 | </button>
919 | 
920 | // AFTER (Adult Theme)
921 | <button className="bg-gradient-to-r from-violet-500 to-purple-600 
922 |                    hover:from-violet-600 hover:to-purple-700 
923 |                    text-white px-6 py-4 rounded-2xl font-semibold 
924 |                    shadow-lg shadow-violet-500/25 transition-all">
925 |   Let's make magic! 🪄
926 | </button>
927 | ```
928 | 
929 | ### Complete Page Layout
930 | ```jsx
931 | // Adult-themed page structure
932 | <div className="min-h-screen relative pb-24 flex flex-col items-center justify-start"
933 |      style={{ backgroundColor: 'black' }}>
934 |   
935 |   {/* Back Button */}
936 |   <BackButton />
937 |   
938 |   {/* Main Content */}
939 |   <div className="w-full max-w-3xl mx-auto pt-20 px-4 sm:px-6 flex-1 flex flex-col">
940 |     
941 |     {/* Title */}
942 |     <motion.h1 
943 |       initial={{ opacity: 0, y: -20 }}
944 |       animate={{ opacity: 1, y: 0 }}
945 |       className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 
946 |                  bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
947 |       Adult Content Title
948 |     </motion.h1>
949 |     
950 |     {/* Content Card */}
951 |     <motion.div 
952 |       initial={{ opacity: 0, y: 20 }}
953 |       animate={{ opacity: 1, y: 0 }}
954 |       className="bg-gray-900/90 backdrop-blur-md border border-gray-800 
955 |                  rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl">
956 |       {/* Content */}
957 |     </motion.div>
958 |     
959 |     {/* Action Buttons */}
960 |     <motion.div 
961 |       initial={{ opacity: 0, y: 20 }}
962 |       animate={{ opacity: 1, y: 0 }}
963 |       className="flex flex-col items-center space-y-5">
964 |       
965 |       <button className="bg-gradient-to-r from-violet-500 to-purple-600 
966 |                          hover:from-violet-600 hover:to-purple-700 
967 |                          text-white px-6 py-4 rounded-2xl font-semibold 
968 |                          shadow-lg shadow-violet-500/25 transition-all">
969 |         Primary Action
970 |       </button>
971 |       
972 |     </motion.div>
973 |   </div>
974 | </div>
975 | ```
976 | 
977 | ---
978 | 
979 | ## 11. Technical Implementation
980 | 
981 | ### CSS Classes Reference
982 | ```css
983 | /* Adult Theme Utility Classes */
984 | .adult-bg { background-color: #000000; }
985 | .adult-card { 
986 |   background: rgba(17, 24, 39, 0.9);
987 |   backdrop-filter: blur(12px);
988 |   border: 1px solid rgba(55, 65, 81, 0.8);
989 | }
990 | .adult-text { color: #f9fafb; }
991 | .adult-text-secondary { color: #d1d5db; }
992 | .adult-gradient { 
993 |   background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
994 | }
995 | .adult-gradient-text {
996 |   background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
997 |   -webkit-background-clip: text;
998 |   -webkit-text-fill-color: transparent;
999 | }
1000 | ```
1001 | 
1002 | ### Component Class Patterns
1003 | ```css
1004 | /* Button Patterns */
1005 | .btn-adult-primary {
1006 |   @apply bg-gradient-to-r from-violet-500 to-purple-600 
1007 |          hover:from-violet-600 hover:to-purple-700 
1008 |          text-white px-6 py-4 rounded-2xl font-semibold 
1009 |          shadow-lg shadow-violet-500/25 transition-all;
1010 | }
1011 | 
1012 | .btn-adult-secondary {
1013 |   @apply bg-gray-800/80 hover:bg-gray-700/80 
1014 |          text-gray-300 border border-gray-700 
1015 |          px-6 py-3 rounded-2xl font-semibold 
1016 |          shadow transition-all;
1017 | }
1018 | 
1019 | /* Card Patterns */
1020 | .card-adult-glass {
1021 |   @apply bg-gray-900/90 backdrop-blur-md 
1022 |          border border-gray-800 rounded-2xl 
1023 |          shadow-2xl ring-1 ring-gray-700/50;
1024 | }
1025 | 
1026 | .card-adult-interactive {
1027 |   @apply bg-gray-800/50 border-2 border-gray-700 
1028 |          rounded-lg hover:border-violet-500 
1029 |          hover:bg-gray-700/70 transition-all 
1030 |          shadow-sm hover:shadow-lg cursor-pointer;
1031 | }
1032 | ```
1033 | 
1034 | ### Responsive Patterns
1035 | ```css
1036 | /* Mobile-first responsive patterns */
1037 | .adult-container {
1038 |   @apply w-full max-w-3xl mx-auto px-4 sm:px-6 
1039 |          flex flex-col items-center;
1040 | }
1041 | 
1042 | .adult-title {
1043 |   @apply text-3xl sm:text-4xl md:text-5xl font-bold 
1044 |          text-center mb-4 bg-clip-text text-transparent 
1045 |          bg-gradient-to-r from-pink-500 to-violet-500;
1046 | }
1047 | 
1048 | .adult-button-group {
1049 |   @apply flex flex-col sm:flex-row gap-5 sm:gap-8 
1050 |          justify-center items-center w-full;
1051 | }
1052 | ```
1053 | 
1054 | ---
1055 | 
1056 | ## 12. Quality Assurance
1057 | 
1058 | ### Testing Checklist
1059 | - [ ] All original functionality preserved
1060 | - [ ] Responsive design on all devices
1061 | - [ ] Accessibility standards met (WCAG 2.1 AA)
1062 | - [ ] Performance optimized (no layout shifts)
1063 | - [ ] Cross-browser compatibility
1064 | - [ ] Touch interactions work on mobile
1065 | - [ ] Keyboard navigation functional
1066 | - [ ] Screen reader compatible
1067 | 
1068 | ### Code Review Points
1069 | - [ ] No hardcoded colors outside design system
1070 | - [ ] Consistent use of spacing scale
1071 | - [ ] Proper semantic HTML structure
1072 | - [ ] Efficient CSS (no redundant styles)
1073 | - [ ] Optimized animations (60fps)
1074 | - [ ] No accessibility regressions
1075 | - [ ] Proper focus management
1076 | - [ ] Consistent naming conventions
1077 | 
1078 | ---
1079 | 
1080 | ## 13. Maintenance & Updates
1081 | 
1082 | ### Version Control
1083 | - Document all design changes in Git commits
1084 | - Maintain design system versioning
1085 | - Update component library incrementally
1086 | - Test thoroughly before deployment
1087 | 
1088 | ### Evolution Guidelines
1089 | - Regular user feedback collection
1090 | - A/B testing for major changes
1091 | - Performance monitoring
1092 | - Accessibility audits
1093 | - Content sensitivity reviews
1094 | 
1095 | ---
1096 | 
1097 | **Last Updated:** January 2025  
1098 | **Version:** 2.0.0 (Adult Platform)  
1099 | **Target Audience:** 18+ Adults  
1100 | **Platform Status:** Active Development
1101 | 
1102 | ---
1103 | 
1104 | **⚠️ REMINDER: This design system is exclusively for visual transformation. All functional logic, data handling, and user flows must remain exactly as implemented. Any modification that affects application behavior is strictly prohibited.**
```

src/types/index.ts
```
1 | export type ProfileSettings = {
2 |   // --- DATOS PRINCIPALES ---
3 |   // Muestra estos campos en gris oscuro (#222) sobre fondo claro para máxima legibilidad
4 |   language: string; // Idioma preferido del usuario
5 |   preferences?: string | null; // Gustos, fetiches y preferencias para contenido adulto personalizado
6 | 
7 |   // --- CAMPOS DE STRIPE ---
8 |   // Datos sensibles, mostrar en gris oscuro o azul claro solo si es info secundaria
9 |   stripe_customer_id?: string | null;
10 |   subscription_status?: string | null; // Estado de la suscripción (destacar si es "activa" o "cancelada")
11 |   subscription_id?: string | null;
12 |   plan_id?: string | null;
13 |   current_period_end?: string | null; // Fecha de renovación, mostrar en gris oscuro o azul claro
14 | 
15 |   // --- LÍMITES Y CRÉDITOS ---
16 |   // Mostrar estos campos en tarjetas con fondo blanco translúcido y texto destacado:
17 |   // - Números/acento: color de la paleta (ej. rosa #F6A5B7 para "8 / 10")
18 |   // - Texto principal: gris oscuro (#222)
19 |   // - Descripciones: azul claro (#7DC4E0)
20 |   voice_credits?: number | null; // Créditos de voz restantes
21 |   monthly_stories_generated?: number | null; // Historias generadas este mes
22 |   period_start_date?: string | null;
23 |   monthly_voice_generations_used?: number | null; // Usos de voz este mes
24 | 
25 |   // --- OTROS ---
26 |   has_completed_setup: boolean; // Mostrar como check visual, icono en color de la paleta
27 | };
28 | 
29 | export type StoryFormat = 'single' | 'episodic';
30 | 
31 | export type StoryCharacter = {
32 |   id: string;
33 |   name: string;
34 |   gender: 'male' | 'female' | 'non-binary';
35 |   description: string;
36 |   created_at?: string;
37 |   updated_at?: string;
38 | }
39 | 
40 | 
41 | export type StoryOptions = {
42 |   characters: StoryCharacter[];  // Unified: array de personajes (1-4)
43 |   genre: string;
44 |   format: StoryFormat;  // ← CAMBIO: era 'duration'
45 |   language?: string;
46 |   userProvidedContext?: string;
47 |   spiciness_level?: number;  // Adult content intensity level (1=Sensual, 2=Passionate, 3=Intense)
48 | }
49 | 
50 | export type Story = {
51 |   id: string;
52 |   title: string;
53 |   content: string;
54 |   audioUrl?: string;
55 |   options: StoryOptions;
56 |   createdAt: string;
57 |   additional_details?: string | null;
58 | }
59 | 
60 | export type User = {
61 |   email: string;
62 |   id: string;
63 | }
64 | 
65 | 
66 | export type StoryChapter = {
67 |   id: string;
68 |   chapterNumber: number;
69 |   title: string;
70 |   content: string;
71 |   createdAt: string;
72 |   generationMethod?: 'free' | 'option1' | 'option2' | 'option3' | 'custom';
73 |   customInput?: string; // Only if generationMethod is 'custom'
74 | };
75 | 
76 | export type StoryWithChapters = {
77 |   id: string;
78 |   title: string;
79 |   content: string;
80 |   audioUrl?: string;
81 |   options: StoryOptions;
82 |   createdAt: string;
83 |   additional_details?: string | null;
84 |   chapters: StoryChapter[];
85 |   hasMultipleChapters?: boolean;
86 |   chaptersCount?: number;
87 | };
88 | 
89 | export type PresetSuggestion = {
90 |   id: number; // Supabase bigint maps to number in JS/TS if not excessively large
91 |   text_prompt: string;
92 | };
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
70 |         // Get current stories before clearing
71 |         const currentStories = get().generatedStories;
72 |         
73 |         // Don't clear recently generated stories that might not be synced yet
74 |         const recentThreshold = Date.now() - (5 * 60 * 1000); // 5 minutes ago
75 |         const recentStories = currentStories.filter(story => {
76 |           const storyTime = new Date(story.createdAt).getTime();
77 |           return storyTime > recentThreshold;
78 |         });
79 | 
80 |         // Clear stories but preserve recent ones
81 |         set({ generatedStories: recentStories });
82 | 
83 |         const { success, stories } = await getUserStories(user.id);
84 | 
85 |         if (success && stories) {
86 |           console.log(`Cargadas ${stories.length} historias de Supabase`);
87 |           
88 |           // Merge with recent stories, avoiding duplicates
89 |           const existingIds = new Set(recentStories.map(s => s.id));
90 |           const newStories = stories.filter(s => !existingIds.has(s.id));
91 |           
92 |           set({ generatedStories: [...recentStories, ...newStories] });
93 |         } else {
94 |           console.warn("No se encontraron historias o hubo un error");
95 |           // Keep recent stories even if Supabase loading fails
96 |           set({ generatedStories: recentStories });
97 |         }
98 |       } catch (error) {
99 |         console.error("Error al cargar historias:", error);
100 |         // Keep recent stories even if there's an error
101 |         const currentStories = get().generatedStories;
102 |         const recentThreshold = Date.now() - (5 * 60 * 1000);
103 |         const recentStories = currentStories.filter(story => {
104 |           const storyTime = new Date(story.createdAt).getTime();
105 |           return storyTime > recentThreshold;
106 |         });
107 |         set({ generatedStories: recentStories });
108 |       } finally {
109 |         set({ isLoadingStories: false });
110 |       }
111 |     },
112 |   }),
113 |   "stories",
114 | );
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

src/components/BackButton.tsx
```
1 | import { ChevronLeft } from "lucide-react";
2 | import { useNavigate } from "react-router-dom";
3 | 
4 | interface BackButtonProps {
5 |   onClick?: () => void;
6 |   className?: string;
7 | }
8 | 
9 | export default function BackButton({ onClick, className = "" }: BackButtonProps) {
10 |   const navigate = useNavigate();
11 |   
12 |   const handleClick = () => {
13 |     if (onClick) {
14 |       onClick();
15 |     } else {
16 |       navigate(-1);
17 |     }
18 |   };
19 |   
20 |   return (
21 |     <button 
22 |       onClick={handleClick}
23 |       className={`absolute top-6 left-6 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-[#BB79D1]/60 text-[#BB79D1] hover:bg-[#BB79D1]/10 hover:text-[#7DC4E0] focus:ring-4 focus:ring-[#BB79D1]/30 transition-all duration-300 z-20 ${className}`}
24 |       aria-label="Volver atrás"
25 |     >
26 |       <ChevronLeft size={28} />
27 |     </button>
28 |   );
29 | }
```

src/components/PageTransition.tsx
```
1 | 
2 | import { motion } from "framer-motion";
3 | import { ReactNode } from "react";
4 | 
5 | interface PageTransitionProps {
6 |   children: ReactNode;
7 |   className?: string;
8 | }
9 | 
10 | export default function PageTransition({ children, className = "" }: PageTransitionProps) {
11 |   return (
12 |     <motion.div
13 |       initial={{ opacity: 0, y: 20 }}
14 |       animate={{ opacity: 1, y: 0 }}
15 |       exit={{ opacity: 0, y: -20 }}
16 |       transition={{ duration: 0.5, ease: "easeInOut" }}
17 |       className={`w-full min-h-screen ${className}`}
18 |     >
19 |       {children}
20 |     </motion.div>
21 |   );
22 | }
```
