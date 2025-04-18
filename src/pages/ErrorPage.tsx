import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const error = location.state?.error || "Algo salió mal";

  const tryAgain = () => {
    navigate(-1);
  };

  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6"
          >
            <AlertTriangle size={44} className="text-story-orange-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-white mb-4"
          >
            ¡Ups! Ocurrió un error
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-white/90 mb-10 text-lg"
          >
            Nuestros asistentes de TaleMe! están teniendo problemas para crear tu historia. Por favor, inténtalo de nuevo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4 w-full"
          >
            <StoryButton
              onClick={tryAgain}
              isFullWidth
              className="text-lg font-medium tracking-wide nav-button w-full !rounded-2xl"
              icon={<RefreshCw className="animate-spin-slow" />}
            >
              Intentar nuevamente
            </StoryButton>

            <StoryButton
              onClick={() => navigate("/home")}
              variant="secondary"
              isFullWidth
              className="text-lg nav-button w-full !rounded-2xl"
              icon={<Home />}
            >
              Volver al inicio
            </StoryButton>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
