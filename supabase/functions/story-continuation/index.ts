// supabase/edge-functions/story-continuation/index.ts
// v6.1-refactored: Usa Librería Original. Prompts en prompt.ts.
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Importar funciones de prompt y tipos necesarios
import {
  createContinuationOptionsPrompt,
  createContinuationPrompt,
  type ContinuationContextType, // Importar el tipo si es necesario fuera de la llamada a createContinuationPrompt
  // Opcionalmente, importa los tipos Story, Chapter si los usas explícitamente en este archivo
  // type Story, type Chapter 
} from './prompt.ts';


// --- Configuración Global (se mantiene igual) ---
const API_KEY = Deno.env.get("GEMINI_API_KEY");
if (!API_KEY) throw new Error("GEMINI_API_KEY environment variable not set");

const genAI = new GoogleGenerativeAI(API_KEY);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !APP_SERVICE_ROLE_KEY) throw new Error("Supabase URL or Service Role Key not set");
const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);

const modelName = Deno.env.get('TEXT_MODEL_GENERATE');
if (!modelName) throw new Error("TEXT_MODEL_GENERATE environment variable not set");
console.log(`story-continuation v6.1-refactored: Using model: ${modelName}`);
const model = genAI.getGenerativeModel({ model: modelName });


// --- Funciones Helper ---

// generateContinuationOptions: MODIFICADO para usar createContinuationOptionsPrompt
async function generateContinuationOptions(
  story: any, // Debería ser de tipo Story importado de prompt.ts o definido globalmente
  chapters: any[], // Debería ser de tipo Chapter[]
  language: string = 'es',
  childAge: number = 7,
  specialNeed: string | null = null,
) {
  console.log(`[Service v6.1-adapted] generateContinuationOptions for story ${story?.id}`);

  // Validación de datos de la historia (se mantiene, es importante antes de la llamada a IA)
  if (!story || !story.id || !story.title || !story.content || !story.options) {
    throw new Error("Datos de historia inválidos/incompletos para generar opciones.");
  }
  if (!Array.isArray(chapters)) {
    throw new Error("Datos de capítulos inválidos para generar opciones.");
  }

  // 1. Crear el prompt usando la función importada
  const prompt = createContinuationOptionsPrompt(story, chapters, language, childAge, specialNeed);
  console.log(`[Service v6.1-adapted] Prompt para generación de opciones (lang: ${language}):\n---\n${prompt.substring(0, 300)}...\n---`);

  let rawAiResponseText = '';
  try {
    // 2. Llamada al modelo para generar las opciones (lógica se mantiene aquí)
    const result = await model.generateContent(prompt); // Usar el modelo global
    rawAiResponseText = result?.response?.text?.() ?? '';
    console.log(`[Service v6.1-adapted] Raw AI Response Text for options:\n---\n${rawAiResponseText}\n---`);

    if (!rawAiResponseText) throw new Error("Respuesta vacía de la IA para las opciones.");

    // 3. Parsear el JSON (lógica se mantiene aquí)
    let options;
    try {
      const jsonRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
      const match = rawAiResponseText.match(jsonRegex);
      let textToParse = rawAiResponseText.trim();
      if (match && match[1]) {
        console.log("[Service v6.1-adapted] Opciones: Se detectaron fences de Markdown, extrayendo JSON...");
        textToParse = match[1].trim();
      }
      options = JSON.parse(textToParse);
    } catch (parseError: any) {
      throw new Error(`La IA no devolvió un JSON válido para las opciones: ${parseError.message}. Recibido: ${rawAiResponseText.substring(0, 150)}...`);
    }

    if (Array.isArray(options) && options.length > 0 && options.every((o: any) => typeof o.summary === 'string' && o.summary.trim())) {
      console.log(`[Service v6.1-adapted] Opciones correctamente parseadas:`, options);
      return { options };
    }
    throw new Error("Formato de opciones inválido después de parsear el JSON de la IA.");

  } catch (e: any) {
    console.error(`[Service v6.1-adapted] Error procesando la respuesta de la IA para las opciones: ${e.message}. Raw response: ${rawAiResponseText.substring(0, 500)}`, e);
    // Opción de fallback si ocurre un error
    return {
      options: [
        { summary: language.startsWith('en') ? "Continue the adventure" : "Continuar la aventura" },
        { summary: language.startsWith('en') ? "Explore something new" : "Explorar algo nuevo" },
        { summary: language.startsWith('en') ? "Meet a new friend" : "Encontrar un amigo" }
      ].map(opt => ({ summary: `${opt.summary} (${language.startsWith('en') ? 'default option' : 'opción por defecto'})` }))
    };
  }
}

