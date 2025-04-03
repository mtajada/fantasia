import { useNavigate } from "react-router-dom";
import { Plus, User } from "lucide-react";
import { useCharacterStore, reloadCharacters } from "../store/character/characterStore";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/user/userStore";

export default function CharacterSelection() {
  const navigate = useNavigate();
  const { savedCharacters, selectCharacter, currentCharacter, loadCharactersFromSupabase } = useCharacterStore();
  const { updateStoryOptions } = useStoryOptionsStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar personajes al montar el componente
  useEffect(() => {
    const loadCharacters = async () => {
      console.log("[DEBUG] CharacterSelection montado - cargando personajes directamente desde Supabase");
      setIsLoading(true);
      
      const user = useUserStore.getState().user;
      if (!user) {
        console.error("[DEBUG] No hay usuario autenticado para cargar personajes");
        setIsLoading(false);
        return;
      }
      
      // Limpiar personajes existentes antes de cargar
      useCharacterStore.setState({ savedCharacters: [] });
      
      // Forzar recarga limpia desde Supabase - el método internamente usa user.id
      await loadCharactersFromSupabase();
      
      // Asegurarnos de que se cargaron los personajes
      const chars = useCharacterStore.getState().savedCharacters;
      console.log(`[DEBUG] Después de cargar: ${chars.length} personajes para usuario ${user.id}`);
      
      setIsLoading(false);
    };
    
    loadCharacters();
  }, [loadCharactersFromSupabase]);
  
  // Mostrar personajes disponibles
  useEffect(() => {
    console.log(`CharacterSelection tiene ${savedCharacters.length} personajes disponibles:`, 
      savedCharacters.map(char => `${char.name} (${char.id})`));
  }, [savedCharacters]);
  
  const handleSelectCharacter = (characterId: string) => {
    selectCharacter(characterId);
    const character = savedCharacters.find(char => char.id === characterId);
    if (character) {
      updateStoryOptions({ character });
    }
    navigate("/story-genre");
  };
  
  const handleCreateNewCharacter = () => {
    // Resetear el personaje actual para asegurar un ID único
    const { resetCharacter } = useCharacterStore.getState();
    resetCharacter();
    navigate("/character-name");
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
            Selecciona un Personaje
          </h1>
          
          {isLoading ? (
            <div className="text-center text-white/80 mb-10">
              Cargando personajes...
            </div>
          ) : (
            <>
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10"
              >
                <motion.div variants={item}>
                  <div 
                    onClick={handleCreateNewCharacter}
                    className="story-choice-card h-40 hover:bg-white/20"
                  >
                    <Plus size={40} className="text-white mb-2" />
                    <span className="text-white text-center font-medium">Crear Nuevo</span>
                  </div>
                </motion.div>
                
                {savedCharacters.map((character) => (
                  <motion.div key={character.id} variants={item}>
                    <div 
                      onClick={() => handleSelectCharacter(character.id)}
                      className="story-choice-card h-40 hover:bg-white/20"
                    >
                      <User size={40} className="text-white mb-2" />
                      <span className="text-white text-center font-medium">{character.name}</span>
                      <span className="text-white/70 text-xs">{character.profession}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {savedCharacters.length === 0 && (
                <div className="text-center text-white/80 mb-10">
                  No tienes personajes guardados. ¡Crea uno nuevo!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
