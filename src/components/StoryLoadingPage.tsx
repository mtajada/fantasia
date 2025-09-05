import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';

// Página de carga con tips picantes mientras se genera la historia

interface StoryLoadingPageProps {
  type: 'generation' | 'continuation';
  characters?: Array<{name: string; gender: string}>;
  genre?: string;
  format?: string;
  onComplete?: () => void;
}

const CONSEJOS_PICANTES = [
  "Personaliza tu historia con preferencias de contenido explícito 🌶️",
  "Crea varios personajes y haz que interactúen de forma ardiente ✨",
  "Prueba diferentes situaciones y escenarios sensuales 🎭",
  "Tu historia puede ser narrada con voces seductoras 💫",
  "Continúa tu historia si te encanta hacia dónde va, cariño 🔥",
  "Explora diferentes géneros e intensidades eróticas 🪄",
  "Añade detalles personales para hacerla únicamente tuya 🤫",
  "Los personajes pueden tener relaciones complejas y deseos ardientes 💎",
  "Establece el ambiente con diferentes formatos de historia 🌙",
  "La IA crea contenido personalizado solo para ti, belleza ✨",
  "Las historias pueden ir de lo sensual a lo apasionado 🌶️",
  "Construye tensión con narrativa episódica 📚",
  "Las historias únicas ofrecen satisfacción completa 💫",
  "La narración de voz añade un toque íntimo 🎭",
  "Las características premium desbloquean posibilidades ilimitadas 💎",
  "Tus preferencias moldean cada detalle de la historia 🪄",
  "Múltiples personajes crean dinámicas complejas y excitantes 🔥",
  "Las historias se adaptan a tus gustos personales, amor 🤫",
  "Las opciones de continuación te permiten dirigir la trama 🌙",
  "Cada historia se crea pensando en tus deseos ✨",
  "La IA entiende los matices y la sofisticación 💫",
  "Las historias pueden explorar cualquier tema o escenario 🎭",
  "Tu imaginación es el único límite, cariño 🌶️",
  "La privacidad y discreción siempre se mantienen 🤫",
  "Las voces premium mejoran la experiencia sensual 💎",
  "Las historias evolucionan según tus elecciones 🔥",
  "Cada detalle se adapta a tus preferencias 🪄",
  "Crea tu mundo de fantasía perfecta 🌙",
  "La IA genera contenido que sorprende y deleita ✨",
  "Tu historia, tus reglas, tu satisfacción, belleza 💫"
];

const StoryLoadingPage: React.FC<StoryLoadingPageProps> = ({ 
  type, 
  characters, 
  genre, 
  format, 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          onComplete?.();
          return 100;
        }
        return prev + (100 / 150); // 15 seconds * 10 updates per second
      });
    }, 100);
    
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % CONSEJOS_PICANTES.length);
    }, 3000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [onComplete]);
  
  const getMainMessage = () => {
    if (type === 'generation') {
      return "Estamos creando tu historia personalizada, cariño...";
    } else {
      return "Creando la continuación de tu historia sensual...";
    }
  };
  
  const getSubMessage = () => {
    if (type === 'generation') {
      return "Tu historia se está adaptando a tus preferencias. Por favor mantente en esta página mientras hacemos nuestra magia ✨";
    } else {
      return "Continuando tu historia con el siguiente capítulo perfecto. ¡No tardaremos mucho, amor! 🪄";
    }
  };
  
  return (
    <PageTransition>
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: 'black' }}
      >
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mb-8"
          >
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Preparando tu historia...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
          
          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 mb-6 text-center shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-3">
              {getMainMessage()}
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {getSubMessage()}
            </p>
          </motion.div>
          
          {/* Story Details */}
          {(characters || genre || format) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 mb-6 w-full shadow-2xl"
            >
              <div className="grid grid-cols-3 gap-2">
                {characters && characters.length > 0 && (
                  <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                    <p className="text-xs font-semibold text-blue-400">Personajes ({characters.length})</p>
                    <p className="text-sm text-gray-300 truncate">
                      {characters.map(char => char.name).join(', ')}
                    </p>
                  </div>
                )}
                
                {genre && (
                  <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
                    <p className="text-xs font-semibold text-purple-400">Género</p>
                    <p className="text-sm text-gray-300 truncate">{genre}</p>
                  </div>
                )}
                
                {format && (
                  <div className="bg-yellow-500/20 p-2 rounded-lg border border-yellow-500/30">
                    <p className="text-xs font-semibold text-yellow-400">Formato</p>
                    <p className="text-sm text-gray-300 truncate">
                      {format === 'single' ? 'Historia Completa' : 'Por Capítulos'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Rotating Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 text-center shadow-2xl"
          >
            <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent mb-3">
              ¿Sabías que...?
            </h3>
            <motion.p
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-gray-300 text-sm leading-relaxed"
            >
              {CONSEJOS_PICANTES[currentTip]}
            </motion.p>
          </motion.div>
          
        </div>
      </div>
    </PageTransition>
  );
};

export default StoryLoadingPage;