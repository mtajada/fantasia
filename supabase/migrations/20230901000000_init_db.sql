-- Habilitar la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  language TEXT NOT NULL,
  child_age INT NOT NULL,
  special_need TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de personajes
CREATE TABLE public.characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  hobbies TEXT[] NOT NULL,
  description TEXT NOT NULL,
  profession TEXT NOT NULL,
  character_type TEXT NOT NULL,
  personality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de historias
CREATE TABLE public.stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  image_url TEXT,
  moral TEXT,
  genre TEXT,
  duration TEXT NOT NULL,
  character_id UUID REFERENCES public.characters(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de capítulos
CREATE TABLE public.story_chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) NOT NULL,
  chapter_number INT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generation_method TEXT,
  custom_input TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de desafíos
CREATE TABLE public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de preguntas de desafíos
CREATE TABLE public.challenge_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option_index INT NOT NULL,
  explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  target_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de archivos de audio
CREATE TABLE public.audio_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  story_id UUID REFERENCES public.stories(id),
  chapter_id UUID REFERENCES public.story_chapters(id),
  voice_id TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de preferencias de voz del usuario
CREATE TABLE public.user_voices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  voice_id TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar RLS (Row Level Security) en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_voices ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para perfiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Los usuarios pueden crear su propio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para personajes
CREATE POLICY "Los usuarios pueden ver sus propios personajes" ON public.characters
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus propios personajes" ON public.characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propios personajes" ON public.characters
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propios personajes" ON public.characters
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para historias
CREATE POLICY "Los usuarios pueden ver sus propias historias" ON public.stories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus propias historias" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propias historias" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propias historias" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para capítulos
CREATE POLICY "Los usuarios pueden ver capítulos de sus historias" ON public.story_chapters
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.stories WHERE id = story_id
  ));
CREATE POLICY "Los usuarios pueden crear capítulos en sus historias" ON public.story_chapters
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.stories WHERE id = story_id
  ));
CREATE POLICY "Los usuarios pueden actualizar capítulos de sus historias" ON public.story_chapters
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM public.stories WHERE id = story_id
  ));
CREATE POLICY "Los usuarios pueden eliminar capítulos de sus historias" ON public.story_chapters
  FOR DELETE USING (auth.uid() IN (
    SELECT user_id FROM public.stories WHERE id = story_id
  ));

-- Políticas RLS para desafíos
CREATE POLICY "Los usuarios pueden ver desafíos de sus historias" ON public.challenges
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.stories WHERE id = story_id
  ));
CREATE POLICY "Los usuarios pueden crear desafíos en sus historias" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.stories WHERE id = story_id
  ));
CREATE POLICY "Los usuarios pueden actualizar desafíos de sus historias" ON public.challenges
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM public.stories WHERE id = story_id
  ));

-- Políticas RLS para preguntas de desafíos
CREATE POLICY "Los usuarios pueden ver preguntas de desafíos de sus historias" ON public.challenge_questions
  FOR SELECT USING (auth.uid() IN (
    SELECT s.user_id 
    FROM public.stories s 
    JOIN public.challenges c ON s.id = c.story_id 
    WHERE c.id = challenge_id
  ));
CREATE POLICY "Los usuarios pueden crear preguntas en desafíos de sus historias" ON public.challenge_questions
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT s.user_id 
    FROM public.stories s 
    JOIN public.challenges c ON s.id = c.story_id 
    WHERE c.id = challenge_id
  ));
CREATE POLICY "Los usuarios pueden actualizar preguntas de desafíos de sus historias" ON public.challenge_questions
  FOR UPDATE USING (auth.uid() IN (
    SELECT s.user_id 
    FROM public.stories s 
    JOIN public.challenges c ON s.id = c.story_id 
    WHERE c.id = challenge_id
  ));

-- Políticas RLS para archivos de audio
CREATE POLICY "Los usuarios pueden ver sus archivos de audio" ON public.audio_files
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus archivos de audio" ON public.audio_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus archivos de audio" ON public.audio_files
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus archivos de audio" ON public.audio_files
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para preferencias de voz
CREATE POLICY "Los usuarios pueden ver sus preferencias de voz" ON public.user_voices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus preferencias de voz" ON public.user_voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus preferencias de voz" ON public.user_voices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus preferencias de voz" ON public.user_voices
  FOR DELETE USING (auth.uid() = user_id);

-- Creación de funciones y triggers para actualizar automáticamente 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers para actualizar updated_at en cada tabla
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_characters_modtime
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_stories_modtime
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_story_chapters_modtime
  BEFORE UPDATE ON public.story_chapters
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_voices_modtime
  BEFORE UPDATE ON public.user_voices
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column(); 