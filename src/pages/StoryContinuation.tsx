// src/pages/StoryContinuation.tsx
// VERSIÓN CORREGIDA para manejar la respuesta { content, title } del servicio

import React, { useState, useEffect, useCallback } from "react"; // Añadido useCallback
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react"; // Eliminado ArrowLeft si no se usa
import { useStoriesStore } from "../store/stories/storiesStore";
import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
import { useUserStore } from "../store/user/userStore"; // Importar para check de permiso
import BackButton from "../components/BackButton";
import PageTransition from "../components/PageTransition";
// import StoryChapter from "../components/StoryChapter"; // Parece no usarse aquí
import StoryContinuationOptions from "../components/StoryContinuationOptions";
import StoryContinuationCustomInput from "../components/StoryContinuationCustomInput";
import { toast } from "sonner";
import { Story, StoryChapter as StoryChapterType } from "../types"; // Importar Story
import { StoryContinuationService } from "../services/ai/StoryContinuationService"; // Corrected path
import { getChapterCountForStory } from "../services/supabase"; // <-- Removed supabase import
import { generateId } from "../store/core/utils"; // <-- Importar generateId

export default function StoryContinuation() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getStoryById } = useStoriesStore();
  const { getChaptersByStoryId, addChapter } = useChaptersStore();
  const { canContinueStory } = useUserStore(); // Obtener selector de permiso

  const [isLoading, setIsLoading] = useState(false); // Loading para generar continuación
  const [isLoadingOptions, setIsLoadingOptions] = useState(false); // Loading para generar opciones
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [continuationOptions, setContinuationOptions] = useState<{ summary: string }[]>([]);
  const [story, setStory] = useState<Story | null>(null); // Tipado más estricto
  const [chapters, setChapters] = useState<StoryChapterType[]>([]);
  const [shouldGenerateOptions, setShouldGenerateOptions] = useState(true);
  const [isAllowedToContinue, setIsAllowedToContinue] = useState(true); // Estado para permiso

  // --- Efecto para cargar datos iniciales y verificar permiso ---
  useEffect(() => {
    if (!storyId) {
      navigate("/home");
      return;
    }

    const fetchedStory = getStoryById(storyId);
    if (!fetchedStory) {
      toast.error("Historia no encontrada");
      navigate("/saved-stories"); // O a donde corresponda
      return;
    }
    setStory(fetchedStory);

    const existingChapters = getChaptersByStoryId(storyId);
    let currentChapters: StoryChapterType[];

    if (existingChapters.length === 0 && fetchedStory.content) {
      // Si no hay capítulos en el store de capítulos, crear el primero desde la historia base
      const initialChapter: StoryChapterType = {
        chapterNumber: 1,
        title: fetchedStory.title || "Capítulo 1", // Usar título de historia o default
        content: fetchedStory.content,
        createdAt: fetchedStory.createdAt,
        // generationMethod: 'initial' // Podrías añadir esto si quieres
      };
      currentChapters = [initialChapter];
      // No añadir al store aquí, addChapter lo hace al *generar* la *continuación*
    } else {
      currentChapters = existingChapters;
    }
    setChapters(currentChapters);

    // Verificar permiso de continuación usando el estado actual de los capítulos
    const allowed = canContinueStory(storyId); // Llama al selector del userStore
    setIsAllowedToContinue(allowed);
    if (!allowed) {
      toast.info("Has alcanzado el límite de continuación gratuita para esta historia.");
      // Considera deshabilitar opciones o mostrar mensaje claro en la UI
    }

  }, [storyId, getStoryById, getChaptersByStoryId, navigate, canContinueStory]); // Añadir canContinueStory

  // --- Efecto para controlar regeneración de opciones ---
  useEffect(() => {
    // Solo activa si el usuario puede continuar
    if (isAllowedToContinue) {
      setShouldGenerateOptions(true);
    }
  }, [location.search, isAllowedToContinue]); // Regenerar si cambia la query o el permiso

  // --- Función para generar opciones (Callback para estabilidad) ---
  const generateOptions = useCallback(async () => {
    // Verificar permiso y datos necesarios
    if (!story || chapters.length === 0 || !isAllowedToContinue) return;

    console.log(`Generating options for story ${story.id}`);
    setIsLoadingOptions(true);
    setContinuationOptions([]); // Limpiar opciones anteriores
    try {
      const response = await StoryContinuationService.generateContinuationOptions(story, chapters);
      if (response?.options?.length === 3) {
        setContinuationOptions(response.options);
      } else {
        console.warn("generateOptions: No se recibieron 3 opciones válidas. Usando defaults.");
        throw new Error("Fallback"); // Forzar fallback en catch
      }
    } catch (error) {
      console.error("Error generating continuation options:", error);
      toast.error("No se pudieron generar las opciones. Intenta de nuevo.");
      // Usar fallback como último recurso
      setContinuationOptions([
        { summary: "Explorar el misterioso jardín." },
        { summary: "Seguir al pájaro parlanchín." },
        { summary: "Preguntar al viejo árbol sabio." }
      ]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [story, chapters, isAllowedToContinue]); // Dependencias de useCallback

  // --- Efecto para generar opciones cuando sea necesario ---
  useEffect(() => {
    if (story && chapters.length > 0 && shouldGenerateOptions && isAllowedToContinue) {
      generateOptions();
      setShouldGenerateOptions(false); // Evitar regeneración infinita
    }
  }, [chapters, story, shouldGenerateOptions, generateOptions, isAllowedToContinue]); // Incluir generateOptions y permiso

  // --- Función genérica para manejar la generación y guardado de capítulos ---
  const handleGenerateAndSaveChapter = useCallback(async (
    generationPromise: Promise<{ content: string; title: string }>, // Espera promesa con content y title
    generationMethod: StoryChapterType['generationMethod'],
    customInput?: string
  ) => {
    if (!story || !storyId || !isAllowedToContinue) { // Doble check de permiso
      toast.error("No puedes continuar esta historia (límite alcanzado).");
      return;
    }

    setIsLoading(true);
    toast.loading("Generando continuación...");

    try {
      // --- NUEVO: Obtener el conteo actual de capítulos desde Supabase ---
      const { count: currentChapterCount, error: countError } = await getChapterCountForStory(storyId);

      if (countError) {
        throw new Error("Error al obtener el número de capítulos existentes.");
      }

      const nextChapterNumber = currentChapterCount + 1;
      // --- FIN NUEVO ---

      // 1. Llamar al servicio para obtener contenido Y título (como antes)
      const { content, title } = await generationPromise;

      // 2. Crear el objeto nuevo capítulo CON EL NÚMERO CORRECTO
      const newChapter: StoryChapterType = {
        chapterNumber: nextChapterNumber, // <--- USAR NÚMERO CALCULADO
        title: title || `Capítulo ${nextChapterNumber}`, // Usar título o default con número correcto
        content: content,
        createdAt: new Date().toISOString(),
        generationMethod: generationMethod,
        ...(customInput && { customInput: customInput })
      };

      // 3. Añadir al store (como antes)
      // Usamos await por si addChapter devuelve algo o queremos esperar la sincro (aunque no lo haga ahora)
      await addChapter(storyId, newChapter);

      // 4. Actualizar estado local (como antes)
      // OJO: Podría haber una pequeña condición de carrera si addChapter actualiza el store
      // y esta línea también lo hace. Sería ideal que addChapter manejara la actualización del store
      // y esta línea se eliminara o se basara en la respuesta/efecto de addChapter.
      // Por ahora, la dejamos, pero es un punto a revisar si causa problemas.
      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters); // Actualiza capítulos locales para UI

      // 5. Feedback y Navegación (como antes)
      toast.dismiss(); // Quitar loading toast
      toast.success("¡Continuación generada con éxito!");

      // Forzar regeneración de opciones para la próxima vez
      setShouldGenerateOptions(true);

      // Navegar al visor de historias mostrando el último capítulo añadido
      navigate(`/story/${storyId}?chapter=${newChapter.chapterNumber - 1}`); // Indice base 0

    } catch (error: any) {
      console.error("Error al generar continuación:", error);
      toast.dismiss();
      toast.error("Error al generar la continuación", {
        description: error?.message || "Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, storyId, isAllowedToContinue, addChapter, chapters, navigate, /* getChapterCountForStory - no es dep directa si se importa */]); // Asegúrate de que las dependencias sean correctas

  // --- Manejadores específicos que llaman a la función genérica ---
  const handleSelectFree = () => {
    handleGenerateAndSaveChapter(
      StoryContinuationService.generateFreeContinuation(story!, chapters), // El ! es seguro por el check anterior
      "free"
    );
  };

  const handleSelectOption = (index: number) => {
    // Necesitamos pasar el resumen de la opción seleccionada al servicio
    const selectedOptionSummary = continuationOptions[index]?.summary;
    if (!selectedOptionSummary) {
      toast.error("Opción seleccionada no válida.");
      return;
    }
    handleGenerateAndSaveChapter(
      StoryContinuationService.generateOptionContinuation(story!, chapters, selectedOptionSummary),
      `option${index + 1}` as "option1" | "option2" | "option3" // Tipado correcto
    );
  };

  const handleCustomContinuation = (userDirection: string) => {
    setShowCustomInput(false); // Ocultar input al enviar
    handleGenerateAndSaveChapter(
      StoryContinuationService.generateDirectedContinuation(story!, chapters, userDirection),
      "custom",
      userDirection
    );
  };

  // --- Renderizado ---

  // Loader principal para generación de continuación
  if (isLoading) {
    return (
      <PageTransition>
        <div className="gradient-bg min-h-screen flex flex-col items-center justify-center">
          {/* ... (spinner y texto) ... */}
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin mb-6 mx-auto"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Generando continuación...</h2>
          <p className="text-white/80">Un momento...</p>
        </div>
      </PageTransition>
    );
  }

  // Vista principal
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative">
        <BackButton
          onClick={() => {
            // Lógica de volver atrás: si está en input custom, vuelve a opciones, si no, al visor
            if (showCustomInput) {
              setShowCustomInput(false);
            } else {
              // Navegar al último capítulo visto en StoryViewer
              navigate(`/story/${storyId}?chapter=${chapters.length > 0 ? chapters.length - 1 : 0}`);
            }
          }}
        />

        <div className="container max-w-2xl mx-auto py-20 px-6">
          {/* Encabezado con título del último capítulo */}
          {chapters.length > 0 && (
            <motion.div /* ... (animación) ... */ className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 text-white">
              <div className="flex items-center">
                <BookOpen size={20} className="mr-2 text-story-orange-400" />
                <h2 className="text-lg font-medium truncate" title={chapters[chapters.length - 1].title || `Capítulo ${chapters.length}`}>
                  {/* Mostrar título del último capítulo existente */}
                  Continuando: {chapters[chapters.length - 1].title || `Capítulo ${chapters.length}`}
                </h2>
              </div>
            </motion.div>
          )}

          {/* Título */}
          <motion.h2 /* ... (animación) ... */ className="text-2xl font-bold text-white text-center mb-8">
            ¿Cómo quieres que continúe?
          </motion.h2>

          {/* Mostrar Opciones o Input Custom */}
          {!showCustomInput ? (
            <StoryContinuationOptions
              options={continuationOptions}
              onSelectOption={handleSelectOption}
              onSelectFree={handleSelectFree}
              onSelectCustom={() => setShowCustomInput(true)}
              isLoading={isLoadingOptions} // Loading específico para opciones
              disabled={!isAllowedToContinue} // Deshabilitar si no se permite continuar
            />
          ) : (
            <StoryContinuationCustomInput
              onSubmit={handleCustomContinuation}
              onBack={() => setShowCustomInput(false)}
              disabled={!isAllowedToContinue} // Deshabilitar si no se permite
            />
          )}

          {/* Mensaje si no se puede continuar */}
          {!isAllowedToContinue && chapters.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-story-orange-300 mt-6 bg-black/20 p-3 rounded-lg"
            >
              Has alcanzado el límite de continuación gratuita para esta historia. ¡Considera hacerte Premium para continuaciones ilimitadas!
            </motion.p>
          )}

        </div>
      </div>
    </PageTransition>
  );
}