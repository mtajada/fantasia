// supabase/edge-functions/story-continuation/index.ts
// v8.0 (Adult Content + Preferences): Uses OpenAI client for Gemini, expects structured JSON. Adult content with preferences.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import OpenAI from "npm:openai@^4.33.0";

import {
  createContinuationOptionsPrompt,
  createContinuationPrompt,
  type Story, // Assuming Story type is defined in prompt.ts
  type Chapter, // Assuming Chapter type is defined in prompt.ts
  type ContinuationContextType,
} from './prompt.ts';

// --- Configuración Global para Grok ---
const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
const GROK_API_BASE_URL = 'https://api.x.ai/v1';
const MODEL_NAME = 'grok-3-mini'; // Modelo explícito

if (!GROK_API_KEY) {
  throw new Error("La variable de entorno GROK_API_KEY no está configurada.");
}

const openai = new OpenAI({
  apiKey: GROK_API_KEY,
  baseURL: GROK_API_BASE_URL,
});
const functionVersion = "v8.0 (Adult Content + Preferences)";
console.log(`story-continuation ${functionVersion}: Using model ${MODEL_NAME} via ${openai.baseURL}`);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("URL de Supabase o clave de rol de servicio no configurada");
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Interfaces for AI JSON Responses ---
interface AiContinuationOption {
  summary: string;
}
interface AiContinuationOptionsResponse {
  options: AiContinuationOption[];
}
interface AiContinuationResponse {
  title: string;
  content: string;
}

// --- Validation functions for AI responses ---
function isValidOptionsResponse(data: any): data is AiContinuationOptionsResponse {
  return data &&
    Array.isArray(data.options) &&
    data.options.every((opt: any) => typeof opt.summary === 'string' && opt.summary.trim() !== '');
}

function isValidContinuationResponse(data: any): data is AiContinuationResponse {
  return data &&
    typeof data.title === 'string' && // Title can be empty initially, cleanExtractedText handles default
    typeof data.content === 'string' && data.content.trim() !== '';
}


// --- Funciones Helper ---
async function generateContinuationOptions(
  story: Story,
  chapters: Chapter[],
  language: string = 'en',
  preferences: string | null = null,
  spicynessLevel: number = 2,
): Promise<AiContinuationOptionsResponse> {
  console.log(`[${functionVersion}] generateContinuationOptions for story ${story?.id}`);

  if (!story || !story.id || !story.title || !story.content || !story.options) {
    throw new Error("Datos de historia inválidos/incompletos para generar opciones.");
  }
  if (!Array.isArray(chapters)) {
    throw new Error("Datos de capítulos inválidos para generar opciones.");
  }

  const prompt = createContinuationOptionsPrompt(story, chapters, language, preferences, spicynessLevel);
  console.log(`[${functionVersion}] Prompt para generación de opciones (lang: ${language}):\n---\n${prompt.substring(0, 300)}...\n---`);

  let aiResponseContent: string | null = null;
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 8000, // Ajustado
    });

    aiResponseContent = chatCompletion.choices[0]?.message?.content;
    const finishReason = chatCompletion.choices[0]?.finish_reason;

    console.log(`[${functionVersion}] Raw AI JSON for options (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No content received)'}... Finish Reason: ${finishReason}`);

    if (finishReason === 'length') {
      console.warn(`[${functionVersion}] AI option generation may have been truncated.`);
    }
    if (!aiResponseContent) {
      throw new Error("Respuesta vacía de la IA para las opciones.");
    }

    const parsedResponse = JSON.parse(aiResponseContent);

    if (isValidOptionsResponse(parsedResponse)) {
      console.log(`[${functionVersion}] Opciones JSON parseadas y validadas:`, parsedResponse.options);
      return parsedResponse; // Return the whole object: { options: [...] }
    }
    console.error(`[${functionVersion}] Formato de opciones inválido después de parsear. Data:`, parsedResponse);
    throw new Error("Formato de opciones inválido después de parsear el JSON de la IA.");

  } catch (e: any) {
    console.error(`[${functionVersion}] Error procesando la respuesta de la IA para las opciones: ${e.message}. Raw response: ${aiResponseContent?.substring(0, 500)}`, e);
    // Fallback - Language-aware default options
    const defaultOptionsMap: Record<string, string[]> = {
      'es': [
        "Continuar el encuentro íntimo",
        "Explorar deseos más profundos", 
        "Probar algo nuevo juntos"
      ],
      'en': [
        "Continue the intimate encounter",
        "Explore deeper desires",
        "Try something new together"
      ],
      'fr': [
        "Continuer la rencontre intime",
        "Explorer des désirs plus profonds",
        "Essayer quelque chose de nouveau ensemble"
      ],
      'de': [
        "Die intime Begegnung fortsetzen",
        "Tiefere Wünsche erforschen",
        "Etwas Neues zusammen ausprobieren"
      ],
      'it': [
        "Continuare l'incontro intimo",
        "Esplorare desideri più profondi",
        "Provare qualcosa di nuovo insieme"
      ],
      'pt': [
        "Continuar o encontro íntimo",
        "Explorar desejos mais profundos",
        "Experimentar algo novo juntos"
      ]
    };

    const defaultOptionText = language.startsWith('en') ? 'default option' : 'opción por defecto';
    const defaultOptions = (defaultOptionsMap[language] || defaultOptionsMap['en'])
      .map(opt => ({ summary: `${opt} (${defaultOptionText})` }));
    return { options: defaultOptions };
  }
}

