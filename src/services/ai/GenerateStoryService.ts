// src/services/ai/GenerateStoryService.ts
import { StoryOptions, Story } from "../../types"; // Importar Story si no está
import { supabase } from "../../supabaseClient";

export interface GenerateStoryParams {
  options: Partial<StoryOptions>; // O el tipo completo si siempre está completo
  language?: string;
  additionalDetails?: string; // <-- Añadir nueva propiedad
}

// Definir el tipo de respuesta esperada de la Edge Function
export interface GenerateStoryResponse {
  content: string;
  title: string;
}

export class GenerateStoryService {
  /**
   * Generates initial story content and title using the 'generate-story' Edge Function.
   */
  public static async generateStoryWithAI(params: GenerateStoryParams): Promise<GenerateStoryResponse> {
    try {
      console.log('Enviando solicitud a la Edge Function generate-story con params:', params); // Loguear parámetros

      // Asegúrate de pasar el token de autenticación si la función lo requiere (lo requiere)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'Usuario no autenticado.');
      }
      const token = sessionData.session.access_token;

      // Validate character structure to ensure compatibility with new schema
      if (params.options.characters && params.options.characters.length > 0) {
        const validGenders = ['male', 'female', 'non-binary'];
        for (const character of params.options.characters) {
          if (!character.name || typeof character.name !== 'string' || character.name.trim().length === 0) {
            throw new Error(`Invalid character: missing or empty name field`);
          }
          if (!character.gender || !validGenders.includes(character.gender)) {
            throw new Error(`Invalid character "${character.name}": gender must be one of ${validGenders.join(', ')}`);
          }
          if (!character.description || typeof character.description !== 'string' || character.description.trim().length === 0) {
            throw new Error(`Invalid character "${character.name}": missing or empty description field`);
          }
        }
        console.log('✅ Character structure validation passed');
      }

      // DEBUG: Log the exact payload being sent including character info
      const charactersInfo = `Characters (${params.options.characters?.length || 0}): ${params.options.characters?.map(c => `${c.name} (${c.gender})`).join(', ') || 'None'}`;
      console.log(`>>> Payload being sent to generate-story: ${charactersInfo}`);
      console.log(">>> Full payload:", JSON.stringify(params, null, 2));

      const { data, error } = await supabase.functions.invoke<GenerateStoryResponse>('generate-story', { // Especificar tipo de respuesta <T>
        body: params, // El cuerpo ya contiene las opciones, idioma, etc. y additionalDetails
        headers: {
          'Authorization': `Bearer ${token}` // Pasar el token
        }
      });

      if (error) {
        console.error('Error en Edge Function generate-story:', error);
        // Puedes intentar obtener más detalles del error si es un HttpError
        let message = error.message;
        if ((error as any).context) { // Supabase FunctionsHttpError tiene 'context'
          message = `${message} - ${JSON.stringify((error as any).context)}`;
        }
        throw new Error(message);
      }

      // Validar que la respuesta tiene el formato esperado { content: string, title: string }
      if (!data || typeof data.content !== 'string' || typeof data.title !== 'string') {
        console.error('Respuesta inesperada de generate-story:', data);
        throw new Error('La respuesta de generate-story no contiene contenido y título válidos.');
      }

      console.log('Respuesta de generate-story recibida (título):', data.title);
      return data; // Devolver el objeto { content, title } completo

    } catch (error) {
      console.error('Error en GenerateStoryService.generateStoryWithAI:', error);
      // Relanzar para que el llamador (storyGenerator) pueda manejarlo
      throw error;
    }
  }
}