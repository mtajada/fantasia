import { motion } from "framer-motion";
import { BookOpen, Sparkles, Headphones, Brain, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";
import { useUserStore } from "../store/user/userStore";

export default function Welcome() {
  const navigate = useNavigate();
  const { checkAuth, user } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          navigate("/home");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthentication();
  }, [checkAuth, navigate]);
  
  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center overflow-auto text-white">
        <div className="w-full max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-story-orange-400 to-story-orange-500 flex items-center justify-center shadow-xl mb-4"
          >
            <BookOpen size={48} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
          >
            CuentaSueños
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-center text-white/80 text-sm md:text-base lg:text-lg mb-6 md:mb-8"
          >
            Crea historias personalizadas para momentos mágicos
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 md:gap-5 w-full max-w-xs sm:max-w-md mb-8 md:mb-10"
          >
            <button 
              onClick={() => navigate("/login")}
              className="flex-1 py-2.5 px-4 md:py-3 md:px-5 bg-gradient-to-r from-story-orange-500 to-story-orange-400 rounded-lg text-white font-medium shadow-lg hover:shadow-xl hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogIn size={16} className="md:w-5 md:h-5" />
              <span>Iniciar Sesión</span>
            </button>
            
            <button 
              onClick={() => navigate("/signup")}
              className="flex-1 py-2.5 px-4 md:py-3 md:px-5 bg-purple-800/40 backdrop-blur-sm border border-white/10 rounded-lg text-white font-medium shadow-lg hover:shadow-xl hover:bg-purple-700/40 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} className="md:w-5 md:h-5" />
              <span>Registrarse</span>
            </button>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="w-full"
          >
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-center mb-3 md:mb-5">¿Qué puedes hacer con CuentaSueños?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-5 lg:gap-8">
              <FeatureCard 
                icon={<Sparkles className="text-yellow-400 md:w-6 md:h-6" size={18} />}
                title="Historias Personalizadas"
                description="Cuentos adaptados a los gustos y personalidad de cada niño."
              />
              
              <FeatureCard 
                icon={<Headphones className="text-blue-400 md:w-6 md:h-6" size={18} />}
                title="Narración de Voz"
                description="Narraciones profesionales que dan vida a cada historia."
              />
              
              <FeatureCard 
                icon={<Brain className="text-green-400 md:w-6 md:h-6" size={18} />}
                title="Retos Educativos"
                description="Mejora lectura, matemáticas e idiomas con juegos divertidos."
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-6 md:mt-10 text-center"
          >
            <p className="text-xs md:text-sm lg:text-base text-white/70">
              Únete a miles de familias creando momentos mágicos con CuentaSueños
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-purple-800/30 rounded-lg p-2.5 md:p-4 lg:p-6 backdrop-blur-sm border border-white/10 shadow-lg h-full">
      <div className="flex items-center mb-1.5 md:mb-3">
        {icon}
        <h3 className="text-sm md:text-base lg:text-lg font-semibold ml-1.5 md:ml-2">{title}</h3>
      </div>
      <p className="text-white/70 text-xs md:text-sm lg:text-base">{description}</p>
    </div>
  );
}
