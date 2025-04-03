export type ProfileSettings = {
  language: string;
  childAge: number;
  ageRange?: string;
  specialNeed?: string;
}

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
