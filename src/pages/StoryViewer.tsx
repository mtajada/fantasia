import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Share, Printer, Volume2, ArrowLeft, Home, Award, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
import { useChallengesStore } from "../store/stories/challenges/challengesStore";
import { useUserStore } from "../store/user/userStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import ChallengeSelector from "../components/ChallengeSelector";
import LanguageSelector from "../components/LanguageSelector";
import ChallengeQuestion from "../components/ChallengeQuestion";
import { toast } from "sonner";
import { ChallengeCategory, ChallengeQuestion as ChallengeQuestionType, StoryChapter } from "../types";
import { ChallengeService } from "../services/ai/ChallengeService";

export default function StoryViewer() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getStoryById } = useStoriesStore();
  const { getChaptersByStoryId } = useChaptersStore();
  const { addChallenge } = useChallengesStore();
  const { profileSettings } = useUserStore();
  
  // Estado para manejar capítulos
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  
  // Estados para el desafío
  const [showChallengeSelector, setShowChallengeSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<ChallengeQuestionType | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  
  useEffect(() => {
    if (!storyId) {
      navigate("/home");
      return;
    }
    
    const story = getStoryById(storyId);
    
    if (!story) {
      navigate("/not-found");
      return;
    }
    
    if (!profileSettings) {
      navigate("/profile");
      return;
    }
    
    // Obtener todos los capítulos para esta historia
    const storyChapters = getChaptersByStoryId(storyId);
    
    // Si no hay capítulos, crear uno con el contenido original de la historia
    if (storyChapters.length === 0) {
      setChapters([{
        chapterNumber: 1,
        title: story.title,
        content: story.content,
        createdAt: story.createdAt
      }]);
    } else {
      setChapters(storyChapters);
    }
    
    // Verificar si se debe mostrar un capítulo específico desde la URL
    const searchParams = new URLSearchParams(location.search);
    const chapterParam = searchParams.get('chapter');
    
    if (chapterParam !== null) {
      const chapterIndex = parseInt(chapterParam, 10);
      if (!isNaN(chapterIndex) && chapterIndex >= 0 && (storyChapters.length > 0 ? chapterIndex < storyChapters.length : chapterIndex === 0)) {
        setCurrentChapterIndex(chapterIndex);
      }
    }
  }, [storyId, location.search, getStoryById, getChaptersByStoryId, navigate, profileSettings]);
  
  if (!storyId || !getStoryById(storyId) || !profileSettings || chapters.length === 0) {
    return null; // Esperando a que los datos se carguen
  }
  
  const story = getStoryById(storyId);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: `¡Mira la historia que he creado: ${story.title}!`,
        url: window.location.href,
      });
    } else {
      // Fallback si Web Share API no está disponible
      toast.info("Compartir no está disponible en este navegador");
    }
  };
  
  const handlePrint = () => {
    window.print();
    toast.success("Preparando para imprimir...");
  };
  
  const toggleAudioPlayer = () => {
    navigate(`/story/${storyId}/audio/${currentChapterIndex}`);
  };
  
  // Funciones para el manejo del desafío
  const handleShowChallenge = () => {
    setShowChallengeSelector(true);
  };
  
  const handleSelectCategory = (category: ChallengeCategory) => {
    setSelectedCategory(category);
    
    // Si selecciona idioma, mostrar selector de idiomas
    if (category === 'language') {
      setShowLanguageSelector(true);
    }
  };
  
  const handleSelectLanguage = (language: string) => {
    setSelectedLanguage(language);
  };
  
  const handleContinueAfterLanguage = () => {
    setShowLanguageSelector(false);
    generateChallengeQuestion();
  };
  
  const handleContinueAfterCategory = () => {
    if (selectedCategory === 'language') {
      setShowLanguageSelector(true);
    } else {
      generateChallengeQuestion();
    }
    setShowChallengeSelector(false);
  };
  
  const handleBackToCategories = () => {
    setShowLanguageSelector(false);
    setShowChallengeSelector(true);
  };
  
  const generateChallengeQuestion = async () => {
    if (!selectedCategory || !story || !profileSettings) return;
    
    setIsLoadingQuestion(true);
    try {
      // Si es desafío de idioma, necesitamos el idioma seleccionado
      if (selectedCategory === 'language' && !selectedLanguage) {
        throw new Error('No se seleccionó un idioma');
      }
      
      toast.loading('Generando pregunta...');
      
      // Crear el desafío usando el servicio
      const challenge = await ChallengeService.createChallenge(
        story,
        selectedCategory,
        profileSettings,
        selectedCategory === 'language' ? selectedLanguage : undefined
      );
      
      // Guardar el desafío en el store
      addChallenge(challenge);
      
      // Mostrar la primera pregunta
      setChallengeQuestion(challenge.questions[0]);
      
      toast.dismiss();
      toast.success('¡Pregunta lista!');
    } catch (error) {
      console.error('Error al generar la pregunta:', error);
      toast.dismiss();
      toast.error('No se pudo generar la pregunta');
    } finally {
      setIsLoadingQuestion(false);
    }
  };
  
  const handleTryAgain = () => {
    generateChallengeQuestion();
  };
  
  const handleNextQuestion = () => {
    setChallengeQuestion(null);
    setSelectedCategory(null);
    setSelectedLanguage(null);
    setShowChallengeSelector(false);
  };
  
  const handleChangeChallenge = () => {
    setChallengeQuestion(null);
    setSelectedCategory(null);
    setSelectedLanguage(null);
    setShowChallengeSelector(true);
  };
  
  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };
  
  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };
  
  const goToContinuation = () => {
    navigate(`/story/${storyId}/continue?refresh=${Date.now()}`);
  };
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative">
        <BackButton onClick={() => {
          if (showChallengeSelector || showLanguageSelector || challengeQuestion) {
            // If in any challenge screen, go back to the story
            setShowChallengeSelector(false);
            setShowLanguageSelector(false);
            setChallengeQuestion(null);
          } else {
            // Otherwise go to home
            navigate('/home');
          }
        }} />
        
        <div className="absolute top-6 right-6 flex space-x-2">
          <button 
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all"
            aria-label="Compartir historia"
          >
            <Share size={20} />
          </button>
          <button 
            onClick={handlePrint}
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all"
            aria-label="Imprimir historia"
          >
            <Printer size={20} />
          </button>
        </div>
        
        <div className="container max-w-2xl mx-auto py-20 px-6">
          {/* Mostrar solo el título del capítulo */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white text-center mb-6"
          >
            {chapters.length > 1 
              ? `Capítulo ${currentChapterIndex + 1}: ${chapters[currentChapterIndex].title}`
              : story.title
            }
          </motion.h1>
          
          {story.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-8 bg-white/15 backdrop-blur-md flex items-center justify-center"
            >
              <img 
                src={story.imageUrl} 
                alt={story.title} 
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
          
          {/* Story content */}
          {!showChallengeSelector && !showLanguageSelector && !challengeQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-8 text-white leading-relaxed text-lg shadow-xl"
            >
              {chapters[currentChapterIndex].content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
              <div className="flex justify-between mt-4">
                {currentChapterIndex > 0 && (
                  <button
                    onClick={handlePreviousChapter}
                    className="nav-button"
                  >
                    <ChevronLeft size={20} />
                    Capítulo Anterior
                  </button>
                )}
                {currentChapterIndex < chapters.length - 1 && (
                  <button
                    onClick={handleNextChapter}
                    className="nav-button"
                  >
                    Capítulo Siguiente
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Selector de desafío */}
          {showChallengeSelector && (
            <ChallengeSelector 
              onSelectCategory={handleSelectCategory} 
              onContinue={handleContinueAfterCategory}
            />
          )}
          
          {/* Selector de idioma */}
          {showLanguageSelector && (
            <LanguageSelector 
              currentLanguage={profileSettings.language}
              onSelectLanguage={handleSelectLanguage}
              onContinue={handleContinueAfterLanguage}
              onBack={handleBackToCategories}
            />
          )}
          
          {/* Pregunta del desafío */}
          {challengeQuestion && (
            <ChallengeQuestion 
              question={challengeQuestion}
              onNextQuestion={handleNextQuestion}
              onTryAgain={handleTryAgain}
              onChangeChallenge={handleChangeChallenge}
            />
          )}
          
          {!showChallengeSelector && !showLanguageSelector && !challengeQuestion && (
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                {/* Botón de desafío */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <button
                    onClick={handleShowChallenge}
                    className="bg-story-orange-400 text-white hover:bg-story-orange-500 transition-all px-6 py-3 rounded-full font-medium flex items-center justify-center shadow-lg w-full"
                  >
                    <Award size={20} className="mr-2" />
                    ¿Aceptas el reto?
                  </button>
                </motion.div>
                
                {/* Botón de continuación de historia */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                >
                  <button
                    onClick={goToContinuation}
                    className="bg-purple-500 text-white hover:bg-purple-600 transition-all px-6 py-3 rounded-full font-medium flex items-center justify-center shadow-lg w-full"
                  >
                    <BookOpen size={20} className="mr-2" />
                    Continuar Historia
                  </button>
                </motion.div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <button
                    onClick={toggleAudioPlayer}
                    className="nav-button"
                  >
                    <Volume2 size={20} />
                    Narrar con Voz
                  </button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                >
                  <button
                    onClick={() => navigate("/home")}
                    className="nav-button"
                  >
                    <Home size={20} />
                    Volver al Inicio
                  </button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
