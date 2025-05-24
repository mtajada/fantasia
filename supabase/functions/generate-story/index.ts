// supabase/edge-functions/generate-story/index.ts
// v6.1 (Refactored): Lógica de Edge Function. Prompts en prompt.ts
// Usa LIBRERÍA ORIGINAL (@google/generative-ai), UNA LLAMADA,
// y espera SEPARADORES. Corregido error de despliegue en validación 'if'.
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; // Asegúrate que la ruta es correcta
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Importar funciones de prompt desde prompt.ts
import { createSystemPrompt, createUserPrompt_SeparatorFormat } from './prompt.ts';

// --- Funciones Helper (las que quedan en este archivo) ---

// cleanExtractedText: Limpia texto extraído entre separadores
function cleanExtractedText(text: string | undefined | null, type: 'title' | 'content'): string {
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
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // Eliminar numeración de listas
    cleaned = cleaned.replace(/^\s*[-\*]\s+/gm, ''); // Eliminar viñetas de listas
  }
  if (type === 'title') {
    cleaned = cleaned.replace(/^["'“‘](.*)["'”’]$/s, '$1').trim(); // Quitar comillas alrededor del título
  }
  // Quitar prefijos o sufijos que la IA podría añadir AUNQUE se le pida que no
  cleaned = cleaned.replace(/^(Respuesta|Aquí tienes el título|El título es):\s*/i, '').trim();
  cleaned = cleaned.replace(/^(Aquí tienes el cuento|El cuento es):\s*/i, '').trim();
  console.log(`[Helper v6.1] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
  return cleaned.trim() || defaultText;
}
// --- Fin Funciones Helper ---

serve(async (req: Request) => {
  // 1. MANEJAR PREFLIGHT PRIMERO
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request...");
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  // --- Configuración ---
  const API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!API_KEY) throw new Error("GEMINI_API_KEY environment variable not set");

  // --- Instancia con Librería Original ---
  const genAI = new GoogleGenerativeAI(API_KEY);
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL || !APP_SERVICE_ROLE_KEY) {
    console.error("Supabase URL or Service Role Key not set");
    throw new Error("Supabase URL or Service Role Key not set");
  }
  const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);

  // --- Modelo ---
  const modelName = Deno.env.get('TEXT_MODEL_GENERATE');
  if (!modelName) {
    console.error("TEXT_MODEL_GENERATE environment variable not set.");
    throw new Error("TEXT_MODEL_GENERATE environment variable not set.");
  }
  console.log(`generate-story v6.1: Using model: ${modelName} (Separator Strategy - Deployment Fix)`);
  const model = genAI.getGenerativeModel({
    model: modelName
  });

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
  let userIdForIncrement: string | null = null;
  let isPremiumUser = false;
  let userId: string | null = null;

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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status, monthly_stories_generated')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error(`Error fetching profile for ${userId}:`, profileError);
      throw new Error(`Error al obtener perfil de usuario: ${profileError.message}`);
    }

    if (profile) {
      isPremiumUser = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
    } else {
      console.warn(`Perfil no encontrado para ${userId}. Tratando como gratuito.`);
    }

    let currentStoriesGenerated = profile?.monthly_stories_generated ?? 0;
    const FREE_STORY_LIMIT = 10; // Asegúrate que este valor es consistente o configurable

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
    let params: any; // Considerar definir una interfaz más estricta para params
    try {
      params = await req.json();
      console.log("--- DEBUG v6.1: Params Recibidos ---", params);

      // --- VALIDACIÓN CORREGIDA (sin comentario interno) ---
      // Es importante validar todos los campos esperados de params.options y params.options.character
      if (!params || typeof params !== 'object' ||
        !params.options || typeof params.options !== 'object' ||
        !params.options.character || typeof params.options.character !== 'object' || !params.options.character.name ||
        typeof params.language !== 'string' || !params.language ||
        params.childAge === undefined || // childAge puede ser 0, así que undefined es la comprobación correcta
        typeof params.options.duration !== 'string' || !params.options.duration ||
        typeof params.options.genre !== 'string' || !params.options.genre ||
        typeof params.options.moral !== 'string' || !params.options.moral
      ) {
        console.error("Validation failed. Missing or invalid fields in params:", {
          hasOptions: !!params.options,
          hasCharacter: !!params.options?.character,
          hasCharacterName: !!params.options?.character?.name,
          hasLanguage: typeof params.language === 'string' && !!params.language,
          hasChildAge: params.childAge !== undefined, // Loguea si está presente
          hasDuration: typeof params.options?.duration === 'string' && !!params.options.duration,
          hasGenre: typeof params.options?.genre === 'string' && !!params.options.genre,
          hasMoral: typeof params.options?.moral === 'string' && !!params.options.moral
        });
        throw new Error("Parámetros inválidos/incompletos (revisar character.name, language, childAge, options.duration, options.genre, options.moral).");
      }
    } catch (error) {
      console.error(`[DEBUG v6.1] Failed to parse/validate JSON body for user ${userId}. Error:`, error);
      // Asegurar que el error que se propaga es una instancia de Error
      const message = error instanceof Error ? error.message : "Error desconocido al procesar JSON.";
      throw new Error(`Invalid/empty/incomplete JSON in body: ${message}.`);
    }

    // 6. Generación IA con UNA LLAMADA y Separadores
    const systemPrompt = createSystemPrompt(params.language, params.childAge, params.specialNeed);
    const userPrompt = createUserPrompt_SeparatorFormat({
      options: params.options,
      additionalDetails: params.additionalDetails
    });
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log(`generate-story v6.1: Calling AI for combined output (User: ${userId})... Prompt length: ${combinedPrompt.length}`);

    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 16000 // Asegúrate que este límite es adecuado para Gemini
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
    const rawApiResponseText = response?.text?.(); // Llama a la función text()
    const blockReason = response?.promptFeedback?.blockReason;

    console.log(`[EDGE_FUNC_DEBUG v6.1] Raw AI Separator response text (first 200 chars): ${rawApiResponseText?.substring(0, 200) || '(No text received)'}...`);

    if (blockReason) {
      console.error(`AI Generation BLOCKED. Reason: ${blockReason}`);
      throw new Error(`Generación bloqueada por seguridad: ${blockReason}`);
    }
    if (!rawApiResponseText) {
      console.error("AI response was empty or text could not be extracted. Full response:", response);
      throw new Error("Fallo al generar: Respuesta IA vacía o inválida (sin bloqueo explícito).");
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
      const contentStartIndex = rawApiResponseText.indexOf(contentStartTag, titleEndIndex + titleEndTag.length);
      // Buscar content_end DESPUÉS de content_start
      const contentEndIndex = rawApiResponseText.indexOf(contentEndTag, contentStartIndex + contentStartTag.length);

      // Verificar que todos los tags existen y están en el orden correcto
      if (titleStartIndex !== -1 &&
        titleEndIndex > titleStartIndex &&
        contentStartIndex > titleEndIndex && // content_start debe estar después de title_end
        contentEndIndex > contentStartIndex    // content_end debe estar después de content_start
      ) {
        rawTitle = rawApiResponseText.substring(titleStartIndex + titleStartTag.length, titleEndIndex).trim();
        rawContent = rawApiResponseText.substring(contentStartIndex + contentStartTag.length, contentEndIndex).trim();

        console.log(`[DEBUG v6.1] Extracted rawTitle: "${rawTitle}"`);
        console.log(`[DEBUG v6.1] Extracted rawContent starts: "${rawContent.substring(0, 100)}..."`);

        finalTitle = cleanExtractedText(rawTitle, 'title');
        finalContent = cleanExtractedText(rawContent, 'content');
        extractionSuccess = true;
      } else {
        console.warn(`Separators not found or in wrong order. Indices: titleStart=${titleStartIndex}, titleEnd=${titleEndIndex}, contentStart=${contentStartIndex}, contentEnd=${contentEndIndex}`);
        console.warn(`Full response text for manual inspection (first 500 chars): ${rawApiResponseText.substring(0, 500)}`);
      }
    } catch (extractError) {
      console.error("Error during separator extraction:", extractError);
      // No lanzar error aquí, se manejará con el fallback
    }

    // --- Fallback si la extracción falló ---
    if (!extractionSuccess) {
      console.warn("Using fallback: Default title, full response as content (after cleaning).");
      // Si falla la extracción, usamos el título por defecto y limpiamos toda la respuesta como contenido.
      // No reasignamos finalTitle aquí si ya tiene un default, a menos que queramos uno específico para error.
      finalContent = cleanExtractedText(rawApiResponseText, 'content'); // Limpiar toda la respuesta
    }

    // Asegurarnos de que el contenido no esté vacío al final
    if (!finalContent) {
      console.error("Content is empty even after extraction/fallback and cleaning.");
      // Considerar devolver la respuesta cruda o un mensaje de error específico si el contenido siempre debe existir.
      finalContent = "Hubo un problema al generar el contenido del cuento, pero aquí está la respuesta cruda de la IA (puede no estar formateada): " + rawApiResponseText;
      // O lanzar un error si esto se considera crítico:
      // throw new Error("Error interno: Contenido vacío después del procesamiento.");
    }

    console.log(`generate-story v6.1: Final Title: "${finalTitle}", Final Content Length: ${finalContent.length}`);

    // 8. Incrementar Contador
    if (userIdForIncrement) {
      console.log(`generate-story v6.1: Incrementing count for ${userIdForIncrement}...`);
      const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
        user_uuid: userIdForIncrement
      });
      if (incrementError) {
        // Registrar el error pero no fallar la solicitud por esto, ya que el cuento se generó.
        console.error(`CRITICAL: Failed count increment for ${userIdForIncrement}: ${incrementError.message}`);
      } else {
        console.log(`generate-story v6.1: Count incremented for ${userIdForIncrement}.`);
      }
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
    const message = error instanceof Error ? error.message : "Error interno desconocido.";

    if (error instanceof Error) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("autenticado") || lowerMessage.includes("token inválido")) statusCode = 401;
      else if (lowerMessage.includes("límite")) statusCode = 429;
      else if (lowerMessage.includes("inválido") || lowerMessage.includes("json in body") || lowerMessage.includes("parámetros")) statusCode = 400;
      else if (lowerMessage.includes("fallo al generar") || lowerMessage.includes("bloqueada por seguridad") || lowerMessage.includes("respuesta ia vacía")) statusCode = 502; // Bad Gateway
    }

    return new Response(JSON.stringify({
      error: `Error procesando solicitud: ${message}`
    }), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});