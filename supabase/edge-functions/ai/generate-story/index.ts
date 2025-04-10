// supabase/edge-functions/generate-story/index.ts
// v3: Mejora prompt y limpieza para evitar números ("1.", "2.") en la salida.
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
// --- Configuración (sin cambios) ---
const API_KEY = Deno.env.get("GEMINI_API_KEY");
if (!API_KEY) throw new Error("GEMINI_API_KEY environment variable not set");
const genAI = new GoogleGenerativeAI(API_KEY);
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !APP_SERVICE_ROLE_KEY) throw new Error("Supabase URL or Service Role Key not set");
const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);
const modelName = "gemini-2.0-flash-thinking-exp-01-21";
console.log(`generate-story: Using model: ${modelName}`);
const model = genAI.getGenerativeModel({
  model: modelName
});
// --- Funciones Helper ---
function createSystemPrompt(language, childAge, specialNeed) {
  console.log(`[Helper] createSystemPrompt: lang=${language}, age=${childAge}, need=${specialNeed}`);
  let base = `Eres un escritor experto de cuentos infantiles creativos y educativos. Escribe siempre en ${language}.`;
  base += ` El público objetivo son niños de ${childAge} años.`;
  if (specialNeed && specialNeed !== 'Ninguna') {
    base += ` Adapta sutilmente la historia considerando ${specialNeed}. Prioriza claridad y tono positivo.`;
  }
  base += ` Sé creativo y asegúrate de que la historia sea coherente.`;
  return base;
}
/** MODIFICADO: Crea la petición específica para CONTENIDO y TÍTULO */ function createUserPromptContent({ options }) {
  console.log(`[Helper] createUserPromptContent: options=`, options);
  const char = options.character;
  let request = `Crea un cuento infantil ${options.duration}. Género: ${options.genre}. Moraleja o tema principal: ${options.moral}.`;
  request += ` El personaje principal es ${char.name}`;
  if (char.profession) request += `, de profesión ${char.profession}`;
  if (char.hobbies?.length) request += `, le gusta ${char.hobbies.join(' y ')}`;
  if (char.personality) request += `, y tiene una personalidad ${char.personality}`;
  request += `.\n\n`;
  // --- INSTRUCCIÓN DE FORMATO MODIFICADA ---
  request += `### FORMATO DE RESPUESTA OBLIGATORIO ###
LÍNEA 1: Escribe SOLAMENTE el título corto y atractivo (máximo 5-7 palabras).
LÍNEA 2: Deja esta línea COMPLETAMENTE VACÍA.
LÍNEA 3 EN ADELANTE: Escribe el CUENTO completo. NO repitas el título en el cuerpo del cuento. NO añadas números de párrafo.
### FIN DEL FORMATO ###`;
  // Usar etiquetas como ### y descripciones claras en lugar de listas numeradas
  // puede reducir la probabilidad de que la IA las copie.
  return request;
}
/** MODIFICADO: Limpia el texto generado (contenido o título) */ function cleanGeneratedText(text, type) {
  const defaultText = type === 'title' ? `Una Nueva Aventura` : 'Hubo un problema al generar el texto.';
  if (!text) {
    console.warn(`[Helper] cleanGeneratedText (${type}): Input text is empty. Returning default.`);
    return defaultText;
  }
  // Log antes de limpiar
  // console.log(`[Helper] cleanGeneratedText (${type}) - BEFORE: "${text.substring(0, 100)}..."`);
  let cleaned = text.trim();
  // --- LIMPIEZA MEJORADA ---
  // 1. Quitar prefijos comunes que a veces añade la IA (igual que antes)
  cleaned = cleaned.replace(/^Título:\s*/i, '').replace(/^Title:\s*/i, '');
  cleaned = cleaned.replace(/^Contenido:\s*/i, '').replace(/^Content:\s*/i, '');
  cleaned = cleaned.replace(/^Respuesta:\s*/i, '').replace(/^Response:\s*/i, '');
  // 2. ¡NUEVO! Quitar números iniciales (como "1. ", "3. ", etc.)
  //    Esto es clave para arreglar lo que se ve en la imagen.
  //    La expresión regular busca: inicio de línea (^), uno o más dígitos (\d+),
  //    un punto (\.), y uno o más espacios (\s+).
  cleaned = cleaned.replace(/^\d+\.\s+/, '');
  // 3. Quitar comillas al inicio/final (más útil para títulos) (igual que antes)
  if (type === 'title') {
    cleaned = cleaned.replace(/^["'“‘]|["'”’]$/g, '');
  }
  // 4. Quitar etiquetas de formato si la IA las incluyó (medida extra)
  cleaned = cleaned.replace(/###\s?(FORMATO DE RESPUESTA OBLIGATORIO|FIN DEL FORMATO|LÍNEA \d+|TITULO_INICIO|TITULO_FIN|CUENTO_INICIO|CUENTO_FIN)\s?###/gi, '');
  // Log después de limpiar
  // console.log(`[Helper] cleanGeneratedText (${type}) - AFTER: "${cleaned.substring(0, 100)}..."`);
  return cleaned.trim() || defaultText; // Devolver default si la limpieza resulta en vacío
}
// --- Fin Funciones Helper ---
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: corsHeaders
  });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Método no permitido. Usar POST.'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  let userIdForIncrement = null;
  let isPremiumUser = false;
  let userId = null;
  try {
    // --- 1. Autenticación (sin cambios) ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Token inválido.'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth Error:", authError);
      return new Response(JSON.stringify({
        error: authError?.message || 'No autenticado.'
      }), {
        status: authError?.status || 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    userId = user.id;
    console.log(`generate-story: User Auth: ${userId}`);
    // --- 2. Obtener Perfil y Verificar Límites (sin cambios) ---
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('subscription_status, monthly_stories_generated').eq('id', userId).maybeSingle(); // Quitado last_story_reset_date si no se usa
    if (profileError && profileError.code !== 'PGRST116') throw new Error(`Error perfil: ${profileError.message}`);
    if (!profile) {
      // Decidir qué hacer: ¿error o tratar como gratuito?
      console.warn(`Perfil no encontrado para ${userId}. Tratando como gratuito.`);
      // throw new Error(`Perfil no encontrado: ${userId}`);
      isPremiumUser = false;
    } else {
      isPremiumUser = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
    }
    let currentStoriesGenerated = profile?.monthly_stories_generated ?? 0;
    const FREE_STORY_LIMIT = 10; // Definir límite
    if (!isPremiumUser) {
      userIdForIncrement = userId; // Marcar para incrementar LUEGO si todo va bien
      console.log(`generate-story: Free user ${userId}. Stories generated: ${currentStoriesGenerated}/${FREE_STORY_LIMIT}`);
      // Lógica de reset simplificada (asumiendo que se hace externamente o no es necesaria aquí)
      if (currentStoriesGenerated >= FREE_STORY_LIMIT) {
        console.log(`generate-story: Free limit reached for ${userId}.`);
        return new Response(JSON.stringify({
          error: `Límite mensual (${FREE_STORY_LIMIT}) de historias gratuitas alcanzado.`
        }), {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    } else {
      console.log(`generate-story: Premium user ${userId}. No story limit.`);
    }
    // --- 3. Obtener Body y Generar Historia ---
    let params;
    try {
      params = await req.json();
      console.log("--- DEBUG: generate-story - Params Recibidos ---", params);
      // Validación MÍNIMA de params (se podrían añadir más)
      if (!params || typeof params !== 'object' || !params.options?.character || !params.language || params.childAge === undefined) {
        throw new Error("Parámetros inválidos o incompletos en el cuerpo JSON.");
      }
    } catch (error) {
      console.error(`[DEBUG generate-story] Failed to parse JSON body for user ${userId}. Error:`, error);
      if (error instanceof SyntaxError || error.message.toLowerCase().includes('json')) {
        throw new Error(`Invalid or empty JSON in request body: ${error.message}.`);
      } else {
        throw new Error(`Failed to read request body: ${error.message}`);
      }
    }
    // --- 3a. Generar Contenido y Título con la IA ---
    // Nota: Pasar params completos a createUserPromptContent si necesita más que solo options
    const systemPrompt = createSystemPrompt(params.language, params.childAge, params.specialNeed);
    const userPrompt = createUserPromptContent(params); // Usa la función modificada
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    console.log("--- DEBUG: generate-story - Combined Prompt ---\n", combinedPrompt, "\n--- END PROMPT ---");
    console.log(`generate-story: Calling AI for ${userId}...`);
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95
    };
    const contentResult = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: combinedPrompt
            }
          ]
        }
      ],
      generationConfig: generationConfig
    });
    const contentResponse = contentResult?.response;
    const fullTextResponse = contentResponse?.text?.();
    // Log detallado de la respuesta CRUDA de la IA
    console.log(`[EDGE_FUNC_DEBUG] Raw AI response for user ${userId}:
--- START RAW AI TEXT ---
${fullTextResponse || '(No text received)'}
--- END RAW AI TEXT ---`);
    if (!fullTextResponse || contentResponse?.promptFeedback?.blockReason) {
      console.error("Error en generación de contenido:", contentResponse?.promptFeedback);
      throw new Error(`Fallo al generar contenido: ${contentResponse?.promptFeedback?.blockReason || 'Respuesta vacía o bloqueada por la IA'}`);
    }
    // --- 3b. Extraer Título y Contenido (misma lógica de parseo) ---
    let rawTitle = '';
    let rawContent = '';
    const lines = fullTextResponse.trim().split('\n');
    if (lines.length >= 3 && lines[1].trim() === '') {
      rawTitle = lines[0].trim();
      rawContent = lines.slice(2).join('\n').trim();
      console.log(`[EDGE_FUNC_DEBUG] Extracted rawTitle (before cleaning): "${rawTitle}"`);
      console.log(`[EDGE_FUNC_DEBUG] Extracted rawContent starts (before cleaning): "${rawContent.substring(0, 80)}..."`);
    } else {
      // Fallback: Si el formato no es el esperado
      console.warn('[EDGE_FUNC_DEBUG] AI response format unexpected (Título /n/n Cuento...). Using default title and full response as content.');
      rawContent = fullTextResponse.trim(); // Usar toda la respuesta como contenido
      // rawTitle se quedará vacío y cleanGeneratedText usará el default
    }
    // --- 3c. Limpiar Título y Contenido (Usa la función cleanGeneratedText MODIFICADA) ---
    const finalTitle = cleanGeneratedText(rawTitle, 'title');
    const finalContent = cleanGeneratedText(rawContent, 'content');
    console.log(`generate-story: Final Title (after cleaning): "${finalTitle}"`);
    console.log(`generate-story: Final Content Length (after cleaning): ${finalContent.length}`);
    // --- 4. Incrementar Contador (Post-Éxito para Gratuitos) ---
    if (userIdForIncrement) {
      console.log(`generate-story: Incrementando contador para ${userIdForIncrement}...`);
      // Usar rpc es más seguro para incrementos atómicos si tienes concurrencia
      const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
        user_uuid: userIdForIncrement
      });
      // Si no tienes la rpc, puedes hacer update, pero es menos seguro:
      // const { error: incrementError } = await supabaseAdmin
      //   .from('profiles')
      //   .update({ monthly_stories_generated: currentStoriesGenerated + 1 })
      //   .eq('id', userIdForIncrement);
      if (incrementError) {
        // No fallar la petición al usuario por esto, pero loguearlo como crítico
        console.error(`CRITICAL: Failed to increment story count for ${userIdForIncrement}: ${incrementError.message}`);
      } else {
        console.log(`generate-story: Story count incremented for ${userIdForIncrement}.`);
      }
    }
    // --- 5. Respuesta Final ---
    return new Response(JSON.stringify({
      content: finalContent,
      title: finalTitle
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    // --- Manejo de Errores General ---
    console.error(`Error in generate-story function (User: ${userId || 'UNKNOWN'}):`, error);
    let statusCode = 500;
    if (error.message.includes("autenticado") || error.message.includes("Token")) statusCode = 401;
    else if (error.message.includes("Límite")) statusCode = 429;
    else if (error.message.includes("inválido") || error.message.includes("JSON") || error.message.includes("Parámetros")) statusCode = 400;
    else if (error.message.includes("Fallo al generar")) statusCode = 502;
    const errorMessage = error instanceof Error ? error.message : "Error interno al generar la historia inicial.";
    return new Response(JSON.stringify({
      error: `Error procesando solicitud: ${errorMessage}`
    }), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
