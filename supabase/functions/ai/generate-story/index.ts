// supabase/edge-functions/generate-story/index.ts
// v6.1: Usa LIBRERÍA ORIGINAL (@google/generative-ai), UNA LLAMADA,
//       y espera SEPARADORES. Corregido error de despliegue en validación 'if'.
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; // Asegúrate que la ruta es correcta
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
// --- Configuración ---
const API_KEY = Deno.env.get("GEMINI_API_KEY");
if (!API_KEY) throw new Error("GEMINI_API_KEY environment variable not set");
// --- Instancia con Librería Original ---
const genAI = new GoogleGenerativeAI(API_KEY);
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !APP_SERVICE_ROLE_KEY) throw new Error("Supabase URL or Service Role Key not set");
const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);
// --- Modelo ---
const modelName = "gemini-2.0-flash-thinking-exp-01-21";
console.log(`generate-story v6.1: Using model: ${modelName} (Separator Strategy - Deployment Fix)`);
const model = genAI.getGenerativeModel({
  model: modelName
});
// --- Funciones Helper ---
// createSystemPrompt: Sin cambios
function createSystemPrompt(language, childAge, specialNeed) {
  console.log(`[Helper v6.1] createSystemPrompt: lang=${language}, age=${childAge}, need=${specialNeed}`);
  let base = `Eres un escritor experto de cuentos infantiles creativos y educativos. Escribe siempre en ${language}.`;
  base += ` El público objetivo son niños de ${childAge ?? 7} años.`;
  if (specialNeed && specialNeed !== 'Ninguna') {
    base += ` Adapta sutilmente la historia considerando ${specialNeed}. Prioriza claridad y tono positivo.`;
  }
  base += ` Sé creativo, asegúrate de que la historia sea coherente y tenga una estructura narrativa clara (inicio, desarrollo, final).`;
  return base;
}
// createUserPrompt_SeparatorFormat: Pide separadores
function createUserPrompt_SeparatorFormat({ options, additionalDetails }) {
  console.log(`[Helper v6.1] createUserPrompt_SeparatorFormat: options=`, options, `details=`, additionalDetails);
  const char = options.character;
  const storyDuration = options.duration || 'medium';
  let request = `Crea un cuento infantil. Género: ${options.genre}. Moraleja: ${options.moral}. Personaje: ${char.name}`;
  if (char.profession) request += `, profesión ${char.profession}`;
  if (char.hobbies?.length) request += `, hobbies ${char.hobbies.join(', ')}`;
  if (char.personality) request += `, personalidad ${char.personality}`;
  request += `.\n\n`;
  request += `**Instrucciones de Contenido, Longitud y Estructura:**\n`;
  request += `1.  **Duración Objetivo:** '${storyDuration}'.\n`;
  if (storyDuration === 'short') request += `    *   Guía (Corta): ~800 tokens.\n`;
  else if (storyDuration === 'long') request += `    *   Guía (Larga): ~2500 tokens.\n`;
  else request += `    *   Guía (Media): ~1500 tokens.\n`;
  if (additionalDetails && typeof additionalDetails === 'string' && additionalDetails.trim()) {
    request += `\n**Instrucciones Adicionales del Usuario:**\n${additionalDetails.trim()}\n`;
  }
  request += `2.  **Estructura COMPLETA:** Inicio, desarrollo y final claros.\n`;
  request += `3.  **Título:** Genera un título EXTRAORDINARIO (memorable, original, etc.).\n`;
  request += `\n**Instrucciones de Formato de Respuesta (¡MUY IMPORTANTE!):**\n`;
  request += `*   Responde usando **exactamente** los siguientes separadores:\n`;
  request += `    <title_start>\n`;
  request += `    Aquí SOLAMENTE el título generado (4-7 palabras).\n`;
  request += `    <title_end>\n`;
  request += `    <content_start>\n`;
  request += `    Aquí TODO el contenido del cuento, empezando directamente con la primera frase.\n`;
  request += `    <content_end>\n`;
  request += `*   **NO incluyas NADA antes de <title_start>.**\n`;
  request += `*   **NO incluyas NADA después de <content_end>.**\n`;
  request += `*   Asegúrate de incluir saltos de línea exactamente como se muestra entre los separadores y el texto.\n`;
  request += `*   NO uses ningún otro formato (como markdown, JSON, etc.). Solo texto plano con estos separadores.`;
  return request;
}
// cleanExtractedText: Limpia texto extraído entre separadores
function cleanExtractedText(text, type) {
  const defaultText = type === 'title' ? `Aventura Inolvidable` : 'El cuento tiene un giro inesperado...';
  if (!text || typeof text !== 'string') {
    console.warn(`[Helper v6.1] cleanExtractedText (${type}): Input empty/not string.`);
    return defaultText;
  }
  console.log(`[Helper v6.1] cleanExtractedText (${type}) - BEFORE: "${text.substring(0, 150)}..."`);
  let cleaned = text.trim(); // Trim inicial
  // Limpiezas específicas que podrían quedar DESPUÉS de extraer
  cleaned = cleaned.replace(/^Título:\s*/i, '').trim();
  cleaned = cleaned.replace(/^Contenido:\s*/i, '').trim();
  if (type === 'content') {
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
    cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, '');
  }
  if (type === 'title') {
    cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim();
  }
  // Quitar prefijos o sufijos que la IA podría añadir AUNQUE se le pida que no
  cleaned = cleaned.replace(/^(Respuesta|Aquí tienes el título|El título es):\s*/i, '').trim();
  cleaned = cleaned.replace(/^(Aquí tienes el cuento|El cuento es):\s*/i, '').trim();
  console.log(`[Helper v6.1] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
  return cleaned.trim() || defaultText;
}
// --- Fin Funciones Helper ---
serve(async (req) => {
  // 1. MANEJAR PREFLIGHT PRIMERO
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request...");
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  // 2. Verificar Método POST
  if (req.method !== 'POST') {
    console.log(`Method ${req.method} not allowed.`);
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
  // Variables inicializadas
  let userIdForIncrement = null;
  let isPremiumUser = false;
  let userId = null;
  try {
    // 3. AUTENTICACIÓN
    console.log("Handling POST request...");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Authorization header missing or invalid.");
      return new Response(JSON.stringify({
        error: 'Token inválido o ausente.'
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
    console.log(`generate-story v6.1: User Auth: ${userId}`);
    // 4. Perfil y Límites
    const { data: profile } = await supabaseAdmin.from('profiles').select('subscription_status, monthly_stories_generated').eq('id', userId).maybeSingle();
    if (profile) isPremiumUser = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
    else console.warn(`Perfil no encontrado para ${userId}. Tratando como gratuito.`);
    let currentStoriesGenerated = profile?.monthly_stories_generated ?? 0;
    const FREE_STORY_LIMIT = 10;
    if (!isPremiumUser) {
      userIdForIncrement = userId;
      console.log(`generate-story v6.1: Free user ${userId}. Stories: ${currentStoriesGenerated}/${FREE_STORY_LIMIT}`);
      if (currentStoriesGenerated >= FREE_STORY_LIMIT) {
        return new Response(JSON.stringify({
          error: `Límite mensual (${FREE_STORY_LIMIT}) alcanzado.`
        }), {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    } else {
      console.log(`generate-story v6.1: Premium user ${userId}.`);
    }
    // 5. Body y Validación
    let params;
    try {
      params = await req.json();
      console.log("--- DEBUG v6.1: Params Recibidos ---", params);
      // --- VALIDACIÓN CORREGIDA (sin comentario interno) ---
      if (!params || typeof params !== 'object' || !params.options?.character || typeof params.options.character !== 'object' || typeof params.language !== 'string' || !params.language || params.childAge === undefined || typeof params.options.duration !== 'string' || !params.options.duration || typeof params.options.genre !== 'string' || !params.options.genre || typeof params.options.moral !== 'string' || !params.options.moral) {
        console.error("Validation failed. Missing fields:", {
          // Puedes añadir logs específicos aquí si quieres depurar qué falta
          hasOptions: !!params.options,
          hasCharacter: !!params.options?.character,
          hasLanguage: typeof params.language === 'string' && !!params.language,
          hasChildAge: params.childAge !== undefined,
          hasDuration: typeof params.options?.duration === 'string' && !!params.options.duration,
          hasGenre: typeof params.options?.genre === 'string' && !!params.options.genre,
          hasMoral: typeof params.options?.moral === 'string' && !!params.options.moral
        });
        throw new Error("Parámetros inválidos/incompletos (revisar character, language, childAge, options.duration, options.genre, options.moral).");
      }
    } catch (error) {
      console.error(`[DEBUG v6.1] Failed to parse/validate JSON body for user ${userId}. Error:`, error);
      throw new Error(`Invalid/empty/incomplete JSON in body: ${error.message}.`);
    }
    // 6. Generación IA con UNA LLAMADA y Separadores
    const systemPrompt = createSystemPrompt(params.language, params.childAge, params.specialNeed);
    const userPrompt = createUserPrompt_SeparatorFormat({
      options: params.options,
      additionalDetails: params.additionalDetails
    });
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    console.log(`generate-story v6.1: Calling AI for combined output (User: ${userId})...`);
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 16000
    };
    const result = await model.generateContent({
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
    const response = result?.response;
    const rawApiResponseText = response?.text?.();
    const blockReason = response?.promptFeedback?.blockReason;
    console.log(`[EDGE_FUNC_DEBUG v6.1] Raw AI Separator response text: ${rawApiResponseText?.substring(0, 200) || '(No text received)'}...`);
    if (blockReason) {
      console.error(`AI Generation BLOCKED. Reason: ${blockReason}`);
      throw new Error(`Generación bloqueada por seguridad: ${blockReason}`);
    }
    if (!rawApiResponseText) {
      throw new Error("Fallo al generar: Respuesta IA vacía (sin bloqueo explícito).");
    }
    // 7. Extraer Título y Contenido usando Separadores
    let rawTitle = '';
    let rawContent = '';
    let finalTitle = 'Aventura Inolvidable'; // Default
    let finalContent = '';
    let extractionSuccess = false;
    try {
      const titleStartTag = '<title_start>';
      const titleEndTag = '<title_end>';
      const contentStartTag = '<content_start>';
      const contentEndTag = '<content_end>';
      const titleStartIndex = rawApiResponseText.indexOf(titleStartTag);
      const titleEndIndex = rawApiResponseText.indexOf(titleEndTag);
      // Buscar content_start DESPUÉS de title_end
      const contentStartIndex = rawApiResponseText.indexOf(contentStartTag, titleEndIndex);
      // Buscar content_end DESPUÉS de content_start
      const contentEndIndex = rawApiResponseText.indexOf(contentEndTag, contentStartIndex);
      // Verificar que todos los tags existen y están en el orden correcto
      if (titleStartIndex !== -1 && titleEndIndex > titleStartIndex && contentStartIndex > titleEndIndex && contentEndIndex > contentStartIndex) {
        rawTitle = rawApiResponseText.substring(titleStartIndex + titleStartTag.length, titleEndIndex).trim();
        rawContent = rawApiResponseText.substring(contentStartIndex + contentStartTag.length, contentEndIndex).trim();
        console.log(`[DEBUG v6.1] Extracted rawTitle: "${rawTitle}"`);
        console.log(`[DEBUG v6.1] Extracted rawContent starts: "${rawContent.substring(0, 100)}..."`);
        finalTitle = cleanExtractedText(rawTitle, 'title');
        finalContent = cleanExtractedText(rawContent, 'content');
        extractionSuccess = true;
      } else {
        console.warn(`Separators not found or in wrong order. Indices: titleStart=${titleStartIndex}, titleEnd=${titleEndIndex}, contentStart=${contentStartIndex}, contentEnd=${contentEndIndex}`);
      }
    } catch (extractError) {
      console.error("Error during separator extraction:", extractError);
    }
    // --- Fallback si la extracción falló ---
    if (!extractionSuccess) {
      console.warn("Using fallback: Default title, full response as content (after cleaning).");
      finalContent = cleanExtractedText(rawApiResponseText, 'content'); // Limpiar toda la respuesta
    }
    // Asegurarnos de que el contenido no esté vacío al final
    if (!finalContent) {
      console.error("Content is empty even after extraction/fallback and cleaning.");
      throw new Error("Error interno: Contenido vacío después del procesamiento.");
    }
    console.log(`generate-story v6.1: Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);
    // 8. Incrementar Contador
    if (userIdForIncrement) {
      console.log(`generate-story v6.1: Incrementing count for ${userIdForIncrement}...`);
      const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
        user_uuid: userIdForIncrement
      });
      if (incrementError) console.error(`CRITICAL: Failed count increment for ${userIdForIncrement}: ${incrementError.message}`);
      else console.log(`generate-story v6.1: Count incremented for ${userIdForIncrement}.`);
    }
    // 9. Respuesta Final
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
    // 10. Manejo de Errores
    console.error(`Error in generate-story v6.1 (User: ${userId || 'UNKNOWN'}):`, error);
    let statusCode = 500;
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("autenticado") || message.includes("token inválido")) statusCode = 401;
      else if (message.includes("límite")) statusCode = 429;
      else if (message.includes("inválido") || message.includes("json in body") || message.includes("parámetros")) statusCode = 400;
      else if (message.includes("fallo al generar") || message.includes("bloqueada por seguridad")) statusCode = 502;
    }
    const errorMessage = error instanceof Error ? error.message : "Error interno.";
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
