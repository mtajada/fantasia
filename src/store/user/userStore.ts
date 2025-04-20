// src/store/user/userStore.ts

import { UserState } from "../types/storeTypes";
import { ProfileSettings, User } from "../../types"; // Asumiendo que ProfileSettings está aquí
import { createPersistentStore, setCurrentAuthUser } from "../core/createStore";
import { getCurrentUser, logout } from "../../services/supabaseAuth"; // Corregido: ruta a supabaseAuth
import {
  getUserProfile,
  syncQueue,
  syncUserProfile,
} from "../../services/supabase";
import { supabase } from "../../services/supabaseClient"; // Corregido: ruta a supabaseClient
import { useChaptersStore } from '../stories/chapters/chaptersStore';

// --- INICIO: Definir Constante para Límite Mensual ---
// Es mejor tenerla aquí o importarla de un config que leer env var en el store
const PREMIUM_MONTHLY_VOICE_ALLOWANCE = 20;
// --- FIN: Definir Constante ---

// Estado inicial
const initialState: Pick<UserState, "user" | "profileSettings" | "intendedRedirectPath"> = {
  user: null,
  profileSettings: null,
  intendedRedirectPath: null,
};

// Lógica del store
export const useUserStore = createPersistentStore<UserState>(
  initialState,
  (set, get) => ({
    // ... (loginUser, logoutUser, setProfileSettings, hasCompletedProfile igual que antes) ...
    loginUser: async (user: User): Promise<void> => {
        setCurrentAuthUser(user.id);
        set({ user, intendedRedirectPath: null });
        let redirectPath = '/login';
        try {
            console.log(`Cargando perfil para usuario ${user.id} desde Supabase`);
            const { success, profile } = await getUserProfile(user.id);
            if (success && profile) {
                console.log("Perfil cargado con éxito:", profile);
                set({ profileSettings: profile });
                redirectPath = profile.has_completed_setup ? '/home' : '/profile-config';
            } else {
                console.warn("No se encontró perfil para el usuario logueado o hubo un error, redirigiendo a setup:", user.id);
                redirectPath = '/profile-config';
            }
            // Iniciar sincronización de otros datos
            syncAllUserData(user.id); // No esperar aquí
        } catch (error) {
            console.error("Error cargando datos de usuario desde Supabase:", error);
            redirectPath = '/login';
        }
        // Usar un pequeño delay para asegurar que el estado se propague antes de la posible redirección
        setTimeout(() => set({ intendedRedirectPath: redirectPath }), 50);
    },

    logoutUser: async () => {
        const currentUser = get().user;
        if (currentUser) {
            await syncQueue.processQueue();
        }
        await logout();
        set({ user: null, profileSettings: null, intendedRedirectPath: null });
        setCurrentAuthUser(null);
        // Limpiar otros stores si es necesario
        useChaptersStore.getState().clearChapters();
        // ... limpiar otros stores ...
    },

    setProfileSettings: async (settings: Partial<ProfileSettings>) => {
        set((state) => ({
            profileSettings: {
                ...(state.profileSettings || { has_completed_setup: false }),
                ...settings,
            } as ProfileSettings
        }));

        const user = get().user;
        if (user) {
            const syncData: { [key: string]: any } = {};
            const keyMap: { [K in keyof ProfileSettings]?: string } = {
                // Mapeo camelCase a snake_case (asegúrate que los nombres coincidan con tu tabla 'profiles')
                preferred_language: 'preferred_language', // Ejemplo, ajusta según tu tipo ProfileSettings
                user_age_range: 'user_age_range',       // Ejemplo
                special_need: 'special_need',           // Ejemplo
                has_completed_setup: 'has_completed_setup',
                preferred_voice_id: 'preferred_voice_id' // Ejemplo
                // Añade todos los campos que permites editar en el perfil
            };

            for (const key in settings) {
                if (Object.prototype.hasOwnProperty.call(settings, key)) {
                    const mappedKey = keyMap[key as keyof ProfileSettings];
                    if (mappedKey) {
                        const value = settings[key as keyof ProfileSettings];
                        // Solo incluir si el valor no es undefined
                        if (value !== undefined) {
                            syncData[mappedKey] = value;
                        }
                    } else {
                         console.warn(`[setProfileSettings] Mapeo no encontrado para la clave: ${key}`);
                    }
                }
            }

            if (Object.keys(syncData).length === 0) {
                console.log("[setProfileSettings] No hay datos mapeados válidos para sincronizar.");
                return;
            }
            console.log("[setProfileSettings] Datos a sincronizar:", syncData);

            try {
                const { success, error: syncError } = await syncUserProfile(user.id, syncData); // syncData ya está en snake_case
                if (!success) {
                    console.warn("[setProfileSettings] Sincronización directa fallida, añadiendo a la cola:", syncError);
                    syncQueue.addToQueue("profiles", "update", { id: user.id, ...syncData });
                } else {
                     console.log("[setProfileSettings] Perfil sincronizado directamente con éxito.");
                }
            } catch (error) {
                console.error("[setProfileSettings] Error sincronizando perfil con Supabase:", error);
                syncQueue.addToQueue("profiles", "update", { id: user.id, ...syncData });
            }
        }
    },

    hasCompletedProfile: () => {
      const profile = get().profileSettings;
      return !!profile && profile.has_completed_setup;
    },

    // --- Selectores ---
    isPremium: () => {
      const status = get().profileSettings?.subscription_status;
      // Considera 'trialing' como premium también para acceso a funciones
      return status === 'active' || status === 'trialing';
    },

    getRemainingMonthlyStories: () => {
      const settings = get().profileSettings;
      if (get().isPremium() || !settings) return Infinity; // Premium tiene ilimitadas
      const limit = 10; // Límite para gratuitos
      return Math.max(0, limit - (settings.monthly_stories_generated || 0));
    },

    canCreateStory: () => {
      // Simplificado: si quedan historias > 0
      return get().getRemainingMonthlyStories() > 0;
    },

    getRemainingMonthlyVoiceGenerations: () => {
      const settings = get().profileSettings;
      // Solo aplica a premium
      if (!get().isPremium() || !settings) return 0;
      // Usa la constante definida arriba
      return Math.max(0, PREMIUM_MONTHLY_VOICE_ALLOWANCE - (settings.monthly_voice_generations_used || 0));
    },

    getAvailableVoiceCredits: () => {
      // Créditos comprados
      return get().profileSettings?.voice_credits || 0;
    },

    // --- SELECTOR canGenerateVoice CORREGIDO ---
    canGenerateVoice: () => {
      const profile = get().profileSettings;
      if (!profile) {
        console.warn("[canGenerateVoice] No profileSettings found.");
        return false; // No hay perfil, no puede generar
      }

      const isPremium = get().isPremium(); // Usa el selector existente
      const monthlyUsed = profile.monthly_voice_generations_used ?? 0;
      const purchasedCredits = profile.voice_credits ?? 0;

      // Lógica para Premium
      if (isPremium) {
        const hasMonthlyAllowance = monthlyUsed < PREMIUM_MONTHLY_VOICE_ALLOWANCE;
        const hasPurchased = purchasedCredits > 0;
        const allowed = hasMonthlyAllowance || hasPurchased;
        console.log(`[canGenerateVoice_DEBUG] Premium Check: Status=${profile.subscription_status}, Monthly Used=${monthlyUsed}/${PREMIUM_MONTHLY_VOICE_ALLOWANCE}, Purchased=${purchasedCredits}. Allowed: ${allowed}`);
        return allowed;
      }
      // Lógica para No Premium (Free, Canceled, etc.)
      else {
        const hasPurchased = purchasedCredits > 0;
        console.log(`[canGenerateVoice_DEBUG] Non-Premium Check: Status=${profile.subscription_status}, Purchased=${purchasedCredits}. Allowed: ${hasPurchased}`);
        // Solo pueden generar si tienen créditos comprados
        return hasPurchased;
      }
    },
    // --- FIN SELECTOR canGenerateVoice CORREGIDO ---

    canContinueStory: (storyId: string) => {
      if (!storyId) return false; // Necesita un ID de historia
      if (get().isPremium()) return true; // Premium puede continuar ilimitadamente

      // Gratuito: obtener capítulos y contar
      const chapters = useChaptersStore.getState().getChaptersByStoryId(storyId);
      // Permite si hay 1 capítulo (el inicial) o menos. Si hay 2 o más, ya usó la continuación gratuita.
      const canContinue = chapters.length < 2;
      console.log(`[canContinueStory_DEBUG] Free user check for story ${storyId}: Chapters=${chapters.length}. Allowed: ${canContinue}`);
      return canContinue;
    },

    checkAuth: async (): Promise<User | null> => {
      let authenticatedUser: User | null = null;
      try {
        // No necesitamos getSession() aquí si getCurrentUser() ya lo hace implícitamente
        const { user, error } = await getCurrentUser(); // Asume que esta función devuelve el usuario si hay sesión

        if (user && !error) {
          console.log("[checkAuth] User is authenticated:", user.id);
          set({ user }); // Establecer usuario primero
          authenticatedUser = user;

          // Cargar perfil
          console.log(`[checkAuth] Loading profile for user ${user.id}`);
          const { success, profile } = await getUserProfile(user.id);
          if (success && profile) {
            console.log("[checkAuth] Profile loaded successfully.");
            set({ profileSettings: profile });
            // Sincronizar el resto en segundo plano DESPUÉS de establecer el perfil
            // Usar setTimeout para asegurar que el estado se actualice antes de la carga masiva
            setTimeout(() => syncAllUserData(user.id), 0);
          } else {
            console.warn("[checkAuth] User authenticated but profile not found or error loading:", user.id);
            set({ profileSettings: null }); // Asegurar que el perfil esté nulo si falla la carga
          }
        } else {
          if (error) console.error("[checkAuth] Error getting current user:", error.message);
          else console.log("[checkAuth] No authenticated user found.");
          set({ user: null, profileSettings: null });
          authenticatedUser = null;
        }
      } catch (e) {
        console.error("[checkAuth] Critical error during checkAuth:", e);
        set({ user: null, profileSettings: null });
        authenticatedUser = null;
      }
      console.log("[checkAuth] Finished. Returning user:", authenticatedUser?.id || null);
      return authenticatedUser;
    },

    // Añadir una acción para decrementar créditos localmente (optimista)
    // Esto es OPCIONAL, pero puede mejorar la UX si quieres que el contador baje inmediatamente
    // La fuente de verdad sigue siendo la DB actualizada por la Edge Function
    decrementLocalVoiceCredits: () => {
        set((state) => {
            if (!state.profileSettings) return {}; // No hacer nada si no hay perfil

            const currentCredits = state.profileSettings.voice_credits ?? 0;
            if (currentCredits > 0) {
                 console.log("[decrementLocalVoiceCredits] Decrementing local purchased credits.");
                 return {
                     profileSettings: {
                         ...state.profileSettings,
                         voice_credits: currentCredits - 1,
                     }
                 };
            }
            // Si no hay créditos comprados, intentar 'gastar' del mensual (aunque esto es más visual que real)
            const currentMonthlyUsed = state.profileSettings.monthly_voice_generations_used ?? 0;
            if (currentMonthlyUsed < PREMIUM_MONTHLY_VOICE_ALLOWANCE) {
                 console.log("[decrementLocalVoiceCredits] Incrementing local monthly usage count.");
                 return {
                     profileSettings: {
                         ...state.profileSettings,
                         monthly_voice_generations_used: currentMonthlyUsed + 1,
                     }
                 };
            }
            // Si no hay créditos de ningún tipo, no cambiar nada
            return {};
        });
    },


  }),
  "user", // Nombre de la persistencia
);