// --- Helper Function: Language-aware default titles ---
function getLanguageAwareDefaultChapterTitle(language: string): string {
  const languageDefaults: Record<string, string> = {
    'es': 'Un Nuevo Capítulo',
    'en': 'A New Chapter',
    'fr': 'Un Nouveau Chapitre',
    'de': 'Ein Neues Kapitel',
    'it': 'Un Nuovo Capitolo',
    'pt': 'Um Novo Capítulo',
    'ru': 'Новая глава',
    'ja': '新しい章',
    'ko': '새로운 장',
    'zh': '新的章节'
  };
  return languageDefaults[language] || languageDefaults['en'];
}

function getLanguageAwareDefaultContent(language: string): string {
  const languageDefaults: Record<string, string> = {
    'es': 'La historia continúa misteriosamente...',
    'en': 'The story continues mysteriously...',
    'fr': 'L\'histoire continue mystérieusement...',
    'de': 'Die Geschichte geht geheimnisvoll weiter...',
    'it': 'La storia continua misteriosamente...',
    'pt': 'A história continua misteriosamente...',
    'ru': 'История продолжается таинственно...',
    'ja': '物語は謎めいて続く...',
    'ko': '이야기는 신비롭게 계속된다...',
    'zh': '故事神秘地继续着...'
  };
  return languageDefaults[language] || languageDefaults['en'];
}

