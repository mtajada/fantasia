import { useNavigate } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";
import { motion } from "framer-motion";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";

export default function NotFound() {
  const navigate = useNavigate();
  
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
            <FileQuestion size={40} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Página no encontrada
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-white/80 mb-8"
          >
            Parece que te has aventurado a un lugar que no existe en nuestro mundo mágico.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button onClick={() => navigate("/")} className="nav-button">
              <Home size={20} />
              Volver al inicio
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
