import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Configuración de la API de Gemini
const API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-thinking-exp-01-21",
});

// Tipos necesarios
interface Story {
  id: string;
  title: string;
  content: string;
  options: {
    character: {
      id: string;
      name: string;
      profession: string;
      characterType: string;
      hobbies: string[];
      personality?: string;
    };
    genre: string;
    moral: string;
    duration: 'short' | 'medium' | 'long';
  };
}

interface StoryChapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
}

/**
 * Traduce la duración de la historia de inglés a español
 */
function translateDuration(duration: string): string {
  switch(duration) {
    case 'short': return 'corta';
    case 'medium': return 'media';
    case 'long': return 'larga';
    default: return 'media'; // Default to medium if not specified
  }
}

/**
 * Crea un prompt de sistema para continuación de historia
 */
function createSystemPrompt(story: Story): string {
  const durationInSpanish = translateDuration(story.options.duration);
  
  return `Eres un experto narrador de cuentos infantiles. Tu tarea es continuar una historia existente de manera coherente y creativa.
  
Debes asegurarte de:
1. Mantener la coherencia con la historia previa.
2. Preservar el tono, estilo y vocabulario de la narración original.
3. No contradecir eventos o características de personajes establecidos.
4. Desarrollar tramas interesantes que mantengan la atención del lector.
5. Mantener la narrativa apropiada para niños.
6. Crear un nuevo capítulo cuya longitud sea similar a la del capítulo anterior, respetando la duración seleccionada {${durationInSpanish}} establecida en el primer capítulo.`;
}

/**
 * Crea un prompt para continuación libre
 */
function createFreeContinuationPrompt(story: Story, previousChapters: StoryChapter[]): string {
  const previousContent = previousChapters.map(chapter => chapter.content).join("\n\n");
  const durationInSpanish = translateDuration(story.options.duration);
  
  return `Continúa la siguiente historia de forma natural y coherente:

===HISTORIA PREVIA===
${previousContent}
===FIN DE HISTORIA PREVIA===

La continuación debe tener una extensión comparable a la del capítulo anterior, respetando la duración seleccionada {${durationInSpanish}} en el primer capítulo y mantener el estilo narrativo. No repitas la historia anterior, solo continúala. IMPORTANTE: Comienza directamente con la narración, sin incluir títulos, subtítulos, ni marcadores como "Continuación" o cualquier otro texto introductorio.`;
}

/**
 * Crea un prompt para opciones de continuación guiada
 */
function createGuidedOptionsPrompt(previousChapters: StoryChapter[]): string {
  const previousContent = previousChapters.map(chapter => chapter.content).join("\n\n");
  
  return `A partir de la siguiente historia, genera TRES opciones cortas para continuar al estilo "Elige tu propia aventura":

===HISTORIA PREVIA===
${previousContent}
===FIN DE HISTORIA PREVIA===

INSTRUCCIONES:
1. Genera EXACTAMENTE tres opciones breves (máximo 10-12 palabras cada una) para continuar la historia
2. Cada opción debe sugerir una dirección distinta sin revelar el desarrollo completo
3. Las opciones deben ser como en un libro de "Elige tu propia aventura": cortas, intrigantes y que sugieran algo 
4. Las opciones deben funcionar como "Lo que podría hacer el protagonista" o "Lo que podría ocurrir después"
5. NO incluyas resoluciones ni spoilers, solo una sugerencia del camino a seguir
6. Cada opción debe comenzar con verbos o acciones sugerentes, como "Explorar...", "Hablar con...", "Buscar...", etc.
7. Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON con este formato exacto:

{
  "options": [
    {"summary": "Opción corta 1 (10-12 palabras máximo)"},
    {"summary": "Opción corta 2 (10-12 palabras máximo)"},
    {"summary": "Opción corta 3 (10-12 palabras máximo)"}
  ]
}

IMPORTANTE: Tu respuesta debe ser un objeto JSON válido y nada más. No incluyas comillas triples ni indicaciones de formato, solo el objeto JSON puro.`;
}

/**
 * Crea un prompt para continuación dirigida basada en entrada del usuario
 */
function createDirectedContinuationPrompt(story: Story, previousChapters: StoryChapter[], userDirection: string): string {
  const previousContent = previousChapters.map(chapter => chapter.content).join("\n\n");
  const durationInSpanish = translateDuration(story.options.duration);
  
  return `Continúa la siguiente historia siguiendo las indicaciones proporcionadas por el usuario:

===HISTORIA PREVIA===
${previousContent}
===FIN DE HISTORIA PREVIA===

===INDICACIONES DEL USUARIO===
${userDirection}
===FIN DE INDICACIONES===

La continuación debe tener una extensión comparable a la del capítulo anterior, respetando la duración seleccionada {${durationInSpanish}}, manteniendo el estilo narrativo, y siguiendo las indicaciones del usuario de forma creativa y coherente. No repitas la historia anterior, solo continúala. IMPORTANTE: Comienza directamente con la narración, sin incluir marcadores como "Continuación" o "===CONTINUACIÓN===" ni cualquier otro texto introductorio. Debes empezar directamente con el texto narrativo.`;
}