// cleanExtractedText: Se mantiene, ya que procesa strings provenientes de la IA (dentro del JSON).
function cleanExtractedText(text: string | undefined | null, type: 'title' | 'content', language: string = 'en'): string {
  const defaultText = type === 'title' ? getLanguageAwareDefaultChapterTitle(language) : getLanguageAwareDefaultContent(language);
  if (text === null || text === undefined || typeof text !== 'string') { // Allow empty string from AI, will return default
    console.warn(`[${functionVersion}] cleanExtractedText (${type}): Input null, undefined, or not a string.`);
    return defaultText;
  }
  // No console.log BEFORE for potentially very long content strings.
  let cleaned = text;
  // Markdown fences around the *whole string* should not happen with response_format: json_object,
  // but if AI puts them *inside* a JSON string value, this might be useful.
  // However, the primary instruction is AI should not use markdown *inside* string values unless natural.
  // cleaned = cleaned.replace(/^```(?:json|text)?\s*([\s\S]*?)\s*```$/gm, '$1').trim(); // Less likely needed now

  cleaned = cleaned.trim(); // Trim first
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
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  // console.log(`[${functionVersion}] cleanExtractedText (${type}) - AFTER: "${cleaned.substring(0, 150)}..."`);
  return cleaned.trim() || defaultText; // Ensure it returns default if cleaning results in empty
}
// --- Fin Funciones Helper ---

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido. Usar POST.' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let requestedAction = 'unknown';
  let userId: string | null = null;

  try {
    console.log(`[${functionVersion}] Handling POST request...`);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Encabezado de autorización faltante o inválido.");
      return new Response(JSON.stringify({ error: 'Token inválido o ausente.' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error("Error de autenticación:", authError);
      return new Response(JSON.stringify({ error: authError?.message || 'No autenticado.' }), {
        status: authError?.status || 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    userId = user.id;
    console.log(`[${functionVersion}] User Auth: ${userId}`);

    let body: any;
    try {
      body = await req.json();
      if (!body || typeof body !== 'object') throw new Error("Parsed body is not an object.");
    } catch (error: any) {
      console.error(`[${functionVersion}] Failed to parse JSON body for user ${userId}. Error:`, error);
      throw new Error(`Invalid/empty JSON in body: ${error.message}.`);
    }

    const { action, story, chapters = [], selectedOptionSummary, userDirection } = body;
    requestedAction = action || 'unknown';
    const story_id = story?.id;

    const isContinuationAction = ['freeContinuation', 'optionContinuation', 'directedContinuation'].includes(action);
    const requiresStoryForContext = isContinuationAction || action === 'generateOptions';

    // Validaciones de entrada (largely same as v6.1)
    if (!action) throw new Error("'action' es requerida.");
    if (requiresStoryForContext) {
      if (!story || typeof story !== 'object' || !story_id) {
        throw new Error(`Objeto 'story' (con 'id') inválido/ausente para la acción '${action}'.`);
      }
      // Validate story has required content and at least one character
      const hasCharacterData = (story.options.characters && story.options.characters.length > 0) || story.options.character?.name;
      if (!story.content || !story.options || !hasCharacterData || !story.title) {
        console.error("Validación de historia fallida:", {
          hasContent: !!story.content,
          hasOptions: !!story.options,
          hasCharacterData: hasCharacterData,
          hasTitle: !!story.title,
          charactersCount: story.options.characters?.length || 0,
          primaryCharacterName: story.options.characters?.[0]?.name
        });
        throw new Error("Datos incompletos en el objeto 'story' recibido (content, options con al menos un personaje, title son necesarios).");
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

    // Get preferences from profile instead of legacy parameters
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('language, preferences')
      .eq('id', userId)
      .single();

    const language = profile?.language || story?.options?.language || 'en';
    const preferences = profile?.preferences || null;
    const storyFormat = body.storyFormat || story?.options?.format || 'episodic';
    const spicynessLevel = story?.options?.spiciness_level || 2; // Extract from story options, default to 2

    // NUEVO: Verificar límites mensuales de historias usando la función SQL
    const { data: canGenerate, error: limitError } = await supabaseAdmin.rpc('can_generate_story', {
      user_uuid: userId
    });

    if (limitError) {
      console.error(`[${functionVersion}] Error checking story limits:`, limitError);
      throw new Error("Error al verificar límites de generación.");
    }

    if (!canGenerate) {
      console.log(`[${functionVersion}] User ${userId} has reached monthly story limit`);
      return new Response(JSON.stringify({
        error: 'Monthly story limit reached. Upgrade to premium for unlimited stories.'
      }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Límites (largely same logic as v6.1)
    if (isContinuationAction) {
      const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('subscription_status').eq('id', userId).maybeSingle();
      if (profileError) throw new Error("Error al verificar el perfil de usuario para límites.");

      const isPremium = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
      if (!isPremium) {
        const { count: chapterCount, error: countError } = await supabaseAdmin.from('story_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', story_id);
        if (countError) throw new Error("Error al verificar límites de continuación.");

        const FREE_CHAPTER_LIMIT = 2; // Límite de capítulos *adicionales* generables (no se si el capitulo 0 lo cuenta)
        if (chapterCount !== null && chapterCount >= FREE_CHAPTER_LIMIT) {
          return new Response(JSON.stringify({ error: 'Límite de continuaciones gratuitas alcanzado.' }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
    }

    // --- Ejecutar Acción Principal ---
    let responsePayload: any = {}; // Use 'any' for flexibility, or a union type
<<<<<<< HEAD
    console.log(`[${functionVersion}] Ejecutando acción: ${action} para usuario ${userId}, historia ${story_id || 'N/A'}`);
=======
    console.log(`[${functionVersion}] Executing action: ${action} for user ${userId}, story ${story_id || 'N/A'}`);
>>>>>>> origin/main

    if (action === 'generateOptions') {
      const optionsResponse = await generateContinuationOptions(story as Story, chapters as Chapter[], language, preferences, spicynessLevel);
      responsePayload = optionsResponse; // This is already { options: [...] }
    } else if (isContinuationAction) {
      const continuationContext: ContinuationContextType = {};
      if (action === 'optionContinuation') continuationContext.optionSummary = selectedOptionSummary;
      if (action === 'directedContinuation') continuationContext.userDirection = userDirection;

      const continuationPrompt = createContinuationPrompt(
        action as 'freeContinuation' | 'optionContinuation' | 'directedContinuation',
        story as Story,
        chapters as Chapter[],
        continuationContext,
        language,
        preferences,
        storyFormat,
        spicynessLevel
      );

      console.log(`[${functionVersion}] Calling AI for continuation. Prompt start: ${continuationPrompt.substring(0, 200)}...`);

      const chatCompletion = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: continuationPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 8000 // Ajustado
      });

      const aiResponseContent = chatCompletion.choices[0]?.message?.content;
      const finishReason = chatCompletion.choices[0]?.finish_reason;
      console.log(`[${functionVersion}] Raw AI JSON for continuation (first 200 chars): ${aiResponseContent?.substring(0, 200) || '(No content received)'}... Finish Reason: ${finishReason}`);

      if (finishReason === 'content_filter') {
        console.error(`[${functionVersion}] AI Continuation Generation BLOCKED due to content filter.`);
        throw new Error(`Generación de continuación bloqueada por seguridad: filtro de contenido.`);
      }
      if (finishReason === 'length') {
        console.warn(`[${functionVersion}] AI continuation generation may have been truncated.`);
      }
      if (!aiResponseContent) {
        throw new Error("Fallo al generar continuación: Respuesta IA vacía (sin bloqueo explícito).");
      }

      let finalTitle = getLanguageAwareDefaultChapterTitle(language); // Language-aware default
      let finalContent = '';
      let parsedSuccessfully = false;

      try {
        const parsedResponse = JSON.parse(aiResponseContent);
        if (isValidContinuationResponse(parsedResponse)) {
          finalTitle = cleanExtractedText(parsedResponse.title, 'title', language);
          finalContent = cleanExtractedText(parsedResponse.content, 'content', language);
          parsedSuccessfully = true;
          console.log(`[${functionVersion}] Parsed AI continuation JSON successfully.`);
        } else {
          console.warn(`[${functionVersion}] AI continuation response JSON structure invalid. Data:`, parsedResponse);
        }
      } catch (parseError: any) {
        console.error(`[${functionVersion}] Failed to parse JSON from AI continuation response. Error: ${parseError.message}. Raw: ${aiResponseContent.substring(0, 300)}`);
      }

      if (!parsedSuccessfully) {
        console.warn(`[${functionVersion}] Using fallback for continuation: Default title, full raw response as content (if available).`);
        finalContent = cleanExtractedText(aiResponseContent, 'content', language); // aiResponseContent might be the non-JSON string
      }

      if (!finalContent) { // If content is still empty after parsing/fallback and cleaning
        console.error(`[${functionVersion}] Critical error: Final continuation content is empty after all processing.`);
        const errorDefaults: Record<string, string> = {
          'es': 'La historia no pudo continuar esta vez. Intenta con otra opción o una nueva dirección.',
          'en': 'The story couldn\'t continue this time. Try another option or a new direction.',
          'fr': 'L\'histoire n\'a pas pu continuer cette fois. Essayez une autre option ou une nouvelle direction.',
          'de': 'Die Geschichte konnte diesmal nicht fortgesetzt werden. Versuchen Sie eine andere Option oder eine neue Richtung.',
          'it': 'La storia non è riuscita a continuare questa volta. Prova un\'altra opzione o una nuova direzione.',
          'pt': 'A história não pôde continuar desta vez. Tente outra opção ou uma nova direção.',
          'ru': 'История не смогла продолжиться на этот раз. Попробуйте другой вариант или новое направление.',
          'ja': '今回は物語を続けることができませんでした。別の選択肢や新しい方向を試してみてください。',
          'ko': '이번에는 이야기를 계속할 수 없었습니다. 다른 옵션이나 새로운 방향을 시도해보세요.',
          'zh': '这次无法继续故事。尝试其他选择或新的方向。'
        };
        finalContent = errorDefaults[language] || errorDefaults['en'];
        // Optionally throw, but providing a message might be better UX for continuations
      }

      console.log(`[${functionVersion}] Título final: "${finalTitle}", Longitud de contenido final: ${finalContent.length}`);
      responsePayload = { content: finalContent, title: finalTitle };

    } else {
      throw new Error(`Acción no soportada: ${action}`);
    }

    // NUEVO: Incrementar contador después de generar continuación exitosa
    if (isContinuationAction && responsePayload.content) {
      const { error: incrementError } = await supabaseAdmin.rpc('increment_story_count', {
        user_uuid: userId
      });

      if (incrementError) {
        console.error(`[${functionVersion}] Error incrementing story count:`, incrementError);
        // No fallar, solo registrar el error
      } else {
        console.log(`[${functionVersion}] Story count incremented for user ${userId}`);
      }
    }

    console.log(`[${functionVersion}] Action ${action} completed successfully for ${userId}.`);
    return new Response(JSON.stringify(responsePayload), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(`Error en ${functionVersion} (Usuario: ${userId || 'DESCONOCIDO'}, Acción: ${requestedAction}):`, error.message, error.stack);
    let statusCode = 500;
    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes("token inválido") || lowerMessage.includes("no autenticado")) statusCode = 401;
    else if (lowerMessage.includes("límite de continuaciones")) statusCode = 403;
    else if (lowerMessage.includes("json in body") || lowerMessage.includes("inválido/ausente") || lowerMessage.includes("requerido")) statusCode = 400;
    else if (lowerMessage.includes("bloqueada por seguridad") || lowerMessage.includes("respuesta ia vacía") || lowerMessage.includes("filtro de contenido")) statusCode = 502;
    else if (lowerMessage.includes("acción no soportada")) statusCode = 400;

    return new Response(JSON.stringify({ error: `Error procesando solicitud (${requestedAction}): ${error.message}` }), {
      status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});