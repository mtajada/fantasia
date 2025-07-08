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
      console.log('Sending request to generate-story Edge Function with params:', params); // Log parameters

      // Make sure to pass the authentication token if the function requires it (it does)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'User not authenticated.');
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

      const { data, error } = await supabase.functions.invoke<GenerateStoryResponse>('generate-story', { // Specify response type <T>
        body: params, // Body already contains options, language, etc. and additionalDetails
        headers: {
          'Authorization': `Bearer ${token}` // Pass the token
        }
      });

      if (error) {
        console.error('Error in generate-story Edge Function:', error);
        // You can try to get more error details if it's an HttpError
        let message = error.message;
        if ((error as any).context) { // Supabase FunctionsHttpError has 'context'
          message = `${message} - ${JSON.stringify((error as any).context)}`;
        }
        throw new Error(message);
      }

      // Validate that the response has the expected format { content: string, title: string }
      if (!data || typeof data.content !== 'string' || typeof data.title !== 'string') {
        console.error('Unexpected response from generate-story:', data);
        throw new Error('The generate-story response does not contain valid content and title.');
      }

      console.log('Response from generate-story received (title):', data.title);
      return data; // Return the complete { content, title } object

    } catch (error) {
      console.error('Error in GenerateStoryService.generateStoryWithAI:', error);
      // Re-throw so the caller (storyGenerator) can handle it
      throw error;
    }
  }
}