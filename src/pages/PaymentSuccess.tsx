import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import StoryButton from "../components/StoryButton";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Extraer session_id de la URL
    const queryParams = new URLSearchParams(location.search);
    const sessionIdParam = queryParams.get('session_id');
    
    if (sessionIdParam) {
      console.log("ID de sesión de Stripe:", sessionIdParam);
      setSessionId(sessionIdParam);
      
      // Opcional: Aquí podrías hacer una llamada a una Edge Function para verificar 
      // el estado de la sesión si necesitas confirmación inmediata
    }
  }, [location]);

  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6 
          }}
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
        >
          <CheckCircle size={60} className="text-green-600" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center max-w-md"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-white/80 text-lg mb-6">
            Gracias por tu compra. Tu cuenta se actualizará en breve.
            {sessionId && <span className="block mt-2 text-sm opacity-70">ID de transacción: {sessionId.substring(0, 8)}...</span>}
          </p>
          
          <div className="flex flex-col gap-4">
            <StoryButton
              onClick={() => navigate('/home')}
              isFullWidth
            >
              Volver al inicio
            </StoryButton>
            
            <StoryButton
              onClick={() => navigate('/profile')}
              isFullWidth
              variant="outline"
            >
              Ver mi perfil
            </StoryButton>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
