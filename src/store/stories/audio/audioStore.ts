import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AudioState } from "../../types/storeTypes";
import { createPersistentStore } from "../../core/createStore";
import {
  getCurrentVoice,
  getUserAudios,
  setCurrentVoice,
  syncAudioFile,
  syncQueue,
} from "../../../services/supabase";
import { useUserStore } from "../../user/userStore";

// Tipos
type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

interface AudioStateEntry {
  url: string;
  generatedAt: number;
  // Eliminamos referencia a S3, solo usamos URLs locales (blob)
}

interface AudioGenerationStatus {
  status: GenerationStatus;
  progress: number;
}

interface AudioStore {
  // Cache de audio
  audioCache: Record<string, AudioStateEntry>; // storyId_chapterId_voiceId -> AudioStateEntry
  
  // Estado de generación
  generationStatus: Record<string, AudioGenerationStatus>; // storyId_chapterId -> status
  
  // Preferencia de voz
  currentVoice: string | null;
  
  // Acciones
  addAudioToCache: (storyId: string, chapterId: string | number, voiceId: string, url: string) => void;
  getAudioFromCache: (storyId: string, chapterId: string | number, voiceId: string) => string | null;
  clearAudioCache: () => void;
  removeAudioFromCache: (storyId: string, chapterId: string | number, voiceId: string) => void;
  
  // Acciones para generación
  setGenerationStatus: (storyId: string, chapterId: string | number, status: GenerationStatus, progress?: number) => void;
  getGenerationStatus: (storyId: string, chapterId: string | number) => AudioGenerationStatus;
  
  // Acciones preferencia de voz
  setCurrentVoice: (voiceId: string) => void;
  getCurrentVoice: () => string | null;
}

// Crear store con persistencia
export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      audioCache: {},
      generationStatus: {},
      currentVoice: null,
      
      // Acciones para cache de audio
      addAudioToCache: (storyId, chapterId, voiceId, url) => {
        const key = `${storyId}_${chapterId}_${voiceId}`;
        set(state => ({
          audioCache: {
            ...state.audioCache,
            [key]: {
              url,
              generatedAt: Date.now()
            }
          }
        }));
      },
      
      getAudioFromCache: (storyId, chapterId, voiceId) => {
        const key = `${storyId}_${chapterId}_${voiceId}`;
        const entry = get().audioCache[key];
        return entry?.url || null;
      },
      
      clearAudioCache: () => {
        // Liberar URLs de blob antes de limpiar el cache
        Object.values(get().audioCache).forEach(entry => {
          if (entry.url.startsWith('blob:')) {
            URL.revokeObjectURL(entry.url);
          }
        });
        
        set({ audioCache: {} });
      },
      
      removeAudioFromCache: (storyId, chapterId, voiceId) => {
        const key = `${storyId}_${chapterId}_${voiceId}`;
        const entry = get().audioCache[key];
        
        // Si es un blob URL, liberarla
        if (entry && entry.url.startsWith('blob:')) {
          URL.revokeObjectURL(entry.url);
        }
        
        set(state => {
          const newCache = { ...state.audioCache };
          delete newCache[key];
          return { audioCache: newCache };
        });
      },
      
      // Acciones para estado de generación
      setGenerationStatus: (storyId, chapterId, status, progress = 0) => {
        const key = `${storyId}_${chapterId}`;
        set(state => ({
          generationStatus: {
            ...state.generationStatus,
            [key]: { status, progress }
          }
        }));
      },
      
      getGenerationStatus: (storyId, chapterId) => {
        const key = `${storyId}_${chapterId}`;
        return get().generationStatus[key] || { status: 'idle', progress: 0 };
      },
      
      // Acciones para preferencia de voz
      setCurrentVoice: (voiceId) => {
        set({ currentVoice: voiceId });
      },
      
      getCurrentVoice: () => {
        return get().currentVoice;
      }
    }),
    {
      name: 'audio-storage', // Nombre de la clave en localStorage
    }
  )
);
