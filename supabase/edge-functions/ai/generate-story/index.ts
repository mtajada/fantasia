import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Configuración de la API de Gemini
const API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Configuración de Supabase Admin Client
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const APP_SERVICE_ROLE_KEY = Deno.env.get('APP_SERVICE_ROLE_KEY') || '';
const supabaseAdmin = createClient(SUPABASE_URL, APP_SERVICE_ROLE_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-thinking-exp-01-21",
});

interface StoryOptions {
  character?: {
    name: string;
    profession?: string;
    hobbies?: string[];
    characterType?: string;
    personality?: string;
    description?: string;
  };
  genre?: string;
  moral?: string;
  duration?: "short" | "medium" | "long";
}

interface GenerateStoryParams {
  options: Partial<StoryOptions>;
  language?: string;
  childAge?: number;
  specialNeed?: string;
}

/**
 * Creates a system prompt for the story generation
 */
function createSystemPrompt(
  language: string = "español",
  childAge: number = 7,
  specialNeed: string = "Ninguna",
): string {
  let prompt =
    `Eres un experto narrador de cuentos infantiles. Tu tarea es crear historias encantadoras y educativas para niños de ${childAge} años en ${language}.
  
Debes asegurarte de que:
1. La historia sea apropiada para la edad del niño.
2. No contenga violencia excesiva, lenguaje inapropiado o temas adultos.
3. Tenga una estructura clara con inicio, desarrollo y conclusión.
4. Incluya una moraleja o enseñanza valiosa.
5. Use un lenguaje sencillo pero rico en expresiones.
6. Sea original, creativa y mantenga la atención del niño.
7. No exceda las 700 palabras para historias cortas, 1500 para medianas y 2400 para largas.

Genera solo la historia, sin comentarios adicionales ni explicaciones.`;

  // Añadir instrucciones específicas según las necesidades especiales
  if (specialNeed !== "Ninguna") {
    prompt +=
      `\n\nIMPORTANTE: Esta historia está dirigida a un niño con ${specialNeed}. Por favor, adapta la historia según las siguientes pautas:`;

    switch (specialNeed) {
      case "TEA":
        prompt += `
- Usa frases claras y directas.
- Evita metáforas y lenguaje figurado.
- Proporciona una estructura predecible con rutinas.`;
        break;
      case "TDAH":
        prompt += `
- Crea una historia corta, dinámica y con ritmo rápido.
- Divide la narración en secciones breves para mantener el interés.
- Incluye acción constante y situaciones emocionantes.`;
        break;
      case "Dislexia":
        prompt += `
- Utiliza lenguaje sencillo y vocabulario fácil.
- Construye frases cortas y claras.
- Evita palabras visualmente similares o difíciles.`;
        break;
      case "Ansiedad":
        prompt += `
- Desarrolla temas calmados y tranquilizantes.
- Asegura resoluciones positivas y reconfortantes.
- Evita conflictos o situaciones de tensión elevada.`;
        break;
      case "Down":
        prompt += `
- Utiliza lenguaje simple y repetitivo.
- Incluye expresiones afectivas y positivas con frecuencia.
- Crea una narración emocional y de fácil seguimiento.`;
        break;
      case "Comprension":
        prompt += `
- Construye una narración pausada con frases breves.
- Repite conceptos clave para reforzar la comprensión.
- Usa un lenguaje muy claro y estructurado.`;
        break;
    }
  }

  return prompt;
}

/**
 * Creates a user prompt based on the story options
 */
function createUserPrompt(params: GenerateStoryParams): string {
  const {
    options,
    language = "español",
    childAge = 7,
    specialNeed = "Ninguna",
  } = params;
  const character = options.character;

  let prompt =
    `Por favor, crea una historia para un niño de ${childAge} años en ${language}.`;

  if (specialNeed !== "Ninguna") {
    prompt += ` Recuerda adaptar la historia para un niño con ${specialNeed}.`;
  }

  if (character) {
    prompt += `\n\nEl personaje principal se llama ${
      character.name || "el protagonista"
    }`;

    if (character.profession) {
      prompt += ` y es ${character.profession}`;
    }

    if (character.hobbies && character.hobbies.length > 0) {
      prompt += `. Le gusta ${character.hobbies.join(", ")}.`;
    }

    if (character.characterType) {
      prompt += ` Es un ${character.characterType}.`;
    }

    if (character.personality) {
      prompt += ` Su personalidad es ${character.personality}.`;
    }

    if (character.description) {
      prompt += ` ${character.description}`;
    }
  }

  if (options.genre) {
    prompt += `\n\nLa historia debe ser del género ${options.genre}.`;
  }

  if (options.moral) {
    prompt +=
      `\n\nLa historia debe transmitir la siguiente enseñanza: ${options.moral}.`;
  }

  if (options.duration) {
    const lengthMap = {
      short: "corta (exactamente 700 palabras)",
      medium: "media (exactamente 1500 palabras)",
      long: "larga (exactamente 2400 palabras)",
    };

    prompt += `\n\nLa longitud de la historia debe ser ${
      lengthMap[options.duration]
    }.`;
  }

  prompt +=
    `\n\nPor favor, desarrolla la historia completa sin incluir título. Es muy importante que respetes el número exacto de palabras indicado para la longitud.`;

  return prompt;
}

