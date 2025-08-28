// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno';
<<<<<<< HEAD
import { corsHeaders } from '../_shared/cors.ts';

// --- Constants and Configuration ---
const FUNCTION_VERSION = 'v2.0.0';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_SIGNING_SECRET = Deno.env.get('STRIPE_SIGNING_SECRET');
const APP_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

// --- Structured Logging Utility ---
interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  event_id?: string;
  message: string;
  metadata?: Record<string, any>;
  duration_ms?: number;
}

function log(level: LogEntry['level'], message: string, metadata?: Record<string, any>, eventId?: string, durationMs?: number): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(eventId && { event_id: eventId }),
    ...(metadata && { metadata }),
    ...(durationMs && { duration_ms: durationMs })
  };
  console.log(`[WEBHOOK_${level}] ${JSON.stringify(entry)}`);
}

// Validate environment variables
if (!STRIPE_SECRET_KEY || !STRIPE_SIGNING_SECRET || !SUPABASE_URL || !APP_SERVICE_ROLE_KEY) {
  log('ERROR', 'CRITICAL: Missing environment variables', {
    has_stripe_key: !!STRIPE_SECRET_KEY,
    has_signing_secret: !!STRIPE_SIGNING_SECRET,
    has_supabase_url: !!SUPABASE_URL,
    has_service_role_key: !!APP_SERVICE_ROLE_KEY
  });
  throw new Error('Missing required environment variables');
=======
// Asegúrate que la ruta es correcta para tu estructura
import { corsHeaders } from '../_shared/cors.ts'; // Ajusta si moviste cors.ts

// --- Constantes y Configuración ---
console.log(`[WEBHOOK_DEBUG] Stripe Webhook Function Initializing...`);

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_SIGNING_SECRET = Deno.env.get('STRIPE_SIGNING_SECRET');
const APP_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // O el nombre que uses
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

if (!STRIPE_SECRET_KEY || !STRIPE_SIGNING_SECRET || !SUPABASE_URL || !APP_SERVICE_ROLE_KEY) {
  console.error('[WEBHOOK_ERROR] CRITICAL: Missing environment variables. Check STRIPE_SECRET_KEY, STRIPE_SIGNING_SECRET, SUPABASE_SERVICE_ROLE_KEY.');
  // Considera lanzar un error
>>>>>>> origin/main
}

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();
<<<<<<< HEAD
const supabaseAdmin = createClient(SUPABASE_URL!, APP_SERVICE_ROLE_KEY!);

log('INFO', 'Stripe Webhook Function Initialized', { 
  version: FUNCTION_VERSION, 
  stripe_api_version: '2023-10-16' 
});

// --- Event Handler Functions ---

/**
 * Handles subscription creation from checkout completion
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabaseUserId: string, eventId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    log('DEBUG', 'Processing subscription creation', {
      subscription_id: subscription.id,
      user_id: supabaseUserId,
      status: subscription.status
    }, eventId);

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const stripeCustomerId = subscription.customer as string;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        stripe_customer_id: stripeCustomerId,
        current_period_end: currentPeriodEnd.toISOString(),
        monthly_voice_generations_used: 0, // Reset counter
      })
      .eq('id', supabaseUserId);

    if (error) {
      log('ERROR', 'Failed to update profile for subscription creation', {
        subscription_id: subscription.id,
        user_id: supabaseUserId,
        error: error.message
      }, eventId);
      throw error;
    }

    const duration = Date.now() - startTime;
    log('INFO', 'Subscription creation completed successfully', {
      subscription_id: subscription.id,
      user_id: supabaseUserId
    }, eventId, duration);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', 'Subscription creation failed', {
      subscription_id: subscription.id,
      user_id: supabaseUserId,
      error: error.message
    }, eventId, duration);
    throw error;
  }
}

/**
 * Handles subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabaseUserId: string, eventId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    log('DEBUG', 'Processing subscription update', {
      subscription_id: subscription.id,
      user_id: supabaseUserId,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end
    }, eventId);

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    const updatePayload: { [key: string]: any } = {
      subscription_status: subscription.status,
      current_period_end: currentPeriodEnd.toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', supabaseUserId);

    if (error) {
      log('ERROR', 'Failed to update profile for subscription update', {
        subscription_id: subscription.id,
        user_id: supabaseUserId,
        error: error.message
      }, eventId);
      throw error;
    }

    const duration = Date.now() - startTime;
    log('INFO', 'Subscription update completed successfully', {
      subscription_id: subscription.id,
      user_id: supabaseUserId
    }, eventId, duration);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', 'Subscription update failed', {
      subscription_id: subscription.id,
      user_id: supabaseUserId,
      error: error.message
    }, eventId, duration);
    throw error;
  }
}

/**
 * Handles subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, stripeCustomerId: string, eventId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    log('DEBUG', 'Processing subscription deletion', {
      subscription_id: subscription.id,
      customer_id: stripeCustomerId
    }, eventId);

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_id: null,
        subscription_status: 'canceled',
        current_period_end: null,
        monthly_voice_generations_used: 0,
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
      log('ERROR', 'Failed to update profile for subscription deletion', {
        subscription_id: subscription.id,
        customer_id: stripeCustomerId,
        error: error.message
      }, eventId);
      throw error;
    }

    const duration = Date.now() - startTime;
    log('INFO', 'Subscription deletion completed successfully', {
      subscription_id: subscription.id,
      customer_id: stripeCustomerId
    }, eventId, duration);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', 'Subscription deletion failed', {
      subscription_id: subscription.id,
      customer_id: stripeCustomerId,
      error: error.message
    }, eventId, duration);
    throw error;
  }
}

/**
 * Handles voice credits purchase
 */
async function handleVoiceCreditsPurchase(paymentIntent: Stripe.PaymentIntent, supabaseUserId: string, eventId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    log('DEBUG', 'Processing voice credits purchase', {
      payment_intent_id: paymentIntent.id,
      user_id: supabaseUserId,
      status: paymentIntent.status
    }, eventId);

    if (paymentIntent.status !== 'succeeded') {
      log('WARN', 'Payment not succeeded, skipping credit increment', {
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status
      }, eventId);
      return;
    }

    const creditsToAdd = 20; // Could be made configurable
    const { error: creditError } = await supabaseAdmin.rpc('increment_voice_credits', {
      user_uuid: supabaseUserId,
      credits_to_add: creditsToAdd
    });

    if (creditError) {
      log('ERROR', 'Failed to increment voice credits', {
        payment_intent_id: paymentIntent.id,
        user_id: supabaseUserId,
        credits_to_add: creditsToAdd,
        error: creditError.message
      }, eventId);
      throw creditError;
    }

    const duration = Date.now() - startTime;
    log('INFO', 'Voice credits purchase completed successfully', {
      payment_intent_id: paymentIntent.id,
      user_id: supabaseUserId,
      credits_added: creditsToAdd
    }, eventId, duration);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', 'Voice credits purchase failed', {
      payment_intent_id: paymentIntent.id,
      user_id: supabaseUserId,
      error: error.message
    }, eventId, duration);
    throw error;
  }
}

