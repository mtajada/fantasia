/// <reference types="vite/client" />

interface ImportMetaEnv {
  // REMOVED: VITE_ELEVENLABS_API_KEY - API keys moved to secure Supabase secrets
  readonly GEMINI_API_KEY: string
  readonly GEMINI_TTS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 
