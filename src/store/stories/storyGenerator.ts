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

    // --- DEBUG: Detailed parameter logging BEFORE building payload --- 
    console.log("🔍 DEBUG PRE-PAYLOAD: Profile Data ->", JSON.stringify(profileSettings, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Selected Characters ->", JSON.stringify(selectedCharacters, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Options Received (function) ->", JSON.stringify(options, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Format (store) ->", storyOptionsState.currentStoryOptions.format);
    console.log("🔍 DEBUG PRE-PAYLOAD: Additional Details ->", additionalDetails);
    // --- END DEBUG ---

    if (!profileSettings) throw new Error("User profile not loaded.");
    if (!selectedCharacters || selectedCharacters.length === 0) throw new Error("No characters selected.");

    // --- SINGLE call to service that invokes 'generate-story' EF ---
    const payload: GenerateStoryParams = {
      options: {
        characters: selectedCharacters,
        genre: options.genre,
        format: storyOptionsState.currentStoryOptions.format,
      },
      language: profileSettings.language,
      additionalDetails: additionalDetails || undefined,
    };

    console.log("Sending request to generate-story Edge Function with params:", payload);

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
        characters: selectedCharacters,
        genre: options.genre || "adventure",
        format: storyOptionsState.currentStoryOptions.format || "episodic",
        language: payload.language,
      },
      additional_details: additionalDetails,
      createdAt: new Date().toISOString(),
      // audioUrl se añadirá después si se genera
    };

    console.log("🔍 DEBUG - Story Created:", JSON.stringify(story.options, null, 2));
    console.log(`[storyGenerator_DEBUG] Title being saved to store: "${story.title}"`);

    // 1. Save the main story (as before)
    // Save the generated story in the store
    await storiesStore.addGeneratedStory(story);

    // 2. Create and save Chapter 1
    const firstChapter: StoryChapter = {
      id: generateId(),
      chapterNumber: 1,
      title: story.title,
      content: story.content,
      generationMethod: 'free',
      createdAt: new Date().toISOString(),
      // customInput doesn't apply here
    };
    await chaptersStore.addChapter(story.id, firstChapter);

    // Clear temporarily stored story options
    storyOptionsState.resetStoryOptions();

    return story;

  } catch (error: any) {
    console.error("Error generating story in storyGenerator:", error);
    toast.error("Error generating story", {
      description: error?.message || "Please try again.",
    });
    // Consider if you should also call resetStoryOptions here
    storyOptionsState.resetStoryOptions();
    return null;
  } finally {
    storiesStore.setIsGeneratingStory(false);
  }
};