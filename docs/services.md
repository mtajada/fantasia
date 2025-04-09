Guía Completa de la Carpeta @src/services
Versión: 1.0
Fecha: 2024-07-25
Destinatario: Agente de Código (Windsurf), Desarrolladores

1. Propósito General
La carpeta @src/services actúa como una capa de abstracción crucial entre la lógica del frontend (componentes de UI en @/pages, @/components, y manejo de estado en @/store) y el backend (Supabase). Sus responsabilidades principales son:

Invocar Edge Functions (EFs): Proporcionar métodos claros y específicos que llaman a las Supabase Edge Functions para tareas que requieren lógica del lado del servidor, acceso a APIs externas con claves secretas (IA, Stripe), o cómputo intensivo.
Interactuar con la Base de Datos Supabase: Centralizar las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) directas con las tablas de la base de datos Supabase, encapsulando las llamadas al cliente supabase.
Orquestar Procesos de Sincronización: Gestionar la lógica inicial de carga de datos y la sincronización al detectar cambios de conectividad.
Manejar Lógica Específica de Terceros (Frontend): Contener inicialización o utilidades relacionadas con librerías de terceros que se ejecutan en el cliente (como cargar Stripe.js).
2. Principios de Diseño y Arquitectura
Separación de Responsabilidades: Mantiene la lógica de comunicación con el backend separada de la UI y el estado global.
Seguridad: NO CONTIENE claves API secretas (OpenAI, Gemini, Stripe Secret Key). Estas claves residen de forma segura en los secretos de Supabase y solo son accedidas por las Edge Functions. Los servicios aquí usan el token de autenticación de Supabase para invocar las EFs.
Patrón Wrapper para EFs: Servicios como ChallengeService, GenerateStoryService, StoryContinuationService, ttsService, y stripeService actúan principalmente como wrappers delgados. Reciben datos del frontend, llaman a la EF correspondiente vía supabase.functions.invoke(), y devuelven la respuesta. La lógica compleja reside en la EF.
Acceso Directo a DB (Controlado): supabase.ts realiza llamadas directas a la base de datos (supabase.from(...).select/insert/update/delete). La seguridad de estas operaciones depende fundamentalmente de las Políticas de Row Level Security (RLS) configuradas en Supabase.
Manejo de Errores: Implementa bloques try...catch y a menudo devuelve objetos con formato { success: boolean, data?: T, error?: any }.
Cliente Supabase Único: Todos los servicios importan y utilizan la instancia única del cliente Supabase inicializada en @src/supabaseClient.ts.
Sincronización Offline: supabase.ts integra una cola (SyncQueueService) para manejar operaciones de escritura fallidas cuando la aplicación está offline.
3. Desglose de Archivos
3.1. @src/services/ChallengeService.ts
Propósito: Wrapper para la Edge Function challenge. Maneja la generación y obtención de información sobre desafíos educativos.
Métodos Clave:
generateChallengeQuestion(story, category, profileSettings, targetLanguage): Llama a la EF (action: 'createChallenge') para generar una pregunta de desafío y extrae solo la pregunta de la respuesta. (Nota: Podría optimizarse en la EF si solo se necesita la pregunta).
createChallenge(story, category, profileSettings, targetLanguage): Llama a la EF (action: 'createChallenge') para generar un objeto Challenge completo (con ID de desafío y preguntas).
getAvailableLanguages(currentLanguage): Llama a la EF (action: 'getLanguages') para obtener la lista de idiomas disponibles para desafíos de traducción. Incluye un fallback en caso de error de la EF.
Dependencias: supabaseClient, EF challenge.
Interacción: Usado por componentes de UI como StoryViewer.tsx (para crear retos) y LanguageSelector.tsx (para listar idiomas).
Cuidado: Asegurarse de que los métodos sigan siendo wrappers delgados y no reintroduzcan lógica de prompts.
3.2. @src/services/GenerateStoryService.ts
Propósito: Wrapper para la Edge Function generate-story. Encargado de solicitar la generación de la historia inicial.
Métodos Clave:
generateStoryWithAI(params): Llama a la EF generate-story pasándole las opciones de configuración de la historia (personaje, género, etc.) y devuelve el contenido de la historia generada.
Dependencias: supabaseClient, EF generate-story.
Interacción: Usado principalmente por el store (@store/storyGenerator.ts) para iniciar la generación de una nueva historia.
Cuidado: Confirmar que no queda ninguna lógica de creación de prompts o generación de títulos (ya eliminada).
3.3. @src/services/StoryContinuationService.ts
Propósito: Wrapper para la Edge Function story-continuation. Maneja todas las formas de continuar una historia y la generación de títulos para capítulos.
Métodos Clave:
generateContinuationOptions(story, chapters): Llama a la EF (action: 'generateOptions') para obtener 3 posibles caminos para continuar.
generateFreeContinuation(story, chapters): Llama a la EF (action: 'freeContinuation') para generar una continuación sin una guía específica.
generateOptionContinuation(story, chapters, optionIndex): Llama a la EF (action: 'optionContinuation') para generar la continuación basada en una de las opciones elegidas.
generateDirectedContinuation(story, chapters, userDirection): Llama a la EF (action: 'directedContinuation') para generar la continuación basada en la entrada libre del usuario.
generateChapterTitle(content, language): Llama a la EF (action: 'generateTitle') para generar un título para un capítulo basado en su contenido y el idioma deseado. (Nota: Asegurarse de que el idioma se pasa correctamente desde donde se llama).
Dependencias: supabaseClient, EF story-continuation.
Interacción: Muy usado por @store/storyGenerator.ts y @/pages/StoryContinuation.tsx.
Cuidado: Asegurarse de que todos los métodos son wrappers limpios y que la lógica de prompts reside únicamente en la EF.
3.4. @src/services/ttsService.ts
Propósito: Wrapper para la Edge Function generate-audio y proveedor de utilidades/constantes relacionadas con Text-to-Speech para el frontend.
Métodos/Exportaciones Clave:
generateSpeech(options): Llama a la EF generate-audio pasándole el texto, voz, modelo e instrucciones para generar el audio. Devuelve un Blob de audio.
getAvailableVoices(): Devuelve una lista estática de voces disponibles (actualmente OPENAI_VOICES).
OPENAI_VOICES: Constante con la lista de voces de OpenAI y sus descripciones (usada por la UI).
OpenAIVoiceType: Tipo para las voces de OpenAI.
cleanTextForSpeech(text): Función de utilidad del frontend para limpiar/preparar el texto antes de enviarlo a la EF.
Dependencias: supabaseClient, EF generate-audio.
Interacción: Usado por componentes/páginas relacionados con la reproducción/configuración de audio (StoryAudioPage.tsx, AudioPlayer.tsx, VoiceSettings.tsx, etc.).
Cuidado: Asegurarse de que no contiene referencias a API Keys. Mantener OPENAI_VOICES actualizada si cambian las opciones o si se usan en la UI.
3.5. @src/services/stripeService.ts
Propósito: Wrapper para las Edge Functions de Stripe y gestor de Stripe.js en el frontend.
Métodos Clave:
getStripe(): Carga y devuelve la instancia de Stripe.js usando la Publishable Key (cargada desde variables de entorno VITE_). Necesario si se usan elementos UI de Stripe.
createCheckoutSession(item): Llama a la EF create-checkout-session (pasando token de Supabase) para obtener una URL de redirección a la página de pago de Stripe.
createCustomerPortalSession(): Llama a la EF create-customer-portal-session (pasando token de Supabase) para obtener una URL de redirección al portal de gestión de suscripciones de Stripe.
Dependencias: supabaseClient, loadStripe, EFs create-checkout-session, create-customer-portal-session.
Interacción: Usado por la UI en páginas de precios, perfil de usuario, o botones de "Upgrade/Comprar/Gestionar Suscripción".
Cuidado: Fundamental que NUNCA maneje la Secret Key de Stripe. Debe limitarse a llamar a las EFs. Verificar que VITE_STRIPE_PUBLISHABLE_KEY esté configurada. Asegurar que las llamadas a las EFs usen fetch con el token Authorization correcto. (Nota: El código proporcionado usa fetch directamente en lugar de supabase.functions.invoke, lo cual es válido pero menos consistente con los otros servicios; invoke maneja la autenticación automáticamente si el cliente Supabase está autenticado*).
3.6. @src/services/supabase.ts
Propósito: Capa central de acceso a la base de datos Supabase. Realiza operaciones CRUD directas y maneja la cola de sincronización offline.
Métodos Clave (Ejemplos):
syncUserProfile, getUserProfile: CRUD para la tabla profiles. getUserProfile es crucial para obtener el estado de suscripción y límites del usuario.
syncCharacter, getUserCharacters, deleteCharacter: CRUD para la tabla characters.
syncStory, getUserStories: CRUD para la tabla stories (incluyendo join con characters).
syncChapter, getStoryChapters: CRUD para la tabla story_chapters.
syncChallenge, getStoryChallenges: CRUD para challenges y challenge_questions.
syncAudioFile, getUserAudios: CRUD para audio_files.
setCurrentVoice, getCurrentVoice: CRUD para user_voices.
Componente Clave: SyncQueueService
Implementa un Singleton (syncQueue) para gestionar una cola de operaciones de escritura (insert, update, delete) que fallan (presumiblemente por estar offline).
Persiste la cola en localStorage.
Intenta procesar la cola (processQueue) cuando la aplicación vuelve a estar online.
Usa upsert para reintentar operaciones de forma segura. Re-encola ítems que vuelven a fallar.
Dependencias: supabaseClient.
Interacción: Es la principal fuente de datos para los stores (userStore, characterStore, etc.) durante la carga inicial (load...FromSupabase methods) y es llamado por los stores para persistir cambios en la base de datos. syncQueue se usa implícitamente si una operación de escritura falla dentro de un try...catch que llame a syncQueue.addToQueue.
Cuidado:
RLS: La causa más común de errores aquí son políticas RLS mal configuradas o ausentes en Supabase. Asegurarse de que el usuario autenticado tiene permisos para SELECT, INSERT, UPDATE, DELETE en las tablas según sea necesario.
Schema Mismatch: Errores si los nombres de columna/tabla o tipos de datos en el código no coinciden exactamente con la base de datos.
upsert: Usar con cuidado. Asegurarse de que la condición de conflicto (onConflict) es la deseada para no sobrescribir datos accidentalmente.
syncQueue: Asegurar que los datos añadidos (especialmente para delete) contienen el id necesario. Monitorizar localStorage (sync_queue key) durante el desarrollo si hay problemas de sincronización.
Errores Silenciosos: Algunas funciones devuelven { success: false } sin lanzar una excepción necesariamente; el código que llama debe verificar success.
3.7. @src/services/syncService.ts
Propósito: Orquestar el inicio de la sincronización de datos y reaccionar a cambios de conectividad. NO carga datos directamente.
Métodos Clave:
initSyncService(): Función principal a llamar una vez al inicio de la app. Inicializa los listeners y lanza el primer intento de syncUserData.
initSyncListeners(): Configura listeners para los eventos online y visibilitychange del navegador. Ambos eventos disparan syncUserData. Usa un flag (_syncListenersInitialized) para evitar duplicación.
syncUserData(): Función clave de disparo. Verifica si hay conexión y sesión de Supabase activa. Si es así, llama a useUserStore.getState().checkAuth(), delegando todo el proceso de carga/sincronización real al userStore.
Dependencias: supabaseClient (para getSession), userStore (para checkAuth).
Interacción: initSyncService es llamado desde el punto de entrada de la aplicación (main.ts o App.tsx). Los listeners actúan en segundo plano. syncUserData interactúa directamente con userStore.
Cuidado: Asegurarse de que syncUserData solo dispara el proceso en userStore y no intenta cargar datos de otros stores directamente (lo cual ya está corregido en el código proporcionado). Verificar que initSyncService se llame solo una vez.
4. Errores Comunes y Puntos a Considerar
RLS (Row Level Security): La causa nº1 de errores en supabase.ts y, por extensión, en los stores. Siempre verificar las políticas en el dashboard de Supabase.
Errores de Red/Offline: Asegurarse de que las llamadas a EFs y DB manejen correctamente los errores de red. syncQueue ayuda con las escrituras, pero las lecturas fallarán si no hay conexión.
Desincronización de Estado: Si syncQueue falla repetidamente o si hay errores en los webhooks de Stripe, el estado local en el store puede desincronizarse con la base de datos.
Dependencias de EF: Si la firma (parámetros, nombre, respuesta) de una Edge Function cambia, el servicio wrapper correspondiente en @src/services debe actualizarse.
Errores en invoke: Las llamadas a supabase.functions.invoke pueden fallar por errores dentro de la EF (errores 500) o problemas de autenticación/permisos (errores 401/403). Los catch deben manejar esto.
Manejo de null/undefined: Al interactuar con la DB (supabase.ts), tener cuidado con valores nulos o indefinidos que podrían no ser aceptados por columnas no nulables en la base de datos.
Consistencia de Tipos: Asegurar que los tipos definidos en @src/types.ts coinciden con la estructura de datos devuelta por la base de datos y las EFs.
5. Desarrollo Futuro
Nuevos Servicios para EFs: Si se crea una nueva EF, añadir un servicio wrapper correspondiente aquí siguiendo el patrón establecido (simple, solo llama a invoke).
Nuevas Entidades de DB: Añadir las funciones CRUD necesarias a supabase.ts, asegurarse de crear las políticas RLS adecuadas en Supabase, y actualizar los stores relevantes para usar las nuevas funciones.
Refactorización (Opcional): Considerar si los wrappers de EF añaden suficiente valor o si las llamadas a invoke podrían hacerse directamente desde los stores o hooks para reducir una capa (evaluar pros y contras en cada caso).
Este documento debería proporcionar una comprensión sólida de la carpeta @src/services, su arquitectura actual y los puntos clave a tener en cuenta.