// Función para sincronizar todos los datos del usuario desde Supabase
// Movida fuera para claridad, pero podría estar dentro si se prefiere
async function syncAllUserData(userId: string) {
  console.log(`[syncAllUserData] Iniciando carga completa para usuario: ${userId}`);
  try {
    // Usar Promise.allSettled para cargar en paralelo pero esperar a todas
    const results = await Promise.allSettled([
      import('../stories/storiesStore').then(({ useStoriesStore }) => useStoriesStore.getState().loadStoriesFromSupabase(userId)),
      import('../character/characterStore').then(({ useCharacterStore }) => useCharacterStore.getState().loadCharactersFromSupabase(userId)),
      // Añadir llamadas a otros stores aquí
      // Ejemplo: import('../otroStore').then(({ useOtroStore }) => useOtroStore.getState().loadData(userId)),
    ]);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[syncAllUserData] Error cargando datos (índice ${index}):`, result.reason);
      } else {
        console.log(`[syncAllUserData] Carga de datos (índice ${index}) completada.`);
      }
    });

  } catch (error) {
      // Este catch es por si Promise.allSettled falla (muy raro) o los imports dinámicos fallan
      console.error(`[syncAllUserData] Error crítico durante la carga paralela:`, error);
  } finally {
      console.log("[syncAllUserData] Sincronización completa (o intentos finalizados).");
  }
}

// Opcional: Escuchar cambios en la autenticación para recargar/limpiar datos
// Esto asegura que si el usuario inicia/cierra sesión en otra pestaña, el estado se actualiza
let isAuthListenerAttached = false;
if (typeof window !== 'undefined' && !isAuthListenerAttached) { // Evitar duplicados en HMR
    supabase.auth.onAuthStateChange((event, session) => {
        console.log(`[Auth Listener] Evento recibido: ${event}`);
        const store = useUserStore.getState();
        if (event === 'SIGNED_IN' && session?.user && store.user?.id !== session.user.id) {
            console.log("[Auth Listener] Usuario inició sesión en otra pestaña/contexto. Recargando datos...");
            store.loginUser(session.user); // Llama a loginUser para recargar todo
        } else if (event === 'SIGNED_OUT' && store.user) {
            console.log("[Auth Listener] Usuario cerró sesión en otra pestaña/contexto. Limpiando datos...");
            store.logoutUser(); // Llama a logoutUser para limpiar
        } else if (event === 'TOKEN_REFRESHED' && session?.user && store.user?.id !== session.user.id) {
             console.log("[Auth Listener] Token refrescado para un usuario diferente. Recargando datos...");
             store.loginUser(session.user);
        } else if (event === 'USER_UPDATED' && session?.user && store.user?.id === session.user.id) {
            console.log("[Auth Listener] Datos del usuario actualizados (ej. email). Refrescando perfil...");
            // Podrías recargar solo el perfil aquí si fuera necesario
            getUserProfile(session.user.id).then(({ success, profile }) => {
                if (success && profile) {
                    store.setProfileSettings(profile); // Actualiza el perfil
                }
            });
        }
    });
    isAuthListenerAttached = true;
    console.log("[Auth Listener] Listener de autenticación adjuntado.");
}