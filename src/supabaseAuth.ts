import { createClient, User as SupabaseUser } from "@supabase/supabase-js";
import { ProfileSettings, User } from "./types";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mantener un registro del último usuario autenticado para detectar cambios
let lastAuthenticatedUserId: string | null = null;

// Callback para cambios de autenticación que puede ser reemplazado por la aplicación
let authChangeCallback: ((event: string, userId: string | null) => void) | null = null;

// Configurar evento listener para cambios de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Evento de autenticación detectado: ${event}`);
  
  // Determinar si ha habido un cambio de usuario
  const currentUserId = session?.user?.id || null;
  const userChanged = currentUserId !== lastAuthenticatedUserId;
  
  if (event === 'SIGNED_IN') {
    console.log(`Usuario autenticado: ${currentUserId}`);
    
    if (userChanged && lastAuthenticatedUserId !== null) {
      console.log('Cambio de usuario detectado, limpiando datos locales de sesión anterior');
      // Limpiar datos de la sesión anterior
      clearSessionData(lastAuthenticatedUserId);
    }
    
    // Actualizar el ID del último usuario autenticado
    lastAuthenticatedUserId = currentUserId;
    
    // Notificar al callback si existe
    if (authChangeCallback) {
      authChangeCallback(event, currentUserId);
    }
  } 
  else if (event === 'SIGNED_OUT') {
    console.log('Usuario cerró sesión');
    
    // Guardar temporalmente el ID para limpieza
    const previousUserId = lastAuthenticatedUserId;
    
    // Resetear el ID del último usuario
    lastAuthenticatedUserId = null;
    
    // Limpiar datos de la sesión
    if (previousUserId) {
      clearSessionData(previousUserId);
    }
    
    // Notificar al callback si existe
    if (authChangeCallback) {
      authChangeCallback(event, null);
    }
  } 
  else if (event === 'USER_UPDATED') {
    console.log('Datos de usuario actualizados');
    
    // Notificar al callback si existe
    if (authChangeCallback) {
      authChangeCallback(event, currentUserId);
    }
  }
  else if (event === 'TOKEN_REFRESHED') {
    console.log('Token de autenticación actualizado');
    
    // Notificar al callback si existe
    if (authChangeCallback) {
      authChangeCallback(event, currentUserId);
    }
  }
});

// Establecer un callback para cambios de autenticación
export const setAuthChangeCallback = (callback: (event: string, userId: string | null) => void) => {
  authChangeCallback = callback;
};

// Función para limpiar datos de sesión
const clearSessionData = (userId: string | null) => {
  console.log(`Limpiando datos para usuario: ${userId || 'anónimo'}`);
  
  // Limpiar localStorage (solo las claves relacionadas con la aplicación)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('story-app-')) {
      console.log(`Eliminando clave: ${key}`);
      localStorage.removeItem(key);
      // Ajustar el índice ya que hemos eliminado un elemento
      i--;
    }
  }
  
  // Disparar un evento personalizado para que otros componentes puedan reaccionar
  window.dispatchEvent(new CustomEvent('userSessionCleared', { 
    detail: { userId } 
  }));
};

// Function to register a new user
export const signUp = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // Limpiar datos de cualquier sesión anterior
    clearSessionData(lastAuthenticatedUserId);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error in sign up:", error.message);
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: new Error("User creation failed") };
    }

    // Actualizar ID del último usuario autenticado
    lastAuthenticatedUserId = data.user.id;

    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error during signup:", err);
    return { user: null, error: err as Error };
  }
};

// Function to sign in with Google
export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  try {
    // Limpiar datos de cualquier sesión anterior
    clearSessionData(lastAuthenticatedUserId);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error in Google sign in:", error.message);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error during Google sign in:", err);
    return { error: err as Error };
  }
};

// Function to sign in
export const login = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // Limpiar datos de cualquier sesión anterior
    clearSessionData(lastAuthenticatedUserId);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error in login:", error.message);
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: new Error("Login failed") };
    }
    
    // Actualizar ID del último usuario autenticado
    lastAuthenticatedUserId = data.user.id;

    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error during login:", err);
    return { user: null, error: err as Error };
  }
};

