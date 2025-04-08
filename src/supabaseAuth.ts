// Importa el cliente ÚNICO desde supabaseClient.ts
import { supabase } from "./supabaseClient"; // Asegúrate que la ruta es correcta
import { User } from "./types"; // Asume que estos tipos son correctos

// Listener de Auth simplificado (opcional, solo para logging)
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth Event: ${event}`, session ? `User: ${session.user.id}` : 'No session');
});

// --- Funciones de Autenticación ---

export const signUp = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: Error | null }> => {
  // Eliminada la llamada a clearSessionData
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Opciones adicionales si las necesitas (e.g., data para metadata inicial)
    });

    if (error) {
      console.error("Error en signUp:", error.message);
      return { user: null, error };
    }

    // ¡Importante! signUp puede requerir verificación de email.
    // data.user puede existir pero data.session ser null hasta la verificación.
    // La lógica que llama a signUp debe manejar esto.
    if (!data.user) {
      // Esto no debería ocurrir si no hay error, pero por si acaso.
      console.error("signUp exitoso pero no se devolvió usuario.");
      return { user: null, error: new Error("User creation failed unexpectedly") };
    }

    // Devolver solo la información básica del usuario creado.
    // El proceso de login/checkAuth se encargará de establecer la sesión completa y cargar datos.
    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
      error: null,
    };
  } catch (err) {
    console.error("Error inesperado durante signUp:", err);
    return { user: null, error: err as Error };
  }
};

export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  // Eliminada la llamada a clearSessionData
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Asegúrate que esta URL está en la lista de URLs permitidas en Supabase Auth settings
        redirectTo: `${window.location.origin}/auth/callback`, // o tu ruta de callback
      },
    });

    if (error) {
      console.error("Error en signInWithGoogle:", error.message);
      return { error };
    }
    // signInWithOAuth redirige, no devuelve usuario/sesión aquí.
    // El manejo se hace en la página de callback.
    return { error: null };
  } catch (err) {
    console.error("Error inesperado durante signInWithGoogle:", err);
    return { error: err as Error };
  }
};

export const login = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: Error | null }> => {
  // Eliminada la llamada a clearSessionData
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error en login:", error.message);
      return { user: null, error };
    }

    // signIn devuelve tanto user como session si es exitoso
    if (!data.user || !data.session) {
      console.error("Login exitoso pero faltan datos de usuario o sesión.");
      return { user: null, error: new Error("Login failed unexpectedly") };
    }

    // Devolver usuario básico. El userStore.checkAuth/loginUser
    // se encargará de actualizar el estado global y cargar datos.
    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
      error: null,
    };
  } catch (err) {
    console.error("Error inesperado durante login:", err);
    return { user: null, error: err as Error };
  }
};

export const logout = async (): Promise<{ error: Error | null }> => {
  // Eliminada la llamada a clearSessionData
  try {
    // El userStore.logoutUser debería llamar a syncQueue.processQueue() ANTES de llamar a esta función.
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error en logout:", error.message);
      // Incluso si hay error, el estado local debe limpiarse. userStore lo hará.
      return { error };
    }

    // El estado local (stores, userStore.user) será limpiado por userStore.logoutUser
    // después de llamar a esta función de signOut.
    return { error: null };
  } catch (err) {
    console.error("Error inesperado durante logout:", err);
    return { error: err as Error };
  }
};

// ELIMINADAS las funciones getProfile y updateProfile. Usar getUserProfile y syncUserProfile de supabase.ts

// getCurrentUser sigue siendo útil como una forma rápida de obtener el usuario básico.
export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // getUser es preferible a getSession si solo necesitas el usuario y quieres forzar refresco si es necesario.
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      // No loguear error aquí necesariamente, puede ser normal si no hay sesión.
      return { user: null, error };
    }

    if (!user) {
      return { user: null, error: null }; // Sin usuario, sin error.
    }

    return {
      user: {
        id: user.id,
        email: user.email || "",
      },
      error: null,
    };
  } catch (err) {
    // Capturar errores inesperados del propio método getUser
    console.error("Error inesperado en getCurrentUser:", err);
    return { user: null, error: err as Error };
  }
};

export const requestPasswordReset = async (
  email: string,
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Asegúrate que esta ruta existe y maneja la actualización de contraseña
      redirectTo: `${window.location.origin}/update-password`, // Ruta para actualizar contraseña
    });

    if (error) {
      console.error("Error solicitando reseteo de contraseña:", error.message);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("Error inesperado solicitando reseteo de contraseña:", err);
    return { error: err as Error };
  }
};