// cleanExtractedText: Se mantiene en este archivo, ya que procesa respuestas de la IA.
function cleanExtractedText(text: string | undefined | null, type: 'title' | 'content'): string {
  const defaultText = type === 'title' ? `Un Nuevo Capítulo` : 'La historia continúa de forma misteriosa...';
  if (!text || typeof text !== 'string') {
    console.warn(`[Service v6.1-adapted] cleanExtractedText (${type}): Input empty/not string.`);
    return defaultText;
  }
  console.log(`[Service v6.1-adapted] cleanExtractedText (${type}) - BEFORE: "${text.substring(0, 150)}..."`);
  let cleaned = text;
  // Eliminar bloques de código Markdown si la IA los añade alrededor del texto
  cleaned = cleaned.replace(/^```(?:json|text)?\s*([\s\S]*?)\s*```$/gm, '$1').trim();
  // Eliminar prefijos comunes que la IA podría añadir
  cleaned = cleaned.replace(/^(Título|Title|Contenido|Content|Respuesta|Response):\s*/i, '').trim();
  cleaned = cleaned.replace(/^(Aquí tienes el (título|contenido|cuento|capítulo)|Claro, aquí está el (título|contenido|cuento|capítulo)):\s*/i, '').trim();
  // Eliminar frases de despedida comunes o metadatos al final
  cleaned = cleaned.replace(/\n\n\(Espero que te guste.*$/i, '').trim();
  cleaned = cleaned.replace(/\n\n\[.*?\]$/i, '').trim(); // Ej: [FIN DEL CAPÍTULO]

  if (type === 'content') {
    // Eliminar numeración o viñetas si la IA las añade al inicio de párrafos en el contenido
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
    cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, '');
  }
  if (type === 'title') {
    // Quitar comillas alrededor del título si la IA las añade
    cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim();
  }
  // Normalizar múltiples saltos de línea a un máximo de dos (un párrafo vacío)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  console.log(`[Service v6.1-adapted] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
  return cleaned.trim() || defaultText;
}
// --- Fin Funciones Helper ---

