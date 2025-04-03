import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Smile, Search, Shield, Brain, Users, Cloud, Feather, CheckSquare, Clock, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useCharacterStore } from "../store/character/characterStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";

// Define los tipos de personalidad disponibles
const personalityOptions = [
  { id: "alegre", name: "Alegre", icon: <Smile className="w-6 h-6" /> },
  { id: "curioso", name: "Curioso", icon: <Search className="w-6 h-6" /> },
  { id: "valiente", name: "Valiente", icon: <Shield className="w-6 h-6" /> },
  { id: "inteligente", name: "Inteligente", icon: <Brain className="w-6 h-6" /> },
  { id: "amistoso", name: "Amistoso", icon: <Users className="w-6 h-6" /> },
  { id: "soñador", name: "Soñador", icon: <Cloud className="w-6 h-6" /> },
  { id: "travieso", name: "Travieso", icon: <Feather className="w-6 h-6" /> },
  { id: "responsable", name: "Responsable", icon: <CheckSquare className="w-6 h-6" /> },
  { id: "paciente", name: "Paciente", icon: <Clock className="w-6 h-6" /> },
  { id: "aventurero", name: "Aventurero", icon: <Compass className="w-6 h-6" /> },
];

export default function CharacterPersonality() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>(
    currentCharacter?.personality ? 
    currentCharacter.personality.split(',') : []
  );
  
  // Obtener el parámetro "from" de la URL
  const searchParams = new URLSearchParams(location.search);
  const fromManagement = searchParams.get('from') === 'management';
  
  const characterName = currentCharacter?.name || "tu personaje";
  
  const handlePersonalitySelect = (personalityId: string) => {
    setSelectedPersonalities(prev => {
      if (prev.includes(personalityId)) {
        return prev.filter(id => id !== personalityId);
      } else {
        return [...prev, personalityId];
      }
    });
  };
  
  const handleContinue = () => {
    if (selectedPersonalities.length > 0) {
      updateCharacter({ personality: selectedPersonalities.join(',') });
    }
    navigate(`/character-profession${fromManagement ? '?from=management' : ''}`);
  };
  
  const handleBack = () => {
    navigate(`/character-hobbies${fromManagement ? '?from=management' : ''}`);
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
        <BackButton onClick={handleBack} />
        
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-10 text-center">
            ¿Cómo es la personalidad de {characterName}?
          </h1>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
          >
            {personalityOptions.map((personality) => (
              <motion.div key={personality.id} variants={item}>
                <div
                  onClick={() => handlePersonalitySelect(personality.id)}
                  className={`
                    story-choice-card h-32 sm:h-40 relative overflow-hidden
                    ${selectedPersonalities.includes(personality.id) 
                      ? 'ring-4 ring-story-orange-400 bg-white/20 shadow-lg transform scale-105' 
                      : 'hover:scale-105 hover:shadow-md transition-all duration-300'}
                  `}
                >
                  <div className="text-white text-3xl mb-3">
                    {personality.icon}
                  </div>
                  <span className="text-white text-center font-medium">{personality.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="flex justify-center mb-6">
            <StoryButton
              onClick={handleContinue}
              disabled={selectedPersonalities.length === 0}
              className="w-full max-w-md text-lg py-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-story-orange-500 to-story-orange-400 text-white rounded-full border-2 border-white/50 font-medium"
            >
              Continuar
            </StoryButton>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
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