import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
import BackButton from "../components/BackButton";
import PageTransition from "../components/PageTransition";
import StoryChapter from "../components/StoryChapter";
import StoryContinuationOptions from "../components/StoryContinuationOptions";
import StoryContinuationCustomInput from "../components/StoryContinuationCustomInput";
import { toast } from "sonner";
import { StoryChapter as StoryChapterType } from "../types";
import { StoryContinuationService } from "../services/ai/StoryContinuationService";

export default function StoryContinuation() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getStoryById } = useStoriesStore();
  const { getChaptersByStoryId, addChapter } = useChaptersStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [continuationOptions, setContinuationOptions] = useState<{ summary: string }[]>([]);
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState<StoryChapterType[]>([]);
  // Flag para controlar si debe regenerar opciones
  const [shouldGenerateOptions, setShouldGenerateOptions] = useState(true);
  
  useEffect(() => {
    if (!storyId) {
      navigate("/home");
      return;
    }
    
    const fetchedStory = getStoryById(storyId);
    if (!fetchedStory) {
      navigate("/not-found");
      return;
    }
    
    setStory(fetchedStory);
    
    // Get existing chapters or create initial chapter from story content
    const existingChapters = getChaptersByStoryId(storyId);
    
    if (existingChapters.length === 0) {
      // Create first chapter from original story
      const initialChapter: StoryChapterType = {
        chapterNumber: 1,
        title: fetchedStory.title,
        content: fetchedStory.content,
        createdAt: fetchedStory.createdAt
      };
      
      setChapters([initialChapter]);
      // Store this initial chapter
      addChapter(storyId, initialChapter);
    } else {
      setChapters(existingChapters);
    }
  }, [storyId]);
  
  // Efecto para activar la regeneración de opciones al entrar a la página
  useEffect(() => {
    // Verificar si hay un parámetro de refresh en la URL
    const searchParams = new URLSearchParams(location.search);
    const refreshParam = searchParams.get('refresh');
    
    // Siempre activar la regeneración al entrar, pero especialmente si viene con parámetro refresh
    setShouldGenerateOptions(true);
  }, [location.search]);
  
  // Efecto para generar nuevas opciones cada vez que cambian los capítulos
  useEffect(() => {
    if (story && chapters.length > 0 && shouldGenerateOptions) {
      generateOptions();
      setShouldGenerateOptions(false);
    }
  }, [chapters, story, shouldGenerateOptions]);
  
  const generateOptions = async () => {
    if (!story || chapters.length === 0) return;
    
    setIsLoadingOptions(true);
    try {
      const options = await StoryContinuationService.generateContinuationOptions(story, chapters);
      // Asegurarse de que siempre tengamos 3 opciones
      if (options && options.options && options.options.length === 3) {
        setContinuationOptions(options.options);
      } else {
        console.warn("No se recibieron 3 opciones. Usando opciones predeterminadas.");
        // Proporcionar opciones predeterminadas si la API no devuelve exactamente 3
        setContinuationOptions([
          { summary: "Buscar el tesoro escondido en el bosque." },
          { summary: "Hablar con el misterioso anciano del pueblo." },
          { summary: "Seguir el camino hacia las montañas nevadas." }
        ]);
      }
    } catch (error) {
      console.error("Error generating continuation options:", error);
      toast.error("No se pudieron generar las opciones de continuación");
      // Set fallback options
      setContinuationOptions([
        { summary: "Buscar el tesoro escondido en el bosque." },
        { summary: "Hablar con el misterioso anciano del pueblo." },
        { summary: "Seguir el camino hacia las montañas nevadas." }
      ]);
    } finally {
      setIsLoadingOptions(false);
    }
  };
  
  const handleSelectFree = async () => {
    if (!story || !storyId) return;
    
    setIsLoading(true);
    toast.loading("Generando continuación...");
    
    try {
      const content = await StoryContinuationService.generateFreeContinuation(story, chapters);
      const title = await StoryContinuationService.generateChapterTitle(content);
      
      const newChapter: StoryChapterType = {
        chapterNumber: chapters.length + 1,
        title,
        content,
        createdAt: new Date().toISOString(),
        generationMethod: "free"
      };
      
      // Add chapter to store
      addChapter(storyId, newChapter);
      
      // Update local state
      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);
      
      toast.dismiss();
      toast.success("¡Continuación generada con éxito!");
      
      // Activar regeneración para la próxima visita
      setShouldGenerateOptions(true);
      
      // Redirigir a la historia con el nuevo capítulo (último capítulo)
      // Usamos updatedChapters.length - 1 para obtener el índice del último capítulo (base 0)
      navigate(`/story/${storyId}?chapter=${updatedChapters.length - 1}`);
    } catch (error) {
      console.error("Error generating free continuation:", error);
      toast.dismiss();
      toast.error("No se pudo generar la continuación");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectOption = async (index: number) => {
    if (!story || !storyId) return;
    
    setIsLoading(true);
    toast.loading("Generando continuación...");
    
    try {
      const content = await StoryContinuationService.generateOptionContinuation(story, chapters, index);
      const title = await StoryContinuationService.generateChapterTitle(content);
      
      const newChapter: StoryChapterType = {
        chapterNumber: chapters.length + 1,
        title,
        content,
        createdAt: new Date().toISOString(),
        generationMethod: `option${index + 1}` as "option1" | "option2" | "option3"
      };
      
      // Add chapter to store
      addChapter(storyId, newChapter);
      
      // Update local state
      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);
      
      toast.dismiss();
      toast.success("¡Continuación generada con éxito!");
      
      // Activar regeneración para la próxima visita
      setShouldGenerateOptions(true);
      
      // Redirigir a la historia con el nuevo capítulo (último capítulo)
      // Usamos updatedChapters.length - 1 para obtener el índice del último capítulo (base 0)
      navigate(`/story/${storyId}?chapter=${updatedChapters.length - 1}`);
    } catch (error) {
      console.error("Error generating option continuation:", error);
      toast.dismiss();
      toast.error("No se pudo generar la continuación");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCustomContinuation = async (userDirection: string) => {
    if (!story || !storyId) return;
    
    setIsLoading(true);
    toast.loading("Generando continuación personalizada...");
    
    try {
      const content = await StoryContinuationService.generateDirectedContinuation(story, chapters, userDirection);
      const title = await StoryContinuationService.generateChapterTitle(content);
      
      const newChapter: StoryChapterType = {
        chapterNumber: chapters.length + 1,
        title,
        content,
        createdAt: new Date().toISOString(),
        generationMethod: "custom",
        customInput: userDirection
      };
      
      // Add chapter to store
      addChapter(storyId, newChapter);
      
      // Update local state
      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);
      
      // Hide custom input form
      setShowCustomInput(false);
      
      toast.dismiss();
      toast.success("¡Continuación personalizada generada con éxito!");
      
      // Activar regeneración para la próxima visita
      setShouldGenerateOptions(true);
      
      // Redirigir a la historia con el nuevo capítulo (último capítulo)
      navigate(`/story/${storyId}?chapter=${updatedChapters.length - 1}`);
    } catch (error) {
      console.error("Error generating custom continuation:", error);
      toast.dismiss();
      toast.error("No se pudo generar la continuación personalizada");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loader when generating content
  if (isLoading) {
    return (
      <PageTransition>
        <div className="gradient-bg min-h-screen flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin mb-6 mx-auto"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Generando continuación...</h2>
            <p className="text-white/80">Estamos creando una continuación mágica para tu historia.</p>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative">
        <BackButton 
          onClick={() => {
            if (showCustomInput) {
              setShowCustomInput(false);
            } else {
              navigate(`/story/${storyId}`);
            }
          }} 
        />
        
        <div className="container max-w-2xl mx-auto py-20 px-6">
          {/* Chapter Header - Solo mostrar el título del capítulo anterior */}
          {chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 text-white"
            >
              <div className="flex items-center">
                <BookOpen size={20} className="mr-2 text-story-orange-400" />
                <h2 className="text-lg font-medium">
                  {chapters[chapters.length - 1].title || `Capítulo ${chapters.length}`}
                </h2>
              </div>
            </motion.div>
          )}
          
          {/* Título de la sección */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            ¿Cómo quieres que continúe?
          </motion.h2>
          
          {/* Continuation Options */}
          {!showCustomInput && (
            <StoryContinuationOptions 
              options={continuationOptions}
              onSelectOption={handleSelectOption}
              onSelectFree={handleSelectFree}
              onSelectCustom={() => setShowCustomInput(true)}
              isLoading={isLoadingOptions}
            />
          )}
          
          {/* Custom Input */}
          {showCustomInput && (
            <StoryContinuationCustomInput 
              onSubmit={handleCustomContinuation}
              onBack={() => setShowCustomInput(false)}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
