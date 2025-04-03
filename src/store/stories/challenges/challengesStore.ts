import { ChallengesState } from "../../types/storeTypes";
import { Challenge } from "../../../types";
import { createPersistentStore } from "../../core/createStore";
import {
  getStoryChallenges,
  syncChallenge,
  syncQueue,
} from "../../../services/supabase";

// Estado inicial
const initialState: Pick<ChallengesState, "challenges"> = {
  challenges: [],
};

export const useChallengesStore = createPersistentStore<ChallengesState>(
  initialState,
  (set, get) => ({
    addChallenge: async (challenge) => {
      // Guardar localmente primero
      set((state) => ({
        challenges: [challenge, ...state.challenges],
      }));

      // Sincronizar con Supabase
      try {
        const { success } = await syncChallenge(challenge);

        if (!success) {
          // Si falla, agregar a la cola de sincronización
          syncQueue.addToQueue("challenges", "insert", {
            id: challenge.id,
            story_id: challenge.storyId,
            created_at: challenge.createdAt,
          });

          // También tenemos que guardar las preguntas
          challenge.questions.forEach((question) => {
            syncQueue.addToQueue("challenge_questions", "insert", {
              id: question.id,
              challenge_id: challenge.id,
              question: question.question,
              options: question.options,
              correct_option_index: question.correctOptionIndex,
              explanation: question.explanation,
              category: question.category,
              target_language: question.targetLanguage,
            });
          });
        }
      } catch (error) {
        console.error("Error sincronizando desafío con Supabase:", error);
      }
    },

    getChallengesByStoryId: (storyId) => {
      return get().challenges.filter((challenge) =>
        challenge.storyId === storyId
      );
    },

    loadChallengesFromSupabase: async (storyId) => {
      try {
        const { success, challenges } = await getStoryChallenges(storyId);

        if (success && challenges) {
          // Actualizar el store local con los desafíos de la historia
          set((state) => {
            // Filtrar los desafíos actuales eliminando los de esta historia
            const filteredChallenges = state.challenges.filter(
              (challenge) => challenge.storyId !== storyId,
            );

            // Agregar los desafíos actualizados de la historia
            return {
              challenges: [...filteredChallenges, ...challenges],
            };
          });
        }
      } catch (error) {
        console.error("Error cargando desafíos desde Supabase:", error);
      }
    },
  }),
  "challenges",
);
