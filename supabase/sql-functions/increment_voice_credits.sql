CREATE OR REPLACE FUNCTION public.increment_voice_credits(user_uuid uuid, credits_to_add integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ -- Mantenido DEFINER
BEGIN
  UPDATE public.profiles
  SET voice_credits = COALESCE(voice_credits, 0) + credits_to_add
  WHERE id = user_uuid;
END;
$$;