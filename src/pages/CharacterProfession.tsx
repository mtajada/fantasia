import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useCharacterStore } from "../store/character/characterStore";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import StoryOptionCard from "../components/StoryOptionCard";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Rocket, 
  Search, 
  Shield, 
  Crown, 
  Zap, 
  Wand2, 
  Trophy, 
  GraduationCap 
} from "lucide-react";

const professions = [
  { id: "astronaut", name: "Astronauta", icon: <Rocket /> },
  { id: "explorer", name: "Explorador/a", icon: <Search /> },
  { id: "knight", name: "Caballero", icon: <Shield /> },
  { id: "royalty", name: "Príncipe/Princesa", icon: <Crown /> },
  { id: "superhero", name: "Superhéroe", icon: <Zap /> },
  { id: "wizard", name: "Mago/Maga", icon: <Wand2 /> },
  { id: "athlete", name: "Deportista", icon: <Trophy /> },
  { id: "teacher", name: "Profesor/a", icon: <GraduationCap /> }
];

export default function CharacterProfession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCharacter, updateCharacter, saveCurrentCharacter } = useCharacterStore();
  const { updateStoryOptions } = useStoryOptionsStore();
  const characterName = currentCharacter?.name || "el personaje";
  const [selectedProfession, setSelectedProfession] = useState(
    currentCharacter?.profession || ""
  );
  
  // Obtener el parámetro "from" de la URL
  const searchParams = new URLSearchParams(location.search);
  const fromManagement = searchParams.get('from') === 'management';
  
  const handleSelectProfession = (profession: string) => {
    setSelectedProfession(profession);
  };
  
  const handleContinue = async () => {
    // Update the character
    updateCharacter({ profession: selectedProfession });
    
    // Save and check for errors
    const result = await saveCurrentCharacter();
    
    if (!result || !result.success) {
      if (result?.error && typeof result.error === 'string' && result.error.includes("Ya existe un personaje con el nombre")) {
        toast.error("Nombre duplicado", {
          description: result.error
        });
        // Volver a la página de nombre del personaje para corregir
        navigate(`/character-name${fromManagement ? '?from=management' : ''}`);
        return;
      } else if (result?.error) {
        toast.error("Error al guardar", {
          description: typeof result.error === 'string' 
            ? result.error 
            : "Hubo un problema al guardar el personaje"
        });
        return;
      }
    }
    
    // Important: Update story options with the current character
    if (currentCharacter) {
      updateStoryOptions({ 
        character: {
          ...currentCharacter,
          profession: selectedProfession
        }
      });
    }
    
    if (fromManagement) {
      toast.success("¡Personaje guardado!", {
        description: "Volviendo a la gestión de personajes"
      });
      navigate("/characters-management");
    } else {
      toast.success("¡Personaje guardado!", {
        description: "Continuando a la selección de género"
      });
      navigate("/story-genre");
    }
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
            ¿Qué quiere ser <span className="text-story-orange-400">{characterName}</span>?
          </h1>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
          >
            {professions.map((profession) => (
              <motion.div key={profession.id} variants={item}>
                <div
                  onClick={() => handleSelectProfession(profession.id)}
                  className={`
                    story-choice-card h-32 sm:h-40 relative overflow-hidden
                    ${selectedProfession === profession.id 
                      ? 'ring-4 ring-story-orange-400 bg-white/20 shadow-lg transform scale-105' 
                      : 'hover:scale-105 hover:shadow-md transition-all duration-300'}
                  `}
                >
                  <div className="text-white text-3xl mb-3">
                    {profession.icon}
                  </div>
                  <span className="text-white text-center font-medium">{profession.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="flex justify-center mb-6">
            <StoryButton
              onClick={handleContinue}
              disabled={!selectedProfession}
              className="w-full max-w-md text-lg py-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-story-orange-500 to-story-orange-400 text-white rounded-full border-2 border-white/50 font-medium"
            >
              Continuar
            </StoryButton>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={async () => {
                updateCharacter({ profession: "" });
                
                // Save and check for errors
                const result = await saveCurrentCharacter();
                
                if (!result || !result.success) {
                  if (result?.error) {
                    toast.error("Error al guardar", {
                      description: typeof result.error === 'string' 
                        ? result.error 
                        : "Hubo un problema al guardar el personaje"
                    });
                    return;
                  }
                }
                
                // Important: Update story options with the current character even for skip
                if (currentCharacter) {
                  updateStoryOptions({ 
                    character: {
                      ...currentCharacter,
                      profession: ""
                    }
                  });
                }
                
                if (fromManagement) {
                  navigate("/characters-management");
                } else {
                  navigate("/story-genre");
                }
              }}
              className="text-white text-sm bg-white/20 px-5 py-3 rounded-full hover:bg-white/30 transition-all border border-white/30"
            >
              Continuar sin seleccionar
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
