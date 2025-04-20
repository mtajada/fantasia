import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { generateSpeech } from "@/services/ai/ttsService";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
import { useAudioStore } from "../store/stories/audio/audioStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Voice types with their details
export const STORY_VOICES = [
  {
    id: "el-sabio",
    name: "El Sabio",
    description: "Voz grave y serena, ideal para transmitir conocimiento.",
    color: "#a5d6f6", // Indigo-600
    gradientFrom: "#6366f1", // Indigo-500
    gradientTo: "#3730a3", // Indigo-800
    icon: "📚"
  },
  {
    id: "el-capitan",
    name: "El Capitán",
    description: "Voz ruda y aventurera, perfecta para historias de acción.",
    color: "#f6a5b7", // Rose-600
    gradientFrom: "#f43f5e", // Rose-500
    gradientTo: "#be123c", // Rose-700
    icon: "⚓"
  },
  {
    id: "el-animado",
    name: "El Animado",
    description: "Voz aguda y caricaturesca, ideal para historias divertidas.",
    color: "#f7c59f", // Green-600
    gradientFrom: "#22c55e", // Green-500
    gradientTo: "#15803d", // Green-700
    icon: "🎭"
  }
];

// Playback speeds
const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

// Audio Wave Loading Animation Component
const AudioWaveLoading = ({ color = "#fff" }) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          className="w-1.5 bg-white rounded-full"
          initial={{ height: 12 }}
          animate={{
            height: [12, 24, 12],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: bar * 0.1,
            ease: "easeInOut"
          }}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

