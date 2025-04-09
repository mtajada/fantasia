import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ChallengeService } from '../services/ai/ChallengeService';

interface LanguageSelectorProps {
  currentLanguage: string;
  onSelectLanguage: (language: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function LanguageSelector({
  currentLanguage,
  onSelectLanguage,
  onContinue,
  onBack
}: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLanguages() {
      const availableLanguages = await ChallengeService.getAvailableLanguages(currentLanguage);
      setLanguages(availableLanguages);
    }
    
    fetchLanguages();
  }, [currentLanguage]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onSelectLanguage(languageCode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-8 text-white shadow-xl"
    >
      <button 
        onClick={onBack}
        className="mb-4 flex items-center text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        Volver a categorías
      </button>

      <h2 className="text-2xl font-bold text-center mb-6">Selecciona un idioma</h2>
      <p className="text-center mb-6">Elige el idioma que quieres aprender:</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              selectedLanguage === lang.code
                ? 'bg-story-blue-500 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="font-medium">{lang.name}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onContinue}
          disabled={!selectedLanguage}
          className={`flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all ${
            selectedLanguage
              ? 'bg-story-orange-400 text-white hover:bg-story-orange-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirmar <ChevronRight size={20} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
} 