/**
 * Elimina el título incrustado en el contenido si existe
 */
function removeEmbeddedTitle(text: string): string {
  // Patrones comunes de títulos en el contenido
  const titlePatterns = [
    /^#\s+(.+?)(?:\n|\r\n|\r)/, // Título con formato Markdown: # Título
    /^(.+?)(?:\n|\r\n|\r){2}/, // Título seguido de línea en blanco
    /^(?:Título:|Title:)\s*(.+?)(?:\n|\r\n|\r)/, // Título explícito con prefijo
  ];

  for (const pattern of titlePatterns) {
    if (pattern.test(text)) {
      // Elimina el título y cualquier línea en blanco adicional
      return text.replace(pattern, "").trim();
    }
  }

  return text;
}

/**
 * Función principal para manejar las solicitudes
 */
serve(async (req) => {
  // Manejar las solicitudes OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Obtener el usuario autenticado desde la solicitud
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó token de autenticación' }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Extraer el token JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar el token y obtener el usuario
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado', details: authError }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Obtener el perfil del usuario para verificar límites
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status, monthly_stories_generated, last_story_reset_date')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error al obtener perfil:', profileError);
      return new Response(
        JSON.stringify({ error: 'Error al verificar perfil de usuario', details: profileError }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Determinar si el usuario es premium
    const isPremium = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
    
    // Inicializar contador de historias actual
    let currentStoriesGenerated = profile?.monthly_stories_generated || 0;
    
    // Si NO es premium, verificar límites y posible reset mensual
    if (!isPremium) {
      const now = new Date();
      const lastResetDate = profile?.last_story_reset_date ? new Date(profile.last_story_reset_date) : null;
      
      // Verificar si es necesario hacer reset mensual
      if (!lastResetDate || 
          lastResetDate.getMonth() !== now.getMonth() || 
          lastResetDate.getFullYear() !== now.getFullYear()) {
        
        // Realizar reset mensual
        const { error: resetError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            monthly_stories_generated: 0, 
            last_story_reset_date: now.toISOString() 
          })
          .eq('id', user.id);
        
        if (resetError) {
          console.error('Error al resetear contador mensual:', resetError);
        } else {
          // Actualizar variable local del contador
          currentStoriesGenerated = 0;
          console.log(`Reset mensual realizado para usuario ${user.id}`);
        }
      }
      
      // Verificar si el usuario ha alcanzado el límite mensual (después del posible reset)
      if (currentStoriesGenerated >= 10) {
        return new Response(
          JSON.stringify({ 
            error: 'Límite mensual de historias gratuitas alcanzado. Actualiza a Premium para generar más historias.' 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429, // Too Many Requests
          }
        );
      }
    }

    // Procesar la solicitud normal
    const {
      options,
      language = "español",
      childAge = 7,
      specialNeed = "Ninguna",
    } = await req.json();

    // Crear los prompts
    const systemPrompt = createSystemPrompt(language, childAge, specialNeed);
    const userPrompt = createUserPrompt({
      options,
      language,
      childAge,
      specialNeed,
    });

    // Combinamos los prompts para hacer una sola llamada
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Configuración de generación - sin límite de tokens para evitar truncamiento
    const generationConfig = {
      temperature: 0.8, // Para mejorar la creatividad
      topK: 40, // Para mejorar la diversidad
      topP: 0.95, // Para mejorar la coherencia
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();

    // Procesamos la respuesta para eliminar el título si existe
    const cleanedText = removeEmbeddedTitle(text);

    return new Response(
      JSON.stringify({ content: cleanedText }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error en generate-story:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
