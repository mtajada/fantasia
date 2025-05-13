import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { v4 as uuidv4 } from "npm:uuid@9.0.0";

// Configuración de la API de Gemini
const API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const modelName = Deno.env.get('TEXT_MODEL_GENERATE');
const model = genAI.getGenerativeModel({
  model: modelName,
});

// Generar un UUID
const generateId = () => uuidv4();

// Tipos necesarios
interface ProfileSettings {
  childAge: number;
  specialNeed?: string;
  language: string;
}

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
    duration: "short" | "medium" | "long";
  };
}

type ChallengeCategory = "language" | "math" | "comprehension";

interface ChallengeQuestion {
  id: string;
  category: ChallengeCategory;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  targetLanguage?: string;
}

interface Challenge {
  id: string;
  storyId: string;
  questions: ChallengeQuestion[];
  createdAt: string;
}

/**
 * Genera una pregunta de desafío basada en la historia
 */
async function generateChallengeQuestion(
  story: Story,
  category: ChallengeCategory,
  profileSettings: ProfileSettings,
  targetLanguage?: string,
): Promise<{
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}> {
  try {
    // Extraer datos relevantes del perfil y la historia
    const { childAge, specialNeed = "Ninguna", language } = profileSettings;
    const { character, genre, moral } = story.options;

    // Build the system prompt based on the category
    let systemPrompt =
      `Eres un experto educador infantil especializado en crear preguntas educativas para niños. Tu tarea es crear una pregunta de desafío educativo basada en el siguiente contexto:

DATOS DEL OYENTE:
- Edad: ${childAge} años
- Idioma principal: ${language}
${specialNeed !== "Ninguna" ? `- Necesidad especial: ${specialNeed}` : ""}

DATOS DE LA HISTORIA:
- Título: ${story.title}
- Género: ${genre}
- Moraleja/Enseñanza: ${moral}

PERSONAJE PRINCIPAL:
- Nombre: ${character.name}
- Profesión: ${character.profession}
- Tipo de personaje: ${character.characterType}
- Aficiones: ${character.hobbies.join(", ")}
- Personalidad: ${character.personality || "No especificada"}

HISTORIA COMPLETA:
${story.content}

`;

    switch (category) {
      case "language":
        systemPrompt += `
INSTRUCCIÓN:
Crea una pregunta para aprender el idioma ${targetLanguage} relacionada con elementos de la historia. La pregunta debe:
1. Contener una palabra o frase en ${targetLanguage} relacionada con un elemento clave de la historia (personaje, objeto, acción, etc.)
2. Ofrecer 4 opciones de respuesta (solo una correcta)
3. Ser apropiada para un niño de ${childAge} años ${
          specialNeed !== "Ninguna" ? `con ${specialNeed}` : ""
        }
4. Incluir una explicación clara de por qué la respuesta es correcta

FORMATO DE RESPUESTA (es obligatorio usar este formato exacto):
{
  "question": "Texto de la pregunta en español incluyendo la palabra en ${targetLanguage}",
  "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
  "correctOptionIndex": 0,
  "explanation": "Explicación de la respuesta correcta"
}`;
        break;

      case "math":
        systemPrompt += `
INSTRUCCIÓN:
Crea un problema matemático relacionado con elementos de la historia. El problema debe:
1. Utilizar personajes, objetos o situaciones que aparecen en la historia
2. Ser apropiado para el nivel educativo de un niño de ${childAge} años ${
          specialNeed !== "Ninguna" ? `con ${specialNeed}` : ""
        }
3. Ofrecer 4 opciones de respuesta (solo una correcta)
4. Incluir una explicación clara de cómo se resuelve el problema

FORMATO DE RESPUESTA (es obligatorio usar este formato exacto):
{
  "question": "Texto del problema matemático contextualizado en la historia",
  "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
  "correctOptionIndex": 0,
  "explanation": "Explicación paso a paso de cómo resolver el problema"
}`;
        break;

      case "comprehension":
        systemPrompt += `
INSTRUCCIÓN:
Crea una pregunta de comprensión lectora relacionada con la historia. La pregunta debe:
1. Evaluar la comprensión de la trama, personajes, motivaciones o enseñanza de la historia
2. Ser apropiada para un niño de ${childAge} años ${
          specialNeed !== "Ninguna" ? `con ${specialNeed}` : ""
        }
3. Ofrecer 4 opciones de respuesta (solo una correcta)
4. Incluir una explicación clara de por qué la respuesta es correcta, citando elementos específicos de la historia

FORMATO DE RESPUESTA (es obligatorio usar este formato exacto):
{
  "question": "Texto de la pregunta de comprensión",
  "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
  "correctOptionIndex": 0,
  "explanation": "Explicación detallada de la respuesta correcta con referencias a la historia"
}`;
        break;
    }

    // Adaptación adicional según necesidades especiales
    if (specialNeed !== "Ninguna") {
      systemPrompt +=
        `\n\nIMPORTANTE: La pregunta debe estar adaptada para un niño con ${specialNeed}. Asegúrate de que:`;

      switch (specialNeed) {
        case "TEA":
          systemPrompt += `
- El lenguaje sea claro, directo y literal
- Las instrucciones sean explícitas
- Evita el uso de metáforas o lenguaje figurado
- Las opciones de respuesta sean concretas`;
          break;
        case "TDAH":
          systemPrompt += `
- La pregunta sea breve y directa
- El contenido sea visualmente atractivo
- Las opciones de respuesta sean concisas
- La explicación sea dinámica y enfocada`;
          break;
        case "Dislexia":
          systemPrompt += `
- La pregunta use vocabulario sencillo y familiar
- Las frases sean cortas y estructuradas
- Evita palabras visualmente similares
- Las opciones de respuesta sean claramente diferenciables`;
          break;
      }
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });
    const response = await result.response;
    const text = response.text();

    try {
      // Parse the JSON response
      // Find JSON in the text (may be surrounded by markdown code blocks)
      const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
        text.match(/```\s*(\{[\s\S]*?\})\s*```/) ||
        text.match(/(\{[\s\S]*?\})/);

      if (jsonMatch && jsonMatch[1]) {
        const jsonResponse = JSON.parse(jsonMatch[1]);

        // Validate required fields
        if (
          !jsonResponse.question || !jsonResponse.options ||
          typeof jsonResponse.correctOptionIndex !== "number" ||
          !jsonResponse.explanation
        ) {
          throw new Error("Invalid response format from AI");
        }

        return {
          question: jsonResponse.question,
          options: jsonResponse.options,
          correctOptionIndex: jsonResponse.correctOptionIndex,
          explanation: jsonResponse.explanation,
        };
      } else {
        throw new Error("Could not extract JSON from AI response");
      }
    } catch (parseError) {
      // Fallback question if parsing fails
      return generateFallbackQuestion(category, targetLanguage, story);
    }
  } catch (error) {
    // Return a fallback question
    return generateFallbackQuestion(category, targetLanguage, story);
  }
}

