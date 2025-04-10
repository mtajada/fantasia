// supabase/edge-functions/story-continuation/index.ts
// v3: Adopta req.json() para parsear el body, como en generate-story.
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// --- Configuración (sin cambios) ---
const API_KEY = Deno.env.get('GEMINI_API_KEY');
if (!API_KEY) throw new Error("GEMINI_API_KEY environment variable not set");
const genAI = new GoogleGenerativeAI(API_KEY);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !APP_SERVICE_ROLE_KEY) throw new Error("Supabase URL or Service Role Key not set");
const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);

const modelName = "gemini-2.0-flash-thinking-exp-01-21";
console.log(`story-continuation: Using model: ${modelName}`);
const model = genAI.getGenerativeModel({
  model: modelName
});

// --- Funciones Helper (sin cambios respecto a la versión anterior) ---
async function generateContinuationOptions(story, chapters) {
  console.log(`[Helper] generateContinuationOptions for story ${story?.id}`);
  // (Misma lógica que en la versión anterior con validaciones internas)
  console.log(`[STORY_CONTINUATION_DEBUG] Entering generateContinuationOptions`);
  console.log(`[STORY_CONTINUATION_DEBUG] Story ID: ${story?.id}, Title: \"${story?.title}\"`);
  console.log(`[STORY_CONTINUATION_DEBUG] Number of chapters received: ${chapters?.length}`);

  if (!story || !story.id || !story.title || !story.content) {
    console.error("[STORY_CONTINUATION_DEBUG] Invalid 'story' object received in generateContinuationOptions");
    throw new Error("Datos de la historia inválidos o incompletos para generar opciones.");
  }
  if (!Array.isArray(chapters)) {
    console.error("[STORY_CONTINUATION_DEBUG] Invalid 'chapters' array received in generateContinuationOptions");
    throw new Error("Datos de capítulos inválidos para generar opciones.");
  }

  const lastChapterContent = chapters.length > 0 ? chapters[chapters.length - 1]?.content : story.content;
  const lastChapterPreview = lastChapterContent?.substring(0, 200) || '(No content)';

  if (chapters?.length > 0) {
    console.log(`[STORY_CONTINUATION_DEBUG] Last chapter content starts: \"${chapters[chapters.length - 1]?.content?.substring(0, 50)}...\"`);
  } else {
    console.log(`[STORY_CONTINUATION_DEBUG] No previous chapters, using story content start: \"${story.content?.substring(0, 50)}...\"`);
  }

  const prompt = `Dada la historia "${story.title}" y su contexto, sugiere 3 posibles caminos MUY CORTOS (frases de acción tipo "El personaje decidió..." o "Algo inesperado ocurrió...") y distintos para continuarla. Responde solo con un JSON array de objetos, cada uno con una key "summary". No incluyas nada más antes o después del JSON array. Asegúrate que el JSON sea válido.
Historia (inicio): ${story.content.substring(0, 200)}...
${chapters.length > 0 ? `Último capítulo:` : `Contexto final:`} ${lastChapterPreview}...`;

  console.log(`[STORY_CONTINUATION_DEBUG] Prompt for options generation:\n---\n${prompt}\n---`);

  let rawAiResponseText = '';
  try {
    const result = await model.generateContent(prompt);
    rawAiResponseText = result?.response?.text?.() ?? '';
    console.log(`[STORY_CONTINUATION_DEBUG] Raw AI Response Text for options:\n---\n${rawAiResponseText}\n---`);

    if (!rawAiResponseText) {
      throw new Error("La IA devolvió una respuesta vacía para las opciones.");
    }

    // Intenta parsear la respuesta como JSON
    // Añadir un try-catch aquí es buena idea por si la IA *aún* no devuelve JSON válido
    let options;
    try {
      options = JSON.parse(rawAiResponseText);
    } catch (parseError) {
      console.error(`[STORY_CONTINUATION_DEBUG] Error parsing AI response JSON: ${parseError.message}. Raw response was logged above.`);
      throw new Error(`La IA no devolvió un JSON válido para las opciones. Respuesta recibida: ${rawAiResponseText.substring(0, 100)}...`);
    }

    if (Array.isArray(options) && options.length > 0 && options.every((o) => typeof o.summary === 'string' && o.summary.trim())) {
      console.log(`[STORY_CONTINUATION_DEBUG] Successfully parsed options:`, options);
      return { options };
    }
    console.warn(`[STORY_CONTINUATION_DEBUG] Parsed JSON from AI but format is invalid or empty. Parsed data:`, options);
    throw new Error("Formato de opciones inválido después de parsear JSON de la IA.");

  } catch (e) {
    console.error(`[STORY_CONTINUATION_DEBUG] Error processing AI response for options: ${e.message}. Raw response was logged above. Returning fallback. Error object:`, e);
    return {
      options: [
        { summary: "Explorar el misterioso bosque cercano." },
        { summary: "Investigar la extraña cueva en la montaña." },
        { summary: "Seguir al enigmático conejo blanco." }
      ]
    };
  }
}

