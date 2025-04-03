import { useUserStore } from "../store/user/userStore";
import { useCharacterStore } from "../store/character/characterStore";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useAudioStore } from "../store/stories/audio/audioStore";
import { getCurrentUser } from "../supabaseAuth";

/**
 * Servicio para sincronizar todos los datos del usuario con Supabase
 * cuando inicia sesión o cuando se detecta que está online.
 */
export const syncUserData = async () => {
    try {
        // Verificar si el usuario está autenticado
        const { user, error } = await getCurrentUser();

        if (!user || error) {
            console.log("No hay usuario autenticado, no se puede sincronizar");
            if (error) {
                console.log("Error de autenticación:", error.message);
            }
            return false;
        }

        console.log(
            "Usuario autenticado encontrado:",
            user.id,
            "- Email:",
            user.email,
        );

        // Cargar perfil de usuario
        const authResult = await useUserStore.getState().checkAuth();
        console.log(
            "Resultado de verificación de autenticación:",
            authResult ? "Usuario autenticado" : "Usuario no autenticado",
        );

        // Cargar personajes del usuario
        await useCharacterStore.getState().loadCharactersFromSupabase();
        console.log("Carga de personajes completada");

        // Cargar historias del usuario
        await useStoriesStore.getState().loadStoriesFromSupabase();
        console.log("Carga de historias completada");

        // Cargar preferencias de audio y archivos de audio
        await useAudioStore.getState().loadAudioFromSupabase();
        console.log("Carga de audio completada");

        console.log("Sincronización completa");
        return true;
    } catch (error) {
        console.error("Error sincronizando datos del usuario:", error);
        return false;
    }
};

/**
 * Escuchar cambios en la conectividad para sincronizar
 * cuando el usuario vuelve a estar online.
 */
export const initSyncListeners = () => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
        // Sincronizar cuando vuelve la conexión
        window.addEventListener("online", () => {
            console.log("Conexión detectada, sincronizando datos...");
            syncUserData();
        });
    }
};

/**
 * Inicializar el servicio de sincronización
 */
export const initSyncService = () => {
    // Iniciar listeners de conexión
    initSyncListeners();

    console.log("Servicio de sincronización inicializado");

    // Intentar sincronización inicial
    if (navigator.onLine) {
        console.log("Conexión inicial detectada, iniciando sincronización...");
        syncUserData();
    } else {
        console.log(
            "No hay conexión a internet, esperando conexión para sincronizar",
        );
    }
};
