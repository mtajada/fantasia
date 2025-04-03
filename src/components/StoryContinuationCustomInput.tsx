import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";

interface StoryContinuationCustomInputProps {
  onSubmit: (text: string) => void;
  onBack: () => void;
}

export default function StoryContinuationCustomInput({
  onSubmit,
  onBack
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
      className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-8 text-white leading-relaxed shadow-xl"
    >
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Describe tu continuación</h2>
      </div>

      <p className="mb-4 text-white/80">
        Describe cómo te gustaría que continuara la historia. Puedes incluir nuevos personajes, 
        lugares o situaciones. ¡Sé creativo!
      </p>

      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ejemplo: Me gustaría que el protagonista descubriera un objeto mágico que le permita..."
        className="w-full h-40 p-4 rounded-xl bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-story-orange-400 resize-none mb-4"
        disabled={isSubmitting}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!userInput.trim() || isSubmitting}
          className={`px-6 py-3 rounded-full font-medium flex items-center ${
            !userInput.trim() || isSubmitting
              ? "bg-white/20 text-white/50 cursor-not-allowed"
              : "bg-story-orange-400 text-white hover:bg-story-orange-500 transition-all shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
          ) : (
            <Send size={18} className="mr-2" />
          )}
          {isSubmitting ? "Generando..." : "Enviar"}
        </button>
      </div>
    </motion.div>
  );
}
