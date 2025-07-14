// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.13.0?target=deno';
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
}

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();
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
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) {
    log('ERROR', 'Missing Stripe-Signature header');
    return new Response('Missing Stripe-Signature header', { status: 400 });
  }

  const body = await req.text();

  try {
    // 1. Verify webhook signature
    log('DEBUG', 'Verifying webhook signature');
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_SIGNING_SECRET!,
      undefined,
      cryptoProvider
    );
    
    log('INFO', 'Webhook event received', {
      event_id: event.id,
      event_type: event.type,
      created: new Date(event.created * 1000).toISOString()
    }, event.id);

    // 2. Identify user with improved error handling
    const eventObject = event.data.object as any;
    let supabaseUserId: string | null = null;
    let stripeCustomerId: string | null = null;

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
  }
});