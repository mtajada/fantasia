CREATE OR REPLACE FUNCTION public.increment_monthly_voice_usage(user_uuid uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_voice_generations_used = COALESCE(monthly_voice_generations_used, 0) + 1
  WHERE id = user_uuid;
END;
$$;
