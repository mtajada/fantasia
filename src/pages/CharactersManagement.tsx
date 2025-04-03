import { useNavigate } from "react-router-dom";
import { User, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useCharacterStore } from "../store/character/characterStore";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/user/userStore";
import PageTransition from "../components/PageTransition";
import StoryButton from "../components/StoryButton";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { StoryCharacter } from "../types";

export default function CharactersManagement() {
  const navigate = useNavigate();
  const { savedCharacters, loadCharactersFromSupabase, deleteCharacter, selectCharacter, resetCharacter } = useCharacterStore();
  const [isLoading, setIsLoading] = useState(true);
  const [characterToDelete, setCharacterToDelete] = useState<StoryCharacter | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  // Cargar personajes al montar el componente
  useEffect(() => {
    const loadCharacters = async () => {
      setIsLoading(true);
      
      const user = useUserStore.getState().user;
      if (!user) {
        console.error("No hay usuario autenticado para cargar personajes");
        setIsLoading(false);
        return;
      }
      
      // Limpiar personajes existentes antes de cargar
      useCharacterStore.setState({ savedCharacters: [] });
      
      // Forzar recarga limpia desde Supabase
      await loadCharactersFromSupabase();
      
      setIsLoading(false);
    };
    
    loadCharacters();
  }, [loadCharactersFromSupabase]);

  const handleCreateNewCharacter = () => {
    // Resetear el personaje actual para asegurar un ID único
    resetCharacter();
    navigate("/character-name?from=management");
  };

  const handleEditCharacter = (characterId: string) => {
    selectCharacter(characterId);
    navigate("/character-name?from=management");
  };

  const handleDeleteClick = (character: StoryCharacter) => {
    setCharacterToDelete(character);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (characterToDelete) {
      await deleteCharacter(characterToDelete.id);
      setShowDeleteConfirm(false);
      setCharacterToDelete(null);
      toast({
        title: "Personaje eliminado",
        description: `El personaje ${characterToDelete.name} ha sido eliminado`,
      });
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCharacterToDelete(null);
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
        <BackButton onClick={() => navigate("/home")} />
        
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Mis Personajes
          </h1>
          
          <div className="mb-8">
            <StoryButton 
              onClick={handleCreateNewCharacter}
              isFullWidth
              icon={<Plus size={20} />}
            >
              Crear Nuevo Personaje
            </StoryButton>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin h-10 w-10 border-4 border-white rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              {savedCharacters.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center text-white">
                  <User size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No tienes personajes</h3>
                  <p className="text-white/70 mb-6">
                    Crea tu primer personaje para utilizarlo en tus historias
                  </p>
                  <StoryButton 
                    onClick={handleCreateNewCharacter}
                    variant="secondary"
                    icon={<Plus size={16} />}
                  >
                    Crear Personaje
                  </StoryButton>
                </div>
              ) : (
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {savedCharacters.map((character) => (
                    <motion.div key={character.id} variants={item}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-story-orange-400 to-story-orange-500 flex items-center justify-center mr-4 flex-shrink-0">
                          <User size={24} className="text-white" />
                        </div>
                        <div className="flex-grow mr-4">
                          <h3 className="text-white font-medium text-lg">{character.name}</h3>
                          <p className="text-white/70 text-sm">
                            {character.characterType && 
                              `${character.characterType}${character.profession ? ` · ${character.profession}` : ''}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditCharacter(character.id)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                            aria-label="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(character)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-400/20 flex items-center justify-center text-white hover:text-red-400 transition-colors"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && characterToDelete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-purple-900/90 to-purple-800/90 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Eliminar personaje</h3>
              <p className="text-white/80 mb-6">
                ¿Estás seguro de que quieres eliminar a <span className="font-medium text-white">{characterToDelete.name}</span>? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-2 px-4 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 px-4 bg-red-500/70 rounded-lg text-white font-medium hover:bg-red-500/90 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
