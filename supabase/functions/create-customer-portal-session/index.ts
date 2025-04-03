// supabase/functions/create-customer-portal-session/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function create-customer-portal-session initializing...`);

// Inicializa Stripe con la clave secreta
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Obtén la URL base de forma segura, sin el operador '!'
const appBaseUrl = Deno.env.get('APP_BASE_URL');

serve(async (req: Request) => {
  // Gestiona la solicitud preflight CORS del navegador
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  console.log(`Handling ${req.method} request`);

  try {
    // Verificar de nuevo la variable APP_BASE_URL dentro del handler
    if (!appBaseUrl) {
      console.error("FATAL: APP_BASE_URL environment variable is not set. Cannot create portal session.");
      return new Response(JSON.stringify({ error: 'Error de configuración interna del servidor.' }), {
          status: 500, // Internal Server Error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    if (profileError && profileError.code !== 'PGRST116') { // Ignora 'not found' pero loguea otros errores
        console.error(`Database error fetching profile for user ${user.id}:`, profileError);
        throw new Error('Error al consultar el perfil del usuario.');
    }

    // 4. Verifica que el usuario tenga un stripe_customer_id
    if (!profile?.stripe_customer_id) {
      console.warn(`No Stripe Customer ID found for user ${user.id}. Cannot open portal.`);
      // Devuelve un error específico para el frontend
      return new Response(JSON.stringify({
        error: 'No se encontró información de facturación para gestionar. Realiza una compra primero.'
      }), {
        status: 404, // Not Found (o 400 Bad Request podría ser)
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripeCustomerId = profile.stripe_customer_id;
    console.log(`Found Stripe Customer ID: ${stripeCustomerId}`);

    // 5. Crea una sesión del portal de cliente de Stripe
    const returnUrl = `${appBaseUrl}/profile`; // Asegúrate que esta es la ruta correcta en tu app Vite
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

    // ---- Bloque Catch Corregido ----
    let errorMessage = 'Error desconocido'; // Mensaje por defecto
    if (error instanceof Error) {
      errorMessage = error.message; // Es seguro acceder a .message
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    // ---- Fin Bloque Catch Corregido ----

    // Devuelve la respuesta usando el mensaje obtenido de forma segura
    return new Response(JSON.stringify({ error: `Error interno del servidor: ${errorMessage}` }), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});