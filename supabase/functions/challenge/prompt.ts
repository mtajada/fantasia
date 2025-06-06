// prompt.ts

interface StoryDataForPrompt {
    title: string;
    genre: string;
    moral: string;
    content: string;
}

interface CharacterDataForPrompt {
    name: string;
    profession: string;
    characterType: string;
    hobbies: string[];
    personality?: string;
}

interface ProfileDataForPrompt {
    childAge: number;
    language: string;
    specialNeed?: string;
}

export function getSystemPromptPreamble(
    profile: ProfileDataForPrompt,
    story: StoryDataForPrompt,
    character: CharacterDataForPrompt,
): string {
    return `Eres un experto educador infantil especializado en crear preguntas educativas para niños. Tu tarea es crear una pregunta de desafío educativo basada en el siguiente contexto:
  
  DATOS DEL OYENTE:
  - Edad: ${profile.childAge} años
  - Idioma principal: ${profile.language}
  ${profile.specialNeed && profile.specialNeed !== "Ninguna" ? `- Necesidad especial: ${profile.specialNeed}` : ""}
  
  DATOS DE LA HISTORIA:
  - Título: ${story.title}
  - Género: ${story.genre}
  - Moraleja/Enseñanza: ${story.moral}
  
  PERSONAJE PRINCIPAL:
  - Nombre: ${character.name}
  - Profesión: ${character.profession}
  - Tipo de personaje: ${character.characterType}
  - Aficiones: ${character.hobbies.join(", ")}
  - Personalidad: ${character.personality || "No especificada"}
  
  HISTORIA COMPLETA:
  ${story.content}
  
  `;
}

export function getLanguageChallengeInstruction(
    childAge: number,
    specialNeed: string | undefined,
    targetLanguage: string, // Es requerido para esta instrucción
): string {
    return `
  INSTRUCCIÓN:
  Crea una pregunta para aprender el idioma ${targetLanguage} relacionada con elementos de la historia. La pregunta debe:
  1. Contener una palabra o frase en ${targetLanguage} relacionada con un elemento clave de la historia (personaje, objeto, acción, etc.)
  2. Ofrecer 4 opciones de respuesta (solo una correcta)
  3. Ser apropiada para un niño de ${childAge} años ${specialNeed && specialNeed !== "Ninguna" ? `con ${specialNeed}` : ""
        }
  4. Incluir una explicación clara de por qué la respuesta es correcta
  
  FORMATO DE RESPUESTA (es obligatorio usar este formato exacto):
  {
    "question": "Texto de la pregunta en español incluyendo la palabra en ${targetLanguage}",
    "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
    "correctOptionIndex": 0,
    "explanation": "Explicación de la respuesta correcta"
  }`;
}

export function getMathChallengeInstruction(
    childAge: number,
    specialNeed: string | undefined,
): string {
    return `
  INSTRUCCIÓN:
  Crea un problema matemático relacionado con elementos de la historia. El problema debe:
  1. Utilizar personajes, objetos o situaciones que aparecen en la historia
  2. Ser apropiado para el nivel educativo de un niño de ${childAge} años ${specialNeed && specialNeed !== "Ninguna" ? `con ${specialNeed}` : ""
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
}

export function getComprehensionChallengeInstruction(
    childAge: number,
    specialNeed: string | undefined,
): string {
    return `
  INSTRUCCIÓN:
  Crea una pregunta de comprensión lectora relacionada con la historia. La pregunta debe:
  1. Evaluar la comprensión de la trama, personajes, motivaciones o enseñanza de la historia
  2. Ser apropiada para un niño de ${childAge} años ${specialNeed && specialNeed !== "Ninguna" ? `con ${specialNeed}` : ""
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
}

export function getSpecialNeedInstruction(specialNeed?: string): string {
    if (!specialNeed || specialNeed === "Ninguna") {
        return "";
    }

    let adaptationPrompt = `\n\nIMPORTANTE: La pregunta debe estar adaptada para un niño con ${specialNeed}. Asegúrate de que:`;
    switch (specialNeed) {
        case "TEA":
            adaptationPrompt += `
  - El lenguaje sea claro, directo y literal
  - Las instrucciones sean explícitas
  - Evita el uso de metáforas o lenguaje figurado
  - Las opciones de respuesta sean concretas`;
            break;
        case "TDAH":
            adaptationPrompt += `
  - La pregunta sea breve y directa
  - El contenido sea visualmente atractivo
  - Las opciones de respuesta sean concisas
  - La explicación sea dinámica y enfocada`;
            break;
        case "Dislexia":
            adaptationPrompt += `
  - La pregunta use vocabulario sencillo y familiar
  - Las frases sean cortas y estructuradas
  - Evita palabras visualmente similares
  - Las opciones de respuesta sean claramente diferenciables`;
            break;
        default:
            // No añade nada si la necesidad especial no está en la lista
            return "";
    }
    return adaptationPrompt;
}