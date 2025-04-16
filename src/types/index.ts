export type ProfileSettings = {
  // Campos existentes
  language: string;
  childAge: number;
  specialNeed?: string | null;

  // --- Campos de Stripe ---
  stripe_customer_id?: string | null;
  subscription_status?: string | null;
  subscription_id?: string | null;
  plan_id?: string | null;
  current_period_end?: string | null;

  // --- Campos de Límites/Créditos ---
  voice_credits?: number | null;
  monthly_stories_generated?: number | null;
  period_start_date?: string | null;
  
  // --- Columna Nueva ---
  monthly_voice_generations_used?: number | null;
  has_completed_setup: boolean; // Añadido para rastrear setup
};

export type StoryDuration = 'short' | 'medium' | 'long';

export type StoryCharacter = {
  id: string;
  name: string;
  hobbies: string[];
  description: string;
  profession: string;
  characterType: string;
  personality?: string;
}

export type PartialStoryCharacter = {
  id: string;
  name?: string;
  hobbies?: string[];
  description?: string;
  profession?: string;
  characterType?: string;
  personality?: string;
}

export type StoryOptions = {
  moral: string;
  character: StoryCharacter;
  genre: string;
  duration: StoryDuration;
}

export type Story = {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  options: StoryOptions;
  createdAt: string;
  additional_details?: string | null;
}

export type User = {
  email: string;
  id: string;
}

export type HobbyOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export type ChallengeCategory = 'language' | 'math' | 'comprehension';

export type ChallengeQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  category: ChallengeCategory;
  targetLanguage?: string; // Only for language challenges
};

export type Challenge = {
  id: string;
  storyId: string;
  questions: ChallengeQuestion[];
  createdAt: string;
};

export type StoryChapter = {
  chapterNumber: number;
  title: string;
  content: string;
  createdAt: string;
  generationMethod?: 'free' | 'option1' | 'option2' | 'option3' | 'custom';
  customInput?: string; // Only if generationMethod is 'custom'
};

export type StoryWithChapters = {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  options: StoryOptions;
  createdAt: string;
  additional_details?: string | null;
  chapters: StoryChapter[];
  hasMultipleChapters?: boolean;
  chaptersCount?: number;
};

export type PresetSuggestion = {
  id: number; // Supabase bigint maps to number in JS/TS if not excessively large
  text_prompt: string;
};
