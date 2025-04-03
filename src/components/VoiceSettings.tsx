import { useState, useEffect } from 'react';
import { Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { getAvailableVoices, ELEVENLABS_VOICES } from '../services/ttsService';

interface VoiceSettingsProps {
  onSettingsChange: (settings: {
    voiceId: string;
    stability: number;
    similarityBoost: number;
  }) => void;
  className?: string;
}

export default function VoiceSettings({ onSettingsChange, className = '' }: VoiceSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState(ELEVENLABS_VOICES);
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0]);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar las voces disponibles
  useEffect(() => {
    const loadVoices = async () => {
      setIsLoading(true);
      try {
        const availableVoices = await getAvailableVoices();
        setVoices(availableVoices);
        
        // Seleccionar la primera voz por defecto
        const defaultVoice = availableVoices[0];
        setSelectedVoice(defaultVoice);
        
        onSettingsChange({
          voiceId: defaultVoice.id,
          stability,
          similarityBoost
        });
      } catch (error) {
        console.error('Error cargando voces:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVoices();
  }, []);

  const handleVoiceChange = (voice: typeof ELEVENLABS_VOICES[0]) => {
    setSelectedVoice(voice);
    onSettingsChange({
      voiceId: voice.id,
      stability,
      similarityBoost
    });
    setIsOpen(false);
  };

  const handleStabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStability = parseFloat(e.target.value);
    setStability(newStability);
    onSettingsChange({
      voiceId: selectedVoice.id,
      stability: newStability,
      similarityBoost
    });
  };

  const handleSimilarityBoostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBoost = parseFloat(e.target.value);
    setSimilarityBoost(newBoost);
    onSettingsChange({
      voiceId: selectedVoice.id,
      stability,
      similarityBoost: newBoost
    });
  };

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`voice-settings ${className}`}>
      <div className="text-center mb-2 text-white/90 text-sm font-medium">
        Personalizar narración
      </div>
      
      <div className="mb-6 relative">
        <button
          onClick={toggleSettings}
          className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/15 rounded-xl text-white text-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-purple-200" />
            <span>{selectedVoice.description}</span>
          </div>
          <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute mt-1 w-full rounded-xl p-2 bg-white/10 backdrop-blur-xl z-10 animate-fadeIn shadow-xl">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceChange(voice)}
                className={`w-full text-left p-3 my-1 rounded-lg flex items-center transition-colors hover:bg-white/10 ${
                  selectedVoice.id === voice.id ? 'bg-white/20 font-medium' : ''
                }`}
              >
                <span className={`h-2 w-2 rounded-full mr-3 ${voice.description.includes('Femenina') ? 'bg-pink-400' : 'bg-blue-400'}`}></span>
                {voice.description}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl p-4">
        <label className="block text-sm mb-2 text-white/90">
          Estabilidad: {(stability * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={stability}
          onChange={handleStabilityChange}
          className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs mt-1 text-white/70">
          <span>Inestable</span>
          <span>Balanceada</span>
          <span>Estable</span>
        </div>
      </div>

      <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl p-4">
        <label className="block text-sm mb-2 text-white/90">
          Fidelidad: {(similarityBoost * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={similarityBoost}
          onChange={handleSimilarityBoostChange}
          className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs mt-1 text-white/70">
          <span>Creativa</span>
          <span>Balanceada</span>
          <span>Fiel</span>
        </div>
      </div>
    </div>
  );
} 
