/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_ELEVENLABS_API_KEY: any
  readonly GEMINI_API_KEY: string
  readonly GEMINI_TTS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 
