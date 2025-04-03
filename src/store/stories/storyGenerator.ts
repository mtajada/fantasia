import { toast } from "sonner";
import { Story, StoryOptions } from "../../types";
import { useStoriesStore } from "./storiesStore";
import { useUserStore } from "../user/userStore";
import { useCharacterStore } from "../character/characterStore";
import { generateId } from "../core/utils";
import { GenerateStoryService } from "../../services/GenerateStoryService";
import { StoryContinuationService } from "../../services/StoryContinuationService";

/**
 * Genera una historia completa a partir de las opciones proporcionadas
 */
export const generateStory = async (options: Partial<StoryOptions>) => {
  const storiesStore = useStoriesStore.getState();
  const userStore = useUserStore.getState();
  const characterStore = useCharacterStore.getState();

  // Add debugging to see all options
  console.log(
    "🔍 DEBUG - Story generation options received:",
    JSON.stringify(options, null, 2),
  );
  console.log(
    "🔍 DEBUG - Current character in store:",
    JSON.stringify(characterStore.currentCharacter, null, 2),
  );

  storiesStore.setIsGeneratingStory(true);

  try {
    // Generamos un UUID para la historia
    const storyId = generateId();

    // Obtener configuración del perfil
    const profileSettings = userStore.profileSettings || {
      language: "español",
      childAge: 7,
    };

    // Ensure we have character data - using the store's current character if not in options
    const characterForStory = options.character ||
      characterStore.currentCharacter;
    console.log(
      "🔍 DEBUG - Character being used for story:",
      JSON.stringify(characterForStory, null, 2),
    );

    // Create a copy of options with guaranteed character data
    const enhancedOptions: Partial<StoryOptions> = {
      ...options,
      character: characterForStory,
    };

    // Generar contenido usando IA
    const content = await GenerateStoryService.generateStoryWithAI({
      options: enhancedOptions, // Use enhanced options with character data
      language: profileSettings.language,
      childAge: profileSettings.childAge,
      specialNeed: profileSettings.specialNeed || "Ninguna",
    });

    // Generar título usando IA basado en el contenido (igual que los capítulos)
    const title = await StoryContinuationService.generateChapterTitle(content);

    // Guardar el personaje actualmente usado
    characterStore.saveCurrentCharacter();

    // Crear el objeto historia
    const story: Story = {
      id: storyId,
      title,
      content,
      options: {
        moral: options.moral || "Ser amable con los demás",
        character: characterForStory, // Use our guaranteed character data
        genre: options.genre || "adventure",
        duration: options.duration || "medium",
      },
      createdAt: new Date().toISOString(),
    };

    console.log(
      "🔍 DEBUG - Created story with options:",
      JSON.stringify(story.options, null, 2),
    );

    // Guardar la historia generada
    storiesStore.addGeneratedStory(story);
    return story;
  } catch (error) {
    console.error("Error al generar historia:", error);
    toast.error("Ocurrió un error al generar la historia", {
      description: "Por favor intenta nuevamente",
    });
    throw error;
  } finally {
    storiesStore.setIsGeneratingStory(false);
  }
};
