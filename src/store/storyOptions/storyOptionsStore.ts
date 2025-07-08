import { StoryOptionsState } from '../types/storeTypes';
import { StoryOptions, StoryFormat, StoryCharacter } from '../../types';
import { createPersistentStore } from '../core/createStore';
import { charactersService } from '../../services/charactersService';

// Estado inicial
const initialState: Pick<StoryOptionsState, 'currentStoryOptions' | 'additionalDetails' | 'selectedCharacterIds'> = {
  currentStoryOptions: {},
  additionalDetails: null,
  selectedCharacterIds: [],
};

export const useStoryOptionsStore = createPersistentStore<StoryOptionsState>(
  initialState,
  (set) => ({
    updateStoryOptions: (options) => set((state) => ({
      currentStoryOptions: { ...state.currentStoryOptions, ...options }
    })),
    
    resetStoryOptions: () => set({ 
      currentStoryOptions: {}, 
      additionalDetails: null,
      selectedCharacterIds: []
    }),
    
    setFormat: (format) => set((state) => ({
      currentStoryOptions: { ...state.currentStoryOptions, format }
    })),
    
    setGenre: (genre) => set((state) => ({
      currentStoryOptions: { ...state.currentStoryOptions, genre }
    })),
    
    setAdditionalDetails: (details) => set({ additionalDetails: details }),
    
    // Multiple character selection functions
    setSelectedCharacterIds: (characterIds: string[]) => set({ selectedCharacterIds: characterIds }),
    
    getSelectedCharactersForStory: (allCharacters?: StoryCharacter[]) => {
      const state = useStoryOptionsStore.getState();
      
      if (!allCharacters) {
        console.warn('getSelectedCharactersForStory: No characters provided, returning empty array');
        return [];
      }
      
      return charactersService.getSelectedCharactersByIds(state.selectedCharacterIds, allCharacters);
    },
    
    updateSelectedCharacters: (characters: StoryCharacter[]) => {
      const characterIds = characters.map(char => char.id);
      set((state) => ({
        selectedCharacterIds: characterIds,
        currentStoryOptions: {
          ...state.currentStoryOptions,
          // Usar siempre el array de personajes (simplificado)
          characters: characters
        }
      }));
    },
  }),
  'story-options'
);