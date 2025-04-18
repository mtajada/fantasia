import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { ChallengeQuestion as ChallengeQuestionType } from '../types';

interface ChallengeQuestionProps {
  question: ChallengeQuestionType;
  onNextQuestion?: () => void;
  onTryAgain?: () => void;
  onChangeChallenge?: () => void;
}

export default function ChallengeQuestion({ 
  question, 
  onNextQuestion,
  onTryAgain,
  onChangeChallenge
}: ChallengeQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCorrect = selectedOption === question.correctOptionIndex;

  const handleSelectOption = (index: number) => {
    if (showFeedback || loading) return;
    setSelectedOption(index);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (onNextQuestion) onNextQuestion();
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    setLoading(false);
    if (onTryAgain) onTryAgain();
  };

  // Set category-specific styles
  const getCategoryStyle = () => {
    switch (question.category) {
      case 'language':
        return {
          bg: 'bg-[#7DC4E0]',
          border: 'border-[#7DC4E0]',
          hover: 'hover:bg-[#7DC4E0]/10',
          icon: 'text-[#7DC4E0]'
        };
      case 'math':
        return {
          bg: 'bg-[#F9DA60]',
          border: 'border-[#F9DA60]',
          hover: 'hover:bg-[#F9DA60]/10',
          icon: 'text-[#F9DA60]'
        };
      case 'comprehension':
        return {
          bg: 'bg-[#F6A5B7]',
          border: 'border-[#F6A5B7]',
          hover: 'hover:bg-[#F6A5B7]/10',
          icon: 'text-[#F6A5B7]'
        };
      default:
        return {
          bg: 'bg-[#BB79D1]',
          border: 'border-[#BB79D1]',
          hover: 'hover:bg-[#BB79D1]/10',
          icon: 'text-[#BB79D1]'
        };
    }
  };

  const categoryStyle = getCategoryStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 rounded-2xl p-6 text-[#222] shadow-lg"
    >
      {/* Pregunta */}
      <div className={`p-4 rounded-xl mb-6 ${categoryStyle.bg} text-white shadow-md`}>
        <h2 className="text-xl font-bold mb-2 drop-shadow-sm">Pregunta:</h2>
        <p className="text-lg">{question.question}</p>
      </div>

      {/* Opciones */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectOption(index)}
            disabled={showFeedback}
            className={`w-full text-left p-4 rounded-xl transition-all shadow-sm ${
              selectedOption === index
                ? showFeedback
                  ? isCorrect
                    ? 'bg-green-500 text-white border-2 border-green-500'
                    : 'bg-red-500 text-white border-2 border-red-500'
                  : `${categoryStyle.bg} text-white border-2 ${categoryStyle.border}`
                : showFeedback && index === question.correctOptionIndex
                ? 'bg-green-500 text-white border-2 border-green-500'
                : `bg-white/70 border-2 ${categoryStyle.border}/30 ${categoryStyle.hover}`
            }`}
          >
            <div className="flex items-center">
              {showFeedback && index === question.correctOptionIndex && (
                <CheckCircle className="mr-2 text-white" size={20} />
              )}
              {showFeedback && selectedOption === index && !isCorrect && (
                <XCircle className="mr-2 text-white" size={20} />
              )}
              <span>{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 rounded-xl mb-6 shadow-md ${
            isCorrect ? 'bg-white/70 border-2 border-green-500/30' : 'bg-white/70 border-2 border-red-500/30'
          }`}
        >
          <h3 className={`font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '¡Genial! Has acertado 🎉' : 'Respuesta incorrecta 😕'}
          </h3>
          <p className="text-[#222]">{question.explanation}</p>
        </motion.div>
      )}

      {/* Botones de acción */}
      {showFeedback && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {!isCorrect && (
            <>
              <button
                onClick={handleTryAgain}
                className="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold bg-white/70 hover:bg-white/90 text-[#7DC4E0] transition-all shadow w-full sm:w-auto"
              >
                <RefreshCw size={18} className="mr-2" /> Intentar de nuevo
              </button>
              {onChangeChallenge && (
                <button
                  onClick={onChangeChallenge}
                  className="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold bg-white/70 hover:bg-white/90 text-[#F6A5B7] transition-all shadow w-full sm:w-auto"
                >
                  Cambiar de reto
                </button>
              )}
            </>
          )}
          {(isCorrect || !onTryAgain) && (
            <button
              onClick={handleNext}
              className="flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold text-white transition-all shadow-lg text-base sm:text-lg w-full sm:w-auto bg-[#BB79D1] hover:bg-[#BB79D1]/80 active:bg-[#E6B7D9] focus:bg-[#E6B7D9]"
            >
              Continuar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
} 