
// src/store/stories/storyGenerator.ts
import { toast } from "sonner";
import { Story, StoryOptions } from "../../types";
import { useStoriesStore } from "./storiesStore";
import { useUserStore } from "../user/userStore";
import { useCharacterStore } from "../character/characterStore";
import { generateId } from "../core/utils"; // Asumiendo que está en core
// --- Importar el servicio CORRECTO ---
import { GenerateStoryService } from "../../services/ai/GenerateStoryService";
// --- ELIMINAR import de StoryContinuationService si ya no se usa para nada más aquí ---
// import { StoryContinuationService } from "../../services/StoryContinuationService";

/**
 * Genera una historia completa (Capítulo 1 + Título) a partir de las opciones
 */
export const generateStory = async (options: Partial<StoryOptions>): Promise<Story | null> => { // Devuelve Story o null
  const storiesStore = useStoriesStore.getState();
  const userStore = useUserStore.getState();
  const characterStore = useCharacterStore.getState();

  console.log("🔍 DEBUG - Opciones generación historia:", JSON.stringify(options, null, 2));

  storiesStore.setIsGeneratingStory(true);

  try {
    const storyId = generateId(); // Generar ID para la historia
    const profileSettings = userStore.profileSettings; // Obtener perfil completo
    const characterForStory = options.character || characterStore.currentCharacter;

    if (!profileSettings) throw new Error("Perfil de usuario no cargado.");
    if (!characterForStory) throw new Error("Personaje no seleccionado o inválido.");

    // --- Llamada ÚNICA al servicio que invoca la EF 'generate-story' ---
    const storyResponse = await GenerateStoryService.generateStoryWithAI({
      options: { ...options, character: characterForStory }, // Asegurar character está
      language: profileSettings.language,
      childAge: profileSettings.childAge,
      specialNeed: profileSettings.specialNeed,
    });
    // storyResponse ahora es { content: string, title: string }
    console.log(`[storyGenerator_DEBUG] Title received from Service: "${storyResponse.title}"`);

    // --- YA NO se llama a generateChapterTitle por separado ---
    // const title = await StoryContinuationService.generateChapterTitle(content); // <-- ELIMINADO

    // Guardar el personaje si es uno nuevo o modificado (asumiendo que save es seguro)
    // Considera si esto debe hacerse solo si la generación fue exitosa
    await characterStore.saveCurrentCharacter();

    // Crear el objeto historia con título y contenido de la respuesta
    const story: Story = {
      id: storyId,
      title: storyResponse.title, // <--- Usar título de la respuesta
      content: storyResponse.content, // <--- Usar contenido de la respuesta
      options: { // Reconstruir options limpias
        moral: options.moral || "Ser amable", // Usar defaults si es necesario
        character: characterForStory,
        genre: options.genre || "aventura",
        duration: options.duration || "medium",
      },
      createdAt: new Date().toISOString(),
      // audioUrl se añadirá después si se genera
    };

    console.log("🔍 DEBUG - Historia Creada:", JSON.stringify(story.options, null, 2));
    console.log(`[storyGenerator_DEBUG] Title being saved to store: "${story.title}"`);

    // Guardar la historia generada en el store
    storiesStore.addGeneratedStory(story); // addGeneratedStory debe aceptar el tipo Story actualizado
    return story; // Devolver la historia creada

  } catch (error: any) {
    console.error("Error al generar historia en storyGenerator:", error);
    toast.error("Error al generar la historia", {
      description: error?.message || "Inténtalo de nuevo.",
    });
    return null; // Devolver null en caso de error
  } finally {
    storiesStore.setIsGeneratingStory(false);
  }
};