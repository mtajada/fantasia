import { StoriesState } from "../types/storeTypes";
import { createPersistentStore } from "../core/createStore";
import { getUserStories, syncQueue, syncStory } from "../../services/supabase";
import { useUserStore } from "../user/userStore";

// Estado inicial
const initialState: Pick<
  StoriesState,
  "generatedStories" | "isGeneratingStory" | "isLoadingStories"
> = {
  generatedStories: [],
  isGeneratingStory: false,
  isLoadingStories: false,
};

export const useStoriesStore = createPersistentStore<StoriesState>(
  initialState,
  (set, get) => ({
    setIsGeneratingStory: (isGenerating) =>
      set({
        isGeneratingStory: isGenerating,
      }),

    addGeneratedStory: async (story) => {
      console.log("🚀 ~ addGeneratedStory: ~ story:", story)
      // Guardar localmente primero
      set((state) => ({
        generatedStories: [story, ...state.generatedStories],
      }));

      // Luego sincronizar con Supabase
      try {
        const user = useUserStore.getState().user;

        if (user) {
          const { success } = await syncStory(user.id, story);

          if (!success) {
            // Si falla, agregar a la cola de sincronización
            syncQueue.addToQueue("stories", "insert", {
              id: story.id,
              user_id: user.id,
              title: story.title,
              content: story.content,
              audio_url: story.audioUrl,
              genre: story.options.genre,
              story_format: story.options.format,
              character_id: story.options.characters[0]?.id, // Primary character
              additional_details: story.additional_details,
            });
          }
        }
      } catch (error) {
        console.error("Error sincronizando historia con Supabase:", error);
      }
    },

    getStoryById: (id) => {
      return get().generatedStories.find((story) => story.id === id);
    },

    loadStoriesFromSupabase: async (userId?: string) => {
      const user = useUserStore.getState().user;
      if (!user) return;

      set({ isLoadingStories: true });
      try {
        console.log(`Cargando historias para usuario ${user.id}`);

        // Get current stories before clearing
        const currentStories = get().generatedStories;
        
        // Don't clear recently generated stories that might not be synced yet
        const recentThreshold = Date.now() - (5 * 60 * 1000); // 5 minutes ago
        const recentStories = currentStories.filter(story => {
          const storyTime = new Date(story.createdAt).getTime();
          return storyTime > recentThreshold;
        });

        // Clear stories but preserve recent ones
        set({ generatedStories: recentStories });

        const { success, stories } = await getUserStories(user.id);

        if (success && stories) {
          console.log(`Cargadas ${stories.length} historias de Supabase`);
          
          // Merge with recent stories, avoiding duplicates
          const existingIds = new Set(recentStories.map(s => s.id));
          const newStories = stories.filter(s => !existingIds.has(s.id));
          
          set({ generatedStories: [...recentStories, ...newStories] });
        } else {
          console.warn("No se encontraron historias o hubo un error");
          // Keep recent stories even if Supabase loading fails
          set({ generatedStories: recentStories });
        }
      } catch (error) {
        console.error("Error al cargar historias:", error);
        // Keep recent stories even if there's an error
        const currentStories = get().generatedStories;
        const recentThreshold = Date.now() - (5 * 60 * 1000);
        const recentStories = currentStories.filter(story => {
          const storyTime = new Date(story.createdAt).getTime();
          return storyTime > recentThreshold;
        });
        set({ generatedStories: recentStories });
      } finally {
        set({ isLoadingStories: false });
      }
    },
  }),
  "stories",
);
