CREATE TABLE public.audio_files (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  story_id uuid NULL,
  chapter_id uuid NULL,
  voice_id text NOT NULL,
  url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audio_files_pkey PRIMARY KEY (id),
  CONSTRAINT audio_files_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES story_chapters(id),
  CONSTRAINT audio_files_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id),
  CONSTRAINT audio_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.challenge_questions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  challenge_id uuid NOT NULL,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_option_index integer NOT NULL,
  explanation text NOT NULL,
  category text NOT NULL,
  target_language text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT challenge_questions_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_questions_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  story_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id)
);

CREATE TABLE public.characters (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  hobbies text[] NOT NULL,
  description text NOT NULL,
  profession text NOT NULL,
  character_type text NOT NULL,
  personality text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT characters_pkey PRIMARY KEY (id),
  CONSTRAINT characters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- User preferences
    preferred_language text DEFAULT 'es'::text CHECK (preferred_language IN ('en', 'es', 'fr', 'de', 'it')),
    user_age_range text CHECK (user_age_range IN ('3-5', '6-8', '9-12', '13+')),
    special_need text CHECK (special_need IN ('none', 'adhd', 'autism', 'dyslexia', 'visual_impairment', 'hearing_impairment')),
    has_completed_setup boolean DEFAULT false NOT NULL,
    preferred_voice_id text, -- Reference to a potential voices table or external ID

    -- Usage limits & Subscription status
    subscription_status text DEFAULT 'free'::text CHECK (subscription_status IN ('free', 'premium_monthly', 'premium_yearly', 'trialing', 'past_due', 'canceled')),
    stripe_customer_id text UNIQUE,
    stripe_subscription_id text UNIQUE,
    current_period_end timestamp with time zone,

    -- Free user limits (Reset monthly by cron/function)
    monthly_stories_generated integer DEFAULT 0,

    -- Premium user limits (Reset on subscription renewal via webhook)
    monthly_voice_generations_used integer DEFAULT 0, -- Tracks premium monthly voice generations

    -- Purchased Credits (One-time or top-ups)
    voice_credits integer DEFAULT 0,
    story_credits integer DEFAULT 0,

    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

COMMENT ON COLUMN public.profiles.has_completed_setup IS 'Indica si el usuario ha completado el flujo de configuración inicial del perfil.';

CREATE TABLE public.stories (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  audio_url text NULL,
  moral text NULL,
  genre text NULL,
  duration text NOT NULL,
  character_id uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stories_pkey PRIMARY KEY (id),
  CONSTRAINT stories_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id),
  CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

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
  CONSTRAINT story_chapters_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id)
);

CREATE TABLE public.user_voices (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  voice_id text NOT NULL,
  is_current boolean NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_voices_pkey PRIMARY KEY (id),
  CONSTRAINT user_voices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS monthly_voice_generations_used INTEGER DEFAULT 0;

ALTER TABLE public.profiles
DROP COLUMN IF EXISTS last_story_reset_date;

ALTER TABLE public.stories
DROP COLUMN IF EXISTS free_continuation_used;

ALTER TABLE public.stories
DROP COLUMN IF EXISTS image_url;