// src/services/ai/ttsService.ts
import { SYSTEM_PROMPT } from '@/constants/story-voices.constant';
import OpenAI from 'openai';

/**
 * Servicio para generar audio a partir de texto usando la API REST de OpenAI
 * No usa Supabase ni funciones edge; realiza un fetch directo con tu clave.
 */
export type OpenAIVoiceType =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer'
  | 'coral'
  | 'sage'
  | 'ash';

export interface TTSOptions {
  text: string;
  voice?: OpenAIVoiceType;
  model?: string;
  instructions?: string;
}

interface OpenAIError {
  status?: number;
  code?: string | number;
  message?: string;
}

function isOpenAIError(error: unknown): error is OpenAIError {
  return typeof error === 'object' && error !== null;
}

// Voces disponibles en OpenAI
export const OPENAI_VOICES = [
  { id: 'alloy' as const, name: 'Alloy', description: 'Alloy (Neutral)' },
  { id: 'echo' as const, name: 'Echo', description: 'Echo (Masculino)' },
  { id: 'fable' as const, name: 'Fable', description: 'Fable (Fantasía)' },
  { id: 'onyx' as const, name: 'Onyx', description: 'Onyx (Masculino)' },
  { id: 'nova' as const, name: 'Nova', description: 'Nova (Femenina)' },
  { id: 'shimmer' as const, name: 'Shimmer', description: 'Shimmer (Femenina)' },
  { id: 'coral' as const, name: 'Coral', description: 'Coral (Femenina)' },
  { id: 'sage' as const, name: 'Sage', description: 'Sage (Narrador)' },
  { id: 'ash' as const, name: 'Ash', description: 'Ash (Juvenil)' }
];

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
  dangerouslyAllowBrowser: true // Permitir uso en el navegador
});

// Función para obtener las voces disponibles
export const getAvailableVoices = async () => {
  return OPENAI_VOICES;
};

/**
 * Genera audio a partir de texto usando la API del cliente oficial de OpenAI
 */
export const generateSpeech = async ({
  text,
  voice = 'nova',
  model,
  instructions
}: TTSOptions): Promise<Blob> => {
  if (!text || text.trim() === '') {
    throw new Error('El texto es requerido');
  }

  // Limpiar el texto antes de procesarlo
  const cleanedText = cleanTextForSpeech(text);

  // Combinar el system prompt con las instrucciones específicas del narrador
  const fullInstructions = instructions 
    ? `${SYSTEM_PROMPT} ${instructions}`
    : SYSTEM_PROMPT;

  console.log(`Iniciando generación de audio... Texto limpio: ${cleanedText.length} caracteres`);

  console.log(`Configuración: Voz=${voice}, Modelo=${model}`);
  
  try {
    // Llamar directamente a la API de OpenAI usando el cliente oficial
    const response = await openai.audio.speech.create({
      model,
      voice,
      input: cleanedText,
      instructions: fullInstructions
    });

    // Convertir la respuesta a un Blob usando arrayBuffer
    const buffer = await response.arrayBuffer();
    const audioBlob = new Blob([buffer], { type: 'audio/mpeg' });
    
    console.log("Blob de audio creado:", audioBlob.size, "bytes");
    console.log('Audio generado correctamente');
    
    return audioBlob;
  } catch (error: unknown) {
    console.error('Error en generación de voz:', error);
    
    const openAIError = isOpenAIError(error) ? error as OpenAIError : null;
    
    // Manejar específicamente el error 429 (Too Many Requests)
    if (openAIError?.status === 429 || openAIError?.code === 429) {
      throw new Error('Alcanzaste el máximo de créditos para generar un audio');
    }
    
    if (openAIError?.status === 401 || openAIError?.code === 'invalid_api_key') {
      throw new Error('Error de autenticación con el servicio de voz');
    }
    
    if (openAIError?.status === 400) {
      throw new Error('El texto proporcionado no es válido para generar audio');
    }
    
    if (openAIError?.status && openAIError.status >= 500) {
      throw new Error('El servicio de voz no está disponible temporalmente');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error inesperado al generar el audio';
    throw new Error(errorMessage);
  }
};

function cleanTextForSpeech(text: string): string {
  return text
    // Mantener caracteres especiales españoles
    .replace(/[^\w\s.,!?áéíóúñÁÉÍÓÚÑ-]/g, '')
    // Normalizar espacios
    .replace(/\s+/g, ' ')
    // Agregar pausas naturales
    .replace(/([.!?])\s+/g, '$1\n')
    .replace(/([.,])\s+/g, '$1 ')
    // Eliminar líneas vacías múltiples
    .replace(/\n\s*\n/g, '\n')
    .trim();
}
