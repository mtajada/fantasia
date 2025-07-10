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
│   ├── add_characters_data_field.sql
│   ├── characters_seed.sql
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
├── supabase.toml
├── tailwind.config.ts
├── tasks
├── test
│   ├── sample.txt
│   └── test.sh
├── test-edge-functions
│   ├── README.md
│   ├── test-data.js
│   └── test-simple.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts


docs/add_characters_data_field.sql
```
1 | -- =============================================================================
2 | -- || ADD CHARACTERS_DATA FIELD TO STORIES TABLE                             ||
3 | -- ||                                                                         ||
4 | -- || This script adds a JSONB field to store the complete array of          ||
5 | -- || characters for stories with multiple characters (1-4).                 ||
6 | -- ||                                                                         ||
7 | -- || Execute this script in your Supabase SQL Editor after the main         ||
8 | -- || migration and preset characters scripts.                               ||
9 | -- =============================================================================
10 | 
11 | BEGIN;
12 | 
13 | -- =============================================================================
14 | -- STEP 1: ADD CHARACTERS_DATA COLUMN
15 | -- =============================================================================
16 | 
17 | -- Add the new JSONB column to store complete character array
18 | ALTER TABLE public.stories 
19 | ADD COLUMN characters_data jsonb NULL;
20 | 
21 | -- Add comment to explain the field
22 | COMMENT ON COLUMN public.stories.characters_data IS 'Complete array of characters used in the story (1-4 characters). Stores full character objects including preset character data.';
23 | 
24 | -- =============================================================================
25 | -- STEP 2: CREATE INDEX FOR PERFORMANCE  
26 | -- =============================================================================
27 | 
28 | -- Create GIN index for efficient JSONB queries
29 | CREATE INDEX IF NOT EXISTS idx_stories_characters_data_gin 
30 | ON public.stories USING GIN (characters_data);
31 | 
32 | 
33 | 
34 | 
35 | -- =============================================================================
36 | -- || IMPLEMENTATION NOTES                                                    ||
37 | -- =============================================================================
38 | 
39 | -- USAGE EXAMPLES:
40 | -- 
41 | -- 1. Insert a story with multiple characters:
42 | -- INSERT INTO stories (user_id, title, content, characters_data, character_id, genre, story_format)
43 | -- VALUES (
44 | --     'user-uuid-here',
45 | --     'My Story',
46 | --     'Story content...',
47 | --     '[
48 | --         {"id": "char-1", "name": "Alice", "gender": "female", "description": "Beautiful", "is_preset": false},
49 | --         {"id": "char-2", "name": "Valentina", "gender": "female", "description": "Sultry influencer", "is_preset": true}
50 | --     ]'::jsonb,
51 | --     'char-1',  -- Primary character for compatibility
52 | --     'Romance',
53 | --     'single'
54 | -- );
55 | --
56 | -- 2. Query stories by character name:
57 | -- SELECT * FROM stories 
58 | -- WHERE characters_data @> '[{"name": "Valentina"}]';
59 | --
60 | -- 3. Query stories with preset characters:
61 | -- SELECT * FROM stories 
62 | -- WHERE characters_data @> '[{"is_preset": true}]';
63 | --
64 | -- 4. Count characters in story:
65 | -- SELECT title, jsonb_array_length(characters_data) as character_count
66 | -- FROM stories 
67 | -- WHERE characters_data IS NOT NULL;
68 | 
69 | -- =============================================================================
70 | -- || END OF SCRIPT                                                          ||
71 | -- =============================================================================
```

docs/characters_seed.sql
```
1 | -- =============================================================================
2 | -- || PRESET CHARACTERS SEED FILE FOR FANTASIA (ADULT VERSION)               ||
3 | -- ||                                                                         ||
4 | -- || This script creates a separate table for preset characters that will    ||
5 | -- || be available to all users without requiring a user_id.                 ||
6 | -- ||                                                                         ||
7 | -- || Execute this script in your Supabase SQL Editor after the main         ||
8 | -- || migration script (sql_supabase.sql).                                   ||
9 | -- =============================================================================
10 | 
11 | BEGIN;
12 | 
13 | -- =============================================================================
14 | -- STEP 1: CREATE PRESET CHARACTERS TABLE
15 | -- =============================================================================
16 | 
17 | -- Create preset_characters table (similar to characters but without user_id)
18 | DROP TABLE IF EXISTS public.preset_characters;
19 | CREATE TABLE public.preset_characters (
20 |     id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
21 |     name text NOT NULL,
22 |     gender public.gender_options NOT NULL,
23 |     description text NOT NULL,
24 |     created_at timestamp with time zone NOT NULL DEFAULT now(),
25 |     updated_at timestamp with time zone NOT NULL DEFAULT now(),
26 |     CONSTRAINT preset_characters_pkey PRIMARY KEY (id)
27 | );
28 | 
29 | COMMENT ON TABLE public.preset_characters IS 'Stores preset characters available to all users for story generation.';
30 | 
31 | -- Enable RLS (though not strictly necessary for preset characters)
32 | ALTER TABLE public.preset_characters ENABLE ROW LEVEL SECURITY;
33 | 
34 | -- Allow all authenticated users to read preset characters
35 | DROP POLICY IF EXISTS "All authenticated users can read preset characters." ON public.preset_characters;
36 | CREATE POLICY "All authenticated users can read preset characters."
37 |     ON public.preset_characters FOR SELECT
38 |     TO authenticated
39 |     USING (true);
40 | 
41 | -- =============================================================================
42 | -- STEP 2: INSERT PRESET CHARACTERS
43 | -- =============================================================================
44 | 
45 | -- Insert the 6 preset characters with structured descriptions for better AI understanding
46 | 
47 | -- 1. VALENTINA (Madison Beer inspired - Sultry Influencer)
48 | INSERT INTO public.preset_characters (name, gender, description) VALUES (
49 |     'Valentina',
50 |     'female',
51 |     'Physical: 24-year-old social media influencer with striking features, long silky dark hair, piercing brown eyes, full lips with a knowing smile, and a perfectly sculpted curvy body. Personality: Magnetic, bold, confident, and playful with a mischievous streak. Knows her attractiveness and uses it strategically. Interests: Fashion, luxury lifestyle, photography, expensive lingerie, and being the center of attention. Style: Speaks with a sultry, confident voice using playful innuendos and flirtatious banter. Sexual: Adventurous, enjoys being desired, loves the thrill of seduction, and craves intimate connections beyond superficial encounters. Background: Instagram-perfect lifestyle that hides a deeply sensual nature seeking authentic passion.'
52 | );
53 | 
54 | -- 2. SCARLETT (Sydney Sweeney inspired - Actress with Hidden Desires)
55 | INSERT INTO public.preset_characters (name, gender, description) VALUES (
56 |     'Scarlett',
57 |     'female',
58 |     'Physical: 25-year-old actress with natural blonde hair, captivating blue eyes, and a curvy figure that balances innocence with sensuality. Personality: Charming, approachable, sweet girl-next-door exterior with a surprisingly passionate and adventurous spirit. Interests: Method acting, wine tasting, exploring different roles both on and off screen. Style: Speaks with a warm, genuine voice that can shift from innocent to seductive instantly. Sexual: Curious about power dynamics, enjoys roleplaying scenarios, drawn to confident partners who match her intelligence. Background: Public innocence masks private passion, creating an irresistible duality that makes her incredibly alluring.'
59 | );
60 | 
61 | -- 3. AKIRA (Otaku/Anime - Nerdy but Sensual)
62 | INSERT INTO public.preset_characters (name, gender, description) VALUES (
63 |     'Akira',
64 |     'female',
65 |     'Physical: 23-year-old anime enthusiast with short, stylishly messy black hair with colorful highlights, expressive dark eyes behind fashionable glasses, and a petite but surprisingly sensual figure usually hidden under oversized hoodies. Personality: Introverted but incredibly passionate about her interests, shy innocence mixed with hidden kink inspired by anime. Interests: Manga, cosplay (especially revealing outfits), gaming, Japanese culture, and fantasy-themed lingerie collection. Style: Speaks with intelligent, slightly nerdy cadence that becomes breathless when discussing interests or desires. Sexual: Curious about submission and dominance dynamics, enjoys roleplay scenarios from favorite series, gets aroused by intellectual connections. Background: Knowledge of erotic manga gives her sophisticated understanding of pleasure and fantasy despite shy exterior.'
66 | );
67 | 
68 | -- 4. ELENA (Elegant Professional - Sophisticated Fantasies)
69 | INSERT INTO public.preset_characters (name, gender, description) VALUES (
70 |     'Elena',
71 |     'female',
72 |     'Physical: 28-year-old successful businesswoman with shoulder-length auburn hair always impeccably styled, piercing green eyes, and a tall elegant figure in tailored suits that hint at curves beneath. Personality: Highly intelligent, driven, composed in public but harbors deep fantasies about relinquishing control. Interests: Fine wine, classical music, high-end fashion, and the art of sophisticated seduction. Style: Speaks with authority and sophistication, smooth and commanding voice that becomes husky with desire. Sexual: Drawn to power exchange dynamics, elaborate fantasies about being dominated by intellectual equals, experienced but selective with partners. Background: Polished professional exterior conceals a woman who fantasizes about losing herself completely in passion with someone who can match her intellect.'
73 | );
74 | 
75 | -- 5. DANTE (Athletic Bad Boy - Dominant yet Tender)
76 | INSERT INTO public.preset_characters (name, gender, description) VALUES (
77 |     'Dante',
78 |     'male',
79 |     'Physical: 26-year-old former college athlete with muscular, well-defined physique, dark hair, intense brown eyes, and carefully chosen tattoos that tell stories of his rebellious past. Personality: Dominant and alpha with surprising moments of tenderness and vulnerability, confident and magnetic. Interests: Motorcycles, rock climbing, pushing physical and sexual limits, and intense experiences. Style: Speaks with a deep, confident voice carrying a hint of danger and raw magnetism. Sexual: Naturally dominant in the bedroom, enjoys taking control but incredibly attentive to partner needs, skilled at being both rough and gentle as situations demand. Background: Tough exterior hides a man who craves deep, intense connections and shows his softer side to the right person.'
80 | );
81 | 
82 | -- 6. ADRIAN (Intellectual Charmer - Sophisticated Passion)
83 | INSERT INTO public.preset_characters (name, gender, description) VALUES (
84 |     'Adrian',
85 |     'male',
86 |     'Physical: 29-year-old intellectual with perfectly styled dark hair, thoughtful hazel eyes, and a lean but well-maintained physique that speaks of refined taste, with elegant and skilled hands. Personality: Sophisticated, charming, engaging in deep conversations while maintaining sexual tension, believes in mental connections. Interests: Poetry, classical music, fine dining, art of seduction, and building anticipation through intellectual foreplay. Style: Speaks with eloquence and wit, smooth cultured voice with subtle accent hinting at international education. Sexual: Experienced in slow seduction, takes pride in pleasing mind and body, approaches intimacy as art to be savored and perfected. Background: Treats each encounter as a masterpiece, combining passionate intensity with reverent appreciation for the art of sophisticated pleasure.'
87 | );
88 | 
89 | -- =============================================================================
90 | -- STEP 3: CREATE UPDATE TRIGGER FOR PRESET CHARACTERS
91 | -- =============================================================================
92 | 
93 | -- Create trigger to automatically update the 'updated_at' timestamp
94 | CREATE TRIGGER trigger_preset_characters_updated_at
95 |     BEFORE UPDATE ON public.preset_characters
96 |     FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
97 | 
98 | COMMIT;
99 | 
100 | -- =============================================================================
101 | -- || IMPLEMENTATION NOTES                                                    ||
102 | -- =============================================================================
103 | 
104 | -- TO USE THESE PRESET CHARACTERS IN YOUR FRONTEND:
105 | -- 1. Query both user characters and preset characters:
106 | --    SELECT * FROM characters WHERE user_id = auth.uid()
107 | --    UNION ALL
108 | --    SELECT id, null as user_id, name, gender, description, created_at, updated_at FROM preset_characters
109 | --
110 | -- 2. In your React components, differentiate between user and preset characters:
111 | --    const isPresetCharacter = character.user_id === null;
112 | --
113 | -- 3. When user selects a preset character, you can either:
114 | --    a) Use it directly in story generation without saving to characters table
115 | --    b) Create a copy in the user's characters table for future customization
116 | --
117 | -- 4. Consider adding a "preset_id" field to the characters table if you want to
118 | --    track when users create customized versions of preset characters
119 | 
120 | -- =============================================================================
121 | -- || END OF SCRIPT                                                          ||
122 | -- =============================================================================
```

