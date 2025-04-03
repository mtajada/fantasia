import { AudioState } from "../../types/storeTypes";
import { createPersistentStore } from "../../core/createStore";
import {
  getCurrentVoice,
  getUserAudios,
  setCurrentVoice,
  syncAudioFile,
  syncQueue,
} from "../../../services/supabase";
import { useUserStore } from "../../user/userStore";

// Estado inicial para el almacenamiento de audio
const initialState: Pick<
  AudioState,
  "audioCache" | "generationStatus" | "currentVoice"
> = {
  audioCache: {},
  generationStatus: {},
  currentVoice: null,
};

export const useAudioStore = createPersistentStore<AudioState>(
  initialState,
  (set, get) => ({
    // Guardar un nuevo audio generado en la caché
    addAudioToCache: async (storyId, chapterId, voiceId, audioUrl) => {
      // Guardar en el almacenamiento local
      set((state) => ({
        audioCache: {
          ...state.audioCache,
          [`${storyId}-${chapterId}-${voiceId}`]: {
            url: audioUrl,
            timestamp: new Date().toISOString(),
          },
        },
      }));

      // Sincronizar con Supabase
      try {
        const user = useUserStore.getState().user;

        if (user) {
          const { success } = await syncAudioFile(
            user.id,
            storyId,
            chapterId,
            voiceId,
            audioUrl,
          );

          if (!success) {
            // Si falla, agregar a la cola de sincronización
            syncQueue.addToQueue("audio_files", "insert", {
              user_id: user.id,
              story_id: storyId,
              chapter_id: chapterId,
              voice_id: voiceId,
              url: audioUrl,
            });
          }
        }
      } catch (error) {
        console.error("Error sincronizando audio con Supabase:", error);
      }
    },

    // Obtener audio de la caché si existe
    getAudioFromCache: (storyId, chapterId, voiceId) => {
      const key = `${storyId}-${chapterId}-${voiceId}`;
      return get().audioCache[key]?.url || null;
    },

    // Actualizar el estado de generación de audio
    setGenerationStatus: (storyId, chapterId, status, progress = 0) =>
      set((state) => ({
        generationStatus: {
          ...state.generationStatus,
          [`${storyId}-${chapterId}`]: { status, progress },
        },
      })),

    // Obtener el estado de generación
    getGenerationStatus: (storyId, chapterId) => {
      const key = `${storyId}-${chapterId}`;
      return get().generationStatus[key] || { status: "idle", progress: 0 };
    },

    // Guardar la voz seleccionada por el usuario
    setCurrentVoice: async (voiceId) => {
      // Actualizar localmente
      set({
        currentVoice: voiceId,
      });

      // Sincronizar con Supabase
      try {
        const user = useUserStore.getState().user;

        if (user) {
          await setCurrentVoice(user.id, voiceId);
        }
      } catch (error) {
        console.error("Error guardando voz actual en Supabase:", error);
      }
    },

    // Obtener la voz seleccionada actualmente
    getCurrentVoice: () => get().currentVoice,

    // Limpiar audios antiguos (si es necesario para ahorrar espacio)
    clearOldAudioCache: (olderThanDays = 7) =>
      set((state) => {
        const now = new Date();
        const filteredCache = { ...state.audioCache };

        Object.keys(filteredCache).forEach((key) => {
          const cachedDate = new Date(filteredCache[key].timestamp);
          const diffDays = (now.getTime() - cachedDate.getTime()) /
            (1000 * 3600 * 24);

          if (diffDays > olderThanDays) {
            delete filteredCache[key];
          }
        });

        return { audioCache: filteredCache };
      }),

    // Cargar datos de Supabase
    loadAudioFromSupabase: async () => {
      const user = useUserStore.getState().user;

      if (!user) return;

      try {
        // Cargar la voz actual
        const { success: voiceSuccess, voiceId } = await getCurrentVoice(
          user.id,
        );

        if (voiceSuccess && voiceId) {
          set({ currentVoice: voiceId });
        }

        // Cargar audios generados
        const { success: audiosSuccess, audios } = await getUserAudios(user.id);

        if (audiosSuccess && audios) {
          const audioCache = { ...get().audioCache };

          audios.forEach((audio) => {
            const key = `${audio.storyId}-${audio.chapterId}-${audio.voiceId}`;
            audioCache[key] = {
              url: audio.url,
              timestamp: new Date().toISOString(), // Usamos la fecha actual al sincronizar
            };
          });

          set({ audioCache });
        }
      } catch (error) {
        console.error("Error cargando audio desde Supabase:", error);
      }
    },
  }),
  "audio",
);
