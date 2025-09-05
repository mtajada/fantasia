// src/services/ai/GenerateStoryService.ts
import { StoryOptions, Story } from "../../types"; // Importar Story si no está
import { supabase } from "../../supabaseClient";

export interface GenerateStoryParams {
  options: Partial<StoryOptions>; // O el tipo completo si siempre está completo
  language?: string;
  additionalDetails?: string; // <-- Añadir nueva propiedad
  spicynessLevel?: number; // Adult content intensity level (1=Sensual, 2=Passionate, 3=Intense)
}

// Definir el tipo de respuesta esperada de la Edge Function
export interface GenerateStoryResponse {
  content: string;
  title: string;
}

export class GenerateStoryService {
  /**
   * Genera el contenido inicial de la historia y el título usando la Edge Function 'generate-story'.
   */
  public static async generateStoryWithAI(params: GenerateStoryParams): Promise<GenerateStoryResponse> {
    try {
      console.log('Enviando solicitud a la Edge Function generate-story con parámetros:', params); // Parámetros de log

      // Asegurarse de pasar el token de autenticación si la función lo requiere (lo hace)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'User not authenticated.');
      }
      const token = sessionData.session.access_token;

      // Validar estructura de personaje para asegurar compatibilidad con el nuevo esquema
      if (params.options.characters && params.options.characters.length > 0) {
        const validGenders = ['male', 'female', 'non-binary'];
        for (const character of params.options.characters) {
          if (!character.name || typeof character.name !== 'string' || character.name.trim().length === 0) {
            throw new Error(`Personaje inválido: campo de nombre faltante o vacío`);
          }
          if (!character.gender || !validGenders.includes(character.gender)) {
            throw new Error(`Personaje inválido "${character.name}": el género debe ser uno de ${validGenders.join(', ')}`);
          }
          if (!character.description || typeof character.description !== 'string' || character.description.trim().length === 0) {
            throw new Error(`Personaje inválido "${character.name}": campo de descripción faltante o vacío`);
          }
        }
        console.log('✅ Validación de estructura de personaje exitosa');
      }

      // Incluir nivel de intensidad en opciones si se proporciona
      if (params.spicynessLevel !== undefined) {
        params.options.spiciness_level = params.spicynessLevel;
      }

      // DEBUG: Registrar el payload exacto que se está enviando incluyendo información del personaje
      const charactersInfo = `Personajes (${params.options.characters?.length || 0}): ${params.options.characters?.map(c => `${c.name} (${c.gender})`).join(', ') || 'Ninguno'}`;
      console.log(`>>> Payload enviado a generate-story: ${charactersInfo}`);
      console.log(`>>> Nivel de intensidad: ${params.options.spiciness_level || 'por defecto (2)'}`);
      console.log(">>> Payload completo:", JSON.stringify(params, null, 2));

      const { data, error } = await supabase.functions.invoke<GenerateStoryResponse>('generate-story', { // Especificar tipo de respuesta <T>
        body: params, // El body ya contiene options, language, etc. y additionalDetails
        headers: {
          'Authorization': `Bearer ${token}` // Pass the token
        }
      });

      if (error) {
        console.error('Error en la Edge Function generate-story:', error);
        // Puedes intentar obtener más detalles del error si es un HttpError
        let message = error.message;
        if ((error as any).context) { // Supabase FunctionsHttpError has 'context'
          message = `${message} - ${JSON.stringify((error as any).context)}`;
        }
        throw new Error(message);
      }

      // Validar que la respuesta tenga el formato esperado { content: string, title: string }
      if (!data || typeof data.content !== 'string' || typeof data.title !== 'string') {
        console.error('Unexpected response from generate-story:', data);
        throw new Error('The generate-story response does not contain valid content and title.');
      }

      console.log('Respuesta de generate-story recibida (título):', data.title);
      return data; // Devolver el objeto completo { content, title }

    } catch (error) {
      console.error('Error en GenerateStoryService.generateStoryWithAI:', error);
      // Re-lanzar para que el llamador (storyGenerator) pueda manejarlo
      throw error;
    }
  }
}