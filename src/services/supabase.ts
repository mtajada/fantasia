import { createClient } from "@supabase/supabase-js";
import {
    Challenge,
    ChallengeQuestion,
    ProfileSettings,
    Story,
    StoryChapter,
    StoryCharacter,
} from "../types";

// Inicializar cliente de Supabase (asegúrate de tener estas variables en tu .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Variable para rastrear el usuario actualmente autenticado
let currentAuthenticatedUserId: string | null = null;

// Agregar listener para eventos de autenticación
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        currentAuthenticatedUserId = session?.user?.id || null;
        console.log('ID de usuario actualizado:', currentAuthenticatedUserId);
    } else if (event === 'SIGNED_OUT') {
        currentAuthenticatedUserId = null;
        console.log('Usuario desconectado, ID reseteado');
    }
});

// Función auxiliar para validar que el ID de usuario coincida con el autenticado
const validateUserId = async (providedUserId: string): Promise<boolean> => {
    // Si hay incongruencia, refrescar la sesión para asegurar que tenemos el ID correcto
    if (currentAuthenticatedUserId !== providedUserId) {
        console.warn(`Posible incongruencia de ID de usuario. Proporcionado: ${providedUserId}, Actual: ${currentAuthenticatedUserId}`);
        
        try {
            // Intentar refrescar la sesión para obtener el ID correcto
            const { data } = await supabase.auth.getSession();
            const authUser = data.session?.user;
            
            if (authUser) {
                currentAuthenticatedUserId = authUser.id;
                console.log('ID de usuario actualizado tras verificación:', currentAuthenticatedUserId);
                
                // Verificar si el ID proporcionado coincide con el ID actualizado
                if (currentAuthenticatedUserId !== providedUserId) {
                    console.error('Error de seguridad: El ID proporcionado no coincide con el usuario autenticado');
                    return false;
                }
                return true;
            } else {
                console.error('Error de autenticación: No hay usuario autenticado');
                return false;
            }
        } catch (error) {
            console.error('Error al verificar la sesión:', error);
            return false;
        }
    }
    
    return true;
};

