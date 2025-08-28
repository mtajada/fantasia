// src/pages/StoryViewer.tsx
// VERSIÓN CORREGIDA: Maneja {content, title} y usa selectores de límites

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Share, Volume2, Home, BookOpen, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/user/userStore"; // Importar para los selectores de límites
<<<<<<< HEAD
import { useLimitWarnings } from "@/hooks/useLimitWarnings"; // Add limit warnings for monthly limits
=======
>>>>>>> origin/main
import { getStoryDirectly, getChaptersDirectly } from "../services/supabase"; // Direct Supabase functions
import BackButton from "../components/BackButton";
import PageTransition from "../components/PageTransition";
import { toast } from "sonner"; // Asegurarse que toast está importado
import { StoryChapter, Story } from "../types"; // Importar Story
<<<<<<< HEAD
import { parseTextToParagraphs, navigationUtils } from '@/lib/utils';
=======
import { parseTextToParagraphs } from '@/lib/utils';
>>>>>>> origin/main
import { generateId } from "../store/core/utils";

export default function StoryViewer() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- Obtener selectores de límites/permisos del userStore ---
  const { canContinueStory, canGenerateVoice, user } = useUserStore();
<<<<<<< HEAD
  
  // --- NEW: Use limit warnings for monthly story limits ---
  const { limitStatus } = useLimitWarnings();
