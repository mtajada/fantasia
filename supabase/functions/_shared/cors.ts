// supabase/functions/_shared/cors.ts

export const corsHeaders = {
  // IMPORTANTE: En producción, reemplaza '*' con la URL exacta de tu aplicación frontend.
  // Ejemplo: 'Access-Control-Allow-Origin': 'https://tu-cuenta-cuentos.com',
  'Access-Control-Allow-Origin': '*', // Permitir cualquier origen por ahora (Cámbialo en producción)

  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',

  // Asegúrate de que OPTIONS está incluido si tu frontend hace preflight requests
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};