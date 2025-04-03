import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useCharacterStore } from "../store/character/characterStore";
import StoryOptionCard from "../components/StoryOptionCard";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";

const characterTypes = [
  { id: "fox", name: "Zorro" },
  { id: "dragon", name: "Dragón" },
  { id: "elf", name: "Elfo" },
  { id: "dinosaur", name: "Dinosaurio" },
  { id: "robot", name: "Robot" },
  { id: "unicorn", name: "Unicornio" },
  { id: "dog", name: "Perro" },
  { id: "bear", name: "Oso" }
];

export default function CharacterType() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const characterName = currentCharacter?.name || "el personaje";
  const selectedType = currentCharacter?.characterType || "";
  
  // Obtener el parámetro "from" de la URL
  const searchParams = new URLSearchParams(location.search);
  const fromManagement = searchParams.get('from') === 'management';
  
  const handleSelectType = (type: string) => {
    updateCharacter({ characterType: type });
  };
  
  const handleContinue = () => {
    navigate(`/character-profession${fromManagement ? '?from=management' : ''}`);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative overflow-auto py-20 px-6">
        <BackButton />
        
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-10 text-center">
            Elige un tipo para <span className="text-story-orange-400">{characterName}</span>
          </h1>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
          >
            {characterTypes.map((type) => (
              <motion.div key={type.id} variants={item}>
                <StoryOptionCard
                  label={type.name}
                  onClick={() => handleSelectType(type.id)}
                  selected={selectedType === type.id}
                  className="h-32 sm:h-40"
                />
              </motion.div>
            ))}
          </motion.div>
          
          <div className="flex justify-center">
            <StoryButton
              onClick={handleContinue}
              disabled={!selectedType}
              className="w-full max-w-md"
            >
              Continuar
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
