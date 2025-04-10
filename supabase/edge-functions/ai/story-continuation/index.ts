// supabase/edge-functions/story-continuation/index.ts
// v3.4.1: CORREGIDO - Añadida llave de cierre faltante para serve().
//        Pide JSON a la IA, limpia ```json```, alinea maxOutputTokens.
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
// --- Configuración ---
const API_KEY = Deno.env.get('GEMINI_API_KEY');
if (!API_KEY) throw new Error("GEMINI_API_KEY environment variable not set");
const genAI = new GoogleGenerativeAI(API_KEY);
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !APP_SERVICE_ROLE_KEY) throw new Error("Supabase URL or Service Role Key not set");
const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);
const modelName = "gemini-2.0-flash-thinking-exp-01-21";
console.log(`story-continuation v3.4.1: Using model: ${modelName}`);
const model = genAI.getGenerativeModel({
  model: modelName
});
// --- Funciones Helper (SIN CAMBIOS desde v3.3 / v3.4) ---
async function generateContinuationOptions(story, chapters) {
  console.log(`[Helper v3.4.1] generateContinuationOptions for story ${story?.id}`);
  if (!story || !story.id || !story.title || !story.content || !story.options) throw new Error("Datos de historia inválidos/incompletos.");
  if (!Array.isArray(chapters)) throw new Error("Datos de capítulos inválidos.");
  const cleanOriginalTitle = story.title.replace(/^\d+\.\s+/, '').trim();
  const storyDuration = story.options.duration || 'medium';
  console.log(`[DEBUG v3.4.1] Opts: Story ID: ${story.id}, Title: "${cleanOriginalTitle}", Duration: ${storyDuration}, Chapters: ${chapters.length}`);
  const lastChapterContent = chapters.length > 0 ? chapters[chapters.length - 1]?.content : story.content;
  const lastChapterPreview = lastChapterContent?.substring(lastChapterContent.length - 400).trim() || '(No content)';
  const prompt = `Historia: "${cleanOriginalTitle}" (Duración original: ${storyDuration}).\nContexto Final (último capítulo o final de la historia inicial):\n...${lastChapterPreview}\n\nBasado en el contexto final, sugiere 3 posibles caminos MUY CORTOS (frases tipo "El personaje decidió..." o "Algo inesperado ocurrió...") y distintos para continuar la historia.\nResponde solo con un JSON array válido de objetos, cada uno con una key "summary" (string). No incluyas NADA MÁS antes o después del JSON array. Ejemplo: [{"summary":"Texto de opción 1"}, {"summary":"Texto de opción 2"}, {"summary":"Texto de opción 3"}]`;
  console.log(`[DEBUG v3.4.1] Prompt for options generation:\n---\n${prompt}\n---`);
  let rawAiResponseText = '';
  try {
    const result = await model.generateContent(prompt);
    rawAiResponseText = result?.response?.text?.() ?? '';
    console.log(`[DEBUG v3.4.1] Raw AI Response Text for options:\n---\n${rawAiResponseText}\n---`);
    if (!rawAiResponseText) throw new Error("IA response empty for options.");
    let options;
    try {
      options = JSON.parse(rawAiResponseText);
    } catch (parseError) {
      throw new Error(`IA did not return valid JSON for options: ${rawAiResponseText.substring(0, 100)}...`);
    }
    if (Array.isArray(options) && options.length > 0 && options.every((o) => typeof o.summary === 'string' && o.summary.trim())) {
      console.log(`[DEBUG v3.4.1] Successfully parsed options:`, options);
      return {
        options
      };
    }
    throw new Error("Invalid options format after parsing JSON from AI.");
  } catch (e) {
    console.error(`[DEBUG v3.4.1] Error processing AI response for options: ${e.message}. Returning fallback.`, e);
    return {
      options: [
        {
          summary: "Continuar la aventura"
        },
        {
          summary: "Investigar un nuevo misterio"
        },
        {
          summary: "Tomar un descanso inesperado"
        }
      ]
    };
  }
}
function createContinuationPrompt(mode, story, chapters, context, language, childAge, specialNeed, storyDuration) {
  console.log(`[Helper v3.4.1] createContinuationPrompt (JSON output): mode=${mode}, story=${story?.id}, duration=${storyDuration}, context=`, context);
  if (!story || !story.title || !story.options?.character?.name) throw new Error("Datos esenciales de la historia faltantes.");
  if (!Array.isArray(chapters)) throw new Error("Formato de capítulos incorrecto.");
  const cleanOriginalTitle = story.title.replace(/^\d+\.\s+/, '').trim();
  let prompt = `Eres un escritor experto continuando un cuento infantil en ${language} para niños de aproximadamente ${childAge} años.`;
  prompt += ` El cuento original se titula "${cleanOriginalTitle}" y su protagonista es ${story.options.character.name}. Género: ${story.options.genre || 'aventura'}. Moraleja: ${story.options.moral || 'ser valiente'}.`;
  if (specialNeed && specialNeed !== 'Ninguna') prompt += ` Considera adaptar lenguaje/situaciones para ${specialNeed}.`;
  prompt += `\n\n--- CONTEXTO DEL ÚLTIMO CAPÍTULO O INICIO ---\n`;
  const lastChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  let previousContentPreview = "";
  if (lastChapter) {
    previousContentPreview = `Final del Capítulo ${lastChapter.chapterNumber} ("${lastChapter.title}"):\n...${lastChapter.content.substring(lastChapter.content.length - 500).trim()}`;
  } else if (story.content) {
    previousContentPreview = `Inicio de la historia:\n${story.content.substring(0, 500).trim()}...`;
  }
  prompt += previousContentPreview || "Aún no hay capítulos anteriores.";
  prompt += `\n---\n`;
  prompt += `\n--- INSTRUCCIÓN PARA ESTE NUEVO CAPÍTULO (Duración objetivo: ${storyDuration}) ---\n`;
  switch (mode) {
    case 'optionContinuation':
      prompt += `Continúa la historia INMEDIATAMENTE DESPUÉS del contexto anterior, desarrollando la idea elegida: "${context.optionSummary}".`;
      break;
    case 'directedContinuation':
      prompt += `Continúa la historia INMEDIATAMENTE DESPUÉS del contexto anterior, siguiendo esta dirección específica: "${context.userDirection}". Intégrala natural y coherentemente.`;
      break;
    case 'freeContinuation':
    default:
      prompt += `Continúa la historia INMEDIATAMENTE DESPUÉS del contexto anterior de forma libre, creativa y coherente.`;
      break;
  }
  prompt += `\n\n**Instrucciones de Respuesta y Formato MUY IMPORTANTES:**`;
  prompt += `\n1.  **Longitud:** Genera un capítulo de longitud apropiada para una duración general '${storyDuration}'.`;
  prompt += `\n2.  **Estructura:** El capítulo DEBE tener inicio, desarrollo y un final o punto de pausa claro. NO termines abruptamente. Debe ser una unidad narrativa completa.`;
  prompt += `\n3.  **Título:** Genera un título corto y atractivo (máx 5-7 palabras) para ESTE NUEVO capítulo.`;
  prompt += `\n4.  **Respuesta JSON:** Responde **ÚNICA Y EXCLUSIVAMENTE** con un objeto JSON válido con dos claves: \`"title"\` (el título como string) y \`"content"\` (el texto completo del capítulo como string).`;
  prompt += `\n5.  **Formato Estricto:** NO incluyas NADA antes ni después del objeto JSON. Sin saltos de línea extra, sin comillas externas, sin formato markdown (\\\`\\\`\\\`json ... \\\`\\\`\\\`). SOLO el objeto JSON.`;
  prompt += `\n\nEjemplo de respuesta **VÁLIDA** (solo el JSON):\n`;
  prompt += `{"title": "El Nuevo Título", "content": "El capítulo comienza aquí y continúa..."}\n\n`;
  prompt += `Recuerda: SOLO el objeto JSON.`;
  console.log(`[Helper v3.4.1] Continuation Prompt generated (start): "${prompt.substring(0, 150)}..."`);
  return prompt;
}
function cleanJsonValue(text, type) {
  const defaultText = type === 'title' ? `Aventura Inolvidable` : 'El cuento tiene un giro inesperado...';
  if (!text || typeof text !== 'string') {
    console.warn(`[Helper v3.4.1] cleanJsonValue (${type}): Input text is empty or not a string.`);
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
  if (req.method === 'OPTIONS') return new Response('ok', {
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
  let requestedAction = 'unknown';
  let userId = null;
  try {
    // --- 1. Autenticación ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({
      error: 'Token ausente o inválido.'
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
    console.log(`story-continuation v3.4.1: User Auth: ${userId}`);
    // --- 2. Body y Validación ---
    let body;
    try {
      body = await req.json();
      console.log(`[DEBUG v3.4.1] Parsed body OK for user ${userId}:`, {
        action: body?.action,
        storyId: body?.story?.id
      });
      if (!body || typeof body !== 'object') throw new Error("Parsed body is not an object.");
    } catch (error) {
      console.error(`[DEBUG v3.4.1] Failed to parse JSON body for user ${userId}. Error:`, error);
      throw new Error(`Invalid/empty JSON in body: ${error.message}. Client must send valid JSON.`);
    }
    const { action, story, chapters = [], selectedOptionSummary, userDirection } = body;
    requestedAction = action || 'unknown';
    console.log(`[DEBUG v3.4.1] Processing action '${requestedAction}' with data:`, {
      storyId: story?.id,
      chaptersCount: Array.isArray(chapters) ? chapters.length : 'N/A',
      selectedOptionSummary,
      userDirection
    });
    const story_id = story?.id;
    const isContinuationAction = [
      'freeContinuation',
      'optionContinuation',
      'directedContinuation'
    ].includes(action);
    const requiresStoryForContext = isContinuationAction || action === 'generateOptions';
    if (!action) throw new Error("'action' es requerida.");
    if (requiresStoryForContext) {
      if (!story || typeof story !== 'object' || !story_id) throw new Error(`Objeto 'story' inválido/ausente para '${action}'.`);
      if (!story.options || !story.options.character?.name || !story.title || !story.content || !story.options.duration) console.warn(`[DEBUG v3.4.1] Datos 'story' incompletos (falta options, character.name, title, content o duration)`);
      if (!Array.isArray(chapters)) throw new Error(`Array 'chapters' requerido.`);
    }
    if (action === 'optionContinuation' && (typeof selectedOptionSummary !== 'string' || !selectedOptionSummary.trim())) throw new Error("'selectedOptionSummary' (string no vacío) requerido para 'optionContinuation'.");
    if (action === 'directedContinuation' && (typeof userDirection !== 'string' || !userDirection.trim())) throw new Error("'userDirection' (string no vacío) requerido para 'directedContinuation'.");
    const language = body.language || story?.options?.language || 'es';
    const childAge = body.childAge || story?.options?.childAge || 7;
    const specialNeed = body.specialNeed || story?.options?.specialNeed || 'Ninguna';
    const storyDuration = story?.options?.duration || 'medium';
    // --- 3. Límites ---
    let isPremium = false;
    if (isContinuationAction) {
      console.log(`story-continuation v3.4.1: Checking limits for '${action}', user ${userId}, story ${story_id}`);
      const { data: profile } = await supabaseAdmin.from('profiles').select('subscription_status').eq('id', userId).maybeSingle();
      if (profile) isPremium = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
      else console.warn(`Perfil no encontrado para ${userId}, tratando como no premium.`);
      if (!isPremium) {
        const { count: chapterCount } = await supabaseAdmin.from('story_chapters').select('*', {
          count: 'exact',
          head: true
        }).eq('story_id', story_id);
        const FREE_LIMIT = 2;
        if (chapterCount !== null && chapterCount >= FREE_LIMIT) {
          console.log(`story-continuation v3.4.1: Free limit reached (${chapterCount}/${FREE_LIMIT}) for ${userId}, story ${story_id}.`);
          return new Response(JSON.stringify({
            error: 'Límite de continuaciones gratuitas alcanzado.'
          }), {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
        }
        console.log(`story-continuation v3.4.1: Free user OK (${chapterCount ?? 0}/${FREE_LIMIT}) for ${userId}, story ${story_id}`);
      } else {
        console.log(`story-continuation v3.4.1: Premium user ${userId}, no chapter limit.`);
      }
    } else {
      console.log(`story-continuation v3.4.1: No limit check needed for '${action}'.`);
    }
    // --- 4. Ejecutar Acción Principal ---
    let responsePayload = {};
    console.log(`story-continuation v3.4.1: Executing action: ${action} for user ${userId}, story ${story_id || 'N/A'}`);
    if (action === 'generateOptions') {
      responsePayload = await generateContinuationOptions(story, chapters);
    } else if (isContinuationAction) {
      console.log(`story-continuation v3.4.1: Generating JSON for '${action}', duration: ${storyDuration}`);
      const continuationContext = {};
      if (action === 'optionContinuation') continuationContext.optionSummary = selectedOptionSummary;
      if (action === 'directedContinuation') continuationContext.userDirection = userDirection;
      const continuationPrompt = createContinuationPrompt(action, story, chapters, continuationContext, language, childAge, specialNeed, storyDuration);
      const generationConfig = {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      };
      console.log(`story-continuation v3.4.1: Calling AI for JSON generation...`);
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: continuationPrompt
              }
            ]
          }
        ],
        generationConfig
      });
      const aiResponse = result?.response;
      let rawJsonResponse = aiResponse?.text?.();
      if (!rawJsonResponse || aiResponse?.promptFeedback?.blockReason) {
        console.error("AI Generation Error:", aiResponse?.promptFeedback);
        throw new Error(`Fallo al generar continuación JSON: ${aiResponse?.promptFeedback?.blockReason || 'Respuesta IA vacía/bloqueada'}`);
      }
      console.log(`[DEBUG v3.4.1] Raw AI Response (before cleaning fences): ... ${rawJsonResponse.slice(-150) || '(Empty)'}`);
      const jsonRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
      const match = rawJsonResponse.match(jsonRegex);
      let textToParse = rawJsonResponse.trim();
      if (match && match[1]) {
        console.log("[DEBUG v3.4.1] Markdown fences detected, extracting JSON content...");
        textToParse = match[1].trim();
      } else if (textToParse.startsWith('{') && textToParse.endsWith('}')) {
        console.log("[DEBUG v3.4.1] No fences detected, but looks like JSON. Proceeding.");
      } else {
        console.warn("[DEBUG v3.4.1] Response doesn't look like JSON or JSON wrapped in fences. Parsing might fail.");
      }
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(textToParse);
        if (!parsedResponse || typeof parsedResponse !== 'object' || typeof parsedResponse.title !== 'string' || typeof parsedResponse.content !== 'string') {
          throw new Error("Parsed JSON structure invalid (missing 'title' or 'content' string).");
        }
      } catch (e) {
        console.error("Failed to parse JSON response from AI (after attempting fence cleaning):", e, "\nText Attempted to Parse:", textToParse);
        console.error("Original Raw Response was:", rawJsonResponse);
        throw new Error(`IA did not return valid JSON as requested, even after cleaning. Received (start): ${rawJsonResponse.substring(0, 200)}...`);
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
      console.log(`story-continuation v3.4.1: Generated & Cleaned. Title: "${finalTitle}", Content Length: ${finalContent.length}`);
      responsePayload = {
        content: finalContent,
        title: finalTitle
      };
    } else {
      throw new Error(`Acción no soportada: ${action}`);
    }
    console.log(`story-continuation v3.4.1: Action ${action} completed successfully for ${userId}.`);
    // --- 5. Devolver Respuesta Exitosa ---
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // --- Manejo Centralizado de Errores ---
    console.error(`Error in story-continuation v3.4.1 (User: ${userId || 'UNKNOWN'}, Action: ${requestedAction}):`, error);
    let statusCode = 500;
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("autenticado") || message.includes("token")) statusCode = 401;
      else if (message.includes("límite")) statusCode = 403;
      else if (message.includes("inválido") || message.includes("json") || message.includes("requerida") || message.includes("faltan") || message.includes("soportada")) statusCode = 400;
      else if (message.includes("fallo al generar") || message.includes("ia did not return") || error.status === 503 || message.includes("unavailable")) statusCode = 502;
    }
    const errorMessage = error instanceof Error ? error.message : "Error desconocido en la función.";
    return new Response(JSON.stringify({
      error: `Error procesando solicitud (${requestedAction}): ${errorMessage}`
    }), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } // <--- End Catch Block
}); 
