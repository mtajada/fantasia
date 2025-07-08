// src/store/stories/storyGenerator.ts
import { toast } from "sonner";
import { Story, StoryOptions, StoryChapter } from "../../types"; 
import { useStoriesStore } from "./storiesStore";
import { useUserStore } from "../user/userStore";
import { charactersService } from "../../services/charactersService";
import { useStoryOptionsStore } from "../storyOptions/storyOptionsStore"; 
import { generateId } from "../core/utils"; 
import { GenerateStoryService, GenerateStoryParams } from "@/services/ai/GenerateStoryService";
import { useChaptersStore } from "./chapters/chaptersStore"; 

/**
 * Genera una historia completa (Capítulo 1 + Título) a partir de las opciones
 */
export const generateStory = async (options: Partial<StoryOptions>): Promise<Story | null> => { 
  const storiesStore = useStoriesStore.getState();
  const chaptersStore = useChaptersStore.getState(); 
  const storyOptionsState = useStoryOptionsStore.getState(); 
  const userStore = useUserStore.getState();

  console.log("🔍 DEBUG - Opciones generación historia:", JSON.stringify(options, null, 2));
  console.log("🔍 DEBUG - Detalles Adicionales:", storyOptionsState.additionalDetails);

  storiesStore.setIsGeneratingStory(true);

  try {
    const storyId = generateId(); 
    const profileSettings = userStore.profileSettings;
    const user = userStore.user;
    const additionalDetails = storyOptionsState.additionalDetails;

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Obtener todos los personajes del usuario para poder filtrar los seleccionados
    const allCharacters = await charactersService.getUserCharacters(user.id);
    const selectedCharacters = storyOptionsState.getSelectedCharactersForStory(allCharacters); 

    // --- DEBUG: Log detallado de parámetros ANTES de construir payload --- 
    console.log("🔍 DEBUG PRE-PAYLOAD: Datos Perfil ->", JSON.stringify(profileSettings, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Personajes Seleccionados ->", JSON.stringify(selectedCharacters, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Opciones Recibidas (función) ->", JSON.stringify(options, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Duración (store) ->", storyOptionsState.currentStoryOptions.duration);
    console.log("🔍 DEBUG PRE-PAYLOAD: Detalles Adicionales ->", additionalDetails);
    // --- FIN DEBUG ---

    if (!profileSettings) throw new Error("Perfil de usuario no cargado.");
    if (!selectedCharacters || selectedCharacters.length === 0) throw new Error("No hay personajes seleccionados.");

    // --- Llamada ÚNICA al servicio que invoca la EF 'generate-story' ---
    const payload: GenerateStoryParams = {
      options: {
        characters: selectedCharacters,
        genre: options.genre, 
        moral: options.moral, 
        duration: storyOptionsState.currentStoryOptions.duration, 
      },
      language: profileSettings.language, 
      additionalDetails: additionalDetails || undefined, 
    };

    console.log("Enviando solicitud a la Edge Function generate-story con params:", payload);

    const storyResponse = await GenerateStoryService.generateStoryWithAI(payload);
    // storyResponse ahora es { content: string, title: string }
    console.log(`[storyGenerator_DEBUG] Title received from Service: "${storyResponse.title}"`);

    // Los personajes seleccionados ya están guardados, no necesitamos save individual
    // Solo guardamos currentCharacter si se usó para creación de personaje nuevo
    
    // Crear el objeto historia con título y contenido de la respuesta
    const story: Story = {
      id: storyId,
      title: storyResponse.title, 
      content: storyResponse.content, 
      options: { 
        moral: options.moral || "Ser amable", 
        characters: selectedCharacters,
        genre: options.genre || "aventura",
        duration: options.duration || "medium",
        language: payload.language,
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
      id: generateId(),
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