import { useNavigate, useLocation } from "react-router-dom";
import { Book, Music, Gamepad, Camera, Utensils, Bike, Dumbbell, Palette, Globe, Computer, Wand2, Theater } from "lucide-react";
import { motion } from "framer-motion";
import { useCharacterStore } from "../store/character/characterStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { useState } from "react";
import { HobbyOption } from "../types";
import { toast } from "sonner";

export default function CharacterHobbies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const characterName = currentCharacter?.name || "tu personaje";
  
  // Obtener el parámetro "from" de la URL
  const searchParams = new URLSearchParams(location.search);
  const fromManagement = searchParams.get('from') === 'management';
  
  const hobbies: HobbyOption[] = [
    { id: "reading", name: "Leer", icon: <Book /> },
    { id: "music", name: "Música", icon: <Music /> },
    { id: "gaming", name: "Videojuegos", icon: <Gamepad /> },
    { id: "photography", name: "Fotografía", icon: <Camera /> },
    { id: "cooking", name: "Cocinar", icon: <Utensils /> },
    { id: "cycling", name: "Ciclismo", icon: <Bike /> },
    { id: "sports", name: "Deportes", icon: <Dumbbell /> },
    { id: "painting", name: "Pintar", icon: <Palette /> },
    { id: "travel", name: "Viajar", icon: <Globe /> },
    { id: "programming", name: "Programar", icon: <Computer /> },
    { id: "magic", name: "Magia", icon: <Wand2 /> },
    { id: "theater", name: "Teatro", icon: <Theater /> },
  ];
  
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(
    currentCharacter?.hobbies || []
  );
  
  const toggleHobby = (hobbyId: string) => {
    setSelectedHobbies(prev => {
      if (prev.includes(hobbyId)) {
        return prev.filter(id => id !== hobbyId);
      } else {
        const newSelected = [...prev, hobbyId];
        return newSelected;
      }
    });
  };
  
  const handleContinue = () => {
    updateCharacter({ hobbies: selectedHobbies });
    navigate(`/character-personality${fromManagement ? '?from=management' : ''}`);
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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative overflow-auto py-20 px-6">
        <BackButton />
        
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-10 text-center">
            ¿Qué le gusta a <span className="text-story-orange-400">{characterName}</span>?
          </h1>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
          >
            {hobbies.map((hobby) => (
              <motion.div key={hobby.id} variants={item}>
                <div
                  onClick={() => toggleHobby(hobby.id)}
                  className={`
                    story-choice-card h-32 sm:h-40 relative overflow-hidden
                    ${selectedHobbies.includes(hobby.id) 
                      ? 'ring-4 ring-story-orange-400 bg-white/20 shadow-lg transform scale-105' 
                      : 'hover:scale-105 hover:shadow-md transition-all duration-300'}
                  `}
                >
                  <div className="text-white text-3xl mb-3">
                    {hobby.icon}
                  </div>
                  <span className="text-white text-center font-medium">{hobby.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="flex justify-center mb-6">
            <StoryButton
              onClick={handleContinue}
              disabled={selectedHobbies.length === 0}
              className="w-full max-w-md text-lg py-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-story-orange-500 to-story-orange-400 text-white rounded-full border-2 border-white/50 font-medium"
            >
              Continuar
            </StoryButton>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                updateCharacter({ hobbies: [] });
                navigate(`/character-profession${fromManagement ? '?from=management' : ''}`);
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
