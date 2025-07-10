-- =============================================================================
-- || PRESET CHARACTERS SEED FILE FOR FANTASIA (ADULT VERSION)               ||
-- ||                                                                         ||
-- || This script creates a separate table for preset characters that will    ||
-- || be available to all users without requiring a user_id.                 ||
-- ||                                                                         ||
-- || Execute this script in your Supabase SQL Editor after the main         ||
-- || migration script (sql_supabase.sql).                                   ||
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: CREATE PRESET CHARACTERS TABLE
-- =============================================================================

-- Create preset_characters table (similar to characters but without user_id)
DROP TABLE IF EXISTS public.preset_characters;
CREATE TABLE public.preset_characters (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    gender public.gender_options NOT NULL,
    description text NOT NULL,
    image_url text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT preset_characters_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.preset_characters IS 'Stores preset characters available to all users for story generation.';

-- Enable RLS (though not strictly necessary for preset characters)
ALTER TABLE public.preset_characters ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read preset characters
DROP POLICY IF EXISTS "All authenticated users can read preset characters." ON public.preset_characters;
CREATE POLICY "All authenticated users can read preset characters."
    ON public.preset_characters FOR SELECT
    TO authenticated
    USING (true);

-- =============================================================================
-- STEP 2: INSERT PRESET CHARACTERS
-- =============================================================================

-- Insert the 6 preset characters with structured descriptions for better AI understanding

-- 1. VALENTINA (Madison Beer inspired - Sultry Influencer)
INSERT INTO public.preset_characters (name, gender, description, image_url) VALUES (
    'Valentina',
    'female',
    'Physical: 24-year-old social media influencer with striking features, long silky dark hair, piercing brown eyes, full lips with a knowing smile, and a perfectly sculpted curvy body. Personality: Magnetic, bold, confident, and playful with a mischievous streak. Knows her attractiveness and uses it strategically. Interests: Fashion, luxury lifestyle, photography, expensive lingerie, and being the center of attention. Style: Speaks with a sultry, confident voice using playful innuendos and flirtatious banter. Sexual: Adventurous, enjoys being desired, loves the thrill of seduction, and craves intimate connections beyond superficial encounters. Background: Instagram-perfect lifestyle that hides a deeply sensual nature seeking authentic passion.',
    '/images/characters/preset/valentina.png'
);

-- 2. SCARLETT (Sydney Sweeney inspired - Actress with Hidden Desires)
INSERT INTO public.preset_characters (name, gender, description, image_url) VALUES (
    'Scarlett',
    'female',
    'Physical: 25-year-old actress with natural blonde hair, captivating blue eyes, and a curvy figure that balances innocence with sensuality. Personality: Charming, approachable, sweet girl-next-door exterior with a surprisingly passionate and adventurous spirit. Interests: Method acting, wine tasting, exploring different roles both on and off screen. Style: Speaks with a warm, genuine voice that can shift from innocent to seductive instantly. Sexual: Curious about power dynamics, enjoys roleplaying scenarios, drawn to confident partners who match her intelligence. Background: Public innocence masks private passion, creating an irresistible duality that makes her incredibly alluring.',
    '/images/characters/preset/scarlett.png'
);

-- 3. AKIRA (Otaku/Anime - Nerdy but Sensual)
INSERT INTO public.preset_characters (name, gender, description, image_url) VALUES (
    'Akira',
    'female',
    'Physical: 23-year-old anime enthusiast with short, stylishly messy black hair with colorful highlights, expressive dark eyes behind fashionable glasses, and a petite but surprisingly sensual figure usually hidden under oversized hoodies. Personality: Introverted but incredibly passionate about her interests, shy innocence mixed with hidden kink inspired by anime. Interests: Manga, cosplay (especially revealing outfits), gaming, Japanese culture, and fantasy-themed lingerie collection. Style: Speaks with intelligent, slightly nerdy cadence that becomes breathless when discussing interests or desires. Sexual: Curious about submission and dominance dynamics, enjoys roleplay scenarios from favorite series, gets aroused by intellectual connections. Background: Knowledge of erotic manga gives her sophisticated understanding of pleasure and fantasy despite shy exterior.',
    '/images/characters/preset/akira.png'
);

-- 4. ELENA (Elegant Professional - Sophisticated Fantasies)
INSERT INTO public.preset_characters (name, gender, description, image_url) VALUES (
    'Elena',
    'female',
    'Physical: 28-year-old successful businesswoman with shoulder-length auburn hair always impeccably styled, piercing green eyes, and a tall elegant figure in tailored suits that hint at curves beneath. Personality: Highly intelligent, driven, composed in public but harbors deep fantasies about relinquishing control. Interests: Fine wine, classical music, high-end fashion, and the art of sophisticated seduction. Style: Speaks with authority and sophistication, smooth and commanding voice that becomes husky with desire. Sexual: Drawn to power exchange dynamics, elaborate fantasies about being dominated by intellectual equals, experienced but selective with partners. Background: Polished professional exterior conceals a woman who fantasizes about losing herself completely in passion with someone who can match her intellect.',
    '/images/characters/preset/elena.png'
);

-- 5. DANTE (Athletic Bad Boy - Dominant yet Tender)
INSERT INTO public.preset_characters (name, gender, description, image_url) VALUES (
    'Dante',
    'male',
    'Physical: 26-year-old former college athlete with muscular, well-defined physique, dark hair, intense brown eyes, and carefully chosen tattoos that tell stories of his rebellious past. Personality: Dominant and alpha with surprising moments of tenderness and vulnerability, confident and magnetic. Interests: Motorcycles, rock climbing, pushing physical and sexual limits, and intense experiences. Style: Speaks with a deep, confident voice carrying a hint of danger and raw magnetism. Sexual: Naturally dominant in the bedroom, enjoys taking control but incredibly attentive to partner needs, skilled at being both rough and gentle as situations demand. Background: Tough exterior hides a man who craves deep, intense connections and shows his softer side to the right person.',
    '/images/characters/preset/dante.png'
);

-- 6. ADRIAN (Intellectual Charmer - Sophisticated Passion)
INSERT INTO public.preset_characters (name, gender, description, image_url) VALUES (
    'Adrian',
    'male',
    'Physical: 29-year-old intellectual with perfectly styled dark hair, thoughtful hazel eyes, and a lean but well-maintained physique that speaks of refined taste, with elegant and skilled hands. Personality: Sophisticated, charming, engaging in deep conversations while maintaining sexual tension, believes in mental connections. Interests: Poetry, classical music, fine dining, art of seduction, and building anticipation through intellectual foreplay. Style: Speaks with eloquence and wit, smooth cultured voice with subtle accent hinting at international education. Sexual: Experienced in slow seduction, takes pride in pleasing mind and body, approaches intimacy as art to be savored and perfected. Background: Treats each encounter as a masterpiece, combining passionate intensity with reverent appreciation for the art of sophisticated pleasure.',
    '/images/characters/preset/adrian.png'
);

-- =============================================================================
-- STEP 3: CREATE UPDATE TRIGGER FOR PRESET CHARACTERS
-- =============================================================================

-- Create trigger to automatically update the 'updated_at' timestamp
CREATE TRIGGER trigger_preset_characters_updated_at
    BEFORE UPDATE ON public.preset_characters
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

COMMIT;

-- =============================================================================
-- || IMPLEMENTATION NOTES                                                    ||
-- =============================================================================

-- TO USE THESE PRESET CHARACTERS IN YOUR FRONTEND:
-- 1. Query both user characters and preset characters:
--    SELECT * FROM characters WHERE user_id = auth.uid()
--    UNION ALL
--    SELECT id, null as user_id, name, gender, description, created_at, updated_at FROM preset_characters
--
-- 2. In your React components, differentiate between user and preset characters:
--    const isPresetCharacter = character.user_id === null;
--
-- 3. When user selects a preset character, you can either:
--    a) Use it directly in story generation without saving to characters table
--    b) Create a copy in the user's characters table for future customization
--
-- 4. Consider adding a "preset_id" field to the characters table if you want to
--    track when users create customized versions of preset characters

-- =============================================================================
-- || END OF SCRIPT                                                          ||
-- =============================================================================