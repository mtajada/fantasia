// src/store/stories/storyGenerator.ts
import { toast } from "sonner";
import { Story, StoryOptions, StoryChapter } from "../../types";
import { useUserStore } from "../user/userStore";
import { charactersService } from "../../services/charactersService";
import { useStoryOptionsStore } from "../storyOptions/storyOptionsStore";
import { generateId } from "../core/utils";
import { GenerateStoryService, GenerateStoryParams } from "@/services/ai/GenerateStoryService";
import { createStoryDirectly, createChapterDirectly } from "../../services/supabase";
import { StoryCharacter } from "../../types";

/**
 * Genera una historia completa (Capítulo 1 + Título) a partir de las opciones
 */
export const generateStory = async (options: Partial<StoryOptions>): Promise<Story | null> => {
  const storyOptionsState = useStoryOptionsStore.getState();
  const userStore = useUserStore.getState();

  console.log("🔍 DEBUG - Opciones generación historia:", JSON.stringify(options, null, 2));
  console.log("🔍 DEBUG - Detalles Adicionales:", storyOptionsState.additionalDetails);
  console.log("🔍 DEBUG - Spiciness level from options:", options.spiciness_level);

  // Note: No longer using storiesStore.setIsGeneratingStory - state management will be handled differently

  // Declare variables outside try block to make them accessible in catch block
  let selectedCharacters: StoryCharacter[] = [];
  let selectedCharactersData: string | null = null;
  let profileSettings: typeof userStore.profileSettings;
  let user: typeof userStore.user;
  let additionalDetails: typeof storyOptionsState.additionalDetails;

  try {
    const storyId = generateId();
    profileSettings = userStore.profileSettings;
    user = userStore.user;
    additionalDetails = storyOptionsState.additionalDetails;

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Obtener personajes seleccionados desde sessionStorage en lugar del store
    selectedCharactersData = sessionStorage.getItem('selectedCharacters');
    
    if (selectedCharactersData) {
      try {
        selectedCharacters = JSON.parse(selectedCharactersData);
        console.log("🔍 DEBUG - Characters loaded from sessionStorage:", selectedCharacters.length);
      } catch (error) {
        console.error("Error parsing selectedCharacters from sessionStorage:", error);
      }
    } else {
      console.warn("No selectedCharacters found in sessionStorage");
    }
    
    // Fallback: Try to get characters from storyOptions as backup
    if (!selectedCharacters || selectedCharacters.length === 0) {
      console.log("🔍 DEBUG - Attempting fallback to storyOptions.characters");
      if (options.characters && options.characters.length > 0) {
        selectedCharacters = options.characters;
        console.log("🔍 DEBUG - Using characters from options:", selectedCharacters.length);
      } else if (storyOptionsState.currentStoryOptions.characters && storyOptionsState.currentStoryOptions.characters.length > 0) {
        selectedCharacters = storyOptionsState.currentStoryOptions.characters;
        console.log("🔍 DEBUG - Using characters from storyOptionsState:", selectedCharacters.length);
      }
    }

    // --- DEBUG: Detailed parameter logging BEFORE building payload --- 
    console.log("🔍 DEBUG PRE-PAYLOAD: Profile Data ->", JSON.stringify(profileSettings, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Selected Characters ->", JSON.stringify(selectedCharacters, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Options Received (function) ->", JSON.stringify(options, null, 2));
    console.log("🔍 DEBUG PRE-PAYLOAD: Format (store) ->", storyOptionsState.currentStoryOptions.format);
    console.log("🔍 DEBUG PRE-PAYLOAD: Additional Details ->", additionalDetails);
    // --- END DEBUG ---

    if (!profileSettings) throw new Error("User profile not loaded.");
    if (!selectedCharacters || selectedCharacters.length === 0) {
      console.error("🔍 DEBUG - No characters available from any source:");
      console.error("  - sessionStorage:", selectedCharactersData);
      console.error("  - options.characters:", options.characters);
      console.error("  - storyOptionsState.currentStoryOptions.characters:", storyOptionsState.currentStoryOptions.characters);
      throw new Error("No characters selected. Please select at least one character before generating a story.");
    }

    // --- SINGLE call to service that invokes 'generate-story' EF ---
    const payload: GenerateStoryParams = {
      options: {
        characters: selectedCharacters,
        genre: options.genre,
        format: storyOptionsState.currentStoryOptions.format,
        spiciness_level: options.spiciness_level, // Add spiciness_level to payload
      },
      language: profileSettings.language,
      additionalDetails: additionalDetails || undefined,
    };

    console.log("Sending request to generate-story Edge Function with params:", payload);
    console.log("🔍 DEBUG - Spiciness level in final payload:", payload.options.spiciness_level);

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
        spiciness_level: options.spiciness_level || 2, // Include spiciness_level in story options
      },
      additional_details: additionalDetails,
      createdAt: new Date().toISOString(),
      characters_data: selectedCharacters, // Store complete character array for database
      // audioUrl se añadirá después si se genera
    };

    console.log("🔍 DEBUG - Story Created:", JSON.stringify(story.options, null, 2));
    console.log(`[storyGenerator_DEBUG] Title being saved to store: "${story.title}"`);

    // 1. Save the main story FIRST using direct database insertion
    try {
      const storyResult = await createStoryDirectly(user.id, story);
      if (!storyResult.success) {
        throw new Error(`Story creation failed: ${storyResult.error?.message || 'Unknown error'}`);
      }
      console.log("🔍 DEBUG - Story saved successfully, now creating chapter");
    } catch (storyError) {
      console.error("🔍 DEBUG - Story save failed:", storyError);
      // If story save fails, we can't proceed with chapter creation
      throw storyError;
    }

    // 2. Create and save Chapter 1 AFTER story is confirmed saved
    const firstChapter: StoryChapter = {
      id: generateId(),
      chapterNumber: 1,
      title: story.title,
      content: story.content,
      generationMethod: 'free',
      createdAt: new Date().toISOString(),
      // customInput doesn't apply here
    };
    
    // Ensure chapter is saved after story - now it should work
    try {
      const chapterResult = await createChapterDirectly(story.id, firstChapter);
      if (!chapterResult.success) {
        throw new Error(`Chapter creation failed: ${chapterResult.error?.message || 'Unknown error'}`);
      }
      console.log("🔍 DEBUG - Chapter saved successfully");
    } catch (chapterError) {
      console.error("🔍 DEBUG - Chapter save failed:", chapterError);
      // Chapter save failure is not critical - story was saved successfully
      console.warn("🔍 DEBUG - Chapter creation failed but story was saved");
      // We don't throw here because the story generation was successful
    }

    // Clear temporarily stored story options and sessionStorage
    storyOptionsState.resetStoryOptions();
    sessionStorage.removeItem('selectedCharacters');
    console.log("🔍 DEBUG - Cleared sessionStorage after successful story generation");

    return story;

  } catch (error: unknown) {
    console.error("Error generating story in storyGenerator:", error);
    console.error("🔍 DEBUG - Error context:", {
      selectedCharactersCount: selectedCharacters?.length || 0,
      hasProfileSettings: !!profileSettings,
      hasUser: !!user,
      storyOptionsFormat: storyOptionsState.currentStoryOptions.format,
      additionalDetails: additionalDetails || null,
    });
    
    toast.error("Error generating story", {
      description: error instanceof Error ? error.message : "Please try again.",
    });
    
    // Reset story options on error
    storyOptionsState.resetStoryOptions();
    
    // Clear sessionStorage on error to prevent future issues
    try {
      sessionStorage.removeItem('selectedCharacters');
      console.log("🔍 DEBUG - Cleared sessionStorage after error");
    } catch (storageError) {
      console.warn("Could not clear sessionStorage:", storageError);
    }
    
    return null;
  }
};