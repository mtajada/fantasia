// supabase/edge-functions/story-continuation/index.ts
// v6.1-adapted: Usa Librería Original (@google/generative-ai).
// - generateOptions: Pide y parsea JSON (como antes).
// - Continuaciones (optionContinuation, etc.): Pide UNA respuesta con SEPARADORES.
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
console.log(`story-continuation v6.1-adapted: Using model: ${modelName} (Separator Strategy for Continuations)`);
const model = genAI.getGenerativeModel({
  model: modelName
});
// --- Funciones Helper ---
// generateContinuationOptions: MODIFICADO para incluir más contexto y adaptar al idioma
async function generateContinuationOptions(
  story,
  chapters,
  language = 'es',
  childAge = 7,
  specialNeed = null,
) {
  console.log(`[Helper v6.1-adapted] generateContinuationOptions for story ${story?.id}`);
  if (!story || !story.id || !story.title || !story.content || !story.options) throw new Error("Datos de historia inválidos/incompletos.");
  if (!Array.isArray(chapters)) throw new Error("Datos de capítulos inválidos.");

  const cleanOriginalTitle = story.title.replace(/^\d+\.\s+/, '').trim();
  const storyOptions = story.options;
  console.log(`[DEBUG v6.1-adapted] Opts: Story ID: ${story.id}, Title: "${cleanOriginalTitle}", Lang: ${language}, Age: ${childAge}, Chapters: ${chapters.length}`);

  // Usar el contenido del ÚLTIMO capítulo existente como contexto primario.
  // Si no hay capítulos, usar el contenido de la historia inicial.
  let contextContent = story.content; // Default a historia inicial
  if (chapters.length > 0 && chapters[chapters.length - 1]?.content) {
    contextContent = chapters[chapters.length - 1].content;
    console.log(`[DEBUG v6.1-adapted] Using content from chapter ${chapters[chapters.length - 1].chapterNumber} for options context.`);
  } else {
    console.log(`[DEBUG v6.1-adapted] Using initial story content for options context.`);
  }

  // Tomar un fragmento significativo del final del contexto relevante
  const contextPreview = contextContent?.substring(Math.max(0, contextContent.length - 600)).trim() || '(No context)';

  // --- Construir Prompt con más contexto ---
  let promptContext = `CONTEXTO:\n`;
  promptContext += `- Idioma del cuento: ${language}\n`;
  promptContext += `- Edad del niño: ${childAge ?? 'No especificada'}\n`;
  if (specialNeed && specialNeed !== 'Ninguna') promptContext += `- Necesidad especial: ${specialNeed}\n`;
  promptContext += `- Título Original: "${cleanOriginalTitle}"\n`;
  promptContext += `- Género: ${storyOptions.genre}\n`;
  promptContext += `- Moraleja/Tema: ${storyOptions.moral}\n`;

  if (storyOptions.character) {
    const character = storyOptions.character;
    promptContext += `- Personaje Principal: ${character.name || 'Protagonista'} `;
    if (character.profession) promptContext += `(${character.profession}) `;
    if (character.personality) promptContext += `- Personalidad: ${character.personality}`;
    promptContext += `\n`;
  }

  promptContext += `- Final del Último Capítulo/Texto:\n...${contextPreview}\n\n`;

  // --- Instrucciones Adaptadas al Idioma ---
  let instructions = '';
  let example = '';
  let commonInstructions = `Sugiere 3 posibles caminos MUY CORTOS (frases concisas indicando la siguiente acción o evento) y distintos para continuar la historia, basados en el ÚLTIMO contexto y coherentes con el género, moraleja y personaje. Las opciones deben ser apropiadas para un niño de ${childAge ?? '?'} años`;

  if (specialNeed && specialNeed !== 'Ninguna') {
    commonInstructions = commonInstructions + ` (considerando ${specialNeed})`;
  }

  commonInstructions += ` IMPORTANTE: Los resúmenes ('summary') dentro del JSON deben estar escritos en ${language}.`;

  commonInstructions = commonInstructions + `.\nResponde SOLO con un JSON array válido de objetos, cada uno con una clave "summary" (string). No incluyas NADA MÁS antes o después del JSON array.`;

  if (language.toLowerCase().startsWith('en')) {
    instructions = `Based on the LAST context provided above, ${commonInstructions.replace('niño', 'child').replace('años', 'years old')}`;
    example = `Example: [{"summary":"The character decided to follow the map."}, {"summary":"A mysterious sound echoed nearby."}, {"summary":"They found a hidden note."}]`;
  } else { // Default a Español
    instructions = `Basado en el ÚLTIMO contexto proporcionado arriba, ${commonInstructions}`;
    example = `Ejemplo: [{"summary":"El personaje decidió seguir el mapa."}, {"summary":"Un sonido misterioso resonó cerca."}, {"summary":"Encontraron una nota escondida."}]`;
  }

  const prompt = `${promptContext}${instructions}\n${example}`;
  // --- Fin Prompt Adaptado ---

  console.log(`[DEBUG v6.1-adapted] Prompt for options generation (lang: ${language}):\n---\n${prompt}\n---`);

  let rawAiResponseText = '';
  try {
    const result = await model.generateContent(prompt); // Usar el modelo global
    rawAiResponseText = result?.response?.text?.() ?? '';
    console.log(`[DEBUG v6.1-adapted] Raw AI Response Text for options:\n---\n${rawAiResponseText}\n---`);

    if (!rawAiResponseText) throw new Error("IA response empty for options.");

    let options;
    try {
      // Limpiar fences ANTES de parsear, por si acaso la IA los añade aquí también
      const jsonRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
      const match = rawAiResponseText.match(jsonRegex);
      let textToParse = rawAiResponseText.trim();
      if (match && match[1]) {
        console.log("[DEBUG v6.1-adapted] Options: Markdown fences detected, extracting JSON...");
        textToParse = match[1].trim();
      }
      options = JSON.parse(textToParse);
    } catch (parseError) {
      throw new Error(`IA did not return valid JSON for options: ${parseError.message}. Received: ${rawAiResponseText.substring(0, 150)}...`);
    }
    if (Array.isArray(options) && options.length > 0 && options.every((o) => typeof o.summary === 'string' && o.summary.trim())) {
      console.log(`[DEBUG v6.1-adapted] Successfully parsed options:`, options);
      return {
        options
      };
    }
    throw new Error("Invalid options format after parsing JSON from AI.");
  } catch (e) {
    console.error(`[DEBUG v6.1-adapted] Error processing AI response for options: ${e.message}. Returning fallback.`, e);
    // Fallback más genérico
    return {
      options: [
        {
          summary: "Continuar la aventura"
        },
        {
          summary: "Explorar algo nuevo"
        },
        {
          summary: "Encontrar un amigo"
        }
      ]
    };
  }
}
// createContinuationPrompt: MODIFICADO para pedir SEPARADORES
function createContinuationPrompt(mode, story, chapters, context, language, childAge, specialNeed, storyDuration) {
  console.log(`[Helper v6.1-adapted] createContinuationPrompt (Separator Format): mode=${mode}, story=${story?.id}, duration=${storyDuration}, chapters: ${chapters?.length}`);
  if (!story || !story.title || !story.options?.character?.name || !story.content) throw new Error("Datos esenciales de la historia faltantes.");
  if (!Array.isArray(chapters)) throw new Error("Formato de capítulos incorrecto.");
  const cleanOriginalTitle = story.title.replace(/^\d+\.\s+/, '').trim();
  let systemPrompt = `Eres un escritor experto continuando un cuento infantil en ${language} para niños de aproximadamente ${childAge} años.`;
  systemPrompt += ` El cuento original se titula "${cleanOriginalTitle}" y su protagonista es ${story.options.character.name}. Género: ${story.options.genre || 'aventura'}. Moraleja: ${story.options.moral || 'ser valiente'}.`;
  if (specialNeed && specialNeed !== 'Ninguna') systemPrompt += ` Considera adaptar lenguaje/situaciones para ${specialNeed}.`;
  systemPrompt += ` Mantén la coherencia con la trama, personajes y tono establecidos en los capítulos anteriores.`;
  // Construir contexto completo
  let fullStoryContext = `\n\n--- HISTORIA COMPLETA HASTA AHORA ---\n\n`;
  fullStoryContext += `**Título Original:** ${cleanOriginalTitle}\n**Capítulo 1 (Inicio):**\n${story.content.trim()}\n\n`;
  if (chapters.length > 0) {
    // Ordenar capítulos por chapterNumber por si acaso
    chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    chapters.forEach((chapter) => {
      if (chapter && chapter.chapterNumber && chapter.title && chapter.content) {
        fullStoryContext += `--- Capítulo ${chapter.chapterNumber}: ${chapter.title} ---\n${chapter.content.trim()}\n\n`;
      } else {
        console.warn(`[Helper v6.1-adapted] Saltando capítulo inválido en contexto:`, chapter);
      }
    });
  }
  fullStoryContext += `--- FIN DE LA HISTORIA HASTA AHORA ---\n\n`;
  const nextChapterNumber = (chapters?.length ?? 0) + 2; // El siguiente capítulo será el 2 o más
  let userInstruction = `--- INSTRUCCIONES PARA GENERAR EL PRÓXIMO CAPÍTULO (${nextChapterNumber}) (Duración objetivo: ${storyDuration}) ---\n`;
  // Guías de longitud
  if (storyDuration === 'short') userInstruction += `**Guía Longitud (Corta):** Escribe un capítulo breve (aprox. 5-8 párrafos).\n`;
  else if (storyDuration === 'long') userInstruction += `**Guía Longitud (Larga):** Escribe un capítulo detallado y extenso (aprox. 15+ párrafos).\n`;
  else userInstruction += `**Guía Longitud (Media):** Escribe un capítulo de longitud moderada (aprox. 10-14 párrafos).\n`;
  // Instrucción específica de continuación
  switch (mode) {
    case 'optionContinuation':
      userInstruction += `**Tarea:** Continúa la historia DESPUÉS del último capítulo, desarrollando la siguiente idea elegida: "${context.optionSummary}".\n`;
      break;
    case 'directedContinuation':
      userInstruction += `**Tarea:** Continúa la historia DESPUÉS del último capítulo, siguiendo esta dirección del usuario: "${context.userDirection}".\n`;
      break;
    default:
      userInstruction += `**Tarea:** Continúa la historia DESPUÉS del último capítulo de forma libre, creativa y coherente con TODO lo anterior.\n`;
      break;
  }
  userInstruction += `**Importante:** El capítulo debe tener un inicio, desarrollo y un final o punto de pausa claro. ¡NO termines abruptamente!\n`;
  userInstruction += `**Título:** Genera también un título corto y atractivo para ESTE NUEVO capítulo (4-7 palabras).\n`;
  // Instrucciones de formato con separadores
  let formatInstruction = `\n**Instrucciones de Formato de Respuesta (¡MUY IMPORTANTE!):**\n`;
  formatInstruction += `*   Responde usando **exactamente** los siguientes separadores:\n`;
  formatInstruction += `    <title_start>\n`;
  formatInstruction += `    Aquí SOLAMENTE el título generado para este capítulo.\n`;
  formatInstruction += `    <title_end>\n`;
  formatInstruction += `    <content_start>\n`;
  formatInstruction += `    Aquí TODO el contenido de este NUEVO capítulo.\n`;
  formatInstruction += `    <content_end>\n`;
  formatInstruction += `*   **NO incluyas NADA antes de <title_start> ni después de <content_end>.**\n`;
  formatInstruction += `*   Asegúrate de incluir saltos de línea entre separadores y texto.\n`;
  formatInstruction += `*   NO uses ningún otro formato. Solo texto plano con estos separadores.`;
  // Combinar todo
  const finalPrompt = `${systemPrompt}\n${fullStoryContext}\n${userInstruction}\n${formatInstruction}`;
  console.log(`[Helper v6.1-adapted] Continuation Prompt generated (Separator Format - Start): "${finalPrompt.substring(0, 200)}..."`);
  return finalPrompt;
}
// cleanExtractedText: Copiada de generate-story v6.1
function cleanExtractedText(text, type) {
  const defaultText = type === 'title' ? `Un Nuevo Capítulo` : 'La historia continúa de forma misteriosa...'; // Default diferente
  if (!text || typeof text !== 'string') {
    console.warn(`[Helper v6.1-adapted] cleanExtractedText (${type}): Input empty/not string.`);
    return defaultText;
  }
  console.log(`[Helper v6.1-adapted] cleanExtractedText (${type}) - BEFORE: "${text.substring(0, 150)}..."`);
  let cleaned = text;
  cleaned = cleaned.replace(/^```(?:json|text)?\s*([\s\S]*?)\s*```$/gm, '$1').trim();
  cleaned = cleaned.replace(/^(Título|Title|Contenido|Content|Respuesta|Response):\s*/i, '').trim();
  cleaned = cleaned.replace(/^(Aquí tienes el (título|contenido|cuento|capítulo)|Claro, aquí está el (título|contenido|cuento|capítulo)):\s*/i, '').trim();
  cleaned = cleaned.replace(/\n\n\(Espero que te guste.*$/i, '').trim();
  cleaned = cleaned.replace(/\n\n\[.*?\]$/i, '').trim();
  if (type === 'content') {
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
    cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, '');
  }
  if (type === 'title') {
    cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim();
  }
  cleaned = cleaned.replace(/\n{3,}$/, '\n\n');
  console.log(`[Helper v6.1-adapted] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
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
  let requestedAction = 'unknown';
  let userId = null;
  try {
    // 3. AUTENTICACIÓN
    console.log("Handling POST request...");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) { }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) { }
    userId = user.id;
    console.log(`story-continuation v6.1-adapted: User Auth: ${userId}`);
    // 4. Body y Validación
    let body;
    try {
      body = await req.json();
      console.log(`[DEBUG v6.1-adapted] Parsed body OK for user ${userId}:`, {
        action: body?.action,
        storyId: body?.story?.id
      });
      if (!body || typeof body !== 'object') throw new Error("Parsed body is not an object.");
    } catch (error) {
      console.error(`[DEBUG v6.1-adapted] Failed to parse JSON body for user ${userId}. Error:`, error);
      throw new Error(`Invalid/empty JSON in body: ${error.message}.`);
    }
    const { action, story, chapters = [], selectedOptionSummary, userDirection } = body;
    requestedAction = action || 'unknown';
    console.log(`[DEBUG v6.1-adapted] Processing action '${requestedAction}'...`);
    const story_id = story?.id;
    const isContinuationAction = [
      'freeContinuation',
      'optionContinuation',
      'directedContinuation'
    ].includes(action);
    const requiresStoryForContext = isContinuationAction || action === 'generateOptions';
    // Validaciones de entrada
    if (!action) throw new Error("'action' es requerida.");
    if (requiresStoryForContext) {
      if (!story || typeof story !== 'object' || !story_id) throw new Error(`Objeto 'story' inválido/ausente para '${action}'.`);
      // Verificar campos necesarios dentro de story y options para los prompts
      if (!story.content || !story.options || !story.options.character?.name || !story.title || !story.options.duration) {
        console.warn(`[DEBUG v6.1-adapted] Datos incompletos en 'story' o 'story.options'. Necesarios: content, options.character.name, title, options.duration`);
        // Podría ser necesario lanzar un error si son críticos
        // throw new Error("Datos incompletos en el objeto 'story' recibido.");
      }
      if (!Array.isArray(chapters)) throw new Error(`Array 'chapters' requerido (puede ser vacío) para '${action}'.`);
    }
    if (action === 'optionContinuation' && (typeof selectedOptionSummary !== 'string' || !selectedOptionSummary.trim())) throw new Error("'selectedOptionSummary' requerido para 'optionContinuation'.");
    if (action === 'directedContinuation' && (typeof userDirection !== 'string' || !userDirection.trim())) throw new Error("'userDirection' requerido para 'directedContinuation'.");
    // Obtener parámetros para los prompts
    const language = body.language || story?.options?.language || 'es';
    const childAge = body.childAge || story?.options?.childAge || 7;
    const specialNeed = body.specialNeed || story?.options?.specialNeed || 'Ninguna';
    const storyDuration = story?.options?.duration || 'medium'; // Duración original como guía
    // 5. Límites (para acciones de continuación)
    if (isContinuationAction) {
      console.log(`story-continuation v6.1-adapted: Checking limits for '${action}', user ${userId}, story ${story_id}`);
      const { data: profile } = await supabaseAdmin.from('profiles').select('subscription_status').eq('id', userId).maybeSingle();
      let isPremium = false;
      if (profile) isPremium = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
      else console.warn(`Perfil no encontrado para ${userId}, tratando como no premium.`);
      if (!isPremium) {
        const { count: chapterCount } = await supabaseAdmin.from('story_chapters').select('*', {
          count: 'exact',
          head: true
        }).eq('story_id', story_id);
        const FREE_LIMIT = 2; // Historia base (cap 1 implícito) + 1 continuación (cap 2)
        // El conteo de la tabla es sobre capítulos *guardados* (a partir del 2)
        // Si ya hay 1 guardado (cap 2), el límite gratuito está alcanzado.
        if (chapterCount !== null && chapterCount >= FREE_LIMIT) {
          console.log(`story-continuation v6.1-adapted: Free limit reached (${chapterCount}/${FREE_LIMIT} continuations) for ${userId}, story ${story_id}.`);
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
        console.log(`story-continuation v6.1-adapted: Free user OK (${chapterCount ?? 0}/${FREE_LIMIT} continuations) for ${userId}, story ${story_id}`);
      } else {
        console.log(`story-continuation v6.1-adapted: Premium user ${userId}, no chapter limit.`);
      }
    } else {
      console.log(`story-continuation v6.1-adapted: No limit check needed for '${action}'.`);
    }
    // --- 6. Ejecutar Acción Principal ---
    let responsePayload = {};
    console.log(`story-continuation v6.1-adapted: Executing action: ${action} for user ${userId}, story ${story_id || 'N/A'}`)
    if (action === 'generateOptions') {
      // Mantenemos la lógica original que pide JSON para las opciones pero pasamos más contexto
      responsePayload = await generateContinuationOptions(
        story,
        chapters,
        language,
        childAge,
        specialNeed
      );
    } else if (isContinuationAction) {
      // --- NUEVA LÓGICA: Una llamada con separadores ---
      const continuationContext = {};
      if (action === 'optionContinuation') continuationContext.optionSummary = selectedOptionSummary;
      if (action === 'directedContinuation') continuationContext.userDirection = userDirection;
      const continuationPrompt = createContinuationPrompt(action, story, chapters, continuationContext, language, childAge, specialNeed, storyDuration);
      console.log(`story-continuation v6.1-adapted: Calling AI for combined output (User: ${userId})...`);
      const generationConfig = {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192 // Ajustar según necesidad para continuaciones
      };
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
        generationConfig: generationConfig
      });
      const response = result?.response;
      const rawApiResponseText = response?.text?.();
      const blockReason = response?.promptFeedback?.blockReason;
      console.log(`[EDGE_FUNC_DEBUG v6.1-adapted] Raw AI Separator response text: ${rawApiResponseText?.substring(0, 200) || '(No text received)'}...`);
      if (blockReason) {
        console.error(`AI Continuation Generation BLOCKED. Reason: ${blockReason}`);
        throw new Error(`Generación de continuación bloqueada por seguridad: ${blockReason}`);
      }
      if (!rawApiResponseText) {
        throw new Error("Fallo al generar continuación: Respuesta IA vacía (sin bloqueo explícito).");
      }
      // Extraer Título y Contenido usando Separadores
      let rawTitle = '';
      let rawContent = '';
      let finalTitle = 'Un Nuevo Capítulo'; // Default específico para continuación
      let finalContent = '';
      let extractionSuccess = false;
      try {
        const titleStartTag = '<title_start>';
        const titleEndTag = '<title_end>';
        const contentStartTag = '<content_start>';
        const contentEndTag = '<content_end>';
        const titleStartIndex = rawApiResponseText.indexOf(titleStartTag);
        const titleEndIndex = rawApiResponseText.indexOf(titleEndTag);
        const contentStartIndex = rawApiResponseText.indexOf(contentStartTag, titleEndIndex);
        const contentEndIndex = rawApiResponseText.indexOf(contentEndTag, contentStartIndex);
        if (titleStartIndex !== -1 && titleEndIndex > titleStartIndex && contentStartIndex > titleEndIndex && contentEndIndex > contentStartIndex) {
          rawTitle = rawApiResponseText.substring(titleStartIndex + titleStartTag.length, titleEndIndex).trim();
          rawContent = rawApiResponseText.substring(contentStartIndex + contentStartTag.length, contentEndIndex).trim();
          console.log(`[DEBUG v6.1-adapted] Extracted rawTitle: "${rawTitle}"`);
          console.log(`[DEBUG v6.1-adapted] Extracted rawContent starts: "${rawContent.substring(0, 100)}..."`);
          finalTitle = cleanExtractedText(rawTitle, 'title');
          finalContent = cleanExtractedText(rawContent, 'content');
          extractionSuccess = true;
        } else {
          console.warn(`Separators not found/wrong order in continuation response.`);
        }
      } catch (extractError) {
        console.error("Error during separator extraction for continuation:", extractError);
      }
      if (!extractionSuccess) {
        console.warn("Using fallback for continuation: Default title, full response as content.");
        finalContent = cleanExtractedText(rawApiResponseText, 'content'); // Limpiar toda la respuesta
      }
      if (!finalContent) {
        throw new Error("Error interno: Contenido de continuación vacío después del procesamiento.");
      }
      console.log(`story-continuation v6.1-adapted: Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);
      responsePayload = {
        content: finalContent,
        title: finalTitle
      };
      // --- FIN NUEVA LÓGICA ---
    } else {
      throw new Error(`Acción no soportada: ${action}`);
    }
    console.log(`story-continuation v6.1-adapted: Action ${action} completed successfully for ${userId}.`);
    // --- 7. Devolver Respuesta Exitosa ---
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // --- 8. Manejo Centralizado de Errores ---
    console.error(`Error in story-continuation v6.1-adapted (User: ${userId || 'UNKNOWN'}, Action: ${requestedAction}):`, error);
    let statusCode = 500;
    if (error instanceof Error) { }
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    return new Response(JSON.stringify({
      error: `Error procesando solicitud (${requestedAction}): ${errorMessage}`
    }), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
