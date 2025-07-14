// src/store/user/userStore.ts

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

const PREMIUM_MONTHLY_VOICE_ALLOWANCE = 20; // Max free monthly voice generations for premium

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
    loginUser: async (user: User): Promise<void> => {
       setCurrentAuthUser(user.id);
       set({ user, intendedRedirectPath: null });

       try {
           // Una sola consulta para cargar perfil
           const { success, profile } = await getUserProfile(user.id);
           
           if (success && profile) {
               set({ profileSettings: profile });
               const redirectPath = profile.has_completed_setup ? '/home' : '/profile-config';
               set({ intendedRedirectPath: redirectPath });
           } else {
               // Si no hay perfil, debe ir a configuración
               set({ intendedRedirectPath: '/profile-config' });
           }

           // Cargar otros datos en segundo plano (no bloqueante)
           syncAllUserData(user.id);
       } catch (error) {
           console.error("Error cargando datos de usuario:", error);
           set({ intendedRedirectPath: '/profile-config' });
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
          preferences: 'preferences',
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
      const settings = get().profileSettings;
      console.log('[canGenerateVoice_DEBUG] Checking canGenerateVoice. Settings:', settings);

      // a. Handle missing profile
      if (!settings) {
        console.warn('[canGenerateVoice_DEBUG] No profile settings found. Denying voice generation.');
        return false;
      }

      // b. Get values safely
      const subscriptionStatus = settings.subscription_status;
      const monthlyGenerationsUsed = settings.monthly_voice_generations_used ?? 0;
      const voiceCredits = settings.voice_credits ?? 0;

      // c. Determine if premium
      const isPremium = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
      console.log(`[canGenerateVoice_DEBUG] User Status: ${subscriptionStatus}, Is Premium: ${isPremium}`);

      // d. Main logic
      if (isPremium) {
        const hasMonthlyGenerations = monthlyGenerationsUsed < PREMIUM_MONTHLY_VOICE_ALLOWANCE;
        const hasPurchasedCredits = voiceCredits > 0;
        const allowed = hasMonthlyGenerations || hasPurchasedCredits;
        console.log(`[canGenerateVoice_DEBUG] Premium Check - Monthly Used: ${monthlyGenerationsUsed}/${PREMIUM_MONTHLY_VOICE_ALLOWANCE}, Credits: ${voiceCredits}. Allowed: ${allowed}`);
        return allowed;
      } else {
        // Non-premium (Free, Canceled, etc.)
        const hasPurchasedCredits = voiceCredits > 0;
        console.log(`[canGenerateVoice_DEBUG] Non-Premium Check - Credits: ${voiceCredits}. Allowed: ${hasPurchasedCredits}`);
        return hasPurchasedCredits; // Only allowed if they have purchased credits
      }
    },

    canContinueStory: (storyId: string) => {
      // Use the same monthly story limit logic as canCreateStory
      // Both creating new stories and continuing stories count towards the 10/month limit
      return get().getRemainingMonthlyStories() > 0;
    },

    checkAuth: async (): Promise<User | null> => {
       try {
           const { user, error } = await getCurrentUser();

           if (user && !error) {
               set({ user });
               
               // Solo cargar perfil si no está en cache
               const currentProfile = get().profileSettings;
               if (!currentProfile || currentProfile.id !== user.id) {
                   const { success, profile } = await getUserProfile(user.id);
                   if (success && profile) {
                       set({ profileSettings: profile });
                   }
               }
               
               // SOLUCION: Cargar datos de historias cuando el usuario ya está autenticado
               // Esto resuelve el problema de que las historias no se cargan en refresh/navegación directa
               syncAllUserData(user.id);
               
               return user;
           } else {
               set({ user: null, profileSettings: null });
               return null;
           }
       } catch (e) {
           console.error("Error en checkAuth:", e);
           set({ user: null, profileSettings: null });
           return null;
       }
    },
  }),
  "user",
);

// Función para sincronizar todos los datos del usuario desde Supabase
async function syncAllUserData(userId: string) {
  console.log(`Iniciando carga completa para usuario: ${userId}`);

  // 1. Cargar datos de historias desde Supabase
  // Nota: Los personajes ahora se cargan directamente en las páginas según sea necesario
  const otherStores = [
    { store: (await import('../stories/storiesStore')).useStoriesStore, method: 'loadStoriesFromSupabase' },
    // Character store eliminado - los personajes se cargan directamente vía charactersService
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