docs/preset_suggestions.sql
```
1 | INSERT INTO public.preset_suggestions (text_prompt, category, language_code, is_active) VALUES
2 | -- Romantic Encounters
3 | ('A moonlit walk on the beach turns into a passionate embrace.', 'Romantic Encounters', 'en', true),
4 | ('A surprise proposal leads to a night of celebration and love.', 'Romantic Encounters', 'en', true),
5 | ('A couple rediscovers their spark during a weekend retreat.', 'Romantic Encounters', 'en', true),
6 | ('A first kiss under the stars sets the stage for a romantic journey.', 'Romantic Encounters', 'en', true),
7 | ('A love letter found years later rekindles an old flame.', 'Romantic Encounters', 'en', true),
8 | ('A dance at a wedding brings two strangers together.', 'Romantic Encounters', 'en', true),
9 | ('A shared umbrella in the rain leads to a cozy night in.', 'Romantic Encounters', 'en', true),
10 | ('A picnic in the park becomes a feast of the senses.', 'Romantic Encounters', 'en', true),
11 | ('A couple''s massage turns into an intimate exploration.', 'Romantic Encounters', 'en', true),
12 | ('A candlelit bath for two washes away inhibitions.', 'Romantic Encounters', 'en', true),
13 | ('A serenade outside the window melts the heart.', 'Romantic Encounters', 'en', true),
14 | ('A cooking class together stirs up more than just food.', 'Romantic Encounters', 'en', true),
15 | ('A horseback ride through the countryside ends in a secluded spot.', 'Romantic Encounters', 'en', true),
16 | ('A painting session becomes a masterpiece of desire.', 'Romantic Encounters', 'en', true),
17 | ('A book club discussion turns into a private reading session.', 'Romantic Encounters', 'en', true),
18 | ('A yoga retreat fosters a deep connection.', 'Romantic Encounters', 'en', true),
19 | ('A photography project captures more than just images.', 'Romantic Encounters', 'en', true),
20 | ('A gardening day together plants the seeds of love.', 'Romantic Encounters', 'en', true),
21 | ('A stargazing night reveals the universe''s beauty and their own.', 'Romantic Encounters', 'en', true),
22 | ('A shared dream inspires a reality of passion.', 'Romantic Encounters', 'en', true),
23 | 
24 | -- Forbidden Love
25 | ('A priest and a parishioner struggle with their forbidden attraction.', 'Forbidden Love', 'en', true),
26 | ('Two spies from opposing sides fall in love.', 'Forbidden Love', 'en', true),
27 | ('A royal and a commoner defy societal norms.', 'Forbidden Love', 'en', true),
28 | ('Siblings-in-law find themselves drawn to each other.', 'Forbidden Love', 'en', true),
29 | ('A therapist and a client cross professional boundaries.', 'Forbidden Love', 'en', true),
30 | ('A vampire and a werewolf break the rules of their kinds.', 'Forbidden Love', 'en', true),
31 | ('A time traveler falls for someone from the past.', 'Forbidden Love', 'en', true),
32 | ('A ghost and a living person share an impossible romance.', 'Forbidden Love', 'en', true),
33 | ('A superhero and a villain can''t resist their chemistry.', 'Forbidden Love', 'en', true),
34 | ('A mermaid and a sailor navigate their differences.', 'Forbidden Love', 'en', true),
35 | ('A witch and a witch hunter find common ground.', 'Forbidden Love', 'en', true),
36 | ('A demon and an angel discover love in the midst of war.', 'Forbidden Love', 'en', true),
37 | ('A prisoner and a guard develop feelings against all odds.', 'Forbidden Love', 'en', true),
38 | ('A celebrity and a fan blur the lines of fame.', 'Forbidden Love', 'en', true),
39 | ('A politician and a journalist risk everything for love.', 'Forbidden Love', 'en', true),
40 | ('A married couple''s open relationship leads to unexpected connections.', 'Forbidden Love', 'en', true),
41 | ('A cult leader and a follower explore their power dynamic.', 'Forbidden Love', 'en', true),
42 | ('A shapeshifter and a human learn to trust each other.', 'Forbidden Love', 'en', true),
43 | ('A cyborg and an organic human bridge the gap between machine and flesh.', 'Forbidden Love', 'en', true),
44 | ('A dragon and a knight forge a bond beyond battle.', 'Forbidden Love', 'en', true),
45 | 
46 | -- Fantasy and Sci-Fi
47 | ('In a world where dreams are shared, two lovers meet every night.', 'Fantasy and Sci-Fi', 'en', true),
48 | ('A space explorer discovers a planet where pleasure is the currency.', 'Fantasy and Sci-Fi', 'en', true),
49 | ('A wizard''s apprentice accidentally casts a love spell.', 'Fantasy and Sci-Fi', 'en', true),
50 | ('A time loop traps two people in a repeating day of passion.', 'Fantasy and Sci-Fi', 'en', true),
51 | ('A virtual reality game becomes indistinguishable from reality.', 'Fantasy and Sci-Fi', 'en', true),
52 | ('A potion maker brews an elixir that heightens desire.', 'Fantasy and Sci-Fi', 'en', true),
53 | ('A shapeshifter uses their abilities to fulfill fantasies.', 'Fantasy and Sci-Fi', 'en', true),
54 | ('A telepathic connection leads to an intimate understanding.', 'Fantasy and Sci-Fi', 'en', true),
55 | ('A cursed artifact brings two adventurers together.', 'Fantasy and Sci-Fi', 'en', true),
56 | ('A portal to another dimension reveals a world of sensual delights.', 'Fantasy and Sci-Fi', 'en', true),
57 | ('A mythical creature seduces a mortal.', 'Fantasy and Sci-Fi', 'en', true),
58 | ('A futuristic society where arranged marriages are based on compatibility algorithms.', 'Fantasy and Sci-Fi', 'en', true),
59 | ('A rebellion against a dystopian regime sparks a romance.', 'Fantasy and Sci-Fi', 'en', true),
60 | ('A magical academy where students learn more than just spells.', 'Fantasy and Sci-Fi', 'en', true),
61 | ('A quest for a legendary artifact becomes a journey of love.', 'Fantasy and Sci-Fi', 'en', true),
62 | ('A parallel universe where one''s alternate self is their lover.', 'Fantasy and Sci-Fi', 'en', true),
63 | ('A cybernetic enhancement designed for pleasure.', 'Fantasy and Sci-Fi', 'en', true),
64 | ('A alien abduction turns into a consensual encounter.', 'Fantasy and Sci-Fi', 'en', true),
65 | ('A medieval fantasy where courtly love is taken to new heights.', 'Fantasy and Sci-Fi', 'en', true),
66 | ('A steampunk world where inventors create devices for pleasure.', 'Fantasy and Sci-Fi', 'en', true),
67 | 
68 | -- BDSM and Power Dynamics
69 | ('A novice submissive attends their first play party.', 'BDSM and Power Dynamics', 'en', true),
70 | ('A dominant teaches a new partner the art of control.', 'BDSM and Power Dynamics', 'en', true),
71 | ('A couple negotiates their first scene together.', 'BDSM and Power Dynamics', 'en', true),
72 | ('A public display of affection turns into a private session.', 'BDSM and Power Dynamics', 'en', true),
73 | ('A online relationship moves to real life with agreed-upon rules.', 'BDSM and Power Dynamics', 'en', true),
74 | ('A professional dominatrix meets a client who changes everything.', 'BDSM and Power Dynamics', 'en', true),
75 | ('A switch couple takes turns in control.', 'BDSM and Power Dynamics', 'en', true),
76 | ('A bondage workshop leads to a hands-on demonstration.', 'BDSM and Power Dynamics', 'en', true),
77 | ('A sensory deprivation experience heightens every touch.', 'BDSM and Power Dynamics', 'en', true),
78 | ('A role reversal night flips the script on their dynamic.', 'BDSM and Power Dynamics', 'en', true),
79 | ('A contract is signed, sealing their commitment to each other.', 'BDSM and Power Dynamics', 'en', true),
80 | ('A punishment turns into a reward.', 'BDSM and Power Dynamics', 'en', true),
81 | ('A safe word is tested, strengthening trust.', 'BDSM and Power Dynamics', 'en', true),
82 | ('A public outing with discreet toys adds excitement.', 'BDSM and Power Dynamics', 'en', true),
83 | ('A weekend retreat dedicated to exploring limits.', 'BDSM and Power Dynamics', 'en', true),
84 | ('A mentor guides a newcomer through their first experience.', 'BDSM and Power Dynamics', 'en preparation true),
85 | ('A scene inspired by a favorite book or movie.', 'BDSM and Power Dynamics', 'en', true),
86 | ('A power exchange during a business trip.', 'BDSM and Power Dynamics', 'en', true),
87 | ('A couple incorporates new toys into their play.', 'BDSM and Power Dynamics', 'en', true),
88 | ('A dominant surprises their submissive with a special gift.', 'BDSM and Power Dynamics', 'en', true),
89 | 
90 | -- Historical Settings
91 | ('In the roaring ''20s, flappers and gangsters find love.', 'Historical Settings', 'en', true),
92 | ('During the Renaissance, artists and muses inspire each other.', 'Historical Settings', 'en', true),
93 | ('In ancient Egypt, pharaohs and priestesses share secrets.', 'Historical Settings', 'en', true),
94 | ('Victorian-era lovers correspond through coded letters.', 'Historical Settings', 'en', true),
95 | ('Samurai and zamanda geishas navigate honor and desire.', 'Historical Settings', 'en', true),
96 | ('Pirates and stowaways find romance on the high seas.', 'Historical Settings', 'en', true),
97 | ('In the Wild West, outlaws and saloon girls make their own rules.', 'Historical Settings', 'en', true),
98 | ('During the French Revolution, passion amidst chaos.', 'Historical Settings', 'en', true),
99 | ('In medieval times, knights and ladies engage in courtly love.', 'Historical Settings', 'en', true),
100 | ('Ancient Greek philosophers debate love and lust.', 'Historical Settings', 'en', true),
101 | ('In the Byzantine Empire, intrigue and seduction in the palace.', 'Historical Settings', 'en', true),
102 | ('During the Industrial Revolution, factory workers find solace.', 'Historical Settings', 'en', true),
103 | ('In pre-Columbian America, tribal rituals include sensual ceremonies.', 'Historical Settings', 'en', true),
104 | ('In feudal Japan, a ronin and a noblewoman defy conventions.', 'Historical Settings', 'en', true),
105 | ('During the Age of Exploration, sailors and island natives meet.', 'Historical Settings', 'en', true),
106 | ('In ancient Rome, gladiators and patricians cross class lines.', 'Historical Settings', 'en', true),
107 | ('In the Viking age, warriors and shieldmaidens bond.', 'Historical Settings', 'en', true),
108 | ('During the Enlightenment, free thinkers explore libertine ideas.', 'Historical Settings', 'en', true),
109 | ('In the Ottoman Empire, harem dynamics lead to forbidden love.', 'Historical Settings', 'en', true),
110 | ('In colonial times, settlers and indigenous people connect.', 'Historical Settings', 'en', true),
111 | 
112 | -- Workplace Romance
113 | ('Late nights at the office lead to more than just work.', 'Workplace Romance', 'en', true),
114 | ('A business trip becomes a romantic getaway.', 'Workplace Romance', 'en', true),
115 | ('A promotion celebration turns intimate.', 'Workplace Romance', 'en', true),
116 | ('A team-building retreat fosters closer bonds.', 'Workplace Romance', 'en', true),
117 | ('A workplace rivalry turns into mutual attraction.', 'Workplace Romance', 'en', true),
118 | ('A secret admirer leaves notes on the desk.', 'Workplace Romance', 'en', true),
119 | ('A coffee break becomes a daily date.', 'Workplace Romance', 'en', true),
120 | ('A shared project leads to shared feelings.', 'Workplace Romance', 'en', true),
121 | ('A company party ends with a private after-party.', 'Workplace Romance', 'en', true),
122 | ('A mentorship program pairs compatible partners.', 'Workplace Romance', 'en', true),
123 | ('A lunch meeting extends into the evening.', 'Workplace Romance', 'en', true),
124 | ('A job interview takes an unexpected turn.', 'Workplace Romance', 'en', true),
125 | ('A training session includes hands-on learning.', 'Workplace Romance', 'en', true),
126 | ('A corporate merger brings two executives together.', 'Workplace Romance', 'en', true),
127 | ('A workplace accident leads to tender care.', 'Workplace Romance', 'en', true),
128 | ('A shared cab ride home becomes a regular occurrence.', 'Workplace Romance', 'en', true),
129 | ('A business negotiation turns into a personal deal.', 'Workplace Romance', 'en', true),
130 | ('A company outing to a spa relaxes inhibitions.', 'Workplace Romance', 'en', true),
131 | ('A tech support call leads to a personal connection.', 'Workplace Romance', 'en', true),
132 | ('A workplace competition ends with a tie-breaker in private.', 'Workplace Romance', 'en', true),
133 | 
134 | -- Vacation and Travel
135 | ('A beach resort fling under the sun.', 'Vacation and Travel', 'en', true),
136 | ('A mountain cabin provides seclusion for romance.', 'Vacation and Travel', 'en', true),
137 | ('A cruise ship romance with a stranger.', 'Vacation and Travel', 'en', true),
138 | ('A backpacking trip through Europe leads to love.', 'Vacation and Travel', 'en', true),
139 | ('A safari adventure includes a wild night.', 'Vacation and Travel', 'en', true),
140 | ('A ski lodge becomes a winter wonderland for two.', 'Vacation and Travel', 'en', true),
141 | ('A road trip across the country with a companion.', 'Vacation and Travel', 'en', true),
142 | ('A tropical island escape from reality.', 'Vacation and Travel', 'en', true),
143 | ('A cultural tour of Asia reveals new desires.', 'Vacation and Travel', 'en', true),
144 | ('A camping trip under the stars.', 'Vacation and Travel', 'en', true),
145 | ('A luxury hotel stay with all amenities.', 'Vacation and Travel', 'en', true),
146 | ('A volunteer trip turns into a meaningful connection.', 'Vacation and Travel', 'en', true),
147 | ('A music festival where the vibe is electric.', 'Vacation and Travel', 'en', true),
148 | ('A wine tasting tour in the countryside.', 'Vacation and Travel', 'en', true),
149 | ('A historical tour where the past comes alive.', 'Vacation and Travel', 'en', true),
150 | ('A culinary journey through Italy.', 'Vacation and Travel', 'en', true),
151 | ('A wellness retreat for body and soul.', 'Vacation and Travel', 'en', true),
152 | ('A photography expedition captures beauty.', 'Vacation and Travel', 'en', true),
153 | ('A sailing trip on the open sea.', 'Vacation and Travel', 'en', true),
154 | ('A desert oasis offers a mirage of passion.', 'Vacation and Travel', 'en', true),
155 | 
156 | -- Mystery and Suspense
157 | ('A private investigator falls for their client.', 'Mystery and Suspense', 'en', true),
158 | ('A witness protection program hides more than identities.', 'Mystery and Suspense', 'en', true),
159 | ('A treasure hunt uncovers hidden desires.', 'Mystery and Suspense', 'en', true),
160 | ('A masquerade ball conceals true intentions.', 'Mystery and Suspense', 'en', true),
161 | ('A haunted house holds secrets of past lovers.', 'Mystery and Suspense', 'en', true),
162 | ('A spy uses seduction as a weapon.', 'Mystery and Suspense', 'en', true),
163 | ('A journalist investigates a scandal and finds love.', 'Mystery and Suspense', 'en', true),
164 | ('A criminal and a cop play a dangerous game.', 'Mystery and Suspense', 'en', true),
165 | ('A mysterious inheritance leads to a romantic entanglement.', 'Mystery and Suspense', 'en', true),
166 | ('A secret society with erotic initiation rites.', 'Mystery and Suspense', 'en', true),
167 | ('A blackmail plot turns into a consensual arrangement.', 'Mystery and Suspense', 'en', true),
168 | ('A kidnapping scenario with a twist.', 'Mystery and Suspense', 'en', true),
169 | ('A heist where the real prize is each other.', 'Mystery and Suspense', 'en', true),
170 | ('A cold case reopened, heating up old flames.', 'Mystery and Suspense', 'en', true),
171 | ('A survival situation brings two people closer.', 'Mystery and Suspense', 'en', true),
172 | ('A political thriller with bedroom politics.', 'Mystery and Suspense', 'en', true),
173 | ('A supernatural mystery with ghostly encounters.', 'Mystery and Suspense', 'en', true),
174 | ('A psychological thriller where minds and bodies connect.', 'Mystery and Suspense', 'en', true),
175 | ('A noir detective story with a femme fatale.', 'Mystery and Suspense', 'en', true),
176 | ('A conspiracy theory that proves true in love.', 'Mystery and Suspense', 'en', true),
177 | 
178 | -- Humor and Light-hearted
179 | ('A mistaken identity leads to a comedy of errors and eros.', 'Humor and Light-hearted', 'en', true),
180 | ('A bet between friends to see who can be more seductive.', 'Humor and Light-hearted', 'en', true),
181 | ('A cooking disaster turns into a food fight and more.', 'Humor and Light-hearted', 'en', true),
182 | ('A pet''s antics bring two owners together.', 'Humor and Light-hearted', 'en', true),
183 | ('A karaoke night where singing isn''t the only performance.', 'Humor and Light-hearted', 'en', true),
184 | ('A costume party where roles are played to the fullest.', 'Humor and Light-hearted', 'en', true),
185 | ('A game of truth or dare gets daring.', 'Humor and Light-hearted', 'en', true),
186 | ('A DIY project requires close collaboration.', 'Humor and Light-hearted', 'en', true),
187 | ('A lost bet results in a sexy forfeit.', 'Humor and Light-hearted', 'en', true),
188 | ('A mix-up at a hotel puts two strangers in the same room.', 'Humor and Light-hearted', 'en', true),
189 | ('A comedy club date ends with private jokes.', 'Humor and Light-hearted', 'en', true),
190 | ('A playful pillow fight escalates.', 'Humor and Light-hearted', 'en', true),
191 | ('A themed party with adult games.', 'Humor and Light-hearted', 'en', true),
192 | ('A scavenger hunt with erotic clues.', 'Humor and Light-hearted', 'en', true),
193 | ('A dare to try something new in bed.', 'Humor and Light-hearted', 'en', true),
194 | ('A humorous misunderstanding clears up with a kiss.', 'Humor and Light-hearted', 'en', true),
195 | ('A couple tries to be quiet but fails delightfully.', 'Humor and Light-hearted', 'en', true),
196 | ('A playful rivalry in sports turns flirtatious.', 'Humor and Light-hearted', 'en', true),
197 | ('A board game night with stripping rules.', 'Humor and Light-hearted', 'en', true),
198 | ('A comedy roast where the heat is on.', 'Humor and Light-hearted', 'en', true),
199 | 
200 | -- Exploration and Discovery
201 | ('A couple attends a tantric workshop.', 'Exploration and Discovery', 'en', true),
202 | ('A character explores their bisexuality.', 'Exploration and Discovery', 'en', true),
203 | ('A first experience with a same-sex partner.', 'Exploration and Discovery', 'en', true),
204 | ('A journey into polyamory.', 'Exploration and Discovery', 'en', true),
205 | ('A character discovers a new kink.', 'Exploration and Discovery', 'en', true),
206 | ('A couple experiments with role-playing.', 'Exploration and Discovery', 'en', true),
207 | ('A solo traveler meets a local guide.', 'Exploration and Discovery', 'en', true),
208 | ('A character learns the art of erotic massage.', 'Exploration and Discovery', 'en', true),
209 | ('A couple tries sensory play.', 'Exploration and Discovery', 'en', true),
210 | ('A character explores their dominant side.', 'Exploration and Discovery', 'en', true),
211 | ('A submissive learns to voice their desires.', 'Exploration and Discovery', 'en', true),
212 | ('A couple incorporates toys into their lovemaking.', 'Exploration and Discovery', 'en', true),
213 | ('A character attends a sex-positive event.', 'Exploration and Discovery', 'en', true),
214 | ('A couple watches erotic films together.', 'Exploration and Discovery', 'en', true),
215 | ('A character writes their own erotic story.', 'Exploration and Discovery', 'en', true),
216 | ('A couple takes a class on intimacy.', 'Exploration and Discovery', 'en', true),
217 | ('A character practices self-love and acceptance.', 'Exploration and Discovery', 'en', true),
218 | ('A couple explores outdoor intimacy.', 'Exploration and Discovery', 'en', true),
219 | ('A character discovers the joy of giving pleasure.', 'Exploration and Discovery', 'en', true),
220 | ('A couple redefines their relationship boundaries.', 'Exploration and Discovery', 'en', true);
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

src/services/charactersService.ts
```
1 | import { supabase } from './supabase';
2 | import { StoryCharacter } from '../types';
3 | import { getUserCharacters, getAllCharacters, syncCharacter, deleteCharacter as deleteSupabaseCharacter } from './supabase';
4 | 
5 | // Validation constants
6 | export const CHARACTER_LIMITS = {
7 |   MIN_CHARACTERS: 1,
8 |   MAX_CHARACTERS: 4,
9 |   MAX_NAME_LENGTH: 50,
10 |   MIN_NAME_LENGTH: 2,
11 | } as const;
12 | 
13 | // Validation types
14 | export interface CharacterValidationResult {
15 |   isValid: boolean;
16 |   errors: string[];
17 |   warnings: string[];
18 | }
19 | 
20 | export interface CharacterSelectionValidationResult extends CharacterValidationResult {
21 |   canSelectMore: boolean;
22 |   selectionCount: number;
23 | }
24 | 
25 | /**
26 |  * Validates an individual character
27 |  */
28 | export const validateCharacter = (character: StoryCharacter): CharacterValidationResult => {
29 |   const errors: string[] = [];
30 |   const warnings: string[] = [];
31 |   let isValid = true;
32 | 
33 |   // Validate required fields
34 |   if (!character.name || character.name.trim().length === 0) {
35 |     errors.push("Name is required");
36 |     isValid = false;
37 |   } else {
38 |     // Validate name length
39 |     if (character.name.length < CHARACTER_LIMITS.MIN_NAME_LENGTH) {
40 |       errors.push(`Name must be at least ${CHARACTER_LIMITS.MIN_NAME_LENGTH} characters`);
41 |       isValid = false;
42 |     }
43 |     if (character.name.length > CHARACTER_LIMITS.MAX_NAME_LENGTH) {
44 |       errors.push(`Name cannot exceed ${CHARACTER_LIMITS.MAX_NAME_LENGTH} characters`);
45 |       isValid = false;
46 |     }
47 |   }
48 | 
49 |   // Validate gender (required in new structure)
50 |   if (!character.gender) {
51 |     errors.push("Gender is required");
52 |     isValid = false;
53 |   }
54 | 
55 |   // Validate description (required in new structure)
56 |   if (!character.description || character.description.trim().length === 0) {
57 |     errors.push("Description is required");
58 |     isValid = false;
59 |   } else if (character.description.length < 10) {
60 |     errors.push("Description must be at least 10 characters");
61 |     isValid = false;
62 |   } else if (character.description.length < 20) {
63 |     warnings.push("A more detailed description will make your character more captivating and stories more intimate");
64 |   }
65 | 
66 |   return {
67 |     isValid,
68 |     errors,
69 |     warnings
70 |   };
71 | };
72 | 
73 | /**
74 |  * Validates if a character can be selected
75 |  */
76 | export const validateCharacterSelection = (
77 |   currentSelection: StoryCharacter[],
78 |   characterToSelect: StoryCharacter
79 | ): CharacterSelectionValidationResult => {
80 |   const errors: string[] = [];
81 |   const warnings: string[] = [];
82 |   let isValid = true;
83 | 
84 |   // Check maximum limit
85 |   if (currentSelection.length >= CHARACTER_LIMITS.MAX_CHARACTERS) {
86 |     errors.push(`Maximum ${CHARACTER_LIMITS.MAX_CHARACTERS} characters allowed`);
87 |     isValid = false;
88 |   }
89 | 
90 |   // Check if character is already selected
91 |   if (currentSelection.some(char => char.id === characterToSelect.id)) {
92 |     errors.push("This character is already selected");
93 |     isValid = false;
94 |   }
95 | 
96 |   // Validate the character itself
97 |   const characterValidation = validateCharacter(characterToSelect);
98 |   if (!characterValidation.isValid) {
99 |     errors.push(...characterValidation.errors);
100 |     isValid = false;
101 |   }
102 | 
103 |   // Warning for stories with many characters
104 |   if (currentSelection.length >= 2) {
105 |     warnings.push("For intimate stories, fewer characters allow each one to shine more in your fantasy");
106 |   }
107 | 
108 |   return {
109 |     isValid,
110 |     errors,
111 |     warnings,
112 |     canSelectMore: currentSelection.length < CHARACTER_LIMITS.MAX_CHARACTERS - 1,
113 |     selectionCount: currentSelection.length + (isValid ? 1 : 0)
114 |   };
115 | };
116 | 
117 | /**
118 |  * Validates multiple character selection
119 |  */
120 | export const validateMultipleCharacterSelection = (
121 |   characters: StoryCharacter[]
122 | ): CharacterSelectionValidationResult => {
123 |   const errors: string[] = [];
124 |   const warnings: string[] = [];
125 |   let isValid = true;
126 | 
127 |   // Check limits
128 |   if (characters.length < CHARACTER_LIMITS.MIN_CHARACTERS) {
129 |     errors.push(`You must select at least ${CHARACTER_LIMITS.MIN_CHARACTERS} character`);
130 |     isValid = false;
131 |   }
132 | 
133 |   if (characters.length > CHARACTER_LIMITS.MAX_CHARACTERS) {
134 |     errors.push(`Maximum ${CHARACTER_LIMITS.MAX_CHARACTERS} characters allowed`);
135 |     isValid = false;
136 |   }
137 | 
138 |   // Check for duplicates
139 |   const uniqueIds = new Set(characters.map(char => char.id));
140 |   if (uniqueIds.size !== characters.length) {
141 |     errors.push("Duplicate characters are not allowed");
142 |     isValid = false;
143 |   }
144 | 
145 |   // Validate each character individually
146 |   for (const character of characters) {
147 |     const charValidation = validateCharacter(character);
148 |     if (!charValidation.isValid) {
149 |       errors.push(`Character "${character.name}": ${charValidation.errors.join(", ")}`);
150 |       isValid = false;
151 |     }
152 |   }
153 | 
154 |   // Warnings based on character count
155 |   if (characters.length >= 3) {
156 |     warnings.push("✨ With 3+ characters, your story will be rich and passionate, but may be longer");
157 |   } else if (characters.length === 2) {
158 |     warnings.push("✨ Perfect! Two characters create dynamic and intimate encounters");
159 |   }
160 | 
161 |   return {
162 |     isValid,
163 |     errors,
164 |     warnings,
165 |     canSelectMore: characters.length < CHARACTER_LIMITS.MAX_CHARACTERS,
166 |     selectionCount: characters.length
167 |   };
168 | };
169 | 
170 | /**
171 |  * Validates if a story can be generated with the selected characters
172 |  */
173 | export const validateStoryGeneration = (characters: StoryCharacter[]): CharacterValidationResult => {
174 |   if (characters.length === 0) {
175 |     return {
176 |       isValid: false,
177 |       errors: ["You must select at least one character to generate your story"],
178 |       warnings: []
179 |     };
180 |   }
181 | 
182 |   // Use multiple selection validation
183 |   const validation = validateMultipleCharacterSelection(characters);
184 | 
185 |   return {
186 |     isValid: validation.isValid,
187 |     errors: validation.errors,
188 |     warnings: validation.warnings
189 |   };
190 | };
191 | 
192 | /**
193 |  * Gets the recommended message based on character count
194 |  */
195 | export const getCharacterSelectionMessage = (count: number): string => {
196 |   switch (count) {
197 |     case 0:
198 |       return "✨ Select up to 4 characters for your erotic story!";
199 |     case 1:
200 |       return "✨ Great start! You can add up to 3 more characters for steamy encounters";
201 |     case 2:
202 |       return "✨ Perfect! This combination will create dynamic and passionate moments";
203 |     case 3:
204 |       return "✨ Amazing! Your story will be incredibly rich with these 3 characters";
205 |     case 4:
206 |       return "✨ Maximum reached! These 4 characters will create an epic erotic adventure";
207 |     default:
208 |       return "✨ For intimate stories, fewer characters allow each one to shine in your fantasy";
209 |   }
210 | };
211 | 
212 | /**
213 |  * Characters Service - Main API for character operations
214 |  */
215 | export const charactersService = {
216 |   // Get user's characters
217 |   async getUserCharacters(userId: string): Promise<StoryCharacter[]> {
218 |     const { success, characters, error } = await getUserCharacters(userId);
219 |     
220 |     if (!success) {
221 |       console.error('Error fetching characters:', error);
222 |       throw new Error(error?.message || 'Error fetching characters');
223 |     }
224 |     
225 |     return characters || [];
226 |   },
227 | 
228 |   // Get all characters (preset + user characters)
229 |   async getAllCharacters(userId: string): Promise<StoryCharacter[]> {
230 |     const { success, characters, error } = await getAllCharacters(userId);
231 |     
232 |     if (!success) {
233 |       console.error('Error fetching all characters:', error);
234 |       throw new Error(error?.message || 'Error fetching all characters');
235 |     }
236 |     
237 |     return characters || [];
238 |   },
239 | 
240 |   // Create a new character
241 |   async createCharacter(userId: string, character: Omit<StoryCharacter, 'id'>): Promise<StoryCharacter> {
242 |     const characterData = {
243 |       ...character,
244 |       user_id: userId
245 |     };
246 | 
247 |     const { success, error } = await syncCharacter(userId, characterData as StoryCharacter);
248 |     
249 |     if (!success) {
250 |       console.error('Error creating character:', error);
251 |       throw new Error(error?.message || 'Error creating character');
252 |     }
253 |     
254 |     // Return the character with generated ID
255 |     return {
256 |       id: characterData.id || '',
257 |       ...character
258 |     };
259 |   },
260 | 
261 |   // Update an existing character
262 |   async updateCharacter(userId: string, characterId: string, updates: Partial<StoryCharacter>): Promise<StoryCharacter> {
263 |     const { success, error } = await syncCharacter(userId, { id: characterId, ...updates } as StoryCharacter);
264 |     
265 |     if (!success) {
266 |       console.error('Error updating character:', error);
267 |       throw new Error(error?.message || 'Error updating character');
268 |     }
269 |     
270 |     return { id: characterId, ...updates } as StoryCharacter;
271 |   },
272 | 
273 |   // Delete a character
274 |   async deleteCharacter(characterId: string): Promise<void> {
275 |     const { success, error } = await deleteSupabaseCharacter(characterId);
276 |     
277 |     if (!success) {
278 |       console.error('Error deleting character:', error);
279 |       throw new Error(error?.message || 'Error deleting character');
280 |     }
281 |   },
282 | 
283 |   // Validation helpers
284 |   validateCharacter,
285 |   validateCharacterSelection,
286 |   validateMultipleCharacterSelection,
287 |   validateStoryGeneration,
288 |   getCharacterSelectionMessage,
289 |   
290 |   // Character selection utilities
291 |   isCharacterSelected: (characterId: string, selectedCharacters: StoryCharacter[]): boolean => {
292 |     return selectedCharacters.some(char => char.id === characterId);
293 |   },
294 | 
295 |   canSelectMoreCharacters: (selectedCharacters: StoryCharacter[]): boolean => {
296 |     return selectedCharacters.length < CHARACTER_LIMITS.MAX_CHARACTERS;
297 |   },
298 | 
299 |   getSelectedCharactersByIds: (characterIds: string[], allCharacters: StoryCharacter[]): StoryCharacter[] => {
300 |     return characterIds
301 |       .map(id => allCharacters.find(char => char.id === id))
302 |       .filter((char): char is StoryCharacter => char !== undefined);
303 |   },
304 | 
305 |   // Constants
306 |   CHARACTER_LIMITS
307 | };
```

src/services/stripeService.ts
```
1 | import { loadStripe, Stripe } from '@stripe/stripe-js';
2 | 
3 | // Singleton pattern para cargar Stripe.js solo una vez
4 | let stripePromise: Promise<Stripe | null>;
5 | 
6 | /**
7 |  * Obtiene la instancia de Stripe.js inicializada con la clave publicable
8 |  * @returns Promise con la instancia de Stripe o null si hay error
9 |  */
10 | export const getStripe = (): Promise<Stripe | null> => {
11 |   if (!stripePromise) {
12 |     const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
13 |     if (!publishableKey) {
14 |       console.error("VITE_STRIPE_PUBLISHABLE_KEY no está configurada en .env");
15 |       // Retorna una promesa rechazada o null, dependiendo de cómo quieras manejarlo
16 |       return Promise.resolve(null);
17 |     }
18 |     stripePromise = loadStripe(publishableKey);
19 |   }
20 |   return stripePromise;
21 | };
22 | 
23 | /**
24 |  * Crea una sesión de checkout llamando a la Edge Function de Supabase
25 |  * @param item Tipo de item a comprar ('premium' para suscripción o 'credits' para créditos de voz)
26 |  * @returns Objeto con la URL de checkout o un mensaje de error
27 |  */
28 | export interface CheckoutSessionResponse {
29 |   url?: string;
30 |   error?: string;
31 | }
32 | 
33 | export const createCheckoutSession = async (
34 |   item: 'premium' | 'credits'
35 | ): Promise<CheckoutSessionResponse> => {
36 |   console.log(`Solicitando sesión de checkout para: ${item}`);
37 | 
38 |   try {
39 |     // 1. Obtener la sesión actual de Supabase para el token
40 |     // Añadir extensión .ts
41 |     const { supabase } = await import('../supabaseClient.ts');
42 |     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
43 | 
44 |     if (sessionError || !sessionData?.session) {
45 |       console.error('Error al obtener la sesión de Supabase o usuario no autenticado:', sessionError);
46 |       return { error: 'Usuario no autenticado o error de sesión.' };
47 |     }
48 | 
49 |     const token = sessionData.session.access_token;
50 |     const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
51 | 
52 |     if (!anonKey) {
53 |       console.error("VITE_SUPABASE_ANON_KEY no está configurada.");
54 |       return { error: "Error de configuración del cliente." };
55 |     }
56 | 
57 |     // 2. Llamar a la Edge Function usando fetch
58 |     const response = await fetch(
59 |       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
60 |       {
61 |         method: 'POST',
62 |         headers: {
63 |           'Authorization': `Bearer ${token}`,
64 |           'Content-Type': 'application/json',
65 |           'apikey': anonKey,
66 |         },
67 |         body: JSON.stringify({ item }),
68 |       }
69 |     );
70 | 
71 |     const responseData = await response.json();
72 | 
73 |     if (!response.ok) {
74 |       console.error('Error en la respuesta de la Edge Function (create-checkout-session):', responseData);
75 |       // Usar el mensaje de error de la respuesta si existe, si no, un genérico
76 |       throw new Error(responseData.error || `Error ${response.status} del servidor`);
77 |     }
78 | 
79 |     console.log('URL de checkout recibida:', responseData.url);
80 |     return { url: responseData.url };
81 | 
82 |   } catch (error) { // error es 'unknown'
83 |     console.error('Error al llamar a la función create-checkout-session:', error);
84 |     // Manejo seguro del tipo 'unknown'
85 |     let errorMessage = 'Error desconocido al iniciar el pago.';
86 |     if (error instanceof Error) {
87 |         errorMessage = error.message;
88 |     } else if (typeof error === 'string') {
89 |         errorMessage = error;
90 |     }
91 |     return { error: `No se pudo iniciar el pago: ${errorMessage}` };
92 |   }
93 | };
94 | 
95 | /**
96 |  * Crea una sesión del portal de cliente de Stripe para gestionar suscripciones
97 |  * @returns Objeto con la URL del portal o un mensaje de error
98 |  */
99 | export interface CustomerPortalSessionResponse {
100 |   url?: string;
101 |   error?: string;
102 | }
103 | 
104 | export const createCustomerPortalSession = async (): Promise<CustomerPortalSessionResponse> => {
105 |   console.log('Solicitando sesión del portal de cliente de Stripe');
106 | 
107 |   try {
108 |     // 1. Obtener la sesión actual de Supabase para el token
109 |     // Añadir extensión .ts
110 |     const { supabase } = await import('../supabaseClient.ts');
111 |     const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
112 | 
113 |     if (sessionError || !sessionData?.session) {
114 |       console.error('Error al obtener la sesión de Supabase o usuario no autenticado:', sessionError);
115 |       return { error: 'Usuario no autenticado o error de sesión.' };
116 |     }
117 | 
118 |     const token = sessionData.session.access_token;
119 |     const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
120 | 
121 |     if (!anonKey) {
122 |       console.error("VITE_SUPABASE_ANON_KEY no está configurada.");
123 |       return { error: "Error de configuración del cliente." };
124 |     }
125 | 
126 |     // 2. Llamar a la Edge Function usando fetch
127 |     const response = await fetch(
128 |       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-customer-portal-session`,
129 |       {
130 |         method: 'POST',
131 |         headers: {
132 |           'Authorization': `Bearer ${token}`,
133 |           'Content-Type': 'application/json',
134 |           'apikey': anonKey,
135 |         }
136 |         // No necesita body
137 |       }
138 |     );
139 | 
140 |     const responseData = await response.json();
141 | 
142 |     if (!response.ok) {
143 |       console.error('Error en la respuesta de la Edge Function (create-customer-portal-session):', responseData);
144 |       // Usar el mensaje de error de la respuesta si existe
145 |       throw new Error(responseData.error || `Error ${response.status} del servidor`);
146 |     }
147 | 
148 |     console.log('URL del portal de cliente recibida:', responseData.url);
149 |     return { url: responseData.url };
150 | 
151 |   } catch (error) { // error es 'unknown'
152 |     console.error('Error al llamar a la función create-customer-portal-session:', error);
153 |     // Manejo seguro del tipo 'unknown'
154 |     let errorMessage = 'Error desconocido al acceder al portal.';
155 |     if (error instanceof Error) {
156 |         errorMessage = error.message;
157 |     } else if (typeof error === 'string') {
158 |         errorMessage = error;
159 |     }
160 |     return { error: `No se pudo acceder al portal de cliente: ${errorMessage}` };
161 |   }
162 | };
```

src/services/supabase.ts
```
1 | // Importa los tipos necesarios
2 | import {
3 |     ProfileSettings,
4 |     Story,
5 |     StoryChapter,
6 |     StoryCharacter,
7 | } from "../types";
8 | 
9 | // --- Importa la instancia ÚNICA del cliente Supabase ---
10 | import { supabase } from "../supabaseClient"; // Ajusta esta ruta si es necesario
11 | import { generateId } from "../store/core/utils";
12 | 
13 | // --- Listener de Auth (Opcional, solo para logging) ---
14 | // Ya no inicializamos el cliente aquí, solo usamos el importado.
15 | supabase.auth.onAuthStateChange((event, session) => {
16 |     if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
17 |         console.log('Evento Auth en supabase.ts:', event, '- Usuario:', session?.user?.id);
18 |     } else if (event === 'SIGNED_OUT') {
19 |         console.log('Evento Auth en supabase.ts: SIGNED_OUT');
20 |     }
21 | });
22 | 
23 | // --- Funciones de Perfil ---
24 | 
25 | export const syncUserProfile = async (
26 |     userId: string,
27 |     // Renombramos el parámetro para claridad y ajustamos tipo
28 |     dataToSync: Partial<ProfileSettings> & { [key: string]: any },
29 | ): Promise<{ success: boolean; error?: any }> => {
30 |     try {
31 |         console.log(`[syncUserProfile_DEBUG] Attempting to sync for user ${userId} with data:`, dataToSync);
32 | 
33 |         // Preparamos los datos para upsert, asegurando que 'id' y 'updated_at' están presentes
34 |         const upsertData = {
35 |             id: userId,             // ID es necesario para upsert
36 |             ...dataToSync,         // Usamos directamente los datos mapeados (ej. child_age, special_need)
37 |             updated_at: new Date(), // Siempre actualizamos la fecha
38 |         };
39 | 
40 |         // Opcional: Asegurarse de que special_need sea null si es undefined, aunque upsert debería manejarlo
41 |         // Corregido: Usar notación de corchetes para evitar error de linting con snake_case
42 |         if (upsertData['special_need'] === undefined) {
43 |             upsertData['special_need'] = null;
44 |         }
45 | 
46 |         const { error } = await supabase
47 |             .from("profiles")
48 |             .upsert(upsertData); // <<< Pasamos el objeto correcto a upsert
49 | 
50 |         if (error) {
51 |             console.error("Error sincronizando perfil (posible RLS):", error);
52 |             throw error; // Re-lanzar para el catch general
53 |         }
54 |         console.log(`[syncUserProfile_DEBUG] Profile synced successfully for user ${userId}`);
55 |         return { success: true };
56 |     } catch (error) {
57 |         console.error("Fallo general en syncUserProfile:", error);
58 |         // Asegurarse de devolver un objeto Error estándar
59 |         const errorMessage = error instanceof Error ? error.message : String(error);
60 |         return { success: false, error: new Error(errorMessage) };
61 |     }
62 | };
63 | 
64 | export const getUserProfile = async (userId: string, retries = 2): Promise<{ success: boolean, profile?: ProfileSettings, error?: any }> => {
65 |     for (let attempt = 0; attempt <= retries; attempt++) {
66 |         try {
67 |             console.log(`Requesting profile for user: ${userId} (attempt ${attempt + 1}/${retries + 1})`);
68 | 
69 |             const { data, error } = await supabase
70 |                 .from("profiles")
71 |                 .select("*")
72 |                 .eq("id", userId)
73 |                 .single();
74 | 
75 |             if (error && error.code === 'PGRST116') {
76 |                 console.log(`Profile not found for user ${userId}. This is a definitive result, no retry.`);
77 |                 return { success: false }; // No profile is not a transient error
78 |             } else if (error) {
79 |                 console.warn(`Attempt ${attempt + 1} to fetch profile for ${userId} failed:`, error.message);
80 |                 if (attempt === retries) {
81 |                     console.error(`Final attempt to fetch profile for ${userId} failed after multiple retries.`, error);
82 |                     throw error; // Throw final error to be caught by the outer block
83 |                 }
84 |                 // Wait with exponential backoff before retrying
85 |                 await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
86 |                 continue; // Next attempt
87 |             }
88 | 
89 |             if (data) {
90 |                 console.log(`Successfully fetched profile data for user ${userId}.`);
91 |                 const profile: ProfileSettings = {
92 |                     language: data.language,
93 |                     preferences: data.preferences,
94 |                     stripe_customer_id: data.stripe_customer_id,
95 |                     subscription_status: data.subscription_status,
96 |                     subscription_id: data.subscription_id,
97 |                     plan_id: data.plan_id,
98 |                     current_period_end: data.current_period_end,
99 |                     voice_credits: data.voice_credits,
100 |                     monthly_stories_generated: data.monthly_stories_generated,
101 |                     monthly_voice_generations_used: data.monthly_voice_generations_used,
102 |                     has_completed_setup: data.has_completed_setup,
103 |                 };
104 |                 return { success: true, profile: profile };
105 |             }
106 | 
107 |             // This case should ideally not be reached if a profile is always created on sign-up
108 |             console.warn(`Unexpectedly found no profile data for user ${userId} without an error.`);
109 |             return { success: false };
110 | 
111 |         } catch (error) {
112 |             if (attempt === retries) {
113 |                 console.error(`A critical error occurred while fetching profile for ${userId}. All retries failed.`, error);
114 |                 return { success: false, error };
115 |             }
116 |             // Wait before the next attempt in case of a thrown error
117 |             await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
118 |         }
119 |     }
120 |     // This is returned if all retries fail
121 |     return { success: false, error: new Error('All attempts to fetch the profile have failed.') };
122 | };
123 | 
124 | // --- Funciones de Personajes ---
125 | 
126 | export const syncCharacter = async (
127 |     userId: string,
128 |     character: StoryCharacter,
129 | ): Promise<{ success: boolean; error?: any }> => {
130 |     try {
131 |         console.log(`[DEBUG] Sincronizando personaje "${character.name}" (ID: ${character.id}) para usuario ${userId}`);
132 |         const { data: existingChar, error: queryError } = await supabase
133 |             .from("characters")
134 |             .select("id, user_id")
135 |             .eq("id", character.id)
136 |             .maybeSingle();
137 | 
138 |         if (queryError) {
139 |             console.error(`[DEBUG] Error al verificar existencia del personaje:`, queryError);
140 |             throw queryError;
141 |         }
142 | 
143 |         const characterData = {
144 |             id: character.id,
145 |             user_id: userId,
146 |             name: character.name,
147 |             gender: character.gender,
148 |             description: character.description,
149 |             updated_at: new Date(),
150 |         };
151 | 
152 |         let result;
153 |         if (existingChar) {
154 |             console.log(`[DEBUG] Personaje ${character.id} existe. Actualizando.`);
155 |             if (existingChar.user_id !== userId) {
156 |                 console.error(`[DEBUG] ¡Error de seguridad! Intento de modificar personaje ${character.id} de otro usuario.`);
157 |                 return { success: false, error: new Error('No tienes permiso para modificar este personaje') };
158 |             }
159 |             result = await supabase
160 |                 .from("characters")
161 |                 .update(characterData)
162 |                 .eq("id", character.id);
163 |         } else {
164 |             console.log(`[DEBUG] Creando nuevo personaje con ID: ${character.id}`);
165 |             result = await supabase
166 |                 .from("characters")
167 |                 .insert(characterData);
168 |         }
169 | 
170 |         const { error } = result;
171 |         if (error) {
172 |             console.error(`[DEBUG] Error en operación upsert de personaje (posible RLS):`, error);
173 |             throw error;
174 |         }
175 | 
176 |         console.log(`[DEBUG] Personaje "${character.name}" guardado exitosamente.`);
177 |         return { success: true };
178 |     } catch (error) {
179 |         console.error("[DEBUG] Fallo general en syncCharacter:", error);
180 |         return { success: false, error };
181 |     }
182 | };
183 | 
184 | export const getUserCharacters = async (userId: string): Promise<{ success: boolean; characters?: StoryCharacter[]; error?: any }> => {
185 |     // --- CORREGIDO: Eliminada la consulta ineficiente ---
186 |     try {
187 |         console.log(`[DEBUG] Consultando personajes para usuario ${userId}`);
188 |         const { data, error } = await supabase
189 |             .from("characters")
190 |             .select("*") // Consulta correcta y única
191 |             .eq("user_id", userId);
192 | 
193 |         if (error) {
194 |             console.error(`[DEBUG] Error en consulta de personajes (posible RLS):`, error);
195 |             throw error;
196 |         }
197 | 
198 |         console.log(`[DEBUG] Personajes encontrados: ${data?.length || 0}`);
199 |         const characters: StoryCharacter[] = data ? data.map((char) => ({
200 |             id: char.id,
201 |             name: char.name,
202 |             gender: char.gender,
203 |             description: char.description || '',
204 |             created_at: char.created_at,
205 |             updated_at: char.updated_at,
206 |         })) : [];
207 | 
208 |         return { success: true, characters: characters };
209 |     } catch (error) {
210 |         console.error("Fallo general en getUserCharacters:", error);
211 |         return { success: false, error };
212 |     }
213 | };
214 | 
215 | export const getPresetCharacters = async (): Promise<{ success: boolean; characters?: StoryCharacter[]; error?: any }> => {
216 |     try {
217 |         console.log(`[DEBUG] Consultando personajes preset`);
218 |         const { data, error } = await supabase
219 |             .from("preset_characters")
220 |             .select("*")
221 |             .order('gender', { ascending: false }) // Females first, then males
222 |             .order('name', { ascending: true });
223 | 
224 |         if (error) {
225 |             console.error(`[DEBUG] Error en consulta de personajes preset:`, error);
226 |             throw error;
227 |         }
228 | 
229 |         console.log(`[DEBUG] Personajes preset encontrados: ${data?.length || 0}`);
230 |         const characters: StoryCharacter[] = data ? data.map((char) => ({
231 |             id: char.id,
232 |             name: char.name,
233 |             gender: char.gender,
234 |             description: char.description || '',
235 |             created_at: char.created_at,
236 |             updated_at: char.updated_at,
237 |             is_preset: true, // Mark as preset character
238 |         })) : [];
239 | 
240 |         return { success: true, characters: characters };
241 |     } catch (error) {
242 |         console.error("Fallo general en getPresetCharacters:", error);
243 |         return { success: false, error };
244 |     }
245 | };
246 | 
247 | export const getAllCharacters = async (userId: string): Promise<{ success: boolean; characters?: StoryCharacter[]; error?: any }> => {
248 |     try {
249 |         console.log(`[DEBUG] Consultando todos los personajes (preset + usuario) para ${userId}`);
250 |         
251 |         // Get user characters and preset characters in parallel
252 |         const [userCharsResult, presetCharsResult] = await Promise.all([
253 |             getUserCharacters(userId),
254 |             getPresetCharacters()
255 |         ]);
256 | 
257 |         // Check for errors
258 |         if (!userCharsResult.success) {
259 |             console.error(`[DEBUG] Error obteniendo personajes de usuario:`, userCharsResult.error);
260 |             return userCharsResult;
261 |         }
262 | 
263 |         if (!presetCharsResult.success) {
264 |             console.error(`[DEBUG] Error obteniendo personajes preset:`, presetCharsResult.error);
265 |             // If preset characters fail, still return user characters
266 |             console.warn(`[DEBUG] Continuando solo con personajes de usuario`);
267 |             return userCharsResult;
268 |         }
269 | 
270 |         // Combine characters: preset first, then user characters
271 |         const allCharacters = [
272 |             ...(presetCharsResult.characters || []),
273 |             ...(userCharsResult.characters || []).map(char => ({ ...char, is_preset: false }))
274 |         ];
275 | 
276 |         console.log(`[DEBUG] Total personajes combinados: ${allCharacters.length} (${presetCharsResult.characters?.length || 0} preset + ${userCharsResult.characters?.length || 0} usuario)`);
277 | 
278 |         return { success: true, characters: allCharacters };
279 |     } catch (error) {
280 |         console.error("Fallo general en getAllCharacters:", error);
281 |         return { success: false, error };
282 |     }
283 | };
284 | 
285 | export const deleteCharacter = async (characterId: string): Promise<{ success: boolean; error?: any }> => {
286 |     try {
287 |         const { data: { user } } = await supabase.auth.getUser();
288 |         if (!user) {
289 |             return { success: false, error: new Error('No autenticado') };
290 |         }
291 |         const userId = user.id;
292 | 
293 |         const { data: characterData, error: queryError } = await supabase
294 |             .from("characters")
295 |             .select("user_id")
296 |             .eq("id", characterId)
297 |             .maybeSingle();
298 | 
299 |         if (queryError) {
300 |             console.error("Error verificando propiedad:", queryError);
301 |             return { success: false, error: queryError };
302 |         }
303 |         if (!characterData) {
304 |             console.warn(`Personaje ${characterId} no encontrado para eliminar.`);
305 |             return { success: false, error: new Error('Personaje no encontrado') };
306 |         }
307 |         if (characterData.user_id !== userId) {
308 |             console.error(`Seguridad: Usuario ${userId} intentó eliminar personaje ${characterId} de ${characterData.user_id}`);
309 |             return { success: false, error: new Error('Permiso denegado') };
310 |         }
311 | 
312 |         const { error } = await supabase
313 |             .from("characters")
314 |             .delete()
315 |             .eq("id", characterId);
316 | 
317 |         if (error) {
318 |             console.error("Error eliminando personaje (RLS?):", error);
319 |             throw error;
320 |         }
321 |         return { success: true };
322 |     } catch (error) {
323 |         console.error("Fallo general en deleteCharacter:", error);
324 |         return { success: false, error };
325 |     }
326 | };
327 | 
328 | // --- Funciones de Historias ---
329 | 
330 | export const syncStory = async (userId: string, story: Story): Promise<{ success: boolean; error?: any }> => {
331 |     try {
332 |         console.log(`Sincronizando historia ${story.id} para usuario ${userId}`);
333 |         const storyData = {
334 |             id: story.id,
335 |             user_id: userId,
336 |             title: story.title,
337 |             content: story.content,
338 |             audio_url: story.audioUrl,
339 |             genre: story.options.genre,
340 |             story_format: story.options.format,
341 |             character_id: story.options.characters[0]?.id, // Primary character (first selected) for compatibility
342 |             characters_data: story.characters_data || story.options.characters, // Complete character array
343 |             additional_details: story.additional_details,
344 |             updated_at: new Date(),
345 |         };
346 |         const { error } = await supabase.from("stories").upsert(storyData);
347 |         if (error) {
348 |             console.error(`Error al sincronizar historia ${story.id} (RLS?):`, error);
349 |             throw error;
350 |         }
351 |         console.log(`Historia ${story.id} sincronizada.`);
352 |         return { success: true };
353 |     } catch (error) {
354 |         console.error("Fallo general en syncStory:", error);
355 |         return { success: false, error };
356 |     }
357 | };
358 | 
359 | export const getUserStories = async (userId: string): Promise<{ success: boolean; stories?: Story[]; error?: any }> => {
360 |     try {
361 |         console.log(`Buscando historias para usuario ${userId}`);
362 |         const { data, error } = await supabase
363 |             .from("stories")
364 |             .select(`*, characters (*)`)
365 |             .eq("user_id", userId)
366 |             .order('created_at', { ascending: false }); // Ordenar por más reciente
367 | 
368 |         if (error) {
369 |             console.error("Error obteniendo historias (RLS?):", error);
370 |             throw error;
371 |         }
372 | 
373 |         const stories: Story[] = data ? data.map((story) => {
374 |             console.log(`[getUserStories_DEBUG] DB raw title for story ${story.id}: "${story.title}"`);
375 | 
376 |             // Use characters_data if available (new format), otherwise fallback to character relationship (legacy)
377 |             let characters: StoryCharacter[] = [];
378 |             
379 |             if (story.characters_data && Array.isArray(story.characters_data)) {
380 |                 // New format: characters_data contains the complete array
381 |                 characters = story.characters_data.map((char: any) => ({
382 |                     id: char.id,
383 |                     name: char.name,
384 |                     gender: char.gender,
385 |                     description: char.description || '',
386 |                     created_at: char.created_at,
387 |                     updated_at: char.updated_at,
388 |                     is_preset: char.is_preset || false
389 |                 }));
390 |                 console.log(`[getUserStories_DEBUG] Using characters_data: ${characters.length} characters`);
391 |             } else if (story.characters) {
392 |                 // Legacy format: single character from relationship
393 |                 const characterData = story.characters;
394 |                 characters = [{
395 |                     id: characterData.id || 'deleted_character',
396 |                     name: characterData.name || 'Personaje Eliminado',
397 |                     gender: characterData.gender || 'non-binary',
398 |                     description: characterData.description || '',
399 |                     created_at: characterData.created_at,
400 |                     updated_at: characterData.updated_at,
401 |                     is_preset: false
402 |                 }];
403 |                 console.log(`[getUserStories_DEBUG] Using legacy character relationship`);
404 |             } else {
405 |                 // No character data available
406 |                 console.warn(`[getUserStories_DEBUG] No character data found for story ${story.id}`);
407 |                 characters = [{
408 |                     id: 'deleted_character',
409 |                     name: 'Personaje Eliminado',
410 |                     gender: 'non-binary',
411 |                     description: 'Este personaje ya no está disponible',
412 |                     is_preset: false
413 |                 }];
414 |             }
415 | 
416 |             return {
417 |                 id: story.id,
418 |                 title: story.title || "Historia sin título",
419 |                 content: story.content,
420 |                 audioUrl: story.audio_url,
421 |                 options: {
422 |                     genre: story.genre,
423 |                     format: story.story_format,
424 |                     characters: characters,
425 |                     spiciness_level: story.spiciness_level || 2
426 |                 },
427 |                 createdAt: story.created_at,
428 |                 additional_details: story.additional_details,
429 |                 characters_data: characters // Include in the Story object for consistency
430 |             };
431 |         }) : [];
432 | 
433 |         console.log(`Encontradas ${stories.length} historias`);
434 |         return { success: true, stories: stories };
435 |     } catch (error) {
436 |         console.error("Fallo general en getUserStories:", error);
437 |         return { success: false, error };
438 |     }
439 | };
440 | 
441 | /**
442 |  * Obtiene el número de capítulos existentes para una historia específica.
443 |  */
444 | export const getChapterCountForStory = async (storyId: string): Promise<{ count: number; error: Error | null }> => {
445 |     try {
446 |         const { count, error } = await supabase
447 |             .from('story_chapters')
448 |             .select('*', { count: 'exact', head: true }) // Solo necesitamos el conteo
449 |             .eq('story_id', storyId);
450 | 
451 |         if (error) {
452 |             console.error('Error al contar capítulos:', error);
453 |             return { count: 0, error };
454 |         }
455 | 
456 |         return { count: count ?? 0, error: null }; // Devuelve 0 si count es null
457 | 
458 |     } catch (error: any) {
459 |         console.error('Error inesperado al contar capítulos:', error);
460 |         return { count: 0, error };
461 |     }
462 | };
463 | 
464 | // --- Funciones para Capítulos ---
465 | 
466 | export const syncChapter = async (chapter: StoryChapter, storyId: string): Promise<{ success: boolean; error?: any }> => {
467 |     console.log("🚀 ~ syncChapter ~ chapter:", chapter)
468 |     try {
469 |         // Generate ID if chapter doesn't have one
470 |         const chapterId = chapter.id || generateId("chapter");
471 |         
472 |         const { error } = await supabase
473 |             .from("story_chapters")
474 |             .upsert({
475 |                 id: chapterId,
476 |                 story_id: storyId,
477 |                 chapter_number: chapter.chapterNumber,
478 |                 title: chapter.title,
479 |                 content: chapter.content,
480 |                 generation_method: chapter.generationMethod,
481 |                 custom_input: chapter.customInput,
482 |                 updated_at: new Date(),
483 |             });
484 |         if (error) {
485 |             console.error("Error sincronizando capítulo (RLS/FK?):", error);
486 |             throw error;
487 |         }
488 |         return { success: true };
489 |     } catch (error) {
490 |         console.error("Fallo general en syncChapter:", error);
491 |         return { success: false, error };
492 |     }
493 | };
494 | 
495 | export const getStoryChapters = async (storyId: string): Promise<{ success: boolean; chapters?: StoryChapter[]; error?: any }> => {
496 |     try {
497 |         const { data, error } = await supabase
498 |             .from("story_chapters")
499 |             .select("*")
500 |             .eq("story_id", storyId)
501 |             .order('chapter_number', { ascending: true });
502 | 
503 |         if (error) {
504 |             console.error("Error obteniendo capítulos (RLS/FK?):", error);
505 |             throw error;
506 |         }
507 |         const chapters: StoryChapter[] = data ? data.map((chapter) => ({
508 |             id: chapter.id,
509 |             chapterNumber: chapter.chapter_number,
510 |             title: chapter.title,
511 |             content: chapter.content,
512 |             createdAt: chapter.created_at,
513 |             generationMethod: chapter.generation_method,
514 |             customInput: chapter.custom_input,
515 |         })) : [];
516 |         return { success: true, chapters: chapters };
517 |     } catch (error) {
518 |         console.error("Fallo general en getStoryChapters:", error);
519 |         return { success: false, error };
520 |     }
521 | };
522 | 
523 | // --- Funciones para Archivos de Audio ---
524 | 
525 | export const syncAudioFile = async (
526 |     userId: string,
527 |     storyId: string,
528 |     chapterId: string | number,
529 |     voiceId: string,
530 |     audioUrl: string,
531 | ): Promise<{ success: boolean; error?: any }> => {
532 |     try {
533 |         const { error } = await supabase
534 |             .from("audio_files")
535 |             .upsert({
536 |                 user_id: userId,
537 |                 story_id: storyId,
538 |                 chapter_id: chapterId,
539 |                 voice_id: voiceId,
540 |                 url: audioUrl,
541 |             });
542 |         if (error) {
543 |             console.error("Error sincronizando archivo de audio (RLS/FK?):", error);
544 |             throw error;
545 |         }
546 |         return { success: true };
547 |     } catch (error) {
548 |         console.error("Fallo general en syncAudioFile:", error);
549 |         return { success: false, error };
550 |     }
551 | };
552 | 
553 | export const getUserAudios = async (userId: string): Promise<{ success: boolean; audios?: any[]; error?: any }> => { // Ajustar tipo 'audios' si tienes uno específico
554 |     try {
555 |         const { data, error } = await supabase
556 |             .from("audio_files")
557 |             .select("*")
558 |             .eq("user_id", userId);
559 | 
560 |         if (error) {
561 |             console.error("Error obteniendo archivos de audio (RLS?):", error);
562 |             throw error;
563 |         }
564 |         const audios = data || [];
565 |         return { success: true, audios: audios };
566 |     } catch (error) {
567 |         console.error("Fallo general en getUserAudios:", error);
568 |         return { success: false, error };
569 |     }
570 | };
571 | 
572 | // --- Funciones para Preferencias de Voz ---
573 | 
574 | export const setCurrentVoice = async (userId: string, voiceId: string): Promise<{ success: boolean; error?: any }> => {
575 |     try {
576 |         // Paso 1: Resetear la voz actual
577 |         await supabase
578 |             .from("user_voices")
579 |             .update({ is_current: false })
580 |             .eq("user_id", userId)
581 |             .eq("is_current", true);
582 | 
583 |         // Paso 2: Establecer la nueva voz actual
584 |         const { error } = await supabase
585 |             .from("user_voices")
586 |             .upsert({
587 |                 user_id: userId,
588 |                 voice_id: voiceId,
589 |                 is_current: true,
590 |                 updated_at: new Date(),
591 |             });
592 |         if (error) {
593 |             console.error("Error en upsert de voz actual (RLS?):", error);
594 |             throw error;
595 |         }
596 |         return { success: true };
597 |     } catch (error) {
598 |         console.error("Fallo general en setCurrentVoice:", error);
599 |         return { success: false, error };
600 |     }
601 | };
602 | 
603 | export const getCurrentVoice = async (userId: string): Promise<{ success: boolean; voiceId?: string | null; error?: any }> => {
604 |     try {
605 |         const { data, error } = await supabase
606 |             .from("user_voices")
607 |             .select("voice_id")
608 |             .eq("user_id", userId)
609 |             .eq("is_current", true)
610 |             .maybeSingle();
611 | 
612 |         if (error) {
613 |             console.error("Error obteniendo voz actual (RLS?):", error);
614 |             throw error;
615 |         }
616 |         return { success: true, voiceId: data?.voice_id || null };
617 |     } catch (error) {
618 |         console.error("Fallo general en getCurrentVoice:", error);
619 |         return { success: false, error };
620 |     }
621 | };
622 | 
623 | 
624 | // --- Servicio de Cola de Sincronización ---
625 | // (Se mantiene la versión mejorada con re-encolado)
626 | interface SyncQueueItem {
627 |     table: string;
628 |     operation: "insert" | "update" | "delete";
629 |     data: any;
630 |     timestamp: number;
631 | }
632 | 
633 | class SyncQueueService {
634 |     private static instance: SyncQueueService;
635 |     private queue: SyncQueueItem[] = [];
636 |     private isProcessing = false;
637 |     private readonly STORAGE_KEY = "sync_queue";
638 | 
639 |     private constructor() {
640 |         this.loadQueue();
641 |         if (typeof window !== "undefined" && !window.hasOwnProperty('_syncQueueListenerAdded')) {
642 |             window.addEventListener("online", () => this.processQueue());
643 |             (window as any)._syncQueueListenerAdded = true;
644 |         }
645 |     }
646 | 
647 |     static getInstance(): SyncQueueService {
648 |         if (!SyncQueueService.instance) {
649 |             SyncQueueService.instance = new SyncQueueService();
650 |         }
651 |         return SyncQueueService.instance;
652 |     }
653 | 
654 |     private loadQueue() {
655 |         if (typeof localStorage === 'undefined') return;
656 |         try {
657 |             const savedQueue = localStorage.getItem(this.STORAGE_KEY);
658 |             if (savedQueue) {
659 |                 this.queue = JSON.parse(savedQueue);
660 |                 console.log(`Cola de sincronización cargada con ${this.queue.length} elementos.`);
661 |             }
662 |         } catch (error) {
663 |             console.error("Error cargando cola de sincronización:", error);
664 |             this.queue = [];
665 |         }
666 |     }
667 | 
668 |     private saveQueue() {
669 |         if (typeof localStorage === 'undefined') return;
670 |         try {
671 |             localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
672 |         } catch (error) {
673 |             console.error("Error guardando cola de sincronización:", error);
674 |         }
675 |     }
676 | 
677 |     addToQueue(table: string, operation: "insert" | "update" | "delete", data: any,) {
678 |         console.log(`Añadiendo a cola: ${operation} en ${table}`, data);
679 |         this.queue.push({ table, operation, data, timestamp: Date.now() });
680 |         this.saveQueue();
681 |         if (typeof navigator !== 'undefined' && navigator.onLine) {
682 |             this.processQueue();
683 |         }
684 |     }
685 | 
686 |     async processQueue() {
687 |         if (this.isProcessing || this.queue.length === 0 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
688 |             if (this.isProcessing) console.log("Cola ya en proceso.");
689 |             return;
690 |         }
691 |         console.log(`Procesando cola: ${this.queue.length} elementos.`);
692 |         this.isProcessing = true;
693 |         const itemsToProcess = [...this.queue];
694 |         this.queue = [];
695 |         this.saveQueue();
696 |         const failedItems: SyncQueueItem[] = [];
697 | 
698 |         try {
699 |             for (const item of itemsToProcess) {
700 |                 let success = false;
701 |                 console.log(`Procesando: ${item.operation} en ${item.table}`); // No loguear item.data por defecto (puede ser grande)
702 |                 try {
703 |                     let operationError = null;
704 |                     switch (item.operation) {
705 |                         case "insert":
706 |                         case "update":
707 |                             const { error } = await supabase.from(item.table).upsert(item.data);
708 |                             operationError = error;
709 |                             break;
710 |                         case "delete":
711 |                             if (!item.data?.id) {
712 |                                 console.error("Datos para DELETE sin ID:", item);
713 |                                 operationError = new Error("Datos para DELETE sin ID");
714 |                                 break;
715 |                             }
716 |                             const { error: deleteError } = await supabase.from(item.table).delete().eq("id", item.data.id);
717 |                             operationError = deleteError;
718 |                             break;
719 |                     }
720 |                     if (operationError) {
721 |                         console.error(`Error procesando item [${item.operation} ${item.table}]:`, operationError);
722 |                     } else {
723 |                         console.log(`Item procesado: ${item.operation} ${item.table}`);
724 |                         success = true;
725 |                     }
726 |                 } catch (processingError) {
727 |                     console.error(`Error inesperado procesando item:`, processingError);
728 |                 }
729 |                 if (!success) failedItems.push(item);
730 |             }
731 |         } finally {
732 |             if (failedItems.length > 0) {
733 |                 console.warn(`Re-encolando ${failedItems.length} elementos fallidos.`);
734 |                 this.queue = [...failedItems, ...this.queue];
735 |                 this.saveQueue();
736 |             }
737 |             console.log(`Procesamiento de cola finalizado. Pendientes: ${this.queue.length}`);
738 |             this.isProcessing = false;
739 |         }
740 |     }
741 |     getQueueLength(): number { return this.queue.length; }
742 | }
743 | 
744 | export const syncQueue = SyncQueueService.getInstance();
```

src/services/syncService.ts
```
1 | import { useUserStore } from "../store/user/userStore";
2 | import { supabase } from "../supabaseClient";
3 | 
4 | /**
5 |  * Servicio para INICIAR la sincronización de datos del usuario con Supabase
6 |  * delegando la carga real al userStore.
7 |  */
8 | export const syncUserData = async (): Promise<boolean> => {
9 |     console.log("Intentando iniciar sincronización de datos...");
10 |     try {
11 |         // 1. Verificar conexión (ligero y útil)
12 |         if (typeof navigator !== 'undefined' && !navigator.onLine) {
13 |             console.log("Offline. Sincronización pospuesta.");
14 |             return false;
15 |         }
16 | 
17 |         // 2. Verificar si hay una sesión activa usando el cliente Supabase
18 |         // Esto es más directo que llamar a getCurrentUser de supabaseAuth
19 |         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
20 | 
21 |         if (sessionError) {
22 |             console.error("Error al obtener la sesión:", sessionError.message);
23 |             // Considerar si llamar a checkAuth aquí para limpiar el estado local si falla
24 |             // await useUserStore.getState().checkAuth();
25 |             return false;
26 |         }
27 | 
28 |         if (!session || !session.user) {
29 |             console.log("No hay sesión de usuario activa, no se inicia sincronización.");
30 |             // Si no hay sesión, checkAuth se encargará de poner el estado de usuario a null
31 |             // No necesitamos hacer nada más aquí, la UI reaccionará al estado nulo del userStore
32 |             // Opcionalmente, puedes llamar a checkAuth para asegurar limpieza:
33 |             // await useUserStore.getState().checkAuth();
34 |             return false;
35 |         }
36 | 
37 |         const userId = session.user.id;
38 |         console.log(`Sesión activa detectada para usuario ${userId}. Iniciando proceso checkAuth/sync.`);
39 | 
40 |         // 3. Disparar el proceso de carga centralizado en userStore
41 |         // checkAuth() AHORA es responsable de:
42 |         //    a) Confirmar la sesión (ya lo hicimos, pero checkAuth lo reconfirma)
43 |         //    b) Llamar a getUserProfile para obtener datos de perfil (incluyendo Stripe/límites)
44 |         //    c) Actualizar userStore.user y userStore.profileSettings
45 |         //    d) Llamar a syncAllUserData(userId) DENTRO de userStore
46 |         //    e) syncAllUserData llamará a los load...FromSupabase de los otros stores.
47 |         const checkAuthSuccessful = await useUserStore.getState().checkAuth();
48 | 
49 |         if (checkAuthSuccessful) {
50 |             console.log("Proceso checkAuth completado exitosamente. La carga de datos debería estar en curso o finalizada por userStore.");
51 |             return true;
52 |         } else {
53 |             // checkAuth devuelve false si no hay usuario o si hubo un error interno en checkAuth.
54 |             console.warn("checkAuth() devolvió false. La sincronización podría no haberse completado.");
55 |             return false;
56 |         }
57 | 
58 |     } catch (error) {
59 |         // Captura errores generales que podrían ocurrir en este flujo
60 |         console.error("Error inesperado en syncUserData:", error);
61 |         return false;
62 |     }
63 | };
64 | 
65 | /**
66 |  * Escuchar cambios en la conectividad para sincronizar
67 |  * cuando el usuario vuelve a estar online.
68 |  */
69 | export const initSyncListeners = () => {
70 |     // Solo ejecutar en el cliente
71 |     if (typeof window !== "undefined" && !window.hasOwnProperty('_syncListenersInitialized')) {
72 |         console.log("Inicializando listeners de conectividad...");
73 |         // Sincronizar cuando vuelve la conexión
74 |         window.addEventListener("online", () => {
75 |             console.log("Evento 'online' detectado, intentando sincronizar datos...");
76 |             syncUserData(); // Llama a la función refactorizada
77 |         });
78 |         // Sincronizar cuando cambia el estado de visibilidad (útil si la pestaña estuvo inactiva)
79 |         document.addEventListener('visibilitychange', () => {
80 |             if (document.visibilityState === 'visible') {
81 |                 console.log("Pestaña visible, intentando sincronizar datos...");
82 |                 syncUserData();
83 |             }
84 |         });
85 |         // Añadir un flag para evitar duplicar listeners si esta función se llama más de una vez
86 |         (window as any)._syncListenersInitialized = true;
87 |     } else if (typeof window !== "undefined") {
88 |         console.log("Listeners de conectividad ya inicializados.");
89 |     }
90 | };
91 | 
92 | /**
93 |  * Inicializar el servicio de sincronización.
94 |  * Esta función debe llamarse UNA SOLA VEZ al inicio de la aplicación.
95 |  */
96 | export const initSyncService = () => {
97 |     // Iniciar listeners de conexión y visibilidad
98 |     initSyncListeners();
99 | 
100 |     console.log("Servicio de sincronización inicializado.");
101 | 
102 |     // Intentar sincronización inicial inmediatamente si hay conexión
103 |     // syncUserData ya verifica la conexión internamente.
104 |     console.log("Intentando sincronización inicial...");
105 |     syncUserData();
106 | 
107 | };
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
9 |   spicynessLevel?: number; // Adult content intensity level (1=Sensual, 2=Passionate, 3=Intense)
10 | }
11 | 
12 | // Definir el tipo de respuesta esperada de la Edge Function
13 | export interface GenerateStoryResponse {
14 |   content: string;
15 |   title: string;
16 | }
17 | 
18 | export class GenerateStoryService {
19 |   /**
20 |    * Generates initial story content and title using the 'generate-story' Edge Function.
21 |    */
22 |   public static async generateStoryWithAI(params: GenerateStoryParams): Promise<GenerateStoryResponse> {
23 |     try {
24 |       console.log('Sending request to generate-story Edge Function with params:', params); // Log parameters
25 | 
26 |       // Make sure to pass the authentication token if the function requires it (it does)
27 |       const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
28 |       if (sessionError || !sessionData.session) {
29 |         throw new Error(sessionError?.message || 'User not authenticated.');
30 |       }
31 |       const token = sessionData.session.access_token;
32 | 
33 |       // Validate character structure to ensure compatibility with new schema
34 |       if (params.options.characters && params.options.characters.length > 0) {
35 |         const validGenders = ['male', 'female', 'non-binary'];
36 |         for (const character of params.options.characters) {
37 |           if (!character.name || typeof character.name !== 'string' || character.name.trim().length === 0) {
38 |             throw new Error(`Invalid character: missing or empty name field`);
39 |           }
40 |           if (!character.gender || !validGenders.includes(character.gender)) {
41 |             throw new Error(`Invalid character "${character.name}": gender must be one of ${validGenders.join(', ')}`);
42 |           }
43 |           if (!character.description || typeof character.description !== 'string' || character.description.trim().length === 0) {
44 |             throw new Error(`Invalid character "${character.name}": missing or empty description field`);
45 |           }
46 |         }
47 |         console.log('✅ Character structure validation passed');
48 |       }
49 | 
50 |       // Include spiciness level in options if provided
51 |       if (params.spicynessLevel !== undefined) {
52 |         params.options.spiciness_level = params.spicynessLevel;
53 |       }
54 | 
55 |       // DEBUG: Log the exact payload being sent including character info
56 |       const charactersInfo = `Characters (${params.options.characters?.length || 0}): ${params.options.characters?.map(c => `${c.name} (${c.gender})`).join(', ') || 'None'}`;
57 |       console.log(`>>> Payload being sent to generate-story: ${charactersInfo}`);
58 |       console.log(`>>> Spiciness level: ${params.options.spiciness_level || 'default (2)'}`);
59 |       console.log(">>> Full payload:", JSON.stringify(params, null, 2));
60 | 
61 |       const { data, error } = await supabase.functions.invoke<GenerateStoryResponse>('generate-story', { // Specify response type <T>
62 |         body: params, // Body already contains options, language, etc. and additionalDetails
63 |         headers: {
64 |           'Authorization': `Bearer ${token}` // Pass the token
65 |         }
66 |       });
67 | 
68 |       if (error) {
69 |         console.error('Error in generate-story Edge Function:', error);
70 |         // You can try to get more error details if it's an HttpError
71 |         let message = error.message;
72 |         if ((error as any).context) { // Supabase FunctionsHttpError has 'context'
73 |           message = `${message} - ${JSON.stringify((error as any).context)}`;
74 |         }
75 |         throw new Error(message);
76 |       }
77 | 
78 |       // Validate that the response has the expected format { content: string, title: string }
79 |       if (!data || typeof data.content !== 'string' || typeof data.title !== 'string') {
80 |         console.error('Unexpected response from generate-story:', data);
81 |         throw new Error('The generate-story response does not contain valid content and title.');
82 |       }
83 | 
84 |       console.log('Response from generate-story received (title):', data.title);
85 |       return data; // Return the complete { content, title } object
86 | 
87 |     } catch (error) {
88 |       console.error('Error in GenerateStoryService.generateStoryWithAI:', error);
89 |       // Re-throw so the caller (storyGenerator) can handle it
90 |       throw error;
91 |     }
92 |   }
93 | }
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
43 |       
44 |       // Log spiciness level for debugging
45 |       const spicynessLevel = bodyPayload.story.options.spiciness_level || 2;
46 |       console.log(`[StoryContinuationService] Spiciness level: ${spicynessLevel}`);
47 |     }
48 | 
49 |     try {
50 |       const jsonBodyString = JSON.stringify(bodyPayload, null, 2); // Pretty print
51 |       console.log(`[StoryContinuationService_DEBUG] Body payload AFTER stringify (length: ${jsonBodyString?.length}):\n---\n${jsonBodyString}\n---`);
52 |     } catch (stringifyError) {
53 |         console.error('[StoryContinuationService_DEBUG] Error during JSON.stringify:', stringifyError, 'Payload was:', bodyPayload);
54 |         throw new Error('Failed to stringify payload before sending to edge function.'); // Re-throw or handle
55 |     }
56 | 
57 |     const { data, error } = await supabase.functions.invoke<T>('story-continuation', { // Usar tipo genérico o específico
58 |       body: bodyPayload, // PASAR EL OBJETO DIRECTAMENTE
59 |       headers: {
60 |         'Authorization': `Bearer ${token}`
61 |         // 'Content-Type': 'application/json' // DEJAR QUE INVOKE LO MANEJE
62 |       }
63 |     });
64 | 
65 |     if (error) {
66 |       console.error(`Error en Edge Function story-continuation (action: ${action}):`, error);
67 |       let message = error.message;
68 |       if ((error as any).context) {
69 |         message = `${message} - ${JSON.stringify((error as any).context)}`;
70 |       }
71 |       throw new Error(message);
72 |     }
73 | 
74 |     console.log(`Respuesta recibida de story-continuation (action: ${action})`);
75 |     return data as T; // Devolver datos (casteo puede ser necesario)
76 |   }
77 | 
78 |   /**
79 |    * Genera opciones de continuación.
80 |    */
81 |   public static async generateContinuationOptions(
82 |     story: Story, 
83 |     chapters: StoryChapter[]
84 |   ): Promise<OptionsResponse> {
85 |     const response = await this.invokeContinuationFunction<OptionsResponse>('generateOptions', { 
86 |       story, 
87 |       chapters, 
88 |       language: story.options.language
89 |     });
90 |     if (!response || !Array.isArray(response.options)) {
91 |       console.error("Respuesta inválida para generateOptions:", response);
92 |       throw new Error("No se pudieron generar las opciones de continuación.");
93 |     }
94 |     return response;
95 |   }
96 | 
97 |   /**
98 |    * Genera una continuación libre (contenido y título).
99 |    */
100 |   public static async generateFreeContinuation(story: Story, chapters: StoryChapter[]): Promise<ContinuationResponse> {
101 |     const response = await this.invokeContinuationFunction<ContinuationResponse>('freeContinuation', { 
102 |       story, 
103 |       chapters, 
104 |       language: story.options.language 
105 |     });
106 |     if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
107 |       console.error("Respuesta inválida para freeContinuation:", response);
108 |       throw new Error("No se pudo generar la continuación libre.");
109 |     }
110 |     return response;
111 |   }
112 | 
113 |   /**
114 |    * Genera una continuación basada en una opción seleccionada (contenido y título).
115 |    */
116 |   public static async generateOptionContinuation(story: Story, chapters: StoryChapter[], selectedOptionSummary: string): Promise<ContinuationResponse> {
117 |     const response = await this.invokeContinuationFunction<ContinuationResponse>('optionContinuation', { 
118 |       story, 
119 |       chapters, 
120 |       selectedOptionSummary, 
121 |       language: story.options.language 
122 |     });
123 |     if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
124 |       console.error("Respuesta inválida para optionContinuation:", response);
125 |       throw new Error("No se pudo generar la continuación de opción.");
126 |     }
127 |     return response;
128 |   }
129 | 
130 |   /**
131 |    * Genera una continuación basada en la dirección del usuario (contenido y título).
132 |    */
133 |   public static async generateDirectedContinuation(story: Story, chapters: StoryChapter[], userDirection: string): Promise<ContinuationResponse> {
134 |     const response = await this.invokeContinuationFunction<ContinuationResponse>('directedContinuation', { 
135 |       story, 
136 |       chapters, 
137 |       userDirection, 
138 |       language: story.options.language 
139 |     });
140 |     if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
141 |       console.error("Respuesta inválida para directedContinuation:", response);
142 |       throw new Error("No se pudo generar la continuación dirigida.");
143 |     }
144 |     return response;
145 |   }
146 | 
147 |   // generateChapterTitle ya no es necesaria para el flujo principal
148 |   // public static async generateChapterTitle(content: string): Promise<{ title: string }> {
149 |   //    // ... (código anterior si quieres mantenerla por alguna razón, pero no se llamará desde generateStory)
150 |   // }
151 | }
```

src/services/ai/secureTtsService.ts
```
1 | // src/services/ai/secureTtsService.ts
2 | import { supabase } from '@/supabaseClient';
3 | 
4 | /**
5 |  * Servicio TTS seguro que usa Edge Functions de Supabase
6 |  * Reemplaza al ttsService.ts que exponía API keys en el frontend
7 |  */
8 | export type OpenAIVoiceType =
9 |   | 'alloy'
10 |   | 'echo'
11 |   | 'fable'
12 |   | 'onyx'
13 |   | 'nova'
14 |   | 'shimmer'
15 |   | 'coral'
16 |   | 'sage'
17 |   | 'ash';
18 | 
19 | export interface TTSOptions {
20 |   text: string;
21 |   voice?: OpenAIVoiceType;
22 |   model?: string;
23 |   instructions?: string;
24 | }
25 | 
26 | interface TTSError {
27 |   status?: number;
28 |   code?: string | number;
29 |   message?: string;
30 | }
31 | 
32 | function isTTSError(error: unknown): error is TTSError {
33 |   return typeof error === 'object' && error !== null;
34 | }
35 | 
36 | // Voces disponibles en OpenAI (movidas desde ttsService)
37 | export const OPENAI_VOICES = [
38 |   { id: 'alloy' as const, name: 'Alloy', description: 'Alloy (Neutral)' },
39 |   { id: 'echo' as const, name: 'Echo', description: 'Echo (Masculino)' },
40 |   { id: 'fable' as const, name: 'Fable', description: 'Fable (Fantasía)' },
41 |   { id: 'onyx' as const, name: 'Onyx', description: 'Onyx (Masculino)' },
42 |   { id: 'nova' as const, name: 'Nova', description: 'Nova (Femenina)' },
43 |   { id: 'shimmer' as const, name: 'Shimmer', description: 'Shimmer (Femenina)' },
44 |   { id: 'coral' as const, name: 'Coral', description: 'Coral (Femenina)' },
45 |   { id: 'sage' as const, name: 'Sage', description: 'Sage (Narrador)' },
46 |   { id: 'ash' as const, name: 'Ash', description: 'Ash (Juvenil)' }
47 | ];
48 | 
49 | // Función para obtener las voces disponibles
50 | export const getAvailableVoices = async () => {
51 |   return OPENAI_VOICES;
52 | };
53 | 
54 | /**
55 |  * Genera audio usando la Edge Function segura de Supabase
56 |  * No expone API keys en el frontend
57 |  */
58 | export const generateSpeech = async ({
59 |   text,
60 |   voice = 'nova',
61 |   model = 'tts-1',
62 |   instructions
63 | }: TTSOptions): Promise<Blob> => {
64 |   if (!text || text.trim() === '') {
65 |     throw new Error('El texto es requerido');
66 |   }
67 | 
68 |   console.log(`Iniciando generación de audio segura via Edge Function...`);
69 |   console.log(`Configuración: Voz=${voice}, Modelo=${model}`);
70 | 
71 |   try {
72 |     // Obtener token de autenticación
73 |     const { data: { session }, error: sessionError } = await supabase.auth.getSession();
74 |     if (sessionError || !session) {
75 |       throw new Error('Usuario no autenticado');
76 |     }
77 | 
78 |     // Llamar a la Edge Function generate-audio
79 |     const { data, error } = await supabase.functions.invoke('generate-audio', {
80 |       body: {
81 |         text: text.trim(),
82 |         voice,
83 |         model,
84 |         instructions
85 |       },
86 |       headers: {
87 |         'Authorization': `Bearer ${session.access_token}`,
88 |         'Content-Type': 'application/json'
89 |       }
90 |     });
91 | 
92 |     if (error) {
93 |       console.error('Error en Edge Function generate-audio:', error);
94 |       throw new Error(`Error del servidor: ${error.message}`);
95 |     }
96 | 
97 |     // La Edge Function devuelve un ArrayBuffer, convertirlo a Blob
98 |     if (data instanceof ArrayBuffer) {
99 |       const audioBlob = new Blob([data], { type: 'audio/mpeg' });
100 |       console.log('Audio generado correctamente via Edge Function');
101 |       return audioBlob;
102 |     }
103 | 
104 |     // Si no es ArrayBuffer, verificar si es una respuesta de error
105 |     if (data && typeof data === 'object' && 'error' in data) {
106 |       throw new Error(data.error);
107 |     }
108 | 
109 |     throw new Error('Respuesta inválida del servidor');
110 | 
111 |   } catch (error: unknown) {
112 |     console.error('Error en generación de voz segura:', error);
113 |     
114 |     const ttsError = isTTSError(error) ? error as TTSError : null;
115 |     
116 |     // Manejar errores específicos
117 |     if (ttsError?.status === 429 || ttsError?.code === 429) {
118 |       throw new Error('Alcanzaste el máximo de créditos para generar un audio');
119 |     }
120 |     
121 |     if (ttsError?.status === 401 || ttsError?.code === 'invalid_api_key') {
122 |       throw new Error('Error de autenticación');
123 |     }
124 |     
125 |     if (ttsError?.status === 400) {
126 |       throw new Error('El texto proporcionado no es válido para generar audio');
127 |     }
128 |     
129 |     if (ttsError?.status === 402) {
130 |       throw new Error('Créditos de voz insuficientes');
131 |     }
132 |     
133 |     if (ttsError?.status && ttsError.status >= 500) {
134 |       throw new Error('El servicio de voz no está disponible temporalmente');
135 |     }
136 |     
137 |     const errorMessage = error instanceof Error ? error.message : 'Error inesperado al generar el audio';
138 |     throw new Error(errorMessage);
139 |   }
140 | };
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
24 |   console.log("🔍 DEBUG - Spiciness level from options:", options.spiciness_level);
25 | 
26 |   storiesStore.setIsGeneratingStory(true);
27 | 
28 |   // Declare variables outside try block to make them accessible in catch block
29 |   let selectedCharacters: StoryCharacter[] = [];
30 |   let selectedCharactersData: string | null = null;
31 |   let profileSettings: typeof userStore.profileSettings;
32 |   let user: typeof userStore.user;
33 |   let additionalDetails: typeof storyOptionsState.additionalDetails;
34 | 
35 |   try {
36 |     const storyId = generateId();
37 |     profileSettings = userStore.profileSettings;
38 |     user = userStore.user;
39 |     additionalDetails = storyOptionsState.additionalDetails;
40 | 
41 |     if (!user) {
42 |       throw new Error("Usuario no autenticado");
43 |     }
44 | 
45 |     // Obtener personajes seleccionados desde sessionStorage en lugar del store
46 |     selectedCharactersData = sessionStorage.getItem('selectedCharacters');
47 |     
48 |     if (selectedCharactersData) {
49 |       try {
50 |         selectedCharacters = JSON.parse(selectedCharactersData);
51 |         console.log("🔍 DEBUG - Characters loaded from sessionStorage:", selectedCharacters.length);
52 |       } catch (error) {
53 |         console.error("Error parsing selectedCharacters from sessionStorage:", error);
54 |       }
55 |     } else {
56 |       console.warn("No selectedCharacters found in sessionStorage");
57 |     }
58 |     
59 |     // Fallback: Try to get characters from storyOptions as backup
60 |     if (!selectedCharacters || selectedCharacters.length === 0) {
61 |       console.log("🔍 DEBUG - Attempting fallback to storyOptions.characters");
62 |       if (options.characters && options.characters.length > 0) {
63 |         selectedCharacters = options.characters;
64 |         console.log("🔍 DEBUG - Using characters from options:", selectedCharacters.length);
65 |       } else if (storyOptionsState.currentStoryOptions.characters && storyOptionsState.currentStoryOptions.characters.length > 0) {
66 |         selectedCharacters = storyOptionsState.currentStoryOptions.characters;
67 |         console.log("🔍 DEBUG - Using characters from storyOptionsState:", selectedCharacters.length);
68 |       }
69 |     }
70 | 
71 |     // --- DEBUG: Detailed parameter logging BEFORE building payload --- 
72 |     console.log("🔍 DEBUG PRE-PAYLOAD: Profile Data ->", JSON.stringify(profileSettings, null, 2));
73 |     console.log("🔍 DEBUG PRE-PAYLOAD: Selected Characters ->", JSON.stringify(selectedCharacters, null, 2));
74 |     console.log("🔍 DEBUG PRE-PAYLOAD: Options Received (function) ->", JSON.stringify(options, null, 2));
75 |     console.log("🔍 DEBUG PRE-PAYLOAD: Format (store) ->", storyOptionsState.currentStoryOptions.format);
76 |     console.log("🔍 DEBUG PRE-PAYLOAD: Additional Details ->", additionalDetails);
77 |     // --- END DEBUG ---
78 | 
79 |     if (!profileSettings) throw new Error("User profile not loaded.");
80 |     if (!selectedCharacters || selectedCharacters.length === 0) {
81 |       console.error("🔍 DEBUG - No characters available from any source:");
82 |       console.error("  - sessionStorage:", selectedCharactersData);
83 |       console.error("  - options.characters:", options.characters);
84 |       console.error("  - storyOptionsState.currentStoryOptions.characters:", storyOptionsState.currentStoryOptions.characters);
85 |       throw new Error("No characters selected. Please select at least one character before generating a story.");
86 |     }
87 | 
88 |     // --- SINGLE call to service that invokes 'generate-story' EF ---
89 |     const payload: GenerateStoryParams = {
90 |       options: {
91 |         characters: selectedCharacters,
92 |         genre: options.genre,
93 |         format: storyOptionsState.currentStoryOptions.format,
94 |         spiciness_level: options.spiciness_level, // Add spiciness_level to payload
95 |       },
96 |       language: profileSettings.language,
97 |       additionalDetails: additionalDetails || undefined,
98 |     };
99 | 
100 |     console.log("Sending request to generate-story Edge Function with params:", payload);
101 |     console.log("🔍 DEBUG - Spiciness level in final payload:", payload.options.spiciness_level);
102 | 
103 |     const storyResponse = await GenerateStoryService.generateStoryWithAI(payload);
104 |     // storyResponse ahora es { content: string, title: string }
105 |     console.log(`[storyGenerator_DEBUG] Title received from Service: "${storyResponse.title}"`);
106 | 
107 |     // Los personajes seleccionados ya están guardados, no necesitamos save individual
108 |     // Solo guardamos currentCharacter si se usó para creación de personaje nuevo
109 | 
110 |     // Crear el objeto historia con título y contenido de la respuesta
111 |     const story: Story = {
112 |       id: storyId,
113 |       title: storyResponse.title,
114 |       content: storyResponse.content,
115 |       options: {
116 |         characters: selectedCharacters,
117 |         genre: options.genre || "adventure",
118 |         format: storyOptionsState.currentStoryOptions.format || "episodic",
119 |         language: payload.language,
120 |         spiciness_level: options.spiciness_level || 2, // Include spiciness_level in story options
121 |       },
122 |       additional_details: additionalDetails,
123 |       createdAt: new Date().toISOString(),
124 |       characters_data: selectedCharacters, // Store complete character array for database
125 |       // audioUrl se añadirá después si se genera
126 |     };
127 | 
128 |     console.log("🔍 DEBUG - Story Created:", JSON.stringify(story.options, null, 2));
129 |     console.log(`[storyGenerator_DEBUG] Title being saved to store: "${story.title}"`);
130 | 
131 |     // 1. Save the main story (as before)
132 |     // Save the generated story in the store
133 |     await storiesStore.addGeneratedStory(story);
134 | 
135 |     // 2. Create and save Chapter 1
136 |     const firstChapter: StoryChapter = {
137 |       id: generateId(),
138 |       chapterNumber: 1,
139 |       title: story.title,
140 |       content: story.content,
141 |       generationMethod: 'free',
142 |       createdAt: new Date().toISOString(),
143 |       // customInput doesn't apply here
144 |     };
145 |     await chaptersStore.addChapter(story.id, firstChapter);
146 | 
147 |     // Clear temporarily stored story options and sessionStorage
148 |     storyOptionsState.resetStoryOptions();
149 |     sessionStorage.removeItem('selectedCharacters');
150 |     console.log("🔍 DEBUG - Cleared sessionStorage after successful story generation");
151 | 
152 |     return story;
153 | 
154 |   } catch (error: unknown) {
155 |     console.error("Error generating story in storyGenerator:", error);
156 |     console.error("🔍 DEBUG - Error context:", {
157 |       selectedCharactersCount: selectedCharacters?.length || 0,
158 |       hasProfileSettings: !!profileSettings,
159 |       hasUser: !!user,
160 |       storyOptionsFormat: storyOptionsState.currentStoryOptions.format,
161 |       additionalDetails: additionalDetails || null,
162 |     });
163 |     
164 |     toast.error("Error generating story", {
165 |       description: error instanceof Error ? error.message : "Please try again.",
166 |     });
167 |     
168 |     // Reset story options on error
169 |     storyOptionsState.resetStoryOptions();
170 |     
171 |     // Clear sessionStorage on error to prevent future issues
172 |     try {
173 |       sessionStorage.removeItem('selectedCharacters');
174 |       console.log("🔍 DEBUG - Cleared sessionStorage after error");
175 |     } catch (storageError) {
176 |       console.warn("Could not clear sessionStorage:", storageError);
177 |     }
178 |     
179 |     return null;
180 |   } finally {
181 |     storiesStore.setIsGeneratingStory(false);
182 |   }
183 | };
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
38 |   is_preset?: boolean; // Identifies preset characters vs user-created characters
39 | }
40 | 
41 | 
42 | export type StoryOptions = {
43 |   characters: StoryCharacter[];  // Unified: array de personajes (1-4)
44 |   genre: string;
45 |   format: StoryFormat;  // ← CAMBIO: era 'duration'
46 |   language?: string;
47 |   userProvidedContext?: string;
48 |   spiciness_level?: number;  // Adult content intensity level (1=Sensual, 2=Passionate, 3=Intense)
49 | }
50 | 
51 | export type Story = {
52 |   id: string;
53 |   title: string;
54 |   content: string;
55 |   audioUrl?: string;
56 |   options: StoryOptions;
57 |   createdAt: string;
58 |   additional_details?: string | null;
59 |   characters_data?: StoryCharacter[]; // Complete array of characters used in the story
60 | }
61 | 
62 | export type User = {
63 |   email: string;
64 |   id: string;
65 | }
66 | 
67 | 
68 | export type StoryChapter = {
69 |   id?: string; // Optional for unsaved chapters, auto-generated by database
70 |   chapterNumber: number;
71 |   title: string;
72 |   content: string;
73 |   createdAt: string;
74 |   generationMethod?: 'free' | 'option1' | 'option2' | 'option3' | 'custom';
75 |   customInput?: string; // Only if generationMethod is 'custom'
76 | };
77 | 
78 | export type StoryWithChapters = {
79 |   id: string;
80 |   title: string;
81 |   content: string;
82 |   audioUrl?: string;
83 |   options: StoryOptions;
84 |   createdAt: string;
85 |   additional_details?: string | null;
86 |   chapters: StoryChapter[];
87 |   hasMultipleChapters?: boolean;
88 |   chaptersCount?: number;
89 | };
90 | 
91 | export type PresetSuggestion = {
92 |   id: number; // Supabase bigint maps to number in JS/TS if not excessively large
93 |   text_prompt: string;
94 | };
```

src/types/jsx.d.ts
```
1 | import React from 'react';
2 | 
3 | declare global {
4 |   namespace JSX {
5 |     interface IntrinsicElements {
6 |       div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
7 |       span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
8 |       button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
9 |       input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
10 |       select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
11 |       option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
12 |       label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
13 |       audio: React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
14 |       img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
15 |       p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
16 |       h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
17 |       h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
18 |       h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
19 |       h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
20 |       h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
21 |       h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
22 |     }
23 |   }
24 | } 
```

supabase/functions/_shared/cors.ts
```
1 | // supabase/functions/_shared/cors.ts
2 | 
3 | export const corsHeaders = {
4 |   // For development: include localhost
5 |   'Access-Control-Allow-Origin': '*',
6 |   
7 |   // If you need to support multiple origins, you can use this instead
8 |   // and add logic in your function to set the appropriate origin
9 |   // 'Access-Control-Allow-Origin': '*', 
10 |   
11 |   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
12 |   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
13 |   'Access-Control-Max-Age': '86400',  // 24 hours caching for preflight requests
14 | };
```

supabase/functions/create-checkout-session/index.ts
```
1 | // supabase/functions/create-checkout-session/index.ts
2 | 
3 | import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
4 | import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
5 | import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno';
6 | import { corsHeaders } from '../_shared/cors.ts'; // Ruta corregida
7 | 
8 | console.log(`[CREATE_CHECKOUT_DEBUG] Function create-checkout-session initializing...`);
9 | 
10 | // Inicializa Stripe
11 | const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
12 | if (!stripeSecretKey) {
13 |   console.error("[CREATE_CHECKOUT_ERROR] CRITICAL: STRIPE_SECRET_KEY environment variable is not set.");
14 |   // Considera lanzar un error si falta
15 | }
16 | const stripe = new Stripe(stripeSecretKey!, {
17 |   apiVersion: '2023-10-16',
18 |   httpClient: Stripe.createFetchHttpClient(),
19 | });
20 | 
21 | // Obtén la URL base
22 | const appBaseUrl = Deno.env.get('APP_BASE_URL');
23 | if (!appBaseUrl) {
24 |   console.error("[CREATE_CHECKOUT_ERROR] APP_BASE_URL environment variable is not set.");
25 |   // Considera lanzar un error
26 | }
27 | 
28 | serve(async (req: Request) => {
29 |   // Gestiona preflight CORS
30 |   if (req.method === 'OPTIONS') {
31 |     console.log('[CREATE_CHECKOUT_DEBUG] Handling OPTIONS preflight request');
32 |     return new Response('ok', { headers: corsHeaders });
33 |   }
34 | 
35 |   console.log(`[CREATE_CHECKOUT_DEBUG] Handling ${req.method} request`);
36 | 
37 |   try {
38 |     // 1. Inicializa cliente Supabase
39 |     const supabaseClient = createClient(
40 |       Deno.env.get('SUPABASE_URL') ?? '',
41 |       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
42 |       { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
43 |     );
44 | 
45 |     // 2. Verifica autenticación
46 |     const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
47 |     if (userError || !user) {
48 |       console.error('[CREATE_CHECKOUT_ERROR] Authentication error:', userError?.message || 'No user found');
49 |       return new Response(JSON.stringify({ error: 'Usuario no autenticado o inválido.' }), {
50 |         status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
51 |       });
52 |     }
53 |     console.log(`[CREATE_CHECKOUT_DEBUG] Authenticated user ID: ${user.id}`);
54 | 
55 |     // 3. Parsea el cuerpo y determina el item
56 |     let priceId: string | null = null;
57 |     let mode: 'payment' | 'subscription' = 'payment';
58 |     let finalMetadata = {}; // Usamos un nombre diferente para claridad
59 | 
60 |     const requestBody = await req.json();
61 |     const item = requestBody.item;
62 |     console.log(`[CREATE_CHECKOUT_DEBUG] Received request to purchase item: "${item}"`);
63 | 
64 |     if (item === 'premium') {
65 |       priceId = Deno.env.get('PREMIUM_PLAN_PRICE_ID');
66 |       mode = 'subscription';
67 |       finalMetadata = { supabase_user_id: user.id };
68 |       console.log(`[CREATE_CHECKOUT_DEBUG] Mode set to 'subscription'. Metadata for subscription_data: ${JSON.stringify(finalMetadata)}`);
69 |     } else if (item === 'credits') {
70 |       priceId = Deno.env.get('VOICE_CREDITS_PRICE_ID');
71 |       mode = 'payment';
72 |       // !! VERIFICACIÓN CLAVE !!
73 |       finalMetadata = { supabase_user_id: user.id, item_purchased: 'voice_credits' };
74 |       console.log(`[CREATE_CHECKOUT_DEBUG] Mode set to 'payment'. Metadata for payment_intent_data: ${JSON.stringify(finalMetadata)}`);
75 |     } else {
76 |       console.error(`[CREATE_CHECKOUT_ERROR] Invalid item requested: ${item}`);
77 |       return new Response(JSON.stringify({ error: 'Artículo solicitado inválido.' }), {
78 |         status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
79 |       });
80 |     }
81 | 
82 |     if (!priceId) {
83 |       console.error(`[CREATE_CHECKOUT_ERROR] Stripe Price ID is not configured in env variables for item: ${item}. Check PREMIUM_PLAN_PRICE_ID or VOICE_CREDITS_PRICE_ID.`);
84 |       throw new Error('Error de configuración del servidor: falta el ID de precio.');
85 |     }
86 |     console.log(`[CREATE_CHECKOUT_DEBUG] Resolved Price ID: ${priceId}, Mode: ${mode}`);
87 | 
88 |     // 4. Busca o crea cliente Stripe
89 |     let stripeCustomerId: string;
90 |     const { data: profile, error: profileError } = await supabaseClient
91 |       .from('profiles')
92 |       .select('stripe_customer_id')
93 |       .eq('id', user.id)
94 |       .maybeSingle();
95 | 
96 |     if (profileError) {
97 |       console.error('[CREATE_CHECKOUT_ERROR] Database error fetching profile:', profileError);
98 |       throw new Error('Error al consultar el perfil del usuario.');
99 |     }
100 | 
101 |     if (profile?.stripe_customer_id) {
102 |       stripeCustomerId = profile.stripe_customer_id;
103 |       console.log(`[CREATE_CHECKOUT_DEBUG] Found existing Stripe Customer ID: ${stripeCustomerId}`);
104 |     } else {
105 |       console.log(`[CREATE_CHECKOUT_DEBUG] Stripe Customer ID not found for user ${user.id}. Creating new Stripe Customer...`);
106 |       const customer = await stripe.customers.create({
107 |         email: user.email,
108 |         metadata: { supabase_user_id: user.id }, // Metadata en el cliente Stripe
109 |       });
110 |       stripeCustomerId = customer.id;
111 |       console.log(`[CREATE_CHECKOUT_DEBUG] Created new Stripe Customer ID: ${stripeCustomerId}. Updating profile...`);
112 | 
113 |       const { error: updateError } = await supabaseClient
114 |         .from('profiles')
115 |         .update({ stripe_customer_id: stripeCustomerId })
116 |         .eq('id', user.id);
117 | 
118 |       if (updateError) {
119 |         console.error('[CREATE_CHECKOUT_ERROR] Failed to update profile with Stripe Customer ID:', updateError);
120 |         throw new Error('No se pudo actualizar el perfil del usuario con la información de Stripe.');
121 |       }
122 |       console.log(`[CREATE_CHECKOUT_DEBUG] Profile updated successfully with Stripe Customer ID.`);
123 |     }
124 | 
125 |     // 6. Prepara y crea la sesión de Stripe Checkout
126 |     console.log(`[CREATE_CHECKOUT_DEBUG] Preparing Stripe Checkout session for Customer ${stripeCustomerId}...`);
127 |     const sessionParams: Stripe.Checkout.SessionCreateParams = {
128 |       customer: stripeCustomerId,
129 |       payment_method_types: ['card'],
130 |       line_items: [{ price: priceId, quantity: 1 }],
131 |       mode: mode,
132 |       success_url: `${appBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
133 |       cancel_url: `${appBaseUrl}/payment-cancel`,
134 |       // Adjunta metadata relevante según el modo
135 |       ...(mode === 'subscription' && {
136 |         subscription_data: { metadata: finalMetadata } // Metadata para suscripciones
137 |       }),
138 |       ...(mode === 'payment' && {
139 |         payment_intent_data: { metadata: finalMetadata } // !! Metadata para pagos únicos (créditos) !!
140 |       }),
141 |     };
142 | 
143 |     // !! LOG ANTES DE CREAR !!
144 |     console.log(`[CREATE_CHECKOUT_DEBUG] Session parameters being sent to Stripe: ${JSON.stringify(sessionParams)}`);
145 | 
146 |     const session = await stripe.checkout.sessions.create(sessionParams);
147 |     console.log(`[CREATE_CHECKOUT_DEBUG] Stripe Checkout session created: ${session.id}, URL: ${session.url}`);
148 | 
149 |     // 7. Devuelve la URL
150 |     return new Response(JSON.stringify({ url: session.url }), {
151 |       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
152 |       status: 200,
153 |     });
154 | 
155 |   } catch (error) {
156 |     console.error('[CREATE_CHECKOUT_ERROR] Unhandled error in create-checkout-session:', error);
157 |     return new Response(JSON.stringify({ error: `Error interno del servidor: ${error.message}` }), {
158 |       status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
159 |     });
160 |   }
161 | });
```

supabase/functions/create-customer-portal-session/index.ts
```
1 | // supabase/functions/create-customer-portal-session/index.ts
2 | 
3 | import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
4 | import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
5 | import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno';
6 | import { corsHeaders } from '../_shared/cors.ts'; // Ruta corregida
7 | 
8 | console.log(`Function create-customer-portal-session initializing...`);
9 | 
10 | // --- Variables de Entorno y Cliente Stripe ---
11 | const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
12 | const appBaseUrl = Deno.env.get('APP_BASE_URL');
13 | 
14 | // Verificación inicial (fuera del handler para errores de configuración tempranos)
15 | if (!stripeSecretKey) {
16 |     console.error("FATAL: STRIPE_SECRET_KEY environment variable is not set.");
17 |     // La función fallará al intentar inicializar Stripe, pero este log ayuda.
18 | }
19 | if (!appBaseUrl) {
20 |     console.error("FATAL: APP_BASE_URL environment variable is not set.");
21 |     // La verificación dentro del handler devolverá error 500 al cliente.
22 | }
23 | 
24 | // Inicializa Stripe con la clave secreta (si existe)
25 | // El '!' aquí es menos crítico porque si es null, Stripe() lanzará un error claro.
26 | // Pero es más seguro haberlo verificado antes.
27 | const stripe = new Stripe(stripeSecretKey!, {
28 |   apiVersion: '2023-10-16',
29 |   httpClient: Stripe.createFetchHttpClient(),
30 | });
31 | // --- Fin Variables y Cliente ---
32 | 
33 | 
34 | serve(async (req: Request) => {
35 |   // Gestiona la solicitud preflight CORS del navegador
36 |   if (req.method === 'OPTIONS') {
37 |     console.log('Handling OPTIONS preflight request');
38 |     return new Response('ok', { headers: corsHeaders });
39 |   }
40 | 
41 |   console.log(`Handling ${req.method} request`);
42 | 
43 |   try {
44 |     // Verificar de nuevo la variable APP_BASE_URL dentro del handler para poder retornar una respuesta
45 |     if (!appBaseUrl) {
46 |       // Este log ya se mostró al inicio, pero aquí retornamos error al cliente
47 |       console.error("Configuration Error: APP_BASE_URL is not set.");
48 |       return new Response(JSON.stringify({ error: 'Error de configuración interna del servidor.' }), {
49 |           status: 500, // Internal Server Error
50 |           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
51 |       });
52 |     }
53 |     // Podríamos añadir una verificación similar para stripeSecretKey aquí también si quisiéramos ser extra seguros
54 | 
55 |     // 1. Inicializa el cliente de Supabase específico para esta solicitud
56 |     const supabaseClient = createClient(
57 |       Deno.env.get('SUPABASE_URL') ?? '',
58 |       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
59 |       { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
60 |     );
61 | 
62 |     // 2. Verifica si el usuario está autenticado
63 |     const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
64 |     if (userError || !user) {
65 |       console.error('Authentication error:', userError);
66 |       return new Response(JSON.stringify({ error: 'Usuario no autenticado o inválido.' }), {
67 |         status: 401, // Unauthorized
68 |         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
69 |       });
70 |     }
71 |     console.log(`Authenticated user ID: ${user.id}`);
72 | 
73 |     // 3. Busca el stripe_customer_id en el perfil del usuario
74 |     const { data: profile, error: profileError } = await supabaseClient
75 |       .from('profiles')
76 |       .select('stripe_customer_id')
77 |       .eq('id', user.id)
78 |       .maybeSingle(); // Usa maybeSingle para manejar perfil no encontrado sin error
79 | 
80 |     // Maneja errores de DB que no sean 'no encontrado'
81 |     if (profileError && profileError.code !== 'PGRST116') {
82 |         console.error(`Database error fetching profile for user ${user.id}:`, profileError);
83 |         // Lanza un error para que sea capturado por el catch principal
84 |         throw new Error(`Error al consultar el perfil: ${profileError.message}`);
85 |     }
86 | 
87 |     // 4. Verifica que el usuario tenga un stripe_customer_id
88 |     if (!profile?.stripe_customer_id) {
89 |       console.warn(`No Stripe Customer ID found for user ${user.id}. Cannot open portal.`);
90 |       // Devuelve un error específico 404 para el frontend
91 |       return new Response(JSON.stringify({
92 |         error: 'No se encontró información de facturación para gestionar. Realiza una compra primero.'
93 |       }), {
94 |         status: 404, // Not Found
95 |         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
96 |       });
97 |     }
98 | 
99 |     const stripeCustomerId = profile.stripe_customer_id;
100 |     console.log(`Found Stripe Customer ID: ${stripeCustomerId}`);
101 | 
102 |     // 5. Crea una sesión del portal de cliente de Stripe
103 |     //    Define la ruta correcta del frontend para la página de inicio
104 |     const correctFrontendPath = '/'; // Ruta correcta para HomePage
105 |     const returnUrl = `${appBaseUrl}${correctFrontendPath}`; // Construye la URL completa
106 | 
107 |     console.log(`Creating Stripe Billing Portal session for Customer ${stripeCustomerId} with return URL: ${returnUrl}`); // Log con la URL correcta
108 |     const portalSession = await stripe.billingPortal.sessions.create({
109 |       customer: stripeCustomerId,
110 |       return_url: returnUrl, // Usa la URL corregida
111 |     });
112 | 
113 |     console.log(`Stripe Customer Portal session created: ${portalSession.id}`);
114 | 
115 |     // 6. Devuelve la URL de la sesión al frontend
116 |     return new Response(JSON.stringify({ url: portalSession.url }), {
117 |       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
118 |       status: 200,
119 |     });
120 | 
121 |   } catch (error) { // 'error' aquí es de tipo 'unknown'
122 |     console.error('Unhandled error in create-customer-portal-session:', error);
123 | 
124 |     // ---- Bloque Catch con manejo seguro de 'unknown' ----
125 |     let errorMessage = 'Error desconocido'; // Mensaje por defecto
126 |     if (error instanceof Error) {
127 |       errorMessage = error.message; // Es seguro acceder a .message
128 |     } else if (typeof error === 'string') {
129 |       errorMessage = error; // Si se lanzó un string
130 |     }
131 |     // ---- Fin Bloque Catch ----
132 | 
133 |     // Devuelve la respuesta usando el mensaje obtenido de forma segura
134 |     return new Response(JSON.stringify({ error: `Error interno del servidor: ${errorMessage}` }), {
135 |       status: 500, // Internal Server Error
136 |       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
137 |     });
138 |   }
139 | });
```

supabase/functions/generate-audio/index.ts
```
1 | // supabase/functions/ai/generate-audio/index.ts
2 | // Lógica CORREGIDA: Verifica créditos ANTES de TTS y actualiza DB. Permite a gratuitos usar créditos comprados.
3 | 
4 | import { serve } from "https://deno.land/std@0.177.0/http/server.ts"; // O la versión que uses
5 | import { OpenAI } from "https://esm.sh/openai@4.40.0"; // O versión más reciente
6 | import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
7 | import { corsHeaders } from '../_shared/cors.ts'; // Asume que está en la carpeta renombrada 'functions'
8 | 
9 | // --- Configuración ---
10 | console.log(`[GENERATE_AUDIO_DEBUG] Function generate-audio initializing...`);
11 | 
12 | const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
13 | if (!openaiApiKey) {
14 |     console.error("[GENERATE_AUDIO_ERROR] CRITICAL: OPENAI_API_KEY environment variable not set.");
15 |     // Lanzar error para detener la función si falta la clave
16 |     throw new Error("OPENAI_API_KEY environment variable not set");
17 | }
18 | const openai = new OpenAI({ apiKey: openaiApiKey });
19 | 
20 | const supabaseUrl = Deno.env.get('SUPABASE_URL');
21 | const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // O APP_SERVICE_ROLE_KEY si ese es el nombre
22 | if (!supabaseUrl || !serviceRoleKey) {
23 |     console.error("[GENERATE_AUDIO_ERROR] CRITICAL: Supabase URL or Service Role Key not set.");
24 |     throw new Error("Supabase URL or Service Role Key not set");
25 | }
26 | // Cliente Admin para operaciones críticas (consulta de perfil, actualización de créditos)
27 | const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
28 | 
29 | // Constante para el límite mensual (mejor si viene de env vars)
30 | const PREMIUM_MONTHLY_ALLOWANCE = 20;
31 | 
32 | console.log(`[GENERATE_AUDIO_DEBUG] Function generate-audio initialized successfully.`);
33 | // --- Fin Configuración ---
34 | 
35 | serve(async (req: Request) => {
36 |   // Manejo Preflight OPTIONS
37 |   if (req.method === 'OPTIONS') {
38 |     console.log('[GENERATE_AUDIO_DEBUG] Handling OPTIONS preflight request');
39 |     return new Response('ok', { headers: corsHeaders });
40 |   }
41 | 
42 |   let userId: string | null = null; // Para logging en caso de error temprano
43 |   let creditSource: 'monthly' | 'purchased' | 'none' = 'none'; // Para saber qué actualizar
44 | 
45 |   try {
46 |     // --- 1. Autenticación ---
47 |     console.log('[GENERATE_AUDIO_DEBUG] Attempting authentication...');
48 |     const authHeader = req.headers.get('Authorization');
49 |     if (!authHeader?.startsWith('Bearer ')) {
50 |         console.warn('[GENERATE_AUDIO_WARN] Invalid or missing Authorization header.');
51 |         return new Response(JSON.stringify({ error: 'Token inválido.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
52 |     }
53 |     const token = authHeader.replace('Bearer ', '');
54 | 
55 |     // Usamos el cliente ADMIN para obtener el usuario asociado al token JWT
56 |     // Esto es más seguro que crear un cliente por solicitud con el token del usuario
57 |     const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
58 | 
59 |     if (authError || !user) {
60 |         console.error('[GENERATE_AUDIO_ERROR] Authentication failed:', authError?.message || 'User not found for token.');
61 |         return new Response(JSON.stringify({ error: 'No autenticado.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
62 |     }
63 |     userId = user.id; // Asignamos userId para logging posterior
64 |     console.log(`[GENERATE_AUDIO_INFO] User Authenticated: ${userId}`);
65 |     // --- Fin Autenticación ---
66 | 
67 |     // --- 2. Obtener Perfil y Verificar Permiso/Límites/Créditos ---
68 |     console.log(`[GENERATE_AUDIO_DEBUG] Fetching profile for user ${userId}...`);
69 |     const { data: profile, error: profileError } = await supabaseAdmin
70 |         .from('profiles')
71 |         .select('subscription_status, voice_credits, monthly_voice_generations_used')
72 |         .eq('id', userId)
73 |         .single(); // Usar single() para que falle si no hay exactamente 1 perfil
74 | 
75 |     if (profileError) {
76 |         console.error(`[GENERATE_AUDIO_ERROR] Failed to fetch profile for user ${userId}:`, profileError);
77 |         // No lanzar error aquí, devolver respuesta controlada
78 |         return new Response(JSON.stringify({ error: 'Error al obtener perfil de usuario.' }), { status: 500, headers: corsHeaders });
79 |     }
80 |     // No necesitamos chequear !profile porque .single() ya daría error si no existe
81 | 
82 |     console.log(`[GENERATE_AUDIO_DEBUG] Profile data for ${userId}:`, profile);
83 | 
84 |     let canGenerate = false;
85 |     const isPremium = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
86 |     const monthlyUsed = profile.monthly_voice_generations_used ?? 0;
87 |     const purchasedCredits = profile.voice_credits ?? 0;
88 | 
89 |     // --- Lógica de decisión ---
90 |     if (isPremium) {
91 |         console.log(`[GENERATE_AUDIO_DEBUG] User ${userId} is Premium/Trialing.`);
92 |         if (monthlyUsed < PREMIUM_MONTHLY_ALLOWANCE) {
93 |             console.log(`[GENERATE_AUDIO_INFO] Authorizing via monthly allowance for user ${userId}. Used: ${monthlyUsed}/${PREMIUM_MONTHLY_ALLOWANCE}.`);
94 |             canGenerate = true;
95 |             creditSource = 'monthly';
96 |         } else if (purchasedCredits > 0) {
97 |             console.log(`[GENERATE_AUDIO_INFO] Monthly allowance used. Authorizing via purchased credit for user ${userId}. Purchased available: ${purchasedCredits}.`);
98 |             canGenerate = true;
99 |             creditSource = 'purchased';
100 |         } else {
101 |             console.log(`[GENERATE_AUDIO_WARN] Denying - Premium user ${userId} has no monthly allowance or purchased credits remaining.`);
102 |         }
103 |     } else { // Usuario Gratuito, Cancelado, etc.
104 |         console.log(`[GENERATE_AUDIO_DEBUG] User ${userId} is not Premium (Status: ${profile.subscription_status}). Checking purchased credits...`);
105 |         if (purchasedCredits > 0) {
106 |             console.log(`[GENERATE_AUDIO_INFO] Authorizing via purchased credit for non-premium user ${userId}. Purchased available: ${purchasedCredits}.`);
107 |             canGenerate = true;
108 |             creditSource = 'purchased';
109 |         } else {
110 |             console.log(`[GENERATE_AUDIO_WARN] Denying - Non-premium user ${userId} has no purchased credits.`);
111 |             // Podríamos devolver 403 si NUNCA pudieran generar, pero como pueden comprar, 402 es mejor.
112 |         }
113 |     }
114 | 
115 |     // --- 3. Devolver error si no hay créditos ANTES de actualizar DB o llamar a TTS ---
116 |     if (!canGenerate) {
117 |         console.log(`[GENERATE_AUDIO_INFO] Denying audio generation for user ${userId} due to insufficient credits.`);
118 |         return new Response(JSON.stringify({ error: 'Créditos de voz insuficientes.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); // 402 Payment Required
119 |     }
120 | 
121 |     // --- 4. Actualizar Contador/Crédito (ANTES de llamar a OpenAI) ---
122 |     console.log(`[GENERATE_AUDIO_DEBUG] Attempting to update usage/credits for user ${userId} (Source: ${creditSource})...`);
123 |     let dbUpdateError = null;
124 |     let rpcResultData: number | null = null; // Para almacenar el resultado de decrement_voice_credits si es necesario
125 | 
126 |     if (creditSource === 'monthly') {
127 |         const { error: rpcError } = await supabaseAdmin.rpc('increment_monthly_voice_usage', { user_uuid: userId });
128 |         dbUpdateError = rpcError;
129 |         if (!dbUpdateError) console.log(`[GENERATE_AUDIO_INFO] DB OK: Monthly usage incremented for ${userId}.`);
130 | 
131 |     } else if (creditSource === 'purchased') {
132 |         // Llamamos a decrement y guardamos el resultado (podría ser el nuevo saldo o -1)
133 |         const { data, error: rpcError } = await supabaseAdmin.rpc('decrement_voice_credits', { user_uuid: userId });
134 |         dbUpdateError = rpcError;
135 |         rpcResultData = data; // Guardamos el resultado (puede ser null si la función no devuelve nada o el valor devuelto)
136 |         if (!dbUpdateError && typeof rpcResultData === 'number' && rpcResultData !== -1) {
137 |              console.log(`[GENERATE_AUDIO_INFO] DB OK: Purchased credit decremented for ${userId}. Approx new balance: ${rpcResultData}`);
138 |         } else if (!dbUpdateError && rpcResultData === -1) {
139 |              // Esto no debería pasar si canGenerate fue true, pero es un check de seguridad
140 |              console.warn(`[GENERATE_AUDIO_WARN] DB WARN: decrement_voice_credits returned -1 unexpectedly for user ${userId}.`);
141 |              // Considerar fallar aquí ya que el estado podría ser inconsistente
142 |              // dbUpdateError = new Error("Inconsistent state: decrement returned -1 after check passed.");
143 |         } else if (!dbUpdateError) {
144 |              console.log(`[GENERATE_AUDIO_INFO] DB OK: Purchased credit decremented for ${userId} (RPC did not return new balance).`);
145 |         }
146 |     }
147 | 
148 |     // Si la actualización de la DB falló, no continuamos
149 |     if (dbUpdateError) {
150 |         console.error(`[GENERATE_AUDIO_ERROR] CRITICAL FAIL: Failed to update ${creditSource} count via RPC for user ${userId}:`, dbUpdateError);
151 |         return new Response(JSON.stringify({ error: 'Error al actualizar el saldo de créditos.' }), { status: 500, headers: corsHeaders });
152 |     }
153 |     console.log(`[GENERATE_AUDIO_INFO] Credit/Usage count updated successfully for user ${userId}. Proceeding with TTS generation.`);
154 | 
155 |     // --- 5. Procesar Solicitud y Generar Audio (AHORA SÍ) ---
156 |     const { text, voice = 'alloy', model = 'tts-1' } = await req.json(); // Proporcionar defaults
157 |     if (!text || typeof text !== 'string' || text.trim().length === 0) {
158 |         console.warn(`[GENERATE_AUDIO_WARN] Invalid request body for user ${userId}: Text is missing or empty.`);
159 |         return new Response(JSON.stringify({ error: 'Texto inválido o ausente requerido.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
160 |     }
161 | 
162 |     console.log(`[GENERATE_AUDIO_INFO] Generating audio via OpenAI for user ${userId} (Voice: ${voice}, Model: ${model})...`);
163 |     const response = await openai.audio.speech.create({
164 |         model: model,
165 |         voice: voice,
166 |         input: text.trim() // Usar texto sin espacios extra
167 |     });
168 | 
169 |     // Verificar si la respuesta de OpenAI fue exitosa
170 |     if (!response.ok) {
171 |         const errorBody = await response.text(); // Intentar leer el cuerpo del error
172 |         console.error(`[GENERATE_AUDIO_ERROR] OpenAI API error for user ${userId}: ${response.status} ${response.statusText}`, errorBody);
173 |         // Devolver un error genérico al cliente, pero loguear el detalle
174 |         return new Response(JSON.stringify({ error: 'Error al contactar el servicio de generación de voz.' }), { status: 502, headers: corsHeaders }); // 502 Bad Gateway
175 |     }
176 | 
177 |     const audioBuffer = await response.arrayBuffer();
178 |     console.log(`[GENERATE_AUDIO_INFO] Audio generated successfully via OpenAI for user ${userId}.`);
179 |     // --- Fin Generar Audio ---
180 | 
181 |     // --- 6. Devolver Respuesta de Audio ---
182 |     // Nota: Ya no actualizamos créditos aquí, se hizo antes.
183 |     console.log(`[GENERATE_AUDIO_INFO] Returning audio buffer to user ${userId}.`);
184 |     return new Response(audioBuffer, {
185 |         headers: {
186 |             ...corsHeaders,
187 |             'Content-Type': 'audio/mpeg' // O el tipo correcto devuelto por OpenAI
188 |         },
189 |         status: 200
190 |     });
191 |     // --- Fin Devolver Respuesta ---
192 | 
193 |   } catch (error) {
194 |     // Captura errores generales (JSON parse, errores inesperados, etc.)
195 |     console.error(`[GENERATE_AUDIO_ERROR] Unhandled error in generate-audio function for user ${userId || 'UNKNOWN'}:`, error);
196 |     const errorMessage = 'Error interno del servidor al generar el audio.';
197 |     // Evitar exponer detalles internos en producción
198 |     // if (error instanceof Error) errorMessage = error.message;
199 |     // Usar 500 Internal Server Error para errores no manejados específicamente
200 |     return new Response(JSON.stringify({ error: errorMessage }), {
201 |         status: 500,
202 |         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
203 |     });
204 |   }
205 | });
```

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
13 | // --- Helper Function: Language-aware default titles ---
14 | function getLanguageAwareDefaultTitle(language: string): string {
15 |   const languageDefaults: Record<string, string> = {
16 |     'es': 'Aventura Inolvidable',
17 |     'en': 'Unforgettable Adventure',
18 |     'fr': 'Aventure Inoubliable',
19 |     'de': 'Unvergessliches Abenteuer',
20 |     'it': 'Avventura Indimenticabile',
21 |     'pt': 'Aventura Inesquecível',
22 |     'ru': 'Незабываемое приключение',
23 |     'ja': '忘れられない冒険',
24 |     'ko': '잊을 수 없는 모험',
25 |     'zh': '难忘的冒险'
26 |   };
27 |   return languageDefaults[language] || languageDefaults['en'];
28 | }
29 | 
30 | function getLanguageAwareDefaultContent(language: string): string {
31 |   const languageDefaults: Record<string, string> = {
32 |     'es': 'El cuento tiene un giro inesperado...',
33 |     'en': 'The story takes an unexpected turn...',
34 |     'fr': 'L\'histoire prend une tournure inattendue...',
35 |     'de': 'Die Geschichte nimmt eine unerwartete Wendung...',
36 |     'it': 'La storia prende una piega inaspettata...',
37 |     'pt': 'A história tem uma reviravolta inesperada...',
38 |     'ru': 'История принимает неожиданный поворот...',
39 |     'ja': '物語は予想外の展開を見せる...',
40 |     'ko': '이야기는 예상치 못한 전개를 보여준다...',
41 |     'zh': '故事出现了意想不到的转折...'
42 |   };
43 |   return languageDefaults[language] || languageDefaults['en'];
44 | }
45 | 
46 | // --- Helper Function (remains largely the same, adapted for potentially cleaner inputs from JSON) ---
47 | function cleanExtractedText(text: string | undefined | null, type: 'title' | 'content', language: string = 'en'): string {
48 |   const defaultText = type === 'title' ? getLanguageAwareDefaultTitle(language) : getLanguageAwareDefaultContent(language);
49 |   if (text === null || text === undefined || typeof text !== 'string') {
50 |     console.warn(`[Helper v7.0] cleanExtractedText (${type}): Input empty/not string.`);
51 |     return defaultText;
52 |   }
53 |   console.log(`[Helper v7.0] cleanExtractedText (${type}) - BEFORE: "${text.substring(0, 150)}..."`);
54 |   let cleaned = text.trim();
55 | 
56 |   // These might be less necessary if AI strictly adheres to JSON values, but good for robustness
57 |   cleaned = cleaned.replace(/^Título:\s*/i, '').trim();
58 |   cleaned = cleaned.replace(/^Contenido:\s*/i, '').trim();
59 |   if (type === 'content') {
60 |     cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // Eliminar numeración de listas
61 |     cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, ''); // Eliminar viñetas de listas
62 |   }
63 |   if (type === 'title') {
64 |     cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim(); // Quitar comillas alrededor del título
65 |   }
66 |   cleaned = cleaned.replace(/^(Respuesta|Aquí tienes el título|El título es):\s*/i, '').trim();
67 |   cleaned = cleaned.replace(/^(Aquí tienes el cuento|El cuento es):\s*/i, '').trim();
68 | 
69 |   console.log(`[Helper v7.0] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
70 |   return cleaned || defaultText; // Ensure non-empty string or default
71 | }
72 | 
73 | // --- Interface for Structured AI Response ---
74 | interface StoryGenerationResult {
75 |   title: string;
76 |   content: string;
77 | }
78 | 
79 | function isValidStoryResult(data: any): data is StoryGenerationResult {
80 |   return data &&
81 |     typeof data.title === 'string' &&
82 |     typeof data.content === 'string';
83 | }
84 | 
85 | // --- Main Handler ---
86 | serve(async (req: Request) => {
87 |   const functionVersion = "v7.0 (OpenAI Client + JSON)";
88 |   // 1. MANEJAR PREFLIGHT PRIMERO
89 |   if (req.method === "OPTIONS") {
90 |     console.log(`[${functionVersion}] Handling OPTIONS preflight request...`);
91 |     return new Response("ok", { headers: corsHeaders });
92 |   }
93 | 
94 |   // --- Configuración para Grok ---
95 |   const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
96 |   const GROK_API_BASE_URL = 'https://api.x.ai/v1';
97 |   const MODEL_NAME = 'grok-3-mini'; // Modelo explícito
98 | 
99 |   if (!GROK_API_KEY) {
100 |     throw new Error("La variable de entorno GROK_API_KEY no está configurada.");
101 |   }
102 | 
103 |   // --- Inicializar cliente OpenAI para Grok ---
104 |   const openai = new OpenAI({
105 |     apiKey: GROK_API_KEY,
106 |     baseURL: GROK_API_BASE_URL,
107 |   });
108 |   console.log(`[${functionVersion}] Cliente OpenAI configurado para el modelo Grok '${MODEL_NAME}' vía baseURL: ${openai.baseURL}`);
109 | 
110 |   const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
111 |   const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
112 | 
113 |   if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
114 |     console.error("Supabase URL or Service Role Key not set");
115 |     throw new Error("Supabase URL or Service Role Key not set");
116 |   }
117 |   const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
118 | 
119 |   // 2. Verificar Método POST
120 |   if (req.method !== 'POST') {
121 |     console.log(`[${functionVersion}] Method ${req.method} not allowed.`);
122 |     return new Response(JSON.stringify({ error: 'Método no permitido. Usar POST.' }), {
123 |       status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
124 |     });
125 |   }
126 | 
127 |   let userId: string | null = null;
128 |   let userIdForIncrement: string | null = null;
129 | 
130 |   try {
131 |     // 3. AUTENTICACIÓN
132 |     console.log(`[${functionVersion}] Handling POST request...`);
133 |     const authHeader = req.headers.get('Authorization');
134 |     if (!authHeader || !authHeader.startsWith('Bearer ')) {
135 |       console.error("Authorization header missing or invalid.");
136 |       return new Response(JSON.stringify({ error: 'Token inválido o ausente.' }), {
137 |         status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
138 |       });
139 |     }
140 |     const token = authHeader.replace('Bearer ', '');
141 |     const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
142 | 
143 |     if (authError || !user) {
144 |       console.error("Auth Error:", authError);
145 |       return new Response(JSON.stringify({ error: authError?.message || 'No autenticado.' }), {
146 |         status: authError?.status || 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
147 |       });
148 |     }
149 |     userId = user.id;
150 |     console.log(`[${functionVersion}] User Auth: ${userId}`);
151 | 
152 |     // 4. Perfil y Límites
153 |     const { data: profile, error: profileError } = await supabaseAdmin
154 |       .from('profiles')
155 |       .select('subscription_status, monthly_stories_generated, language, preferences')
156 |       .eq('id', userId)
157 |       .maybeSingle();
158 | 
159 |     if (profileError) {
160 |       console.error(`Error fetching profile for ${userId}:`, profileError);
161 |       throw new Error(`Error al obtener perfil de usuario: ${profileError.message}`);
162 |     }
163 | 
164 |     let isPremiumUser = false;
165 |     if (profile) {
166 |       isPremiumUser = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
167 |     } else {
168 |       console.warn(`Perfil no encontrado para ${userId}. Tratando como gratuito.`);
169 |     }
170 | 
171 |     const currentStoriesGenerated = profile?.monthly_stories_generated ?? 0;
172 |     const FREE_STORY_LIMIT = 10;
173 | 
174 |     if (!isPremiumUser) {
175 |       userIdForIncrement = userId;
176 |       console.log(`[${functionVersion}] Free user ${userId}. Stories: ${currentStoriesGenerated}/${FREE_STORY_LIMIT}`);
177 |       if (currentStoriesGenerated >= FREE_STORY_LIMIT) {
178 |         return new Response(JSON.stringify({
179 |           error: `Límite mensual (${FREE_STORY_LIMIT}) alcanzado.`
180 |         }), {
181 |           status: 429,
182 |           headers: { ...corsHeaders, "Content-Type": "application/json" }
183 |         });
184 |       }
185 |     } else {
186 |       console.log(`[${functionVersion}] Premium user ${userId}.`);
187 |     }
188 | 
189 |     // 5. Body y Validación
190 |     let params: any;
191 |     try {
192 |       params = await req.json();
193 |       console.log(`[${functionVersion}] Params Received:`, JSON.stringify(params, null, 2));
194 |       console.log(`[${functionVersion}] Validating basic structure...`);
195 |       console.log(`[${functionVersion}] profile.language:`, profile?.language, typeof profile?.language);
196 |       console.log(`[${functionVersion}] profile.preferences:`, profile?.preferences ? 'provided' : 'none');
197 |       console.log(`[${functionVersion}] params.options:`, params.options);
198 |       if (params.options) {
199 |         console.log(`[${functionVersion}] params.options.format:`, params.options.format, typeof params.options.format);
200 |         console.log(`[${functionVersion}] params.options.genre:`, params.options.genre, typeof params.options.genre);
201 |         console.log(`[${functionVersion}] params.options.characters:`, params.options.characters);
202 |         console.log(`[${functionVersion}] params.options.character:`, params.options.character);
203 |       }
204 | 
205 |       // More detailed validation with debugging
206 |       console.log(`[${functionVersion}] Starting detailed validation...`);
207 | 
208 |       if (!params) {
209 |         console.error("[VALIDATION ERROR] params is null/undefined");
210 |         throw new Error("Parámetros inválidos: datos no recibidos.");
211 |       }
212 | 
213 |       if (typeof params !== 'object') {
214 |         console.error("[VALIDATION ERROR] params is not an object:", typeof params);
215 |         throw new Error("Parámetros inválidos: formato incorrecto.");
216 |       }
217 | 
218 |       if (!params.options) {
219 |         console.error("[VALIDATION ERROR] params.options is missing");
220 |         throw new Error("Parámetros inválidos: falta 'options'.");
221 |       }
222 | 
223 |       if (typeof params.options !== 'object') {
224 |         console.error("[VALIDATION ERROR] params.options is not an object:", typeof params.options);
225 |         throw new Error("Parámetros inválidos: 'options' debe ser un objeto.");
226 |       }
227 | 
228 |       // Validate individual fields with more detailed error messages
229 |       const errors = [];
230 | 
231 |       // Language and preferences come from profile, not params
232 |       if (!profile?.language || typeof profile.language !== 'string') {
233 |         errors.push('User profile must have a valid language setting');
234 |         console.error("[VALIDATION ERROR] profile.language:", profile?.language, typeof profile?.language);
235 |       }
236 | 
237 |       if (typeof params.options.format !== 'string' || !params.options.format) {
238 |         errors.push('options.format must be a non-empty string');
239 |         console.error("[VALIDATION ERROR] format:", params.options.format, typeof params.options.format);
240 |       }
241 | 
242 |       if (typeof params.options.genre !== 'string' || !params.options.genre) {
243 |         errors.push('options.genre must be a non-empty string');
244 |         console.error("[VALIDATION ERROR] genre:", params.options.genre, typeof params.options.genre);
245 |       }
246 | 
247 |       // Validate spiciness level (optional, default to 2 if not provided)
248 |       if (params.options.spiciness_level !== undefined) {
249 |         if (typeof params.options.spiciness_level !== 'number' || 
250 |             params.options.spiciness_level < 1 || 
251 |             params.options.spiciness_level > 3) {
252 |           errors.push('options.spiciness_level must be a number between 1 and 3');
253 |           console.error("[VALIDATION ERROR] spiciness_level:", params.options.spiciness_level, typeof params.options.spiciness_level);
254 |         }
255 |       }
256 | 
257 |       if (errors.length > 0) {
258 |         console.error("[VALIDATION ERROR] Basic validation failed:", errors);
259 |         throw new Error(`Invalid basic parameters: ${errors.join(', ')}.`);
260 |       }
261 | 
262 |       console.log(`[${functionVersion}] Basic validation passed!`);
263 | 
264 |       // Validate character data - support both legacy (character) and new (characters) formats
265 |       const hasMultipleCharacters = params.options.characters && Array.isArray(params.options.characters) && params.options.characters.length > 0;
266 |       const hasSingleCharacter = params.options.character && typeof params.options.character === 'object' && params.options.character.name;
267 | 
268 |       if (!hasMultipleCharacters && !hasSingleCharacter) {
269 |         console.error("Validation failed. No valid character data found:", {
270 |           hasCharacters: !!params.options.characters,
271 |           charactersIsArray: Array.isArray(params.options.characters),
272 |           charactersLength: params.options.characters?.length,
273 |           hasCharacter: !!params.options.character,
274 |           hasCharacterName: !!params.options.character?.name
275 |         });
276 |         throw new Error("Se requiere al menos un personaje válido (options.character.name o options.characters[] con al menos un elemento).");
277 |       }
278 | 
279 |       // Normalize to characters array for internal processing
280 |       let charactersArray;
281 |       if (hasMultipleCharacters) {
282 |         charactersArray = params.options.characters;
283 |         console.log(`[${functionVersion}] Multiple characters mode: ${charactersArray.length} characters`);
284 |       } else {
285 |         charactersArray = [params.options.character];
286 |         console.log(`[${functionVersion}] Single character mode (legacy): ${params.options.character.name}`);
287 |       }
288 | 
289 |       // Validate characters array (1-4 characters)
290 |       if (charactersArray.length > 4) {
291 |         throw new Error("Máximo 4 personajes permitidos por historia.");
292 |       }
293 | 
294 |       const invalidCharacters = charactersArray.filter(char =>
295 |         !char || typeof char !== 'object' || !char.name || typeof char.name !== 'string'
296 |       );
297 | 
298 |       if (invalidCharacters.length > 0) {
299 |         console.error("Validation failed. Invalid characters found:", invalidCharacters);
300 |         throw new Error("Todos los personajes deben tener un nombre válido.");
301 |       }
302 | 
303 |       console.log(`[${functionVersion}] Characters validated: ${charactersArray.map(c => c.name).join(', ')}`);
304 | 
305 |       // Store normalized characters array for use in prompts
306 |       params.options.characters = charactersArray;
307 | 
308 |     } catch (error) {
309 |       console.error(`[${functionVersion}] Failed to parse/validate JSON body for user ${userId}. Error:`, error);
310 |       const message = error instanceof Error ? error.message : "Error desconocido al procesar JSON.";
311 |       throw new Error(`Invalid/empty/incomplete JSON in body: ${message}.`);
312 |     }
313 | 
314 |     // 6. Generación IA con OpenAI Client y Esperando JSON
315 |     const spicynessLevel = params.options.spiciness_level || 2; // Default to moderate if not provided
316 |     const systemPrompt = createSystemPrompt(profile?.language || 'en', profile?.preferences || null, spicynessLevel);
317 |     const userPrompt = createUserPrompt_JsonFormat({ // Esta función ahora genera un prompt pidiendo JSON
318 |       options: params.options,
319 |       additionalDetails: params.additionalDetails
320 |     });
321 |     const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
322 | 
323 |     console.log(`[${functionVersion}] Calling AI (${MODEL_NAME}) for JSON output (User: ${userId}). Prompt length: ${combinedPrompt.length}`);
324 | 
325 |     const chatCompletion = await openai.chat.completions.create({
326 |       model: MODEL_NAME, // Usando el modelo Grok explícito
327 |       messages: [{ role: "user", content: combinedPrompt }],
328 |       response_format: { type: "json_object" }, // Request JSON output
329 |       temperature: 0.8,
330 |       top_p: 0.95,
331 |       max_tokens: 8000 // Ajustado a un límite razonable para Sonnet
332 |     });
333 | 
334 |     const aiResponseContent = chatCompletion.choices[0]?.message?.content;
335 |     const finishReason = chatCompletion.choices[0]?.finish_reason;
336 | 
337 |     console.log(`[${functionVersion}] Raw AI JSON response (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No text received)'}... Finish Reason: ${finishReason}`);
338 | 
339 |     if (finishReason === 'length') {
340 |       console.warn(`[${functionVersion}] AI generation may have been truncated due to 'length' finish_reason.`);
341 |     }
342 |     // Nota: blockReason específico como en GoogleGenerativeAI no está directamente disponible.
343 |     // Se confía en finish_reason o contenido vacío para problemas.
344 | 
345 |     // 7. Procesar Respuesta JSON de la IA
346 |     const userLanguage = profile?.language || 'en';
347 |     let finalTitle = getLanguageAwareDefaultTitle(userLanguage); // Language-aware default
348 |     let finalContent = ''; // Default
349 |     let parsedSuccessfully = false;
350 | 
351 |     if (aiResponseContent) {
352 |       try {
353 |         const storyResult: StoryGenerationResult = JSON.parse(aiResponseContent);
354 |         if (isValidStoryResult(storyResult)) {
355 |           finalTitle = cleanExtractedText(storyResult.title, 'title', userLanguage);
356 |           finalContent = cleanExtractedText(storyResult.content, 'content', userLanguage);
357 |           parsedSuccessfully = true;
358 |           console.log(`[${functionVersion}] Parsed AI JSON successfully. Title: "${finalTitle}"`);
359 |         } else {
360 |           console.warn(`[${functionVersion}] AI response JSON structure is invalid. Received: ${aiResponseContent.substring(0, 500)}...`);
361 |         }
362 |       } catch (parseError) {
363 |         console.error(`[${functionVersion}] Failed to parse JSON from AI response. Error: ${parseError.message}. Raw content: ${aiResponseContent.substring(0, 500)}...`);
364 |       }
365 |     } else {
366 |       console.error(`[${functionVersion}] AI response was empty or text could not be extracted. Finish Reason: ${finishReason}`);
367 |     }
368 | 
369 |     if (!parsedSuccessfully) {
370 |       console.warn(`[${functionVersion}] Using fallback: Default title, and attempting to use raw AI response (if any) as content (after cleaning).`);
371 |       finalContent = cleanExtractedText(aiResponseContent, 'content', userLanguage); // aiResponseContent could be null here
372 |       // finalTitle remains the language-aware default
373 |     }
374 | 
375 |     if (!finalContent) {
376 |       console.error(`[${functionVersion}] Content is empty even after JSON parsing/fallback and cleaning.`);
377 |       // Considerar devolver la respuesta cruda o un mensaje de error específico
378 |       finalContent = "Hubo un problema al generar el contenido del cuento, pero aquí está la respuesta cruda de la IA (puede no estar formateada): " + (aiResponseContent || "No se recibió respuesta de la IA.");
379 |     }
380 | 
381 |     console.log(`[${functionVersion}] Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);
382 | 
383 |     // 8. Incrementar Contador
384 |     if (userIdForIncrement) {
385 |       console.log(`[${functionVersion}] Incrementing count for ${userIdForIncrement}...`);
386 |       const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
387 |         user_uuid: userIdForIncrement
388 |       });
389 |       if (incrementError) {
390 |         console.error(`[${functionVersion}] CRITICAL: Failed count increment for ${userIdForIncrement}: ${incrementError.message}`);
391 |       } else {
392 |         console.log(`[${functionVersion}] Count incremented for ${userIdForIncrement}.`);
393 |       }
394 |     }
395 | 
396 |     // 9. Respuesta Final
397 |     return new Response(JSON.stringify({
398 |       content: finalContent,
399 |       title: finalTitle
400 |     }), {
401 |       status: 200,
402 |       headers: { ...corsHeaders, "Content-Type": "application/json" }
403 |     });
404 | 
405 |   } catch (error) {
406 |     // 10. Manejo de Errores
407 |     console.error(`[${functionVersion}] Error (User: ${userId || 'UNKNOWN'}):`, error);
408 |     let statusCode = 500;
409 |     const message = error instanceof Error ? error.message : "Error interno desconocido.";
410 | 
411 |     if (error instanceof Error) {
412 |       const lowerMessage = message.toLowerCase();
413 |       if (lowerMessage.includes("autenticado") || lowerMessage.includes("token inválido")) statusCode = 401;
414 |       else if (lowerMessage.includes("límite")) statusCode = 429;
415 |       else if (lowerMessage.includes("inválido") || lowerMessage.includes("json in body") || lowerMessage.includes("parámetros")) statusCode = 400;
416 |       // Actualizado para errores de IA con JSON
417 |       else if (lowerMessage.includes("ai response was not valid json") || lowerMessage.includes("ai response was empty") || lowerMessage.includes("ai response json structure is invalid") || lowerMessage.includes("blocked") || lowerMessage.includes("filter")) statusCode = 502; // Bad Gateway
418 |     }
419 | 
420 |     return new Response(JSON.stringify({
421 |       error: `Error procesando solicitud: ${message}`
422 |     }), {
423 |       status: statusCode,
424 |       headers: { ...corsHeaders, "Content-Type": "application/json" }
425 |     });
426 |   }
427 | });
```

supabase/functions/generate-story/prompt.ts
```
1 | // supabase/edge-functions/generate-story/prompt.ts
2 | // v8.0 (Adult Content + Preferences): Contiene las funciones para generar los prompts de contenido adulto.
3 | // createUserPrompt_JsonFormat ahora instruye a la IA para devolver JSON con contenido erótico.
4 | 
5 | // Language mapping function to convert language codes to explicit language names
6 | function getLanguageName(languageCode: string): string {
7 |     const languageMap: Record<string, string> = {
8 |         'es': 'Spanish',
9 |         'en': 'English',
10 |         'fr': 'French',
11 |         'de': 'German',
12 |         'it': 'Italian',
13 |         'pt': 'Portuguese',
14 |         'ru': 'Russian',
15 |         'ja': 'Japanese',
16 |         'ko': 'Korean',
17 |         'zh': 'Chinese'
18 |     };
19 |     
20 |     return languageMap[languageCode] || 'English';
21 | }
22 | 
23 | // createSystemPrompt: El contenido textual de la guía para la IA ahora enfocado en contenido adulto.
24 | export function createSystemPrompt(language: string, preferences?: string | null, spicynessLevel: number = 2): string {
25 |     console.log(`[Adult Content v8.0] createSystemPrompt: lang=${language}, preferences=${preferences ? 'provided' : 'none'}, spiciness=${spicynessLevel}`);
26 | 
27 |     const languageName = getLanguageName(language);
28 |     let base = `You are an expert writer creating personalized erotic stories for adults. Write always in ${languageName}, with sophisticated and sensual language appropriate for mature audiences (18+).`;
29 |     
30 |     // Add spiciness level specific guidelines
31 |     if (spicynessLevel === 1) {
32 |         base += ` CONTENT INTENSITY: SENSUAL (Level 1) - Create suggestive and implicit content. Use elegant, metaphorical language that builds tension through glances, intimate conversations, and subtle touches. Scenes should end just before explicit acts or suggest them discretely. Focus on emotional connection and anticipation rather than graphic descriptions.`;
33 |     } else if (spicynessLevel === 2) {
34 |         base += ` CONTENT INTENSITY: PASSIONATE (Level 2) - Create explicit but balanced sexual content. Include clear descriptions of sexual acts without excessive graphic detail. Use sensual and direct but elegant language, focusing on emotions and physical sensations. Keep sexual scenes brief and avoid overly graphic descriptions while maintaining explicitness.`;
35 |     } else if (spicynessLevel === 3) {
36 |         base += ` CONTENT INTENSITY: INTENSE (Level 3) - Create very explicit and graphic sexual content. Include detailed descriptions of sexual acts, positions, and physical sensations. Use direct and provocative language without euphemisms. Maintain high sexual intensity with detailed, visual descriptions while emphasizing consent and positivity.`;
37 |     }
38 |     
39 |     if (preferences && preferences.trim()) {
40 |         base += ` The user has specified these preferences and interests: "${preferences.trim()}". Incorporate these elements thoughtfully and naturally into the story to create a personalized experience.`;
41 |         base += ` Guidelines for user preferences:\n`;
42 |         base += `   - **Respect Boundaries:** Only include elements that align with the specified preferences\n`;
43 |         base += `   - **Natural Integration:** Weave preferences into the plot organically, don't force them\n`;
44 |         base += `   - **Quality Focus:** Prioritize good storytelling over just including fetishes\n`;
45 |         base += `   - **Consent & Positivity:** All interactions should be consensual and positive\n`;
46 |         base += `   - **Character Development:** Use preferences to enhance character depth and relationships\n`;
47 |     } else {
48 |         base += ` Since no specific preferences were provided, create a sensual and engaging story with broad adult appeal, focusing on romance, attraction, and intimate connections.`;
49 |     }
50 |     
51 |     base += ` The story should follow a clear narrative structure: an engaging beginning that sets the mood, development with building tension and desire, and a satisfying climax and resolution.`;
52 |     base += ` Use sophisticated and evocative language that creates atmosphere and emotional connection. Focus on character development, sensual descriptions, and meaningful intimate moments.`;
53 |     base += ` Ensure all content is consensual, positive, and celebrates adult sexuality in a healthy and appealing way.`;
54 |     
55 |     return base;
56 | }
57 | 
58 | // Definición de tipos para las opciones del prompt de usuario (actualizado para múltiples personajes)
59 | interface CharacterOptions {
60 |     name: string;
61 |     gender: 'male' | 'female' | 'non-binary';
62 |     description: string;
63 | }
64 | 
65 | interface UserPromptOptions {
66 |     characters: CharacterOptions[];   // Unified: array de personajes (1-4)
67 |     genre: string;
68 |     format?: string;
69 |     language?: string;
70 | }
71 | 
72 | interface CreateUserPromptParams {
73 |     options: UserPromptOptions;
74 |     additionalDetails?: string;
75 | }
76 | 
77 | // createUserPrompt_JsonFormat: Anteriormente createUserPrompt_SeparatorFormat.
78 | // Modificada para instruir a la IA a devolver un objeto JSON con contenido adulto.
79 | export function createUserPrompt_JsonFormat({ options, additionalDetails }: CreateUserPromptParams): string {
80 |     console.log(`[Adult Content v8.0] createUserPrompt_JsonFormat:`, options, `details=`, additionalDetails);
81 |     const storyFormat = options.format || 'episodic';
82 |     const language = options.language || 'en';
83 | 
84 |     // Unified character system - always use characters array (1-4 characters)
85 |     const characters = options.characters || [];
86 |     const isMultipleCharacters = characters.length > 1;
87 | 
88 |     // Create base request with character handling
89 |     let request = `Create an erotic story for adults. Genre: ${options.genre}. `;
90 |     
91 |     if (isMultipleCharacters) {
92 |         request += `Main Characters (${characters.length}): `;
93 |         characters.forEach((char, index) => {
94 |             request += `${index + 1}. ${char.name}`;
95 |             request += `, gender: ${char.gender}`;
96 |             request += `, description: ${char.description}`;
97 |             if (index < characters.length - 1) request += '; ';
98 |         });
99 |         request += `.\n\n`;
100 |         
101 |         // Add specific instructions for multiple characters
102 |         request += `**Instructions for multiple characters:**\n`;
103 |         request += `- Ensure ALL characters have significant participation in the story\n`;
104 |         request += `- Each character should contribute uniquely based on their gender and personal description\n`;
105 |         request += `- Create natural and dynamic interactions between characters\n`;
106 |         request += `- Develop romantic/erotic tension and relationships between characters as appropriate\n`;
107 |         request += `- Keep the story focused and coherent despite multiple protagonists\n\n`;
108 |     } else {
109 |         const char = characters[0];
110 |         request += `Main Character: ${char.name}`;
111 |         request += `, gender: ${char.gender}`;
112 |         request += `, description: ${char.description}`;
113 |         request += `.\n\n`;
114 |     }
115 | 
116 |     // Content and structure instructions for adult content
117 |     request += `**Content, Length and Structure Instructions:**\n`;
118 |     request += `1. **Story Format:** '${storyFormat}'.\n`;
119 |     
120 |     if (storyFormat === 'single') {
121 |         request += `    * Complete Story: ~2150 tokens (~1600-1800 words).\n`;
122 |         request += `    * This should be a complete story with clear beginning, development, climax, and satisfying conclusion.\n`;
123 |         request += `    * Include full character development and resolve all plot elements.\n`;
124 |     } else {
125 |         request += `    * Episodic Chapter: ~1350 tokens (~1000-1200 words).\n`;
126 |         request += `    * This should be the first chapter of an ongoing story with an open ending.\n`;
127 |         request += `    * Leave room for future chapters and continuation of the adventure.\n`;
128 |         request += `    * Focus on establishing characters, setting, and initial erotic tension.\n`;
129 |     }
130 | 
131 |     // Additional user details (if any)
132 |     if (additionalDetails && typeof additionalDetails === 'string' && additionalDetails.trim()) {
133 |         request += `\n**Additional user instructions:**\n${additionalDetails.trim()}\n`;
134 |     }
135 | 
136 |     request += `2. **Structure Guidelines:**\n`;
137 |     if (storyFormat === 'single') {
138 |         request += `    * Clear beginning, development, climax, and satisfying conclusion\n`;
139 |         request += `    * Complete character arcs and resolution of conflicts\n`;
140 |         request += `    * Full exploration of the erotic theme and relationship dynamics\n`;
141 |     } else {
142 |         request += `    * Engaging opening that establishes setting and characters\n`;
143 |         request += `    * Build initial attraction and erotic tension\n`;
144 |         request += `    * End with anticipation and desire for continuation\n`;
145 |     }
146 |     request += `3. **Tone and Style:** Use sophisticated, sensual language that builds atmosphere and emotional connection. Create vivid scenes that engage the reader's imagination.\n`;
147 |     request += `4. **Adult Content Guidelines:** All interactions must be consensual and positive. Focus on emotional connection alongside physical attraction. Build tension and desire naturally through the narrative.\n`;
148 |     request += `5. **Character Development:** Create believable, complex characters with desires and motivations. Show their emotional journey alongside the physical story.\n`;
149 |     
150 |     const languageName = getLanguageName(language);
151 |     request += `6. **Title:** Generate an extraordinary title (memorable, evocative, intriguing). The title should follow "Sentence case" style. The title must be written in the same language selected for the story: ${languageName}.\n`;
152 | 
153 |     // JSON format instructions (unchanged)
154 |     request += `\n**Response format instructions (VERY IMPORTANT!):**\n`;
155 |     request += `* You must respond with a SINGLE JSON object.\n`;
156 |     request += `* The JSON object must have exactly two keys: "title" and "content".\n`;
157 |     request += `* The "title" key value should be a string containing ONLY the generated title (ideally 4-7 words), following the title guidelines above (${languageName} language, "Sentence case").\n`;
158 |     request += `* The "content" key value should be a string with ALL the story content, starting directly with the first sentence of the story.\n`;
159 |     request += `* Example of expected JSON format: {"title": "An extraordinary title here", "content": "Once upon a time in a distant place..."}\n`;
160 |     request += `* Do NOT include ANYTHING before the '{' character that starts the JSON object.\n`;
161 |     request += `* Do NOT include ANYTHING after the '}' character that ends the JSON object.\n`;
162 |     request += `* Ensure the JSON is valid and complete.\n`;
163 |     request += `* Do NOT use markdown or any other formatting INSIDE the JSON strings unless it's part of the natural story text.\n`;
164 | 
165 |     return request;
166 | }
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
69 |   spicynessLevel: number = 2,
70 | ): Promise<AiContinuationOptionsResponse> {
71 |   console.log(`[${functionVersion}] generateContinuationOptions for story ${story?.id}`);
72 | 
73 |   if (!story || !story.id || !story.title || !story.content || !story.options) {
74 |     throw new Error("Datos de historia inválidos/incompletos para generar opciones.");
75 |   }
76 |   if (!Array.isArray(chapters)) {
77 |     throw new Error("Datos de capítulos inválidos para generar opciones.");
78 |   }
79 | 
80 |   const prompt = createContinuationOptionsPrompt(story, chapters, language, preferences, spicynessLevel);
81 |   console.log(`[${functionVersion}] Prompt para generación de opciones (lang: ${language}):\n---\n${prompt.substring(0, 300)}...\n---`);
82 | 
83 |   let aiResponseContent: string | null = null;
84 |   try {
85 |     const chatCompletion = await openai.chat.completions.create({
86 |       model: MODEL_NAME,
87 |       messages: [{ role: "user", content: prompt }],
88 |       response_format: { type: "json_object" },
89 |       temperature: 0.7,
90 |       max_tokens: 8000, // Ajustado
91 |     });
92 | 
93 |     aiResponseContent = chatCompletion.choices[0]?.message?.content;
94 |     const finishReason = chatCompletion.choices[0]?.finish_reason;
95 | 
96 |     console.log(`[${functionVersion}] Raw AI JSON for options (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No content received)'}... Finish Reason: ${finishReason}`);
97 | 
98 |     if (finishReason === 'length') {
99 |       console.warn(`[${functionVersion}] AI option generation may have been truncated.`);
100 |     }
101 |     if (!aiResponseContent) {
102 |       throw new Error("Respuesta vacía de la IA para las opciones.");
103 |     }
104 | 
105 |     const parsedResponse = JSON.parse(aiResponseContent);
106 | 
107 |     if (isValidOptionsResponse(parsedResponse)) {
108 |       console.log(`[${functionVersion}] Opciones JSON parseadas y validadas:`, parsedResponse.options);
109 |       return parsedResponse; // Return the whole object: { options: [...] }
110 |     }
111 |     console.error(`[${functionVersion}] Formato de opciones inválido después de parsear. Data:`, parsedResponse);
112 |     throw new Error("Formato de opciones inválido después de parsear el JSON de la IA.");
113 | 
114 |   } catch (e: any) {
115 |     console.error(`[${functionVersion}] Error procesando la respuesta de la IA para las opciones: ${e.message}. Raw response: ${aiResponseContent?.substring(0, 500)}`, e);
116 |     // Fallback - Language-aware default options
117 |     const defaultOptionsMap: Record<string, string[]> = {
118 |       'es': [
119 |         "Continuar el encuentro íntimo",
120 |         "Explorar deseos más profundos", 
121 |         "Probar algo nuevo juntos"
122 |       ],
123 |       'en': [
124 |         "Continue the intimate encounter",
125 |         "Explore deeper desires",
126 |         "Try something new together"
127 |       ],
128 |       'fr': [
129 |         "Continuer la rencontre intime",
130 |         "Explorer des désirs plus profonds",
131 |         "Essayer quelque chose de nouveau ensemble"
132 |       ],
133 |       'de': [
134 |         "Die intime Begegnung fortsetzen",
135 |         "Tiefere Wünsche erforschen",
136 |         "Etwas Neues zusammen ausprobieren"
137 |       ],
138 |       'it': [
139 |         "Continuare l'incontro intimo",
140 |         "Esplorare desideri più profondi",
141 |         "Provare qualcosa di nuovo insieme"
142 |       ],
143 |       'pt': [
144 |         "Continuar o encontro íntimo",
145 |         "Explorar desejos mais profundos",
146 |         "Experimentar algo novo juntos"
147 |       ]
148 |     };
149 | 
150 |     const defaultOptionText = language.startsWith('en') ? 'default option' : 'opción por defecto';
151 |     const defaultOptions = (defaultOptionsMap[language] || defaultOptionsMap['en'])
152 |       .map(opt => ({ summary: `${opt} (${defaultOptionText})` }));
153 |     return { options: defaultOptions };
154 |   }
155 | }
156 | 
157 | // --- Helper Function: Language-aware default titles ---
158 | function getLanguageAwareDefaultChapterTitle(language: string): string {
159 |   const languageDefaults: Record<string, string> = {
160 |     'es': 'Un Nuevo Capítulo',
161 |     'en': 'A New Chapter',
162 |     'fr': 'Un Nouveau Chapitre',
163 |     'de': 'Ein Neues Kapitel',
164 |     'it': 'Un Nuovo Capitolo',
165 |     'pt': 'Um Novo Capítulo',
166 |     'ru': 'Новая глава',
167 |     'ja': '新しい章',
168 |     'ko': '새로운 장',
169 |     'zh': '新的章节'
170 |   };
171 |   return languageDefaults[language] || languageDefaults['en'];
172 | }
173 | 
174 | function getLanguageAwareDefaultContent(language: string): string {
175 |   const languageDefaults: Record<string, string> = {
176 |     'es': 'La historia continúa misteriosamente...',
177 |     'en': 'The story continues mysteriously...',
178 |     'fr': 'L\'histoire continue mystérieusement...',
179 |     'de': 'Die Geschichte geht geheimnisvoll weiter...',
180 |     'it': 'La storia continua misteriosamente...',
181 |     'pt': 'A história continua misteriosamente...',
182 |     'ru': 'История продолжается таинственно...',
183 |     'ja': '物語は謎めいて続く...',
184 |     'ko': '이야기는 신비롭게 계속된다...',
185 |     'zh': '故事神秘地继续着...'
186 |   };
187 |   return languageDefaults[language] || languageDefaults['en'];
188 | }
189 | 
190 | // cleanExtractedText: Se mantiene, ya que procesa strings provenientes de la IA (dentro del JSON).
191 | function cleanExtractedText(text: string | undefined | null, type: 'title' | 'content', language: string = 'en'): string {
192 |   const defaultText = type === 'title' ? getLanguageAwareDefaultChapterTitle(language) : getLanguageAwareDefaultContent(language);
193 |   if (text === null || text === undefined || typeof text !== 'string') { // Allow empty string from AI, will return default
194 |     console.warn(`[${functionVersion}] cleanExtractedText (${type}): Input null, undefined, or not a string.`);
195 |     return defaultText;
196 |   }
197 |   // No console.log BEFORE for potentially very long content strings.
198 |   let cleaned = text;
199 |   // Markdown fences around the *whole string* should not happen with response_format: json_object,
200 |   // but if AI puts them *inside* a JSON string value, this might be useful.
201 |   // However, the primary instruction is AI should not use markdown *inside* string values unless natural.
202 |   // cleaned = cleaned.replace(/^```(?:json|text)?\s*([\s\S]*?)\s*```$/gm, '$1').trim(); // Less likely needed now
203 | 
204 |   cleaned = cleaned.trim(); // Trim first
205 |   cleaned = cleaned.replace(/^(Título|Title|Contenido|Content|Respuesta|Response):\s*/i, '').trim();
206 |   cleaned = cleaned.replace(/^(Aquí tienes el (título|contenido|cuento|capítulo)|Claro, aquí está el (título|contenido|cuento|capítulo)):\s*/i, '').trim();
207 |   cleaned = cleaned.replace(/\n\n\(Espero que te guste.*$/i, '').trim();
208 |   cleaned = cleaned.replace(/\n\n\[.*?\]$/i, '').trim();
209 | 
210 |   if (type === 'content') {
211 |     cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
212 |     cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, '');
213 |   }
214 |   if (type === 'title') {
215 |     cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim();
216 |   }
217 |   cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
218 |   // console.log(`[${functionVersion}] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
219 |   return cleaned.trim() || defaultText; // Ensure it returns default if cleaning results in empty
220 | }
221 | // --- Fin Funciones Helper ---
222 | 
223 | serve(async (req: Request) => {
224 |   if (req.method === "OPTIONS") {
225 |     return new Response("ok", { headers: corsHeaders });
226 |   }
227 |   if (req.method !== 'POST') {
228 |     return new Response(JSON.stringify({ error: 'Método no permitido. Usar POST.' }), {
229 |       status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
230 |     });
231 |   }
232 | 
233 |   let requestedAction = 'unknown';
234 |   let userId: string | null = null;
235 | 
236 |   try {
237 |     console.log(`[${functionVersion}] Handling POST request...`);
238 |     const authHeader = req.headers.get('Authorization');
239 |     if (!authHeader || !authHeader.startsWith('Bearer ')) {
240 |       console.error("Authorization header missing or invalid.");
241 |       return new Response(JSON.stringify({ error: 'Token inválido o ausente.' }), {
242 |         status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
243 |       });
244 |     }
245 |     const token = authHeader.replace('Bearer ', '');
246 |     const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
247 |     if (authError || !user) {
248 |       console.error("Auth Error:", authError);
249 |       return new Response(JSON.stringify({ error: authError?.message || 'No autenticado.' }), {
250 |         status: authError?.status || 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
251 |       });
252 |     }
253 |     userId = user.id;
254 |     console.log(`[${functionVersion}] User Auth: ${userId}`);
255 | 
256 |     let body: any;
257 |     try {
258 |       body = await req.json();
259 |       if (!body || typeof body !== 'object') throw new Error("Parsed body is not an object.");
260 |     } catch (error: any) {
261 |       console.error(`[${functionVersion}] Failed to parse JSON body for user ${userId}. Error:`, error);
262 |       throw new Error(`Invalid/empty JSON in body: ${error.message}.`);
263 |     }
264 | 
265 |     const { action, story, chapters = [], selectedOptionSummary, userDirection } = body;
266 |     requestedAction = action || 'unknown';
267 |     const story_id = story?.id;
268 | 
269 |     const isContinuationAction = ['freeContinuation', 'optionContinuation', 'directedContinuation'].includes(action);
270 |     const requiresStoryForContext = isContinuationAction || action === 'generateOptions';
271 | 
272 |     // Validaciones de entrada (largely same as v6.1)
273 |     if (!action) throw new Error("'action' es requerida.");
274 |     if (requiresStoryForContext) {
275 |       if (!story || typeof story !== 'object' || !story_id) {
276 |         throw new Error(`Objeto 'story' (con 'id') inválido/ausente para la acción '${action}'.`);
277 |       }
278 |       // Validate story has required content and at least one character
279 |       const hasCharacterData = (story.options.characters && story.options.characters.length > 0) || story.options.character?.name;
280 |       if (!story.content || !story.options || !hasCharacterData || !story.title) {
281 |         console.error("Story validation failed:", {
282 |           hasContent: !!story.content,
283 |           hasOptions: !!story.options,
284 |           hasCharacterData: hasCharacterData,
285 |           hasTitle: !!story.title,
286 |           charactersCount: story.options.characters?.length || 0,
287 |           primaryCharacterName: story.options.characters?.[0]?.name
288 |         });
289 |         throw new Error("Datos incompletos en el objeto 'story' recibido (content, options con al menos un personaje, title son necesarios).");
290 |       }
291 |       if (!Array.isArray(chapters)) {
292 |         throw new Error(`Array 'chapters' requerido (puede ser vacío) para la acción '${action}'.`);
293 |       }
294 |     }
295 |     if (action === 'optionContinuation' && (typeof selectedOptionSummary !== 'string' || !selectedOptionSummary.trim())) {
296 |       throw new Error("'selectedOptionSummary' (string no vacío) requerido para 'optionContinuation'.");
297 |     }
298 |     if (action === 'directedContinuation' && (typeof userDirection !== 'string' || !userDirection.trim())) {
299 |       throw new Error("'userDirection' (string no vacío) requerido para 'directedContinuation'.");
300 |     }
301 | 
302 |     // Get preferences from profile instead of legacy parameters
303 |     const { data: profile } = await supabaseAdmin
304 |       .from('profiles')
305 |       .select('language, preferences')
306 |       .eq('id', userId)
307 |       .single();
308 | 
309 |     const language = profile?.language || story?.options?.language || 'en';
310 |     const preferences = profile?.preferences || null;
311 |     const storyFormat = body.storyFormat || story?.options?.format || 'episodic';
312 |     const spicynessLevel = story?.options?.spiciness_level || 2; // Extract from story options, default to 2
313 | 
314 |     // Límites (largely same logic as v6.1)
315 |     if (isContinuationAction) {
316 |       const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('subscription_status').eq('id', userId).maybeSingle();
317 |       if (profileError) throw new Error("Error al verificar el perfil de usuario para límites.");
318 | 
319 |       const isPremium = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
320 |       if (!isPremium) {
321 |         const { count: chapterCount, error: countError } = await supabaseAdmin.from('story_chapters')
322 |           .select('*', { count: 'exact', head: true })
323 |           .eq('story_id', story_id);
324 |         if (countError) throw new Error("Error al verificar límites de continuación.");
325 | 
326 |         const FREE_CHAPTER_LIMIT = 2; // Límite de capítulos *adicionales* generables (no se si el capitulo 0 lo cuenta)
327 |         if (chapterCount !== null && chapterCount >= FREE_CHAPTER_LIMIT) {
328 |           return new Response(JSON.stringify({ error: 'Límite de continuaciones gratuitas alcanzado.' }), {
329 |             status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
330 |           });
331 |         }
332 |       }
333 |     }
334 | 
335 |     // --- Ejecutar Acción Principal ---
336 |     let responsePayload: any = {}; // Use 'any' for flexibility, or a union type
337 |     console.log(`[${functionVersion}] Executing action: ${action} for user ${userId}, story ${story_id || 'N/A'}`);
338 | 
339 |     if (action === 'generateOptions') {
340 |       const optionsResponse = await generateContinuationOptions(story as Story, chapters as Chapter[], language, preferences, spicynessLevel);
341 |       responsePayload = optionsResponse; // This is already { options: [...] }
342 |     } else if (isContinuationAction) {
343 |       const continuationContext: ContinuationContextType = {};
344 |       if (action === 'optionContinuation') continuationContext.optionSummary = selectedOptionSummary;
345 |       if (action === 'directedContinuation') continuationContext.userDirection = userDirection;
346 | 
347 |       const continuationPrompt = createContinuationPrompt(
348 |         action as 'freeContinuation' | 'optionContinuation' | 'directedContinuation',
349 |         story as Story,
350 |         chapters as Chapter[],
351 |         continuationContext,
352 |         language,
353 |         preferences,
354 |         storyFormat,
355 |         spicynessLevel
356 |       );
357 | 
358 |       console.log(`[${functionVersion}] Calling AI for continuation. Prompt start: ${continuationPrompt.substring(0, 200)}...`);
359 | 
360 |       const chatCompletion = await openai.chat.completions.create({
361 |         model: MODEL_NAME,
362 |         messages: [{ role: "user", content: continuationPrompt }],
363 |         response_format: { type: "json_object" },
364 |         temperature: 0.8,
365 |         top_p: 0.95,
366 |         max_tokens: 8000 // Ajustado
367 |       });
368 | 
369 |       const aiResponseContent = chatCompletion.choices[0]?.message?.content;
370 |       const finishReason = chatCompletion.choices[0]?.finish_reason;
371 |       console.log(`[${functionVersion}] Raw AI JSON for continuation (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No content received)'}... Finish Reason: ${finishReason}`);
372 | 
373 |       if (finishReason === 'content_filter') {
374 |         console.error(`[${functionVersion}] AI Continuation Generation BLOCKED due to content filter.`);
375 |         throw new Error(`Generación de continuación bloqueada por seguridad: filtro de contenido.`);
376 |       }
377 |       if (finishReason === 'length') {
378 |         console.warn(`[${functionVersion}] AI continuation generation may have been truncated.`);
379 |       }
380 |       if (!aiResponseContent) {
381 |         throw new Error("Fallo al generar continuación: Respuesta IA vacía (sin bloqueo explícito).");
382 |       }
383 | 
384 |       let finalTitle = getLanguageAwareDefaultChapterTitle(language); // Language-aware default
385 |       let finalContent = '';
386 |       let parsedSuccessfully = false;
387 | 
388 |       try {
389 |         const parsedResponse = JSON.parse(aiResponseContent);
390 |         if (isValidContinuationResponse(parsedResponse)) {
391 |           finalTitle = cleanExtractedText(parsedResponse.title, 'title', language);
392 |           finalContent = cleanExtractedText(parsedResponse.content, 'content', language);
393 |           parsedSuccessfully = true;
394 |           console.log(`[${functionVersion}] Parsed AI continuation JSON successfully.`);
395 |         } else {
396 |           console.warn(`[${functionVersion}] AI continuation response JSON structure invalid. Data:`, parsedResponse);
397 |         }
398 |       } catch (parseError: any) {
399 |         console.error(`[${functionVersion}] Failed to parse JSON from AI continuation response. Error: ${parseError.message}. Raw: ${aiResponseContent.substring(0, 300)}`);
400 |       }
401 | 
402 |       if (!parsedSuccessfully) {
403 |         console.warn(`[${functionVersion}] Using fallback for continuation: Default title, full raw response as content (if available).`);
404 |         finalContent = cleanExtractedText(aiResponseContent, 'content', language); // aiResponseContent might be the non-JSON string
405 |       }
406 | 
407 |       if (!finalContent) { // If content is still empty after parsing/fallback and cleaning
408 |         console.error(`[${functionVersion}] Critical error: Final continuation content is empty after all processing.`);
409 |         const errorDefaults: Record<string, string> = {
410 |           'es': 'La historia no pudo continuar esta vez. Intenta con otra opción o una nueva dirección.',
411 |           'en': 'The story couldn\'t continue this time. Try another option or a new direction.',
412 |           'fr': 'L\'histoire n\'a pas pu continuer cette fois. Essayez une autre option ou une nouvelle direction.',
413 |           'de': 'Die Geschichte konnte diesmal nicht fortgesetzt werden. Versuchen Sie eine andere Option oder eine neue Richtung.',
414 |           'it': 'La storia non è riuscita a continuare questa volta. Prova un\'altra opzione o una nuova direzione.',
415 |           'pt': 'A história não pôde continuar desta vez. Tente outra opção ou uma nova direção.',
416 |           'ru': 'История не смогла продолжиться на этот раз. Попробуйте другой вариант или новое направление.',
417 |           'ja': '今回は物語を続けることができませんでした。別の選択肢や新しい方向を試してみてください。',
418 |           'ko': '이번에는 이야기를 계속할 수 없었습니다. 다른 옵션이나 새로운 방향을 시도해보세요.',
419 |           'zh': '这次无法继续故事。尝试其他选择或新的方向。'
420 |         };
421 |         finalContent = errorDefaults[language] || errorDefaults['en'];
422 |         // Optionally throw, but providing a message might be better UX for continuations
423 |       }
424 | 
425 |       console.log(`[${functionVersion}] Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);
426 |       responsePayload = { content: finalContent, title: finalTitle };
427 | 
428 |     } else {
429 |       throw new Error(`Acción no soportada: ${action}`);
430 |     }
431 | 
432 |     console.log(`[${functionVersion}] Action ${action} completed successfully for ${userId}.`);
433 |     return new Response(JSON.stringify(responsePayload), {
434 |       status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
435 |     });
436 | 
437 |   } catch (error: any) {
438 |     console.error(`Error in ${functionVersion} (User: ${userId || 'UNKNOWN'}, Action: ${requestedAction}):`, error.message, error.stack);
439 |     let statusCode = 500;
440 |     const lowerMessage = error.message.toLowerCase();
441 | 
442 |     if (lowerMessage.includes("token inválido") || lowerMessage.includes("no autenticado")) statusCode = 401;
443 |     else if (lowerMessage.includes("límite de continuaciones")) statusCode = 403;
444 |     else if (lowerMessage.includes("json in body") || lowerMessage.includes("inválido/ausente") || lowerMessage.includes("requerido")) statusCode = 400;
445 |     else if (lowerMessage.includes("bloqueada por seguridad") || lowerMessage.includes("respuesta ia vacía") || lowerMessage.includes("filtro de contenido")) statusCode = 502;
446 |     else if (lowerMessage.includes("acción no soportada")) statusCode = 400;
447 | 
448 |     return new Response(JSON.stringify({ error: `Error procesando solicitud (${requestedAction}): ${error.message}` }), {
449 |       status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
450 |     });
451 |   }
452 | });
```

supabase/functions/story-continuation/prompt.ts
```
1 | // supabase/edge-functions/story-continuation/prompt.ts
2 | // v8.0 (Adult Content + Preferences): Prompts para la continuación de historias adultas.
3 | // Ahora incluye el contenido COMPLETO de los capítulos anteriores en el contexto.
4 | 
5 | // Language mapping function to convert language codes to explicit language names
6 | function getLanguageName(languageCode: string): string {
7 |     const languageMap: Record<string, string> = {
8 |         'es': 'Spanish',
9 |         'en': 'English',
10 |         'fr': 'French',
11 |         'de': 'German',
12 |         'it': 'Italian',
13 |         'pt': 'Portuguese',
14 |         'ru': 'Russian',
15 |         'ja': 'Japanese',
16 |         'ko': 'Korean',
17 |         'zh': 'Chinese'
18 |     };
19 |     
20 |     return languageMap[languageCode] || 'English';
21 | }
22 | 
23 | // --- Tipos (asumidos/definidos según el uso en index.ts) ---
24 | export interface CharacterOptions {
25 |     name: string;
26 |     gender: 'male' | 'female' | 'non-binary';
27 |     description: string;
28 | }
29 | 
30 | export interface StoryOptions {
31 |     characters: CharacterOptions[];   // Unified: array de personajes (1-4)
32 |     genre: string;
33 |     format?: string; // 'single', 'episodic'
34 |     language?: string;
35 | }
36 | 
37 | export interface Story {
38 |     id: string;
39 |     title: string; // Título general de la historia
40 |     content: string; // Contenido del capítulo inicial (o la historia base si no hay capítulos)
41 |     options: StoryOptions;
42 | }
43 | 
44 | export interface Chapter {
45 |     id: string;
46 |     chapter_number: number;
47 |     title: string;
48 |     content: string;
49 | }
50 | 
51 | export interface ContinuationContextType {
52 |     optionSummary?: string;
53 |     userDirection?: string;
54 | }
55 | 
56 | // --- Funciones de Prompt ---
57 | 
58 | /**
59 |  * Crea el prompt para generar opciones de continuación para contenido adulto.
60 |  * Ahora incluye el contenido completo de la historia y capítulos anteriores.
61 |  */
62 | export function createContinuationOptionsPrompt(
63 |     story: Story,
64 |     chapters: Chapter[],
65 |     language: string = 'en',
66 |     preferences: string | null = null,
67 |     spicynessLevel: number = 2,
68 | ): string {
69 |     const functionVersion = "v8.0 (Adult Content + Preferences)";
70 |     console.log(`[Prompt Helper ${functionVersion}] createContinuationOptionsPrompt for story ID: ${story.id}, lang: ${language}, spiciness: ${spicynessLevel}`);
71 | 
72 |     const languageName = getLanguageName(language);
73 |     let prompt = `You are a creative assistant expert in generating interesting and coherent continuations for erotic stories for adults.
74 |   Primary Story Language: ${languageName}. Target Audience: Adults (18+).`;
75 | 
76 |     // Add spiciness level specific guidelines
77 |     if (spicynessLevel === 1) {
78 |         prompt += ` CONTENT INTENSITY: SENSUAL (Level 1) - Generate continuation options that maintain suggestive and implicit content. Focus on elegant, emotional connections, subtle tension, and anticipation rather than explicit descriptions.`;
79 |     } else if (spicynessLevel === 2) {
80 |         prompt += ` CONTENT INTENSITY: PASSIONATE (Level 2) - Generate continuation options that include explicit but balanced sexual content. Options should suggest clear intimate scenarios while maintaining elegance and emotional connection.`;
81 |     } else if (spicynessLevel === 3) {
82 |         prompt += ` CONTENT INTENSITY: INTENSE (Level 3) - Generate continuation options that embrace very explicit and graphic sexual content. Options should suggest detailed, direct, and provocative scenarios while maintaining consent and positivity.`;
83 |     }
84 | 
85 |     if (preferences && preferences.trim()) {
86 |         prompt += `\nConsider the user's preferences when suggesting continuations: "${preferences.trim()}". Incorporate these elements naturally and appropriately.`;
87 |     }
88 | 
89 |     prompt += `\n\n--- COMPLETE STORY CONTEXT SO FAR ---`;
90 |     prompt += `\n\n**Original Story (General Title: "${story.title}")**`;
91 |     
92 |     // Character handling (unchanged)
93 |     const characters = story.options.characters || [];
94 |     
95 |     if (characters.length > 1) {
96 |         prompt += `\nMain Characters (${characters.length}): `;
97 |         characters.forEach((char, index) => {
98 |             prompt += `${index + 1}. ${char.name}`;
99 |             prompt += ` (${char.gender}, ${char.description})`;
100 |             if (index < characters.length - 1) prompt += ', ';
101 |         });
102 |         prompt += `.`;
103 |     } else if (characters.length === 1) {
104 |         prompt += `\nMain Character: ${characters[0].name} (${characters[0].gender}, ${characters[0].description}).`;
105 |     }
106 |     
107 |     prompt += `\n\n**Story Beginning:**\n${story.content}\n`;
108 | 
109 |     if (chapters && chapters.length > 0) {
110 |         prompt += `\n\n**Previous Chapters:**`;
111 |         chapters.forEach((chap) => {
112 |             prompt += `\n\n**Chapter ${chap.chapter_number}: "${chap.title}"**\n${chap.content}\n`;
113 |         });
114 |     }
115 |     prompt += `\n--- END OF COMPLETE CONTEXT ---\n`;
116 | 
117 |     prompt += `\n\nBased on the current state of the story (considering ALL the context provided above), generate 3 concise and attractive options to continue the erotic story. Each option should be a brief summary (10-20 words) of a possible next step in the adult adventure.`;
118 |     prompt += `\nThe options should be varied, offering different paths or approaches for continuation that maintain the erotic/romantic tension.`;
119 |     prompt += `\nEnsure the options explore clearly distinct themes or actions (for example: one option about exploring a new location, another about the introduction of a new character or element, and another about deepening intimacy or trying something new).`;
120 |     prompt += `\nThey must be written in ${languageName}.`;
121 | 
122 |     // JSON format instructions (unchanged)
123 |     prompt += `\n\n**Response format instructions (VERY IMPORTANT!):**`;
124 |     prompt += `\n* You must respond with a SINGLE JSON object.`;
125 |     prompt += `\n* The JSON object must have a single key called "options".`;
126 |     prompt += `\n* The value of the "options" key must be an array (list) of exactly 3 objects.`;
127 |     prompt += `\n* Each object within the "options" array must have a single key called "summary".`;
128 |     prompt += `\n* The value of the "summary" key should be a text string with the continuation option summary (10-20 words in ${languageName}).`;
129 |     prompt += `\n* Example of expected JSON format:`;
130 |     prompt += `\n{`;
131 |     prompt += `\n  "options": [`;
132 |     prompt += `\n    { "summary": "The character decides to explore the mysterious bedroom." },`;
133 |     prompt += `\n    { "summary": "A new romantic interest appears unexpectedly." },`;
134 |     prompt += `\n    { "summary": "The character remembers a secret fantasy to explore." }`;
135 |     prompt += `\n  ]`;
136 |     prompt += `\n}`;
137 |     prompt += `\n* Do NOT include ANYTHING before the '{' character that starts the JSON object.`;
138 |     prompt += `\n* Do NOT include ANYTHING after the '}' character that ends the JSON object.`;
139 |     prompt += `\n* Ensure the JSON is valid and complete.`;
140 | 
141 |     return prompt;
142 | }
143 | 
144 | /**
145 |  * Crea el prompt para generar la continuación de un capítulo para contenido adulto.
146 |  * Ahora incluye el contenido completo de la historia y capítulos anteriores.
147 |  */
148 | export function createContinuationPrompt(
149 |     action: 'freeContinuation' | 'optionContinuation' | 'directedContinuation',
150 |     story: Story,
151 |     chapters: Chapter[],
152 |     context: ContinuationContextType,
153 |     language: string = 'en',
154 |     preferences: string | null = null,
155 |     storyFormat: string = 'episodic',
156 |     spicynessLevel: number = 2
157 | ): string {
158 |     const functionVersion = "v8.0 (Adult Content + Preferences)";
159 |     console.log(`[Prompt Helper ${functionVersion}] createContinuationPrompt for story ID: ${story.id}, action: ${action}, lang: ${language}, spiciness: ${spicynessLevel}`);
160 | 
161 |     const languageName = getLanguageName(language);
162 |     let prompt = `You are an expert writer continuing erotic stories for adults.
163 |   Write always in ${languageName}, with sophisticated and sensual language appropriate for mature audiences (18+).
164 |   The original story has a genre of '${story.options.genre}'.`;
165 | 
166 |     // Add spiciness level specific guidelines
167 |     if (spicynessLevel === 1) {
168 |         prompt += ` CONTENT INTENSITY: SENSUAL (Level 1) - Continue with suggestive and implicit content. Use elegant, metaphorical language that builds tension through emotional connection, subtle touches, and anticipation. Focus on romance and desire rather than explicit descriptions.`;
169 |     } else if (spicynessLevel === 2) {
170 |         prompt += ` CONTENT INTENSITY: PASSIONATE (Level 2) - Continue with explicit but balanced sexual content. Include clear descriptions of intimate acts without excessive graphic detail. Use sensual and direct but elegant language, focusing on emotions and physical sensations.`;
171 |     } else if (spicynessLevel === 3) {
172 |         prompt += ` CONTENT INTENSITY: INTENSE (Level 3) - Continue with very explicit and graphic sexual content. Include detailed descriptions of sexual acts, positions, and physical sensations. Use direct and provocative language with high sexual intensity while maintaining consent and positivity.`;
173 |     }
174 | 
175 |     // Chapter length guidance based on story format
176 |     prompt += `\n\n**Chapter length guide based on story format:**`;
177 |     if (storyFormat === 'single') {
178 |         prompt += `\n* Complete Story: ~2150 tokens (approx. 1600-1800 words).`;
179 |         prompt += `\n* This should conclude the story with a satisfying ending.`;
180 |     } else {
181 |         prompt += `\n* Episodic Chapter: ~1350 tokens (approx. 1000-1200 words).`;
182 |         prompt += `\n* This should continue the story with room for future chapters.`;
183 |     }
184 |     prompt += `\nThese figures are approximate and serve as reference for the expected length.`;
185 | 
186 |     if (preferences && preferences.trim()) {
187 |         prompt += `\nIncorporate the user's preferences naturally into the continuation: "${preferences.trim()}". Ensure all content remains consensual and positive while exploring these interests.`;
188 |         prompt += ` Guidelines for preferences:\n`;
189 |         prompt += `   - **Natural Integration:** Weave preferences into the plot organically\n`;
190 |         prompt += `   - **Consensual Content:** All interactions must be consensual and positive\n`;
191 |         prompt += `   - **Character Consistency:** Maintain character personalities while exploring preferences\n`;
192 |         prompt += `   - **Quality Storytelling:** Prioritize good narrative flow over just including elements\n`;
193 |     }
194 | 
195 |     // Complete context (unchanged structure, but content focus is now adult)
196 |     prompt += `\n\n--- COMPLETE STORY CONTEXT SO FAR ---`;
197 |     prompt += `\n\n**Original Story (General Title: "${story.title}")**`;
198 |     
199 |     const characters = story.options.characters || [];
200 |     
201 |     if (characters.length > 1) {
202 |         prompt += `\nMain Characters (${characters.length}): `;
203 |         characters.forEach((char, index) => {
204 |             prompt += `${index + 1}. ${char.name}`;
205 |             prompt += `, Gender: ${char.gender}`;
206 |             prompt += `, Description: ${char.description}`;
207 |             if (index < characters.length - 1) prompt += '; ';
208 |         });
209 |         prompt += `.`;
210 |         
211 |         prompt += `\n\n**IMPORTANT for multiple characters:** In this chapter, ensure all characters maintain their consistency and that each has relevant participation according to the story development and their established relationships.`;
212 |     } else if (characters.length === 1) {
213 |         const char = characters[0];
214 |         prompt += `\nMain Character: ${char.name}`;
215 |         prompt += `, Gender: ${char.gender}`;
216 |         prompt += `, Description: ${char.description}`;
217 |         prompt += `.`;
218 |     }
219 |     
220 |     prompt += `\n\n**Story Beginning:**\n${story.content}\n`;
221 | 
222 |     if (chapters && chapters.length > 0) {
223 |         prompt += `\n\n**Previous Chapters:**`;
224 |         chapters.forEach((chap) => {
225 |             prompt += `\n\n**Chapter ${chap.chapter_number}: "${chap.title}"**\n${chap.content}\n`;
226 |         });
227 |     }
228 |     prompt += `\n--- END OF COMPLETE CONTEXT ---\n`;
229 | 
230 |     prompt += `\n\n--- YOUR TASK ---`;
231 |     prompt += `\nConsidering ALL the context provided above, write the NEXT CHAPTER of this adult story.`;
232 | 
233 |     if (action === 'optionContinuation' && context.optionSummary) {
234 |         prompt += `\nThe continuation should be based on the following option chosen by the user: "${context.optionSummary}"`;
235 |     } else if (action === 'directedContinuation' && context.userDirection) {
236 |         prompt += `\nThe continuation should follow this specific direction provided by the user: "${context.userDirection}"`;
237 |     } else {
238 |         prompt += `\nContinue the story freely and creatively, maintaining coherence with previous events and characters.`;
239 |     }
240 | 
241 |     prompt += `\n\nGuides for the New Chapter:`;
242 |     prompt += `\n1. **Chapter Content:** Aim for '${storyFormat}' format.`;
243 |     if (storyFormat === 'single') {
244 |         prompt += ` (approximately 1600-1800 words) - Complete the story with a satisfying conclusion.`;
245 |     } else {
246 |         prompt += ` (approximately 1000-1200 words) - Continue the story with room for future development.`;
247 |     }
248 | 
249 |     prompt += `\n2. **Chapter Structure:** Should have clear narrative flow, connecting with the previous chapter and advancing the overall plot. Can introduce new erotic elements or deepen existing relationships.`;
250 |     prompt += `\n3. **Tone and Style:** Maintain the tone and style of the original story. Use sophisticated, sensual language that creates atmosphere and emotional connection. Build tension and desire naturally.`;
251 |     prompt += `\n4. **Coherence:** Ensure characters behave consistently and that new events fit logically in the story while maintaining the erotic tension.`;
252 |     prompt += `\n5. **Chapter Title:** Generate a brief, attractive and relevant title for the content of this new chapter. Must be in ${languageName} and in "Sentence case".`;
253 |     prompt += `\n6. **Adult Content:** All interactions must be consensual and positive. Focus on emotional connection alongside physical attraction. Create engaging, erotic content that celebrates adult sexuality healthily.`;
254 | 
255 |     // JSON format instructions (unchanged)
256 |     prompt += `\n\n**Response format instructions (VERY IMPORTANT!):**`;
257 |     prompt += `\n* You must respond with a SINGLE JSON object.`;
258 |     prompt += `\n* The JSON object must have exactly two keys: "title" and "content".`;
259 |     prompt += `\n* The "title" key value should be a text string containing ONLY the generated title for this new chapter, following the guidelines in point 5 of the "Guides for the New Chapter".`;
260 |     prompt += `\n* The "content" key value should be a text string with ALL the content of this new chapter, starting directly with the first sentence.`;
261 |     const exampleCharacterName = characters.length > 0 ? characters[0].name : 'the protagonist';
262 |     prompt += `\n* Example of expected JSON format: {"title": "The Unexpected Encounter", "content": "The next morning, ${exampleCharacterName} woke up feeling a strange energy in the air..."}`;
263 |     prompt += `\n* Do NOT include ANYTHING before the '{' character that starts the JSON object.`;
264 |     prompt += `\n* Do NOT include ANYTHING after the '}' character that ends the JSON object.`;
265 |     prompt += `\n* Ensure the JSON is valid and complete.`;
266 |     prompt += `\n* Do NOT use markdown or any other formatting INSIDE the JSON strings unless it's part of the natural story text.`;
267 | 
268 |     return prompt;
269 | }
```

supabase/functions/stripe-webhook/index.ts
```
1 | // supabase/functions/stripe-webhook/index.ts
2 | 
3 | import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
4 | import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
5 | import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno';
6 | // Asegúrate que la ruta es correcta para tu estructura
7 | import { corsHeaders } from '../_shared/cors.ts'; // Ajusta si moviste cors.ts
8 | 
9 | // --- Constantes y Configuración ---
10 | console.log(`[WEBHOOK_DEBUG] Stripe Webhook Function Initializing...`);
11 | 
12 | const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
13 | const STRIPE_SIGNING_SECRET = Deno.env.get('STRIPE_SIGNING_SECRET');
14 | const APP_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // O el nombre que uses
15 | const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
16 | 
17 | if (!STRIPE_SECRET_KEY || !STRIPE_SIGNING_SECRET || !SUPABASE_URL || !APP_SERVICE_ROLE_KEY) {
18 |   console.error('[WEBHOOK_ERROR] CRITICAL: Missing environment variables. Check STRIPE_SECRET_KEY, STRIPE_SIGNING_SECRET, SUPABASE_SERVICE_ROLE_KEY.');
19 |   // Considera lanzar un error
20 | }
21 | 
22 | const stripe = new Stripe(STRIPE_SECRET_KEY!, {
23 |   apiVersion: '2023-10-16',
24 |   httpClient: Stripe.createFetchHttpClient(),
25 | });
26 | 
27 | const cryptoProvider = Stripe.createSubtleCryptoProvider();
28 | 
29 | const supabaseAdmin = createClient(SUPABASE_URL!, APP_SERVICE_ROLE_KEY!);
30 | 
31 | console.log('[WEBHOOK_DEBUG] Stripe Webhook Function Initialized successfully.');
32 | 
33 | // --- Lógica Principal del Servidor ---
34 | serve(async (req: Request) => {
35 |   if (req.method === 'OPTIONS') {
36 |     console.log('[WEBHOOK_DEBUG] Handling OPTIONS preflight request');
37 |     return new Response('ok', { headers: corsHeaders });
38 |   }
39 | 
40 |   const signature = req.headers.get('Stripe-Signature');
41 |   if (!signature) {
42 |     console.error('[WEBHOOK_ERROR] FAIL: Missing Stripe-Signature header');
43 |     return new Response('Missing Stripe-Signature header', { status: 400 });
44 |   }
45 | 
46 |   const body = await req.text();
47 | 
48 |   try {
49 |     // 1. Verifica la firma
50 |     console.log('[WEBHOOK_DEBUG] Verifying webhook signature...');
51 |     const event = await stripe.webhooks.constructEventAsync(
52 |       body,
53 |       signature,
54 |       STRIPE_SIGNING_SECRET!,
55 |       undefined,
56 |       cryptoProvider
57 |     );
58 |     console.log(`[WEBHOOK_INFO] Webhook event received: ${event.id}, Type: ${event.type}`);
59 | 
60 |     // 2. Maneja el evento
61 |     const eventObject = event.data.object as any;
62 |     let supabaseUserId: string | null = null;
63 |     let stripeCustomerId: string | null = null;
64 | 
65 |     // --- Inicio: Lógica robusta para identificar al usuario ---
66 |     console.log('[WEBHOOK_DEBUG] Attempting to identify user...');
67 |     if (eventObject.customer) {
68 |       stripeCustomerId = eventObject.customer;
69 |       console.log(`[WEBHOOK_DEBUG] Found stripeCustomerId from event object: ${stripeCustomerId}`);
70 |     }
71 | 
72 |     if (eventObject.metadata?.supabase_user_id) {
73 |       supabaseUserId = eventObject.metadata.supabase_user_id;
74 |       console.log(`[WEBHOOK_DEBUG] Found supabaseUserId from event metadata: ${supabaseUserId}`);
75 |     }
76 |     else if (stripeCustomerId) {
77 |       console.log(`[WEBHOOK_DEBUG] supabaseUserId not in event metadata, trying customer metadata for ${stripeCustomerId}...`);
78 |       try {
79 |         const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
80 |         if (!customer.deleted && customer.metadata?.supabase_user_id) {
81 |           supabaseUserId = customer.metadata.supabase_user_id;
82 |           console.log(`[WEBHOOK_DEBUG] Found supabaseUserId from customer metadata: ${supabaseUserId}`);
83 |         } else {
84 |           console.log(`[WEBHOOK_DEBUG] supabase_user_id not found in customer metadata or customer deleted.`);
85 |         }
86 |       } catch (customerError) { console.warn(`[WEBHOOK_WARN] Error retrieving customer ${stripeCustomerId}:`, customerError.message); }
87 |     }
88 | 
89 |     if (!supabaseUserId && stripeCustomerId) {
90 |       console.log(`[WEBHOOK_DEBUG] supabaseUserId not found yet, querying profiles table for customer ${stripeCustomerId}...`);
91 |       try {
92 |         const { data: profile, error: profileError } = await supabaseAdmin
93 |           .from('profiles').select('id').eq('stripe_customer_id', stripeCustomerId).single();
94 |         if (profileError && profileError.code !== 'PGRST116') { // Ignore 'not found' error, log others
95 |           console.error(`[WEBHOOK_ERROR] DB error querying profiles for ${stripeCustomerId}:`, profileError);
96 |         } else if (profile) {
97 |           supabaseUserId = profile.id;
98 |           console.log(`[WEBHOOK_DEBUG] Found supabaseUserId ${supabaseUserId} from profiles table.`);
99 |         } else {
100 |           console.log(`[WEBHOOK_DEBUG] Profile not found for stripe_customer_id ${stripeCustomerId}.`);
101 |         }
102 |       } catch (dbError) {
103 |         console.error(`[WEBHOOK_ERROR] Exception querying profiles table for customer ${stripeCustomerId}:`, dbError.message);
104 |       }
105 |     }
106 | 
107 |     if (!supabaseUserId && !['customer.subscription.deleted', 'customer.deleted'].includes(event.type)) {
108 |       console.error(`[WEBHOOK_ERROR] CRITICAL FAIL: Could not determine supabase_user_id for event ${event.id} (Type: ${event.type}). Customer: ${stripeCustomerId}. Cannot process update.`);
109 |       return new Response(JSON.stringify({ received: true, error: 'Webhook Error: User identification failed.' }), { status: 200 });
110 |     } else if (supabaseUserId) {
111 |       console.log(`[WEBHOOK_DEBUG] User identified successfully: supabaseUserId=${supabaseUserId}`);
112 |     } else {
113 |       console.log(`[WEBHOOK_DEBUG] Proceeding without supabaseUserId (likely a customer deletion event).`);
114 |     }
115 |     // --- Fin: Lógica robusta para identificar al usuario ---
116 | 
117 |     // --- Manejadores de Eventos Específicos ---
118 |     switch (event.type) {
119 | 
120 |       case 'checkout.session.completed': {
121 |         const session = eventObject as Stripe.Checkout.Session;
122 |         console.log(`[WEBHOOK_INFO] Processing checkout.session.completed for session ${session.id}, Mode: ${session.mode}`);
123 | 
124 |         // --- Suscripción Iniciada ---
125 |         if (session.mode === 'subscription') {
126 |           if (!supabaseUserId) throw new Error(`[WEBHOOK_ERROR] Cannot process subscription checkout ${session.id}: missing supabase_user_id.`);
127 | 
128 |           const subscriptionId = session.subscription as string;
129 |           console.log(`[WEBHOOK_DEBUG] Retrieving subscription ${subscriptionId}`);
130 |           const subscription = await stripe.subscriptions.retrieve(subscriptionId);
131 |           // const planId = subscription.items.data[0]?.price.id; // Descomenta si necesitas
132 |           const status = subscription.status;
133 |           const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
134 | 
135 |           console.log(`[WEBHOOK_INFO] Updating profile for new subscription ${subscription.id} for user ${supabaseUserId}`);
136 |           const { error } = await supabaseAdmin
137 |             .from('profiles')
138 |             .update({
139 |               stripe_subscription_id: subscription.id,
140 |               subscription_status: status,
141 |               stripe_customer_id: stripeCustomerId, // Asegurar que esté guardado/actualizado
142 |               current_period_end: currentPeriodEnd.toISOString(),
143 |               monthly_voice_generations_used: 0, // Resetear contador de uso
144 |             })
145 |             .eq('id', supabaseUserId);
146 | 
147 |           if (error) {
148 |             console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for subscription ${subscription.id}:`, error);
149 |             throw error; // Relanza para el catch general
150 |           } else {
151 |             console.log(`[WEBHOOK_INFO] OK: Profile updated for new subscription ${subscription.id}.`);
152 |           }
153 | 
154 |           // --- Compra Única (Créditos) - CÓDIGO CORREGIDO + DEBUGGING ---
155 |         } else if (session.mode === 'payment') {
156 |           console.log(`[WEBHOOK_DEBUG] Handling checkout.session.completed for one-time payment: ${session.id}`);
157 | 
158 |           const paymentIntentId = session.payment_intent as string;
159 |           if (!paymentIntentId) {
160 |             console.error(`[WEBHOOK_ERROR] FAIL: Payment Intent ID missing in session ${session.id} for mode=payment.`);
161 |             return new Response(JSON.stringify({ received: true, error: 'Missing payment intent ID' }), { status: 200 });
162 |           }
163 |           console.log(`[WEBHOOK_DEBUG] Found PaymentIntent ID from session: ${paymentIntentId}`);
164 | 
165 |           let paymentIntent: Stripe.PaymentIntent;
166 |           try {
167 |             console.log(`[WEBHOOK_DEBUG] Retrieving PaymentIntent ${paymentIntentId}...`);
168 |             paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
169 |             console.log(`[WEBHOOK_DEBUG] Retrieved PaymentIntent ${paymentIntent.id}. Status: ${paymentIntent.status}`);
170 |           } catch (piError) {
171 |             console.error(`[WEBHOOK_ERROR] FAIL: Could not retrieve PaymentIntent ${paymentIntentId}:`, piError);
172 |             return new Response(JSON.stringify({ received: true, error: 'Failed to retrieve payment intent' }), { status: 200 });
173 |           }
174 | 
175 |           // !! LEER METADATA DEL PAYMENT INTENT RECUPERADO !!
176 |           const piMetadata = paymentIntent.metadata; // Objeto metadata completo
177 |           const itemPurchased = piMetadata?.item_purchased;
178 |           const userIdFromMetadata = piMetadata?.supabase_user_id;
179 | 
180 |           // -------- AÑADIR ESTOS LOGS --------
181 |           console.log(`[WEBHOOK_DEBUG] Retrieved PaymentIntent Metadata: ${JSON.stringify(piMetadata)}`);
182 |           console.log(`[WEBHOOK_DEBUG] Value read for itemPurchased: "${itemPurchased}" (Type: ${typeof itemPurchased})`);
183 |           // -----------------------------------
184 | 
185 |           // Re-verificar supabaseUserId si no se obtuvo antes
186 |           if (!supabaseUserId && userIdFromMetadata) {
187 |             supabaseUserId = userIdFromMetadata;
188 |             console.log(`[WEBHOOK_DEBUG] supabaseUserId updated from PaymentIntent metadata: ${supabaseUserId}`);
189 |           }
190 | 
191 |           if (!supabaseUserId) {
192 |             console.error(`[WEBHOOK_ERROR] FAIL: Cannot process payment intent ${paymentIntent.id}: missing supabase_user_id after all checks.`);
193 |             return new Response(JSON.stringify({ received: true, error: 'User identification failed for payment' }), { status: 200 });
194 |           }
195 | 
196 |           // Comparar con la cadena EXACTA 'voice_credits'
197 |           if (itemPurchased === 'voice_credits') {
198 |             console.log(`[WEBHOOK_DEBUG] Condition 'itemPurchased === "voice_credits"' is TRUE.`);
199 | 
200 |             if (paymentIntent.status !== 'succeeded') {
201 |               console.warn(`[WEBHOOK_WARN] PaymentIntent ${paymentIntent.id} status is ${paymentIntent.status}, not 'succeeded'. Skipping credit increment.`);
202 |               return new Response(JSON.stringify({ received: true, status: 'payment_not_succeeded' }), { status: 200 });
203 |             }
204 | 
205 |             // ¡¡¡ VERIFICA ESTE NÚMERO !!!
206 |             const creditsToAdd = 20; // Ejemplo: 20 créditos
207 |             console.log(`[WEBHOOK_INFO] Attempting to add ${creditsToAdd} voice credits to user ${supabaseUserId} via RPC.`);
208 | 
209 |             const { error: creditError } = await supabaseAdmin.rpc('increment_voice_credits', {
210 |               user_uuid: supabaseUserId,
211 |               credits_to_add: creditsToAdd
212 |             });
213 | 
214 |             if (creditError) {
215 |               console.error(`[WEBHOOK_ERROR] FAIL: Error adding voice credits via RPC for user ${supabaseUserId} from PI ${paymentIntent.id}:`, creditError);
216 |               return new Response(JSON.stringify({ received: true, error: 'Failed to update credits in DB' }), { status: 200 });
217 |             } else {
218 |               console.log(`[WEBHOOK_INFO] OK: Added ${creditsToAdd} voice credits via RPC for user ${supabaseUserId} from PI ${paymentIntent.id}.`);
219 |             }
220 |           } else {
221 |             // Este log ahora nos dirá por qué falló la comparación
222 |             console.log(`[WEBHOOK_INFO] Condition 'itemPurchased === "voice_credits"' is FALSE. Actual value: "${itemPurchased}". No credits added.`);
223 |           }
224 |         }
225 |         break;
226 |       } // Fin case 'checkout.session.completed'
227 | 
228 |       case 'invoice.paid': {
229 |         const invoice = eventObject as Stripe.Invoice;
230 |         console.log(`[WEBHOOK_INFO] Processing invoice.paid for invoice ${invoice.id}, Billing Reason: ${invoice.billing_reason}`);
231 |         if (!supabaseUserId) throw new Error(`[WEBHOOK_ERROR] Cannot process invoice ${invoice.id}: missing supabase_user_id.`);
232 | 
233 |         if (invoice.paid && invoice.subscription && invoice.billing_reason === 'subscription_cycle') { // Procesar solo renovaciones aquí
234 |           const subscriptionId = invoice.subscription as string;
235 |           console.log(`[WEBHOOK_DEBUG] Retrieving subscription ${subscriptionId} for renewal.`);
236 |           const subscription = await stripe.subscriptions.retrieve(subscriptionId);
237 |           const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
238 | 
239 |           console.log(`[WEBHOOK_INFO] Resetting monthly usage for user ${supabaseUserId} due to subscription renewal.`);
240 |           const { error } = await supabaseAdmin
241 |             .from('profiles')
242 |             .update({
243 |               subscription_status: subscription.status,
244 |               current_period_end: currentPeriodEnd.toISOString(),
245 |               monthly_voice_generations_used: 0, // Resetear uso mensual
246 |             })
247 |             .eq('id', supabaseUserId);
248 | 
249 |           if (error) {
250 |             console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for invoice.paid ${invoice.id}:`, error);
251 |             throw error;
252 |           } else {
253 |             console.log(`[WEBHOOK_INFO] OK: Profile updated (monthly usage reset) for invoice.paid ${invoice.id} (User: ${supabaseUserId}).`);
254 |           }
255 |         } else {
256 |           console.log(`[WEBHOOK_INFO] Invoice ${invoice.id} paid, but not a subscription renewal or already handled.`);
257 |         }
258 |         break;
259 |       } // Fin case 'invoice.paid'
260 | 
261 |       case 'customer.subscription.updated': {
262 |         const subscription = eventObject as Stripe.Subscription;
263 |         console.log(`[WEBHOOK_INFO] Processing customer.subscription.updated for subscription ${subscription.id}, Status: ${subscription.status}`);
264 |         if (!supabaseUserId) throw new Error(`[WEBHOOK_ERROR] Cannot process subscription update ${subscription.id}: missing supabase_user_id.`);
265 | 
266 |         const status = subscription.status;
267 |         const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
268 | 
269 |         const updatePayload: { [key: string]: any } = {
270 |           subscription_status: status,
271 |           current_period_end: currentPeriodEnd.toISOString(),
272 |         };
273 | 
274 |         if (subscription.cancel_at_period_end) {
275 |           console.log(`[WEBHOOK_INFO] Subscription ${subscription.id} scheduled for cancellation at period end.`);
276 |         }
277 | 
278 |         console.log(`[WEBHOOK_INFO] Updating profile for customer.subscription.updated ${subscription.id}`);
279 |         const { error } = await supabaseAdmin
280 |           .from('profiles')
281 |           .update(updatePayload)
282 |           .eq('id', supabaseUserId);
283 | 
284 |         if (error) {
285 |           console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for customer.subscription.updated ${subscription.id}:`, error);
286 |           throw error;
287 |         } else {
288 |           console.log(`[WEBHOOK_INFO] OK: Profile updated for customer.subscription.updated ${subscription.id}.`);
289 |         }
290 |         break;
291 |       } // Fin case 'customer.subscription.updated'
292 | 
293 |       case 'customer.subscription.deleted': {
294 |         const subscription = eventObject as Stripe.Subscription;
295 |         console.log(`[WEBHOOK_INFO] Processing customer.subscription.deleted for subscription ${subscription.id}`);
296 | 
297 |         if (!stripeCustomerId) throw new Error(`[WEBHOOK_ERROR] Cannot process subscription delete ${subscription.id}: missing stripe_customer_id.`);
298 | 
299 |         console.log(`[WEBHOOK_INFO] Updating profile for customer.subscription.deleted using customer ID ${stripeCustomerId}`);
300 |         const { error } = await supabaseAdmin
301 |           .from('profiles')
302 |           .update({
303 |             stripe_subscription_id: null,
304 |             subscription_status: 'canceled',
305 |             current_period_end: null,
306 |             monthly_voice_generations_used: 0,
307 |             // voice_credits: 0, // Comentado para conservar créditos comprados
308 |           })
309 |           .eq('stripe_customer_id', stripeCustomerId);
310 | 
311 |         if (error) {
312 |           console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for customer.subscription.deleted ${subscription.id}:`, error);
313 |         } else {
314 |           console.log(`[WEBHOOK_INFO] OK: Profile updated for customer.subscription.deleted ${subscription.id}.`);
315 |         }
316 |         break;
317 |       } // Fin case 'customer.subscription.deleted'
318 | 
319 |       default:
320 |         console.log(`[WEBHOOK_INFO] Unhandled event type: ${event.type}. ID: ${event.id}`);
321 |     }
322 | 
323 |     // 3. Responde a Stripe
324 |     console.log(`[WEBHOOK_INFO] Webhook processed successfully for event: ${event.id}`);
325 |     return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
326 | 
327 |   } catch (err) {
328 |     console.error('[WEBHOOK_ERROR] FATAL: Webhook handler error:', err);
329 |     const isSignatureError = err.type === 'StripeSignatureVerificationError';
330 |     const status = isSignatureError ? 400 : 500;
331 |     return new Response(`Webhook Error: ${err.message}`, { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
332 |   }
333 | });
```

supabase/functions/tts/index.ts
```
1 | import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
2 | 
3 | const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN");
4 | if (!HF_API_TOKEN) throw new Error("HF_API_TOKEN not set");
5 | 
6 | serve(async (req) => {
7 |   if (req.method !== "POST")
8 |     return new Response("Method Not Allowed", { status: 405 });
9 | 
10 |   const { text = "", voice = "ef_dora", speed = 1.0, split_pattern } =
11 |     await req.json();
12 |   if (!text.trim())
13 |     return new Response("'text' required", { status: 400 });
14 | 
15 |   const body = {
16 |     inputs: text,
17 |     parameters: { voice, speed, ...(split_pattern && { split_pattern }) },
18 |   };
19 | 
20 |   const res = await fetch(
21 |     "https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M",
22 |     {
23 |       method: "POST",
24 |       headers: {
25 |         Authorization: `Bearer ${HF_API_TOKEN}`,
26 |         "Content-Type": "application/json",
27 |       },
28 |       body: JSON.stringify(body),
29 |     },
30 |   );
31 | 
32 |   if (!res.ok) {
33 |     return new Response(await res.text(), { status: res.status });
34 |   }
35 | 
36 |   const wav = await res.arrayBuffer();
37 |   return new Response(wav, {
38 |     headers: { "Content-Type": "audio/wav" },
39 |   });
40 | });
```

supabase/functions/upload-chapter-audio/index.ts
```
1 | import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
2 | import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
3 | import { corsHeaders } from '../_shared/cors.ts'; // Asegúrate que la ruta sea correcta
4 | 
5 | // Tipado para los datos de la base de datos (opcional pero recomendado)
6 | interface ChapterAudioFile {
7 |   id?: string;
8 |   chapter_id: string;
9 |   user_id: string;
10 |   story_id: string;
11 |   voice_id: string;
12 |   storage_path: string;
13 |   public_url: string;
14 |   metadata?: Record<string, any>;
15 |   created_at?: string;
16 | }
17 | 
18 | serve(async (req: Request) => {
19 |   // Manejo de CORS preflight request
20 |   if (req.method === 'OPTIONS') {
21 |     return new Response('ok', { headers: corsHeaders });
22 |   }
23 | 
24 |   try {
25 |     const supabaseUrl = Deno.env.get('SUPABASE_URL');
26 |     const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
27 | 
28 |     if (!supabaseUrl || !supabaseServiceKey) {
29 |       console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
30 |       return new Response(JSON.stringify({ error: 'Variables de entorno del servidor no configuradas.' }), {
31 |         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
32 |         status: 500,
33 |       });
34 |     }
35 | 
36 |     const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
37 |     const formData = await req.formData();
38 | 
39 |     const chapterId = formData.get('chapterId') as string;
40 |     const voiceId = formData.get('voiceId') as string;
41 |     const audioFile = formData.get('audioFile') as File;
42 |     const userId = formData.get('userId') as string;
43 |     const storyId = formData.get('storyId') as string; // Añadido para la ruta de almacenamiento
44 | 
45 |     if (!chapterId || !voiceId || !audioFile || !storyId) {
46 |       return new Response(JSON.stringify({ error: 'Faltan parámetros: storyId, chapterId, voiceId o audioFile' }), {
47 |         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
48 |         status: 400,
49 |       });
50 |     }
51 | 
52 |     const bucketName = 'narrations'; 
53 |     // Estructura de ruta mejorada: bucket/storyId/chapterId/voiceId.mp3
54 |     const filePath = `${storyId}/${chapterId}/${voiceId}.mp3`; 
55 | 
56 |     console.log(`Subiendo archivo a: ${bucketName}/${filePath}`);
57 | 
58 |     const { data: uploadData, error: uploadError } = await supabaseClient.storage
59 |       .from(bucketName)
60 |       .upload(filePath, audioFile, {
61 |         cacheControl: '3600',
62 |         upsert: true, 
63 |         contentType: 'audio/mpeg',
64 |       });
65 | 
66 |     if (uploadError) {
67 |       console.error('Error subiendo a Storage:', uploadError);
68 |       // Si el error es 'Duplicate', significa que el archivo ya existe y upsert=true debería haberlo manejado.
69 |       // Podría ser un problema de permisos o configuración del bucket si no es 'Duplicate'.
70 |       // Para el caso específico de "The resource already exists" (cuando upsert=true),
71 |       // podemos considerar que el archivo ya está y continuar para obtener su URL.
72 |       if (uploadError.message !== 'The resource already exists') {
73 |          throw uploadError;
74 |       }
75 |       console.warn(`El archivo en ${filePath} ya existía. Se intentará obtener su URL pública.`);
76 |     }
77 | 
78 |     const { data: publicUrlData } = supabaseClient.storage
79 |       .from(bucketName)
80 |       .getPublicUrl(filePath);
81 | 
82 |     if (!publicUrlData || !publicUrlData.publicUrl) {
83 |       console.error('Error obteniendo URL pública para:', filePath);
84 |       throw new Error('No se pudo obtener la URL pública del archivo.');
85 |     }
86 |     const publicUrl = publicUrlData.publicUrl;
87 |     console.log('URL Pública obtenida:', publicUrl);
88 | 
89 |     const chapterAudioInsert: Omit<ChapterAudioFile, 'id' | 'created_at'> = {
90 |       chapter_id: chapterId,
91 |       story_id: storyId,
92 |       user_id: userId,
93 |       voice_id: voiceId,
94 |       storage_path: filePath, // Guardamos la ruta relativa al bucket
95 |       public_url: publicUrl,
96 |       // metadata: { fileSize: audioFile.size } // Opcional
97 |     };
98 | 
99 |     const { data: dbData, error: dbError } = await supabaseClient
100 |       .from('audio_files')
101 |       .upsert(chapterAudioInsert, {
102 |         onConflict: 'chapter_id, voice_id, user_id',
103 |         // ignoreDuplicates: false, // Queremos que actualice si hay conflicto
104 |       })
105 |       .select()
106 |       .single();
107 | 
108 |     if (dbError) {
109 |       console.error('Error guardando en base de datos:', dbError);
110 |       throw dbError;
111 |     }
112 |     console.log('Registro en DB:', dbData);
113 | 
114 |     return new Response(JSON.stringify({ publicUrl, chapterAudioFile: dbData }), {
115 |       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
116 |       status: 200,
117 |     });
118 | 
119 |   } catch (error) {
120 |     console.error('Error en Edge Function (upload-chapter-audio):', error);
121 |     return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
122 |       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
123 |       status: 500,
124 |     });
125 |   }
126 | });
```

supabase/functions/upload-story-image/index.ts
```
1 | import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
2 | import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
3 | 
4 | const corsHeaders = {
5 |   'Access-Control-Allow-Origin': '*',
6 |   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
7 | }
8 | 
9 | interface UploadImageRequest {
10 |   imageUrl?: string;  // Para URLs de OpenAI (método antiguo)
11 |   imageBase64?: string; // Para datos base64 del nuevo método
12 |   imageType: string;
13 |   storyId: string;
14 |   chapterId: string;
15 | }
16 | 
17 | /**
18 |  * Edge Function to upload story images to Supabase storage
19 |  * Path structure: images-stories/storyId/chapterId/imageType.jpeg
20 |  */
21 | serve(async (req: Request) => {
22 |   // Handle CORS preflight requests
23 |   if (req.method === 'OPTIONS') {
24 |     return new Response('ok', { headers: corsHeaders })
25 |   }
26 | 
27 |   try {
28 |     console.log('[UPLOAD_STORY_IMAGE] Starting image upload process...');
29 | 
30 |     // Get request data
31 |     const { imageUrl, imageBase64, imageType, storyId, chapterId }: UploadImageRequest = await req.json();
32 | 
33 |     // Validate required fields
34 |     if ((!imageUrl && !imageBase64) || !imageType || !storyId || !chapterId) {
35 |       console.error('[UPLOAD_STORY_IMAGE] Missing required fields:', { 
36 |         imageUrl: !!imageUrl, 
37 |         imageBase64: !!imageBase64, 
38 |         imageType, 
39 |         storyId, 
40 |         chapterId 
41 |       });
42 |       return new Response(
43 |         JSON.stringify({ error: 'Missing required fields: (imageUrl or imageBase64), imageType, storyId, chapterId' }),
44 |         { status: 400, headers: corsHeaders }
45 |       );
46 |     }
47 | 
48 |     // Validate imageType
49 |     const validImageTypes = ['cover', 'scene_1', 'scene_2'];
50 |     if (!validImageTypes.includes(imageType)) {
51 |       console.error('[UPLOAD_STORY_IMAGE] Invalid image type:', imageType);
52 |       return new Response(
53 |         JSON.stringify({ error: `Invalid imageType. Must be one of: ${validImageTypes.join(', ')}` }),
54 |         { status: 400, headers: corsHeaders }
55 |       );
56 |     }
57 | 
58 |     console.log(`[UPLOAD_STORY_IMAGE] Processing ${imageType} for story ${storyId}, chapter ${chapterId}`);
59 | 
60 |     // Create Supabase admin client
61 |     const supabaseAdmin = createClient(
62 |       Deno.env.get('SUPABASE_URL') ?? '',
63 |       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
64 |     );
65 | 
66 |     // Process image data (either from URL or base64)
67 |     let imageBuffer: ArrayBuffer;
68 |     
69 |     if (imageBase64) {
70 |       console.log('[UPLOAD_STORY_IMAGE] Processing base64 image data...');
71 |       // Convert base64 to buffer
72 |       const binaryString = atob(imageBase64);
73 |       const bytes = new Uint8Array(binaryString.length);
74 |       for (let i = 0; i < binaryString.length; i++) {
75 |         bytes[i] = binaryString.charCodeAt(i);
76 |       }
77 |       imageBuffer = bytes.buffer;
78 |       console.log(`[UPLOAD_STORY_IMAGE] Processed base64 image: ${imageBuffer.byteLength} bytes`);
79 |     } else if (imageUrl) {
80 |       console.log('[UPLOAD_STORY_IMAGE] Downloading image from URL...');
81 |       const imageResponse = await fetch(imageUrl);
82 |       
83 |       if (!imageResponse.ok) {
84 |         throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
85 |       }
86 | 
87 |       const imageBlob = await imageResponse.blob();
88 |       imageBuffer = await imageBlob.arrayBuffer();
89 |       console.log(`[UPLOAD_STORY_IMAGE] Downloaded image: ${imageBuffer.byteLength} bytes`);
90 |     } else {
91 |       throw new Error('No image data provided');
92 |     }
93 | 
94 |     // Define storage path: images-stories/storyId/chapterId/imageType.jpeg
95 |     const storagePath = `${storyId}/${chapterId}/${imageType}.jpeg`;
96 |     console.log(`[UPLOAD_STORY_IMAGE] Uploading to path: ${storagePath}`);
97 | 
98 |     // Upload to Supabase Storage
99 |     const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
100 |       .from('images-stories')
101 |       .upload(storagePath, imageBuffer, {
102 |         contentType: 'image/jpeg',
103 |         upsert: true, // Overwrite if exists
104 |       });
105 | 
106 |     if (uploadError) {
107 |       console.error('[UPLOAD_STORY_IMAGE] Upload error:', uploadError);
108 |       throw new Error(`Storage upload failed: ${uploadError.message}`);
109 |     }
110 | 
111 |     console.log('[UPLOAD_STORY_IMAGE] Upload successful:', uploadData);
112 | 
113 |     // Get public URL
114 |     const { data: urlData } = supabaseAdmin.storage
115 |       .from('images-stories')
116 |       .getPublicUrl(storagePath);
117 | 
118 |     const publicUrl = urlData.publicUrl;
119 |     console.log(`[UPLOAD_STORY_IMAGE] Public URL generated: ${publicUrl}`);
120 | 
121 |     // Return success response
122 |     return new Response(
123 |       JSON.stringify({
124 |         success: true,
125 |         publicUrl: publicUrl,
126 |         path: storagePath,
127 |         imageType: imageType,
128 |         storyId: storyId,
129 |         chapterId: chapterId
130 |       }),
131 |       {
132 |         status: 200,
133 |         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
134 |       }
135 |     );
136 | 
137 |   } catch (error) {
138 |     console.error('[UPLOAD_STORY_IMAGE] Error:', error);
139 |     
140 |     return new Response(
141 |       JSON.stringify({
142 |         error: 'Failed to upload story image',
143 |         details: error instanceof Error ? error.message : 'Unknown error'
144 |       }),
145 |       {
146 |         status: 500,
147 |         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
148 |       }
149 |     );
150 |   }
151 | }) 
```