/**
 * Genera una pregunta de respaldo si la API falla
 */
function generateFallbackQuestion(
  category: ChallengeCategory,
  targetLanguage?: string,
  story?: Story,
): {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
} {
  // Extract character name if available
  const characterName = story?.options?.character?.name || "protagonista";

  switch (category) {
    case "language":
      return {
        question: `¿Cómo se dice "${story ? "amigo" : "amigo"}" en ${
          targetLanguage || "inglés"
        }?`,
        options: ["Friend", "House", "Book", "Play"],
        correctOptionIndex: 0,
        explanation: `"Amigo" en ${
          targetLanguage || "inglés"
        } se dice "Friend". Es una palabra importante para las relaciones personales.`,
      };

    case "math":
      return {
        question:
          `Si ${characterName} tiene 5 objetos y encuentra 3 más, ¿cuántos tiene en total?`,
        options: ["7", "8", "9", "10"],
        correctOptionIndex: 1,
        explanation:
          "La suma de 5 + 3 = 8. Recuerda que para sumar debes combinar ambas cantidades.",
      };

    case "comprehension":
      return {
        question: `¿Qué aprendemos de la historia de ${characterName}?`,
        options: [
          "Es importante ayudar a los demás",
          "Nunca debemos confiar en nadie",
          "La amistad no es importante",
          "No debemos esforzarnos",
        ],
        correctOptionIndex: 0,
        explanation:
          "La historia nos enseña la importancia de ayudar a los demás. Cuando cooperamos y somos amables, todos salimos beneficiados.",
      };
  }
}

/**
 * Crea un nuevo desafío con una pregunta
 */
async function createChallenge(
  story: Story,
  category: ChallengeCategory,
  profileSettings: ProfileSettings,
  targetLanguage?: string,
): Promise<Challenge> {
  try {
    // Generate a question for the challenge
    const questionData = await generateChallengeQuestion(
      story,
      category,
      profileSettings,
      targetLanguage,
    );

    const question = {
      id: generateId(),
      category,
      targetLanguage,
      ...questionData,
    };

    // Create the challenge
    const challenge: Challenge = {
      id: generateId(),
      storyId: story.id,
      questions: [question],
      createdAt: new Date().toISOString(),
    };

    return challenge;
  } catch (error) {
    throw error;
  }
}

/**
 * Lista de idiomas disponibles para desafíos de idiomas
 */
function getAvailableLanguages(
  currentLanguage: string,
): { code: string; name: string }[] {
  const languages = [
    { code: "en", name: "Inglés" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Francés" },
    { code: "de", name: "Alemán" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Portugués" },
    { code: "ru", name: "Ruso" },
    { code: "zh", name: "Chino" },
    { code: "ja", name: "Japonés" },
    { code: "ko", name: "Coreano" },
  ];

  // Filter out the current language
  return languages.filter((lang) => lang.code !== currentLanguage);
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
    const { action, story, category, profileSettings, targetLanguage } =
      await req.json();

    if (action === "createChallenge") {
      const challenge = await createChallenge(
        story,
        category,
        profileSettings,
        targetLanguage,
      );

      return new Response(
        JSON.stringify(challenge),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else if (action === "getLanguages") {
      const languages = getAvailableLanguages(profileSettings.language);

      return new Response(
        JSON.stringify({ languages }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else {
      throw new Error(`Acción no soportada: ${action}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
