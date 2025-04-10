import { UserState } from "../types/storeTypes";
import { ProfileSettings, User } from "../../types";
import { createPersistentStore, setCurrentAuthUser } from "../core/createStore";
import { getCurrentUser, logout } from "../../supabaseAuth";
import {
  getUserProfile,
  syncQueue,
  syncUserProfile,
} from "../../services/supabase";
import { supabase } from "../../supabaseClient";
import { useChaptersStore } from '../stories/chapters/chaptersStore';

// Estado inicial
const initialState: Pick<UserState, "user" | "profileSettings"> = {
  user: null,
  profileSettings: null,
};

// Lógica del store
export const useUserStore = createPersistentStore<UserState>(
  initialState,
  (set, get) => ({
    loginUser: async (user: User) => {
      // Actualizar usuario en el store global
      setCurrentAuthUser(user.id);

      // Establecer el usuario en el store
      set({ user });

      // Al iniciar sesión, cargar datos desde Supabase
      try {
        // 1. Cargar perfil
        console.log(`Cargando perfil para usuario ${user.id} desde Supabase`);
        const { success, profile } = await getUserProfile(user.id);
        if (success && profile) {
          console.log("Perfil cargado con éxito:", profile);
          set({ profileSettings: profile });
        } else {
          console.log("No se encontró perfil para el usuario");
        }

        // 2. Iniciar sincronización de otros datos
        syncAllUserData(user.id);
      } catch (error) {
        console.error("Error cargando datos de usuario desde Supabase:", error);
      }
    },

    logoutUser: async () => {
      // Guardar una referencia al usuario actual antes de cerrar sesión
      const currentUser = get().user;

      // Intentar sincronizar datos pendientes antes de cerrar sesión
      if (currentUser) {
        await syncQueue.processQueue();
      }

      // Cerrar sesión en Supabase
      await logout();

      // Limpiar el estado del store
      set({ user: null, profileSettings: null });

      // Actualizar usuario en el store global (ningún usuario autenticado)
      setCurrentAuthUser(null);
    },

    setProfileSettings: async (settings: ProfileSettings) => {
      set({ profileSettings: settings });

      // Sincronizar con Supabase
      const user = get().user;
      if (user) {
        try {
          // Solo enviar los campos editables por el usuario
          const userEditableSettings = {
            language: settings.language,
            childAge: settings.childAge,
            specialNeed: settings.specialNeed,
          };
          
          const { success } = await syncUserProfile(user.id, userEditableSettings as ProfileSettings);
          if (!success) {
            // Si falla, agregarlo a la cola de sincronización
            syncQueue.addToQueue("profiles", "update", {
              id: user.id,
              language: settings.language,
              child_age: settings.childAge,
              special_need: settings.specialNeed,
            });
          }
        } catch (error) {
          console.error("Error sincronizando perfil con Supabase:", error);
          // Agregar a la cola de sincronización
          syncQueue.addToQueue("profiles", "update", {
            id: user.id,
            language: settings.language,
            child_age: settings.childAge,
            special_need: settings.specialNeed,
          });
        }
      }
    },

    hasCompletedProfile: () => get().profileSettings !== null,

    // --- Selectores Actualizados/Nuevos ---
    isPremium: () => {
      const status = get().profileSettings?.subscription_status;
      return status === 'active' || status === 'trialing';
    },

    getRemainingMonthlyStories: () => {
      const settings = get().profileSettings;
      // Si es premium, devuelve infinito (o un número grande), si no, calcula el restante de 10.
      if (get().isPremium() || !settings) return Infinity;
      return Math.max(0, 10 - (settings.monthly_stories_generated || 0));
    },

    canCreateStory: () => {
      return get().getRemainingMonthlyStories() > 0;
    },

    getRemainingMonthlyVoiceGenerations: () => {
      const settings = get().profileSettings;
      // Solo aplica a premium, devuelve 0 si no lo es.
      if (!get().isPremium() || !settings) return 0;
      // Asumiendo 20 generaciones gratis al mes
      return Math.max(0, 20 - (settings.monthly_voice_generations_used || 0));
    },

    getAvailableVoiceCredits: () => {
      return get().profileSettings?.voice_credits || 0;
    },

    canGenerateVoice: () => {
      const remainingMonthly = get().getRemainingMonthlyVoiceGenerations();
      const availableCredits = get().getAvailableVoiceCredits();
      // Importante: Solo puede generar voz si es premium
      return get().isPremium() && (remainingMonthly > 0 || availableCredits > 0);
    },

    canContinueStory: (storyId: string) => {
      if (get().isPremium()) return true; // Premium puede continuar ilimitadamente

      // Gratuito: obtener capítulos y contar
      const chapters = useChaptersStore.getState().getChaptersByStoryId(storyId);
      // Permite si hay menos de 2 capítulos (Cap 1 inicial + 1 continuación)
      return chapters.length < 2;
    },

    checkAuth: async () => {
      try {
        // Forzar una actualización del cliente Supabase para evitar problemas con tokens antiguos
        const { data: { session } } = await supabase.auth.getSession();

        // Obtener el usuario actual con las credenciales actualizadas
        const { user, error } = await getCurrentUser();

        if (user && !error) {
          // Actualizar el usuario en el store
          set({ user });

          // Actualizar usuario en el store global
          setCurrentAuthUser(user.id);

          // Si hay una sesión activa, cargar datos desde Supabase
          if (session) {
            console.log(`Sesión activa para usuario ${user.id}, cargando datos desde Supabase`);

            try {
              // 1. Cargar perfil
              const { success, profile } = await getUserProfile(user.id);
              if (success && profile) {
                console.log("Perfil actualizado recibido:", profile);
                set({ profileSettings: profile });
              } else {
                console.log("No se encontró perfil para el usuario:", user.id);
              }

              // 2. Iniciar sincronización de otros datos
              syncAllUserData(user.id);
            } catch (profileError) {
              console.error("Error al cargar datos desde Supabase:", profileError);
            }
          }

          return true;
        } else {
          // No hay usuario autenticado, limpiar el estado
          set({ user: null, profileSettings: null });
          setCurrentAuthUser(null);
          return false;
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        // En caso de error, limpiar el estado para evitar datos inconsistentes
        set({ user: null, profileSettings: null });
        setCurrentAuthUser(null);
        return false;
      }
    },
  }),
  "user",
);

// Función para sincronizar todos los datos del usuario desde Supabase
async function syncAllUserData(userId: string) {
  console.log(`Iniciando carga completa para usuario: ${userId}`);

  // 1. Limpiar todos los datos locales primero
  const otherStores = [
    { store: (await import('../stories/storiesStore')).useStoriesStore, method: 'loadStoriesFromSupabase' },
    { store: (await import('../character/characterStore')).useCharacterStore, method: 'loadCharactersFromSupabase' },
    // Agrega otros stores aquí
  ];

  // 2. Cargar secuencialmente
  for (const { store, method } of otherStores) {
    try {
      console.log(`Cargando datos con método: ${method}`);
      await store.getState()[method](userId);
    } catch (error) {
      console.error(`Error cargando datos con ${method}:`, error);
    }
  }

  console.log("Sincronización completa");
}
//NOTA MIGUEL. Si queremos llamar menos a la base de datos, a lo mejor podríamos cargar las historias y los personajes solo cuando pulsen "mis historias" o "mis personajes". No siempre.