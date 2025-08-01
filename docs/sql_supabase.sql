-- =============================================================================
-- || DATABASE MIGRATION SCRIPT FOR FANTASIA (ADULT VERSION)                ||
-- ||                                                                         ||
-- || This script transforms the database schema from the children's version  ||
-- || to the new adult content platform.                                      ||
-- ||                                                                         ||
-- || Execute this script in your Supabase SQL Editor.                        ||
-- || It is highly recommended to perform a backup before execution.          ||
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: CLEANUP OF OBSOLETE TABLES
-- We remove tables related to "challenges", which no longer exist.
-- =============================================================================

DROP TABLE IF EXISTS public.challenge_questions;
DROP TABLE IF EXISTS public.challenges;


-- =============================================================================
-- STEP 2: CREATION OF CUSTOM DATA TYPES (ENUMS)
-- We define fixed data types to ensure data consistency.
-- =============================================================================

-- Gender options for characters.
DO $$ BEGIN
    CREATE TYPE public.gender_options AS ENUM ('male', 'female', 'non-binary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Story format: single story or episodic.
DO $$ BEGIN
    CREATE TYPE public.story_format AS ENUM ('single', 'episodic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- =============================================================================
-- STEP 3: TABLE DEFINITIONS
-- We recreate and/or alter tables to fit the new data model.
-- =============================================================================

-- 'profiles' table: Updated to reflect adult preferences.
DROP TABLE IF EXISTS public.profiles;
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    language text NOT NULL,
    preferences text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    stripe_customer_id text NULL,
    subscription_status text NULL,
    voice_credits integer NOT NULL DEFAULT 0,
    current_period_end timestamp with time zone NULL,
    monthly_stories_generated integer NOT NULL DEFAULT 0,
    subscription_id text NULL,
    plan_id text NULL,
    period_start_date timestamp with time zone NULL,
    monthly_voice_generations_used integer NULL DEFAULT 0,
    has_completed_setup boolean NOT NULL DEFAULT false,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_stripe_customer_id_key UNIQUE (stripe_customer_id),
    CONSTRAINT profiles_subscription_id_key UNIQUE (subscription_id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences and tastes for story generation (e.g., kinks, fetishes).';

-- 'characters' table: Completely simplified for the new scope.
DROP TABLE IF EXISTS public.characters;
CREATE TABLE public.characters (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    gender public.gender_options NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT characters_pkey PRIMARY KEY (id),
    CONSTRAINT characters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.characters IS 'Stores user-created characters for stories. Simplified for adult content.';

-- 'stories' table: Adapted to the new story options.
DROP TABLE IF EXISTS public.stories;
CREATE TABLE public.stories (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    audio_url text NULL,
    genre text NULL, -- Kept as text to allow for custom user-defined genres.
    story_format public.story_format NOT NULL DEFAULT 'single'::public.story_format,
    cover_image_url text NULL, -- For future use with image generation.
    character_id uuid NULL,
    characters_data jsonb NULL, -- Complete array of characters used in the story (1-4 characters). Stores full character objects including preset character data.
    additional_details text NULL, -- For the final optional customization prompt.
    spiciness_level integer NOT NULL DEFAULT 2, -- Adult content intensity level (1=Sensual, 2=Passionate, 3=Intense)
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT stories_pkey PRIMARY KEY (id),
    CONSTRAINT stories_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT stories_spiciness_level_check CHECK (spiciness_level >= 1 AND spiciness_level <= 3)
);
COMMENT ON COLUMN public.stories.story_format IS 'Indicates if the story is a single one-off or episodic with chapters.';
COMMENT ON COLUMN public.stories.genre IS 'Story genre. Can be a preset (e.g., Erotic Romance) or a custom user value.';
COMMENT ON COLUMN public.stories.cover_image_url IS 'URL for the story''s cover image. Functionality disabled for now but schema is ready.';
COMMENT ON COLUMN public.stories.characters_data IS 'Complete array of characters used in the story (1-4 characters). Stores full character objects including preset character data.';


-- Tables with no structural changes (recreated for a clean script) --
DROP TABLE IF EXISTS public.story_chapters;
CREATE TABLE public.story_chapters (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    story_id uuid NOT NULL,
    chapter_number integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    generation_method text NULL,
    custom_input text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT story_chapters_pkey PRIMARY KEY (id),
    CONSTRAINT story_chapters_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS public.audio_files;
CREATE TABLE public.audio_files (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    story_id uuid NULL,
    chapter_id uuid NULL,
    voice_id text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT audio_files_pkey PRIMARY KEY (id),
    CONSTRAINT audio_files_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES story_chapters(id) ON DELETE CASCADE,
    CONSTRAINT audio_files_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    CONSTRAINT audio_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS public.preset_suggestions;
CREATE TABLE public.preset_suggestions (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    text_prompt text NOT NULL,
    category text NULL,
    language_code character varying(5) NOT NULL DEFAULT 'en'::character varying,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT preset_suggestions_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE public.preset_suggestions IS 'Stores preset prompts for story generation (e.g., scenarios, settings). To be populated later.';


DROP TABLE IF EXISTS public.user_voices;
CREATE TABLE public.user_voices (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    voice_id text NOT NULL,
    is_current boolean NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_voices_pkey PRIMARY KEY (id),
    CONSTRAINT user_voices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);


-- =============================================================================
-- STEP 3.5: CREATE PERFORMANCE INDEXES
-- =============================================================================

-- GIN index for efficient JSONB queries on characters_data field
CREATE INDEX IF NOT EXISTS idx_stories_characters_data_gin 
ON public.stories USING GIN (characters_data);

-- =============================================================================
-- STEP 4: ENABLE AND CONFIGURE ROW LEVEL SECURITY (RLS)
-- Security first: we ensure that each user can only see and modify their own data.
-- =============================================================================

-- Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preset_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies for 'profiles'
DROP POLICY IF EXISTS "Users can manage their own profile." ON public.profiles;
CREATE POLICY "Users can manage their own profile."
    ON public.profiles FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policies for 'characters'
DROP POLICY IF EXISTS "Users can manage their own characters." ON public.characters;
CREATE POLICY "Users can manage their own characters."
    ON public.characters FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for 'stories'
DROP POLICY IF EXISTS "Users can manage their own stories." ON public.stories;
CREATE POLICY "Users can manage their own stories."
    ON public.stories FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for 'story_chapters' (Access via parent story)
DROP POLICY IF EXISTS "Users can manage chapters for their own stories." ON public.story_chapters;
CREATE POLICY "Users can manage chapters for their own stories."
    ON public.story_chapters FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT stories.user_id FROM public.stories WHERE stories.id = story_chapters.story_id))
    WITH CHECK (auth.uid() IN (SELECT stories.user_id FROM public.stories WHERE stories.id = story_chapters.story_id));

-- Policies for 'audio_files'
DROP POLICY IF EXISTS "Users can manage their own audio files." ON public.audio_files;
CREATE POLICY "Users can manage their own audio files."
    ON public.audio_files FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for 'user_voices'
DROP POLICY IF EXISTS "Users can manage their own voice settings." ON public.user_voices;
CREATE POLICY "Users can manage their own voice settings."
    ON public.user_voices FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for 'preset_suggestions' (Read-only access for users)
DROP POLICY IF EXISTS "Authenticated users can read active presets." ON public.preset_suggestions;
CREATE POLICY "Authenticated users can read active presets."
    ON public.preset_suggestions FOR SELECT
    TO authenticated
    USING (is_active = true);


COMMIT;


-- =============================================================================
-- ||                 FINAL SQL FUNCTIONS FOR FANTASIA                        ||
-- =============================================================================

-- Function to decrement voice credits when an audio is generated
CREATE OR REPLACE FUNCTION public.decrement_voice_credits(user_uuid uuid)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE updated_credits INTEGER;
BEGIN
  UPDATE public.profiles SET voice_credits = voice_credits - 1
  WHERE id = user_uuid AND voice_credits > 0
  RETURNING voice_credits INTO updated_credits;
  RETURN COALESCE(updated_credits, -1);
END;
$$;

-- Trigger function to create a profile for a new user
-- UPDATED: Default language is now 'en'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, language, has_completed_setup)
  VALUES (new.id, 'en', false);
  RETURN new;
END;
$$;

-- Function to increment the monthly voice generation usage counter
CREATE OR REPLACE FUNCTION public.increment_monthly_voice_usage(user_uuid uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_voice_generations_used = COALESCE(monthly_voice_generations_used, 0) + 1
  WHERE id = user_uuid;
END;
$$;

-- Function to increment the monthly story generation usage counter
CREATE OR REPLACE FUNCTION public.increment_story_count(user_uuid uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_stories_generated = COALESCE(monthly_stories_generated, 0) + 1
  WHERE id = user_uuid;
END;
$$;

-- Function to add voice credits to a user (e.g., after a purchase)
CREATE OR REPLACE FUNCTION public.increment_voice_credits(user_uuid uuid, credits_to_add integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET voice_credits = COALESCE(voice_credits, 0) + credits_to_add
  WHERE id = user_uuid;
END;
$$;

-- Scheduled function to reset usage counters for non-premium users
CREATE OR REPLACE FUNCTION public.reset_monthly_counters()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_stories_generated = 0
  WHERE (subscription_status IS NULL OR subscription_status NOT IN ('active', 'trialing'))
    AND monthly_stories_generated > 0;
  RAISE LOG 'Monthly story counters for free users have been reset.';
END;
$$;

-- Generic trigger function to automatically update the 'updated_at' timestamp on modification
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;

-- =============================================================================
-- ||                             TRIGGERS                                  ||
-- =============================================================================

-- Crear trigger para auto-generar perfiles en el registro de nuevos usuarios
CREATE TRIGGER trigger_create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para actualizar timestamps automáticamente en 'updated_at'
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER trigger_characters_updated_at
    BEFORE UPDATE ON public.characters
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER trigger_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER trigger_story_chapters_updated_at
    BEFORE UPDATE ON public.story_chapters
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER trigger_user_voices_updated_at
    BEFORE UPDATE ON public.user_voices
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


-- =============================================================================
-- ||                      CHARACTERS_DATA USAGE EXAMPLES                      ||
-- =============================================================================

-- IMPORTANT: The characters_data field was added via separate migration script.
-- It stores complete character arrays for stories with multiple characters (1-4).

-- Example 1: Insert a story with multiple characters
-- INSERT INTO stories (user_id, title, content, characters_data, character_id, genre, story_format)
-- VALUES (
--     'user-uuid-here',
--     'My Story',
--     'Story content...',
--     '[
--         {"id": "char-1", "name": "Alice", "gender": "female", "description": "Beautiful", "is_preset": false},
--         {"id": "char-2", "name": "Valentina", "gender": "female", "description": "Sultry influencer", "is_preset": true}
--     ]'::jsonb,
--     'char-1',  -- Primary character for compatibility (NULL for preset-only stories)
--     'Romance',
--     'single'
-- );

-- Example 2: Query stories by character name
-- SELECT * FROM stories 
-- WHERE characters_data @> '[{"name": "Valentina"}]';

-- Example 3: Query stories with preset characters
-- SELECT * FROM stories 
-- WHERE characters_data @> '[{"is_preset": true}]';

-- Example 4: Count characters in story
-- SELECT title, jsonb_array_length(characters_data) as character_count
-- FROM stories 
-- WHERE characters_data IS NOT NULL;

-- Example 5: Find stories with specific character combinations
-- SELECT title, characters_data
-- FROM stories 
-- WHERE characters_data @> '[{"name": "Akira"}]' 
--   AND characters_data @> '[{"name": "Elena"}]';


-- =============================================================================
-- ||                                END OF SCRIPT                              ||
-- =============================================================================