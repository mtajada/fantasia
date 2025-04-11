import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Settings, BookMarked, User, AlertCircle, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/user/userStore";
import { useStoriesStore } from "../store/stories/storiesStore";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const navigate = useNavigate();
  const { hasCompletedProfile, profileSettings, user, canCreateStory, isPremium, getRemainingMonthlyStories } = useUserStore();
  const { generatedStories } = useStoriesStore();
  const { toast } = useToast();

  // Redirect to profile setup if not completed
  if (!hasCompletedProfile()) {
    navigate("/profile");
    return null;
  }

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

  const premiumUser = isPremium();
  const subscriptionText = premiumUser ? 'Premium' : 'Free';

  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-6 relative">
        {/* Top navigation buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 right-6 flex gap-4 items-center"
        >
          {/* Subscription Status Button (Link to /plans) */}
          <Link
            to="/plans"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md transition-all duration-200 
                       ${premiumUser
                ? 'bg-white/20 backdrop-blur-md border border-amber-400/30 text-amber-300 hover:bg-white/25'
                : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 text-white'
              } text-sm font-medium transform hover:scale-105 active:scale-95`}
            aria-label="Ver planes y suscripción"
          >
            <Star className="h-4 w-4" />
            <span>{subscriptionText}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-75" />
          </Link>

          {/* User Profile Button (Link to /profile-config) */}
          <Link
            to="/profile-config"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/15 hover:scale-105 active:scale-95 transition-all shadow-md"
            aria-label="Configuración de Perfil"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Settings Button (Link to /settings) */}
          <Link
            to="/settings"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/15 hover:scale-105 active:scale-95 transition-all shadow-md"
            aria-label="Ajustes"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </motion.div>

        <div className="w-full max-w-md flex flex-col items-center space-y-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 rounded-full bg-amber-500/80 flex items-center justify-center shadow-xl border border-amber-400/50"
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
