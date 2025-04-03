import { ChaptersState } from "../../types/storeTypes";
import { StoryChapter, StoryWithChapters } from "../../../types";
import { createPersistentStore } from "../../core/createStore";
import { useStoriesStore } from "../storiesStore";
import {
  getStoryChapters,
  syncChapter,
  syncQueue,
} from "../../../services/supabase";

// Estado inicial
const initialState: Pick<ChaptersState, "storyChapters"> = {
  storyChapters: [],
};

export const useChaptersStore = createPersistentStore<ChaptersState>(
  initialState,
  (set, get) => ({
    getChaptersByStoryId: (storyId) => {
      const storyWithChapters = get().storyChapters.find((s) =>
        s.id === storyId
      );
      return storyWithChapters ? storyWithChapters.chapters : [];
    },

    addChapter: async (storyId, chapter) => {
      // Actualizar store local primero
      set((state) => {
        const storyWithChapters = state.storyChapters.find((s) =>
          s.id === storyId
        );

        if (storyWithChapters) {
          // Actualizar los capítulos existentes
          return {
            storyChapters: state.storyChapters.map((s) =>
              s.id === storyId
                ? { ...s, chapters: [...s.chapters, chapter] }
                : s
            ),
          };
        } else {
          // Crear nueva entrada para la historia
          const storiesStore = useStoriesStore.getState();
          const story = storiesStore.getStoryById(storyId);

          if (!story) return state; // Historia no encontrada

          const newStoryWithChapters: StoryWithChapters = {
            id: storyId,
            title: story.title,
            content: story.content,
            options: story.options,
            createdAt: story.createdAt,
            audioUrl: story.audioUrl,
            imageUrl: story.imageUrl,
            chapters: [chapter],
          };

          return {
            storyChapters: [...state.storyChapters, newStoryWithChapters],
          };
        }
      });

      // Luego sincronizar con Supabase
      try {
        const { success } = await syncChapter(chapter, storyId);

        if (!success) {
          // Si falla, agregar a la cola de sincronización
          syncQueue.addToQueue("story_chapters", "insert", {
            story_id: storyId,
            chapter_number: chapter.chapterNumber,
            title: chapter.title,
            content: chapter.content,
            generation_method: chapter.generationMethod,
            custom_input: chapter.customInput,
          });
        }
      } catch (error) {
        console.error("Error sincronizando capítulo con Supabase:", error);
        // Agregar a la cola de sincronización
        syncQueue.addToQueue("story_chapters", "insert", {
          story_id: storyId,
          chapter_number: chapter.chapterNumber,
          title: chapter.title,
          content: chapter.content,
          generation_method: chapter.generationMethod,
          custom_input: chapter.customInput,
        });
      }
    },

    getLastChapterByStoryId: (storyId) => {
      const chapters = get().getChaptersByStoryId(storyId);
      if (chapters.length === 0) return undefined;

      // Ordenar capítulos y devolver el último
      return [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];
    },

    loadChaptersFromSupabase: async (storyId) => {
      try {
        const { success, chapters } = await getStoryChapters(storyId);

        if (success && chapters && chapters.length > 0) {
          const storiesStore = useStoriesStore.getState();
          const story = storiesStore.getStoryById(storyId);

          if (!story) return; // Historia no encontrada

          set((state) => {
            const existingStoryIndex = state.storyChapters.findIndex((s) =>
              s.id === storyId
            );

            if (existingStoryIndex >= 0) {
              // Actualizar capítulos de la historia existente
              const updatedStoryChapters = [...state.storyChapters];
              updatedStoryChapters[existingStoryIndex] = {
                ...updatedStoryChapters[existingStoryIndex],
                chapters,
              };

              return { storyChapters: updatedStoryChapters };
            } else {
              // Crear nueva entrada para la historia
              const newStoryWithChapters: StoryWithChapters = {
                id: storyId,
                title: story.title,
                content: story.content,
                options: story.options,
                createdAt: story.createdAt,
                audioUrl: story.audioUrl,
                imageUrl: story.imageUrl,
                chapters,
              };

              return {
                storyChapters: [...state.storyChapters, newStoryWithChapters],
              };
            }
          });
        }
      } catch (error) {
        console.error("Error cargando capítulos desde Supabase:", error);
      }
    },
  }),
  "chapters",
);
