import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import StoryOptionCard from "../components/StoryOptionCard";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";

const morals = [
  { id: "none", name: "Sin moraleja específica" },
  { id: "kindness", name: "Siempre sé amable" },
  { id: "honesty", name: "Sé honesto" },
  { id: "change", name: "Sé el cambio que quieres ver" },
  { id: "truth", name: "Siempre di la verdad" },
  { id: "think", name: "Piensa antes de actuar" },
  { id: "never-give-up", name: "Nunca te rindas" },
  { id: "respect", name: "Respeta a los demás" },
  { id: "friendship", name: "La importancia de la amistad" },
  { id: "forgiveness", name: "Aprender a perdonar" },
  { id: "accept", name: "No siempre conseguirás lo que quieres" },
  { id: "patience", name: "La paciencia tiene su recompensa" }
];

export default function StoryMoral() {
  const navigate = useNavigate();
  const { currentStoryOptions, setMoral } = useStoryOptionsStore();
  const selectedMoral = currentStoryOptions.moral || "";

  const handleSelectMoral = (moral: string) => {
    setMoral(moral);
  };

  const handleContinue = () => {
    navigate("/story-details-input");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundColor: 'black',
        }}
      >
        <BackButton />

        <div className="w-full max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#BB79D1] text-center mb-4 font-heading drop-shadow-lg">
            Elige una <span className="text-[#F6A5B7]">moraleja</span> para la historia
          </h1>

          <p className="text-lg text-[#222] bg-white/80 rounded-xl px-4 py-2 text-center mb-8 font-medium shadow-sm">
            Selecciona el mensaje o valor que quieres transmitir
          </p>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
          >
            {morals.map((moral) => (
              <motion.div key={moral.id} variants={item}>
                <div
                  onClick={() => handleSelectMoral(moral.id)}
                  className={`
                    flex flex-col items-center justify-center p-6 h-28 cursor-pointer
                    bg-white/70 rounded-2xl border-2 border-[#BB79D1]/30
                    ${selectedMoral === moral.id ? 'ring-4 ring-[#BB79D1] shadow-lg transform scale-105' : 'hover:bg-[#BB79D1]/10 hover:scale-105 hover:shadow-md'}
                    transition-all duration-300
                  `}
                >
                  <span className="text-[#222] text-center font-medium">{moral.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center w-full mt-2 mb-2">
            <StoryButton
              onClick={handleContinue}
              disabled={!selectedMoral}
              className="w-full max-w-xs py-4 rounded-2xl text-white text-lg font-semibold shadow-lg bg-[#BB79D1] hover:bg-[#BB79D1]/90 border-2 border-[#BB79D1]/50 transition-all duration-200"
            >
              Continuar
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
