import { motion } from "framer-motion";

interface IconLoadingAnimationProps {
  message?: string;
}

export default function IconLoadingAnimation({ message = "Loading..." }: IconLoadingAnimationProps) {
  // Variantes para la animación del icono principal
  const iconVariants = {
    rotate: {
      rotate: [0, 10, 0, -10, 0],
      y: [0, -10, 0, -5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  // Variantes para las estrellas/partículas
  const particleVariants = {
    animate: (i: number) => ({
      opacity: [0, 0.8, 0],
      scale: [0.4, 1, 0.4],
      y: [0, -40, 0],
      x: [0, i * 15, 0],
      rotate: [0, i * 30, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut",
      }
    })
  };

  // Variantes para el brillo
  const glowVariants = {
    animate: {
      opacity: [0.4, 0.8, 0.4],
      scale: [0.9, 1.1, 0.9],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  // Variantes para el texto
  const textVariants = {
    animate: {
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  // Crear un array para las partículas
  const particles = Array.from({ length: 5 }, (_, i) => i - 2);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative">
        {/* Círculo de brillo detrás del icono */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F6A5B7]/40 to-[#BB79D1]/40 blur-md"
          variants={glowVariants}
          animate="animate"
        />
        
        {/* Partículas/estrellas alrededor del icono */}
        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-4 h-4"
            custom={i}
            variants={particleVariants}
            animate="animate"
          >
            <div className="w-full h-full bg-[#F9DA60] rounded-full" />
          </motion.div>
        ))}
        
        {/* Icono principal */}
        <motion.div
          className="relative z-10 w-32 h-32 flex items-center justify-center"
          variants={iconVariants}
          animate="rotate"
        >
          <img 
            src="/icono_png.png" 
            alt="Cuenta Cuentos" 
            className="w-full h-full object-contain drop-shadow-lg" 
          />
        </motion.div>
      </div>
      
      {/* Mensaje de carga */}
      <motion.p
        className="text-xl font-medium text-[#222] bg-white/80 px-6 py-2 rounded-xl shadow-md font-heading"
        variants={textVariants}
        animate="animate"
      >
        {message}
      </motion.p>
    </div>
  );
}
