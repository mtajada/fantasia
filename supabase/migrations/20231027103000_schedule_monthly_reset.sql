-- Activar pg_cron si es necesario
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Programar el job para ejecutar la función de reseteo
-- Ejecuta a las 00:00 del día 1 de cada mes
SELECT cron.schedule(
    'monthly_story_reset',
    '0 0 1 * *',
   $$ SELECT public.reset_monthly_story_counts(); $$
);