CREATE POLICY "Los usuarios pueden ver sus propios personajes" ON characters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus propios personajes" ON characters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propios personajes" ON characters FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propios personajes" ON characters FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden ver sus propias historias" ON stories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus propias historias" ON stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propias historias" ON stories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propias historias" ON stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden ver sus archivos de audio" ON audio_files FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus archivos de audio" ON audio_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus archivos de audio" ON audio_files FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus archivos de audio" ON audio_files FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden ver capítulos de sus historias" ON story_chapters FOR SELECT TO authenticated USING (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = story_chapters.story_id)));
CREATE POLICY "Los usuarios pueden crear capítulos en sus historias" ON story_chapters FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = story_chapters.story_id)));
CREATE POLICY "Los usuarios pueden actualizar capítulos de sus historias" ON story_chapters FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = story_chapters.story_id)));
CREATE POLICY "Los usuarios pueden eliminar capítulos de sus historias" ON story_chapters FOR DELETE TO authenticated USING (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = story_chapters.story_id)));

CREATE POLICY "Los usuarios pueden ver desafíos de sus historias" ON challenges FOR SELECT TO authenticated USING (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = challenges.story_id)));
CREATE POLICY "Los usuarios pueden crear desafíos en sus historias" ON challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = challenges.story_id)));
CREATE POLICY "Los usuarios pueden actualizar desafíos de sus historias" ON challenges FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = challenges.story_id)));
CREATE POLICY "Los usuarios pueden eliminar desafíos de sus historias" ON challenges FOR DELETE TO authenticated USING (auth.uid() IN (SELECT stories.user_id FROM stories WHERE (stories.id = challenges.story_id)));

CREATE POLICY "Los usuarios pueden ver preguntas de desafíos de sus historias" ON challenge_questions FOR SELECT TO authenticated USING (auth.uid() IN (SELECT s.user_id FROM (stories s JOIN challenges c ON (s.id = c.story_id)) WHERE (c.id = challenge_questions.challenge_id)));
CREATE POLICY "Los usuarios pueden crear preguntas en desafíos de sus historias" ON challenge_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT s.user_id FROM (stories s JOIN challenges c ON (s.id = c.story_id)) WHERE (c.id = challenge_questions.challenge_id)));
CREATE POLICY "Los usuarios pueden actualizar preguntas de desafíos de sus historias" ON challenge_questions FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT s.user_id FROM (stories s JOIN challenges c ON (s.id = c.story_id)) WHERE (c.id = challenge_questions.challenge_id)));
CREATE POLICY "Los usuarios pueden eliminar preguntas de desafíos de sus historias" ON challenge_questions FOR DELETE TO authenticated USING (auth.uid() IN (SELECT s.user_id FROM (stories s JOIN challenges c ON (s.id = c.story_id)) WHERE (c.id = challenge_questions.challenge_id)));

-- Políticas RLS para preset_suggestions
CREATE POLICY "Allow authenticated read access to active presets" 
ON public.preset_suggestions
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Allow authenticated users to read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow authenticated users to update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow authenticated users to insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);