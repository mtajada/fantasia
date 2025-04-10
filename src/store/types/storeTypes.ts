import {
  Challenge,
  ProfileSettings,
  Story,
  StoryChapter,
  StoryCharacter,
  StoryDuration,
  StoryOptions,
  StoryWithChapters,
  User,
} from "../../types";

// Tipos específicos para los stores
export interface UserState {
  user: User | null;
  profileSettings: ProfileSettings | null;

  loginUser: (user: User) => void;
  logoutUser: () => void;
  setProfileSettings: (settings: ProfileSettings) => void;
  hasCompletedProfile: () => boolean;
  checkAuth: () => Promise<boolean>;
  
  // Nuevos selectores para suscripción y límites
  isPremium: () => boolean;
  getRemainingMonthlyStories: () => number;
  canCreateStory: () => boolean;
  getRemainingMonthlyVoiceGenerations: () => number;
  getAvailableVoiceCredits: () => number;
  canGenerateVoice: () => boolean;
  canContinueStory: (storyId: string) => boolean;
}

export interface CharacterState {
  currentCharacter: StoryCharacter | null;
  savedCharacters: StoryCharacter[];

  updateCharacter: (updates: Partial<StoryCharacter>) => void;
  resetCharacter: () => void;
  saveCurrentCharacter: () => Promise<{ success: boolean; error?: any }>;
  selectCharacter: (characterId: string) => void;
  deleteCharacter: (characterId: string) => void;
  loadCharactersFromSupabase: () => Promise<void>;
}

export interface StoryOptionsState {
  currentStoryOptions: Partial<StoryOptions>;

  updateStoryOptions: (options: Partial<StoryOptions>) => void;
  resetStoryOptions: () => void;
  setDuration: (duration: StoryDuration) => void;
  setMoral: (moral: string) => void;
  setGenre: (genre: string) => void;
}

export interface StoriesState {
  generatedStories: Story[];
  isGeneratingStory: boolean;

  setIsGeneratingStory: (isGenerating: boolean) => void;
  addGeneratedStory: (story: Story) => void;
  getStoryById: (id: string) => Story | undefined;
  loadStoriesFromSupabase: () => Promise<void>;
}

export interface ChaptersState {
  storyChapters: StoryWithChapters[];

  getChaptersByStoryId: (storyId: string) => StoryChapter[];
  addChapter: (storyId: string, chapter: StoryChapter) => void;
  getLastChapterByStoryId: (storyId: string) => StoryChapter | undefined;
  loadChaptersFromSupabase: (storyId: string) => Promise<void>;
}

export interface ChallengesState {
  challenges: Challenge[];

  addChallenge: (challenge: Challenge) => void;
  getChallengesByStoryId: (storyId: string) => Challenge[];
  loadChallengesFromSupabase: (storyId: string) => Promise<void>;
}

export interface AudioState {
  audioCache: {
    [key: string]: {
      url: string;
      timestamp: string;
    };
  };
  generationStatus: {
    [key: string]: {
      status: "idle" | "generating" | "completed" | "error";
      progress: number;
    };
  };
  currentVoice: string | null;

  addAudioToCache: (
    storyId: string,
    chapterId: string | number,
    voiceId: string,
    audioUrl: string,
  ) => void;
  getAudioFromCache: (
    storyId: string,
    chapterId: string | number,
    voiceId: string,
  ) => string | null;
  setGenerationStatus: (
    storyId: string,
    chapterId: string | number,
    status: "idle" | "generating" | "completed" | "error",
    progress?: number,
  ) => void;
  getGenerationStatus: (
    storyId: string,
    chapterId: string | number,
  ) => { status: string; progress: number };
  setCurrentVoice: (voiceId: string) => void;
  getCurrentVoice: () => string | null;
  clearOldAudioCache: (olderThanDays?: number) => void;
  loadAudioFromSupabase: () => Promise<void>;
}

// Estado combinado para mantener compatibilidad con el código existente
export interface StoryState
  extends UserState, StoriesState, ChallengesState, ChaptersState, AudioState {
  currentStoryOptions: Partial<StoryOptions> & {
    character?: StoryCharacter;
  };
  savedCharacters: StoryCharacter[];

  // Métodos específicos de Character para compatibilidad
  setCharacterName: (name: string) => void;
  setCharacterHobbies: (hobbies: string[]) => void;
  setCharacterDescription: (description: string) => void;
  setCharacterProfession: (profession: string) => void;
  setCharacterType: (type: string) => void;
  setCharacterPersonality: (personality: string) => void;

  // Métodos de StoryOptions para compatibilidad
  setDuration: (duration: StoryDuration) => void;
  setMoral: (moral: string) => void;
  setGenre: (genre: string) => void;
}