// WaveForm Component
const WaveForm = ({ isPlaying, color, intensity = 0.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
    const parentHeight = canvas.parentElement?.clientHeight || 300;

    canvas.width = parentWidth * dpr;
    canvas.height = parentHeight * dpr;
    canvas.style.width = `${parentWidth}px`;
    canvas.style.height = `${parentHeight}px`;

    ctx.scale(dpr, dpr);

    // Handle window resize
    const handleResize = () => {
      const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
      const parentHeight = canvas.parentElement?.clientHeight || 300;

      canvas.width = parentWidth * dpr;
      canvas.height = parentHeight * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentHeight}px`;

      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    const rgb = hexToRgb(color);

    // Number of particles
    const particleCount = 30;
    const particles: {
      x: number;
      y: number;
      radius: number;
      originalRadius: number;
      speed: number;
      angle: number;
      opacity: number;
      pulseSpeed: number;
    }[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;

      // Create particles in circular pattern around center
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * (Math.min(centerX, centerY) * 0.6);

      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius: 5 + Math.random() * 20,
        originalRadius: 5 + Math.random() * 20,
        speed: 0.2 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.3,
        pulseSpeed: 0.01 + Math.random() * 0.03
      });
    }

    let phase = 0;

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas with a subtle background
      ctx.fillStyle = rgb ?
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)` :
        'rgba(100, 100, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Update phase
      phase += isPlaying ? 0.02 : 0.005;

      // Center coordinates
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;

      // Draw central pulsing circle
      const basePulse = isPlaying ?
        0.6 + Math.sin(phase * 2) * 0.2 * intensityRef.current :
        0.7 + Math.sin(phase) * 0.1;

      const mainRadius = Math.min(centerX, centerY) * 0.3 * basePulse;

      // Central glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, mainRadius * 2
      );

      if (rgb) {
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isPlaying ? 0.3 : 0.15})`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isPlaying ? 0.1 : 0.05})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      } else {
        gradient.addColorStop(0, `rgba(100, 100, 255, ${isPlaying ? 0.3 : 0.15})`);
        gradient.addColorStop(0.5, `rgba(100, 100, 255, ${isPlaying ? 0.1 : 0.05})`);
        gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, mainRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw main circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
      ctx.fillStyle = rgb ?
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isPlaying ? 0.4 : 0.2})` :
        `rgba(100, 100, 255, ${isPlaying ? 0.4 : 0.2})`;
      ctx.fill();

      // Draw and update particles
      particles.forEach((particle, index) => {
        // Create orbital movement
        if (isPlaying) {
          // More dynamic movement when playing
          particle.angle += particle.speed * 0.02;

          // Pulse radius based on audio intensity
          const pulseIntensity = intensityRef.current *
            (0.5 + 0.5 * Math.sin(phase * 3 + index * 0.2));

          particle.radius = particle.originalRadius *
            (0.8 + 0.4 * pulseIntensity * Math.sin(phase * particle.pulseSpeed * 10));

          // Dynamic opacity based on audio intensity
          particle.opacity = 0.2 + 0.3 * intensityRef.current * Math.sin(phase * 2 + index * 0.1);
        } else {
          // Slower, more subtle movement when paused
          particle.angle += particle.speed * 0.005;

          // Gentle pulsing when paused
          particle.radius = particle.originalRadius * (0.9 + 0.1 * Math.sin(phase + index * 0.1));
          particle.opacity = 0.1 + 0.1 * Math.sin(phase * 0.5 + index * 0.05);
        }

        // Calculate particle position based on orbital movement
        const orbitRadius = 20 + index % 3 * 40;
        const orbitX = centerX + Math.cos(particle.angle) * orbitRadius;
        const orbitY = centerY + Math.sin(particle.angle) * orbitRadius;

        // Add some wobble to the orbit
        const wobble = isPlaying ?
          Math.sin(phase * 2 + index) * 5 * intensityRef.current :
          Math.sin(phase + index) * 2;

        particle.x = orbitX + wobble * Math.cos(particle.angle * 2);
        particle.y = orbitY + wobble * Math.sin(particle.angle * 3);

        // Draw particle with gradient
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );

        if (rgb) {
          particleGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`);
          particleGradient.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity * 0.5})`);
          particleGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        } else {
          particleGradient.addColorStop(0, `rgba(100, 100, 255, ${particle.opacity})`);
          particleGradient.addColorStop(0.6, `rgba(100, 100, 255, ${particle.opacity * 0.5})`);
          particleGradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();

        // Occasionally connect particles with lines when playing
        if (isPlaying && Math.random() > 0.97) {
          const nearestParticleIndex = (index + 1) % particles.length;
          const nearestParticle = particles[nearestParticleIndex];

          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(nearestParticle.x, nearestParticle.y);
          ctx.strokeStyle = rgb ?
            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` :
            'rgba(100, 100, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Format time helper
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function StoryAudioPage() {
  const { storyId, chapterId } = useParams<{ storyId: string, chapterId?: string }>();
  const navigate = useNavigate();
  const { getStoryById } = useStoriesStore();
  const { getChaptersByStoryId } = useChaptersStore();
  const {
    getAudioFromCache,
    addAudioToCache,
    setGenerationStatus,
    getGenerationStatus,
    setCurrentVoice,
    getCurrentVoice
  } = useAudioStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [playbackSpeedIndex, setPlaybackSpeedIndex] = useState(1); // Default to 1x (index 1)
  const [showGenerationPopup, setShowGenerationPopup] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [audioIntensity, setAudioIntensity] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Get selected voice and playback speed
  const selectedVoice = STORY_VOICES[voiceIndex];
  const playbackSpeed = PLAYBACK_SPEEDS[playbackSpeedIndex];

  // Set currentVoice in store when it changes
  useEffect(() => {
    setCurrentVoice(selectedVoice.id);
  }, [selectedVoice.id, setCurrentVoice]);

  // Initialize voice from store if available
  useEffect(() => {
    const savedVoice = getCurrentVoice();
    if (savedVoice) {
      const voiceIdx = STORY_VOICES.findIndex(v => v.id === savedVoice);
      if (voiceIdx !== -1) {
        setVoiceIndex(voiceIdx);
      }
    }
  }, [getCurrentVoice]);

  // Load story data
  useEffect(() => {
    if (!storyId) {
      navigate("/home");
      return;
    }

    const story = getStoryById(storyId);

    if (!story) {
      navigate("/not-found");
      return;
    }
  }, [storyId, navigate, getStoryById]);

  // Get story content
  const story = storyId ? getStoryById(storyId) : null;
  const chapters = storyId ? getChaptersByStoryId(storyId) : [];
  const currentChapterIndex = chapterId ? parseInt(chapterId, 10) : 0;

  // If no valid chapter or story, use a placeholder
  const title = chapters.length > 0 && currentChapterIndex < chapters.length
    ? chapters[currentChapterIndex].title || story?.title
    : story?.title || "Historia";

  const content = chapters.length > 0 && currentChapterIndex < chapters.length
    ? chapters[currentChapterIndex].content
    : story?.content || "";

  // Check for cached audio when voice changes or component mounts
  useEffect(() => {
    if (storyId && currentChapterIndex !== undefined) {
      const cachedAudio = getAudioFromCache(storyId, currentChapterIndex, selectedVoice.id);
      if (cachedAudio) {
        setAudioUrl(cachedAudio);
      } else {
        setAudioUrl(null);
      }
    }
  }, [storyId, currentChapterIndex, selectedVoice.id, getAudioFromCache]);

  // Handle voice change with arrow navigation
  const handlePreviousVoice = () => {
    setVoiceIndex((prev) => (prev === 0 ? STORY_VOICES.length - 1 : prev - 1));
  };

  const handleNextVoice = () => {
    setVoiceIndex((prev) => (prev === STORY_VOICES.length - 1 ? 0 : prev + 1));
  };

  // Handle playback speed change - cycle through speeds
  const handleSpeedChange = () => {
    setPlaybackSpeedIndex((prev) => (prev === PLAYBACK_SPEEDS.length - 1 ? 0 : prev + 1));
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioUrl && !audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update playback speed when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Audio context and analyzer setup for waveform intensity
  useEffect(() => {
    if (isPlaying && audioRef.current && !audioContextRef.current) {
      try {
        // Create audio context with proper type
        type AudioContextType = typeof window.AudioContext;
        // Definir el tipo para webkitAudioContext de forma segura
        interface WindowWithWebkit extends Window {
          webkitAudioContext?: AudioContextType;
        }
        
        const AudioContextClass = window.AudioContext || 
          ((window as WindowWithWebkit).webkitAudioContext as AudioContextType | undefined) || window.AudioContext;
        
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        // Create analyser
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        // Create buffer for frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        // Connect the audio element to the analyser
        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Set up interval for intensity calculation
        const intensityInterval = setInterval(() => {
          if (analyserRef.current && dataArrayRef.current && isPlaying) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // Calculate average intensity from frequency data
            const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) /
              dataArrayRef.current.length;

            // Normalize to 0-1 range and apply some smoothing
            const normalizedIntensity = Math.min(1, average / 128);
            setAudioIntensity(prev => prev * 0.7 + normalizedIntensity * 0.3);
          }
        }, 100);

        return () => {
          clearInterval(intensityInterval);
        };
      } catch (error) {
        console.error("Error setting up audio analyzer:", error);
      }
    }
  }, [isPlaying]);

  // Update time display
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update duration when metadata is loaded
  useEffect(() => {
    if (audioRef.current) {
      const handleLoadedMetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  // Update audio source when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log('Setting audio source:', audioUrl);

      // Detener cualquier reproducción en curso
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      try {
        // Asignar la fuente del audio
        audioRef.current.src = audioUrl;
        
        // Forzar la carga del audio
        audioRef.current.load();
        
        console.log('Audio source set successfully');
        
        // Pre-cargar el audio
        const preloadAudio = () => {
          try {
            audioRef.current?.play()
              .then(() => {
                // Inmediatamente pausar para sólo precargar
                audioRef.current?.pause();
                audioRef.current!.currentTime = 0;
                console.log('Audio precargado correctamente');
                toast.success('Audio listo para reproducir');
              })
              .catch(err => {
                console.warn('Precarga automática fallida (normal en algunos navegadores):', err);
                // No mostrar error, es comportamiento normal en algunos navegadores
              });
          } catch (err) {
            console.warn('Error en precarga:', err);
          }
        };
        
        // Ejecutar precarga después de asignar los eventos
        setTimeout(preloadAudio, 500);
        
      } catch (error) {
        console.error('Error configurando fuente de audio:', error);
        toast.error('Error al preparar el audio');
      }
    } else if (!audioUrl && audioRef.current) {
      // Limpiar el audio si no hay URL
      audioRef.current.src = '';
    }
  }, [audioUrl]);

  const handlePlayPause = async () => {
    console.log("handlePlayPause - audioUrl:", audioUrl);
    console.log("handlePlayPause - audioRef.current:", audioRef.current);

    if (!audioUrl) {
      setShowGenerationPopup(true);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        console.log("Pausando audio");
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          console.log("Intentando reproducir audio");
          
          // Asegurarse de que el audio está cargado
          if (audioRef.current.readyState === 0) {
            console.log("Audio no cargado, recargando");
            audioRef.current.load();
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // Intentar reproducir
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Reproducción iniciada con éxito");
                setIsPlaying(true);
              })
              .catch(error => {
                console.error("Error en la reproducción:", error);
                toast.error("No se pudo reproducir el audio. Intente de nuevo.");
                setIsPlaying(false);
              });
          } else {
            console.log("Reproducción iniciada (sin promesa)");
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Error starting playback:', error);
          toast.error("No se pudo reproducir el audio. Intente de nuevo.");
          setIsPlaying(false);
        }
      }
    } else {
      console.error("No hay elemento de audio disponible");
      toast.error("Problema con el reproductor de audio");
    }
  };

  const handleGenerateAudio = async () => {
    try {
      setIsLoading(true);
      // Actualizar estado de generación
      setGenerationStatus(storyId || '', currentChapterIndex, 'generating', 10);
      setGenerationProgress(10);

      // Simulate generation progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newValue = prev + Math.random() * 15;
          const progress = newValue > 90 ? 90 : newValue;
          setGenerationStatus(storyId || '', currentChapterIndex, 'generating', progress);
          return progress;
        });
      }, 800);

      // Liberar URL anterior
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      // Generar el audio
      const customVoiceMapping = {
        "el-sabio": "sage",
        "el-capitan": "onyx",
        "el-animado": "fable",
      };
      const mappedVoice = customVoiceMapping[selectedVoice.id] || 'nova';

      console.log(`Generando audio con voz: ${mappedVoice}`);
      
      const audioBlob = await generateSpeech({
        text: "Gracias por escuchar",
        // text: content, TODO: Borrar luego de las pruebas, no descomentar
        voice: mappedVoice,
        model: 'tts-1',
      });

      // Procesar el blob
      console.log('Audio generado, procesando blob...');
      const arrayBuffer = await audioBlob.arrayBuffer();
      const compatibleBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      
      // Crear URL y asignarla
      console.log('Creando URL para el audio...');
      const blobUrl = URL.createObjectURL(compatibleBlob);
      console.log('URL creada:', blobUrl);
      
      // Actualizar estado de la UI
      setGenerationStatus(storyId || '', currentChapterIndex, 'completed', 100);
      setShowGenerationPopup(false);
      setGenerationProgress(100);
      
      // Asignar la URL al estado
      console.log('Asignando URL al estado...');
      setAudioUrl(blobUrl);
      addAudioToCache(storyId || '', currentChapterIndex, selectedVoice.id, blobUrl);
      
      // Limpiar intervalo y actualizar estado
      clearInterval(progressInterval);
      toast.success("Audio generado correctamente. Pulse el botón para reproducir.");
      
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error("Error al generar el audio");
      setGenerationStatus(storyId || '', currentChapterIndex, 'error', 0);
    } finally {
      setIsLoading(false);
      setShowGenerationPopup(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEndedEvent = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url("/fondo_png.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay con el color de la voz seleccionada para mantener la identidad visual */}
      <div 
        className="absolute inset-0 z-0 opacity-70"
        style={{ backgroundColor: selectedVoice.color }}
      />
      
      {/* Content container with podcast player design */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md shadow-2xl">
        {/* Header with podcast title - Restructured for better title visibility */}
        <div className="p-5 flex flex-col space-y-3">
          {/* Back button and title row - removed width constraints */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/story/${storyId}`)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all flex-shrink-0"
            >
              <ArrowLeft size={20} className="text-gray-800" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {title}
            </h1>
          </div>
        </div>

        {/* Main content */}
        <div className="relative aspect-square overflow-hidden">
          {/* Waveform background */}
          <div className="absolute inset-0">
            <WaveForm
              isPlaying={isPlaying}
              color={selectedVoice.color}
              intensity={audioIntensity}
            />
          </div>

          {/* Center content with play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Narrator indicator - small and subtle */}
            <div className="mb-4 text-center w-32">
              <span className="text-lg opacity-80 text-gray-800">{selectedVoice.icon}</span>
              <p className="text-xs font-medium text-gray-800/80">{selectedVoice.name}</p>
            </div>

            {/* Play button */}
            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg focus:outline-none hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <AudioWaveLoading color={selectedVoice.color} />
              ) : isPlaying ? (
                <Pause className="w-10 h-10" style={{ color: selectedVoice.color }} />
              ) : (
                <Play className="w-10 h-10 ml-1" style={{ color: selectedVoice.color }} />
              )}
            </button>

            {/* Time display */}
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-800/80">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Controls section */}
        <div className="px-5 pt-4 pb-5 bg-black/10">
          {/* Progress bar */}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!audioUrl}
            className="mb-5"
          />

          {/* Voice selector - moved to top of controls for better visibility */}
          <div className="mb-4 flex justify-center items-center bg-white/10 py-2 px-3 rounded-full">
            <button
              onClick={handlePreviousVoice}
              className="p-2 text-gray-800/80 hover:text-gray-800 flex-shrink-0"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex flex-col items-center mx-3 flex-grow">
              <span className="text-xl opacity-80 text-gray-800">{selectedVoice.icon}</span>
              <span className="text-sm font-medium text-gray-800/90">{selectedVoice.name}</span>
            </div>
            <button
              onClick={handleNextVoice}
              className="p-2 text-gray-800/80 hover:text-gray-800 flex-shrink-0"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Bottom controls row */}
          <div className="flex justify-between items-center">
            {/* Return to reading button - enlarged */}
            <button
              onClick={() => navigate(`/story/${storyId}`)}
              className="py-2.5 px-5 rounded-full text-sm font-medium bg-white/20 text-gray-800 hover:bg-white/30 flex-grow-0"
            >
              Volver a la lectura
            </button>

            {/* Playback speed - enlarged */}
            <button
              onClick={handleSpeedChange}
              className="py-2.5 px-5 rounded-full text-sm font-medium bg-white/20 text-gray-800 hover:bg-white/30 ml-3"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Audio element (hidden) */}
        <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onEnded={handleEndedEvent}
        onError={(e) => {
          console.error("Error en el elemento de audio:", e);
          toast.error("Error al cargar el audio. Intente de nuevo.");
        }}
        preload="auto"
        playsInline
        className="hidden"
      />

      {/* Voice generation popup */}
      {showGenerationPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl"
            style={{ backgroundColor: selectedVoice.color }}
          >
            <div className="text-center mb-4">
              <span className="text-5xl mb-4 inline-block">{selectedVoice.icon}</span>
              <h3 className="text-xl font-bold mb-2">{selectedVoice.name}</h3>
              <p className="text-gray-800 mb-5 text-sm">{selectedVoice.description}</p>

              {isLoading ? (
                <>
                  <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-800 text-sm">Generando audio, por favor espera...</p>
                </>
              ) : (
                <button
                  onClick={handleGenerateAudio}
                  className="w-full py-3 rounded-full bg-white/20 hover:bg-white/30 text-gray-800"
                >
                  Generar Audio
                </button>
              )}
            </div>

            {!isLoading && (
              <button
                onClick={() => setShowGenerationPopup(false)}
                className="w-full py-2 text-gray-800/80 hover:text-gray-800 hover:bg-white/10 text-sm"
              >
                Cancelar
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
