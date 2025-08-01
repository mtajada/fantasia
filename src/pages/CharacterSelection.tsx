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
      console.log("[DEBUG] CharacterSelection mounted - loading characters directly from Supabase");
      setIsLoading(true);
      setError(null);

      if (!user) {
        console.error("[DEBUG] No authenticated user to load characters");
        setError("No authenticated user");
        setIsLoading(false);
        return;
      }

      try {
        const loadedCharacters = await charactersService.getAllCharacters(user.id);
        
        // Sort characters: preset characters first (females first, then males), then user characters
        const sortedCharacters = loadedCharacters.sort((a, b) => {
          // If both are preset or both are user characters, sort by gender (females first)
          if (a.is_preset === b.is_preset) {
            if (a.is_preset) {
              // For preset characters: females first, then males
              if (a.gender === 'female' && b.gender !== 'female') return -1;
              if (a.gender !== 'female' && b.gender === 'female') return 1;
              return 0;
            }
            return 0; // Keep user characters in original order
          }
          // Preset characters come first
          return a.is_preset ? -1 : 1;
        });
        
        setCharacters(sortedCharacters);
        console.log(`[DEBUG] Loaded ${sortedCharacters.length} total characters (preset + user) for user ${user.id}`);
      } catch (err) {
        console.error("[DEBUG] Unexpected error loading characters:", err);
        setError("Error loading characters");
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
    console.log("🔍 DEBUG - Saved to sessionStorage:", selectedCharacters.length, "characters");
    console.log("🔍 DEBUG - Characters saved:", selectedCharacters.map(c => `${c.name} (${c.id})`));
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-heading bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Choose Your Characters
          </h1>

          <p className="text-lg text-gray-200 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl px-4 py-2 text-center mb-6 font-medium shadow-lg">
            ✨ Select up to 4 characters for your erotic story! For intimate tales, fewer characters create more passionate focus.
          </p>

          {/* Selection counter */}
          {selectedCharacters.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/90 backdrop-blur-md border border-violet-500/60 rounded-xl shadow-lg ring-1 ring-violet-500/20">
                <Users size={20} className="text-violet-400" />
                <span className="text-gray-200 font-medium">
                  {selectedCharacters.length}/4 characters selected
                </span>
              </div>
            </div>
          )}

          {/* Selection message */}
          <div className="text-center mb-4">
            <p className="text-gray-300 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-lg px-3 py-2 text-sm shadow-md">
              {charactersService.getCharacterSelectionMessage(selectedCharacters.length)}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-4 shadow-lg mb-8">
              <div className="text-violet-400 font-medium">Loading characters...</div>
            </div>
          ) : error ? (
            <div className="text-center bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-4 shadow-lg mb-8">
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
                      bg-gray-900/80 backdrop-blur-md border-2 border-pink-500/60 rounded-2xl
                      hover:bg-pink-500/10 hover:scale-105 hover:shadow-lg hover:border-pink-400
                      transition-all duration-300 shadow-md ring-1 ring-gray-700/50"
                  >
                    <Plus size={40} className="text-pink-400 mb-2" />
                    <span className="text-gray-200 text-center font-medium">Create New</span>
                  </div>
                </motion.div>

                {characters.map((character) => {
                  const isSelected = isCharacterSelected(character.id);
                  const canSelect = canSelectMoreCharacters() || isCharacterSelected(character.id);
                  const isPreset = character.is_preset === true;
                  
                  // Gender icon mapping
                  const genderIcon = character.gender === 'male' ? '♂' : character.gender === 'female' ? '♀' : '⚧';
                  const genderText = character.gender === 'male' ? 'Male' : character.gender === 'female' ? 'Female' : 'Non-binary';

                  // Define border and styling based on preset status
                  const borderColor = isPreset ? '#f59e0b' : '#6366f1'; // Amber for preset, indigo for user
                  const hoverColor = isPreset ? '#f59e0b' : '#6366f1';

                  return (
                    <motion.div key={character.id} variants={item}>
                      <div
                        onClick={() => canSelect && handleSelectCharacter(character.id)}
                        className={`
                          relative flex flex-col items-center justify-center p-6 h-40 cursor-pointer
                          bg-gray-900/80 backdrop-blur-md rounded-2xl border-2 transition-all duration-300
                          shadow-md ring-1 ring-gray-700/50
                          ${isSelected
                            ? 'border-violet-500/80 bg-violet-500/20 ring-4 ring-violet-500/50 shadow-lg transform scale-105'
                            : !canSelect 
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:scale-105 hover:shadow-lg'}
                          ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        style={{
                          borderColor: isSelected ? '#8b5cf6' : borderColor,
                          backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(17, 24, 39, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && canSelect) {
                            e.currentTarget.style.backgroundColor = isPreset ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.8)';
                          }
                        }}
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
                            className="w-5 h-5 border-2 border-violet-500 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                          />
                        </div>

                        {/* Character image/icon */}
                        {character.image_url && isPreset ? (
                          <div className="relative w-16 h-16 mb-2">
                            <img 
                              src={character.image_url} 
                              alt={`${character.name} profile`}
                              className="w-full h-full object-cover rounded-full border-2 border-gray-600 shadow-lg transition-all duration-300 hover:border-violet-400"
                              loading="lazy"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Show fallback icon in parent container
                                const fallbackIcon = target.parentElement?.querySelector('.fallback-icon');
                                if (fallbackIcon) {
                                  fallbackIcon.classList.remove('hidden');
                                }
                              }}
                            />
                            {/* Fallback icon (hidden by default) */}
                            <User size={40} className="hidden fallback-icon text-amber-500 absolute inset-0 m-auto" />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                                <UserCheck size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {isSelected ? (
                              <UserCheck size={40} className="text-violet-400 mb-2" />
                            ) : (
                              <User size={40} className={isPreset ? "text-amber-500 mb-2" : "text-indigo-400 mb-2"} />
                            )}
                          </>
                        )}

                        <span className="text-gray-200 text-center font-medium">
                          {character.name}
                          {isPreset && <span className="ml-1 text-amber-400 text-xs">★</span>}
                        </span>
                        <div className="text-center">
                          <span className={`text-xs font-medium ${isPreset ? 'text-amber-400' : 'text-indigo-400'}`}>
                            {genderIcon} {genderText}
                          </span>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {character.description || 'No description'}
                          </p>
                        </div>

                        {/* Selected badge */}
                        {isCharacterSelected(character.id) && (
                          <Badge className="absolute -top-2 -left-2 bg-violet-500 text-white text-xs shadow-lg">
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
                  <div className="text-[#555] font-medium">No characters available. Create a new one to get started!</div>
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
