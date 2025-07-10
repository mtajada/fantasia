// src/services/ai/secureTtsService.ts
import { supabase } from '@/supabaseClient';

/**
 * Servicio TTS seguro que usa Edge Functions de Supabase
 * Reemplaza al ttsService.ts que exponía API keys en el frontend
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

interface TTSError {
  status?: number;
  code?: string | number;
  message?: string;
}

function isTTSError(error: unknown): error is TTSError {
  return typeof error === 'object' && error !== null;
}

// Voces disponibles en OpenAI (movidas desde ttsService)
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

// Función para obtener las voces disponibles
export const getAvailableVoices = async () => {
  return OPENAI_VOICES;
};

/**
 * Genera audio usando la Edge Function segura de Supabase
 * No expone API keys en el frontend
 */
export const generateSpeech = async ({
  text,
  voice = 'nova',
  model = 'tts-1',
  instructions
}: TTSOptions): Promise<Blob> => {
  if (!text || text.trim() === '') {
    throw new Error('El texto es requerido');
  }

  console.log(`Iniciando generación de audio segura via Edge Function...`);
  console.log(`Configuración: Voz=${voice}, Modelo=${model}`);

  try {
    // Obtener token de autenticación
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Usuario no autenticado');
    }

    // Llamar a la Edge Function generate-audio
    const { data, error } = await supabase.functions.invoke('generate-audio', {
      body: {
        text: text.trim(),
        voice,
        model,
        instructions
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error en Edge Function generate-audio:', error);
      throw new Error(`Error del servidor: ${error.message}`);
    }

    // La Edge Function devuelve un ArrayBuffer, convertirlo a Blob
    if (data instanceof ArrayBuffer) {
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      console.log('Audio generado correctamente via Edge Function');
      return audioBlob;
    }

    // Si no es ArrayBuffer, verificar si es una respuesta de error
    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error(data.error);
    }

    throw new Error('Respuesta inválida del servidor');

  } catch (error: unknown) {
    console.error('Error en generación de voz segura:', error);
    
    const ttsError = isTTSError(error) ? error as TTSError : null;
    
    // Manejar errores específicos
    if (ttsError?.status === 429 || ttsError?.code === 429) {
      throw new Error('Alcanzaste el máximo de créditos para generar un audio');
    }
    
    if (ttsError?.status === 401 || ttsError?.code === 'invalid_api_key') {
      throw new Error('Error de autenticación');
    }
    
    if (ttsError?.status === 400) {
      throw new Error('El texto proporcionado no es válido para generar audio');
    }
    
    if (ttsError?.status === 402) {
      throw new Error('Créditos de voz insuficientes');
    }
    
    if (ttsError?.status && ttsError.status >= 500) {
      throw new Error('El servicio de voz no está disponible temporalmente');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error inesperado al generar el audio';
    throw new Error(errorMessage);
  }
};