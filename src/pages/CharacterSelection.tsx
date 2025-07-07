import { useNavigate } from "react-router-dom";
import { Plus, User, Users, UserCheck } from "lucide-react";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/user/userStore";
import { getUserCharacters } from "../services/supabase";
import { StoryCharacter } from "../types";

// Local utility functions
const validateMultipleCharacterSelection = (selectedCharacters: StoryCharacter[]) => {
  const errors: string[] = [];
  
  if (selectedCharacters.length === 0) {
    errors.push('Debes seleccionar al menos un personaje');
  }
  
  if (selectedCharacters.length > 4) {
    errors.push('No puedes seleccionar más de 4 personajes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const getCharacterSelectionMessage = (count: number): string => {
  if (count === 0) return "Selecciona hasta 4 personajes para tu historia";
  if (count === 1) return "¡Perfecto! Puedes añadir hasta 3 personajes más";
  if (count === 2) return "¡Excelente! Puedes añadir hasta 2 personajes más";
  if (count === 3) return "¡Genial! Puedes añadir 1 personaje más";
  if (count === 4) return "¡Máximo alcanzado! Tienes 4 personajes seleccionados";
  return "Has seleccionado demasiados personajes";
};

export default function CharacterSelection() {
  const navigate = useNavigate();
  const { updateSelectedCharacters } = useStoryOptionsStore();
  const { user } = useUserStore();
  
  // Local state for characters and selection
  const [characters, setCharacters] = useState<StoryCharacter[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<StoryCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper functions
  const isCharacterSelected = (characterId: string): boolean => {
    return selectedCharacters.some(char => char.id === characterId);
  };
  
  const canSelectMoreCharacters = (): boolean => {
    return selectedCharacters.length < 4;
  };
  
  const toggleCharacterSelection = (characterId: string) => {
    const character = characters.find(char => char.id === characterId);
    if (!character) return;
    
    if (isCharacterSelected(characterId)) {
      // Remove character from selection
      setSelectedCharacters(prev => prev.filter(char => char.id !== characterId));
    } else {
      // Add character to selection (if under limit)
      if (canSelectMoreCharacters()) {
        setSelectedCharacters(prev => [...prev, character]);
      }
    }
  };
  
  const clearSelectedCharacters = () => {
    setSelectedCharacters([]);
  };

  // Load characters from Supabase directly
  useEffect(() => {
    const loadCharacters = async () => {
      console.log("[DEBUG] CharacterSelection montado - cargando personajes directamente desde Supabase");
      setIsLoading(true);
      setError(null);

      if (!user) {
        console.error("[DEBUG] No hay usuario autenticado para cargar personajes");
        setError("No hay usuario autenticado");
        setIsLoading(false);
        return;
      }

      try {
        const { success, characters: loadedCharacters, error: loadError } = await getUserCharacters(user.id);
        
        if (success && loadedCharacters) {
          setCharacters(loadedCharacters);
          console.log(`[DEBUG] Cargados ${loadedCharacters.length} personajes para usuario ${user.id}`);
        } else {
          console.error("[DEBUG] Error cargando personajes:", loadError);
          setError("Error cargando personajes");
        }
      } catch (err) {
        console.error("[DEBUG] Error inesperado cargando personajes:", err);
        setError("Error inesperado cargando personajes");
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, [user]);

  // Log available characters
  useEffect(() => {
    console.log(`CharacterSelection tiene ${characters.length} personajes disponibles:`,
      characters.map(char => `${char.name} (${char.id})`));
  }, [characters]);

  const handleSelectCharacter = (characterId: string) => {
    // Always use multiple selection mode - just toggle, don't navigate automatically
    toggleCharacterSelection(characterId);
  };

  const handleContinueWithSelection = () => {
    // Validar selección
    const validation = validateMultipleCharacterSelection(selectedCharacters);

    if (!validation.isValid) {
      console.warn("Selección inválida:", validation.errors);
      return;
    }

    // Actualizar story options con personajes seleccionados
    updateSelectedCharacters(selectedCharacters);
    navigate("/story-genre");
  };

  const handleCreateNewCharacter = () => {
    // Navigate to character creation page
    navigate("/character-name?action=create");
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
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundColor: 'black',
        }}
      >
        <BackButton />

        <div className="w-full max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#BB79D1] text-center mb-4 font-heading drop-shadow-lg">
            Selecciona Personajes
          </h1>

          <p className="text-lg text-[#222] bg-white/80 rounded-xl px-4 py-2 text-center mb-6 font-medium shadow-sm">
            ✨ ¡Puedes elegir hasta 4 personajes para tu historia! Para cuentos cortitos, recomendamos menos personajes para que cada uno brille más.
          </p>

          {/* Contador de selección */}
          {selectedCharacters.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/70 rounded-xl border-2 border-[#BB79D1]/60 shadow-sm">
                <Users size={20} className="text-[#BB79D1]" />
                <span className="text-[#222] font-medium">
                  {selectedCharacters.length}/4 personajes seleccionados
                </span>
              </div>
            </div>
          )}

          {/* Mensaje de selección */}
          <div className="text-center mb-4">
            <p className="text-[#555] bg-white/60 rounded-lg px-3 py-2 text-sm">
              {getCharacterSelectionMessage(selectedCharacters.length)}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center bg-white/70 rounded-xl p-4 shadow-md mb-8">
              <div className="text-[#BB79D1] font-medium">Cargando personajes...</div>
            </div>
          ) : error ? (
            <div className="text-center bg-white/70 rounded-xl p-4 shadow-md mb-8">
              <div className="text-red-500 font-medium">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-[#BB79D1] underline"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
              >
                <motion.div variants={item}>
                  <div
                    onClick={handleCreateNewCharacter}
                    className="flex flex-col items-center justify-center p-6 h-40 cursor-pointer
                      bg-white/70 rounded-2xl border-2 border-[#F6A5B7]/60
                      hover:bg-[#F6A5B7]/10 hover:scale-105 hover:shadow-md
                      transition-all duration-300"
                  >
                    <Plus size={40} className="text-[#F6A5B7] mb-2" />
                    <span className="text-[#222] text-center font-medium">Crear Nuevo</span>
                  </div>
                </motion.div>

                {characters.map((character) => {
                  const isSelected = isCharacterSelected(character.id);
                  const canSelect = canSelectMoreCharacters() || isCharacterSelected(character.id);
                  
                  // Gender icon mapping
                  const genderIcon = character.gender === 'male' ? '♂' : character.gender === 'female' ? '♀' : '⚧';
                  const genderText = character.gender === 'male' ? 'Masculino' : character.gender === 'female' ? 'Femenino' : 'No binario';

                  return (
                    <motion.div key={character.id} variants={item}>
                      <div
                        onClick={() => canSelect && handleSelectCharacter(character.id)}
                        className={`
                          relative flex flex-col items-center justify-center p-6 h-40 cursor-pointer
                          bg-white/70 rounded-2xl border-2 transition-all duration-300
                          ${isSelected
                            ? 'border-[#BB79D1]/80 bg-[#BB79D1]/20 ring-4 ring-[#BB79D1]/50 shadow-lg transform scale-105'
                            : 'border-[#7DC4E0]/60 hover:bg-[#7DC4E0]/10 hover:scale-105 hover:shadow-md'}
                          ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {/* Checkbox siempre visible */}
                        <div className="absolute top-2 right-2">
                          <Checkbox
                            checked={isCharacterSelected(character.id)}
                            onCheckedChange={(checked) => {
                              if (canSelect) {
                                handleSelectCharacter(character.id);
                              }
                            }}
                            className="w-5 h-5 border-2 border-[#BB79D1] data-[state=checked]:bg-[#BB79D1] data-[state=checked]:border-[#BB79D1]"
                          />
                        </div>

                        {/* Icono de personaje */}
                        {isSelected ? (
                          <UserCheck size={40} className="text-[#BB79D1] mb-2" />
                        ) : (
                          <User size={40} className="text-[#7DC4E0] mb-2" />
                        )}

                        <span className="text-[#222] text-center font-medium">{character.name}</span>
                        <div className="text-center">
                          <span className="text-[#7DC4E0] text-xs font-medium">{genderIcon} {genderText}</span>
                          <p className="text-[#555] text-xs mt-1 line-clamp-2">
                            {character.description || 'Sin descripción'}
                          </p>
                        </div>

                        {/* Badge de seleccionado */}
                        {isCharacterSelected(character.id) && (
                          <Badge className="absolute -top-2 -left-2 bg-[#BB79D1] text-white text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {characters.length === 0 && (
                <div className="text-center bg-white/70 rounded-xl p-4 shadow-md mb-8">
                  <div className="text-[#555] font-medium">No tienes personajes guardados. ¡Crea uno nuevo!</div>
                </div>
              )}

              {characters.length > 0 && (
                <div className="flex flex-col items-center gap-4">
                  {/* Botón limpiar selección */}
                  {selectedCharacters.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={clearSelectedCharacters}
                        className="px-4 py-2 text-sm bg-white/70 border border-[#7DC4E0]/60 rounded-lg
                          hover:bg-[#7DC4E0]/10 transition-all duration-200 text-[#555]"
                      >
                        Limpiar Selección
                      </button>
                    </div>
                  )}

                  {/* Botón Continuar */}
                  <div className="flex justify-center w-full">
                    <StoryButton
                      onClick={handleContinueWithSelection}
                      isFullWidth={false}
                      disabled={selectedCharacters.length === 0}
                      className="w-full max-w-xs py-4 rounded-2xl text-white text-lg font-semibold shadow-lg bg-[#BB79D1] hover:bg-[#BB79D1]/90 border-2 border-[#BB79D1]/50 transition-all duration-200"
                    >
                      {selectedCharacters.length === 0
                        ? "Selecciona al menos un personaje"
                        : `Continuar con ${selectedCharacters.length} personaje${selectedCharacters.length !== 1 ? 's' : ''}`
                      }
                    </StoryButton>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
