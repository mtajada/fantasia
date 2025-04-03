import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCharacterStore } from "../store/character/characterStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Define a type for the window with the nameTimeout property
declare global {
  interface Window {
    nameTimeout: NodeJS.Timeout | undefined;
  }
}

export default function CharacterName() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCharacter, updateCharacter, savedCharacters } = useCharacterStore();
  
  // Obtener el parámetro "from" de la URL
  const searchParams = new URLSearchParams(location.search);
  const fromManagement = searchParams.get('from') === 'management';
  
  const [name, setName] = useState(currentCharacter?.name || "");
  const [isFocused, setIsFocused] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [error, setError] = useState("");
  
  // Verificar si el nombre ya existe entre los personajes guardados
  const checkNameExists = (nameToCheck: string): boolean => {
    if (!nameToCheck.trim()) return false;
    
    // Si estamos editando un personaje existente, excluir su propio nombre de la validación
    return savedCharacters.some(
      char => char.name.toLowerCase() === nameToCheck.toLowerCase() && 
              char.id !== currentCharacter.id
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Por favor, ingresa un nombre para tu personaje");
      return;
    }
    
    // Verificar si el nombre ya existe
    if (checkNameExists(name)) {
      setError(`Ya tienes un personaje llamado "${name}". Por favor, elige otro nombre.`);
      toast.error("Nombre duplicado", {
        description: "Ya existe un personaje con este nombre"
      });
      return;
    }
    
    // Si no hay error, guardar y continuar
    setError("");
    updateCharacter({ name: name });
    toast.success("¡Nombre guardado!", { 
      duration: 1500,
      description: "Continuando a las aficiones..."
    });
    
    setTimeout(() => {
      navigate(`/character-hobbies${fromManagement ? '?from=management' : ''}`);
    }, 1000);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Limpiar el error cuando el usuario escribe
    if (error) {
      setError("");
    }
    
    if (!hasTyped && newName.length > 0) {
      setHasTyped(true);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  useEffect(() => {
    return () => {
      clearTimeout(window.nameTimeout);
    };
  }, []);
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative flex flex-col items-center justify-center p-6">
        <BackButton />
        
        <div className="w-full max-w-md flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-story-orange-400 to-story-orange-500 flex items-center justify-center mb-6"
          >
            <User size={40} className="text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-10 text-center">
            ¿Cómo se llama tu personaje?
          </h1>
          
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div 
              className={`
                relative transition-all duration-300 ease-in-out
                ${isFocused ? 'scale-105' : 'scale-100'}
              `}
            >
              <Input 
                value={name}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Nombre del personaje"
                className={`story-input text-xl text-center h-16 font-medium ${error ? 'border-red-500 text-red-600 bg-red-50/90' : 'text-story-purple-900 bg-white/90'} placeholder:text-story-purple-300`}
                autoFocus
              />
              
              {error && (
                <div className="mt-2 flex items-center justify-center text-red-500 gap-2 p-2 bg-red-100/80 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between w-full">
              <StoryButton
                onClick={() => navigate(fromManagement ? "/characters-management" : "/character-selection")}
                variant="secondary"
                className="w-[48%] text-lg py-4 shadow-lg hover:shadow-xl transition-all rounded-full border-2 border-white/50 font-medium bg-white/20 text-white"
              >
                Atrás
              </StoryButton>
              
              <StoryButton
                type="submit"
                className="w-[48%] text-lg py-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-story-orange-500 to-story-orange-400 text-white rounded-full border-2 border-white/50 font-medium"
                disabled={!name.trim()}
              >
                Continuar
              </StoryButton>
            </div>
            
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  updateCharacter({ name: "" });
                  toast.success("Continuando sin nombre", { 
                    duration: 1500,
                    description: "Avanzando a las aficiones..."
                  });
                  
                  setTimeout(() => {
                    navigate(`/character-hobbies${fromManagement ? '?from=management' : ''}`);
                  }, 1000);
                }}
                className="text-white text-sm bg-white/20 px-5 py-3 rounded-full hover:bg-white/30 transition-all border border-white/30"
              >
                Continuar sin nombre
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
