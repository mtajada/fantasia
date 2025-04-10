// supabase/edge-functions/generate-audio/index.ts
// Lógica: Premium: verifica límite mensual (<20), si no, verifica créditos comprados (>0). Incrementa/decrementa según corresponda.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.40.0"; // Usa una versión más reciente si es posible
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';
// --- Configuración ---
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openaiApiKey) throw new Error("OPENAI_API_KEY environment variable not set");
const openai = new OpenAI({
  apiKey: openaiApiKey
});
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('APP_SERVICE_ROLE_KEY'); // ¡Service Role Key!
if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase URL or Service Role Key not set");
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
// --- Fin Configuración ---
serve(async (req) => {
  // Manejo Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  let userId = null;
  let creditSource = 'none';
  try {
    // --- 1. Autenticación ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({
      error: 'Token inválido.'
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({
      error: 'No autenticado.'
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    userId = user.id;
    console.log(`generate-audio: User Auth: ${userId}`);
    // --- Fin Autenticación ---
    // --- 2. Obtener Perfil y Verificar Permiso/Límites/Créditos ---
    console.log(`generate-audio: Fetching profile for user ${userId}...`);
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('subscription_status, voice_credits, monthly_voice_generations_used').eq('id', userId).maybeSingle();
    if (profileError && profileError.code !== 'PGRST116') throw new Error(`Error perfil: ${profileError.message}`);
    if (!profile) throw new Error(`Perfil no encontrado: ${userId}`);
    console.log(`generate-audio: Profile data for ${userId}:`, profile);
    const isPremium = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
    if (!isPremium) {
      console.log(`generate-audio: Denegado - Usuario ${userId} no es premium (${profile.subscription_status}).`);
      return new Response(JSON.stringify({
        error: 'La narración de voz requiere Premium.'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const monthlyUsed = profile.monthly_voice_generations_used ?? 0;
    if (monthlyUsed < 20) {
      console.log(`generate-audio: Autorizado - Usuario ${userId} (Premium) usa generación mensual (${monthlyUsed + 1}/20).`);
      creditSource = 'monthly';
    } else {
      const purchasedCredits = profile.voice_credits ?? 0;
      if (purchasedCredits > 0) {
        console.log(`generate-audio: Autorizado - Usuario ${userId} (Premium) usa crédito comprado (${purchasedCredits} restantes). Límite mensual alcanzado.`);
        creditSource = 'purchased';
      } else {
        console.log(`generate-audio: Denegado - Usuario ${userId} (Premium) sin límite mensual ni créditos comprados.`);
        return new Response(JSON.stringify({
          error: 'Límite mensual y créditos agotados.'
        }), {
          status: 402,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    console.log(`generate-audio: User ${userId} authorized using source: ${creditSource}`);
    // --- Fin Obtener Perfil y Verificar Permiso/Límites/Créditos ---
    // --- 3. Procesar Solicitud y Generar Audio ---
    const { text, voice = 'alloy', model = 'tts-1' } = await req.json(); // Proporcionar defaults
    if (!text) return new Response(JSON.stringify({
      error: 'Texto requerido'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    console.log(`generate-audio: Generando audio para ${userId} via OpenAI...`);
    const response = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`generate-audio: OpenAI API error for user ${userId}: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Error de OpenAI: ${response.statusText}`);
    }
    const audioBuffer = await response.arrayBuffer();
    console.log(`generate-audio: Audio generado con éxito para ${userId}.`);
    // --- Fin Generar Audio ---
    // --- 4. Actualizar Contador/Crédito (Post-Éxito) ---
    console.log(`generate-audio: Actualizando uso para ${userId} (Source: ${creditSource})...`);
    let rpcError = null;
    if (creditSource === 'monthly') {
      const { error } = await supabaseAdmin.rpc('increment_monthly_voice_usage', {
        user_uuid: userId
      });
      rpcError = error;
      if (!rpcError) console.log(`generate-audio: Uso mensual incrementado para ${userId}.`);
    } else if (creditSource === 'purchased') {
      const { data: rpcData, error } = await supabaseAdmin.rpc('decrement_voice_credits', {
        user_uuid: userId
      });
      rpcError = error;
      if (!rpcError && rpcData !== -1) console.log(`generate-audio: Crédito comprado decrementado para ${userId}. Nuevo saldo: ${rpcData}`);
      else if (!rpcError && rpcData === -1) console.warn(`generate-audio: decrement_voice_credits devolvió -1 para ${userId}.`);
    }
    if (rpcError) {
      console.error(`CRITICAL: Fallo al actualizar ${creditSource} para ${userId} post-generación. Error:`, rpcError);
    }
    // --- Fin Actualizar Contador/Crédito ---
    // --- 5. Devolver Respuesta de Audio ---
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg'
      } // O el Content-Type correcto
    });
    // --- Fin Devolver Respuesta ---
  } catch (error) {
    console.error(`Error in generate-audio function for user ${userId || 'UNKNOWN'}:`, error);
    let errorMessage = 'Error interno al generar el audio.';
    if (error instanceof Error) errorMessage = error.message;
    const status = error?.status || 500;
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