/**
 * Handles invoice payment (subscription renewal)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice, supabaseUserId: string, eventId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    log('DEBUG', 'Processing invoice payment', {
      invoice_id: invoice.id,
      user_id: supabaseUserId,
      billing_reason: invoice.billing_reason,
      paid: invoice.paid
    }, eventId);

    if (!invoice.paid || !invoice.subscription || invoice.billing_reason !== 'subscription_cycle') {
      log('DEBUG', 'Skipping invoice - not a subscription renewal', {
        invoice_id: invoice.id,
        billing_reason: invoice.billing_reason,
        paid: invoice.paid
      }, eventId);
      return;
    }

    const subscriptionId = invoice.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        current_period_end: currentPeriodEnd.toISOString(),
        monthly_voice_generations_used: 0, // Reset monthly usage
      })
      .eq('id', supabaseUserId);

    if (error) {
      log('ERROR', 'Failed to update profile for invoice payment', {
        invoice_id: invoice.id,
        user_id: supabaseUserId,
        error: error.message
      }, eventId);
      throw error;
    }

    const duration = Date.now() - startTime;
    log('INFO', 'Invoice payment processed successfully', {
      invoice_id: invoice.id,
      user_id: supabaseUserId,
      subscription_id: subscriptionId
    }, eventId, duration);

  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', 'Invoice payment processing failed', {
      invoice_id: invoice.id,
      user_id: supabaseUserId,
      error: error.message
    }, eventId, duration);
    throw error;
  }
}

// --- Main Server Logic ---
serve(async (req: Request) => {
  const requestStartTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    log('DEBUG', 'Handling OPTIONS preflight request');
=======

const supabaseAdmin = createClient(SUPABASE_URL!, APP_SERVICE_ROLE_KEY!);

console.log('[WEBHOOK_DEBUG] Stripe Webhook Function Initialized successfully.');

// --- Lógica Principal del Servidor ---
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    console.log('[WEBHOOK_DEBUG] Handling OPTIONS preflight request');
>>>>>>> origin/main
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) {
<<<<<<< HEAD
    log('ERROR', 'Missing Stripe-Signature header');
=======
    console.error('[WEBHOOK_ERROR] FAIL: Missing Stripe-Signature header');
>>>>>>> origin/main
    return new Response('Missing Stripe-Signature header', { status: 400 });
  }

  const body = await req.text();

  try {
<<<<<<< HEAD
    // 1. Verify webhook signature
    log('DEBUG', 'Verifying webhook signature');
=======
    // 1. Verifica la firma
    console.log('[WEBHOOK_DEBUG] Verifying webhook signature...');
>>>>>>> origin/main
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_SIGNING_SECRET!,
      undefined,
      cryptoProvider
    );
<<<<<<< HEAD
    
    log('INFO', 'Webhook event received', {
      event_id: event.id,
      event_type: event.type,
      created: new Date(event.created * 1000).toISOString()
    }, event.id);

    // 2. Identify user with improved error handling
=======
    console.log(`[WEBHOOK_INFO] Webhook event received: ${event.id}, Type: ${event.type}`);

    // 2. Maneja el evento
>>>>>>> origin/main
    const eventObject = event.data.object as any;
    let supabaseUserId: string | null = null;
    let stripeCustomerId: string | null = null;

<<<<<<< HEAD
    const userIdentificationStart = Date.now();
    
    // Extract customer ID
    if (eventObject.customer) {
      stripeCustomerId = eventObject.customer;
      log('DEBUG', 'Found stripe customer ID from event', {
        customer_id: stripeCustomerId
      }, event.id);
    }

    // Try to get user ID from event metadata
    if (eventObject.metadata?.supabase_user_id) {
      supabaseUserId = eventObject.metadata.supabase_user_id;
      log('DEBUG', 'Found user ID from event metadata', {
        user_id: supabaseUserId
      }, event.id);
    }
    // Try to get user ID from customer metadata
    else if (stripeCustomerId) {
      try {
        log('DEBUG', 'Attempting to retrieve user ID from customer metadata', {
          customer_id: stripeCustomerId
        }, event.id);
        
        const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
        if (!customer.deleted && customer.metadata?.supabase_user_id) {
          supabaseUserId = customer.metadata.supabase_user_id;
          log('DEBUG', 'Found user ID from customer metadata', {
            user_id: supabaseUserId
          }, event.id);
        }
      } catch (customerError) {
        log('WARN', 'Failed to retrieve customer metadata', {
          customer_id: stripeCustomerId,
          error: customerError.message
        }, event.id);
      }
    }

    // Final fallback: query profiles table
    if (!supabaseUserId && stripeCustomerId) {
      try {
        log('DEBUG', 'Querying profiles table for user ID', {
          customer_id: stripeCustomerId
        }, event.id);
        
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', stripeCustomerId)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          log('ERROR', 'Database error querying profiles', {
            customer_id: stripeCustomerId,
            error: profileError.message
          }, event.id);
        } else if (profile) {
          supabaseUserId = profile.id;
          log('DEBUG', 'Found user ID from profiles table', {
            user_id: supabaseUserId
          }, event.id);
        }
      } catch (dbError) {
        log('ERROR', 'Exception querying profiles table', {
          customer_id: stripeCustomerId,
          error: dbError.message
        }, event.id);
      }
    }

    const userIdentificationDuration = Date.now() - userIdentificationStart;
    
    // Validate user identification
    if (!supabaseUserId && !['customer.subscription.deleted', 'customer.deleted'].includes(event.type)) {
      log('ERROR', 'User identification failed', {
        customer_id: stripeCustomerId,
        tried_metadata: !!eventObject.metadata?.supabase_user_id,
        tried_customer: !!stripeCustomerId,
        identification_duration_ms: userIdentificationDuration
      }, event.id);
      
      return new Response(JSON.stringify({ 
        received: true, 
        error: 'User identification failed',
        event_id: event.id 
      }), { status: 200 });
    }
    
    if (supabaseUserId) {
      log('INFO', 'User identified successfully', {
        user_id: supabaseUserId,
        customer_id: stripeCustomerId,
        identification_duration_ms: userIdentificationDuration
      }, event.id);
    }

    // 3. Process event with dedicated handlers
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = eventObject as Stripe.Checkout.Session;
          log('INFO', 'Processing checkout session completion', {
            session_id: session.id,
            mode: session.mode,
            payment_status: session.payment_status
          }, event.id);

          if (session.mode === 'subscription') {
            if (!supabaseUserId) {
              throw new Error('Cannot process subscription checkout: missing user ID');
            }

            const subscriptionId = session.subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            await handleSubscriptionCreated(subscription, supabaseUserId, event.id);

          } else if (session.mode === 'payment') {
            const paymentIntentId = session.payment_intent as string;
            if (!paymentIntentId) {
              log('ERROR', 'Payment Intent ID missing in session', {
                session_id: session.id
              }, event.id);
              return new Response(JSON.stringify({ 
                received: true, 
                error: 'Missing payment intent ID' 
              }), { status: 200 });
            }

            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
              
              // Re-verify user ID from payment intent if needed
              const userIdFromPaymentIntent = paymentIntent.metadata?.supabase_user_id;
              if (!supabaseUserId && userIdFromPaymentIntent) {
                supabaseUserId = userIdFromPaymentIntent;
                log('DEBUG', 'User ID updated from payment intent metadata', {
                  user_id: supabaseUserId
                }, event.id);
              }

              if (!supabaseUserId) {
                throw new Error('Cannot process payment: missing user ID after all checks');
              }

              const itemPurchased = paymentIntent.metadata?.item_purchased;
              log('DEBUG', 'Retrieved payment intent metadata', {
                payment_intent_id: paymentIntent.id,
                item_purchased: itemPurchased,
                metadata: paymentIntent.metadata
              }, event.id);

              if (itemPurchased === 'voice_credits') {
                await handleVoiceCreditsPurchase(paymentIntent, supabaseUserId, event.id);
              } else {
                log('INFO', 'Non-credits purchase completed', {
                  item_purchased: itemPurchased
                }, event.id);
              }
            } catch (piError) {
              log('ERROR', 'Failed to retrieve or process payment intent', {
                payment_intent_id: paymentIntentId,
                error: piError.message
              }, event.id);
              return new Response(JSON.stringify({ 
                received: true, 
                error: 'Failed to process payment intent' 
              }), { status: 200 });
            }
          }
          break;
        }

        case 'invoice.paid': {
          const invoice = eventObject as Stripe.Invoice;
          if (!supabaseUserId) {
            throw new Error(`Cannot process invoice ${invoice.id}: missing user ID`);
          }
          await handleInvoicePaid(invoice, supabaseUserId, event.id);
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = eventObject as Stripe.Subscription;
          if (!supabaseUserId) {
            throw new Error(`Cannot process subscription update ${subscription.id}: missing user ID`);
          }
          await handleSubscriptionUpdated(subscription, supabaseUserId, event.id);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = eventObject as Stripe.Subscription;
          if (!stripeCustomerId) {
            throw new Error(`Cannot process subscription deletion ${subscription.id}: missing customer ID`);
          }
          await handleSubscriptionDeleted(subscription, stripeCustomerId, event.id);
          break;
        }

        default:
          log('INFO', 'Unhandled event type', {
            event_type: event.type
          }, event.id);
      }
    } catch (handlerError) {
      log('ERROR', 'Event handler failed', {
        event_type: event.type,
        error: handlerError.message,
        stack: handlerError.stack
      }, event.id);
      throw handlerError;
    }

    // 4. Success response
    const totalDuration = Date.now() - requestStartTime;
    log('INFO', 'Webhook processed successfully', {
      total_duration_ms: totalDuration
    }, event.id);
    
    return new Response(JSON.stringify({ 
      received: true,
      event_id: event.id,
      processed_at: new Date().toISOString()
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    const totalDuration = Date.now() - requestStartTime;
    const isSignatureError = err.type === 'StripeSignatureVerificationError';
    const status = isSignatureError ? 400 : 500;
    
    log('ERROR', 'Webhook processing failed', {
      error: err.message,
      error_type: err.type || 'Unknown',
      stack: err.stack,
      total_duration_ms: totalDuration,
      is_signature_error: isSignatureError
    });
    
    return new Response(JSON.stringify({
      error: err.message,
      error_type: err.type || 'Unknown',
      processed_at: new Date().toISOString()
    }), { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
=======
    // --- Inicio: Lógica robusta para identificar al usuario ---
    console.log('[WEBHOOK_DEBUG] Attempting to identify user...');
    if (eventObject.customer) {
      stripeCustomerId = eventObject.customer;
      console.log(`[WEBHOOK_DEBUG] Found stripeCustomerId from event object: ${stripeCustomerId}`);
    }

    if (eventObject.metadata?.supabase_user_id) {
      supabaseUserId = eventObject.metadata.supabase_user_id;
      console.log(`[WEBHOOK_DEBUG] Found supabaseUserId from event metadata: ${supabaseUserId}`);
    }
    else if (stripeCustomerId) {
      console.log(`[WEBHOOK_DEBUG] supabaseUserId not in event metadata, trying customer metadata for ${stripeCustomerId}...`);
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
        if (!customer.deleted && customer.metadata?.supabase_user_id) {
          supabaseUserId = customer.metadata.supabase_user_id;
          console.log(`[WEBHOOK_DEBUG] Found supabaseUserId from customer metadata: ${supabaseUserId}`);
        } else {
          console.log(`[WEBHOOK_DEBUG] supabase_user_id not found in customer metadata or customer deleted.`);
        }
      } catch (customerError) { console.warn(`[WEBHOOK_WARN] Error retrieving customer ${stripeCustomerId}:`, customerError.message); }
    }

    if (!supabaseUserId && stripeCustomerId) {
      console.log(`[WEBHOOK_DEBUG] supabaseUserId not found yet, querying profiles table for customer ${stripeCustomerId}...`);
      try {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles').select('id').eq('stripe_customer_id', stripeCustomerId).single();
        if (profileError && profileError.code !== 'PGRST116') { // Ignore 'not found' error, log others
          console.error(`[WEBHOOK_ERROR] DB error querying profiles for ${stripeCustomerId}:`, profileError);
        } else if (profile) {
          supabaseUserId = profile.id;
          console.log(`[WEBHOOK_DEBUG] Found supabaseUserId ${supabaseUserId} from profiles table.`);
        } else {
          console.log(`[WEBHOOK_DEBUG] Profile not found for stripe_customer_id ${stripeCustomerId}.`);
        }
      } catch (dbError) {
        console.error(`[WEBHOOK_ERROR] Exception querying profiles table for customer ${stripeCustomerId}:`, dbError.message);
      }
    }

    if (!supabaseUserId && !['customer.subscription.deleted', 'customer.deleted'].includes(event.type)) {
      console.error(`[WEBHOOK_ERROR] CRITICAL FAIL: Could not determine supabase_user_id for event ${event.id} (Type: ${event.type}). Customer: ${stripeCustomerId}. Cannot process update.`);
      return new Response(JSON.stringify({ received: true, error: 'Webhook Error: User identification failed.' }), { status: 200 });
    } else if (supabaseUserId) {
      console.log(`[WEBHOOK_DEBUG] User identified successfully: supabaseUserId=${supabaseUserId}`);
    } else {
      console.log(`[WEBHOOK_DEBUG] Proceeding without supabaseUserId (likely a customer deletion event).`);
    }
    // --- Fin: Lógica robusta para identificar al usuario ---

    // --- Manejadores de Eventos Específicos ---
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = eventObject as Stripe.Checkout.Session;
        console.log(`[WEBHOOK_INFO] Processing checkout.session.completed for session ${session.id}, Mode: ${session.mode}`);

        // --- Suscripción Iniciada ---
        if (session.mode === 'subscription') {
          if (!supabaseUserId) throw new Error(`[WEBHOOK_ERROR] Cannot process subscription checkout ${session.id}: missing supabase_user_id.`);

          const subscriptionId = session.subscription as string;
          console.log(`[WEBHOOK_DEBUG] Retrieving subscription ${subscriptionId}`);
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          const status = subscription.status;
          const currentPeriodStart = new Date(subscription.current_period_start * 1000);
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          
          console.log(`[WEBHOOK_INFO] Updating profile for new subscription ${subscription.id} for user ${supabaseUserId}`);
          console.log(`[WEBHOOK_DEBUG] Subscription details: Status=${status}, Period=${currentPeriodStart.toISOString()} to ${currentPeriodEnd.toISOString()}`);
          
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription_id: subscription.id, // También mantener este campo si existe en tu esquema
              subscription_status: status === 'active' ? 'active' : status, // Asegurar que sea 'active' para suscripciones activas
              stripe_customer_id: stripeCustomerId,
              period_start_date: currentPeriodStart.toISOString(), // 1. Fecha de inicio del periodo
              current_period_end: currentPeriodEnd.toISOString(), // 4. Fecha de fin del periodo
              voice_credits: 10, // 3. Dar 10 créditos de voz al activar premium
              monthly_voice_generations_used: 0, // Resetear contador mensual
            })
            .eq('id', supabaseUserId);

          if (error) {
            console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for subscription ${subscription.id}:`, error);
            throw error; // Relanza para el catch general
          } else {
            console.log(`[WEBHOOK_INFO] OK: Profile updated for new subscription ${subscription.id}. User now has premium with 10 voice credits.`);
          }

          // --- Compra Única (Créditos) - CÓDIGO CORREGIDO + DEBUGGING ---
        } else if (session.mode === 'payment') {
          console.log(`[WEBHOOK_DEBUG] Handling checkout.session.completed for one-time payment: ${session.id}`);

          const paymentIntentId = session.payment_intent as string;
          if (!paymentIntentId) {
            console.error(`[WEBHOOK_ERROR] FAIL: Payment Intent ID missing in session ${session.id} for mode=payment.`);
            return new Response(JSON.stringify({ received: true, error: 'Missing payment intent ID' }), { status: 200 });
          }
          console.log(`[WEBHOOK_DEBUG] Found PaymentIntent ID from session: ${paymentIntentId}`);

          let paymentIntent: Stripe.PaymentIntent;
          try {
            console.log(`[WEBHOOK_DEBUG] Retrieving PaymentIntent ${paymentIntentId}...`);
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            console.log(`[WEBHOOK_DEBUG] Retrieved PaymentIntent ${paymentIntent.id}. Status: ${paymentIntent.status}`);
          } catch (piError) {
            console.error(`[WEBHOOK_ERROR] FAIL: Could not retrieve PaymentIntent ${paymentIntentId}:`, piError);
            return new Response(JSON.stringify({ received: true, error: 'Failed to retrieve payment intent' }), { status: 200 });
          }

          // !! LEER METADATA DEL PAYMENT INTENT RECUPERADO !!
          const piMetadata = paymentIntent.metadata; // Objeto metadata completo
          const itemPurchased = piMetadata?.item_purchased;
          const userIdFromMetadata = piMetadata?.supabase_user_id;

          // -------- AÑADIR ESTOS LOGS --------
          console.log(`[WEBHOOK_DEBUG] Retrieved PaymentIntent Metadata: ${JSON.stringify(piMetadata)}`);
          console.log(`[WEBHOOK_DEBUG] Value read for itemPurchased: "${itemPurchased}" (Type: ${typeof itemPurchased})`);
          // -----------------------------------

          // Re-verificar supabaseUserId si no se obtuvo antes
          if (!supabaseUserId && userIdFromMetadata) {
            supabaseUserId = userIdFromMetadata;
            console.log(`[WEBHOOK_DEBUG] supabaseUserId updated from PaymentIntent metadata: ${supabaseUserId}`);
          }

          if (!supabaseUserId) {
            console.error(`[WEBHOOK_ERROR] FAIL: Cannot process payment intent ${paymentIntent.id}: missing supabase_user_id after all checks.`);
            return new Response(JSON.stringify({ received: true, error: 'User identification failed for payment' }), { status: 200 });
          }

          // Comparar con la cadena EXACTA 'voice_credits'
          if (itemPurchased === 'voice_credits') {
            console.log(`[WEBHOOK_DEBUG] Condition 'itemPurchased === "voice_credits"' is TRUE.`);

            if (paymentIntent.status !== 'succeeded') {
              console.warn(`[WEBHOOK_WARN] PaymentIntent ${paymentIntent.id} status is ${paymentIntent.status}, not 'succeeded'. Skipping credit increment.`);
              return new Response(JSON.stringify({ received: true, status: 'payment_not_succeeded' }), { status: 200 });
            }

            // ¡¡¡ VERIFICA ESTE NÚMERO !!!
            const creditsToAdd = 10; // 10 créditos por compra
            console.log(`[WEBHOOK_INFO] Attempting to add ${creditsToAdd} voice credits to user ${supabaseUserId} via RPC.`);

            const { error: creditError } = await supabaseAdmin.rpc('increment_voice_credits', {
              user_uuid: supabaseUserId,
              credits_to_add: creditsToAdd
            });

            if (creditError) {
              console.error(`[WEBHOOK_ERROR] FAIL: Error adding voice credits via RPC for user ${supabaseUserId} from PI ${paymentIntent.id}:`, creditError);
              return new Response(JSON.stringify({ received: true, error: 'Failed to update credits in DB' }), { status: 200 });
            } else {
              console.log(`[WEBHOOK_INFO] OK: Added ${creditsToAdd} voice credits via RPC for user ${supabaseUserId} from PI ${paymentIntent.id}.`);
            }
          } else if (itemPurchased === 'illustrated_story') {
            console.log(`[WEBHOOK_DEBUG] Condition 'itemPurchased === "illustrated_story"' is TRUE.`);

            if (paymentIntent.status !== 'succeeded') {
              console.warn(`[WEBHOOK_WARN] PaymentIntent ${paymentIntent.id} status is ${paymentIntent.status}, not 'succeeded'. Skipping illustrated story generation.`);
              return new Response(JSON.stringify({ received: true, status: 'payment_not_succeeded' }), { status: 200 });
            }

            // Extract story data from metadata (content will be fetched from database)
            const storyId = piMetadata?.story_id;
            const chapterId = piMetadata?.chapter_id;
            const storyTitle = piMetadata?.story_title;
            const _storyAuthor = piMetadata?.story_author; // Prefixed with underscore as it's not used

            if (!storyId || !chapterId || !storyTitle) {
              console.error(`[WEBHOOK_ERROR] FAIL: Missing required story data in metadata for illustrated story generation.`);
              return new Response(JSON.stringify({ received: true, error: 'Missing story data for generation' }), { status: 200 });
            }

            console.log(`[WEBHOOK_INFO] Illustrated story payment processed successfully for user ${supabaseUserId}, story ${storyId}, chapter ${chapterId}`);
            console.log(`[WEBHOOK_INFO] User will be able to generate illustrated story manually on story page.`);
          } else {
            // Este log ahora nos dirá por qué falló la comparación
            console.log(`[WEBHOOK_INFO] Condition 'itemPurchased === "voice_credits"' or 'illustrated_story' is FALSE. Actual value: "${itemPurchased}". No action taken.`);
          }
        }
        break;
      } // Fin case 'checkout.session.completed'

      case 'invoice.paid': {
        const invoice = eventObject as Stripe.Invoice;
        console.log(`[WEBHOOK_INFO] Processing invoice.paid for invoice ${invoice.id}, Billing Reason: ${invoice.billing_reason}`);
        if (!supabaseUserId) throw new Error(`[WEBHOOK_ERROR] Cannot process invoice ${invoice.id}: missing supabase_user_id.`);

        if (invoice.paid && invoice.subscription && invoice.billing_reason === 'subscription_cycle') { // Procesar solo renovaciones aquí
          const subscriptionId = invoice.subscription as string;
          console.log(`[WEBHOOK_DEBUG] Retrieving subscription ${subscriptionId} for renewal.`);
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          console.log('Subscription:', subscription);
          console.log('Periodo actual:', 
            new Date(subscription.current_period_start * 1000).toISOString(),
            '→',
            new Date(subscription.current_period_end   * 1000).toISOString()
          );
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

          console.log(`[WEBHOOK_INFO] Resetting monthly usage for user ${supabaseUserId} due to subscription renewal.`);
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              current_period_end: currentPeriodEnd.toISOString(),
              monthly_voice_generations_used: 0, // Resetear uso mensual
            })
            .eq('id', supabaseUserId);

          if (error) {
            console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for invoice.paid ${invoice.id}:`, error);
            throw error;
          } else {
            console.log(`[WEBHOOK_INFO] OK: Profile updated (monthly usage reset) for invoice.paid ${invoice.id} (User: ${supabaseUserId}).`);
          }
        } else {
          console.log(`[WEBHOOK_INFO] Invoice ${invoice.id} paid, but not a subscription renewal or already handled.`);
        }
        break;
      } // Fin case 'invoice.paid'

      case 'customer.subscription.updated': {
        const subscription = eventObject as Stripe.Subscription;
        console.log(`[WEBHOOK_INFO] Processing customer.subscription.updated for subscription ${subscription.id}, Status: ${subscription.status}`);
        if (!supabaseUserId) throw new Error(`[WEBHOOK_ERROR] Cannot process subscription update ${subscription.id}: missing supabase_user_id.`);

        const status = subscription.status;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        const updatePayload: { [key: string]: any } = {
          subscription_status: status,
          current_period_end: currentPeriodEnd.toISOString(),
        };

        if (subscription.cancel_at_period_end) {
          console.log(`[WEBHOOK_INFO] Subscription ${subscription.id} scheduled for cancellation at period end.`);
        }

        console.log(`[WEBHOOK_INFO] Updating profile for customer.subscription.updated ${subscription.id}`);
        const { error } = await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
          .eq('id', supabaseUserId);

        if (error) {
          console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for customer.subscription.updated ${subscription.id}:`, error);
          throw error;
        } else {
          console.log(`[WEBHOOK_INFO] OK: Profile updated for customer.subscription.updated ${subscription.id}.`);
        }
        break;
      } // Fin case 'customer.subscription.updated'

      case 'customer.subscription.deleted': {
        const subscription = eventObject as Stripe.Subscription;
        console.log(`[WEBHOOK_INFO] Processing customer.subscription.deleted for subscription ${subscription.id}`);

        if (!stripeCustomerId) throw new Error(`[WEBHOOK_ERROR] Cannot process subscription delete ${subscription.id}: missing stripe_customer_id.`);

        console.log(`[WEBHOOK_INFO] Updating profile for customer.subscription.deleted using customer ID ${stripeCustomerId}`);
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            current_period_end: null,
            monthly_voice_generations_used: 0,
            // voice_credits: 0, // Comentado para conservar créditos comprados
          })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error(`[WEBHOOK_ERROR] FAIL: Error updating profile for customer.subscription.deleted ${subscription.id}:`, error);
        } else {
          console.log(`[WEBHOOK_INFO] OK: Profile updated for customer.subscription.deleted ${subscription.id}.`);
        }
        break;
      } // Fin case 'customer.subscription.deleted'

      default:
        console.log(`[WEBHOOK_INFO] Unhandled event type: ${event.type}. ID: ${event.id}`);
    }

    // 3. Responde a Stripe
    console.log(`[WEBHOOK_INFO] Webhook processed successfully for event: ${event.id}`);
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[WEBHOOK_ERROR] FATAL: Webhook handler error:', err);
    const isSignatureError = err.type === 'StripeSignatureVerificationError';
    const status = isSignatureError ? 400 : 500;
    return new Response(`Webhook Error: ${err.message}`, { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
>>>>>>> origin/main
  }
});