// Funciones para sincronizar datos de usuario
export const syncUserProfile = async (
    userId: string,
    profileSettings: ProfileSettings,
) => {
    try {
        // Validar que el ID de usuario sea consistente
        const isValidUserId = await validateUserId(userId);
        if (!isValidUserId) {
            return { success: false, error: new Error('ID de usuario no válido') };
        }
        
        const { error } = await supabase
            .from("profiles")
            .upsert({
                id: userId,
                language: profileSettings.language,
                child_age: profileSettings.childAge,
                age_range: profileSettings.ageRange,
                special_need: profileSettings.specialNeed,
                updated_at: new Date(),
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error sincronizando perfil:", error);
        return { success: false, error };
    }
};

export const getUserProfile = async (userId: string) => {
    try {
        console.log(`Solicitando perfil para usuario: ${userId}`);
        
        // Validar que el ID de usuario sea consistente
        const isValidUserId = await validateUserId(userId);
        if (!isValidUserId) {
            console.error(`Error de validación: El ID proporcionado (${userId}) no coincide con el usuario autenticado`);
            return { success: false, error: new Error('ID de usuario no válido') };
        }
        
        // Refrescar la sesión para asegurar que estamos usando el token más reciente
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Estado de sesión:", sessionData.session ? "Activa" : "Inactiva");
        
        // Realizar la consulta con la sesión actualizada
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error(`Error al obtener perfil para ${userId}:`, error);
            throw error;
        }

        console.log(`Datos de perfil recibidos para ${userId}:`, data);

        if (data) {
            return {
                success: true,
                profile: {
                    language: data.language,
                    childAge: data.child_age,
                    ageRange: data.age_range,
                    specialNeed: data.special_need,
                } as ProfileSettings,
            };
        }
        
        console.log(`No se encontró perfil para usuario ${userId}`);
        return { success: false };
    } catch (error) {
        console.error(`Error obteniendo perfil para ${userId}:`, error);
        return { success: false, error };
    }
};

// Funciones para gestionar personajes
export const syncCharacter = async (
    userId: string,
    character: StoryCharacter,
) => {
    try {
        console.log(`[DEBUG] Sincronizando personaje "${character.name}" (ID: ${character.id}) para usuario ${userId}`);
        
        // Validar que el ID de usuario sea consistente
        const isValidUserId = await validateUserId(userId);
        if (!isValidUserId) {
            console.error('[DEBUG] ID de usuario no válido para sincronizar personaje');
            return { success: false, error: new Error('ID de usuario no válido para sincronizar personaje') };
        }
        
        // Verificar si ya existe un personaje con ese ID
        const { data: existingChar, error: existingError } = await supabase
            .from("characters")
            .select("id, name, user_id")
            .eq("id", character.id)
            .maybeSingle();
            
        if (existingError) {
            console.error(`[DEBUG] Error al verificar si existe el personaje:`, existingError);
        }
        
        // Preparar datos para guardar
        const characterData = {
            id: character.id,
            user_id: userId,
            name: character.name,
            hobbies: character.hobbies,
            description: character.description,
            profession: character.profession,
            character_type: character.characterType,
            personality: character.personality,
            updated_at: new Date(),
        };
        
        console.log(`[DEBUG] Datos a enviar a Supabase:`, JSON.stringify(characterData, null, 2));
        
        let result;
        
        // Si el personaje ya existe, actualizarlo; si no, insertarlo como nuevo
        if (existingChar) {
            console.log(`[DEBUG] Personaje con ID ${character.id} ya existe. Actualizando.`);
            
            // Si el personaje pertenece a otro usuario, no permitir sobreescribirlo
            if (existingChar.user_id !== userId) {
                console.error(`[DEBUG] ¡Error de seguridad! Intento de modificar personaje de otro usuario. ID: ${character.id}`);
                return { success: false, error: new Error('No tienes permiso para modificar este personaje') };
            }
            
            // Actualizar el personaje existente
            result = await supabase
                .from("characters")
                .update(characterData)
                .eq("id", character.id)
                .eq("user_id", userId);
        } else {
            console.log(`[DEBUG] Creando nuevo personaje con ID: ${character.id}`);
            
            // Insertar nuevo personaje
            result = await supabase
                .from("characters")
                .insert(characterData);
        }
        
        const { error } = result;
        
        if (error) {
            console.error(`[DEBUG] Error en operación de personaje:`, error);
            throw error;
        }
        
        console.log(`[DEBUG] Personaje "${character.name}" guardado exitosamente en Supabase`);
        return { success: true };
    } catch (error) {
        console.error("[DEBUG] Error sincronizando personaje:", error);
        return { success: false, error };
    }
};

export const getUserCharacters = async (userId: string) => {
    try {
        console.log(`[DEBUG] Iniciando getUserCharacters para usuario ${userId}`);
        
        // Validar que el ID de usuario sea consistente
        const isValidUserId = await validateUserId(userId);
        if (!isValidUserId) {
            console.error(`[DEBUG] ID de usuario no válido en getUserCharacters: ${userId}`);
            return { success: false, error: new Error('ID de usuario no válido') };
        }
        
        // Hacer una consulta sin filtrar primero para ver cuántos personajes hay en total
        const { data: allCharacters, error: allError } = await supabase
            .from("characters")
            .select("id, name, user_id");
            
        if (allError) {
            console.error(`[DEBUG] Error al consultar todos los personajes:`, allError);
        } else {
            console.log(`[DEBUG] Total de personajes en la base de datos: ${allCharacters?.length || 0}`);
            if (allCharacters) {
                const filteredChars = allCharacters.filter(c => c.user_id === userId);
                console.log(`[DEBUG] Personajes con user_id=${userId}: ${filteredChars.length}`);
                console.log(`[DEBUG] IDs de personajes del usuario: ${filteredChars.map(c => c.name + ` (${c.id})`).join(', ')}`);
            }
        }
        
        // Ahora hacer la consulta real
        console.log(`[DEBUG] Consultando personajes para usuario ${userId}`);
        const { data, error } = await supabase
            .from("characters")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error(`[DEBUG] Error en consulta filtrada:`, error);
            throw error;
        }

        console.log(`[DEBUG] Personajes encontrados en la consulta filtrada: ${data?.length || 0}`);
        if (data) {
            console.log(`[DEBUG] Nombres de personajes encontrados: ${data.map(c => c.name).join(', ')}`);
            return {
                success: true,
                characters: data.map((char) => ({
                    id: char.id,
                    name: char.name,
                    hobbies: char.hobbies || [],
                    description: char.description || '',
                    profession: char.profession || '',
                    characterType: char.character_type || '',
                    personality: char.personality || '',
                } as StoryCharacter)),
            };
        }
        return { success: false };
    } catch (error) {
        console.error("Error obteniendo personajes:", error);
        return { success: false, error };
    }
};

