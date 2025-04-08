import { StoryOptions } from "../types";
import { supabase } from "../supabaseClient";

interface GenerateStoryParams {
  options: Partial<StoryOptions>;
  language?: string;
  childAge?: number;
  specialNeed?: string;
}

export class GenerateStoryService {
  /**
   * Creates a system prompt for the story generation
   */
  private static createSystemPrompt(language: string = 'español', childAge: number = 7, specialNeed: string = 'Ninguna'): string {
    let prompt = `Eres un experto narrador de cuentos infantiles. Tu tarea es crear historias encantadoras y educativas para niños de ${childAge} años en ${language}.
    
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
    if (specialNeed !== 'Ninguna') {
      prompt += `\n\nIMPORTANTE: Esta historia está dirigida a un niño con ${specialNeed}. Por favor, adapta la historia según las siguientes pautas:`;
      
      switch(specialNeed) {
        case 'TEA':
          prompt += `
- Usa frases claras y directas.
- Evita metáforas y lenguaje figurado.
- Proporciona una estructura predecible con rutinas.`;
          break;
        case 'TDAH':
          prompt += `
- Crea una historia corta, dinámica y con ritmo rápido.
- Divide la narración en secciones breves para mantener el interés.
- Incluye acción constante y situaciones emocionantes.`;
          break;
        case 'Dislexia':
          prompt += `
- Utiliza lenguaje sencillo y vocabulario fácil.
- Construye frases cortas y claras.
- Evita palabras visualmente similares o difíciles.`;
          break;
        case 'Ansiedad':
          prompt += `
- Desarrolla temas calmados y tranquilizantes.
- Asegura resoluciones positivas y reconfortantes.
- Evita conflictos o situaciones de tensión elevada.`;
          break;
        case 'Down':
          prompt += `
- Utiliza lenguaje simple y repetitivo.
- Incluye expresiones afectivas y positivas con frecuencia.
- Crea una narración emocional y de fácil seguimiento.`;
          break;
        case 'Comprension':
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
  private static createUserPrompt(params: GenerateStoryParams): string {
    const { options, language = 'español', childAge = 7, specialNeed = 'Ninguna' } = params;
    const character = options.character;
    
    let prompt = `Por favor, crea una historia para un niño de ${childAge} años en ${language}.`;
    
    if (specialNeed !== 'Ninguna') {
      prompt += ` Recuerda adaptar la historia para un niño con ${specialNeed}.`;
    }
    
    if (character) {
      prompt += `\n\nEl personaje principal se llama ${character.name || 'el protagonista'}`;
      
      if (character.profession) {
        prompt += ` y es ${character.profession}`;
      }
      
      if (character.hobbies && character.hobbies.length > 0) {
        prompt += `. Le gusta ${character.hobbies.join(', ')}.`;
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
      prompt += `\n\nLa historia debe transmitir la siguiente enseñanza: ${options.moral}.`;
    }
    
    if (options.duration) {
      const lengthMap = {
        short: 'corta (exactamente 700 palabras)',
        medium: 'media (exactamente 1500 palabras)',
        long: 'larga (exactamente 2400 palabras)'
      };
      
      prompt += `\n\nLa longitud de la historia debe ser ${lengthMap[options.duration]}.`;
    }
    
    prompt += `\n\nPor favor, desarrolla la historia completa sin incluir título. Es muy importante que respetes el número exacto de palabras indicado para la longitud.`;
    
    return prompt;
  }

  /**
   * Generates a title for the story based on options
   */
  public static generateTitle(options: Partial<StoryOptions>): string {
    const character = options.character?.name || "un personaje";
    const profession = options.character?.profession || "";
    const genre = options.genre || "";
    
    const professionMappings: Record<string, string> = {
      'astronaut': 'astronauta',
      'detective': 'detective',
      'police': 'policía',
      'prince': 'príncipe',
      'superhero': 'superhéroe',
      'wizard': 'mago',
      'athlete': 'deportista',
      'teacher': 'profesor'
    };
    
    const genreMappings: Record<string, string[]> = {
      'adventure': ['La gran aventura de', 'El viaje de', 'La expedición de'],
      'fantasy': ['El mundo mágico de', 'Los poderes de', 'El reino de'],
      'mystery': ['El misterio de', 'La investigación de', 'El enigma de'],
      'comedy': ['Las divertidas travesuras de', 'Los chistes de', 'La comedia de'],
      'scifi': ['El viaje interestelar de', 'La misión espacial de', 'El futuro de']
    };
    
    const professionText = professionMappings[profession] || "";
    
    // Get a random title starter based on genre, or use a default
    const titleStarters = genreMappings[genre] || ['La historia de', 'Las aventuras de', 'El cuento de'];
    const titleStarter = titleStarters[Math.floor(Math.random() * titleStarters.length)];
    
    return professionText 
      ? `${titleStarter} ${character} el ${professionText}`
      : `${titleStarter} ${character}`;
  }

  /**
   * Generates a story using the Supabase Edge Function that calls Gemini API
   */
  public static async generateStoryWithAI(params: GenerateStoryParams): Promise<string> {
    try {
      console.log('Enviando solicitud a la Edge Function generate-story...');
      
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: params
      });
      
      if (error) {
        console.error('Error en Edge Function generate-story:', error);
        throw error;
      }
      
      if (!data || !data.content) {
        throw new Error('La respuesta de generate-story no contiene contenido');
      }
      
      return data.content;
    } catch (error) {
      console.error('Error generating story with Edge Function:', error);
      throw error;
    }
  }
}
