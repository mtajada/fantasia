import { Story, StoryChapter } from "../types";
import { supabase } from "./supabase";

export class StoryContinuationService {
  /**
   * Translate story duration from English to Spanish
   */
  private static translateDuration(duration: string): string {
    switch(duration) {
      case 'short': return 'corta';
      case 'medium': return 'media';
      case 'long': return 'larga';
      default: return 'media'; // Default to medium if not specified
    }
  }

  /**
   * Creates a system prompt for story continuation
   */
  private static createSystemPrompt(story: Story): string {
    const durationInSpanish = this.translateDuration(story.options.duration);
    
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
   * Creates a prompt for free continuation
   */
  private static createFreeContinuationPrompt(story: Story, previousChapters: StoryChapter[]): string {
    const previousContent = previousChapters.map(chapter => chapter.content).join("\n\n");
    const durationInSpanish = this.translateDuration(story.options.duration);
    
    return `Continúa la siguiente historia de forma natural y coherente:

===HISTORIA PREVIA===
${previousContent}
===FIN DE HISTORIA PREVIA===

La continuación debe tener una extensión comparable a la del capítulo anterior, respetando la duración seleccionada {${durationInSpanish}} en el primer capítulo y mantener el estilo narrativo. No repitas la historia anterior, solo continúala.`;
  }

  /**
   * Creates a prompt for guided continuation options
   */
  private static createGuidedOptionsPrompt(previousChapters: StoryChapter[]): string {
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
   * Creates a prompt for directed continuation based on user input
   */
  private static createDirectedContinuationPrompt(story: Story, previousChapters: StoryChapter[], userDirection: string): string {
    const previousContent = previousChapters.map(chapter => chapter.content).join("\n\n");
    const durationInSpanish = this.translateDuration(story.options.duration);
    
    return `Continúa la siguiente historia siguiendo las indicaciones proporcionadas por el usuario:

===HISTORIA PREVIA===
${previousContent}
===FIN DE HISTORIA PREVIA===

===INDICACIONES DEL USUARIO===
${userDirection}
===FIN DE INDICACIONES===

La continuación debe tener una extensión comparable a la del capítulo anterior, respetando la duración seleccionada {${durationInSpanish}}, manteniendo el estilo narrativo, y siguiendo las indicaciones del usuario de forma creativa y coherente. No repitas la historia anterior, solo continúala.`;
  }

  /**
   * Creates a prompt for a specific continuation option
   */
  private static createSpecificOptionPrompt(story: Story, previousChapters: StoryChapter[], optionIndex: number): string {
    const previousContent = previousChapters.map(chapter => chapter.content).join("\n\n");
    const durationInSpanish = this.translateDuration(story.options.duration);
    
    return `Continúa la siguiente historia siguiendo la opción ${optionIndex + 1}:

===HISTORIA PREVIA===
${previousContent}
===FIN DE HISTORIA PREVIA===

La continuación debe tener una extensión comparable a la del capítulo anterior, respetando la duración seleccionada {${durationInSpanish}} y mantener el estilo narrativo. Desarrolla la historia de manera coherente y creativa. No repitas la historia anterior, solo continúala.`;
  }

  /**
   * Generates three distinct continuation options based on previous chapters
   */
  public static async generateContinuationOptions(story: Story, chapters: StoryChapter[]): Promise<{ options: { summary: string }[] }> {
    try {
      console.log('StoryContinuationService: Iniciando generación de opciones de continuación...');
      console.log('Enviando solicitud a la Edge Function story-continuation (generateOptions)...');
      
      const { data, error } = await supabase.functions.invoke('story-continuation', {
        body: {
          action: 'generateOptions',
          story,
          chapters
        }
      });
      
      if (error) {
        console.error('Error en Edge Function story-continuation:', error);
        throw error;
      }
      
      if (!data || !data.options) {
        throw new Error('La respuesta de story-continuation no contiene opciones');
      }
      
      return data;
    } catch (error) {
      console.error('Error al generar opciones de continuación:', error);
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
   * Generate a free continuation for a story
   */
  public static async generateFreeContinuation(story: Story, chapters: StoryChapter[]): Promise<string> {
    try {
      console.log('Enviando solicitud a la Edge Function story-continuation (freeContinuation)...');
      
      const { data, error } = await supabase.functions.invoke('story-continuation', {
        body: {
          action: 'freeContinuation',
          story,
          chapters
        }
      });
      
      if (error) {
        console.error('Error en Edge Function story-continuation:', error);
        throw error;
      }
      
      if (!data || !data.content) {
        throw new Error('La respuesta de story-continuation no contiene contenido');
      }
      
      return data.content;
    } catch (error) {
      console.error('Error generating free continuation:', error);
      throw error;
    }
  }

  /**
   * Generate a continuation for a specific option
   */
  public static async generateOptionContinuation(story: Story, chapters: StoryChapter[], optionIndex: number): Promise<string> {
    try {
      console.log('Enviando solicitud a la Edge Function story-continuation (optionContinuation)...');
      
      const { data, error } = await supabase.functions.invoke('story-continuation', {
        body: {
          action: 'optionContinuation',
          story,
          chapters,
          optionIndex
        }
      });
      
      if (error) {
        console.error('Error en Edge Function story-continuation:', error);
        throw error;
      }
      
      if (!data || !data.content) {
        throw new Error('La respuesta de story-continuation no contiene contenido');
      }
      
      return data.content;
    } catch (error) {
      console.error('Error generating option continuation:', error);
      throw error;
    }
  }

  /**
   * Generate a continuation based on user direction
   */
  public static async generateDirectedContinuation(story: Story, chapters: StoryChapter[], userDirection: string): Promise<string> {
    try {
      console.log('Enviando solicitud a la Edge Function story-continuation (directedContinuation)...');
      
      const { data, error } = await supabase.functions.invoke('story-continuation', {
        body: {
          action: 'directedContinuation',
          story,
          chapters,
          userDirection
        }
      });
      
      if (error) {
        console.error('Error en Edge Function story-continuation:', error);
        throw error;
      }
      
      if (!data || !data.content) {
        throw new Error('La respuesta de story-continuation no contiene contenido');
      }
      
      return data.content;
    } catch (error) {
      console.error('Error generating directed continuation:', error);
      throw error;
    }
  }

  /**
   * Generate a chapter title based on content
   */
  public static async generateChapterTitle(content: string): Promise<string> {
    try {
      console.log('Enviando solicitud a la Edge Function story-continuation (generateTitle)...');
      
      const { data, error } = await supabase.functions.invoke('story-continuation', {
        body: {
          action: 'generateTitle',
          content
        }
      });
      
      if (error) {
        console.error('Error en Edge Function story-continuation:', error);
        throw error;
      }
      
      if (!data || !data.title) {
        throw new Error('La respuesta de story-continuation no contiene título');
      }
      
      return data.title;
    } catch (error) {
      console.error('Error generating chapter title:', error);
      return `Capítulo ${new Date().toLocaleDateString()}`;
    }
  }
}
