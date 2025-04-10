import { useNavigate } from "react-router-dom";
import { BookOpen, Settings, BookMarked, LogOut, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/user/userStore";
import { useStoriesStore } from "../store/stories/storiesStore";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const navigate = useNavigate();
  const { hasCompletedProfile, profileSettings, user, logoutUser, canCreateStory, isPremium, getRemainingMonthlyStories } = useUserStore();
  const { generatedStories } = useStoriesStore();
  const { toast } = useToast();
  
  // Redirect to profile setup if not completed
  if (!hasCompletedProfile()) {
    navigate("/profile");
    return null;
  }
  
  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
    navigate("/profile");
  };

  const handleNewStory = () => {
    if (canCreateStory()) {
      navigate("/duration");
    } else {
      toast({
        title: "Límite de historias alcanzado",
        description: isPremium() 
          ? "Has alcanzado el límite de historias para tu plan premium. Contacta con soporte para más información."
          : `Has alcanzado el límite mensual de historias gratuitas. Actualiza a premium para crear más historias.`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 right-6 flex gap-4"
        >
          <button
            onClick={() => {
              console.log("Navegando a página de perfil");
              navigate("/profile");
            }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
            aria-label="Editar perfil"
          >
            <Settings size={20} />
          </button>
          
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <LogOut size={20} />
          </button>
        </motion.div>
        
        <div className="w-full max-w-md flex flex-col items-center space-y-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-story-orange-400 to-story-orange-500 flex items-center justify-center shadow-lg"
          >
            <BookOpen size={40} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-bold text-white text-center"
          >
            CuentaSueños
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full space-y-4"
          >
            <StoryButton 
              onClick={handleNewStory}
              isFullWidth
              disabled={!canCreateStory()}
              title={!canCreateStory() ? `Te quedan ${getRemainingMonthlyStories()} historias este mes` : ""}
            >
              Generar una Nueva Historia
              {!canCreateStory() && <AlertCircle className="ml-2 h-4 w-4" />}
            </StoryButton>
            
            <StoryButton 
              onClick={() => navigate("/characters-management")}
              variant="secondary"
              isFullWidth
              icon={<User size={20} />}
            >
              Mis Personajes
            </StoryButton>
            
            {generatedStories.length > 0 && (
              <StoryButton 
                onClick={() => navigate("/stories")}
                variant="secondary"
                isFullWidth
                icon={<BookMarked size={20} />}
              >
                Mis Historias
              </StoryButton>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
