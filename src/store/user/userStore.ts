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
const initialState: Pick<UserState, "user" | "profileSettings" | "intendedRedirectPath"> = {
  user: null,
  profileSettings: null,
  intendedRedirectPath: null, // Inicializado
};

// Lógica del store
export const useUserStore = createPersistentStore<UserState>(
  initialState,
  (set, get) => ({
    loginUser: async (user: User): Promise<void> => { // Revertido a Promise<void>
      // Actualizar usuario en el store global
      setCurrentAuthUser(user.id);

      // Establecer el usuario en el store
      set({ user, intendedRedirectPath: null }); // Reset path on new login attempt

      let redirectPath = '/login'; // Default path

      // Al iniciar sesión, cargar datos desde Supabase
      try {
        // 1. Cargar perfil
        console.log(`Cargando perfil para usuario ${user.id} desde Supabase`);
        const { success, profile } = await getUserProfile(user.id);
        if (success && profile) {
          console.log("Perfil cargado con éxito:", profile);
          set({ profileSettings: profile });
          // Determinar ruta de redirección basado en setup
          redirectPath = profile.has_completed_setup ? '/home' : '/profile-config';
        } else {
          console.warn("No se encontró perfil para el usuario logueado o hubo un error, redirigiendo a setup:", user.id);
          // Podría ser un usuario nuevo o un error. Dirigir a setup como fallback seguro.
          redirectPath = '/profile-config';
        }

        // 2. Iniciar sincronización de otros datos (no bloqueante para la redirección)
        syncAllUserData(user.id);

      } catch (error) {
        console.error("Error cargando datos de usuario desde Supabase:", error);
        redirectPath = '/login'; // En caso de error, volver a login
      }
      set({ intendedRedirectPath: redirectPath }); // Establecer el path en el estado
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
      set({ user: null, profileSettings: null, intendedRedirectPath: null });

      // Actualizar usuario en el store global (ningún usuario autenticado)
      setCurrentAuthUser(null);
    },

    setProfileSettings: async (settings: Partial<ProfileSettings>) => {
      // 1. Merge partial settings with current state
      set((state) => ({
        profileSettings: {
          // Ensure we have a base object even if profileSettings was null
          ...(state.profileSettings || { has_completed_setup: false }), // Default has_completed_setup if null
          ...settings,
        } as ProfileSettings // Assert as ProfileSettings after merge
      }));

      // 2. Sincronizar solo los campos proporcionados con Supabase
      const user = get().user;
      if (user) {
        // 3. Construir objeto solo con los campos presentes en 'settings'
        const syncData: { [key: string]: any } = {};
        // Mapeo de camelCase (TypeScript) a snake_case (Supabase)
        const keyMap: { [K in keyof ProfileSettings]?: string } = {
          childAge: 'child_age',
          specialNeed: 'special_need',
          language: 'language',
          has_completed_setup: 'has_completed_setup', // Añadir mapeo si alguna vez se actualiza por aquí
          // Añadir otros campos editables si es necesario
        };

        for (const key in settings) {
          if (Object.prototype.hasOwnProperty.call(settings, key)) {
            const mappedKey = keyMap[key as keyof ProfileSettings];
            if (mappedKey) {
              // Asegurar que el valor no sea undefined antes de asignarlo
              const value = settings[key as keyof ProfileSettings];
              if (value !== undefined) {
                 syncData[mappedKey] = value;
              }
            }
          }
        }

        // No sincronizar si no hay datos válidos para enviar
        if (Object.keys(syncData).length === 0) {
          console.log("setProfileSettings: No hay datos editables válidos para sincronizar.");
          return;
        }

        try {
          // 4. Intentar la sincronización directa
          const { success, error: syncError } = await syncUserProfile(user.id, syncData as any);
          if (!success) {
            console.warn("Sincronización directa fallida, añadiendo a la cola:", syncError);
            // 5. Si falla, agregarlo a la cola de sincronización
            syncQueue.addToQueue("profiles", "update", { id: user.id, ...syncData });
          }
        } catch (error) {
          console.error("Error sincronizando perfil con Supabase:", error);
          // 6. Agregar a la cola de sincronización en caso de error
          syncQueue.addToQueue("profiles", "update", { id: user.id, ...syncData });
        }
      }
    },

    hasCompletedProfile: () => {
      const profile = get().profileSettings;
      // Considerar el perfil completado si existe y el flag es true
      return !!profile && profile.has_completed_setup;
    },

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

    checkAuth: async (): Promise<boolean> => { // Revertido a Promise<boolean>
      let redirectPath = '/login'; // Default path
      let isAuthenticated = false;
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
            isAuthenticated = true; // Consider authenticated if session exists

            try {
              // 1. Cargar perfil
              const { success, profile } = await getUserProfile(user.id);
              if (success && profile) {
                console.log("Perfil actualizado recibido:", profile);
                set({ profileSettings: profile });
                // Determinar ruta de redirección basado en setup
                redirectPath = profile.has_completed_setup ? '/home' : '/profile-config';
              } else {
                console.warn("No se encontró perfil para el usuario con sesión activa o hubo un error, redirigiendo a configuración.");
                redirectPath = '/profile-config';
                isAuthenticated = true; // Aún autenticado, solo necesita perfil
              }

              // 2. Iniciar sincronización de otros datos (no bloqueante)
              syncAllUserData(user.id);

            } catch (profileError) {
              console.error("Error al cargar datos desde Supabase:", profileError);
              redirectPath = '/login'; // Fallback a login si falla carga de perfil
              isAuthenticated = false; // No autenticado si falla la carga esencial del perfil
            }
          } else {
            // Sesión expirada o inválida, aunque getCurrentUser devolvió un usuario (raro)
             console.warn("Usuario obtenido pero sin sesión activa. Redirigiendo a login.");
             redirectPath = '/login';
             isAuthenticated = false;
          }

        } else {
          // No hay usuario autenticado, limpiar el estado
          set({ user: null, profileSettings: null });
          setCurrentAuthUser(null);
          redirectPath = '/login';
          isAuthenticated = false;
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        // En caso de error, limpiar el estado para evitar datos inconsistentes
        set({ user: null, profileSettings: null });
        setCurrentAuthUser(null);
        redirectPath = '/login';
        isAuthenticated = false;
      }
      // Establecer el path en el estado DEFERIDO para asegurar que el estado se actualice después del ciclo de render actual
      setTimeout(() => set({ intendedRedirectPath: redirectPath }), 0);
      return isAuthenticated; // Devolver estado de autenticación
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