// Function to get the user profile data from metadata and profiles table
export const getProfile = async (): Promise<
  { profile: any | null; error: Error | null }
> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error.message);
      return { profile: null, error };
    }

    if (!user) {
      return { profile: null, error: new Error("No authenticated user") };
    }

    // Intentar obtener el perfil de la tabla profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // No data found is not a critical error
      console.error("Error getting profile from database:", profileError.message);
    }

    // Crear objeto de configuración del perfil
    const profileSettings = profileData ? {
      language: profileData.language || "Español",
      childAge: profileData.child_age || 5,
      specialNeed: profileData.special_need || "Ninguna"
    } : user.user_metadata?.profile_settings || {
      language: "Español",
      childAge: 5,
      specialNeed: "Ninguna"
    };

    // Devolver las metadatas del usuario como perfil
    return {
      profile: {
        id: user.id,
        email: user.email,
        profile_settings: profileSettings,
        ...user.user_metadata
      },
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error getting profile:", err);
    return { profile: null, error: err as Error };
  }
};

// Function to update the user's profile settings (using metadata and profiles table)
export const updateProfile = async (
  profileSettings?: ProfileSettings,
): Promise<{ profile: any | null; error: Error | null }> => {
  try {
    const metadata: any = {};

    if (profileSettings) {
      metadata.profile_settings = profileSettings;
    }

    // Actualizar metadata del usuario
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) {
      console.error("Error updating user:", error.message);
      return { profile: null, error };
    }

    if (!data.user) {
      return { profile: null, error: new Error("User update failed") };
    }

    // También guardar en la tabla profiles
    const userId = data.user.id;

    // Preparar datos para la tabla profiles
    const profileData = {
      language: profileSettings?.language || "Español",
      child_age: profileSettings?.childAge || 5,
      special_need: profileSettings?.specialNeed || "Ninguna",
      updated_at: new Date().toISOString()
    };

    // Comprobar si ya existe un perfil para este usuario
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // No data found is not a critical error
      console.error("Error fetching existing profile:", fetchError.message);
    }

    let profileResult;
    
    if (!existingProfile) {
      // Insertar nuevo perfil con el mismo ID que el usuario
      profileResult = await supabase
        .from('profiles')
        .insert([{ 
          id: userId,
          ...profileData,
          created_at: new Date().toISOString()
        }])
        .select();
    } else {
      // Actualizar perfil existente
      profileResult = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select();
    }

    if (profileResult.error) {
      console.error("Error saving profile to database:", profileResult.error.message);
      // No devolver error para no interrumpir el flujo, ya tenemos los datos en metadatos
    }

    // Devolver los datos del usuario combinados con los de la tabla
    return {
      profile: {
        id: data.user.id,
        email: data.user.email,
        profile_settings: profileSettings,
        ...data.user.user_metadata,
        ...(profileResult.data?.[0] || {})
      },
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error updating profile:", err);
    return { profile: null, error: err as Error };
  }
};

// Function to sign out
export const logout = async (): Promise<{ error: Error | null }> => {
  try {
    // Guardar temporalmente el ID del usuario actual
    const currentUserId = lastAuthenticatedUserId;
    
    // Limpiar datos locales antes de cerrar sesión en Supabase
    clearSessionData(currentUserId);
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error in logout:", error.message);
      return { error };
    }

    // Resetear el último usuario autenticado
    lastAuthenticatedUserId = null;
    
    return { error: null };
  } catch (err) {
    console.error("Unexpected error during logout:", err);
    return { error: err as Error };
  }
};

// Function to get the current session
export const getCurrentUser = async (): Promise<
  { user: User | null; error: Error | null }
> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error.message);
      return { user: null, error };
    }

    if (!user) {
      return { user: null, error: null }; // Not an error, just no user
    }

    return {
      user: {
        id: user.id,
        email: user.email || "",
      },
      error: null,
    };
  } catch (err) {
    console.error("Error getting current user:", err);
    return { user: null, error: err as Error };
  }
};

// Function to handle password reset
export const requestPasswordReset = async (
  email: string,
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Error requesting password reset:", error.message);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error requesting password reset:", err);
    return { error: err as Error };
  }
};