export const deleteCharacter = async (characterId: string) => {
    try {
        // Verificar que el personaje pertenezca al usuario autenticado
        const { data: userData } = await supabase.auth.getSession();
        const userId = userData.session?.user?.id;
        
        if (!userId) {
            return { success: false, error: new Error('No hay usuario autenticado para eliminar personaje') };
        }
        
        // Verificar primero que el personaje pertenece al usuario actual
        const { data: characterData, error: queryError } = await supabase
            .from("characters")
            .select("user_id")
            .eq("id", characterId)
            .single();
            
        if (queryError) {
            console.error("Error verificando propiedad del personaje:", queryError);
            return { success: false, error: queryError };
        }
        
        if (!characterData || characterData.user_id !== userId) {
            console.error("Error de seguridad: Intento de eliminar personaje de otro usuario");
            return { success: false, error: new Error('No tienes permiso para eliminar este personaje') };
        }
        
        // Ahora sí eliminar el personaje
        const { error } = await supabase
            .from("characters")
            .delete()
            .eq("id", characterId)
            .eq("user_id", userId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error eliminando personaje:", error);
        return { success: false, error };
    }
};

// Funciones para gestionar historias
export const syncStory = async (userId: string, story: Story) => {
    try {
        console.log(
            `Intentando sincronizar historia ${story.id} para usuario ${userId}`,
        );

        // Validar que el ID de usuario sea consistente
        const isValidUserId = await validateUserId(userId);
        if (!isValidUserId) {
            return { success: false, error: new Error('ID de usuario no válido para sincronizar historia') };
        }

        const storyData = {
            id: story.id,
            user_id: userId,
            title: story.title,
            content: story.content,
            audio_url: story.audioUrl,
            image_url: story.imageUrl,
            moral: story.options.moral,
            genre: story.options.genre,
            duration: story.options.duration,
            character_id: story.options.character.id,
            updated_at: new Date(),
        };

        console.log(`Datos a sincronizar:`, JSON.stringify(storyData, null, 2));

        const { error } = await supabase
            .from("stories")
            .upsert(storyData);

        if (error) {
            console.error(`Error al sincronizar historia ${story.id}:`, error);
            throw error;
        }

        console.log(`Historia ${story.id} sincronizada exitosamente`);
        return { success: true };
    } catch (error) {
        console.error("Error sincronizando historia:", error);
        return { success: false, error };
    }
};

export const getUserStories = async (userId: string) => {
    try {
        // Verificar que el ID de usuario corresponda al autenticado
        const { data: sessionData } = await supabase.auth.getSession();
        const authUserId = sessionData?.session?.user?.id;
        
        if (!authUserId || authUserId !== userId) {
            console.error("Error de seguridad: ID de usuario no coincide");
            return { success: false, error: new Error("ID de usuario inválido") };
        }
        
        console.log(`Buscando historias para usuario ${userId}`);
        const { data, error } = await supabase
            .from("stories")
            .select(`
        *,
        characters (*)
      `)
            .eq("user_id", userId);

        if (error) throw error;

        if (data) {
            console.log(`Encontradas ${data?.length || 0} historias`);
            return {
                success: true,
                stories: data.map((story) => {
                    // Verificar si el personaje existe
                    const characterData = story.characters || {};
                    
                    return {
                        id: story.id,
                        title: story.title,
                        content: story.content,
                        audioUrl: story.audio_url,
                        imageUrl: story.image_url,
                        options: {
                            moral: story.moral,
                            genre: story.genre,
                            duration: story.duration,
                            character: {
                                id: characterData.id || 'unknown',
                                name: characterData.name || 'Personaje desconocido',
                                hobbies: characterData.hobbies || '',
                                description: characterData.description || '',
                                profession: characterData.profession || '',
                                characterType: characterData.character_type || 'other',
                                personality: characterData.personality || '',
                            },
                        },
                        createdAt: story.created_at,
                    };
                }),
            };
        }
        return { success: false };
    } catch (error) {
        console.error("Error obteniendo historias:", error);
        return { success: false, error };
    }
};

// Funciones para gestionar capítulos
export const syncChapter = async (chapter: StoryChapter, storyId: string) => {
    try {
        const { error } = await supabase
            .from("story_chapters")
            .upsert({
                story_id: storyId,
                chapter_number: chapter.chapterNumber,
                title: chapter.title,
                content: chapter.content,
                generation_method: chapter.generationMethod,
                custom_input: chapter.customInput,
                updated_at: new Date(),
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error sincronizando capítulo:", error);
        return { success: false, error };
    }
};

export const getStoryChapters = async (storyId: string) => {
    try {
        const { data, error } = await supabase
            .from("story_chapters")
            .select("*")
            .eq("story_id", storyId);

        if (error) throw error;

        if (data) {
            return {
                success: true,
                chapters: data.map((chapter) => ({
                    chapterNumber: chapter.chapter_number,
                    title: chapter.title,
                    content: chapter.content,
                    createdAt: chapter.created_at,
                    generationMethod: chapter.generation_method,
                    customInput: chapter.custom_input,
                } as StoryChapter)),
            };
        }
        return { success: false };
    } catch (error) {
        console.error("Error obteniendo capítulos:", error);
        return { success: false, error };
    }
};

// Funciones para gestionar desafíos
export const syncChallenge = async (challenge: Challenge) => {
    try {
        // Primero crear o actualizar el desafío
        const { data, error } = await supabase
            .from("challenges")
            .upsert({
                id: challenge.id,
                story_id: challenge.storyId,
                created_at: challenge.createdAt,
            })
            .select("id");

        if (error) throw error;

        // Luego crear o actualizar las preguntas
        if (data && data[0]) {
            const challengeId = data[0].id;

            for (const question of challenge.questions) {
                const { error: questionError } = await supabase
                    .from("challenge_questions")
                    .upsert({
                        id: question.id,
                        challenge_id: challengeId,
                        question: question.question,
                        options: question.options,
                        correct_option_index: question.correctOptionIndex,
                        explanation: question.explanation,
                        category: question.category,
                        target_language: question.targetLanguage,
                    });

                if (questionError) throw questionError;
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error sincronizando desafío:", error);
        return { success: false, error };
    }
};

export const getStoryChallenges = async (storyId: string) => {
    try {
        // Obtener desafíos
        const { data: challengesData, error: challengesError } = await supabase
            .from("challenges")
            .select("*")
            .eq("story_id", storyId);

        if (challengesError) throw challengesError;

        const challenges: Challenge[] = [];

        if (challengesData) {
            for (const challenge of challengesData) {
                // Obtener preguntas para cada desafío
                const { data: questionsData, error: questionsError } =
                    await supabase
                        .from("challenge_questions")
                        .select("*")
                        .eq("challenge_id", challenge.id);

                if (questionsError) throw questionsError;

                if (questionsData) {
                    challenges.push({
                        id: challenge.id,
                        storyId: challenge.story_id,
                        createdAt: challenge.created_at,
                        questions: questionsData.map((q) => ({
                            id: q.id,
                            question: q.question,
                            options: q.options,
                            correctOptionIndex: q.correct_option_index,
                            explanation: q.explanation,
                            category: q.category,
                            targetLanguage: q.target_language,
                        } as ChallengeQuestion)),
                    });
                }
            }
        }

        return { success: true, challenges };
    } catch (error) {
        console.error("Error obteniendo desafíos:", error);
        return { success: false, error };
    }
};

// Funciones para gestionar archivos de audio
export const syncAudioFile = async (
    userId: string,
    storyId: string,
    chapterId: string | number,
    voiceId: string,
    audioUrl: string,
) => {
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

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error sincronizando archivo de audio:", error);
        return { success: false, error };
    }
};

export const getUserAudios = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from("audio_files")
            .select("*")
            .eq("user_id", userId);

        if (error) throw error;

        if (data) {
            return {
                success: true,
                audios: data.map((audio) => ({
                    storyId: audio.story_id,
                    chapterId: audio.chapter_id,
                    voiceId: audio.voice_id,
                    url: audio.url,
                })),
            };
        }
        return { success: false };
    } catch (error) {
        console.error("Error obteniendo archivos de audio:", error);
        return { success: false, error };
    }
};

// Funciones para gestionar preferencias de voz
export const setCurrentVoice = async (userId: string, voiceId: string) => {
    try {
        // Primero resetear la voz actual
        await supabase
            .from("user_voices")
            .update({ is_current: false })
            .eq("user_id", userId);

        // Crear o actualizar la voz seleccionada
        const { error } = await supabase
            .from("user_voices")
            .upsert({
                user_id: userId,
                voice_id: voiceId,
                is_current: true,
                updated_at: new Date(),
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error configurando voz actual:", error);
        return { success: false, error };
    }
};

export const getCurrentVoice = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from("user_voices")
            .select("voice_id")
            .eq("user_id", userId)
            .eq("is_current", true)
            .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 es el código para "no se encontraron resultados"

        return {
            success: true,
            voiceId: data?.voice_id || null,
        };
    } catch (error) {
        console.error("Error obteniendo voz actual:", error);
        return { success: false, error };
    }
};

// Servicio de cola de sincronización para operaciones offline
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
        // Cargar cola desde localStorage al inicializar
        this.loadQueue();

        // Agregar listeners para detectar cuando hay conexión
        window.addEventListener("online", () => this.processQueue());
    }

    static getInstance(): SyncQueueService {
        if (!SyncQueueService.instance) {
            SyncQueueService.instance = new SyncQueueService();
        }
        return SyncQueueService.instance;
    }

    private loadQueue() {
        try {
            const savedQueue = localStorage.getItem(this.STORAGE_KEY);
            if (savedQueue) {
                this.queue = JSON.parse(savedQueue);
            }
        } catch (error) {
            console.error("Error cargando cola de sincronización:", error);
        }
    }

    private saveQueue() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error("Error guardando cola de sincronización:", error);
        }
    }

    addToQueue(
        table: string,
        operation: "insert" | "update" | "delete",
        data: any,
    ) {
        this.queue.push({
            table,
            operation,
            data,
            timestamp: Date.now(),
        });
        this.saveQueue();

        // Intentar procesar inmediatamente si hay conexión
        if (navigator.onLine) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
            return;
        }

        console.log(
            `Procesando cola de sincronización: ${this.queue.length} elementos pendientes`,
        );
        this.isProcessing = true;

        try {
            // Procesar elementos en orden FIFO
            const itemsToProcess = [...this.queue];
            const successfulItems: number[] = [];

            for (let i = 0; i < itemsToProcess.length; i++) {
                const item = itemsToProcess[i];
                let success = false;

                console.log(
                    `Procesando ítem ${i}: ${item.operation} en tabla ${item.table}`,
                );
                console.log(`Datos:`, JSON.stringify(item.data, null, 2));

                try {
                    switch (item.operation) {
                        case "insert":
                        case "update":
                            const { error } = await supabase
                                .from(item.table)
                                .upsert(item.data);

                            if (error) {
                                console.error(
                                    `Error al procesar ${item.operation} en ${item.table}:`,
                                    error,
                                );
                            } else {
                                console.log(
                                    `Operación ${item.operation} en ${item.table} exitosa`,
                                );
                                success = true;
                            }
                            break;

                        case "delete":
                            const { error: deleteError } = await supabase
                                .from(item.table)
                                .delete()
                                .eq("id", item.data.id);

                            if (deleteError) {
                                console.error(
                                    `Error al eliminar en ${item.table}:`,
                                    deleteError,
                                );
                            } else {
                                console.log(
                                    `Eliminación en ${item.table} exitosa`,
                                );
                                success = true;
                            }
                            break;
                    }

                    if (success) {
                        successfulItems.push(i);
                    }
                } catch (error) {
                    console.error(
                        `Error procesando item ${i} de la cola:`,
                        error,
                    );
                }
            }

            // Eliminar elementos procesados exitosamente
            this.queue = this.queue.filter((_, index) =>
                !successfulItems.includes(index)
            );
            this.saveQueue();

            console.log(
                `Cola procesada. Elementos restantes: ${this.queue.length}`,
            );
        } finally {
            this.isProcessing = false;
        }
    }

    getQueueLength(): number {
        return this.queue.length;
    }
}

export const syncQueue = SyncQueueService.getInstance();
