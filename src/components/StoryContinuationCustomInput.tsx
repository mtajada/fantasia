import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";

interface StoryContinuationCustomInputProps {
  onSubmit: (text: string) => void;
  onBack: () => void;
  disabled?: boolean;
}

export default function StoryContinuationCustomInput({
  onSubmit,
  onBack,
  disabled = false
}: StoryContinuationCustomInputProps) {
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    setIsSubmitting(true);
    onSubmit(userInput);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 mb-8 text-gray-200 leading-relaxed shadow-xl border border-gray-800 ring-1 ring-gray-700/50"
    >
      <div className="flex items-center mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-all text-violet-400 border border-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Cuéntame tus deseos, cariño 🔥</h2>
      </div>

      <p className="mb-4 text-gray-300 font-medium">
        Dime cómo quieres que se desarrolle tu fantasía. Incluye nuevos personajes, 
        escenarios o situaciones. ¡Sé creativo y atrevido! 🌶️
      </p>

      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ejemplo: Me gustaría que el protagonista descubra un elemento misterioso que le permita..."
        className="w-full h-32 sm:h-40 p-4 rounded-xl bg-gray-800/80 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4 border border-gray-700 transition-all"
        disabled={isSubmitting || disabled}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!userInput.trim() || isSubmitting || disabled}
          className={`px-6 py-3 rounded-full font-medium flex items-center transition-all ${
            !userInput.trim() || isSubmitting || disabled
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl"
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
          ) : (
            <Send size={18} className="mr-2" />
          )}
          {isSubmitting ? "Creando magia sensual..." : "¡Hagamos que suceda! ✨"}
        </button>
      </div>
    </motion.div>
  );
}
