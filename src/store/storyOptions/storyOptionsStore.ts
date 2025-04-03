import { StoryOptionsState } from '../types/storeTypes';
import { StoryOptions, StoryDuration } from '../../types';
import { createPersistentStore } from '../core/createStore';

// Estado inicial
const initialState: Pick<StoryOptionsState, 'currentStoryOptions'> = {
  currentStoryOptions: {}
};

export const useStoryOptionsStore = createPersistentStore<StoryOptionsState>(
  initialState,
  (set) => ({
    updateStoryOptions: (options) => set((state) => ({
      currentStoryOptions: { ...state.currentStoryOptions, ...options }
    })),
    
    resetStoryOptions: () => set({ 
      currentStoryOptions: {} 
    }),
    
    setDuration: (duration) => set((state) => ({
      currentStoryOptions: { ...state.currentStoryOptions, duration }
    })),
    
    setMoral: (moral) => set((state) => ({
      currentStoryOptions: { ...state.currentStoryOptions, moral }
    })),
    
    setGenre: (genre) => set((state) => ({
      currentStoryOptions: { ...state.currentStoryOptions, genre }
    }))
  }),
  'story-options'
); 