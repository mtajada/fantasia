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