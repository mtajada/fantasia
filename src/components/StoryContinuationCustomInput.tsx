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
      className="bg-white/80 backdrop-blur-md rounded-3xl p-6 mb-8 text-[#222] leading-relaxed shadow-xl border border-[#BB79D1]/30"
    >
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-[#BB79D1]/20 hover:bg-[#BB79D1]/30 transition-all text-[#BB79D1]"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-[#BB79D1]">Describe tu continuación</h2>
      </div>

      <p className="mb-4 text-[#222] font-medium">
        Describe cómo te gustaría que continuara la historia. Puedes incluir nuevos personajes, 
        lugares o situaciones. ¡Sé creativo!
      </p>

      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ejemplo: Me gustaría que el protagonista descubriera un objeto mágico que le permita..."
        className="w-full h-40 p-4 rounded-xl bg-[#F6A5B7]/10 text-[#222] placeholder-[#222]/50 focus:outline-none focus:ring-2 focus:ring-[#BB79D1] resize-none mb-4 border border-[#F6A5B7]/30"
        disabled={isSubmitting || disabled}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!userInput.trim() || isSubmitting || disabled}
          className={`px-6 py-3 rounded-full font-medium flex items-center ${
            !userInput.trim() || isSubmitting || disabled
              ? "bg-[#BB79D1]/30 text-[#222]/50 cursor-not-allowed"
              : "bg-[#BB79D1] text-white hover:bg-[#BB79D1]/90 transition-all shadow-lg"
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
