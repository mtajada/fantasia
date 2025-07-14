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

-- 'usage_events' table: Tracks user behavior and analytics events
DROP TABLE IF EXISTS public.usage_events;
CREATE TABLE public.usage_events (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    event_type text NOT NULL,
    event_data jsonb NULL,
    metadata jsonb NULL,
    source text NULL, -- Component or page where event originated
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT usage_events_pkey PRIMARY KEY (id),
    CONSTRAINT usage_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.usage_events IS 'Stores analytics events for tracking user behavior, limit reaches, and conversion tracking.';
COMMENT ON COLUMN public.usage_events.event_type IS 'Type of event: limit_reached, upgrade_conversion, feature_used, etc.';
COMMENT ON COLUMN public.usage_events.event_data IS 'Event-specific data (e.g., limit_type, credits_added).';
COMMENT ON COLUMN public.usage_events.metadata IS 'Additional context data (e.g., user_agent, subscription_type).';
COMMENT ON COLUMN public.usage_events.source IS 'Where the event originated (e.g., PlansPage, StoryViewer).';


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

-- Policies for 'usage_events' (Users can only insert their own events, admins can read)
DROP POLICY IF EXISTS "Users can insert their own usage events." ON public.usage_events;
CREATE POLICY "Users can insert their own usage events."
    ON public.usage_events FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their own usage events." ON public.usage_events;
CREATE POLICY "Users can read their own usage events."
    ON public.usage_events FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);


COMMIT;


-- =============================================================================
-- ||                 FINAL SQL FUNCTIONS FOR FANTASIA                        ||
-- ||                                                                         ||
-- || This section contains all SQL functions required for the Stripe         ||
-- || integration and subscription management system.                         ||
-- ||                                                                         ||
-- || FEATURES IMPLEMENTED:                                                   ||
-- || - Voice credit management (purchase, decrement, monthly allowance)     ||
-- || - Monthly story generation limits (10 for free, unlimited for premium) ||
-- || - Monthly voice generation limits (20 for premium, 0 for free)         ||
-- || - Automated monthly counter resets via cron scheduler                  ||
-- || - Subscription status management for webhooks                          ||
-- || - User usage summary functions for UI display                          ||
-- || - Admin utility functions for manual management                        ||
-- ||                                                                         ||
-- || SUBSCRIPTION LOGIC:                                                     ||
-- || - Free users: 10 stories/month, 0 voice allowance, can buy credits    ||
-- || - Premium users: unlimited stories, 20 voice/month, can buy credits   ||
-- || - Voice credits are persistent and don't expire                        ||
-- || - Monthly counters reset on 1st of each month at 00:00 UTC            ||
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
  SET voice_credits = COALESCE(voice_credits, 0) + credits_to_add,
      updated_at = now()
  WHERE id = user_uuid;
  
  RAISE LOG 'Added % voice credits to user %', credits_to_add, user_uuid;
END;
$$;

