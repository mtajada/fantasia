import { useNavigate } from "react-router-dom";
import { User, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useUserStore } from "../store/user/userStore";
import PageTransition from "../components/PageTransition";
import StoryButton from "../components/StoryButton";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { StoryCharacter } from "../types";
import { getUserCharacters, deleteCharacter } from "../services/supabase";

export default function CharactersManagement() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  
  // Local state management
  const [characters, setCharacters] = useState<StoryCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<StoryCharacter | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load characters directly from Supabase
  useEffect(() => {
    const loadCharacters = async () => {
      console.log("CharactersManagement mounted - loading characters directly from Supabase");
      setIsLoading(true);
      setError(null);

      if (!user) {
        console.error("No authenticated user to load characters");
        setError("No authenticated user");
        setIsLoading(false);
        return;
      }

      try {
        const { success, characters: loadedCharacters, error: loadError } = await getUserCharacters(user.id);
        
        if (success && loadedCharacters) {
          setCharacters(loadedCharacters);
          console.log(`Loaded ${loadedCharacters.length} characters for user ${user.id}`);
        } else {
          console.error("Error loading characters:", loadError);
          setError("Error loading characters");
        }
      } catch (err) {
        console.error("Unexpected error loading characters:", err);
        setError("Unexpected error loading characters");
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, [user]);

  const handleCreateNewCharacter = () => {
    // Navigate to character creation page
    navigate("/character-name?from=management");
  };

  const handleEditCharacter = (characterId: string) => {
    // Navigate directly with character ID for editing
    navigate(`/character-name?from=management&edit=${characterId}`);
  };

  const handleDeleteClick = (character: StoryCharacter) => {
    setCharacterToDelete(character);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (characterToDelete) {
      try {
        const { success, error: deleteError } = await deleteCharacter(characterToDelete.id);
        
        if (success) {
          // Remove character from local state
          setCharacters(prev => prev.filter(char => char.id !== characterToDelete.id));
          
          toast({
            title: "Character deleted",
            description: `Character ${characterToDelete.name} has been removed from your collection`,
          });
        } else {
          console.error("Error deleting character:", deleteError);
          toast({
            title: "Error",
            description: "No se pudo eliminar el personaje. Inténtalo de nuevo, amor.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Unexpected error deleting character:", err);
        toast({
          title: "Error",
          description: "Error inesperado al eliminar personaje",
          variant: "destructive",
        });
      } finally {
        setShowDeleteConfirm(false);
        setCharacterToDelete(null);
      }
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
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-auto"
        style={{ backgroundColor: 'black' }}
      >
        <BackButton onClick={() => navigate("/home")} />
        
        <div className={`w-full max-w-2xl mx-auto ${isMobile ? 'px-4 py-6' : 'px-4 py-8'}`}>
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-center mb-6 font-heading bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500`}>
            Your Intimate Cast ✨
          </h1>
          
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <button 
              onClick={handleCreateNewCharacter}
              className={`w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold ${isMobile ? 'py-4 px-4 text-base' : 'py-4 px-6 text-lg'} rounded-2xl shadow-lg shadow-violet-500/25 flex items-center justify-center gap-3 transition-all duration-300 hover:transform hover:scale-105`}
            >
              <Plus size={isMobile ? 20 : 24} className="text-white" />
              Create New Character 🪄
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-8 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-2xl ring-1 ring-gray-700/50">
              <div className="animate-spin h-10 w-10 border-4 border-violet-500 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-2xl ring-1 ring-gray-700/50 mb-8">
              <div className="text-red-400 font-medium">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-violet-400 underline hover:text-violet-300 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {characters.length === 0 ? (
                <div className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-8 text-center shadow-2xl ring-1 ring-gray-700/50">
                  <User size={48} className="mx-auto mb-4 text-violet-400 opacity-70" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-200">No characters yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first character to star in your intimate stories 🎭
                  </p>
                  <StoryButton 
                    onClick={handleCreateNewCharacter}
                    variant="secondary"
                    icon={<Plus size={16} />}
                    className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-violet-500/25 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    Create Character ✨
                  </StoryButton>
                </div>
              ) : (
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {characters.map((character) => (
                    <motion.div key={character.id} variants={item}>
                      <div className={`bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl ${isMobile ? 'p-4' : 'p-6'} flex items-center shadow-2xl ring-1 ring-gray-700/50 hover:bg-gray-800/90 hover:border-gray-700 transition-all duration-300`}>
                        <div className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 border-2 border-violet-500/40 flex items-center justify-center ${isMobile ? 'mr-3' : 'mr-4'} flex-shrink-0`}>
                          <User size={isMobile ? 22 : 26} className="text-violet-400" />
                        </div>
                        <div className={`flex-grow ${isMobile ? 'mr-3' : 'mr-4'}`}>
                          <h3 className={`text-gray-200 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>{character.name}</h3>
                          <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                            {character.description || 'No description yet - add details to make them irresistible 🤫'}
                          </p>
                          <p className={`text-violet-400 ${isMobile ? 'text-xs' : 'text-xs'} mt-1 font-medium`}>
                            {character.gender === 'male' ? '♂ Male' : 
                             character.gender === 'female' ? '♀ Female' : '⚧ Non-binary'}
                          </p>
                        </div>
                        <div className={`flex gap-2 ${isMobile ? 'gap-3' : 'gap-2'}`}>
                          <button 
                            onClick={() => handleEditCharacter(character.id)}
                            className={`${isMobile ? 'w-12 h-12' : 'w-11 h-11'} rounded-full bg-gray-800/80 hover:bg-violet-500/20 flex items-center justify-center text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-500/50 transition-all duration-300 shadow-sm backdrop-blur-sm`}
                            aria-label="Editar"
                          >
                            <Edit size={isMobile ? 18 : 16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(character)}
                            className={`${isMobile ? 'w-12 h-12' : 'w-11 h-11'} rounded-full bg-gray-800/80 hover:bg-pink-500/20 flex items-center justify-center text-pink-400 hover:text-pink-300 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-300 shadow-sm backdrop-blur-sm`}
                            aria-label="Eliminar"
                          >
                            <Trash2 size={isMobile ? 18 : 16} />
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

        {/* Delete confirmation modal */}
        {showDeleteConfirm && characterToDelete && (
          <div className={`fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 ${isMobile ? 'px-4' : 'px-4'}`}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-2xl ${isMobile ? 'p-6' : 'p-8'} max-w-md w-full shadow-2xl ring-1 ring-gray-700/50`}
            >
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-3`}>Eliminar Personaje 🗑️</h3>
              <p className={`text-gray-300 mb-6 ${isMobile ? 'text-sm' : 'text-base'}`}>
                ¿Estás seguro de que quieres eliminar a <span className="font-medium text-violet-400">{characterToDelete.name}</span> de tu reparto íntimo? 
                Esta acción no se puede deshacer.
              </p>
              <div className={`flex ${isMobile ? 'gap-3' : 'gap-4'}`}>
                <button
                  onClick={cancelDelete}
                  className={`flex-1 ${isMobile ? 'py-3 px-4' : 'py-3 px-6'} bg-gray-800/80 hover:bg-gray-700/80 rounded-2xl text-gray-300 font-medium transition-all duration-300 border border-gray-700 shadow-sm backdrop-blur-sm`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`flex-1 ${isMobile ? 'py-3 px-4' : 'py-3 px-6'} bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-2xl text-white font-medium transition-all duration-300 shadow-lg shadow-pink-500/25`}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