function createContinuationPrompt(mode, story, chapters, context, language, childAge, specialNeed) {
  console.log(`[Helper v3.1] createContinuationPrompt (Combined): mode=${mode}, story=${story?.id}, context=`, context);
  if (!story || !story.title || !story.options?.character?.name) {
    console.error("[Helper v3.1] Datos de historia incompletos para crear prompt de continuación.");
    throw new Error("Faltan datos esenciales de la historia (título, personaje) para continuar.");
  }
  if (!Array.isArray(chapters)) {
    console.error("[Helper v3.1] Datos de capítulos inválidos para crear prompt de continuación.");
    throw new Error("Formato de capítulos incorrecto.");
  }

  let prompt = `Eres un escritor experto continuando un cuento infantil en ${language} para niños de aproximadamente ${childAge} años.`;
  prompt += ` El cuento se titula "${story.title}" y el protagonista es ${story.options.character.name}.`;
  prompt += ` Mantén el tono y estilo apropiados para la edad y el género (${story.options.genre || 'aventura'}). Intenta reflejar la moraleja (${story.options.moral || 'ser valiente'}).`;
  if (specialNeed && specialNeed !== 'Ninguna') prompt += ` Considera adaptar ligeramente el lenguaje o las situaciones para niños con ${specialNeed}.`;

  prompt += `\n\n--- CONTEXTO DEL ÚLTIMO CAPÍTULO O INICIO ---\n`;
  let previousContent = "";
  const lastChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  if (lastChapter) {
    // Use more context from previous chapter
    previousContent = `Final del Capítulo ${lastChapter.chapterNumber} ("${lastChapter.title}"):\n${lastChapter.content.substring(lastChapter.content.length - 500)}...\n---\n`; 
  } else if (story.content) {
     // Use more context from story start if no chapters
    previousContent = `Inicio de la historia:\n${story.content.substring(0, 400)}...\n---\n`;
  }
  prompt += previousContent || "Aún no hay capítulos anteriores.\n";

  prompt += `\n--- INSTRUCCIÓN PARA ESTE NUEVO CAPÍTULO ---\n`;
  switch (mode) {
    case 'optionContinuation':
      if (context.optionSummary) {
        prompt += `Continúa la historia INMEDIATAMENTE DESPUÉS del contexto anterior, desarrollando la idea elegida: "${context.optionSummary}". Sé creativo pero mantente coherente con esta dirección y el último evento.`;
      } else {
        console.warn("[Helper v3.1] Modo 'optionContinuation' sin 'optionSummary'. Continuando libremente.");
        prompt += `Continúa la historia INMEDIATAMENTE DESPUÉS del contexto anterior de forma libre, creativa y coherente. Sorprende al lector.`;
      }
      break;
    case 'directedContinuation':
      // Habilitar si se usa 'userDirection'
      // if (context.userDirection) {
      //     prompt += `Continúa la historia siguiendo esta dirección específica proporcionada por el usuario: "${context.userDirection}". Intenta incorporarla de forma natural.`;
      // } else { ... }
      console.warn("[Helper v3.1] Modo 'directedContinuation' no implementado completamente. Continuando libremente.");
      prompt += `Continúa la historia de forma libre, creativa y coherente con lo anterior.`;
      break;
    case 'freeContinuation':
    default:
      prompt += `Continúa la historia INMEDIATAMENTE DESPUÉS del contexto anterior de forma libre, creativa y coherente. Sorprende al lector.`;
      break;
  }

  prompt += `\n\n--- FORMATO DE RESPUESTA OBLIGATORIO ---\n`;
  prompt += `Responde ÚNICA Y EXCLUSIVAMENTE con el título y el contenido del nuevo capítulo, usando EXACTAMENTE el siguiente formato:\n`;
  prompt += `### TÍTULO ###\n[Aquí el título corto y atractivo para el nuevo capítulo (máximo 5-7 palabras)]\n`;
  prompt += `### CONTENIDO ###\n[Aquí ÚNICAMENTE el texto completo del nuevo capítulo, con longitud adecuada para un cuento infantil]\n`;
  prompt += `NO incluyas NADA antes de '### TÍTULO ###' ni NADA después del contenido del capítulo. NO uses comillas alrededor del título o contenido a menos que sean parte intencional del texto.`;

  console.log(`[Helper v3.1] Continuation Prompt generated (start): "${prompt.substring(0, 150)}..."`);
  return prompt;
}

