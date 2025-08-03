import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { generateSpeech, OPENAI_VOICES, OpenAIVoiceType } from "@/services/ai/secureTtsService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Función auxiliar para formatear el tiempo
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface Voice {
  id: string;
  name: string;
  description: string;
}

const ELEVENLABS_MODELS = [
  { id: 'eleven_multilingual_v2', name: 'Multilingüe V2', description: 'Perfecto para español y otros idiomas, amor' },
  { id: 'eleven_monolingual_v1', name: 'Monolíngue V1', description: 'Ideal para inglés, cariño' },
  { id: 'eleven_turbo_v2', name: 'Turbo V2', description: 'Más rápido, excelente calidad, belleza' }
];

interface AudioPlayerProps {
  text: string;
  className?: string;
  onComplete?: () => void;
}

export default function AudioPlayer({ text, className, onComplete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(OPENAI_VOICES[0]);
  const [selectedModel, setSelectedModel] = useState(ELEVENLABS_MODELS[0]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpia los intervalos al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Maneja la actualización del tiempo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Maneja la actualización de la duración
  useEffect(() => {
    if (audioRef.current) {
      const handleLoadedMetadata = () => {
        console.log('Metadatos de audio cargados, duración:', audioRef.current?.duration);
        setDuration(audioRef.current?.duration || 0);
      };

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  // Maneja la actualización de la URL del audio
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log('Configurando fuente de audio:', audioUrl);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  const handlePlayPause = async () => {
    if (!audioUrl) {
      setIsLoading(true);
      try {
        await handleGenerateAudio();
      } catch (err) {
        console.error('Error al generar el audio, amor:', err);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        console.log('Pausando audio...');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Iniciando reproducción...');
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Reproducción iniciada exitosamente');
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Error al iniciar la reproducción:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const handleGenerateAudio = async (): Promise<string> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log('Generando audio con voz:', selectedVoice.id, 'y modelo:', selectedModel.id);
      const audioBlob = await generateSpeech({
        text,
        voice: selectedVoice.id as OpenAIVoiceType,
        model: selectedModel.id
      });
      
      const audioObjectUrl = URL.createObjectURL(audioBlob);
      console.log('Audio generado exitosamente, URL:', audioObjectUrl);
      setAudioUrl(audioObjectUrl);
      setIsGenerating(false);
      return audioObjectUrl;
    } catch (err) {
      console.error('Error al generar audio, cariño:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el audio, amor');
      setIsGenerating(false);
      throw err;
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(OPENAI_VOICES.find(voice => voice.id === voiceId) || OPENAI_VOICES[0]);
    setAudioUrl(null);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      const newVolume = value[0];
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.volume = newMutedState ? 0 : volume;
      setIsMuted(newMutedState);
    }
  };

  const handleEndedEvent = () => {
    console.log('Evento de fin de audio activado');
    setIsPlaying(false);
    setCurrentTime(duration);
    onComplete?.();
  };

  const handlePauseEvent = () => {
    console.log('Evento de pausa de audio activado');
    setIsPlaying(false);
  };

  return (
    <div className={cn("flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md", className)}>
      <div className="flex items-center gap-4">
        <Button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="w-12 h-12 rounded-full"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleMuteToggle}
          className="w-10 h-10"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={selectedVoice.id}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {OPENAI_VOICES.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>

        <select
          value={selectedModel.id}
          onChange={(e) => {
            setSelectedModel(ELEVENLABS_MODELS.find(model => model.id === e.target.value) || ELEVENLABS_MODELS[0]);
            setAudioUrl(null);
          }}
          className="px-3 py-2 border rounded-md"
        >
          {ELEVENLABS_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEndedEvent}
        onPause={handlePauseEvent}
        className="hidden"
      />
    </div>
  );
}