/**
 * Crea un prompt para una opción de continuación específica
 */
function createSpecificOptionPrompt(story: Story, previousChapters: StoryChapter[], optionIndex: number): string {
  const previousContent = previousChapters.map(chapter => chapter.content).join("\n\n");
  const durationInSpanish = translateDuration(story.options.duration);
  
  return `Continúa la siguiente historia siguiendo la opción ${optionIndex + 1}:

===HISTORIA PREVIA===
${previousContent}
===FIN DE HISTORIA PREVIA===

La continuación debe tener una extensión comparable a la del capítulo anterior, respetando la duración seleccionada {${durationInSpanish}} y mantener el estilo narrativo. Desarrolla la historia de manera coherente y creativa. No repitas la historia anterior, solo continúala. IMPORTANTE: Comienza directamente con la narración, sin incluir marcadores como "Continuación" o "===CONTINUACIÓN===" ni cualquier otro texto introductorio. Debes empezar directamente con el texto narrativo.`;
}

/**
 * Elimina el título incrustado en el contenido si existe
 */
function removeEmbeddedTitle(text: string): string {
  // Patrones comunes de títulos en el contenido
  const titlePatterns = [
    /^#\s+(.+?)(?:\n|\r\n|\r)/,      // Título con formato Markdown: # Título
    /^(.+?)(?:\n|\r\n|\r){2}/,      // Título seguido de línea en blanco
    /^(?:Título:|Title:)\s*(.+?)(?:\n|\r\n|\r)/, // Título explícito con prefijo
    /^===.*?===(?:\n|\r\n|\r)/, // Cualquier texto entre === como marcador
    /^Capítulo.*?:.*?(?:\n|\r\n|\r)/, // Patrones de "Capítulo X: Título"
    /^Continuación.*?(?:\n|\r\n|\r)/ // Texto que comienza con "Continuación"
  ];
  
  for (const pattern of titlePatterns) {
    if (pattern.test(text)) {
      // Elimina el título y cualquier línea en blanco adicional
      return text.replace(pattern, '').trim();
    }
  }
  
  return text;
}

/**
 * Genera opciones de continuación
 */
async function generateContinuationOptions(story: Story, chapters: StoryChapter[]): Promise<{ options: { summary: string }[] }> {
  try {
    const prompt = createGuidedOptionsPrompt(chapters);
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Eres un asistente que genera opciones de continuación para cuentos infantiles en español. Tu objetivo es proporcionar opciones creativas, seguras y apropiadas para niños.\n\n' + prompt }] 
      }],
      generationConfig: { 
        temperature: 0.8,
        topK: 40,
        topP: 0.95
      }
    });
    
    const response = await result.response;
    const text = response.text().trim();
    
    // Intentamos extraer JSON de la respuesta
    try {
      // Intento 1: Parsear directamente
      const result = JSON.parse(text);
      
      // Verificar que tenga el formato esperado
      if (result && result.options && Array.isArray(result.options) && result.options.length === 3 &&
          result.options.every(opt => typeof opt.summary === 'string')) {
        return result;
      }
    } catch (parseError) {
      // Intento 2: Buscar un bloque de código JSON en la respuesta (por si viene en formato markdown)
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const extractedJson = JSON.parse(jsonMatch[1]);
          // Verificar formato
          if (extractedJson && extractedJson.options && Array.isArray(extractedJson.options) && 
              extractedJson.options.length === 3 && 
              extractedJson.options.every(opt => typeof opt.summary === 'string')) {
            return extractedJson;
          }
        } catch (blockParseError) {
          // Error al parsear bloque JSON
        }
      }
      
      // Intento 3: Buscar cualquier cosa entre llaves que parezca un objeto JSON
      const braceMatch = text.match(/\{[\s\S]*?\}/);
      if (braceMatch && braceMatch[0]) {
        try {
          const extractedJson = JSON.parse(braceMatch[0]);
          // Verificar formato
          if (extractedJson && extractedJson.options && Array.isArray(extractedJson.options) && 
              extractedJson.options.length === 3 && 
              extractedJson.options.every(opt => typeof opt.summary === 'string')) {
            return extractedJson;
          }
        } catch (braceParseError) {
          // Error al parsear contenido entre llaves
        }
      }
    }
    
    // Si llegamos aquí, no pudimos extraer JSON válido
    throw new Error('Formato de respuesta inválido');
    
  } catch (error) {
    // Proporcionar opciones predeterminadas en caso de error
    return {
      options: [
        { summary: "Buscar el tesoro escondido en el bosque." },
        { summary: "Hablar con el misterioso anciano del pueblo." },
        { summary: "Seguir el camino hacia las montañas nevadas." }
      ]
    };
  }
}

