CREATE OR REPLACE FUNCTION public.reset_monthly_story_counts()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_stories_generated = 0,
      last_story_reset_date = NOW() -- Opcional: si usas esta columna
  WHERE monthly_stories_generated > 0; -- Opcional: optimización

  RAISE LOG 'Contadores mensuales de historias reseteados.';
END;
$$;
