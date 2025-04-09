// supabase/functions/create-checkout-session/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'; // Usa una versión reciente
import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno'; // Usa una versión reciente compatible con Deno
import { corsHeaders } from '../../_shared/cors.ts'; // Importa las cabeceras CORS compartidas

console.log(`Function create-checkout-session initializing...`);

// Inicializa Stripe con la clave secreta obtenida de las variables de entorno
// Asegúrate de que STRIPE_SECRET_KEY está configurada en Supabase Secrets
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16', // Usa una versión reciente y fija de la API de Stripe
  httpClient: Stripe.createFetchHttpClient(), // Necesario para compatibilidad con Deno/Fetch
});

// Obtén la URL base de la aplicación desde las variables de entorno
// Asegúrate de que APP_BASE_URL está configurada (e.g., http://localhost:8080)
const appBaseUrl = Deno.env.get('APP_BASE_URL')!;
if (!appBaseUrl) {
    console.error("APP_BASE_URL environment variable is not set.");
    // Podrías lanzar un error o usar un valor por defecto, pero es mejor que esté configurada
}

serve(async (req: Request) => {
  // Gestiona la solicitud preflight CORS del navegador (importante)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  console.log(`Handling ${req.method} request`);

  try {
    // 1. Inicializa el cliente de Supabase específico para esta solicitud
    //    Obtiene las credenciales del usuario desde la cabecera Authorization
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

    // 3. Parsea el cuerpo de la solicitud para determinar qué se va a comprar
    let priceId: string | null = null;
    let mode: 'payment' | 'subscription' = 'payment'; // Por defecto, pago único
    let metadata = {}; // Objeto para enviar información adicional a Stripe

    const requestBody = await req.json();
    const item = requestBody.item; // Espera un JSON como { "item": "premium" } o { "item": "credits" }
    console.log(`Received request to purchase item: ${item}`);

    if (item === 'premium') {
      priceId = Deno.env.get('PREMIUM_PLAN_PRICE_ID');
      mode = 'subscription';
      metadata = { supabase_user_id: user.id }; // Identifica al usuario en webhooks de suscripción
    } else if (item === 'credits') {
      priceId = Deno.env.get('VOICE_CREDITS_PRICE_ID');
      mode = 'payment';
      // Para pagos únicos, la metadata va en payment_intent_data
      metadata = { supabase_user_id: user.id, item_purchased: 'voice_credits' };
    } else {
      console.error(`Invalid item requested: ${item}`);
      return new Response(JSON.stringify({ error: 'Artículo solicitado inválido.' }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!priceId) {
       console.error(`Stripe Price ID is not configured in environment variables for item: ${item}. Check PREMIUM_PLAN_PRICE_ID or VOICE_CREDITS_PRICE_ID.`);
       throw new Error('Error de configuración del servidor: falta el ID de precio.');
    }
    console.log(`Resolved Price ID: ${priceId}, Mode: ${mode}`);

    // 4. Busca el stripe_customer_id en el perfil del usuario
    let stripeCustomerId: string;
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle(); // Usa maybeSingle para manejar perfil no encontrado sin error

    if (profileError) {
        console.error('Database error fetching profile:', profileError);
        throw new Error('Error al consultar el perfil del usuario.');
    }

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
      console.log(`Found existing Stripe Customer ID: ${stripeCustomerId}`);
    } else {
      // 5. Si no existe, crea un nuevo cliente en Stripe
      console.log(`Stripe Customer ID not found for user ${user.id}. Creating new Stripe Customer...`);
      const customer = await stripe.customers.create({
        email: user.email, // Asocia el cliente Stripe con el email del usuario
        metadata: {
          supabase_user_id: user.id, // Guarda el ID de Supabase en los metadatos de Stripe
        },
      });
      stripeCustomerId = customer.id;
      console.log(`Created new Stripe Customer ID: ${stripeCustomerId}`);

      // 5b. Guarda el nuevo ID de cliente en la tabla profiles de Supabase
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id); // Asegúrate de actualizar la fila correcta

      if (updateError) {
        console.error('Failed to update profile with Stripe Customer ID:', updateError);
        // Considera la estrategia de error aquí. Si falla, el usuario podría tener problemas en futuras compras.
        // Por ahora, lanzamos un error para indicar el fallo.
        throw new Error('No se pudo actualizar el perfil del usuario con la información de Stripe.');
      }
      console.log(`Profile updated successfully with Stripe Customer ID.`);
    }

    // 6. Crea la sesión de Stripe Checkout
    console.log(`Creating Stripe Checkout session for Customer ${stripeCustomerId}...`);
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'], // Puedes añadir más tipos si están habilitados en tu cuenta Stripe
      line_items: [ { price: priceId, quantity: 1 } ],
      mode: mode,
      // URLs a las que Stripe redirigirá al usuario después del pago
      success_url: `${appBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`, // Pasa el ID de sesión para verificación opcional en el frontend
      cancel_url: `${appBaseUrl}/payment-cancel`, // Redirección a la página de pago cancelado
      // Adjunta metadata relevante según el modo
      ...(mode === 'subscription' && { subscription_data: { metadata: metadata } }),
      ...(mode === 'payment' && { payment_intent_data: { metadata: metadata } }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`Stripe Checkout session created: ${session.id}`);

    // 7. Devuelve la URL de la sesión al frontend
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unhandled error in create-checkout-session:', error);
    return new Response(JSON.stringify({ error: `Error interno del servidor: ${error.message}` }), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
