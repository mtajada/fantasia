import { supabase } from './supabase';
import { StoryCharacter } from '../types';
import { getUserCharacters, getAllCharacters, syncCharacter, deleteCharacter as deleteSupabaseCharacter } from './supabase';

// Validation constants
export const CHARACTER_LIMITS = {
  MIN_CHARACTERS: 1,
  MAX_CHARACTERS: 4,
  MAX_NAME_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
} as const;

// Validation types
export interface CharacterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CharacterSelectionValidationResult extends CharacterValidationResult {
  canSelectMore: boolean;
  selectionCount: number;
}

/**
 * Validates an individual character
 */
export const validateCharacter = (character: StoryCharacter): CharacterValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  // Validate required fields
  if (!character.name || character.name.trim().length === 0) {
    errors.push("Name is required");
    isValid = false;
  } else {
    // Validate name length
    if (character.name.length < CHARACTER_LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${CHARACTER_LIMITS.MIN_NAME_LENGTH} characters`);
      isValid = false;
    }
    if (character.name.length > CHARACTER_LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${CHARACTER_LIMITS.MAX_NAME_LENGTH} characters`);
      isValid = false;
    }
  }

  // Validate gender (required in new structure)
  if (!character.gender) {
    errors.push("Gender is required");
    isValid = false;
  }

  // Validate description (required in new structure)
  if (!character.description || character.description.trim().length === 0) {
    errors.push("Description is required");
    isValid = false;
  } else if (character.description.length < 10) {
    errors.push("Description must be at least 10 characters");
    isValid = false;
  } else if (character.description.length < 20) {
    warnings.push("A more detailed description will make your character more captivating and stories more intimate");
  }

  return {
    isValid,
    errors,
    warnings
  };
};

/**
 * Validates if a character can be selected
 */
export const validateCharacterSelection = (
  currentSelection: StoryCharacter[],
  characterToSelect: StoryCharacter
): CharacterSelectionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  // Check maximum limit
  if (currentSelection.length >= CHARACTER_LIMITS.MAX_CHARACTERS) {
    errors.push(`Maximum ${CHARACTER_LIMITS.MAX_CHARACTERS} characters allowed`);
    isValid = false;
  }

  // Check if character is already selected
  if (currentSelection.some(char => char.id === characterToSelect.id)) {
    errors.push("This character is already selected");
    isValid = false;
  }

  // Validate the character itself
  const characterValidation = validateCharacter(characterToSelect);
  if (!characterValidation.isValid) {
    errors.push(...characterValidation.errors);
    isValid = false;
  }

  // Warning for stories with many characters
  if (currentSelection.length >= 2) {
    warnings.push("For intimate stories, fewer characters allow each one to shine more in your fantasy");
  }

  return {
    isValid,
    errors,
    warnings,
    canSelectMore: currentSelection.length < CHARACTER_LIMITS.MAX_CHARACTERS - 1,
    selectionCount: currentSelection.length + (isValid ? 1 : 0)
  };
};

/**
 * Validates multiple character selection
 */
export const validateMultipleCharacterSelection = (
  characters: StoryCharacter[]
): CharacterSelectionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  // Check limits
  if (characters.length < CHARACTER_LIMITS.MIN_CHARACTERS) {
    errors.push(`You must select at least ${CHARACTER_LIMITS.MIN_CHARACTERS} character`);
    isValid = false;
  }

  if (characters.length > CHARACTER_LIMITS.MAX_CHARACTERS) {
    errors.push(`Maximum ${CHARACTER_LIMITS.MAX_CHARACTERS} characters allowed`);
    isValid = false;
  }

  // Check for duplicates
  const uniqueIds = new Set(characters.map(char => char.id));
  if (uniqueIds.size !== characters.length) {
    errors.push("Duplicate characters are not allowed");
    isValid = false;
  }

  // Validate each character individually
  for (const character of characters) {
    const charValidation = validateCharacter(character);
    if (!charValidation.isValid) {
      errors.push(`Character "${character.name}": ${charValidation.errors.join(", ")}`);
      isValid = false;
    }
  }

  // Warnings based on character count
  if (characters.length >= 3) {
    warnings.push("✨ With 3+ characters, your story will be rich and passionate, but may be longer");
  } else if (characters.length === 2) {
    warnings.push("✨ Perfect! Two characters create dynamic and intimate encounters");
  }

  return {
    isValid,
    errors,
    warnings,
    canSelectMore: characters.length < CHARACTER_LIMITS.MAX_CHARACTERS,
    selectionCount: characters.length
  };
};

