import { supabase } from './supabase';
import { StoryCharacter } from '../types';
import { getUserCharacters, syncCharacter, deleteCharacter as deleteSupabaseCharacter } from './supabase';

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
    errors.push("El nombre del personaje es obligatorio");
    isValid = false;
  } else {
    // Validate name length
    if (character.name.length < CHARACTER_LIMITS.MIN_NAME_LENGTH) {
      errors.push(`El nombre debe tener al menos ${CHARACTER_LIMITS.MIN_NAME_LENGTH} caracteres`);
      isValid = false;
    }
    if (character.name.length > CHARACTER_LIMITS.MAX_NAME_LENGTH) {
      errors.push(`El nombre no puede tener más de ${CHARACTER_LIMITS.MAX_NAME_LENGTH} caracteres`);
      isValid = false;
    }
  }

  // Validate gender (required in new structure)
  if (!character.gender) {
    errors.push("El género es obligatorio");
    isValid = false;
  }

  // Validate description (required in new structure)
  if (!character.description || character.description.trim().length === 0) {
    errors.push("La descripción es obligatoria");
    isValid = false;
  } else if (character.description.length < 10) {
    warnings.push("Una descripción más detallada hará que el personaje sea más interesante");
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
    errors.push(`Máximo ${CHARACTER_LIMITS.MAX_CHARACTERS} personajes permitidos`);
    isValid = false;
  }

  // Check if character is already selected
  if (currentSelection.some(char => char.id === characterToSelect.id)) {
    errors.push("Este personaje ya está seleccionado");
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
    warnings.push("Para cuentos cortitos, recomendamos menos personajes para que cada uno brille más");
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
    errors.push(`Debes seleccionar al menos ${CHARACTER_LIMITS.MIN_CHARACTERS} personaje`);
    isValid = false;
  }

  if (characters.length > CHARACTER_LIMITS.MAX_CHARACTERS) {
    errors.push(`Máximo ${CHARACTER_LIMITS.MAX_CHARACTERS} personajes permitidos`);
    isValid = false;
  }

  // Check for duplicates
  const uniqueIds = new Set(characters.map(char => char.id));
  if (uniqueIds.size !== characters.length) {
    errors.push("No se pueden seleccionar personajes duplicados");
    isValid = false;
  }

  // Validate each character individually
  for (const character of characters) {
    const charValidation = validateCharacter(character);
    if (!charValidation.isValid) {
      errors.push(`Personaje "${character.name}": ${charValidation.errors.join(", ")}`);
      isValid = false;
    }
  }

  // Warnings based on character count
  if (characters.length >= 3) {
    warnings.push("✨ Con 3 o más personajes tu historia será muy rica, pero puede ser un poco más larga");
  } else if (characters.length === 2) {
    warnings.push("✨ ¡Perfecto! Dos personajes crean historias dinámicas y entretenidas");
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
      errors: ["Debes seleccionar al menos un personaje para generar la historia"],
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
      return "✨ ¡Selecciona hasta 4 personajes para tu historia!";
    case 1:
      return "✨ ¡Genial! Puedes añadir hasta 3 personajes más si quieres";
    case 2:
      return "✨ ¡Perfecto! Esta combinación creará una historia muy dinámica";
    case 3:
      return "✨ ¡Increíble! Tu historia será muy rica con estos 3 personajes";
    case 4:
      return "✨ ¡Máximo alcanzado! Estos 4 personajes crearán una historia épica";
    default:
      return "✨ Para cuentos cortitos, recomendamos menos personajes para que cada uno brille más";
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