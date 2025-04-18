import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Calculator, Brain, ChevronRight } from 'lucide-react';
import { ChallengeCategory } from '../types';

interface ChallengeSelectorProps {
  onSelectCategory: (category: ChallengeCategory) => void;
  onContinue: () => void;
}

export default function ChallengeSelector({ onSelectCategory, onContinue }: ChallengeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);

  const handleCategorySelect = (category: ChallengeCategory) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 rounded-2xl p-6 mb-8 text-[#222] shadow-lg"
    >
      <h2 className="text-2xl font-bold text-center mb-4 text-[#BB79D1] font-heading drop-shadow-lg">¿Aceptas el reto?</h2>
      <p className="text-center mb-6 font-medium">Elige un tipo de desafío:</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => handleCategorySelect('language')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all shadow-md ${
            selectedCategory === 'language'
              ? 'bg-[#7DC4E0] text-white border-2 border-[#7DC4E0] ring-2 ring-[#7DC4E0]/50'
              : 'bg-white/70 border-2 border-[#7DC4E0]/30 text-[#222] hover:bg-[#7DC4E0]/10'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <Book className={`mr-1 ${selectedCategory === 'language' ? 'text-white' : 'text-[#7DC4E0]'}`} size={24} />
            <span className="text-2xl">🌍</span>
          </div>
          <span className="font-medium">Aprende un idioma</span>
        </button>

        <button
          onClick={() => handleCategorySelect('math')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all shadow-md ${
            selectedCategory === 'math'
              ? 'bg-[#F9DA60] text-[#222] border-2 border-[#F9DA60] ring-2 ring-[#F9DA60]/50'
              : 'bg-white/70 border-2 border-[#F9DA60]/30 text-[#222] hover:bg-[#F9DA60]/10'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <Calculator className={`mr-1 ${selectedCategory === 'math' ? 'text-[#222]' : 'text-[#F9DA60]'}`} size={24} />
            <span className="text-2xl">➗</span>
          </div>
          <span className="font-medium">Reto matemático</span>
        </button>

        <button
          onClick={() => handleCategorySelect('comprehension')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all shadow-md ${
            selectedCategory === 'comprehension'
              ? 'bg-[#F6A5B7] text-white border-2 border-[#F6A5B7] ring-2 ring-[#F6A5B7]/50'
              : 'bg-white/70 border-2 border-[#F6A5B7]/30 text-[#222] hover:bg-[#F6A5B7]/10'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <Brain className={`mr-1 ${selectedCategory === 'comprehension' ? 'text-white' : 'text-[#F6A5B7]'}`} size={24} />
            <span className="text-2xl">🧩</span>
          </div>
          <span className="font-medium">Comprensión lectora</span>
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onContinue}
          disabled={!selectedCategory}
          className={`flex items-center justify-center px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg text-base ${
            selectedCategory
              ? 'bg-[#BB79D1] hover:bg-[#BB79D1]/80 text-white active:bg-[#E6B7D9] focus:bg-[#E6B7D9]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continuar <ChevronRight size={20} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
}