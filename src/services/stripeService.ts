import { loadStripe, Stripe } from '@stripe/stripe-js';

// Singleton pattern para cargar Stripe.js solo una vez
let stripePromise: Promise<Stripe | null>;

/**
 * Obtiene la instancia de Stripe.js inicializada con la clave publicable
 * @returns Promise con la instancia de Stripe o null si hay error
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("VITE_STRIPE_PUBLISHABLE_KEY no está configurada en .env");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

/**
 * Crea una sesión de checkout llamando a la Edge Function de Supabase
 * @param item Tipo de item a comprar ('premium' para suscripción o 'credits' para créditos de voz)
 * @returns Objeto con la URL de checkout o un mensaje de error
 */
export interface CheckoutSessionResponse {
  url?: string;
  error?: string;
}

export const createCheckoutSession = async (
  item: 'premium' | 'credits'
): Promise<CheckoutSessionResponse> => {
  console.log(`Solicitando sesión de checkout para: ${item}`);

  try {
    // 1. Obtener la sesión actual de Supabase para el token
    const { supabase } = await import('../supabaseClient');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      console.error('Error al obtener la sesión de Supabase o usuario no autenticado:', sessionError);
      return { error: 'Usuario no autenticado o error de sesión.' };
    }

    const token = sessionData.session.access_token;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!anonKey) {
      console.error("VITE_SUPABASE_ANON_KEY no está configurada.");
      return { error: "Error de configuración del cliente." };
    }

    // 2. Llamar a la Edge Function usando fetch
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'apikey': anonKey, // Necesaria para llamar a functions
        },
        body: JSON.stringify({ item }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Error en la respuesta de la Edge Function:', responseData);
      throw new Error(responseData.error || `Error ${response.status}`);
    }

    console.log('URL de checkout recibida:', responseData.url);
    return { url: responseData.url };

  } catch (error) {
    console.error('Error al llamar a la función create-checkout-session:', error);
    return { error: `No se pudo iniciar el pago: ${error.message}` };
  }
};

/**
 * Crea una sesión del portal de cliente de Stripe para gestionar suscripciones
 * @returns Objeto con la URL del portal o un mensaje de error
 */
export interface CustomerPortalSessionResponse {
  url?: string;
  error?: string;
}

export const createCustomerPortalSession = async (): Promise<CustomerPortalSessionResponse> => {
  console.log('Solicitando sesión del portal de cliente de Stripe');

  try {
    // 1. Obtener la sesión actual de Supabase para el token
    const { supabase } = await import('../supabaseClient');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      console.error('Error al obtener la sesión de Supabase o usuario no autenticado:', sessionError);
      return { error: 'Usuario no autenticado o error de sesión.' };
    }

    const token = sessionData.session.access_token;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!anonKey) {
      console.error("VITE_SUPABASE_ANON_KEY no está configurada.");
      return { error: "Error de configuración del cliente." };
    }

    // 2. Llamar a la Edge Function usando fetch
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-customer-portal-session`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'apikey': anonKey, // Necesaria para llamar a functions
        }
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Error en la respuesta de la Edge Function:', responseData);
      throw new Error(responseData.error || `Error ${response.status}`);
    }

    console.log('URL del portal de cliente recibida:', responseData.url);
    return { url: responseData.url };

  } catch (error) {
    console.error('Error al llamar a la función create-customer-portal-session:', error);
    return { error: `No se pudo acceder al portal de cliente: ${error.message}` };
  }
};
