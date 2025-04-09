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
