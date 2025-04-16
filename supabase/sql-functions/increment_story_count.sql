CREATE OR REPLACE FUNCTION public.increment_story_count(user_uuid uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_stories_generated = COALESCE(monthly_stories_generated, 0) + 1 -- Nombre Corregido
  WHERE id = user_uuid;
END;
$$;