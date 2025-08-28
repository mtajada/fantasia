// Importa los tipos necesarios
import {
    ProfileSettings,
    Story,
    StoryChapter,
    StoryCharacter,
} from "../types";

// --- Importa la instancia ÚNICA del cliente Supabase ---
import { supabase } from "../supabaseClient"; // Ajusta esta ruta si es necesario
import { generateId } from "../store/core/utils";

// --- Listener de Auth (Opcional, solo para logging) ---
// Ya no inicializamos el cliente aquí, solo usamos el importado.
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('Evento Auth en supabase.ts:', event, '- Usuario:', session?.user?.id);
    } else if (event === 'SIGNED_OUT') {
        console.log('Evento Auth en supabase.ts: SIGNED_OUT');
    }
});

// --- Funciones de Perfil ---

export const syncUserProfile = async (
    userId: string,
    // Renombramos el parámetro para claridad y ajustamos tipo
    dataToSync: Partial<ProfileSettings> & { [key: string]: any },
): Promise<{ success: boolean; error?: any }> => {
    try {
        console.log(`[syncUserProfile_DEBUG] Intentando sincronizar para usuario ${userId} con datos:`, dataToSync);

        // Preparamos los datos para upsert, asegurando que 'id' y 'updated_at' están presentes
        const upsertData = {
            id: userId,             // ID es necesario para upsert
            ...dataToSync,         // Usamos directamente los datos mapeados (ej. child_age, special_need)
            updated_at: new Date(), // Siempre actualizamos la fecha
        };

        // Opcional: Asegurarse de que special_need sea null si es undefined, aunque upsert debería manejarlo
        // Corregido: Usar notación de corchetes para evitar error de linting con snake_case
        if (upsertData['special_need'] === undefined) {
            upsertData['special_need'] = null;
        }

        const { error } = await supabase
            .from("profiles")
            .upsert(upsertData); // <<< Pasamos el objeto correcto a upsert

        if (error) {
            console.error("Error sincronizando perfil (posible RLS):", error);
            throw error; // Re-lanzar para el catch general
        }
        console.log(`[syncUserProfile_DEBUG] Perfil sincronizado exitosamente para usuario ${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Fallo general en syncUserProfile:", error);
        // Asegurarse de devolver un objeto Error estándar
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: new Error(errorMessage) };
    }
};

export const getUserProfile = async (userId: string, retries = 2): Promise<{ success: boolean, profile?: ProfileSettings, error?: any }> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
<<<<<<< HEAD
            console.log(`Solicitando perfil para usuario: ${userId} (intento ${attempt + 1}/${retries + 1})`);
=======
            console.log(`Requesting profile for user: ${userId} (attempt ${attempt + 1}/${retries + 1})`);
>>>>>>> origin/main

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error && error.code === 'PGRST116') {
<<<<<<< HEAD
                console.log(`Perfil no encontrado para usuario ${userId}. Este es un resultado definitivo, no se reintenta.`);
                return { success: false }; // La ausencia de perfil no es un error transitorio
            } else if (error) {
                console.warn(`Intento ${attempt + 1} para obtener perfil de ${userId} falló:`, error.message);
                if (attempt === retries) {
                    console.error(`Último intento para obtener perfil de ${userId} falló después de múltiples reintentos.`, error);
                    throw error; // Lanzar error final para ser capturado por el bloque externo
                }
                // Esperar con backoff exponencial antes de reintentar
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue; // Siguiente intento
            }

            if (data) {
                console.log(`Datos de perfil obtenidos exitosamente para usuario ${userId}.`);
=======
                console.log(`Profile not found for user ${userId}. This is a definitive result, no retry.`);
                return { success: false }; // No profile is not a transient error
            } else if (error) {
                console.warn(`Attempt ${attempt + 1} to fetch profile for ${userId} failed:`, error.message);
                if (attempt === retries) {
                    console.error(`Final attempt to fetch profile for ${userId} failed after multiple retries.`, error);
                    throw error; // Throw final error to be caught by the outer block
                }
                // Wait with exponential backoff before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue; // Next attempt
            }

            if (data) {
                console.log(`Successfully fetched profile data for user ${userId}.`);
>>>>>>> origin/main
                const profile: ProfileSettings = {
                    language: data.language,
                    preferences: data.preferences,
                    stripe_customer_id: data.stripe_customer_id,
                    subscription_status: data.subscription_status,
                    subscription_id: data.subscription_id,
                    plan_id: data.plan_id,
                    current_period_end: data.current_period_end,
                    voice_credits: data.voice_credits,
                    monthly_stories_generated: data.monthly_stories_generated,
                    monthly_voice_generations_used: data.monthly_voice_generations_used,
                    has_completed_setup: data.has_completed_setup,
                };
                return { success: true, profile: profile };
            }

<<<<<<< HEAD
            // Este caso idealmente no debería alcanzarse si un perfil siempre se crea al registrarse
            console.warn(`Inesperadamente no se encontraron datos de perfil para usuario ${userId} sin un error.`);
=======
            // This case should ideally not be reached if a profile is always created on sign-up
            console.warn(`Unexpectedly found no profile data for user ${userId} without an error.`);
>>>>>>> origin/main
            return { success: false };

        } catch (error) {
            if (attempt === retries) {
<<<<<<< HEAD
                console.error(`Ocurrió un error crítico al obtener perfil para ${userId}. Todos los reintentos fallaron.`, error);
                return { success: false, error };
            }
            // Esperar antes del siguiente intento en caso de error lanzado
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
    // Esto se devuelve si todos los reintentos fallan
    return { success: false, error: new Error('Todos los intentos para obtener el perfil han fallado.') };
=======
                console.error(`A critical error occurred while fetching profile for ${userId}. All retries failed.`, error);
                return { success: false, error };
            }
            // Wait before the next attempt in case of a thrown error
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
    // This is returned if all retries fail
    return { success: false, error: new Error('All attempts to fetch the profile have failed.') };
>>>>>>> origin/main
};

// --- Funciones de Personajes ---

export const syncCharacter = async (
    userId: string,
    character: StoryCharacter,
): Promise<{ success: boolean; error?: any }> => {
    try {
        console.log(`[DEBUG] Sincronizando personaje "${character.name}" (ID: ${character.id}) para usuario ${userId}`);
        const { data: existingChar, error: queryError } = await supabase
            .from("characters")
            .select("id, user_id")
            .eq("id", character.id)
            .maybeSingle();

        if (queryError) {
            console.error(`[DEBUG] Error al verificar existencia del personaje:`, queryError);
            throw queryError;
        }

        const characterData = {
            id: character.id,
            user_id: userId,
            name: character.name,
            gender: character.gender,
            description: character.description,
            updated_at: new Date(),
        };

        let result;
        if (existingChar) {
            console.log(`[DEBUG] Personaje ${character.id} existe. Actualizando.`);
            if (existingChar.user_id !== userId) {
                console.error(`[DEBUG] ¡Error de seguridad! Intento de modificar personaje ${character.id} de otro usuario.`);
                return { success: false, error: new Error('No tienes permiso para modificar este personaje') };
            }
            result = await supabase
                .from("characters")
                .update(characterData)
                .eq("id", character.id);
        } else {
            console.log(`[DEBUG] Creando nuevo personaje con ID: ${character.id}`);
            result = await supabase
                .from("characters")
                .insert(characterData);
        }

        const { error } = result;
        if (error) {
            console.error(`[DEBUG] Error en operación upsert de personaje (posible RLS):`, error);
            throw error;
        }

        console.log(`[DEBUG] Personaje "${character.name}" guardado exitosamente.`);
        return { success: true };
    } catch (error) {
        console.error("[DEBUG] Fallo general en syncCharacter:", error);
        return { success: false, error };
    }
};

export const getUserCharacters = async (userId: string): Promise<{ success: boolean; characters?: StoryCharacter[]; error?: any }> => {
    // --- CORREGIDO: Eliminada la consulta ineficiente ---
    try {
        console.log(`[DEBUG] Consultando personajes para usuario ${userId}`);
        const { data, error } = await supabase
            .from("characters")
            .select("*") // Consulta correcta y única
            .eq("user_id", userId);

        if (error) {
            console.error(`[DEBUG] Error en consulta de personajes (posible RLS):`, error);
            throw error;
        }

        console.log(`[DEBUG] Personajes encontrados: ${data?.length || 0}`);
        const characters: StoryCharacter[] = data ? data.map((char) => ({
            id: char.id,
            name: char.name,
            gender: char.gender,
            description: char.description || '',
            created_at: char.created_at,
            updated_at: char.updated_at,
            is_preset: false, // Mark as user character
            image_url: char.image_url || undefined, // Include image URL field for consistency
        })) : [];

        return { success: true, characters: characters };
    } catch (error) {
        console.error("Fallo general en getUserCharacters:", error);
        return { success: false, error };
    }
};

export const getPresetCharacters = async (): Promise<{ success: boolean; characters?: StoryCharacter[]; error?: any }> => {
    try {
        console.log(`[DEBUG] Consultando personajes preset`);
        const { data, error } = await supabase
            .from("preset_characters")
            .select("*")
            .order('gender', { ascending: false }) // Females first, then males
            .order('name', { ascending: true });

        if (error) {
            console.error(`[DEBUG] Error en consulta de personajes preset:`, error);
            throw error;
        }

        console.log(`[DEBUG] Personajes preset encontrados: ${data?.length || 0}`);
        const characters: StoryCharacter[] = data ? data.map((char) => ({
            id: char.id,
            name: char.name,
            gender: char.gender,
            description: char.description || '',
            created_at: char.created_at,
            updated_at: char.updated_at,
            is_preset: true, // Mark as preset character
            image_url: char.image_url || undefined, // Include image URL for preset characters
        })) : [];

        return { success: true, characters: characters };
    } catch (error) {
        console.error("Fallo general en getPresetCharacters:", error);
        return { success: false, error };
    }
};

export const getAllCharacters = async (userId: string): Promise<{ success: boolean; characters?: StoryCharacter[]; error?: any }> => {
    try {
        console.log(`[DEBUG] Consultando todos los personajes (preset + usuario) para ${userId}`);
        
        // Get user characters and preset characters in parallel
        const [userCharsResult, presetCharsResult] = await Promise.all([
            getUserCharacters(userId),
            getPresetCharacters()
        ]);

        // Check for errors
        if (!userCharsResult.success) {
            console.error(`[DEBUG] Error obteniendo personajes de usuario:`, userCharsResult.error);
            return userCharsResult;
        }

        if (!presetCharsResult.success) {
            console.error(`[DEBUG] Error obteniendo personajes preset:`, presetCharsResult.error);
            // If preset characters fail, still return user characters
            console.warn(`[DEBUG] Continuando solo con personajes de usuario`);
            return userCharsResult;
        }

        // Combine characters: preset first, then user characters
        const allCharacters = [
            ...(presetCharsResult.characters || []),
            ...(userCharsResult.characters || []).map(char => ({ ...char, is_preset: false }))
        ];

        console.log(`[DEBUG] Total personajes combinados: ${allCharacters.length} (${presetCharsResult.characters?.length || 0} preset + ${userCharsResult.characters?.length || 0} usuario)`);

        return { success: true, characters: allCharacters };
    } catch (error) {
        console.error("Fallo general en getAllCharacters:", error);
        return { success: false, error };
    }
};

export const deleteCharacter = async (characterId: string): Promise<{ success: boolean; error?: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: new Error('No autenticado') };
        }
        const userId = user.id;

        const { data: characterData, error: queryError } = await supabase
            .from("characters")
            .select("user_id")
            .eq("id", characterId)
            .maybeSingle();

        if (queryError) {
            console.error("Error verificando propiedad:", queryError);
            return { success: false, error: queryError };
        }
        if (!characterData) {
            console.warn(`Personaje ${characterId} no encontrado para eliminar.`);
            return { success: false, error: new Error('Personaje no encontrado') };
        }
        if (characterData.user_id !== userId) {
            console.error(`Seguridad: Usuario ${userId} intentó eliminar personaje ${characterId} de ${characterData.user_id}`);
            return { success: false, error: new Error('Permiso denegado') };
        }

        const { error } = await supabase
            .from("characters")
            .delete()
            .eq("id", characterId);

        if (error) {
            console.error("Error eliminando personaje (RLS?):", error);
            throw error;
        }
        return { success: true };
    } catch (error) {
        console.error("Fallo general en deleteCharacter:", error);
        return { success: false, error };
    }
};

// --- Funciones de Historias ---

/**
 * Direct story creation without Zustand store dependency
 * Replaces the storiesStore.addGeneratedStory functionality
 */
export const createStoryDirectly = async (userId: string, story: Story): Promise<{ success: boolean; error?: any }> => {
    try {
        console.log(`🔍 DEBUG - Creating story directly: ${story.id}`);
        
        // Only set character_id if the primary character is user-created (not preset)
        const primaryCharacter = story.options.characters[0];
        const characterId = primaryCharacter && !primaryCharacter.is_preset ? primaryCharacter.id : null;
        
        console.log(`🔍 DEBUG - Primary character: ${primaryCharacter?.name} (preset: ${primaryCharacter?.is_preset})`);
        console.log(`🔍 DEBUG - Setting character_id to: ${characterId}`);
        
        const storyData = {
            id: story.id,
            user_id: userId,
            title: story.title,
            content: story.content,
            audio_url: story.audioUrl,
            genre: story.options.genre,
            story_format: story.options.format,
            character_id: characterId, // Only user-created characters, null for preset characters
            characters_data: story.characters_data || story.options.characters, // Complete character array
            additional_details: story.additional_details,
            created_at: new Date(),
            updated_at: new Date(),
        };
        
        console.log(`🔍 DEBUG - Story data being created:`, {
            id: storyData.id,
            character_id: storyData.character_id,
            characters_count: Array.isArray(storyData.characters_data) ? storyData.characters_data.length : 0
        });
        
        const { error } = await supabase.from("stories").insert(storyData);
        if (error) {
            console.error(`Error al crear historia ${story.id}:`, error);
            throw error;
        }
        
        console.log(`Historia ${story.id} creada exitosamente.`);
        return { success: true };
    } catch (error) {
        console.error("Fallo general en createStoryDirectly:", error);
        return { success: false, error };
    }
};

/**
 * Direct chapter creation without Zustand store dependency
 * Replaces the chaptersStore.addChapter functionality
 */
export const createChapterDirectly = async (storyId: string, chapter: StoryChapter): Promise<{ success: boolean; error?: any }> => {
    try {
        console.log(`🔍 DEBUG - Creating chapter directly for story: ${storyId}`);
        
        // Generate ID if chapter doesn't have one
        const chapterId = chapter.id || generateId("chapter");
        
        const chapterData = {
            id: chapterId,
            story_id: storyId,
            chapter_number: chapter.chapterNumber,
            title: chapter.title,
            content: chapter.content,
            generation_method: chapter.generationMethod,
            custom_input: chapter.customInput,
            created_at: new Date(),
            updated_at: new Date(),
        };
        
        const { error } = await supabase.from("story_chapters").insert(chapterData);
        if (error) {
            console.error(`Error al crear capítulo para historia ${storyId}:`, error);
            throw error;
        }
        
        console.log(`Capítulo creado exitosamente para historia ${storyId}.`);
        return { success: true };
    } catch (error) {
        console.error("Fallo general en createChapterDirectly:", error);
        return { success: false, error };
    }
};

/**
 * Direct story loading without Zustand store dependency
 * Replaces useStoriesStore().getStoryById() functionality
 */
export const getStoryDirectly = async (userId: string, storyId: string): Promise<{ success: boolean; story?: Story; error?: any }> => {
    try {
        console.log(`🔍 DEBUG - Loading story directly: ${storyId} for user: ${userId}`);
        
        const { data, error } = await supabase
            .from("stories")
            .select(`*, characters (*)`)
            .eq("id", storyId)
            .eq("user_id", userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.log(`Story ${storyId} not found for user ${userId}`);
<<<<<<< HEAD
                return { success: false, error: new Error('Historia no encontrada') };
=======
                return { success: false, error: new Error('Story not found') };
>>>>>>> origin/main
            }
            console.error(`Error loading story ${storyId}:`, error);
            throw error;
        }

        if (!data) {
<<<<<<< HEAD
            return { success: false, error: new Error('Historia no encontrada') };
=======
            return { success: false, error: new Error('Story not found') };
>>>>>>> origin/main
        }

        // Map database data to Story format
        let characters: StoryCharacter[] = [];
        
        if (data.characters_data && Array.isArray(data.characters_data)) {
            // New format: characters_data contains the complete array
            characters = data.characters_data.map((char: any) => ({
                id: char.id,
                name: char.name,
                gender: char.gender,
                description: char.description || '',
                created_at: char.created_at,
                updated_at: char.updated_at,
                is_preset: char.is_preset || false
            }));
            console.log(`🔍 DEBUG - Using characters_data: ${characters.length} characters`);
        } else if (data.characters) {
            // Legacy format: single character from relationship
            const characterData = data.characters;
            characters = [{
                id: characterData.id || 'deleted_character',
                name: characterData.name || 'Personaje Eliminado',
                gender: characterData.gender || 'non-binary',
                description: characterData.description || '',
                created_at: characterData.created_at,
                updated_at: characterData.updated_at,
                is_preset: false
            }];
            console.log(`🔍 DEBUG - Using legacy character relationship`);
        } else {
            // No character data available
            console.warn(`🔍 DEBUG - No character data found for story ${storyId}`);
            characters = [{
                id: 'deleted_character',
                name: 'Personaje Eliminado',
                gender: 'non-binary',
                description: 'Este personaje ya no está disponible',
                is_preset: false
            }];
        }

        const story: Story = {
            id: data.id,
            title: data.title || "Historia sin título",
            content: data.content,
            audioUrl: data.audio_url,
            options: {
                genre: data.genre,
                format: data.story_format,
                characters: characters,
                spiciness_level: data.spiciness_level || 2
            },
            createdAt: data.created_at,
            additional_details: data.additional_details,
            characters_data: characters // Include in the Story object for consistency
        };

<<<<<<< HEAD
        console.log(`🔍 DEBUG - Historia cargada exitosamente: "${story.title}"`);
=======
        console.log(`🔍 DEBUG - Story loaded successfully: "${story.title}"`);
>>>>>>> origin/main
        return { success: true, story };
    } catch (error) {
        console.error("Fallo general en getStoryDirectly:", error);
        return { success: false, error };
    }
};

/**
 * Direct chapters loading without Zustand store dependency
 * Replaces useChaptersStore().getChaptersByStoryId() functionality
 */
export const getChaptersDirectly = async (storyId: string): Promise<{ success: boolean; chapters?: StoryChapter[]; error?: any }> => {
    try {
        console.log(`🔍 DEBUG - Loading chapters directly for story: ${storyId}`);
        
        const { data, error } = await supabase
            .from("story_chapters")
            .select("*")
            .eq("story_id", storyId)
            .order('chapter_number', { ascending: true });

        if (error) {
            console.error(`Error loading chapters for story ${storyId}:`, error);
            throw error;
        }

        const chapters: StoryChapter[] = data ? data.map((chapter) => ({
            id: chapter.id,
            chapterNumber: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            createdAt: chapter.created_at,
            generationMethod: chapter.generation_method,
            customInput: chapter.custom_input,
        })) : [];

        console.log(`🔍 DEBUG - Loaded ${chapters.length} chapters for story ${storyId}`);
        return { success: true, chapters };
    } catch (error) {
        console.error("Fallo general en getChaptersDirectly:", error);
        return { success: false, error };
    }
};

export const syncStory = async (userId: string, story: Story): Promise<{ success: boolean; error?: any }> => {
    try {
        console.log(`Sincronizando historia ${story.id} para usuario ${userId}`);
        
        // Only set character_id if the primary character is user-created (not preset)
        const primaryCharacter = story.options.characters[0];
        const characterId = primaryCharacter && !primaryCharacter.is_preset ? primaryCharacter.id : null;
        
        console.log(`🔍 DEBUG - Primary character: ${primaryCharacter?.name} (preset: ${primaryCharacter?.is_preset})`);
        console.log(`🔍 DEBUG - Setting character_id to: ${characterId}`);
        
        const storyData = {
            id: story.id,
            user_id: userId,
            title: story.title,
            content: story.content,
            audio_url: story.audioUrl,
            genre: story.options.genre,
            story_format: story.options.format,
            character_id: characterId, // Only user-created characters, null for preset characters
            characters_data: story.characters_data || story.options.characters, // Complete character array
            additional_details: story.additional_details,
            updated_at: new Date(),
        };
        
        console.log(`🔍 DEBUG - Story data being synced:`, {
            id: storyData.id,
            character_id: storyData.character_id,
            characters_count: Array.isArray(storyData.characters_data) ? storyData.characters_data.length : 0
        });
        
        const { error } = await supabase.from("stories").upsert(storyData);
        if (error) {
            console.error(`Error al sincronizar historia ${story.id} (RLS?):`, error);
            throw error;
        }
        console.log(`Historia ${story.id} sincronizada exitosamente.`);
        return { success: true };
    } catch (error) {
        console.error("Fallo general en syncStory:", error);
        return { success: false, error };
    }
};

export const getUserStories = async (userId: string): Promise<{ success: boolean; stories?: Story[]; error?: any }> => {
    try {
        console.log(`Buscando historias para usuario ${userId}`);
        const { data, error } = await supabase
            .from("stories")
            .select(`*, characters (*)`)
            .eq("user_id", userId)
            .order('created_at', { ascending: false }); // Ordenar por más reciente

        if (error) {
            console.error("Error obteniendo historias (RLS?):", error);
            throw error;
        }

        const stories: Story[] = data ? data.map((story) => {
            console.log(`[getUserStories_DEBUG] DB raw title for story ${story.id}: "${story.title}"`);

            // Use characters_data if available (new format), otherwise fallback to character relationship (legacy)
            let characters: StoryCharacter[] = [];
            
            if (story.characters_data && Array.isArray(story.characters_data)) {
                // New format: characters_data contains the complete array
                characters = story.characters_data.map((char: any) => ({
                    id: char.id,
                    name: char.name,
                    gender: char.gender,
                    description: char.description || '',
                    created_at: char.created_at,
                    updated_at: char.updated_at,
                    is_preset: char.is_preset || false
                }));
                console.log(`[getUserStories_DEBUG] Using characters_data: ${characters.length} characters`);
            } else if (story.characters) {
                // Legacy format: single character from relationship
                const characterData = story.characters;
                characters = [{
                    id: characterData.id || 'deleted_character',
                    name: characterData.name || 'Personaje Eliminado',
                    gender: characterData.gender || 'non-binary',
                    description: characterData.description || '',
                    created_at: characterData.created_at,
                    updated_at: characterData.updated_at,
                    is_preset: false
                }];
                console.log(`[getUserStories_DEBUG] Using legacy character relationship`);
            } else {
                // No character data available
                console.warn(`[getUserStories_DEBUG] No character data found for story ${story.id}`);
                characters = [{
                    id: 'deleted_character',
                    name: 'Personaje Eliminado',
                    gender: 'non-binary',
                    description: 'Este personaje ya no está disponible',
                    is_preset: false
                }];
            }

            return {
                id: story.id,
                title: story.title || "Historia sin título",
                content: story.content,
                audioUrl: story.audio_url,
                options: {
                    genre: story.genre,
                    format: story.story_format,
                    characters: characters,
                    spiciness_level: story.spiciness_level || 2
                },
                createdAt: story.created_at,
                additional_details: story.additional_details,
                characters_data: characters // Include in the Story object for consistency
            };
        }) : [];

        console.log(`Encontradas ${stories.length} historias`);
        return { success: true, stories: stories };
    } catch (error) {
        console.error("Fallo general en getUserStories:", error);
        return { success: false, error };
    }
};

/**
 * Obtiene el número de capítulos existentes para una historia específica.
 */
export const getChapterCountForStory = async (storyId: string): Promise<{ count: number; error: Error | null }> => {
    try {
        const { count, error } = await supabase
            .from('story_chapters')
            .select('*', { count: 'exact', head: true }) // Solo necesitamos el conteo
            .eq('story_id', storyId);

        if (error) {
            console.error('Error al contar capítulos:', error);
            return { count: 0, error };
        }

        return { count: count ?? 0, error: null }; // Devuelve 0 si count es null

    } catch (error: any) {
        console.error('Error inesperado al contar capítulos:', error);
        return { count: 0, error };
    }
};

// --- Funciones para Capítulos ---

export const syncChapter = async (chapter: StoryChapter, storyId: string): Promise<{ success: boolean; error?: any }> => {
    console.log("🚀 ~ syncChapter ~ chapter:", chapter)
    try {
        // Generate ID if chapter doesn't have one
        const chapterId = chapter.id || generateId("chapter");
        
        const { error } = await supabase
            .from("story_chapters")
            .upsert({
                id: chapterId,
                story_id: storyId,
                chapter_number: chapter.chapterNumber,
                title: chapter.title,
                content: chapter.content,
                generation_method: chapter.generationMethod,
                custom_input: chapter.customInput,
                updated_at: new Date(),
            });
        if (error) {
            console.error("Error sincronizando capítulo (RLS/FK?):", error);
            throw error;
        }
        return { success: true };
    } catch (error) {
        console.error("Fallo general en syncChapter:", error);
        return { success: false, error };
    }
};

export const getStoryChapters = async (storyId: string): Promise<{ success: boolean; chapters?: StoryChapter[]; error?: any }> => {
    try {
        const { data, error } = await supabase
            .from("story_chapters")
            .select("*")
            .eq("story_id", storyId)
            .order('chapter_number', { ascending: true });

        if (error) {
            console.error("Error obteniendo capítulos (RLS/FK?):", error);
            throw error;
        }
        const chapters: StoryChapter[] = data ? data.map((chapter) => ({
            id: chapter.id,
            chapterNumber: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            createdAt: chapter.created_at,
            generationMethod: chapter.generation_method,
            customInput: chapter.custom_input,
        })) : [];
        return { success: true, chapters: chapters };
    } catch (error) {
        console.error("Fallo general en getStoryChapters:", error);
        return { success: false, error };
    }
};

// --- Funciones para Archivos de Audio ---

export const syncAudioFile = async (
    userId: string,
    storyId: string,
    chapterId: string | number,
    voiceId: string,
    audioUrl: string,
): Promise<{ success: boolean; error?: any }> => {
    try {
        const { error } = await supabase
            .from("audio_files")
            .upsert({
                user_id: userId,
                story_id: storyId,
                chapter_id: chapterId,
                voice_id: voiceId,
                url: audioUrl,
            });
        if (error) {
            console.error("Error sincronizando archivo de audio (RLS/FK?):", error);
            throw error;
        }
        return { success: true };
    } catch (error) {
        console.error("Fallo general en syncAudioFile:", error);
        return { success: false, error };
    }
};

export const getUserAudios = async (userId: string): Promise<{ success: boolean; audios?: any[]; error?: any }> => { // Ajustar tipo 'audios' si tienes uno específico
    try {
        const { data, error } = await supabase
            .from("audio_files")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error obteniendo archivos de audio (RLS?):", error);
            throw error;
        }
        const audios = data || [];
        return { success: true, audios: audios };
    } catch (error) {
        console.error("Fallo general en getUserAudios:", error);
        return { success: false, error };
    }
};

// --- Funciones para Preferencias de Voz ---

export const setCurrentVoice = async (userId: string, voiceId: string): Promise<{ success: boolean; error?: any }> => {
    try {
        // Paso 1: Resetear la voz actual
        await supabase
            .from("user_voices")
            .update({ is_current: false })
            .eq("user_id", userId)
            .eq("is_current", true);

        // Paso 2: Establecer la nueva voz actual
        const { error } = await supabase
            .from("user_voices")
            .upsert({
                user_id: userId,
                voice_id: voiceId,
                is_current: true,
                updated_at: new Date(),
            });
        if (error) {
            console.error("Error en upsert de voz actual (RLS?):", error);
            throw error;
        }
        return { success: true };
    } catch (error) {
        console.error("Fallo general en setCurrentVoice:", error);
        return { success: false, error };
    }
};

export const getCurrentVoice = async (userId: string): Promise<{ success: boolean; voiceId?: string | null; error?: any }> => {
    try {
        const { data, error } = await supabase
            .from("user_voices")
            .select("voice_id")
            .eq("user_id", userId)
            .eq("is_current", true)
            .maybeSingle();

        if (error) {
            console.error("Error obteniendo voz actual (RLS?):", error);
            throw error;
        }
        return { success: true, voiceId: data?.voice_id || null };
    } catch (error) {
        console.error("Fallo general en getCurrentVoice:", error);
        return { success: false, error };
    }
};


// --- Servicio de Cola de Sincronización ---
// (Se mantiene la versión mejorada con re-encolado)
interface SyncQueueItem {
    table: string;
    operation: "insert" | "update" | "delete";
    data: any;
    timestamp: number;
}

class SyncQueueService {
    private static instance: SyncQueueService;
    private queue: SyncQueueItem[] = [];
    private isProcessing = false;
    private readonly STORAGE_KEY = "sync_queue";

    private constructor() {
        this.loadQueue();
        if (typeof window !== "undefined" && !window.hasOwnProperty('_syncQueueListenerAdded')) {
            window.addEventListener("online", () => this.processQueue());
            (window as any)._syncQueueListenerAdded = true;
        }
    }

    static getInstance(): SyncQueueService {
        if (!SyncQueueService.instance) {
            SyncQueueService.instance = new SyncQueueService();
        }
        return SyncQueueService.instance;
    }

    private loadQueue() {
        if (typeof localStorage === 'undefined') return;
        try {
            const savedQueue = localStorage.getItem(this.STORAGE_KEY);
            if (savedQueue) {
                this.queue = JSON.parse(savedQueue);
                console.log(`Cola de sincronización cargada con ${this.queue.length} elementos.`);
            }
        } catch (error) {
            console.error("Error cargando cola de sincronización:", error);
            this.queue = [];
        }
    }

    private saveQueue() {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error("Error guardando cola de sincronización:", error);
        }
    }

    addToQueue(table: string, operation: "insert" | "update" | "delete", data: any,) {
        console.log(`Añadiendo a cola: ${operation} en ${table}`, data);
        this.queue.push({ table, operation, data, timestamp: Date.now() });
        this.saveQueue();
        if (typeof navigator !== 'undefined' && navigator.onLine) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            if (this.isProcessing) console.log("Cola ya en proceso.");
            return;
        }
        console.log(`Procesando cola: ${this.queue.length} elementos.`);
        this.isProcessing = true;
        const itemsToProcess = [...this.queue];
        this.queue = [];
        this.saveQueue();
        const failedItems: SyncQueueItem[] = [];

        try {
            for (const item of itemsToProcess) {
                let success = false;
                console.log(`Procesando: ${item.operation} en ${item.table}`); // No loguear item.data por defecto (puede ser grande)
                try {
                    let operationError = null;
                    switch (item.operation) {
                        case "insert":
                        case "update":
                            const { error } = await supabase.from(item.table).upsert(item.data);
                            operationError = error;
                            break;
                        case "delete":
                            if (!item.data?.id) {
                                console.error("Datos para DELETE sin ID:", item);
                                operationError = new Error("Datos para DELETE sin ID");
                                break;
                            }
                            const { error: deleteError } = await supabase.from(item.table).delete().eq("id", item.data.id);
                            operationError = deleteError;
                            break;
                    }
                    if (operationError) {
                        console.error(`Error procesando item [${item.operation} ${item.table}]:`, operationError);
                    } else {
                        console.log(`Item procesado: ${item.operation} ${item.table}`);
                        success = true;
                    }
                } catch (processingError) {
                    console.error(`Error inesperado procesando item:`, processingError);
                }
                if (!success) failedItems.push(item);
            }
        } finally {
            if (failedItems.length > 0) {
                console.warn(`Re-encolando ${failedItems.length} elementos fallidos.`);
                this.queue = [...failedItems, ...this.queue];
                this.saveQueue();
            }
            console.log(`Procesamiento de cola finalizado. Pendientes: ${this.queue.length}`);
            this.isProcessing = false;
        }
    }
    getQueueLength(): number { return this.queue.length; }
}

export const syncQueue = SyncQueueService.getInstance();