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
      className="bg-white/80 rounded-2xl p-6 mb-8 text-[#222] shadow-lg"
    >
      <button 
        onClick={onBack}
        className="mb-4 flex items-center text-[#BB79D1] hover:text-[#F6A5B7] transition-colors font-medium"
      >
        <ArrowLeft size={16} className="mr-1" />
        Volver a categorías
      </button>

      <h2 className="text-2xl font-bold text-center mb-4 text-[#BB79D1] font-heading drop-shadow-lg">Selecciona un idioma</h2>
      <p className="text-lg text-[#222] bg-white/70 rounded-xl px-4 py-2 text-center mb-6 font-medium shadow-sm">Elige el idioma que quieres aprender:</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all shadow-md ${
              selectedLanguage === lang.code
                ? 'bg-[#7DC4E0] text-white border-2 border-[#7DC4E0] ring-2 ring-[#7DC4E0]/50'
                : 'bg-white/70 border-2 border-[#7DC4E0]/30 text-[#222] hover:bg-[#7DC4E0]/10'
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
          className={`flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all shadow-lg text-base sm:text-lg ${
            selectedLanguage
              ? 'bg-[#BB79D1] hover:bg-[#BB79D1]/80 text-white active:bg-[#E6B7D9] focus:bg-[#E6B7D9]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirmar <ChevronRight size={20} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
} 