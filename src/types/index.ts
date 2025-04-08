export type ProfileSettings = {
  // Campos existentes
  language: string;
  childAge: number;
  specialNeed?: string | null; // Hacer nullable explícitamente si puede ser NULL en DB

  // --- Añadir los campos faltantes ---
  // Campos de Stripe (ajusta tipos según nullability en tu DB)
  stripe_customer_id?: string | null;
  subscription_status?: string | null; // e.g., 'free', 'active', 'past_due', 'canceled', etc.
  subscription_id?: string | null;
  plan_id?: string | null; // ID del precio/plan de Stripe
  current_period_end?: string | null; // Fecha ISO almacenada como TIMESTAMPTZ

  // Campos de Límites/Créditos (ajusta tipos según nullability en tu DB)
  voice_credits?: number | null;
  monthly_stories_generated?: number | null;
  monthly_voice_generations_used?: number | null;
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
  imageUrl?: string;
  options: StoryOptions;
  createdAt: string;
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
  imageUrl?: string;
  options: StoryOptions;
  createdAt: string;
  chapters: StoryChapter[];
  hasMultipleChapters?: boolean;
  chaptersCount?: number;
};
