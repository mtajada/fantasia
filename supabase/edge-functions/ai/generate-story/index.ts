// supabase/edge-functions/generate-story/index.ts
// v3.5: Sanitiza caracteres de control en el JSON string ANTES de parsear.
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
// --- Configuración ---
const API_KEY = Deno.env.get("GEMINI_API_KEY");
if (!API_KEY) throw new Error("GEMINI_API_KEY environment variable not set");
const genAI = new GoogleGenerativeAI(API_KEY);
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !APP_SERVICE_ROLE_KEY) throw new Error("Supabase URL or Service Role Key not set");
const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);
const modelName = "gemini-2.0-flash-thinking-exp-01-21";
console.log(`generate-story v3.5: Using model: ${modelName}`);
const model = genAI.getGenerativeModel({
  model: modelName
});
// --- Funciones Helper (createSystemPrompt, createUserPromptContent, cleanJsonValue: SIN CAMBIOS desde v3.4) ---
function createSystemPrompt(language, childAge, specialNeed) {
  console.log(`[Helper v3.5] createSystemPrompt: lang=${language}, age=${childAge}, need=${specialNeed}`);
  let base = `Eres un escritor experto de cuentos infantiles creativos y educativos. Escribe siempre en ${language}.`;
  base += ` El público objetivo son niños de ${childAge} años.`;
  if (specialNeed && specialNeed !== 'Ninguna') {
    base += ` Adapta sutilmente la historia considerando ${specialNeed}. Prioriza claridad y tono positivo.`;
  }
  base += ` Sé creativo, asegúrate de que la historia sea coherente y tenga una estructura narrativa clara (inicio, desarrollo, final).`;
  return base;
}

function createUserPromptContent({ options, additionalDetails }) {
  console.log(`[Helper v3.5] createUserPromptContent (JSON output): options=`, options, `details=`, additionalDetails);
  const char = options.character;
  const storyDuration = options.duration || 'medium';
  let request = `Crea un cuento infantil. Género: ${options.genre}. Moraleja: ${options.moral}. Personaje: ${char.name}`;
  if (char.profession) request += `, profesión ${char.profession}`;
  if (char.hobbies?.length) request += `, hobbies ${char.hobbies.join(', ')}`;
  if (char.personality) request += `, personalidad ${char.personality}`;
  request += `.\n\n`;
  request += `**Instrucciones de Contenido, Longitud y Estructura MUY IMPORTANTES:**\n`;
  request += `1.  **Duración Objetivo:** La historia debe tener una duración general '${storyDuration}'.\n`;
  if (storyDuration === 'short') {
    request += `    *   **Guía de Longitud (Corta):** Apunta a una longitud de **aproximadamente 800 tokens** (unos 5+ párrafos). Suficiente para una trama sencilla pero completa.\n`;
  } else if (storyDuration === 'long') {
    request += `    *   **Guía de Longitud (Larga):** Apunta a una longitud **extensa de aproximadamente 2500 tokens** (unos 15+ párrafos). Desarrolla la trama y personajes con detalle.\n`;
  } else {
    request += `    *   **Guía de Longitud (Media):** Apunta a una longitud **moderada de aproximadamente 1500 tokens** (unos 10+ párrafos). Buen equilibrio entre detalle y brevedad.\n`;
  }

  if (additionalDetails && typeof additionalDetails === 'string' && additionalDetails.trim()) {
    request += `\n**Instrucciones Adicionales del Usuario:**\n${additionalDetails.trim()}\n`;
  }

  request += `2.  **Estructura COMPLETA (OBLIGATORIO):** Independientemente de la longitud, el cuento DEBE tener una estructura narrativa clara y completa: **inicio, desarrollo y final**. ¡NUNCA termines la historia abruptamente o a mitad de una frase! La coherencia y la finalización son más importantes que el conteo exacto de tokens.\n`;

  // Instrucciones mejoradas para la generación de títulos
  request += `3.  **Título (MUY IMPORTANTE):** Genera un título EXTRAORDINARIO para este cuento, como si fuises un escritor de éxito. Sigue estas pautas:\n`;
  request += `    * Debe ser MEMORABLE, ORIGINAL y CAUTIVADOR para niños.\n`;
  request += `    * Evita títulos genéricos como "La Aventura de [Nombre]" o "[Nombre] y el/la [Objeto]".\n`;
  request += `    * Incluye elementos de FANTASÍA, MISTERIO o SORPRESA que despierten curiosidad inmediata.\n`;
  request += `    * Usa JUEGOS DE PALABRAS, ALITERACIONES o RIMAS cuando sea posible.\n`;
  request += `    * Longitud ideal: 4-7 palabras (máximo 40 caracteres).\n`;
  request += `    * Ejemplos de buenos títulos: "El Bosque de los Susurros Mágicos", "Estrellas en Frascos de Cristal", "La Melodía del Dragón Dormido".\n`;

  request += `\n**Instrucciones de Formato de Respuesta (OBLIGATORIO):**\n`;
  request += `*   Responde **ÚNICA Y EXCLUSIVAMENTE** con un objeto JSON válido.\n`;
  request += `*   El JSON debe tener exactamente dos claves:\n`;
  request += `    *   \`"title"\`: string (El título generado).\n`;
  request += `    *   \`"content"\`: string (El texto completo del cuento generado).\n`;
  request += `*   **Formato Estricto:** NO incluyas NADA antes ni después del objeto JSON. Sin texto introductorio, sin saltos de línea extra, sin comillas externas, sin formato markdown (\\\`\\\`\\\`json ... \\\`\\\`\\\`). SOLO el objeto JSON.\n\n`;
  request += `Ejemplo de respuesta **VÁLIDA**:\n`;
  request += `{"title": "Título del Cuento", "content": "Érase una vez..."}\n\n`;
  request += `Recuerda: SOLO el objeto JSON.`;
  return request;
}

