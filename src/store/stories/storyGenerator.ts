// src/store/stories/storyGenerator.ts
import { toast } from "sonner";
import { Story, StoryOptions, StoryChapter } from "../../types"; 
import { useStoriesStore } from "./storiesStore";
import { useUserStore } from "../user/userStore";
import { useCharacterStore } from "../character/characterStore";
import { useStoryOptionsStore } from "../storyOptions/storyOptionsStore"; 
import { generateId } from "../core/utils"; 
// --- Importar el servicio CORRECTO ---
import { GenerateStoryService } from "../../services/ai/GenerateStoryService";
import { useChaptersStore } from "./chapters/chaptersStore"; 
// --- ELIMINAR import de StoryContinuationService si ya no se usa para nada más aquí ---
// import { StoryContinuationService } from "../../services/StoryContinuationService";

/**
 * Genera una historia completa (Capítulo 1 + Título) a partir de las opciones
 */
export const generateStory = async (options: Partial<StoryOptions>): Promise<Story | null> => { 
  const storiesStore = useStoriesStore.getState();
  const chaptersStore = useChaptersStore.getState(); 
  const userStore = useUserStore.getState();
  const characterStore = useCharacterStore.getState();
  const storyOptionsState = useStoryOptionsStore.getState(); 

  console.log("🔍 DEBUG - Opciones generación historia:", JSON.stringify(options, null, 2));
  console.log("🔍 DEBUG - Detalles Adicionales:", storyOptionsState.additionalDetails);

  storiesStore.setIsGeneratingStory(true);

  try {
    const storyId = generateId(); 
    const profileSettings = userStore.profileSettings; 
    const characterForStory = options.character || characterStore.currentCharacter;
    const additionalDetails = storyOptionsState.additionalDetails; 

    if (!profileSettings) throw new Error("Perfil de usuario no cargado.");
    if (!characterForStory) throw new Error("Personaje no seleccionado o inválido.");

    // --- Llamada ÚNICA al servicio que invoca la EF 'generate-story' ---
    const storyResponse = await GenerateStoryService.generateStoryWithAI({
      options: { ...options, character: characterForStory }, 
      language: profileSettings.language,
      childAge: profileSettings.childAge,
      specialNeed: profileSettings.specialNeed,
      additionalDetails: additionalDetails || undefined, 
    });
    // storyResponse ahora es { content: string, title: string }
    console.log(`[storyGenerator_DEBUG] Title received from Service: "${storyResponse.title}"`);

    // --- YA NO se llama a generateChapterTitle por separado ---
    // const title = await StoryContinuationService.generateChapterTitle(content); 

    // Guardar el personaje si es uno nuevo o modificado (asumiendo que save es seguro)
    // Considera si esto debe hacerse solo si la generación fue exitosa
    await characterStore.saveCurrentCharacter();

    // Crear el objeto historia con título y contenido de la respuesta
    const story: Story = {
      id: storyId,
      title: storyResponse.title, 
      content: storyResponse.content, 
      options: { 
        moral: options.moral || "Ser amable", 
        character: characterForStory,
        genre: options.genre || "aventura",
        duration: options.duration || "medium",
      },
      additional_details: additionalDetails, 
      createdAt: new Date().toISOString(),
      // audioUrl se añadirá después si se genera
    };

    console.log("🔍 DEBUG - Historia Creada:", JSON.stringify(story.options, null, 2));
    console.log(`[storyGenerator_DEBUG] Title being saved to store: "${story.title}"`);

    // 1. Guardar la historia principal (como antes)
    // Guardar la historia generada en el store
    await storiesStore.addGeneratedStory(story); 

    // 2. Crear y guardar el Capítulo 1
    const firstChapter: StoryChapter = {
      chapterNumber: 1,
      title: story.title, 
      content: story.content, 
      generationMethod: 'free', 
      createdAt: new Date().toISOString(),
      // customInput no aplica aquí
    };
    await chaptersStore.addChapter(story.id, firstChapter); 

    // Limpiar las opciones de la historia temporalmente almacenadas
    storyOptionsState.resetStoryOptions(); 

    return story; 

  } catch (error: any) {
    console.error("Error al generar historia en storyGenerator:", error);
    toast.error("Error al generar la historia", {
      description: error?.message || "Inténtalo de nuevo.",
    });
    // Considera si también deberías llamar a resetStoryOptions aquí
    storyOptionsState.resetStoryOptions(); 
    return null; 
  } finally {
    storiesStore.setIsGeneratingStory(false);
  }
};