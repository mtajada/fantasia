// supabase/functions/create-customer-portal-session/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts'; // Ruta corregida

console.log(`Function create-customer-portal-session initializing...`);

// --- Variables de Entorno y Cliente Stripe ---
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const appBaseUrl = Deno.env.get('APP_BASE_URL');

// Verificación inicial (fuera del handler para errores de configuración tempranos)
if (!stripeSecretKey) {
    console.error("FATAL: STRIPE_SECRET_KEY environment variable is not set.");
    // La función fallará al intentar inicializar Stripe, pero este log ayuda.
}
if (!appBaseUrl) {
    console.error("FATAL: APP_BASE_URL environment variable is not set.");
    // La verificación dentro del handler devolverá error 500 al cliente.
}

// Inicializa Stripe con la clave secreta (si existe)
// El '!' aquí es menos crítico porque si es null, Stripe() lanzará un error claro.
// Pero es más seguro haberlo verificado antes.
const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});
// --- Fin Variables y Cliente ---


serve(async (req: Request) => {
  // Gestiona la solicitud preflight CORS del navegador
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  console.log(`Handling ${req.method} request`);

  try {
    // Verificar de nuevo la variable APP_BASE_URL dentro del handler para poder retornar una respuesta
    if (!appBaseUrl) {
      // Este log ya se mostró al inicio, pero aquí retornamos error al cliente
      console.error("Configuration Error: APP_BASE_URL is not set.");
      return new Response(JSON.stringify({ error: 'Error de configuración interna del servidor.' }), {
          status: 500, // Internal Server Error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Podríamos añadir una verificación similar para stripeSecretKey aquí también si quisiéramos ser extra seguros

    // 1. Inicializa el cliente de Supabase específico para esta solicitud
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 2. Verifica si el usuario está autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(JSON.stringify({ error: 'Usuario no autenticado o inválido.' }), {
        status: 401, // Unauthorized
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log(`Authenticated user ID: ${user.id}`);

    // 3. Busca el stripe_customer_id en el perfil del usuario
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle(); // Usa maybeSingle para manejar perfil no encontrado sin error

    // Maneja errores de DB que no sean 'no encontrado'
    if (profileError && profileError.code !== 'PGRST116') {
        console.error(`Database error fetching profile for user ${user.id}:`, profileError);
        // Lanza un error para que sea capturado por el catch principal
        throw new Error(`Error al consultar el perfil: ${profileError.message}`);
    }

    // 4. Verifica que el usuario tenga un stripe_customer_id
    if (!profile?.stripe_customer_id) {
      console.warn(`No Stripe Customer ID found for user ${user.id}. Cannot open portal.`);
      // Devuelve un error específico 404 para el frontend
      return new Response(JSON.stringify({
        error: 'No se encontró información de facturación para gestionar. Realiza una compra primero.'
      }), {
        status: 404, // Not Found
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripeCustomerId = profile.stripe_customer_id;
    console.log(`Found Stripe Customer ID: ${stripeCustomerId}`);

    // 5. Crea una sesión del portal de cliente de Stripe
    const returnUrl = `${appBaseUrl}/profile`; // Confirma que '/profile' es la ruta correcta en tu app Vite
    console.log(`Creating Stripe Billing Portal session for Customer ${stripeCustomerId} with return URL: ${returnUrl}`);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    console.log(`Stripe Customer Portal session created: ${portalSession.id}`);

    // 6. Devuelve la URL de la sesión al frontend
    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) { // 'error' aquí es de tipo 'unknown'
    console.error('Unhandled error in create-customer-portal-session:', error);

    // ---- Bloque Catch con manejo seguro de 'unknown' ----
    let errorMessage = 'Error desconocido'; // Mensaje por defecto
    if (error instanceof Error) {
      errorMessage = error.message; // Es seguro acceder a .message
    } else if (typeof error === 'string') {
      errorMessage = error; // Si se lanzó un string
    }
    // ---- Fin Bloque Catch ----

    // Devuelve la respuesta usando el mensaje obtenido de forma segura
    return new Response(JSON.stringify({ error: `Error interno del servidor: ${errorMessage}` }), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});