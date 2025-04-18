import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PenLine, Sparkles, Lightbulb, Wand2, Loader2 } from "lucide-react";

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
  
  // Asegurarse de que siempre tengamos 3 opciones
  useEffect(() => {
    const defaultOptions = [
      { summary: "Buscar el tesoro escondido en el bosque." },
      { summary: "Hablar con el misterioso anciano del pueblo." },
      { summary: "Seguir el camino hacia las montañas nevadas." }
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

  // Paleta de colores y gradientes distintos para cada opción
  const optionStyles = [
    { bg: "bg-[#7DC4E0]", icon: <Lightbulb className="shrink-0 mr-3" size={24} /> },
    { bg: "bg-[#f7c59f]", icon: <Wand2 className="shrink-0 mr-3" size={24} /> },
    { bg: "bg-[#F6A5B7]", icon: <Sparkles className="shrink-0 mr-3" size={24} /> }
  ];

  return (
    <div className="space-y-6">
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
          className={`w-full bg-[#BB79D1] hover:bg-[#BB79D1]/80 text-white rounded-2xl p-5 transition-all shadow-lg flex items-center justify-between ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className="text-lg font-semibold">Continuar Libre</span>
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
        <h3 className="text-lg font-medium mb-3 text-[#222] bg-white/70 rounded-xl px-4 py-2 text-center shadow-sm">Elige una opción:</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-6 bg-white/70 rounded-xl shadow-md">
            <Loader2 size={48} className="animate-spin text-[#BB79D1]" />
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
                className={`w-full text-left p-5 rounded-xl transition-all shadow-md flex ${optionStyles[index].bg} text-white ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-start mb-2">
                    {optionStyles[index].icon}
                    <span className="font-medium text-lg">{`Opción ${index + 1}`}</span>
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
          className="w-full bg-white/70 hover:bg-white/90 text-[#BB79D1] rounded-xl p-5 transition-all shadow-lg flex items-center justify-center font-semibold border-2 border-[#BB79D1]/30"
        >
          <PenLine size={20} className="mr-3 text-[#BB79D1]" />
          <span>Describir tu continuación soñada</span>
        </button>
      </motion.div>
    </div>
  );
}
