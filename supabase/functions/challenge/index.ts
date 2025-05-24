import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { v4 as uuidv4 } from "npm:uuid@9.0.0";
import {
  getSystemPromptPreamble,
  getLanguageChallengeInstruction,
  getMathChallengeInstruction,
  getComprehensionChallengeInstruction,
  getSpecialNeedInstruction,
} from "./prompt.ts"; // Asegúrate que la ruta a prompt.ts sea correcta

// Configuración de la API de Gemini
const API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const modelName = Deno.env.get('TEXT_MODEL_GENERATE') || "gemini-pro"; // Default model si no está en env
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

interface StoryCharacter {
  id: string;
  name: string;
  profession: string;
  characterType: string;
  hobbies: string[];
  personality?: string;
}

interface StoryOptions {
  character: StoryCharacter;
  genre: string;
  moral: string;
  duration: "short" | "medium" | "long";
}

interface Story {
  id: string;
  title: string;
  content: string;
  options: StoryOptions;
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
    const { childAge, specialNeed, language } = profileSettings;
    const { character, genre, moral } = story.options;

    const profileDataForPrompt = { childAge, language, specialNeed };
    const storyDataForPrompt = { title: story.title, genre, moral, content: story.content };
    const characterDataForPrompt = { ...character };

    let systemPrompt = getSystemPromptPreamble(profileDataForPrompt, storyDataForPrompt, characterDataForPrompt);

    switch (category) {
      case "language":
        if (!targetLanguage) {
          throw new Error("targetLanguage es requerido para la categoría 'language'");
        }
        systemPrompt += getLanguageChallengeInstruction(childAge, specialNeed, targetLanguage);
        break;
      case "math":
        systemPrompt += getMathChallengeInstruction(childAge, specialNeed);
        break;
      case "comprehension":
        systemPrompt += getComprehensionChallengeInstruction(childAge, specialNeed);
        break;
    }

    systemPrompt += getSpecialNeedInstruction(specialNeed);

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
      const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
        text.match(/```\s*(\{[\s\S]*?\})\s*```/) ||
        text.match(/(\{[\s\S]*?\})/);

      if (jsonMatch && jsonMatch[1]) {
        const jsonResponse = JSON.parse(jsonMatch[1]);

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
        console.error("AI Response Text:", text); // Loguear la respuesta si no se encuentra JSON
        throw new Error("Could not extract JSON from AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", text, parseError);
      return generateFallbackQuestion(category, targetLanguage, story);
    }
  } catch (error) {
    console.error("Error in generateChallengeQuestion:", error);
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
  const characterName = story?.options?.character?.name || "protagonista";

  switch (category) {
    case "language":
      return {
        question: `¿Cómo se dice "${story ? "amigo" : "amigo"}" en ${targetLanguage || "inglés"
          }?`,
        options: ["Friend", "House", "Book", "Play"],
        correctOptionIndex: 0,
        explanation: `"Amigo" en ${targetLanguage || "inglés"
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
    const questionData = await generateChallengeQuestion(
      story,
      category,
      profileSettings,
      targetLanguage,
    );

    const question: ChallengeQuestion = {
      id: generateId(),
      category,
      targetLanguage: category === "language" ? targetLanguage : undefined,
      ...questionData,
    };

    const challenge: Challenge = {
      id: generateId(),
      storyId: story.id,
      questions: [question],
      createdAt: new Date().toISOString(),
    };

    return challenge;
  } catch (error) {
    console.error("Error creating challenge:", error);
    throw error; // Re-throw para que sea manejado por el handler principal
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

  return languages.filter((lang) => lang.code !== currentLanguage);
}

/**
 * Función principal para manejar las solicitudes
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, story, category, profileSettings, targetLanguage } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "La acción no fue proporcionada." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400, // Bad Request
        },
      );
    }

    if (action === "createChallenge") {
      if (!story || !category || !profileSettings) {
        return new Response(
          JSON.stringify({ error: "Faltan parámetros para createChallenge: story, category o profileSettings." }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }
      if (category === "language" && !targetLanguage) {
        return new Response(
          JSON.stringify({ error: "Falta el parámetro targetLanguage para la categoría 'language'." }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

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
      if (!profileSettings || !profileSettings.language) {
        return new Response(
          JSON.stringify({ error: "Falta profileSettings.language para getLanguages." }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }
      const languages = getAvailableLanguages(profileSettings.language);

      return new Response(
        JSON.stringify({ languages }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else {
      return new Response(
        JSON.stringify({ error: `Acción no soportada: ${action}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400, // Bad Request para acciones no válidas
        },
      );
    }
  } catch (error) {
    console.error("Server Error:", error); // Log del error en el servidor
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500, // Internal Server Error
      },
    );
  }
});

console.log("Challenge generation service running...");