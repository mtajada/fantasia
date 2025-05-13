import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface Voice {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface PreviewVoiceModalProps {
  voice: Voice;
  url: string;
  open: boolean;
  onClose: () => void;
}

export function PreviewVoiceModal({
  voice,
  url,
  open,
  onClose,
}: PreviewVoiceModalProps) {
  const audioRef = useRef<HTMLAudioElement>(new Audio(url));
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // actualizar src cuando cambie la URL
  useEffect(() => {
    if (audioRef.current.src !== url) {
      audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      setIsPlaying(false);
    }
  }, [url]);

  // limpiar al desmontar
  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
    };
  }, []);

  // sincronizar volumen
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => /* manejar error */ null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xs bg-white rounded-2xl overflow-hidden shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 bg-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Vista previa de voz
              </h2>
              <button onClick={onClose} className="p-1">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-8 flex flex-col items-center space-y-4">
              <div
                className="text-6xl"
                style={{ color: voice.color }}
              >
                {voice.icon}
              </div>
              <h3 className="text-xl font-medium text-gray-800">
                {voice.name}
              </h3>
              {voice.description && (
                <p className="text-sm text-gray-600 text-center">
                  {voice.description}
                </p>
              )}

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shadow-md"
                style={{ color: voice.color }}
              >
                {isPlaying ? (
                  <Pause size={28} />
                ) : (
                  <Play size={28} />
                )}
              </button>

              {/* Volume Slider */}
              <div className="w-full">
                <Slider
                  value={[volume]}
                  step={0.01}
                  max={1}
                  onValueChange={(v) => setVolume(v[0])}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Cerrar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
