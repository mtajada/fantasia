import { Story, StoryChapter } from "../../types";
import { supabase } from "../../supabaseClient";

export class StoryContinuationService {
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
