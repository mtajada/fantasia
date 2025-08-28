// src/services/StoryContinuationService.ts
import { Story, StoryChapter } from "../../types"; // Importa tus tipos
import { supabase } from "../../supabaseClient";

// Definir el tipo de respuesta esperada para continuaciones
interface ContinuationResponse {
  content: string;
  title: string;
}
// Definir tipo para opciones generadas
interface OptionsResponse {
  options: { summary: string }[];
}


export class StoryContinuationService {

  /**
   * Llama a la Edge Function 'story-continuation' para diferentes acciones.
   * @param action La acción a realizar ('generateOptions', 'freeContinuation', etc.)
   * @param payload Los datos específicos para esa acción.
   * @returns La respuesta de la Edge Function (depende de la acción).
   */
  private static async invokeContinuationFunction<T = any>(action: string, payload: object): Promise<T> {
    console.log(`Enviando solicitud a la Edge Function story-continuation (acción: ${action})...`);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error(sessionError?.message || 'Usuario no autenticado.');
    }
    const token = sessionData.session.access_token;

    const bodyPayload = {
      action: action,
      ...payload // Incluir el resto de los datos (story, chapters, etc.)
    };

<<<<<<< HEAD
    // Registrar información de personajes para depuración (consistente con GenerateStoryService)
    if (bodyPayload.story && bodyPayload.story.options && bodyPayload.story.options.characters) {
      const characters = bodyPayload.story.options.characters;
      const charactersInfo = `Personajes (${characters.length}): ${characters.map(c => `${c.name} (${c.gender})`).join(', ')}`;
      console.log(`[StoryContinuationService] ${charactersInfo}`);
      
      // Registrar nivel de intensidad para depuración
      const spicynessLevel = bodyPayload.story.options.spiciness_level || 2;
      console.log(`[StoryContinuationService] Nivel de intensidad: ${spicynessLevel}`);
=======
    // Log character information for debugging (consistent with GenerateStoryService)
    if (bodyPayload.story && bodyPayload.story.options && bodyPayload.story.options.characters) {
      const characters = bodyPayload.story.options.characters;
      const charactersInfo = `Characters (${characters.length}): ${characters.map(c => `${c.name} (${c.gender})`).join(', ')}`;
      console.log(`[StoryContinuationService] ${charactersInfo}`);
      
      // Log spiciness level for debugging
      const spicynessLevel = bodyPayload.story.options.spiciness_level || 2;
      console.log(`[StoryContinuationService] Spiciness level: ${spicynessLevel}`);
>>>>>>> origin/main
    }

    try {
      const jsonBodyString = JSON.stringify(bodyPayload, null, 2); // Pretty print
      console.log(`[StoryContinuationService_DEBUG] Body payload AFTER stringify (length: ${jsonBodyString?.length}):\n---\n${jsonBodyString}\n---`);
    } catch (stringifyError) {
        console.error('[StoryContinuationService_DEBUG] Error durante JSON.stringify:', stringifyError, 'Payload era:', bodyPayload);
        throw new Error('Error al serializar payload antes de enviar a la edge function.'); // Re-lanzar o manejar
    }

    const { data, error } = await supabase.functions.invoke<T>('story-continuation', { // Usar tipo genérico o específico
      body: bodyPayload, // PASAR EL OBJETO DIRECTAMENTE
      headers: {
        'Authorization': `Bearer ${token}`
        // 'Content-Type': 'application/json' // DEJAR QUE INVOKE LO MANEJE
      }
    });

    if (error) {
      console.error(`Error en Edge Function story-continuation (acción: ${action}):`, error);
      let message = error.message;
      if ((error as any).context) {
        message = `${message} - ${JSON.stringify((error as any).context)}`;
      }
      throw new Error(message);
    }

    console.log(`Respuesta recibida de story-continuation (acción: ${action})`);
    return data as T; // Devolver datos (casteo puede ser necesario)
  }

  /**
   * Genera opciones de continuación.
   */
  public static async generateContinuationOptions(
    story: Story, 
    chapters: StoryChapter[]
  ): Promise<OptionsResponse> {
    const response = await this.invokeContinuationFunction<OptionsResponse>('generateOptions', { 
      story, 
      chapters, 
      language: story.options.language
    });
    if (!response || !Array.isArray(response.options)) {
      console.error("Respuesta inválida para generación de opciones:", response);
      throw new Error("No se pudieron generar las opciones de continuación.");
    }
    return response;
  }

  /**
   * Genera una continuación libre (contenido y título).
   */
  public static async generateFreeContinuation(story: Story, chapters: StoryChapter[]): Promise<ContinuationResponse> {
    const response = await this.invokeContinuationFunction<ContinuationResponse>('freeContinuation', { 
      story, 
      chapters, 
      language: story.options.language 
    });
    if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
      console.error("Respuesta inválida para continuación libre:", response);
      throw new Error("No se pudo generar la continuación libre.");
    }
    return response;
  }

  /**
   * Genera una continuación basada en una opción seleccionada (contenido y título).
   */
  public static async generateOptionContinuation(story: Story, chapters: StoryChapter[], selectedOptionSummary: string): Promise<ContinuationResponse> {
    const response = await this.invokeContinuationFunction<ContinuationResponse>('optionContinuation', { 
      story, 
      chapters, 
      selectedOptionSummary, 
      language: story.options.language 
    });
    if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
      console.error("Respuesta inválida para continuación de opción:", response);
      throw new Error("No se pudo generar la continuación de opción.");
    }
    return response;
  }

  /**
   * Genera una continuación basada en la dirección del usuario (contenido y título).
   */
  public static async generateDirectedContinuation(story: Story, chapters: StoryChapter[], userDirection: string): Promise<ContinuationResponse> {
    const response = await this.invokeContinuationFunction<ContinuationResponse>('directedContinuation', { 
      story, 
      chapters, 
      userDirection, 
      language: story.options.language 
    });
    if (!response || typeof response.content !== 'string' || typeof response.title !== 'string') {
      console.error("Respuesta inválida para continuación dirigida:", response);
      throw new Error("No se pudo generar la continuación dirigida.");
    }
    return response;
  }

  // generateChapterTitle ya no es necesaria para el flujo principal
  // public static async generateChapterTitle(content: string): Promise<{ title: string }> {
  //    // ... (código anterior si quieres mantenerla por alguna razón, pero no se llamará desde generateStory)
  // }
}