-- Function to check if user can generate a story (respects monthly limits)
CREATE OR REPLACE FUNCTION public.can_generate_story(user_uuid uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  user_profile RECORD;
  FREE_STORY_LIMIT CONSTANT INTEGER := 10;
BEGIN
  SELECT subscription_status, monthly_stories_generated
  INTO user_profile
  FROM public.profiles
  WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Premium users have unlimited stories
  IF user_profile.subscription_status IN ('active', 'trialing') THEN
    RETURN true;
  END IF;
  
  -- Free users have monthly limit
  RETURN COALESCE(user_profile.monthly_stories_generated, 0) < FREE_STORY_LIMIT;
END;
$$;

-- Function to check if user can generate voice audio (respects monthly limits and credits)
CREATE OR REPLACE FUNCTION public.can_generate_voice(user_uuid uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  user_profile RECORD;
  PREMIUM_MONTHLY_ALLOWANCE CONSTANT INTEGER := 20;
BEGIN
  SELECT subscription_status, monthly_voice_generations_used, voice_credits
  INTO user_profile
  FROM public.profiles
  WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Premium users: Check monthly allowance first, then purchased credits
  IF user_profile.subscription_status IN ('active', 'trialing') THEN
    IF COALESCE(user_profile.monthly_voice_generations_used, 0) < PREMIUM_MONTHLY_ALLOWANCE THEN
      RETURN true;
    END IF;
    -- If monthly allowance exceeded, check purchased credits
    RETURN COALESCE(user_profile.voice_credits, 0) > 0;
  END IF;
  
  -- Free users can only use purchased credits
  RETURN COALESCE(user_profile.voice_credits, 0) > 0;
END;
$$;

-- Function to update subscription status (used by webhooks)
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  user_uuid uuid,
  new_status text,
  new_subscription_id text DEFAULT NULL,
  new_period_end timestamp with time zone DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET subscription_status = new_status,
      subscription_id = COALESCE(new_subscription_id, subscription_id),
      current_period_end = COALESCE(new_period_end, current_period_end),
      updated_at = now()
  WHERE id = user_uuid;
  
  RAISE LOG 'Updated subscription status for user % to %', user_uuid, new_status;
END;
$$;

-- Function to get user's current usage and limits (for UI display)
CREATE OR REPLACE FUNCTION public.get_user_usage_summary(user_uuid uuid)
RETURNS TABLE(
  subscription_type text,
  stories_used integer,
  stories_limit integer,
  voice_used integer,
  voice_limit integer,
  voice_credits integer,
  period_end timestamp with time zone
) LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  user_profile RECORD;
  FREE_STORY_LIMIT CONSTANT INTEGER := 10;
  PREMIUM_VOICE_ALLOWANCE CONSTANT INTEGER := 20;
BEGIN
  SELECT subscription_status, monthly_stories_generated, monthly_voice_generations_used, 
         voice_credits, current_period_end
  INTO user_profile
  FROM public.profiles
  WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Determine subscription type and limits
  IF user_profile.subscription_status IN ('active', 'trialing') THEN
    subscription_type := 'premium';
    stories_limit := -1; -- Unlimited
    voice_limit := PREMIUM_VOICE_ALLOWANCE;
  ELSE
    subscription_type := 'free';
    stories_limit := FREE_STORY_LIMIT;
    voice_limit := 0; -- Free users don't get monthly voice allowance
  END IF;
  
  stories_used := COALESCE(user_profile.monthly_stories_generated, 0);
  voice_used := COALESCE(user_profile.monthly_voice_generations_used, 0);
  voice_credits := COALESCE(user_profile.voice_credits, 0);
  period_end := user_profile.current_period_end;
  
  RETURN NEXT;
END;
$$;

-- Function to safely reset a specific user's monthly counters (for admin use)
CREATE OR REPLACE FUNCTION public.reset_user_monthly_counters(user_uuid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_stories_generated = 0,
      monthly_voice_generations_used = 0,
      updated_at = now()
  WHERE id = user_uuid;
  
  RAISE LOG 'Reset monthly counters for user %', user_uuid;
END;
$$;

-- Scheduled function to reset usage counters for monthly limits
CREATE OR REPLACE FUNCTION public.reset_monthly_counters()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  free_users_reset INTEGER := 0;
  voice_users_reset INTEGER := 0;
BEGIN
  -- Reset story counters for free users only (premium users have unlimited stories)
  UPDATE public.profiles
  SET monthly_stories_generated = 0
  WHERE (subscription_status IS NULL OR subscription_status NOT IN ('active', 'trialing'))
    AND monthly_stories_generated > 0;
  
  GET DIAGNOSTICS free_users_reset = ROW_COUNT;
  
  -- Reset voice generation counters for ALL users (both free and premium get monthly allowance)
  UPDATE public.profiles
  SET monthly_voice_generations_used = 0
  WHERE monthly_voice_generations_used > 0;
  
  GET DIAGNOSTICS voice_users_reset = ROW_COUNT;
  
  RAISE LOG 'Monthly counters reset completed: % free users story counters reset, % users voice counters reset.', free_users_reset, voice_users_reset;
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
-- ||                        AUTOMATED MONTHLY RESET SCHEDULER                  ||
-- =============================================================================

-- Enable the cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing schedule if it exists (for re-runs)
SELECT cron.unschedule('monthly-counters-reset');

-- Schedule monthly reset function to run on the 1st of each month at 00:00 UTC
-- This will reset monthly counters for both free and premium users
SELECT cron.schedule(
  'monthly-counters-reset',
  '0 0 1 * *', -- Cron expression: minute hour day month day_of_week
  $$SELECT reset_monthly_counters();$$
);

-- Verify the schedule was created
DO $$
DECLARE
  schedule_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM cron.job 
    WHERE jobname = 'monthly-counters-reset'
  ) INTO schedule_exists;
  
  IF schedule_exists THEN
    RAISE LOG 'Monthly reset scheduler configured successfully: Will run reset_monthly_counters() on 1st of each month at 00:00 UTC';
  ELSE
    RAISE WARNING 'Failed to create monthly reset scheduler. Please check pg_cron extension is enabled.';
  END IF;
END $$;

-- =============================================================================
-- ||                                END OF SCRIPT                              ||
-- =============================================================================