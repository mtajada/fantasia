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
    navigate("/generating");
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
      <div className="gradient-bg min-h-screen relative overflow-auto py-20 px-6">
        <BackButton />
        
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-10 text-center">
            Elige una moraleja para <span className="text-story-orange-400">la historia</span>
          </h1>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 mb-10"
          >
            {morals.map((moral) => (
              <motion.div key={moral.id} variants={item}>
                <StoryOptionCard
                  label={moral.name}
                  onClick={() => handleSelectMoral(moral.id)}
                  selected={selectedMoral === moral.id}
                />
              </motion.div>
            ))}
          </motion.div>
          
          <div className="flex justify-center mb-6">
            <StoryButton
              onClick={handleContinue}
              disabled={!selectedMoral}
              className="w-full max-w-md text-lg py-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-story-orange-500 to-story-orange-400 text-white rounded-full border-2 border-white/50 font-medium"
            >
              Generar Historia
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