/**
 * NUEVO: Extrae, parsea y limpia el título y contenido de la respuesta estructurada de la IA.
 * Reemplaza a cleanGeneratedText
 */
function parseAndCleanCombinedResponse(rawText) {
  const defaultResponse = {
    title: 'Un Nuevo Capítulo Inesperado',
    content: 'La aventura dio un giro sorprendente... (Texto no procesado correctamente por la IA)',
  };

  if (!rawText || typeof rawText !== 'string') {
    console.warn('[Cleaner v3.1] Raw text for combined response is empty or invalid.');
    return defaultResponse;
  }

  // 1. Split by delimiters
  const titleMarker = '### TÍTULO ###';
  const contentMarker = '### CONTENIDO ###';

  const titleStartIndex = rawText.indexOf(titleMarker);
  const contentStartIndex = rawText.indexOf(contentMarker);

  let extractedTitle = '';
  let extractedContent = '';

  if (titleStartIndex !== -1 && contentStartIndex !== -1 && contentStartIndex > titleStartIndex) {
    extractedTitle = rawText.substring(titleStartIndex + titleMarker.length, contentStartIndex).trim();
    extractedContent = rawText.substring(contentStartIndex + contentMarker.length).trim();
  } else if (contentStartIndex !== -1) {
     // Only content found (AI might forget title marker)
    console.warn('[Cleaner v3.1] Only content marker found in combined response. Using default title.');
    extractedContent = rawText.substring(contentStartIndex + contentMarker.length).trim();
    extractedTitle = defaultResponse.title; // Use default title
  } else if (titleStartIndex !== -1) {
     // Only title found (less likely, but possible)
     console.warn('[Cleaner v3.1] Only title marker found in combined response. Using default content.');
     extractedTitle = rawText.substring(titleStartIndex + titleMarker.length).trim();
     extractedContent = defaultResponse.content; // Use default content
  } else {
    // Neither marker found. Best guess: Treat everything as content.
    console.warn('[Cleaner v3.1] Neither title nor content marker found. Assuming raw text is content, using default title.');
    extractedContent = rawText.trim();
    extractedTitle = defaultResponse.title;
  }

  // 2. Clean individual parts
  let cleanedTitle = extractedTitle
    .replace(/^título:\s*/i, '')
    .replace(/^title:\s*/i, '')
    .replace(/^["'"']|["'"']$/g, '') // Remove surrounding quotes
    .trim();

  let cleanedContent = extractedContent
    .replace(/^contenido:\s*/i, '')
    .replace(/^content:\s*/i, '')
    .replace(/^respuesta:\s*/i, '')
    .replace(/^response:\s*/i, '')
    .replace(/^capítulo \d+:\s*/i, '')
    .replace(/^chapter \d+:\s*/i, '')
    .replace(/(\n|\s)*\[FIN DEL CAPÍTULO\]/i, '')
    .replace(/(\n|\s)*\(Continuará\.\.\.\)/i, '')
    .trim();

  return {
    title: cleanedTitle || defaultResponse.title,
    content: cleanedContent || defaultResponse.content,
  };
}

// --- Fin Funciones Helper ---

serve(async (req) => {
  // --- Manejo Básico de CORS y Método (sin cambios) ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido. Usar POST.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let requestedAction = 'unknown';
  let userId = null;

  try {
    // --- 1. Autenticación (sin cambios) ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autorización ausente o inválido.' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth Error:", authError);
      return new Response(JSON.stringify({ error: authError?.message || 'No autenticado.' }), {
        status: authError?.status || 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    userId = user.id;
    console.log(`story-continuation: User Auth: ${userId}`);

    // --- 2. Obtener y Parsear Datos de la Solicitud (¡CAMBIO PRINCIPAL!) ---
    // Usar req.json() directamente como en generate-story
    let body: any;
    try {
      body = await req.json(); // Intenta parsear el body como JSON
      console.log(`[DEBUG story-continuation] Successfully parsed request body for user ${userId}:`, body);

      // Validación básica de que 'body' es un objeto (req.json() devolvería null/error si no)
      if (!body || typeof body !== 'object') {
        // Esto no debería ocurrir si req.json() tuvo éxito, pero por si acaso
        throw new Error("Request body could not be parsed into an object.");
      }

    } catch (error) {
      console.error(`[DEBUG story-continuation] Failed to parse JSON body for user ${userId}. Error:`, error);
      // Distinguir el tipo de error si es posible
      if (error instanceof SyntaxError || error.message.toLowerCase().includes('json')) {
        // Error de formato JSON o body vacío (SyntaxError: Unexpected end of JSON input)
        throw new Error(`Invalid or empty JSON in request body: ${error.message}. Ensure the client sends a valid JSON payload with 'Content-Type: application/json'.`);
      } else {
        // Otro error (podría ser de red, etc.)
        throw new Error(`Failed to read request body: ${error.message}`);
      }
    }

    // --- Extracción y Validación de Datos del Body Parseado (ajustado para usar 'body') ---
    const { action, story, chapters = [], selectedOptionSummary /* userDirection */ } = body;
    requestedAction = action || 'unknown'; // Guardar acción solicitada para logs de error

    console.log(`[DEBUG story-continuation] Processing action '${requestedAction}' with data:`, { storyId: story?.id, hasChapters: Array.isArray(chapters) ? chapters.length : 'N/A', selectedOptionSummary });

    // Validaciones de datos necesarios según la acción (sin cambios)
    const story_id = story?.id;
    const isContinuationAction = ['freeContinuation', 'optionContinuation', 'directedContinuation'].includes(action);
    const requiresStoryForContext = isContinuationAction || action === 'generateOptions';

    if (!action) {
      throw new Error("La propiedad 'action' es requerida en el cuerpo JSON.");
    }

    if (requiresStoryForContext) {
      if (!story || typeof story !== 'object' || !story_id) {
        throw new Error(`Se requiere un objeto 'story' válido con 'id' en el JSON para la acción '${action}'.`);
      }
      if (!story.options?.character?.name || !story.title || !story.content) {
        console.warn(`[DEBUG story-continuation] Datos JSON de 'story' incompletos para la acción '${action}'. Faltan: ${!story.options?.character?.name ? 'options.character.name ' : ''}${!story.title ? 'title ' : ''}${!story.content ? 'content ' : ''}`);
      }
      if (!Array.isArray(chapters)) {
        throw new Error(`Se requiere un array 'chapters' (puede ser vacío) en el JSON para la acción '${action}'.`);
      }
    }

    if (action === 'optionContinuation' && (typeof selectedOptionSummary !== 'string' || !selectedOptionSummary.trim())) {
      throw new Error("Falta o es inválido el 'selectedOptionSummary' (string no vacío) en el JSON para la acción 'optionContinuation'.");
    }
    // if (action === 'directedContinuation' && !userDirection) { ... }

    const language = body.language || story?.options?.language || 'es';
    const childAge = body.childAge || story?.options?.childAge || 7;
    const specialNeed = body.specialNeed || story?.options?.specialNeed || 'Ninguna';

    // --- 3. Obtener Perfil y Verificar Límites (sin cambios) ---
    // (Misma lógica que en la versión anterior)
    let isPremium = false;
    if (isContinuationAction) {
      console.log(`story-continuation: Checking limits for continuation action '${action}' for user ${userId}, story ${story_id}`);
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('subscription_status')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile:", profileError);
        throw new Error(`Error al obtener perfil de usuario: ${profileError.message}`);
      }
      if (!profile) {
        console.warn(`Perfil no encontrado para el usuario ${userId}. Tratando como no premium.`);
      } else {
        isPremium = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
      }

      if (!isPremium) {
        console.log(`story-continuation: Checking chapter count for non-premium user ${userId}, story ${story_id}`);
        const { count: chapterCount, error: countError } = await supabaseAdmin
          .from('story_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', story_id);

        if (countError) {
          console.error("Error counting chapters:", countError);
          throw new Error(`Error al verificar número de capítulos: ${countError.message}`);
        }
        const FREE_LIMIT = 2;
        if (chapterCount !== null && chapterCount >= FREE_LIMIT) {
          console.log(`story-continuation: Límite gratuito (${FREE_LIMIT} capítulos) alcanzado para ${userId}, story ${story_id}. Count: ${chapterCount}`);
          return new Response(JSON.stringify({ error: 'Límite de continuaciones gratuitas alcanzado. Actualiza a premium para continuar.' }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        console.log(`story-continuation: Usuario gratuito ${userId} OK para continuar (capítulos: ${chapterCount} < ${FREE_LIMIT}) story ${story_id}`);
      } else {
        console.log(`story-continuation: Usuario premium ${userId}, sin límite de capítulos.`);
      }
    } else {
      console.log(`story-continuation: No se requiere check de límite para la acción: ${action}`);
    }

    // --- 4. Ejecutar Acción Principal (sin cambios lógicos internos) ---
    let responsePayload = {};
    console.log(`story-continuation: Executing action: ${action} for user ${userId}, story ${story_id || 'N/A'}`);

    if (action === 'generateOptions') {
      responsePayload = await generateContinuationOptions(story, chapters);
    } else if (isContinuationAction) {
      const continuationContext = {};
      if (action === 'optionContinuation') continuationContext.optionSummary = selectedOptionSummary;
      // if (action === 'directedContinuation') ...

      console.log(`story-continuation: Generating combined title and content for action '${action}'`);

      // Crear prompt combinado para título y contenido
      const continuationPrompt = createContinuationPrompt(
        action, // 'optionContinuation', 'freeContinuation', etc.
        story,
        chapters,
        continuationContext, // Contains optionSummary if relevant
        language,
        childAge,
        specialNeed
      );

      // Configuración de generación
      const generationConfig = { temperature: 0.85, topP: 0.9, topK: 40, maxOutputTokens: 1024 };
      
      console.log(`story-continuation: Generando contenido y título combinados para ${userId}...`);
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: continuationPrompt }] }],
        generationConfig
      });

      const contentResponse = result?.response;
      const rawContent = contentResponse?.text?.();
      
      if (!rawContent || contentResponse?.promptFeedback?.blockReason) {
        console.error("Error en generación combinada:", contentResponse?.promptFeedback);
        throw new Error(`Fallo al generar continuación: ${contentResponse?.promptFeedback?.blockReason || 'Respuesta vacía o bloqueada por la IA'}`);
      }

      console.log(`[STORY_CONTINUATION_DEBUG] Raw AI Response (Combined):\n---\n${rawContent.substring(0, 200)}...\n---`);
      
      // Parsear y limpiar la respuesta combinada
      const parsedResult = parseAndCleanCombinedResponse(rawContent);
      console.log(`story-continuation: Contenido y título generados para ${userId}. Title: "${parsedResult.title}", Content length: ${parsedResult.content.length}`);

      responsePayload = {
        content: parsedResult.content,
        title: parsedResult.title
      };
    } else {
      console.error(`Acción no soportada recibida: ${action}`);
      throw new Error(`Acción no soportada: ${action}`);
    }

    console.log(`story-continuation: Action ${action} completed successfully for user ${userId}.`);

    // --- 5. Devolver Respuesta Exitosa (sin cambios) ---
    return new Response(
      JSON.stringify(responsePayload),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // --- Manejo Centralizado de Errores (sin cambios) ---
    console.error(`Error in story-continuation function (User: ${userId || 'UNKNOWN'}, Action: ${requestedAction}):`, error);
    let statusCode = 500;
    // Ajustar códigos de estado basados en el error
    if (error.message.includes("autenticado") || error.message.includes("autorización")) statusCode = 401;
    else if (error.message.includes("Límite") || error.message.includes("premium")) statusCode = 403;
    else if (error.message.includes("Invalid") || error.message.includes("empty JSON") || error.message.includes("requerida") || error.message.includes("Falta") || error.message.includes("soportada") || error.message.includes("inválido")) statusCode = 400; // Bad Request
    else if (error.message.includes("Fallo al generar")) statusCode = 502; // Bad Gateway

    const errorMessage = error instanceof Error ? error.message : "Error desconocido en la función.";

    return new Response(
      JSON.stringify({ error: `Error procesando la solicitud (${requestedAction}): ${errorMessage}` }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});