import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PenLine, Sparkles, Lightbulb, Wand2, Loader2 } from "lucide-react";

// Opciones de continuación de historia con estilo spicy y seductor

interface StoryContinuationOptionsProps {
  options: { summary: string }[];
  onSelectOption: (index: number) => void;
  onSelectFree: () => void;
  onSelectCustom: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function StoryContinuationOptions({
  options = [],
  onSelectOption,
  onSelectFree,
  onSelectCustom,
  isLoading = false,
  disabled = false
}: StoryContinuationOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [displayOptions, setDisplayOptions] = useState<{ summary: string }[]>([]);
  
  // Asegurar que siempre tengamos 3 opciones sensuales
  useEffect(() => {
    const defaultOptions = [
      { summary: "Explora el santuario secreto y ardiente." },
      { summary: "Sigue el susurro misterioso que te llama." },
      { summary: "Descubre el deseo prohibido que te consume." }
    ];
    
    if (options && options.length === 3) {
      setDisplayOptions(options);
    } else {
      console.warn("No se recibieron 3 opciones en el componente. Usando opciones predeterminadas.");
      setDisplayOptions(defaultOptions);
    }
  }, [options]);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setTimeout(() => onSelectOption(index), 300);
  };

  // Paleta de colores seductora con gradientes para cada opción
  const optionStyles = [
    { bg: "bg-gradient-to-r from-violet-500 to-purple-600", icon: <Lightbulb className="shrink-0 mr-3" size={24} /> },
    { bg: "bg-gradient-to-r from-pink-500 to-violet-500", icon: <Wand2 className="shrink-0 mr-3" size={24} /> },
    { bg: "bg-gradient-to-r from-purple-500 to-pink-500", icon: <Sparkles className="shrink-0 mr-3" size={24} /> }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Continuar Libre Option */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="w-full"
      >
        <button
          onClick={onSelectFree}
          disabled={disabled}
          className={`w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl p-5 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-between ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className="text-base sm:text-lg font-semibold">¡Sigue la diversión!</span>
          <ArrowRight size={20} />
        </button>
      </motion.div>

      {/* AI Options - Siempre mostrar esta sección */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-2"
      >
        <h3 className="text-base sm:text-lg font-medium mb-3 text-gray-200 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl px-4 py-2 text-center shadow-xl ring-1 ring-gray-700/50">Elige tu deseo, cariño:</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-6 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl shadow-xl ring-1 ring-gray-700/50">
            <Loader2 size={48} className="animate-spin text-violet-400" />
          </div>
        ) : (
          displayOptions.map((option, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => handleOptionSelect(index)}
                disabled={disabled}
                className={`w-full text-left p-5 rounded-xl transition-all shadow-lg flex ${optionStyles[index].bg} text-white hover:shadow-xl hover:scale-[1.02] ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-start mb-2">
                    {optionStyles[index].icon}
                    <span className="font-medium text-base sm:text-lg">{`Opción ${index + 1}`}</span>
                  </div>
                  <p className="pl-8 text-white/90">{option.summary}</p>
                </div>
                {selectedOption === index && (
                  <div className="flex items-center justify-center">
                    <ArrowRight size={18} />
                  </div>
                )}
              </button>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Custom Option */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
      >
        <button
          onClick={onSelectCustom}
          disabled={disabled}
          className="w-full bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700 rounded-xl p-5 transition-all shadow-lg flex items-center justify-center font-semibold backdrop-filter backdrop-blur-md hover:shadow-xl hover:scale-[1.02]"
        >
          <PenLine size={20} className="mr-3 text-violet-400" />
          <span className="text-base sm:text-lg">Describe tu fantasía, amor 🌶️</span>
        </button>
      </motion.div>
    </div>
  );
}
