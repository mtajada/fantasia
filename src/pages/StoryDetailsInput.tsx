import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStoryOptionsStore } from '../store/storyOptions/storyOptionsStore';
import PageTransition from '../components/PageTransition';
import BackButton from '../components/BackButton';
import StoryButton from '../components/StoryButton';
import { supabase } from '../supabaseClient';
import type { PresetSuggestion } from '../types';
import { RefreshCw, Sparkles } from 'lucide-react';

const StoryDetailsInput: React.FC = () => {
  const [detailsText, setDetailsText] = useState('');
  const setAdditionalDetails = useStoryOptionsStore(
    (state) => state.setAdditionalDetails
  );
  const navigate = useNavigate();

  // --- Estado para Presets --- 
  const [presets, setPresets] = useState<PresetSuggestion[]>([]);
  const [allPresets, setAllPresets] = useState<PresetSuggestion[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState<boolean>(true);

  // --- Función para obtener todos los presets --- 
  const fetchAndStoreAllPresets = useCallback(async () => {
    setIsLoadingPresets(true);
    try {
      const { data, error } = await supabase
        .from('preset_suggestions')
        .select('id, text_prompt')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching presets:', error.message);
      } else if (data) {
        setAllPresets(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching presets:', err);
    } finally {
      setIsLoadingPresets(false);
    }
  }, []);

  // --- Función para seleccionar 3 presets aleatorios --- 
  const selectRandomPresets = useCallback(() => {
    if (allPresets.length < 3) {
      setPresets(allPresets);
      return;
    }

    // Algoritmo simple de aleatorización: barajar y tomar 3
    const shuffled = [...allPresets].sort(() => 0.5 - Math.random());
    setPresets(shuffled.slice(0, 3));
  }, [allPresets]);

  // --- Efecto para cargar todos los presets al montar --- 
  useEffect(() => {
    fetchAndStoreAllPresets();
  }, [fetchAndStoreAllPresets]);

  // --- Efecto para seleccionar los primeros presets aleatorios --- 
  useEffect(() => {
    if (allPresets.length > 0) {
      selectRandomPresets();
    }
  }, [allPresets, selectRandomPresets]);

  // --- Manejador para generar historia --- 
  const handleGenerate = () => {
    // Pasar detalles solo si el textarea tiene contenido
    if (detailsText.trim()) {
      setAdditionalDetails(detailsText.trim());
    } else {
      setAdditionalDetails(undefined); // Tratar como omitido si está vacío
    }
    navigate('/generating'); // Navegar a la pantalla de generación
  };

  // --- Manejador para aplicar un preset al textarea --- 
  const handlePresetClick = (text: string) => {
    setDetailsText(text);
  };

  // Animaciones para los elementos de la página
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Animación para los presets
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundImage: "url(/fondo_png.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <BackButton />
        
        <div className="w-full max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
          {/* Título y subtítulo animados */}
          <motion.h1 
            className="text-3xl font-bold text-[#BB79D1] mb-3 text-center font-heading drop-shadow-lg"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            ¿Algún <span className="text-[#F6A5B7]">detalle extra</span>?
          </motion.h1>
          
          <motion.p 
            className="mb-4 text-center text-[#222] bg-white/80 rounded-xl px-4 py-2 font-medium shadow-sm max-w-lg mx-auto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Añade instrucciones o ideas para personalizar tu historia.
          </motion.p>

          {/* Badge "Paso opcional" */}
          <motion.div
            className="flex justify-center mb-2"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
          >
            <span className="inline-flex items-center px-4 py-1 rounded-2xl text-sm font-semibold bg-white/70 border-2 border-[#A5D6F6]/40 text-[#7DC4E0] shadow-sm" style={{letterSpacing:'0.01em'}}>
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Paso opcional
            </span>
          </motion.div>
          
          {/* Sección de Presets */}
          <motion.div
            className="mb-4 w-full"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-[#222]">
                <Sparkles size={16} className="mr-1 text-[#F9DA60]" />
                <span className="text-sm font-medium">Ideas para inspirarte:</span>
              </div>
              
              <button
                onClick={selectRandomPresets}
                disabled={isLoadingPresets || allPresets.length < 3}
                className="text-[#7DC4E0] hover:text-[#BB79D1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center bg-white/70 px-2 py-1 rounded-full shadow-sm"
              >
                <RefreshCw size={14} className="mr-1" />
                Nuevas ideas
              </button>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4"
            >
              {isLoadingPresets ? (
                <div className="col-span-full flex justify-center py-3 bg-white/70 rounded-xl">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 bg-[#BB79D1]/60 rounded-full"></div>
                    <div className="h-2 w-2 bg-[#BB79D1]/60 rounded-full"></div>
                    <div className="h-2 w-2 bg-[#BB79D1]/60 rounded-full"></div>
                  </div>
                </div>
              ) : presets.length > 0 ? (
                presets.map((preset) => (
                  <motion.div key={preset.id} variants={item}>
                    <button
                      onClick={() => handlePresetClick(preset.text_prompt)}
                      className="w-full text-left p-3 rounded-xl bg-white/70 border-2 border-[#F6A5B7]/30 text-[#222] text-sm hover:bg-[#F6A5B7]/10 transition-all shadow-sm hover:shadow-md"
                    >
                      {preset.text_prompt}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-[#555] text-sm italic py-3 bg-white/70 rounded-xl">
                  No hay sugerencias disponibles.
                </div>
              )}
            </motion.div>
          </motion.div>
          
          {/* Contenedor del textarea con animación */} 
          <motion.div
            className="mb-6 w-full"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.25 }}
          >
            <textarea
              id="storyDetailsTextarea"
              value={detailsText}
              onChange={(e) => setDetailsText(e.target.value)}
              placeholder="Escribe tus ideas o selecciona una de las sugerencias de arriba..."
              className="w-full p-4 border-2 border-[#BB79D1]/40 rounded-xl text-[#222] bg-white/70 shadow-lg focus:ring-[#BB79D1] focus:border-[#BB79D1] h-32 resize-none placeholder-[#555]/70"
            />
          </motion.div>
          
          {/* Botón único de Generar Historia */} 
          <motion.div 
            className="flex justify-center w-full mt-2 mb-2"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <StoryButton
              onClick={handleGenerate}
              className="w-full max-w-xs py-4 rounded-2xl text-white text-lg font-semibold shadow-lg bg-[#BB79D1] hover:bg-[#BB79D1]/90 border-2 border-[#BB79D1]/50 transition-all duration-200"
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
