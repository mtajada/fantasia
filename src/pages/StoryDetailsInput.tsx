import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStoryOptionsStore } from '../store/storyOptions/storyOptionsStore';
import PageTransition from '../components/PageTransition';
import BackButton from '../components/BackButton';
import StoryButton from '../components/StoryButton';

const StoryDetailsInput: React.FC = () => {
  const [details, setDetails] = useState('');
  const setAdditionalDetails = useStoryOptionsStore(
    (state) => state.setAdditionalDetails
  );
  const navigate = useNavigate();

  const handleGenerate = () => {
    // Pasar detalles solo si el textarea tiene contenido
    if (details.trim()) {
      setAdditionalDetails(details.trim());
    } else {
      setAdditionalDetails(undefined); // Tratar como omitido si está vacío
    }
    navigate('/generating'); // Navegar a la pantalla de generación
  };

  // Animaciones para los elementos de la página
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative overflow-auto py-16 px-6 flex flex-col">
        <BackButton />
        
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center pb-20 md:pb-0">
          {/* Título y subtítulo animados */}
          <motion.h1 
            className="text-3xl font-bold text-white mb-3 text-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            ¿Algún <span className="text-story-orange-400">detalle extra</span>?
          </motion.h1>
          
          <motion.p 
            className="mb-4 text-center text-white/80 max-w-lg mx-auto" // Reducido mb
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Añade instrucciones o ideas para personalizar tu historia.
          </motion.p>

          {/* Etiqueta "Opcional" */}
          <motion.label
            htmlFor="storyDetailsTextarea"
            className="block text-center text-green-400 font-medium mb-2" // Color verdoso
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
          >
            (Opcional)
          </motion.label>
          
          {/* Contenedor del textarea con animación */}
          <motion.div
            className="mb-6 w-full"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <textarea
              id="storyDetailsTextarea" // Añadido id para el label
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ej: Que el personaje principal descubra un mapa secreto..."
              className="w-full p-4 border-2 border-white/30 rounded-xl text-white bg-white/10 backdrop-blur-sm shadow-lg focus:ring-story-orange-400 focus:border-story-orange-400 h-36 resize-none placeholder-white/50"
            />
          </motion.div>
          
          {/* Botón único de Generar Historia */}
          <motion.div 
            className="flex justify-center w-full" // Centrar el botón
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <StoryButton
              onClick={handleGenerate}
              // Ya no necesita estar deshabilitado
              className="w-full max-w-md py-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-story-orange-500 to-story-orange-400 text-white rounded-full border-2 border-white/50 font-medium text-lg"
            >
              Generar Historia
            </StoryButton>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StoryDetailsInput;