/**
 * Validates if a story can be generated with the selected characters
 */
export const validateStoryGeneration = (characters: StoryCharacter[]): CharacterValidationResult => {
  if (characters.length === 0) {
    return {
      isValid: false,
      errors: ["You must select at least one character to generate your story"],
      warnings: []
    };
  }

  // Use multiple selection validation
  const validation = validateMultipleCharacterSelection(characters);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings
  };
};

/**
 * Gets the recommended message based on character count
 */
export const getCharacterSelectionMessage = (count: number): string => {
  switch (count) {
    case 0:
      return "✨ Select up to 4 characters for your erotic story!";
    case 1:
      return "✨ Great start! You can add up to 3 more characters for steamy encounters";
    case 2:
      return "✨ Perfect! This combination will create dynamic and passionate moments";
    case 3:
      return "✨ Amazing! Your story will be incredibly rich with these 3 characters";
    case 4:
      return "✨ Maximum reached! These 4 characters will create an epic erotic adventure";
    default:
      return "✨ For intimate stories, fewer characters allow each one to shine in your fantasy";
  }
};

/**
 * Characters Service - Main API for character operations
 */
export const charactersService = {
  // Get user's characters
  async getUserCharacters(userId: string): Promise<StoryCharacter[]> {
    const { success, characters, error } = await getUserCharacters(userId);
    
    if (!success) {
      console.error('Error fetching characters:', error);
      throw new Error(error?.message || 'Error fetching characters');
    }
    
    return characters || [];
  },

  // Get all characters (preset + user characters)
  async getAllCharacters(userId: string): Promise<StoryCharacter[]> {
    const { success, characters, error } = await getAllCharacters(userId);
    
    if (!success) {
      console.error('Error fetching all characters:', error);
      throw new Error(error?.message || 'Error fetching all characters');
    }
    
    return characters || [];
  },

  // Create a new character
  async createCharacter(userId: string, character: Omit<StoryCharacter, 'id'>): Promise<StoryCharacter> {
    const characterData = {
      ...character,
      user_id: userId
    };

    const { success, error } = await syncCharacter(userId, characterData as StoryCharacter);
    
    if (!success) {
      console.error('Error creating character:', error);
      throw new Error(error?.message || 'Error creating character');
    }
    
    // Return the character with generated ID
    return {
      id: characterData.id || '',
      ...character
    };
  },

  // Update an existing character
  async updateCharacter(userId: string, characterId: string, updates: Partial<StoryCharacter>): Promise<StoryCharacter> {
    const { success, error } = await syncCharacter(userId, { id: characterId, ...updates } as StoryCharacter);
    
    if (!success) {
      console.error('Error updating character:', error);
      throw new Error(error?.message || 'Error updating character');
    }
    
    return { id: characterId, ...updates } as StoryCharacter;
  },

  // Delete a character
  async deleteCharacter(characterId: string): Promise<void> {
    const { success, error } = await deleteSupabaseCharacter(characterId);
    
    if (!success) {
      console.error('Error deleting character:', error);
      throw new Error(error?.message || 'Error deleting character');
    }
  },

  // Validation helpers
  validateCharacter,
  validateCharacterSelection,
  validateMultipleCharacterSelection,
  validateStoryGeneration,
  getCharacterSelectionMessage,
  
  // Character selection utilities
  isCharacterSelected: (characterId: string, selectedCharacters: StoryCharacter[]): boolean => {
    return selectedCharacters.some(char => char.id === characterId);
  },

  canSelectMoreCharacters: (selectedCharacters: StoryCharacter[]): boolean => {
    return selectedCharacters.length < CHARACTER_LIMITS.MAX_CHARACTERS;
  },

  getSelectedCharactersByIds: (characterIds: string[], allCharacters: StoryCharacter[]): StoryCharacter[] => {
    return characterIds
      .map(id => allCharacters.find(char => char.id === id))
      .filter((char): char is StoryCharacter => char !== undefined);
  },

  // Constants
  CHARACTER_LIMITS
};