/**
 * Genera una continuación para una historia
 */
async function generateStory(systemPrompt: string, userPrompt: string, maxTokens: number = 1500): Promise<string> {
  try {
    // Combinamos los prompts para hacer una sola llamada
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig: { 
        temperature: 0.7,
        topK: 40,
        topP: 0.95
      }
    });
    
    const response = await result.response;
    let text = response.text();
    
    // Procesamos la respuesta para eliminar el título si existe
    text = removeEmbeddedTitle(text);
    
    // Eliminar otros posibles marcadores que puedan aparecer
    text = text.replace(/===.*?===/g, '').trim();
    
    // Si el texto comienza con alguna forma de "continuación", eliminarlo
    text = text.replace(/^(?:Continuación|Continúa|Continuando|Continuamos).*?\n/i, '').trim();
    
    return text;
  } catch (error) {
    throw error;
  }
}

/**
 * Genera una continuación libre
 */
async function generateFreeContinuation(story: Story, chapters: StoryChapter[]): Promise<string> {
  const systemPrompt = createSystemPrompt(story);
  const userPrompt = createFreeContinuationPrompt(story, chapters);
  
  return await generateStory(systemPrompt, userPrompt, 1500);
}

/**
 * Genera una continuación para una opción específica
 */
async function generateOptionContinuation(story: Story, chapters: StoryChapter[], optionIndex: number): Promise<string> {
  const systemPrompt = createSystemPrompt(story);
  const userPrompt = createSpecificOptionPrompt(story, chapters, optionIndex);
  
  return await generateStory(systemPrompt, userPrompt, 1500);
}

/**
 * Genera una continuación basada en la dirección del usuario
 */
async function generateDirectedContinuation(story: Story, chapters: StoryChapter[], userDirection: string): Promise<string> {
  const systemPrompt = createSystemPrompt(story);
  const userPrompt = createDirectedContinuationPrompt(story, chapters, userDirection);
  
  return await generateStory(systemPrompt, userPrompt, 1500);
}

/**
 * Genera un título para un capítulo basado en su contenido
 */
async function generateChapterTitle(content: string): Promise<string> {
  const systemPrompt = "Eres un experto en crear títulos para capítulos de cuentos infantiles. Tu tarea es crear un título corto, atractivo y descriptivo para el capítulo de un cuento.";
  const userPrompt = `Crea un título breve y atractivo para el siguiente capítulo de un cuento infantil. El título debe ser de 2-6 palabras y capturar la esencia del capítulo. IMPORTANTE: Debes responder SOLAMENTE con el título, sin comillas, sin explicaciones adicionales.

===CONTENIDO DEL CAPÍTULO===
${content.substring(0, 1500)}
===FIN DEL CONTENIDO===`;
  
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { 
        temperature: 0.7,
        topK: 20,
        topP: 0.95
      }
    });
    
    const response = await result.response;
    let title = response.text().trim();
    
    // Verificar si el título está vacío o es demasiado largo
    if (!title || title.length < 2 || title.length > 50) {
      // Extraer personajes o elementos clave del contenido
      const contentWords = content.split(/\s+/).slice(0, 100);
      const commonNames = contentWords.filter(word => word.length > 3 && word[0] === word[0].toUpperCase()).slice(0, 3);
      
      // Generar un título de respaldo basado en palabras clave
      if (commonNames.length > 0) {
        const randomAdjective = ["Mágico", "Gran", "Misterioso", "Increíble", "Fantástico", "Maravilloso"][Math.floor(Math.random() * 6)];
        title = `El ${randomAdjective} ${commonNames[0]}`;
      } else {
        title = `Un Nuevo Capítulo`;
      }
    }
    
    return title;
  } catch (error) {
    console.error('Error al generar título:', error);
    return `Capítulo ${new Date().toLocaleDateString()}`;
  }
}

/**
 * Función principal para manejar las solicitudes
 */
serve(async (req) => {
  // Manejar las solicitudes OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, story, chapters, optionIndex, userDirection, content } = await req.json();

    switch (action) {
      case 'generateOptions':
        const options = await generateContinuationOptions(story, chapters);
        return new Response(
          JSON.stringify(options),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
        
      case 'freeContinuation':
        const freeContinuation = await generateFreeContinuation(story, chapters);
        return new Response(
          JSON.stringify({ content: freeContinuation }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
        
      case 'optionContinuation':
        const optionContinuation = await generateOptionContinuation(story, chapters, optionIndex);
        return new Response(
          JSON.stringify({ content: optionContinuation }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
        
      case 'directedContinuation':
        const directedContinuation = await generateDirectedContinuation(story, chapters, userDirection);
        return new Response(
          JSON.stringify({ content: directedContinuation }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
        
      case 'generateTitle':
        const title = await generateChapterTitle(content);
        return new Response(
          JSON.stringify({ title }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
        
      default:
        throw new Error(`Acción no soportada: ${action}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
}); 