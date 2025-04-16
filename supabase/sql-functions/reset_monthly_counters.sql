CREATE OR REPLACE FUNCTION public.reset_monthly_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Resetea el contador de historias generadas SÓLO para usuarios NO premium
  UPDATE public.profiles
  SET monthly_stories_generated = 0
  WHERE (subscription_status IS NULL OR subscription_status NOT IN ('active', 'trialing')) -- Condición para gratuitos/cancelados
    AND monthly_stories_generated > 0; -- Opcional: solo actualiza si es necesario

  RAISE LOG 'Contadores mensuales de historias para usuarios gratuitos reseteados.';

  -- NO TOCAR monthly_voice_generations_used aquí. Eso se maneja en el webhook.
END;
$$;