serve(async (req: Request) => {
  // 1. MANEJAR PREFLIGHT (se mantiene igual)
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request...");
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Verificar Método POST (se mantiene igual)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido. Usar POST.' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let requestedAction = 'unknown';
  let userId: string | null = null;

  try {
    // 3. AUTENTICACIÓN (se mantiene lógica, pero corregido error de auth que no retornaba)
    console.log("Handling POST request...");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Authorization header missing or invalid.");
      return new Response(JSON.stringify({ error: 'Token inválido o ausente.' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth Error:", authError);
      return new Response(JSON.stringify({ error: authError?.message || 'No autenticado.' }), {
        status: authError?.status || 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    userId = user.id;
    console.log(`story-continuation v6.1-refactored: User Auth: ${userId}`);

    // 4. Body y Validación (se mantiene lógica)
    let body: any; // Usar 'any' por simplicidad aquí, pero idealmente un tipo bien definido
    try {
      body = await req.json();
      console.log(`[DEBUG v6.1-refactored] Parsed body OK for user ${userId}:`, { action: body?.action, storyId: body?.story?.id });
      if (!body || typeof body !== 'object') throw new Error("Parsed body is not an object.");
    } catch (error: any) {
      console.error(`[DEBUG v6.1-refactored] Failed to parse JSON body for user ${userId}. Error:`, error);
      throw new Error(`Invalid/empty JSON in body: ${error.message}.`);
    }

    const { action, story, chapters = [], selectedOptionSummary, userDirection } = body;
    requestedAction = action || 'unknown';
    console.log(`[DEBUG v6.1-refactored] Processing action '${requestedAction}'...`);

    const story_id = story?.id; // Puede ser undefined si no se provee 'story'

    const isContinuationAction = ['freeContinuation', 'optionContinuation', 'directedContinuation'].includes(action);
    const requiresStoryForContext = isContinuationAction || action === 'generateOptions';

    // Validaciones de entrada
    if (!action) throw new Error("'action' es requerida.");
    if (requiresStoryForContext) {
      if (!story || typeof story !== 'object' || !story_id) {
        throw new Error(`Objeto 'story' (con 'id') inválido/ausente para la acción '${action}'.`);
      }
      // Validaciones más específicas para los datos dentro de 'story' que usan los prompts
      if (!story.content || !story.options || !story.options.character?.name || !story.title) {
        console.warn(`[Service v6.1-refactored] Datos incompletos en 'story' o 'story.options'. Necesarios para prompts: content, options.character.name, title. Story received:`, story);
        throw new Error("Datos incompletos en el objeto 'story' recibido, necesarios para generar el prompt.");
      }
      if (!Array.isArray(chapters)) {
        throw new Error(`Array 'chapters' requerido (puede ser vacío) para la acción '${action}'.`);
      }
    }
    if (action === 'optionContinuation' && (typeof selectedOptionSummary !== 'string' || !selectedOptionSummary.trim())) {
      throw new Error("'selectedOptionSummary' (string no vacío) requerido para 'optionContinuation'.");
    }
    if (action === 'directedContinuation' && (typeof userDirection !== 'string' || !userDirection.trim())) {
      throw new Error("'userDirection' (string no vacío) requerido para 'directedContinuation'.");
    }

    // Obtener parámetros para los prompts (con valores por defecto si no vienen en el body o en story.options)
    const language = body.language || story?.options?.language || 'es';
    const childAge = body.childAge || story?.options?.childAge || 7;
    const specialNeed = body.specialNeed || story?.options?.specialNeed || 'Ninguna';
    const storyDuration = body.storyDuration || story?.options?.duration || 'medium'; // Permitir override desde el body

    // 5. Límites (se mantiene lógica)
    if (isContinuationAction) {
      console.log(`story-continuation v6.1-refactored: Checking limits for '${action}', user ${userId}, story ${story_id}`);
      const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('subscription_status').eq('id', userId).maybeSingle();

      if (profileError) {
        console.error(`Error fetching profile for ${userId}:`, profileError.message);
        throw new Error("Error al verificar el perfil de usuario para límites.");
      }

      let isPremium = false;
      if (profile) isPremium = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
      else console.warn(`Perfil no encontrado para ${userId}, tratando como no premium.`);

      if (!isPremium) {
        const { count: chapterCount, error: countError } = await supabaseAdmin.from('story_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', story_id);

        if (countError) {
          console.error(`Error counting chapters for story ${story_id}:`, countError.message);
          throw new Error("Error al verificar límites de continuación.");
        }

        const FREE_CHAPTER_LIMIT = 1; // Límite de capítulos *adicionales* generables (el primero es la historia base)
        // Si el conteo es 1 (capítulo 2 guardado), ya se alcanzó el límite para generar el cap 3.
        if (chapterCount !== null && chapterCount >= FREE_CHAPTER_LIMIT) {
          console.log(`story-continuation v6.1-refactored: Free limit reached (${chapterCount}/${FREE_CHAPTER_LIMIT} continuations saved) for ${userId}, story ${story_id}.`);
          return new Response(JSON.stringify({ error: 'Límite de continuaciones gratuitas alcanzado.' }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        console.log(`story-continuation v6.1-refactored: Free user OK (${chapterCount ?? 0}/${FREE_CHAPTER_LIMIT} continuations saved) for ${userId}, story ${story_id}`);
      } else {
        console.log(`story-continuation v6.1-refactored: Premium user ${userId}, no chapter limit.`);
      }
    } else {
      console.log(`story-continuation v6.1-refactored: No limit check needed for '${action}'.`);
    }

    // --- 6. Ejecutar Acción Principal ---
    let responsePayload = {};
    console.log(`story-continuation v6.1-refactored: Executing action: ${action} for user ${userId}, story ${story_id || 'N/A'}`)

    if (action === 'generateOptions') {
      // generateContinuationOptions ahora usa createContinuationOptionsPrompt internamente
      responsePayload = await generateContinuationOptions(story, chapters, language, childAge, specialNeed);
    } else if (isContinuationAction) {
      const continuationContext: ContinuationContextType = {};
      if (action === 'optionContinuation') continuationContext.optionSummary = selectedOptionSummary;
      if (action === 'directedContinuation') continuationContext.userDirection = userDirection;

      // Llamada a la función de prompt importada
      const continuationPrompt = createContinuationPrompt(
        action as 'freeContinuation' | 'optionContinuation' | 'directedContinuation', // Type assertion
        story,
        chapters,
        continuationContext,
        language,
        childAge,
        specialNeed,
        storyDuration
      );

      console.log(`story-continuation v6.1-refactored: Calling AI for continuation (User: ${userId}). Prompt start: ${continuationPrompt.substring(0, 200)}...`);
      const generationConfig = {
        temperature: 0.8, topK: 40, topP: 0.95,
        maxOutputTokens: 8192
      };

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: continuationPrompt }] }],
        generationConfig: generationConfig
      });

      const response = result?.response;
      const rawApiResponseText = response?.text?.();
      const blockReason = response?.promptFeedback?.blockReason;

      console.log(`[EDGE_FUNC_DEBUG v6.1-refactored] Raw AI Separator response text: ${rawApiResponseText?.substring(0, 200) || '(No text received)'}...`);
      if (blockReason) {
        console.error(`AI Continuation Generation BLOCKED. Reason: ${blockReason}`);
        throw new Error(`Generación de continuación bloqueada por seguridad: ${blockReason}`);
      }
      if (!rawApiResponseText) {
        throw new Error("Fallo al generar continuación: Respuesta IA vacía (sin bloqueo explícito).");
      }

      // Extracción con separadores (se mantiene lógica)
      let rawTitle = '';
      let rawContent = '';
      let finalTitle = 'Un Nuevo Capítulo';
      let finalContent = '';
      let extractionSuccess = false;

      try {
        const titleStartTag = '<title_start>';
        const titleEndTag = '<title_end>';
        const contentStartTag = '<content_start>';
        const contentEndTag = '<content_end>';

        const titleStartIndex = rawApiResponseText.indexOf(titleStartTag);
        const titleEndIndex = rawApiResponseText.indexOf(titleEndTag);
        const contentStartIndex = rawApiResponseText.indexOf(contentStartTag, titleEndIndex + titleEndTag.length);
        const contentEndIndex = rawApiResponseText.indexOf(contentEndTag, contentStartIndex + contentStartTag.length);

        if (titleStartIndex !== -1 && titleEndIndex > titleStartIndex &&
          contentStartIndex > titleEndIndex && contentEndIndex > contentStartIndex) {
          rawTitle = rawApiResponseText.substring(titleStartIndex + titleStartTag.length, titleEndIndex).trim();
          rawContent = rawApiResponseText.substring(contentStartIndex + contentStartTag.length, contentEndIndex).trim();
          console.log(`[DEBUG v6.1-refactored] Extracted rawTitle: "${rawTitle}"`);
          finalTitle = cleanExtractedText(rawTitle, 'title');
          finalContent = cleanExtractedText(rawContent, 'content');
          extractionSuccess = true;
        } else {
          console.warn(`Separators not found/wrong order in continuation response. Indices: T_S=${titleStartIndex}, T_E=${titleEndIndex}, C_S=${contentStartIndex}, C_E=${contentEndIndex}. Raw response (start): ${rawApiResponseText.substring(0, 300)}`);
        }
      } catch (extractError: any) {
        console.error("Error during separator extraction for continuation:", extractError.message);
      }

      if (!extractionSuccess) {
        console.warn("Using fallback for continuation: Default title, full response as content.");
        finalContent = cleanExtractedText(rawApiResponseText, 'content');
      }
      if (!finalContent && extractionSuccess) { // Si la extracción fue "exitosa" pero el contenido limpiado es vacío
        console.warn("Content was empty after successful extraction and cleaning. Using raw extracted content.");
        finalContent = rawContent; // Usar el contenido crudo extraído antes de cleanExtractedText
      }
      if (!finalContent) { // Si aún así está vacío
        console.error("Error interno: Contenido de continuación vacío después del procesamiento y fallback.");
        // Considerar qué hacer aquí. ¿Devolver error o un contenido por defecto muy genérico?
        // Por ahora, se lanzará un error más abajo si esto ocurre y la extracción no fue exitosa
        // Si la extracción fue exitosa pero `finalContent` es vacío, podría ser un problema con `cleanExtractedText`
        // o que la IA devolvió un tag de contenido vacío.
        throw new Error("Error crítico: El contenido final de la continuación es vacío.");
      }
      console.log(`story-continuation v6.1-refactored: Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);
      responsePayload = { content: finalContent, title: finalTitle };
    } else {
      throw new Error(`Acción no soportada: ${action}`);
    }

    console.log(`story-continuation v6.1-refactored: Action ${action} completed successfully for ${userId}.`);
    // --- 7. Devolver Respuesta Exitosa ---
    return new Response(JSON.stringify(responsePayload), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    // --- 8. Manejo Centralizado de Errores (se mantiene lógica) ---
    console.error(`Error in story-continuation v6.1-refactored (User: ${userId || 'UNKNOWN'}, Action: ${requestedAction}):`, error.message, error.stack);
    let statusCode = 500;
    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes("token inválido") || lowerMessage.includes("no autenticado")) statusCode = 401;
    else if (lowerMessage.includes("límite de continuaciones")) statusCode = 403; // Forbidden
    else if (lowerMessage.includes("json in body") || lowerMessage.includes("inválido/ausente") || lowerMessage.includes("requerido")) statusCode = 400; // Bad Request
    else if (lowerMessage.includes("bloqueada por seguridad") || lowerMessage.includes("respuesta ia vacía")) statusCode = 502; // Bad Gateway
    else if (lowerMessage.includes("acción no soportada")) statusCode = 400;

    return new Response(JSON.stringify({ error: `Error procesando solicitud (${requestedAction}): ${error.message}` }), {
      status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});