function cleanJsonValue(text, type) {
  const defaultText = type === 'title' ? `Aventura Inolvidable` : 'El cuento tiene un giro inesperado...';
  if (!text || typeof text !== 'string') {
    console.warn(`[Helper v3.5] cleanJsonValue (${type}): Input text is empty or not a string.`);
    return defaultText;
  }
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^título:\s*/i, '').replace(/^title:\s*/i, '');
  cleaned = cleaned.replace(/^contenido:\s*/i, '').replace(/^content:\s*/i, '');
  cleaned = cleaned.replace(/^respuesta:\s*/i, '').replace(/^response:\s*/i, '');
  cleaned = cleaned.replace(/^["'“‘]|["'”’]$/g, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  cleaned = cleaned.replace(/###\s?(FORMATO DE RESPUESTA OBLIGATORIO|FIN DEL FORMATO|LÍNEA \d+|TITULO_INICIO|TITULO_FIN|CUENTO_INICIO|CUENTO_FIN|TÍTULO|CONTENIDO)\s?###/gi, '');
  return cleaned.trim() || defaultText;
}
// --- Fin Funciones Helper ---
serve(async (req) => {
  // (Manejo CORS y Método POST sin cambios)
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: corsHeaders
  });
  if (req.method !== 'POST') return new Response(JSON.stringify({
    error: 'Método no permitido. Usar POST.'
  }), {
    status: 405,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
  let userIdForIncrement = null;
  let isPremiumUser = false;
  let userId = null;
  try {
    // --- 1. Autenticación ---
    // ... (igual) ...
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({
      error: 'Token inválido.'
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({
      error: authError?.message || 'No autenticado.'
    }), {
      status: authError?.status || 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
    userId = user.id;
    console.log(`generate-story v3.5: User Auth: ${userId}`);
    // --- 2. Perfil y Límites ---
    // ... (igual) ...
    const { data: profile } = await supabaseAdmin.from('profiles').select('subscription_status, monthly_stories_generated').eq('id', userId).maybeSingle(); // Simplificado
    if (profile) isPremiumUser = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
    else console.warn(`Perfil no encontrado para ${userId}. Tratando como gratuito.`);
    let currentStoriesGenerated = profile?.monthly_stories_generated ?? 0;
    const FREE_STORY_LIMIT = 10;
    if (!isPremiumUser) {
      userIdForIncrement = userId;
      console.log(`generate-story v3.5: Free user ${userId}. Stories: ${currentStoriesGenerated}/${FREE_STORY_LIMIT}`);
      if (currentStoriesGenerated >= FREE_STORY_LIMIT) return new Response(JSON.stringify({
        error: `Límite mensual (${FREE_STORY_LIMIT}) alcanzado.`
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } else {
      console.log(`generate-story v3.5: Premium user ${userId}.`);
    }
    // --- 3. Body y Generación IA ---
    let params;
    let additionalDetails = null;
    try {
      params = await req.json();
      additionalDetails = params?.additionalDetails;
      console.log("--- DEBUG v3.5: Params Recibidos ---", {
        options: params?.options,
        additionalDetails: additionalDetails,
      });
      if (!params || typeof params !== 'object' || !params.options?.character || !params.language || params.childAge === undefined || !params.options?.duration) {
        throw new Error("Parámetros inválidos/incompletos (character, language, childAge, duration). Los detalles adicionales son opcionales.");
      }
    } catch (error) {
      console.error(`[DEBUG v3.5] Failed to parse JSON body for user ${userId}. Error:`, error);
      throw new Error(`Invalid/empty JSON in body: ${error.message}.`);
    }
    const systemPrompt = createSystemPrompt(params.language, params.childAge, params.specialNeed);
    const userPrompt = createUserPromptContent({ options: params.options, additionalDetails });
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    console.log(`generate-story v3.5: Calling AI for ${userId} (expecting JSON)...`);
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    }; // Mantenemos max tokens alto
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
    let fullTextResponse = contentResponse?.text?.();
    console.log(`[EDGE_FUNC_DEBUG v3.5] Raw AI response text (before fence cleaning): ... ${fullTextResponse?.slice(-100) || '(No text received)'}`);
    if (!fullTextResponse || contentResponse?.promptFeedback?.blockReason) {
      console.error("AI Generation Error:", contentResponse?.promptFeedback);
      throw new Error(`Fallo al generar contenido JSON: ${contentResponse?.promptFeedback?.blockReason || 'Respuesta IA vacía/bloqueada'}`);
    }
    // --- Limpiar ```json ANTES de parsear ---
    const jsonRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
    const match = fullTextResponse.match(jsonRegex);
    let textToParse = fullTextResponse.trim();
    if (match && match[1]) {
      console.log("[DEBUG v3.5] Markdown fences detected in generate-story, extracting JSON...");
      textToParse = match[1].trim();
    } else if (textToParse.startsWith('{') && textToParse.endsWith('}')) {
      console.log("[DEBUG v3.5] No fences detected in generate-story, but looks like JSON.");
    } else {
      console.warn("[DEBUG v3.5] generate-story response doesn't look like JSON or wrapped JSON.");
    }
    // ------------------------------------------
    // --- ***NUEVO: Sanitizar caracteres de control ANTES de parsear*** ---
    let sanitizedTextToParse;
    try {
      // Reemplaza caracteres de control comunes (excepto \t, \n, \r que podrían ser intencionales EN JSON VÁLIDO)
      // Esta regex busca caracteres en el rango U+0000 a U+001F que no sean tab, newline, carriage return
      sanitizedTextToParse = textToParse.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
      // Opcional: Escapar barras invertidas si sospechas que causan problemas de escape
      // sanitizedTextToParse = sanitizedTextToParse.replace(/\\/g, '\\\\');
      console.log(`[DEBUG v3.5] Text sanitized. Length difference: ${textToParse.length - sanitizedTextToParse.length}`);
    } catch (sanitizeError) {
      console.error("Error during text sanitization:", sanitizeError);
      sanitizedTextToParse = textToParse; // Intentar parsear el original si la sanitización falla
    }
    // --------------------------------------------------------------------
    // --- Parseo JSON (usa texto sanitizado) y Limpieza de Valores ---
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(sanitizedTextToParse); // <<< Usa sanitizedTextToParse
      if (!parsedResponse || typeof parsedResponse !== 'object' || typeof parsedResponse.title !== 'string' || typeof parsedResponse.content !== 'string') {
        throw new Error("Parsed JSON structure invalid (missing 'title' or 'content' string).");
      }
    } catch (e) {
      console.error("Failed to parse JSON response from AI (after fence cleaning & sanitization):", e, "\nText Attempted to Parse:", sanitizedTextToParse);
      console.error("Original Raw Response was:", fullTextResponse);
      throw new Error(`IA did not return valid JSON as requested, even after cleaning/sanitization. Received (start): ${fullTextResponse.substring(0, 200)}...`);
    }
    const finalTitle = cleanJsonValue(parsedResponse.title, 'title');
    const finalContent = cleanJsonValue(parsedResponse.content, 'content');
    if (!finalTitle || !finalContent) {
      console.error("Title or Content empty after cleaning.", {
        finalTitle: `"${finalTitle}"`,
        finalContent: `"${finalContent}"`
      });
      throw new Error("Error interno: Título o contenido vacíos después de limpiar.");
    }
    console.log(`generate-story v3.5: Final Title: "${finalTitle}", Content Length: ${finalContent.length}`);
    // --- 4. Incrementar Contador ---
    // ... (igual) ...
    if (userIdForIncrement) {
      console.log(`generate-story v3.5: Incrementing count for ${userIdForIncrement}...`);
      const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
        user_uuid: userIdForIncrement
      });
      if (incrementError) console.error(`CRITICAL: Failed count increment for ${userIdForIncrement}: ${incrementError.message}`);
      else console.log(`generate-story v3.5: Count incremented for ${userIdForIncrement}.`);
    }
    // --- 5. Respuesta Final ---
    // ... (igual) ...
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
    // --- Manejo de Errores ---
    // ... (igual) ...
    console.error(`Error in generate-story v3.5 (User: ${userId || 'UNKNOWN'}):`, error);
    let statusCode = 500;
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("autenticado") || message.includes("token")) statusCode = 401;
      else if (message.includes("límite")) statusCode = 429;
      else if (message.includes("inválido") || message.includes("json") || message.includes("parámetros") || message.includes("incompletos")) statusCode = 400;
      else if (message.includes("fallo al generar") || message.includes("ia did not return") || error.status === 503 || message.includes("unavailable")) statusCode = 502;
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
  } // <--- End Catch Block
}); // <--- End Serve
