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
        return 'from-blue-400 to-purple-500';
      case 'math':
        return 'from-green-400 to-teal-500';
      case 'comprehension':
        return 'from-orange-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white/20 backdrop-blur-md rounded-3xl p-6 text-white shadow-xl"
    >
      {/* Pregunta */}
      <div className={`p-4 rounded-xl mb-6 bg-gradient-to-r ${getCategoryStyle()}`}>
        <h2 className="text-xl font-bold mb-2">Pregunta:</h2>
        <p className="text-lg">{question.question}</p>
      </div>

      {/* Opciones */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectOption(index)}
            disabled={showFeedback}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              selectedOption === index
                ? showFeedback
                  ? isCorrect
                    ? 'bg-green-500/90 text-white'
                    : 'bg-red-500/90 text-white'
                  : 'bg-story-blue-500/80 text-white'
                : showFeedback && index === question.correctOptionIndex
                ? 'bg-green-500/90 text-white'
                : 'bg-white/10 hover:bg-white/20'
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
          className={`p-4 rounded-xl mb-6 ${
            isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        >
          <h3 className="font-bold mb-2">
            {isCorrect ? '¡Genial! Has acertado 🎉' : 'Respuesta incorrecta 😕'}
          </h3>
          <p>{question.explanation}</p>
        </motion.div>
      )}

      {/* Botones de acción */}
      {showFeedback && (
        <div className="flex justify-center space-x-4">
          {!isCorrect && (
            <>
              <button
                onClick={handleTryAgain}
                className="flex items-center px-6 py-3 rounded-full font-medium bg-white/20 hover:bg-white/30 transition-colors"
              >
                <RefreshCw size={18} className="mr-2" /> Intentar de nuevo
              </button>
              {onChangeChallenge && (
                <button
                  onClick={onChangeChallenge}
                  className="flex items-center px-6 py-3 rounded-full font-medium bg-white/20 hover:bg-white/30 transition-colors"
                >
                  Cambiar de reto
                </button>
              )}
            </>
          )}
          {(isCorrect || !onTryAgain) && (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-full font-medium bg-story-orange-400 text-white hover:bg-story-orange-500 transition-colors"
            >
              Continuar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
} 