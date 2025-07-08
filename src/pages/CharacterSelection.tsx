import { useNavigate } from "react-router-dom";
import { Plus, User, Users, UserCheck } from "lucide-react";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useUserStore } from "../store/user/userStore";
import { getUserCharacters } from "../services/supabase";
import { StoryCharacter } from "../types";
import { charactersService } from "../services/charactersService";

export default function CharacterSelection() {
  const navigate = useNavigate();
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
          console.log(`[DEBUG] Loaded ${loadedCharacters.length} characters for user ${user.id}`);
        } else {
          console.error("[DEBUG] Error loading characters:", loadError);
          setError("Error loading characters");
        }
      } catch (err) {
        console.error("[DEBUG] Unexpected error loading characters:", err);
        setError("Unexpected error loading characters");
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, [user]);

  // Log available characters
  useEffect(() => {
    console.log(`CharacterSelection has ${characters.length} available characters:`,
      characters.map(char => `${char.name} (${char.id})`));
  }, [characters]);

  const handleSelectCharacter = (characterId: string) => {
    // Always use multiple selection mode - just toggle, don't navigate automatically
    toggleCharacterSelection(characterId);
  };

  const handleContinueWithSelection = () => {
    // Validate selection
    const validation = charactersService.validateMultipleCharacterSelection(selectedCharacters);

    if (!validation.isValid) {
      console.warn("Invalid selection:", validation.errors);
      return;
    }

    // Store selected characters in sessionStorage for the story generation flow
    sessionStorage.setItem('selectedCharacters', JSON.stringify(selectedCharacters));
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
            Choose Your Characters
          </h1>

          <p className="text-lg text-[#222] bg-white/80 rounded-xl px-4 py-2 text-center mb-6 font-medium shadow-sm">
            ✨ Select up to 4 characters for your erotic story! For intimate tales, fewer characters create more passionate focus.
          </p>

          {/* Selection counter */}
          {selectedCharacters.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/70 rounded-xl border-2 border-[#BB79D1]/60 shadow-sm">
                <Users size={20} className="text-[#BB79D1]" />
                <span className="text-[#222] font-medium">
                  {selectedCharacters.length}/4 characters selected
                </span>
              </div>
            </div>
          )}

          {/* Selection message */}
          <div className="text-center mb-4">
            <p className="text-[#555] bg-white/60 rounded-lg px-3 py-2 text-sm">
              {charactersService.getCharacterSelectionMessage(selectedCharacters.length)}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center bg-white/70 rounded-xl p-4 shadow-md mb-8">
              <div className="text-[#BB79D1] font-medium">Loading characters...</div>
            </div>
          ) : error ? (
            <div className="text-center bg-white/70 rounded-xl p-4 shadow-md mb-8">
              <div className="text-red-500 font-medium">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-[#BB79D1] underline"
              >
                Retry
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
                    <span className="text-[#222] text-center font-medium">Create New</span>
                  </div>
                </motion.div>

                {characters.map((character) => {
                  const isSelected = isCharacterSelected(character.id);
                  const canSelect = canSelectMoreCharacters() || isCharacterSelected(character.id);
                  
                  // Gender icon mapping
                  const genderIcon = character.gender === 'male' ? '♂' : character.gender === 'female' ? '♀' : '⚧';
                  const genderText = character.gender === 'male' ? 'Male' : character.gender === 'female' ? 'Female' : 'Non-binary';

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
                        {/* Always visible checkbox */}
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

                        {/* Character icon */}
                        {isSelected ? (
                          <UserCheck size={40} className="text-[#BB79D1] mb-2" />
                        ) : (
                          <User size={40} className="text-[#7DC4E0] mb-2" />
                        )}

                        <span className="text-[#222] text-center font-medium">{character.name}</span>
                        <div className="text-center">
                          <span className="text-[#7DC4E0] text-xs font-medium">{genderIcon} {genderText}</span>
                          <p className="text-[#555] text-xs mt-1 line-clamp-2">
                            {character.description || 'No description'}
                          </p>
                        </div>

                        {/* Selected badge */}
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
                  <div className="text-[#555] font-medium">You don't have any saved characters. Create a new one!</div>
                </div>
              )}

              {characters.length > 0 && (
                <div className="flex flex-col items-center gap-4">
                  {/* Clear selection button */}
                  {selectedCharacters.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={clearSelectedCharacters}
                        className="px-4 py-2 text-sm bg-white/70 border border-[#7DC4E0]/60 rounded-lg
                          hover:bg-[#7DC4E0]/10 transition-all duration-200 text-[#555]"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}

                  {/* Continue button */}
                  <div className="flex justify-center w-full">
                    <StoryButton
                      onClick={handleContinueWithSelection}
                      isFullWidth={false}
                      disabled={selectedCharacters.length === 0}
                      className="w-full max-w-xs py-4 rounded-2xl text-white text-lg font-semibold shadow-lg bg-[#BB79D1] hover:bg-[#BB79D1]/90 border-2 border-[#BB79D1]/50 transition-all duration-200"
                    >
                      {selectedCharacters.length === 0
                        ? "Select at least one character"
                        : `Continue with ${selectedCharacters.length} character${selectedCharacters.length !== 1 ? 's' : ''}`
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
