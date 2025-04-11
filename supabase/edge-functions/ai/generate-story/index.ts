// supabase/edge-functions/generate-story/index.ts
// v3.3: Limpia ```json ... ``` antes de parsear, pide JSON a la IA.
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
console.log(`generate-story v3.3: Using model: ${modelName}`);
const model = genAI.getGenerativeModel({
  model: modelName
});
// --- Funciones Helper (createSystemPrompt, createUserPromptContent, cleanJsonValue: SIN CAMBIOS desde v3.2) ---
function createSystemPrompt(language, childAge, specialNeed) {
  console.log(`[Helper v3.3] createSystemPrompt: lang=${language}, age=${childAge}, need=${specialNeed}`);
  let base = `Eres un escritor experto de cuentos infantiles creativos y educativos. Escribe siempre en ${language}.`;
  base += ` El público objetivo son niños de ${childAge} años.`;
  if (specialNeed && specialNeed !== 'Ninguna') {
    base += ` Adapta sutilmente la historia considerando ${specialNeed}. Prioriza claridad y tono positivo.`;
  }
  base += ` Sé creativo, asegúrate de que la historia sea coherente y tenga una estructura narrativa clara (inicio, desarrollo, final).`;
  return base;
}
function createUserPromptContent({ options }) {
  console.log(`[Helper v3.3] createUserPromptContent (JSON output): options=`, options);
  const char = options.character;
  const storyDuration = options.duration || 'medium';
  let request = `Crea un cuento infantil ${storyDuration}. Género: ${options.genre}. Moraleja o tema principal: ${options.moral}.`;
  request += ` El personaje principal es ${char.name}`;
  if (char.profession) request += `, de profesión ${char.profession}`;
  if (char.hobbies?.length) request += `, le gusta ${char.hobbies.join(' y ')}`;
  if (char.personality) request += `, y tiene una personalidad ${char.personality}`;
  request += `.\n\n`;
  request += `**Instrucciones de Respuesta MUY IMPORTANTES:**\n`;
  request += `1.  Genera un título corto y atractivo (máx 5-7 palabras) para el cuento.\n`;
  request += `2.  Genera el contenido completo del cuento, asegurando que tenga una longitud apropiada para una duración '${storyDuration}' y una estructura narrativa completa (inicio, desarrollo, final). NO lo cortes abruptamente.\n`;
  request += `3.  Responde **ÚNICA Y EXCLUSIVAMENTE** con un objeto JSON válido. Este JSON debe tener exactamente dos claves:\n`;
  request += `    *   \`"title"\`: Contiene el título generado como string.\n`;
  request += `    *   \`"content"\`: Contiene el texto completo del cuento generado como string.\n`;
  request += `4.  **NO incluyas NADA antes ni después del objeto JSON.** No uses saltos de línea antes o después del JSON. No uses comillas externas alrededor del JSON. No uses formato markdown (\\\`\\\`\\\`json ... \\\`\\\`\\\`).\n`;
  request += `5.  Asegúrate de que el string dentro de la clave "content" sea coherente y completo.\n\n`;
  request += `Ejemplo de respuesta **VÁLIDA** (solo el JSON):\n`;
  request += `{"title": "El Título del Cuento", "content": "Érase una vez en un reino lejano..."}\n\n`;
  request += `Recuerda: SOLO el objeto JSON.`;
  return request;
}
function cleanJsonValue(text, type) {
  const defaultText = type === 'title' ? `Aventura Inolvidable` : 'El cuento tiene un giro inesperado...';
  if (!text || typeof text !== 'string') {
    console.warn(`[Helper v3.3] cleanJsonValue (${type}): Input text is empty or not a string.`);
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
    console.log(`generate-story v3.3: User Auth: ${userId}`);
    // --- 2. Perfil y Límites ---
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('subscription_status, monthly_stories_generated').eq('id', userId).maybeSingle();
    if (profileError && profileError.code !== 'PGRST116') throw new Error(`Error perfil: ${profileError.message}`);
    if (profile) isPremiumUser = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
    else console.warn(`Perfil no encontrado para ${userId}. Tratando como gratuito.`);
    let currentStoriesGenerated = profile?.monthly_stories_generated ?? 0;
    const FREE_STORY_LIMIT = 10;
    if (!isPremiumUser) {
      userIdForIncrement = userId;
      console.log(`generate-story v3.3: Free user ${userId}. Stories: ${currentStoriesGenerated}/${FREE_STORY_LIMIT}`);
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
      console.log(`generate-story v3.3: Premium user ${userId}.`);
    }
    // --- 3. Body y Generación IA ---
    let params;
    try {
      params = await req.json();
      console.log("--- DEBUG v3.3: Params Recibidos ---", {
        action: params?.action,
        options: params?.options
      });
      if (!params || typeof params !== 'object' || !params.options?.character || !params.language || params.childAge === undefined || !params.options?.duration) {
        throw new Error("Parámetros inválidos/incompletos (character, language, childAge, duration).");
      }
    } catch (error) {
      console.error(`[DEBUG v3.3] Failed to parse JSON body for user ${userId}. Error:`, error);
      throw new Error(`Invalid/empty JSON in body: ${error.message}.`);
    }
    const systemPrompt = createSystemPrompt(params.language, params.childAge, params.specialNeed);
    const userPrompt = createUserPromptContent(params);
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    console.log(`generate-story v3.3: Calling AI for ${userId} (expecting JSON)...`);
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
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
    let fullTextResponse = contentResponse?.text?.(); // Respuesta esperada: solo un string JSON
    console.log(`[EDGE_FUNC_DEBUG v3.3] Raw AI response text (before fence cleaning): ... ${fullTextResponse?.slice(-100) || '(No text received)'}`); // Log final
    if (!fullTextResponse || contentResponse?.promptFeedback?.blockReason) {
      console.error("AI Generation Error:", contentResponse?.promptFeedback);
      throw new Error(`Fallo al generar contenido JSON: ${contentResponse?.promptFeedback?.blockReason || 'Respuesta IA vacía/bloqueada'}`);
    }
    // --- CORRECCIÓN: Limpiar delimitadores Markdown ANTES de parsear ---
    const jsonRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
    const match = fullTextResponse.match(jsonRegex);
    let textToParse = fullTextResponse.trim();
    if (match && match[1]) {
      console.log("[DEBUG v3.3] Markdown fences detected in generate-story, extracting JSON content...");
      textToParse = match[1].trim();
    } else if (textToParse.startsWith('{') && textToParse.endsWith('}')) {
      console.log("[DEBUG v3.3] No fences detected in generate-story, but looks like JSON. Proceeding.");
    } else {
      console.warn("[DEBUG v3.3] generate-story response doesn't look like JSON or JSON wrapped in fences. Parsing might fail.");
    }
    // --------------------------------------------------------------------
    // --- Parseo JSON y Limpieza ---
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textToParse); // <<< Usa textToParse limpio
      if (!parsedResponse || typeof parsedResponse !== 'object' || typeof parsedResponse.title !== 'string' || typeof parsedResponse.content !== 'string') {
        throw new Error("Parsed JSON structure invalid (missing 'title' or 'content' string).");
      }
    } catch (e) {
      console.error("Failed to parse JSON response from AI (after attempting fence cleaning):", e, "\nText Attempted to Parse:", textToParse);
      console.error("Original Raw Response was:", fullTextResponse);
      throw new Error(`IA did not return valid JSON as requested, even after cleaning. Received (start): ${fullTextResponse.substring(0, 200)}...`);
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
    console.log(`generate-story v3.3: Final Title: "${finalTitle}", Content Length: ${finalContent.length}`);
    // --- 4. Incrementar Contador ---
    if (userIdForIncrement) {
      console.log(`generate-story v3.3: Incrementing count for ${userIdForIncrement}...`);
      const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
        user_uuid: userIdForIncrement
      });
      if (incrementError) console.error(`CRITICAL: Failed count increment for ${userIdForIncrement}: ${incrementError.message}`);
      else console.log(`generate-story v3.3: Count incremented for ${userIdForIncrement}.`);
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
    // --- Manejo de Errores ---
    console.error(`Error in generate-story v3.3 (User: ${userId || 'UNKNOWN'}):`, error);
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
