// src/pages/StoryViewer.tsx
// VERSIÓN CORREGIDA: Maneja {content, title} y usa selectores de límites

import React, { useState, useEffect, useCallback } from "react"; // Añadido useCallback
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Share, Printer, Volume2, Home, Award, BookOpen, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"; // Eliminado ArrowLeft si no se usa
import { motion } from "framer-motion";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
import { useChallengesStore } from "../store/stories/challenges/challengesStore";
import { useUserStore } from "../store/user/userStore"; // Importar para los selectores de límites
import BackButton from "../components/BackButton";
// import StoryButton from "../components/StoryButton"; // Parece no usarse aquí directamente
import PageTransition from "../components/PageTransition";
import ChallengeSelector from "../components/ChallengeSelector";
import LanguageSelector from "../components/LanguageSelector";
import ChallengeQuestion from "../components/ChallengeQuestion";
import { toast } from "sonner";
import { ChallengeCategory, ChallengeQuestion as ChallengeQuestionType, StoryChapter, Story } from "../types"; // Importar Story
import { ChallengeService } from "../services/ai/ChallengeService"; // Asumiendo ruta

export default function StoryViewer() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getStoryById } = useStoriesStore();
  const { getChaptersByStoryId } = useChaptersStore();
  const { addChallenge } = useChallengesStore();
  // --- Obtener selectores de límites/permisos del userStore ---
  const { profileSettings, canContinueStory, canGenerateVoice } = useUserStore();

  // Estado local
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [story, setStory] = useState<Story | null>(null); // Para pasar al servicio de desafío/continuación
  const [showChallengeSelector, setShowChallengeSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<ChallengeQuestionType | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGeneratingContinuation, setIsGeneratingContinuation] = useState(false); // Estado de carga para continuación

  // --- Permisos derivados del store ---
  // Estos se actualizan reactivamente si el estado del userStore cambia
  const isAllowedToContinue = storyId ? canContinueStory(storyId) : false;
  const isAllowedToGenerateVoice = canGenerateVoice();

  // --- Efecto para cargar historia y capítulos ---
  useEffect(() => {
    if (!storyId) { navigate("/home"); return; }

    const fetchedStory = getStoryById(storyId);
    if (!fetchedStory) { navigate("/not-found"); return; }
    setStory(fetchedStory); // Guardar la historia base

    // No navegar a /profile aquí, checkAuth debería haberlo hecho si es necesario
    // if (!profileSettings) { navigate("/profile"); return; }

    const storyChapters = getChaptersByStoryId(storyId);
    let chaptersToSet: StoryChapter[];
    if (storyChapters.length === 0 && fetchedStory.content) {
      // Crear capítulo inicial si no existe en el store de capítulos
      chaptersToSet = [{
        chapterNumber: 1,
        title: fetchedStory.title || "Capítulo 1",
        content: fetchedStory.content,
        createdAt: fetchedStory.createdAt
      }];
      // Nota: No llamamos a addChapter aquí, solo lo mostramos. Se guarda si se continúa.
    } else {
      chaptersToSet = [...storyChapters].sort((a, b) => a.chapterNumber - b.chapterNumber); // Asegurar orden
    }
    setChapters(chaptersToSet);
    console.log(`[StoryViewer_DEBUG] Fetched story title from store: "${fetchedStory?.title}"`); // <-- ADD THIS

    // Establecer capítulo inicial basado en URL o el último si no hay parámetro
    const searchParams = new URLSearchParams(location.search);
    const chapterParam = searchParams.get('chapter');
    let initialIndex = chaptersToSet.length - 1; // Default al último capítulo
    if (chapterParam !== null) {
      const chapterIndex = parseInt(chapterParam, 10);
      if (!isNaN(chapterIndex) && chapterIndex >= 0 && chapterIndex < chaptersToSet.length) {
        initialIndex = chapterIndex;
      }
    }
    setCurrentChapterIndex(initialIndex);

  }, [storyId, location.search, getStoryById, getChaptersByStoryId, navigate]); // Quitado profileSettings, canContinueStory, canGenerateVoice de dependencias

  // --- Si no hay datos aún (o hubo error), no renderizar ---
  // Añadir un estado de carga si es necesario
  if (!story || chapters.length === 0) {
    // Puedes poner un spinner aquí
    return <div className="gradient-bg min-h-screen flex items-center justify-center text-white">Cargando historia...</div>;
  }

  // --- Manejadores de Acciones ---

  const handleShare = () => { /* ... (sin cambios) ... */ };
  const handlePrint = () => { /* ... (sin cambios) ... */ };

  const toggleAudioPlayer = () => {
    // Usar el estado derivado isAllowedToGenerateVoice
    if (isAllowedToGenerateVoice) {
      navigate(`/story/${storyId}/audio/${currentChapterIndex}`);
    } else {
      toast.error("Límite de voz alcanzado", {
        description: "No tienes generaciones de voz gratuitas o créditos disponibles."
      });
    }
  };

  // --- Manejadores de Desafío (sin cambios lógicos aquí) ---
  const handleShowChallenge = () => setShowChallengeSelector(true);
  const handleSelectCategory = (category: ChallengeCategory) => { /* ... */ setSelectedCategory(category); };
  const handleSelectLanguage = (language: string) => setSelectedLanguage(language);
  const handleContinueAfterLanguage = () => { /* ... */ setShowLanguageSelector(false); generateChallengeQuestion(); };
  const handleContinueAfterCategory = () => { /* ... */ if (selectedCategory === 'language') setShowLanguageSelector(true); else generateChallengeQuestion(); setShowChallengeSelector(false); };
  const handleBackToCategories = () => { /* ... */ setShowLanguageSelector(false); setShowChallengeSelector(true); };
  const handleTryAgain = () => generateChallengeQuestion();
  const handleNextQuestion = () => { /* ... */ setChallengeQuestion(null); setSelectedCategory(null); setSelectedLanguage(null); setShowChallengeSelector(false); };
  const handleChangeChallenge = () => { /* ... */ setChallengeQuestion(null); setSelectedCategory(null); setSelectedLanguage(null); setShowChallengeSelector(true); };

  const generateChallengeQuestion = async () => {
    if (!selectedCategory || !story || !profileSettings) return;
    setIsLoadingQuestion(true);
    try {
      if (selectedCategory === 'language' && !selectedLanguage) throw new Error('Idioma no seleccionado');
      toast.loading('Generando pregunta...');
      const challenge = await ChallengeService.createChallenge(story, selectedCategory, profileSettings, selectedCategory === 'language' ? selectedLanguage : undefined);
      addChallenge(challenge);
      setChallengeQuestion(challenge.questions[0]);
      toast.dismiss();
      toast.success('¡Pregunta lista!');
    } catch (error: any) {
      console.error('Error al generar pregunta:', error);
      toast.dismiss();
      toast.error('No se pudo generar la pregunta', { description: error?.message });
    } finally {
      setIsLoadingQuestion(false);
    }
  };
  // --- Fin Manejadores Desafío ---

  // --- Manejadores de Navegación de Capítulos ---
  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) setCurrentChapterIndex(currentChapterIndex - 1);
  };
  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) setCurrentChapterIndex(currentChapterIndex + 1);
  };
  // --- Fin Navegación Capítulos ---


  // --- *** INICIO: Lógica de Continuación MODIFICADA *** ---
  const goToContinuationPage = () => {
    // Usa el estado derivado isAllowedToContinue
    if (isAllowedToContinue) {
      // Navega a la PÁGINA de continuación, no genera aquí
      navigate(`/story/${storyId}/continue?refresh=${Date.now()}`);
    } else {
      toast.error("Límite de continuación alcanzado", {
        description: "Solo puedes añadir una continuación gratuita por historia."
      });
    }
  };
  // --- *** FIN: Lógica de Continuación MODIFICADA *** ---

  // --- Renderizado ---
  const currentChapter = chapters[currentChapterIndex];
  console.log(`[StoryViewer_DEBUG] Title from current chapter object: "${currentChapter?.title}"`); // <-- ADD THIS
  if (!currentChapter) {
    // Manejar caso donde el índice es inválido (aunque useEffect debería prevenirlo)
    return <div className="gradient-bg min-h-screen flex items-center justify-center text-white">Error: Capítulo no encontrado.</div>;
  }

  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative pb-24"> {/* Añadir padding-bottom */}
        {/* Botones Superiores */}
        <BackButton onClick={() => {
          if (showChallengeSelector || showLanguageSelector || challengeQuestion) {
            setShowChallengeSelector(false); setShowLanguageSelector(false); setChallengeQuestion(null);
          } else { navigate('/saved-stories'); } // Volver a la lista de historias
        }} />
        <div className="absolute top-6 right-6 flex space-x-2 z-10">
          {/* ... botones Share y Print ... */}
          <button onClick={handleShare} className="action-icon-button" aria-label="Compartir"><Share size={20} /></button>
          <button onClick={handlePrint} className="action-icon-button" aria-label="Imprimir"><Printer size={20} /></button>
        </div>

        <div className="container max-w-2xl mx-auto pt-20 px-6">
          {/* Título del Capítulo/Historia */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-center mb-6 text-white"
            title={currentChapter.title || story.title} // Tooltip con título completo
          >
            {/* Mostrar Título del Capítulo si hay más de uno, si no, el de la historia */}
            {chapters.length > 1 ? `Cap. ${currentChapterIndex + 1}: ` : ''}
            {currentChapter.title || story.title || "Historia sin título"}
          </motion.h1>

          {/* Contenido Principal (Historia o Desafío) */}
          {!showChallengeSelector && !showLanguageSelector && !challengeQuestion && (
            <motion.div /* Contenido del capítulo */
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} // Ajustado delay
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 mb-8 text-white/90 leading-relaxed text-lg shadow-xl" // Aumentado padding y bajado opacidad texto
            >
              {currentChapter.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph || '\u00A0'}</p> // Párrafo vacío si hay líneas en blanco
              ))}
            </motion.div>
          )}

          {/* Selectores y Pregunta de Desafío (sin cambios) */}
          {showChallengeSelector && <ChallengeSelector onSelectCategory={handleSelectCategory} onContinue={handleContinueAfterCategory} />}
          {showLanguageSelector && <LanguageSelector currentLanguage={profileSettings?.language || 'es'} onSelectLanguage={handleSelectLanguage} onContinue={handleContinueAfterLanguage} onBack={handleBackToCategories} />}
          {challengeQuestion && <ChallengeQuestion question={challengeQuestion} onNextQuestion={handleNextQuestion} onTryAgain={handleTryAgain} onChangeChallenge={handleChangeChallenge} />}


          {/* --- Barra de Acciones Inferior (Fija o al final) --- */}
          {!showChallengeSelector && !showLanguageSelector && !challengeQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} // Delay para aparecer después del contenido
              // Podría ser fija en la parte inferior:
              // className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent p-4 z-20"
              className="mt-8" // O simplemente al final
            >
              {/* Navegación entre Capítulos */}
              <div className="flex justify-between mb-4 px-2">
                <button onClick={handlePreviousChapter} disabled={currentChapterIndex === 0} className="nav-button disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={20} /> Anterior
                </button>
                <span className="text-white/70 text-sm self-center">
                  Capítulo {currentChapterIndex + 1} / {chapters.length}
                </span>
                <button onClick={handleNextChapter} disabled={currentChapterIndex === chapters.length - 1} className="nav-button disabled:opacity-40 disabled:cursor-not-allowed">
                  Siguiente <ChevronRight size={20} />
                </button>
              </div>

              {/* Botones de Acción Principales */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={handleShowChallenge}
                  className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium text-black transition-all shadow-lg ${isLoadingQuestion ? 'bg-gray-300 cursor-not-allowed' : 'bg-story-orange-400 hover:bg-story-orange-300'}`}
                  disabled={isLoadingQuestion}
                >
                  <Award size={24} className="mr-2" />
                  {isLoadingQuestion ? "Generando..." : "Acepta el Reto"}
                </button>

                <button
                  onClick={goToContinuationPage}
                  disabled={!isAllowedToContinue}
                  className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all shadow-lg ${isAllowedToContinue ? 'bg-purple-500 hover:bg-purple-400 text-white' : 'bg-gray-300 cursor-not-allowed text-gray-600'}`}
                  title={!isAllowedToContinue ? "Límite de continuación gratuita alcanzado" : "Continuar la historia"}
                >
                  <BookOpen size={24} className="mr-2" />
                  Continuar Historia
                </button>

                <button
                  onClick={toggleAudioPlayer}
                  disabled={!isAllowedToGenerateVoice}
                  className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all shadow-lg ${isAllowedToGenerateVoice ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-gray-300 cursor-not-allowed text-gray-600'}`}
                  title={!isAllowedToGenerateVoice ? "Límite de voz o créditos agotados" : "Escuchar narración"}
                >
                  <Volume2 size={24} className="mr-2" />
                  Narrar
                  {!isAllowedToGenerateVoice && <AlertCircle className="ml-1 h-4 w-4" />}
                </button>
              </div>
              {/* Botón volver al inicio (opcional) */}
              <div className="text-center mt-4">
                <button onClick={() => navigate("/home")} className="text-white/60 hover:text-white text-sm inline-flex items-center gap-1">
                  <Home size={16} /> Volver al Inicio
                </button>
              </div>
            </motion.div>
          )}
        </div> {/* Fin container */}
      </div> {/* Fin gradient-bg */}
    </PageTransition>
  );
}

// Estilos CSS reutilizados (puedes ponerlos en tu index.css o similar)
/*
.action-icon-button {
  @apply w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all;
}
.nav-button {
  @apply text-white/80 hover:text-white text-sm inline-flex items-center gap-1 transition-colors;
}
.action-button {
   @apply text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-medium flex items-center justify-center shadow-lg transition-all text-sm sm:text-base w-full sm:w-auto;
}
*/