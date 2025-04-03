// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno'; // Coincide versión con create-checkout-session
import { corsHeaders } from '../_shared/cors.ts';

// --- Constantes y Configuración ---

// Lee las claves de los secretos de Supabase
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_SIGNING_SECRET = Deno.env.get('STRIPE_SIGNING_SECRET');
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY'); // <-- Lee la clave de servicio con el nombre personalizado

// Lee las variables automáticas de Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

// Verifica que las variables de entorno esenciales estén configuradas
if (!STRIPE_SECRET_KEY || !STRIPE_SIGNING_SECRET || !SUPABASE_URL || !APP_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables. Check STRIPE_SECRET_KEY, STRIPE_SIGNING_SECRET, APP_SERVICE_ROLE_KEY and ensure SUPABASE_URL is available.');
    // En un escenario real, podrías querer detener la función aquí o lanzar un error
}

// Inicializa Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Proveedor Crypto para Deno
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Inicializa el cliente de Supabase CON LA SERVICE ROLE KEY (usando la variable renombrada)
const supabaseAdmin = createClient(SUPABASE_URL!, APP_SERVICE_ROLE_KEY!);

console.log('Stripe Webhook Function Initialized (Corrected Service Key Handling).');

// --- Lógica Principal del Servidor ---

serve(async (req: Request) => {
   if (req.method === 'OPTIONS') {
     console.log('Handling OPTIONS preflight request');
     return new Response('ok', { headers: corsHeaders });
   }

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) {
    console.error('FAIL: Missing Stripe-Signature header');
    return new Response('Missing Stripe-Signature header', { status: 400 });
  }

  const body = await req.text(); // Necesario para la verificación

  try {
    // 1. Verifica la firma del Webhook
    console.log('Verifying webhook signature...');
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_SIGNING_SECRET!,
      undefined,
      cryptoProvider
    );
    console.log(`Webhook event received: ${event.id}, Type: ${event.type}`);

    // 2. Maneja el evento según su tipo
    const eventObject = event.data.object as any;
    let supabaseUserId: string | null = null;
    let stripeCustomerId: string | null = null;

    // Intenta obtener IDs (igual que antes)
    if (eventObject.customer) stripeCustomerId = eventObject.customer;
    if (eventObject.metadata?.supabase_user_id) supabaseUserId = eventObject.metadata.supabase_user_id;
    else if (stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
        if (!(customer.deleted)) supabaseUserId = customer.metadata?.supabase_user_id;
      } catch (customerError) { console.error(`Error retrieving customer ${stripeCustomerId}:`, customerError); }
    }
    if (!supabaseUserId && stripeCustomerId) {
         console.log(`supabase_user_id not in metadata/customer, querying profiles table for customer ${stripeCustomerId}...`);
         const { data: profile, error: profileError } = await supabaseAdmin
             .from('profiles').select('id').eq('stripe_customer_id', stripeCustomerId).single();
         if (profile) {
             supabaseUserId = profile.id;
             console.log(`Found supabase_user_id ${supabaseUserId} from profiles table.`);
         } else { console.warn(`Could not find profile for stripe_customer_id ${stripeCustomerId}. Error: ${profileError?.message}`);}
    }

    if (!supabaseUserId && !['customer.subscription.deleted', 'customer.deleted'].includes(event.type)) {
         console.error(`FATAL: Could not determine supabase_user_id for event ${event.id} (Type: ${event.type}). Customer: ${stripeCustomerId}`);
         return new Response(JSON.stringify({ error: 'Webhook Error: User identification failed.' }), { status: 200 }); // Respond 200 to prevent Stripe retries for this failure
    }

    // --- Manejadores de Eventos Específicos (Sin cambios en la lógica interna de los casos) ---
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = eventObject as Stripe.Checkout.Session;
        console.log(`Processing checkout.session.completed for session ${session.id}`);
        // Asegurarse de tener supabaseUserId aquí es CRUCIAL
         if (!supabaseUserId) throw new Error(`Cannot process checkout ${session.id}: missing supabase_user_id.`);


        if (session.mode === 'subscription') {
          // --- Suscripción Iniciada ---
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const planId = subscription.items.data[0]?.price.id;
          const status = subscription.status;
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription_id: subscription.id,
              subscription_status: status,
              plan_id: planId,
              current_period_end: currentPeriodEnd.toISOString(),
              voice_credits: 20, // Créditos iniciales Premium
            })
            .eq('id', supabaseUserId); // Actualiza al usuario correcto

          if (error) console.error(`FAIL: Error updating profile for subscription ${subscription.id}:`, error);
          else console.log(`OK: Profile updated for new subscription ${subscription.id}.`);

        } else if (session.mode === 'payment') {
          // --- Compra Única (Créditos) ---
           const itemPurchased = session.metadata?.item_purchased || (session.payment_intent as Stripe.PaymentIntent)?.metadata?.item_purchased;

           if (itemPurchased === 'voice_credits') {
              const creditsToAdd = 25; // Asume 25 créditos por compra (ajusta si es necesario)
              console.log(`Adding ${creditsToAdd} voice credits to user ${supabaseUserId}`);

              // Llama a la función SQL RPC para incrementar
              const { error: creditError } = await supabaseAdmin.rpc('increment_voice_credits', {
                 user_uuid: supabaseUserId,
                 credits_to_add: creditsToAdd
              });

              if (creditError) console.error(`FAIL: Error adding voice credits via RPC for user ${supabaseUserId}:`, creditError);
              else console.log(`OK: Added ${creditsToAdd} voice credits via RPC.`);
           } else {
               console.log(`INFO: Checkout payment ${session.id} completed, but item was not 'voice_credits'.`);
           }
        }
        break;
      }

      case 'invoice.paid': {
        // Renovaciones o inicio de suscripción
        const invoice = eventObject as Stripe.Invoice;
        console.log(`Processing invoice.paid for invoice ${invoice.id}`);
         if (!supabaseUserId) throw new Error(`Cannot process invoice ${invoice.id}: missing supabase_user_id.`);


        if (invoice.paid && invoice.subscription) {
            const subscriptionId = invoice.subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_status: subscription.status,
                  current_period_end: currentPeriodEnd.toISOString(),
                  voice_credits: 20, // Restablecer créditos mensuales
                })
                .eq('id', supabaseUserId);

            if (error) console.error(`FAIL: Error updating profile for invoice.paid ${invoice.id}:`, error);
            else console.log(`OK: Profile updated for invoice.paid ${invoice.id} (Renewal/Start).`);
        } else {
            console.log(`INFO: Invoice ${invoice.id} paid, but not related to a subscription.`);
        }
        break;
      }

      case 'customer.subscription.updated': {
          // Cambios de plan, cancelaciones programadas, etc.
          const subscription = eventObject as Stripe.Subscription;
          console.log(`Processing customer.subscription.updated for subscription ${subscription.id}`);
           if (!supabaseUserId) throw new Error(`Cannot process subscription update ${subscription.id}: missing supabase_user_id.`);

          const status = subscription.status;
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          const planId = subscription.items.data[0]?.price.id;
          const updatePayload: { [key: string]: any } = {
              subscription_status: status,
              current_period_end: currentPeriodEnd.toISOString(),
              plan_id: planId,
          };

          if (subscription.cancel_at_period_end) {
              console.log(`INFO: Subscription ${subscription.id} scheduled for cancellation at period end.`);
              updatePayload.subscription_status = 'canceling'; // Estado intermedio opcional
          }

          const { error } = await supabaseAdmin
              .from('profiles')
              .update(updatePayload)
              .eq('id', supabaseUserId);

          if (error) console.error(`FAIL: Error updating profile for customer.subscription.updated ${subscription.id}:`, error);
          else console.log(`OK: Profile updated for customer.subscription.updated ${subscription.id}.`);
          break;
      }

      case 'customer.subscription.deleted': {
        // Cancelación definitiva
        const subscription = eventObject as Stripe.Subscription;
         console.log(`Processing customer.subscription.deleted for subscription ${subscription.id}`);
         // Aquí usamos stripeCustomerId para encontrar al usuario, ya que supabaseUserId podría faltar
         if (!stripeCustomerId) throw new Error(`Cannot process subscription delete ${subscription.id}: missing stripe_customer_id.`);

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_id: null,
            subscription_status: 'canceled',
            plan_id: null,
            voice_credits: 0, // Resetear créditos
            current_period_end: null,
          })
          .eq('stripe_customer_id', stripeCustomerId); // Actualiza usando el ID de cliente Stripe

        if (error) console.error(`FAIL: Error updating profile for customer.subscription.deleted ${subscription.id}:`, error);
        else console.log(`OK: Profile updated for customer.subscription.deleted ${subscription.id}.`);
        break;
      }

      default:
        console.log(`INFO: Unhandled event type: ${event.type}`);
    }

    // 3. Responde a Stripe con 200 OK
    console.log(`Webhook processed successfully for event: ${event.id}`);
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('FATAL: Webhook handler error:', err);
    const status = (err.type === 'StripeSignatureVerificationError') ? 400 : 500;
    // Asegúrate de responder a Stripe para evitar reintentos innecesarios si es un error interno grave
    return new Response(`Webhook Error: ${err.message}`, { status: status });
  }
});