=======
>>>>>>> origin/main

  // Estado local
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Permisos derivados del store ---
  // Simplified: canContinueStory now only checks monthly limits
  const isAllowedToContinue = storyId ? canContinueStory(storyId) : false;
  const isAllowedToGenerateVoice = canGenerateVoice();

  // --- Cálculo para saber si es el último capítulo ---
  const isLastChapter = chapters.length > 0 && currentChapterIndex === chapters.length - 1;

  // --- Efecto para cargar historia y capítulos DIRECTAMENTE desde Supabase ---
  useEffect(() => {
    const loadStoryAndChapters = async () => {
      if (!storyId) { 
        navigate("/home", { replace: true }); 
        return; 
      }

      if (!user?.id) {
        setIsLoading(true);
        return; // Wait for user to be loaded
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load story directly from Supabase
<<<<<<< HEAD
        console.log(`🔍 DEBUG - Cargando historia ${storyId} para el usuario ${user.id}`);
        const storyResult = await getStoryDirectly(user.id, storyId);
        
        if (!storyResult.success || !storyResult.story) {
          console.error(`🔍 DEBUG - Historia no encontrada: ${storyResult.error?.message}`);
=======
        console.log(`🔍 DEBUG - Loading story ${storyId} for user ${user.id}`);
        const storyResult = await getStoryDirectly(user.id, storyId);
        
        if (!storyResult.success || !storyResult.story) {
          console.error(`🔍 DEBUG - Story not found: ${storyResult.error?.message}`);
>>>>>>> origin/main
          setError("Story not found");
          navigate("/not-found", { replace: true });
          return;
        }

        const fetchedStory = storyResult.story;
        setStory(fetchedStory);
<<<<<<< HEAD
        console.log(`🔍 DEBUG - Historia cargada: "${fetchedStory.title}"`);
=======
        console.log(`🔍 DEBUG - Story loaded: "${fetchedStory.title}"`);
>>>>>>> origin/main

        // Load chapters directly from Supabase
        const chaptersResult = await getChaptersDirectly(storyId);
        let chaptersToSet: StoryChapter[];

        if (chaptersResult.success && chaptersResult.chapters && chaptersResult.chapters.length > 0) {
          // Use chapters from database
          chaptersToSet = [...chaptersResult.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
<<<<<<< HEAD
          console.log(`🔍 DEBUG - Cargados ${chaptersToSet.length} capítulos desde la base de datos`);
=======
          console.log(`🔍 DEBUG - Loaded ${chaptersToSet.length} chapters from database`);
>>>>>>> origin/main
        } else if (fetchedStory.content) {
          // Fallback: Create chapter from story content
          chaptersToSet = [{
            id: generateId(),
            chapterNumber: 1,
            title: fetchedStory.title || "Capítulo 1",
            content: fetchedStory.content,
            createdAt: fetchedStory.createdAt
          }];
<<<<<<< HEAD
          console.log(`🔍 DEBUG - Creado capítulo de respaldo desde el contenido de la historia`);
        } else {
          chaptersToSet = [];
          console.warn(`🔍 DEBUG - No se encontraron capítulos o contenido para la historia ${storyId}`);
=======
          console.log(`🔍 DEBUG - Created fallback chapter from story content`);
        } else {
          chaptersToSet = [];
          console.warn(`🔍 DEBUG - No chapters or content found for story ${storyId}`);
>>>>>>> origin/main
        }

        setChapters(chaptersToSet);

        // Handle chapter navigation from URL params
        const searchParams = new URLSearchParams(location.search);
        const chapterParam = searchParams.get('chapter');
        let initialIndex = chaptersToSet.length > 0 ? chaptersToSet.length - 1 : 0;
        if (chapterParam !== null) {
          const chapterIndex = parseInt(chapterParam, 10);
          if (!isNaN(chapterIndex) && chapterIndex >= 0 && chapterIndex < chaptersToSet.length) {
            initialIndex = chapterIndex;
          }
        }
        setCurrentChapterIndex(initialIndex);

      } catch (error) {
<<<<<<< HEAD
        console.error(`🔍 DEBUG - Error cargando historia:`, error);
=======
        console.error(`🔍 DEBUG - Error loading story:`, error);
>>>>>>> origin/main
        setError(error instanceof Error ? error.message : "Error loading story");
      } finally {
        setIsLoading(false);
      }
    };

    loadStoryAndChapters();
  }, [storyId, location.search, navigate, user?.id]);

  if (isLoading) {
<<<<<<< HEAD
    return <div className="min-h-screen flex items-center justify-center text-white" style={{backgroundColor: 'black'}}>Cargando tu fantasía...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-white" style={{backgroundColor: 'black'}}>¡Error al cargar! {error}</div>;
  }

  if (!story) {
    return <div className="min-h-screen flex items-center justify-center text-white" style={{backgroundColor: 'black'}}>Historia no encontrada. Redirigiendo...</div>;
=======
    return <div className="min-h-screen flex items-center justify-center text-white" style={{backgroundColor: 'black'}}>Loading story...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-white" style={{backgroundColor: 'black'}}>Error: {error}</div>;
  }

  if (!story) {
    return <div className="min-h-screen flex items-center justify-center text-white" style={{backgroundColor: 'black'}}>Story not found. Redirecting...</div>;
>>>>>>> origin/main
  }


  // --- Manejadores de Acciones ---
  const handleShare = async () => {
    const shareUrl = window.location.href; // URL actual incluyendo el capítulo
<<<<<<< HEAD
    const shareTitle = story?.title || "¡Mi Fantasía Secreta!";
    const shareText = chapters.length > 0 ? chapters[currentChapterIndex]?.title : "¡Echa un vistazo a esta historia picante!";
=======
    const shareTitle = story?.title || "Mi Historia Fantasia!";
    const shareText = chapters.length > 0 ? chapters[currentChapterIndex]?.title : "Echa un vistazo a esta historia";
>>>>>>> origin/main

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
<<<<<<< HEAD
        toast.success("¡Historia compartida con éxito!");
=======
        toast.success("Story shared!");
>>>>>>> origin/main
      } catch (error) {
        console.error("Error al compartir:", error);
        toast.error("Could not share", { description: "The browser canceled the action or there was an error." });
      }
    } else {
      // Fallback: Copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
<<<<<<< HEAD
        toast.info("¡Enlace copiado al portapapeles!", {
          description: "Puedes pegarlo para compartir la historia."
=======
        toast.info("Link copied to clipboard", {
          description: "You can paste it to share the story."
>>>>>>> origin/main
        });
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        toast.error("Could not copy link", {
          description: "Your browser doesn't support this feature or there was an error."
        });
      }
    }
  };


  const toggleAudioPlayer = () => {
    // Usar el estado derivado isAllowedToGenerateVoice
    if (isAllowedToGenerateVoice) {
      navigate(`/story/${storyId}/audio/${currentChapterIndex}`);
    } else {
<<<<<<< HEAD
      // Redirect to buy credits instead of showing toast
      navigationUtils.redirectToBuyCredits();
=======
      toast.error("Voice limit reached", {
        description: "You don't have free voice generations or credits available."
      });
>>>>>>> origin/main
    }
  };


  // --- Manejadores de Navegación de Capítulos ---
  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) setCurrentChapterIndex(currentChapterIndex - 1);
  };
  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) setCurrentChapterIndex(currentChapterIndex + 1);
  };
  // --- Fin Navegación Capítulos ---

  // --- Manejador para el botón de atrás ---
  const handleGoBack = () => {
    navigate('/'); // Navegar explícitamente a la página de inicio
  };

  // --- *** INICIO: Lógica de Continuación MEJORADA *** ---
  const goToContinuationPage = () => {
<<<<<<< HEAD
    // First check if it's the last chapter (UX requirement)
    if (!isLastChapter) {
      toast.error("Solo puedes continuar desde el último capítulo", {
        description: "Navega al último capítulo para continuar la historia."
=======
    // Usa el estado derivado isAllowedToContinue
    if (isAllowedToContinue) {
      // Navega a la PÁGINA de continuación, no genera aquí
      navigate(`/story/${storyId}/continue?refresh=${Date.now()}`);
    } else {
      toast.error("Continuation limit reached", {
        description: "You can only add one free continuation per story."
>>>>>>> origin/main
      });
      return;
    }
    
    // Check monthly limits and redirect if reached
    if (!isAllowedToContinue) {
      // Redirect to premium plans instead of showing toast
      navigationUtils.redirectToUpgradePremium();
      return;
    }
    
    // User can continue - proceed to continuation page
    navigate(`/story/${storyId}/continue?refresh=${Date.now()}`);
  };

<<<<<<< HEAD
  // --- *** FIN: Lógica de Continuación SIMPLIFICADA *** ---
=======
  // --- *** FIN: Lógica de Continuación MODIFICADA *** ---
>>>>>>> origin/main

  // --- Renderizado ---
  const currentChapter = chapters[currentChapterIndex];

  if (!currentChapter) {
    // Manejar caso donde el índice es inválido (aunque useEffect debería prevenirlo)
    return <div className="min-h-screen flex items-center justify-center text-white" style={{backgroundColor: 'black'}}>Error: Chapter not found.</div>;
  }

  return (
    <PageTransition>
      <div
        className="min-h-screen relative pb-24 flex flex-col items-center justify-start"
        style={{
          backgroundColor: 'black',
        }}
      >
        {/* Botón de Volver atrás */}
        <BackButton onClick={handleGoBack} />

        <div className="absolute top-6 right-6 flex space-x-3 z-10">
          <button
            onClick={handleShare}
            className="w-11 h-11 rounded-full bg-gray-800/80 backdrop-blur-md border border-gray-700 flex items-center justify-center text-violet-300 hover:bg-gray-700/80 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-violet-500/25"
<<<<<<< HEAD
            aria-label="Compartir"
=======
            aria-label="Share"
>>>>>>> origin/main
          >
            <Share className="h-5 w-5" />
          </button>
        </div>

        <div className="w-full max-w-3xl mx-auto pt-20 px-4 sm:px-6 flex-1 flex flex-col">
          {/* Título del Capítulo/Historia */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 font-heading bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 px-2"
            title={currentChapter.title || story.title}
          >
<<<<<<< HEAD
            {chapters.length > 1 ? `Capítulo ${currentChapterIndex + 1}: ` : ''}
=======
            {chapters.length > 1 ? `Chapter ${currentChapterIndex + 1}: ` : ''}
>>>>>>> origin/main
            {currentChapter.title || story.title || "Untitled Story"}
          </motion.h1>

          {/* Contenido Principal (Historia) */}
          {
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 sm:p-8 mb-8 text-gray-100 leading-relaxed text-base sm:text-lg shadow-2xl max-w-full ring-1 ring-gray-700/50"
              style={{ minHeight: '40vh' }}
            >
              {parseTextToParagraphs(currentChapter.content).map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0 text-[1.08em] break-words text-gray-200">
                  {paragraph}
                </p>
              ))}
            </motion.div>
          }

          {/* --- Barra de Acciones Inferior --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 sm:mt-10"
          >
            {/* Navegación entre Capítulos */}
            <div className="flex justify-between items-center mb-6 px-2 sm:px-4">
              <button onClick={handlePreviousChapter} disabled={currentChapterIndex === 0} className="text-violet-300 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all">
<<<<<<< HEAD
                <ChevronLeft size={18} /> Anterior
              </button>
              <span className="text-gray-300 text-base sm:text-lg font-bold select-none drop-shadow-sm bg-gray-800/80 border border-gray-700 px-3 py-1 rounded-xl shadow-sm">
                Capítulo {currentChapterIndex + 1} / {chapters.length}
              </span>
              <button onClick={handleNextChapter} disabled={currentChapterIndex === chapters.length - 1} className="text-violet-300 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all">
                Siguiente <ChevronRight size={18} />
              </button>
            </div>

            {/* Botones de Acción Principales */}
            <div className="flex flex-col items-center space-y-5 sm:space-y-6">
              {/* Primera fila: Continuar Historia */}
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 justify-center items-center w-full">
                <button
                  onClick={goToContinuationPage}
                  aria-disabled={!isAllowedToContinue || !isLastChapter}
                  className={`flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all shadow-lg text-base sm:text-lg w-full sm:w-auto ${isAllowedToContinue && isLastChapter ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-violet-500/25' : 'bg-gray-700 cursor-pointer hover:bg-gray-600 text-gray-400 border border-gray-600'}`}
                  // Título dinámico según la razón de la deshabilitación
                  title={
                    !isAllowedToContinue
                      ? "Límite mensual de historias alcanzado - Haz clic para mejorar a premium"
                      : !isLastChapter
                        ? "Solo puedes continuar desde el último capítulo"
                        : "Continuar la historia"
                  }
                >
                  <BookOpen size={22} className="mr-2" />
                  Continuar la Historia
                </button>
              </div>

              {/* Segunda fila: Narrar */}
              <button
                onClick={toggleAudioPlayer}
                aria-disabled={!isAllowedToGenerateVoice}
                className={`flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all shadow-lg text-base sm:text-lg w-full sm:w-64 ${isAllowedToGenerateVoice ? 'bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-pink-500/25' : 'bg-gray-700 cursor-pointer hover:bg-gray-600 text-gray-400 border border-gray-600'}`}
                title={!isAllowedToGenerateVoice ? "Créditos de voz agotados - Haz clic para comprar más créditos" : "Escuchar narración"}
              >
                <Volume2 size={22} className="mr-2" />
                Narrar
=======
                <ChevronLeft size={18} /> Previous
              </button>
              <span className="text-gray-300 text-base sm:text-lg font-bold select-none drop-shadow-sm bg-gray-800/80 border border-gray-700 px-3 py-1 rounded-xl shadow-sm">
                Chapter {currentChapterIndex + 1} / {chapters.length}
              </span>
              <button onClick={handleNextChapter} disabled={currentChapterIndex === chapters.length - 1} className="text-violet-300 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all">
                Next <ChevronRight size={18} />
              </button>
            </div>

            {/* Botones de Acción Principales */}
            <div className="flex flex-col items-center space-y-5 sm:space-y-6">
              {/* Primera fila: Continuar Historia */}
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 justify-center items-center w-full">
                <button
                  onClick={goToContinuationPage}
                  disabled={!isAllowedToContinue || !isLastChapter}
                  className={`flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all shadow-lg text-base sm:text-lg w-full sm:w-auto ${isAllowedToContinue && isLastChapter ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-violet-500/25' : 'bg-gray-700 cursor-not-allowed text-gray-400 border border-gray-600'}`}
                  // Título dinámico según la razón de la deshabilitación
                  title={
                    !isAllowedToContinue
                      ? "Free continuation limit reached"
                      : !isLastChapter
                        ? "You can only continue from the last chapter"
                        : "Continue the story"
                  }
                >
                  <BookOpen size={22} className="mr-2" />
                  Continue Story
                </button>
              </div>

              {/* Segunda fila: Narrar */}
              <button
                onClick={toggleAudioPlayer}
                disabled={!isAllowedToGenerateVoice}
                className={`flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all shadow-lg text-base sm:text-lg w-full sm:w-64 ${isAllowedToGenerateVoice ? 'bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-pink-500/25' : 'bg-gray-700 cursor-not-allowed text-gray-400 border border-gray-600'}`}
                title={!isAllowedToGenerateVoice ? "Voice limit or credits exhausted" : "Listen to narration"}
              >
                <Volume2 size={22} className="mr-2" />
                Narrate
>>>>>>> origin/main
                {!isAllowedToGenerateVoice && <AlertCircle className="ml-1 h-4 w-4" />}
              </button>

              {/* Tercera fila: Volver al Inicio */}
              <button
                onClick={() => navigate("/home")}
                className="flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-semibold bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700 transition-all shadow w-full sm:w-48 text-base"
              >
<<<<<<< HEAD
                Volver al Inicio
=======
                <Home size={18} className="mr-2" /> Back to Home
>>>>>>> origin/main
              </button>
            </div>
          </motion.div>
        </div> {/* Fin container */}

      </div> {/* Fin fondo */}
    </PageTransition>
  );
}

