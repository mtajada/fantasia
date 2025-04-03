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
      className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-8 text-white shadow-xl"
    >
      <h2 className="text-2xl font-bold text-center mb-6">¿Aceptas el reto?</h2>
      <p className="text-center mb-6">Elige un tipo de desafío:</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => handleCategorySelect('language')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all ${
            selectedCategory === 'language'
              ? 'bg-story-blue-500 text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <Book className="mr-1" size={24} />
            <span className="text-2xl">🌍</span>
          </div>
          <span className="font-medium">Aprende un idioma</span>
        </button>

        <button
          onClick={() => handleCategorySelect('math')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all ${
            selectedCategory === 'math'
              ? 'bg-story-blue-500 text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <Calculator className="mr-1" size={24} />
            <span className="text-2xl">➗</span>
          </div>
          <span className="font-medium">Reto matemático</span>
        </button>

        <button
          onClick={() => handleCategorySelect('comprehension')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all ${
            selectedCategory === 'comprehension'
              ? 'bg-story-blue-500 text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <Brain className="mr-1" size={24} />
            <span className="text-2xl">🧩</span>
          </div>
          <span className="font-medium">Comprensión lectora</span>
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onContinue}
          disabled={!selectedCategory}
          className={`flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all ${
            selectedCategory
              ? 'bg-story-orange-400 text-white hover:bg-story-orange-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continuar <ChevronRight size={20} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
} 