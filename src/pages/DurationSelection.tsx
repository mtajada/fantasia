import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Timer, Watch } from "lucide-react";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { StoryDuration } from "../types";

export default function DurationSelection() {
  const navigate = useNavigate();
  const { setDuration, currentStoryOptions } = useStoryOptionsStore();
  const [selectedDuration, setSelectedDuration] = useState<StoryDuration | null>(
    currentStoryOptions.duration || null
  );
  
  const handleSelectDuration = (duration: StoryDuration) => {
    setDuration(duration);
    setSelectedDuration(duration);
  };
  
  const handleContinue = () => {
    navigate("/character-selection");
  };
  
  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundImage: "url(/fondo_png.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <BackButton />
        <div className="w-full max-w-xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#BB79D1] text-center mb-4 font-heading drop-shadow-lg">
            Duración de la Historia
          </h1>
          <p className="text-lg text-[#222] bg-white/80 rounded-xl px-4 py-2 text-center mb-8 font-medium shadow-sm">
            ¿Cuánto tiempo quieres que dure la historia?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div 
              onClick={() => handleSelectDuration("short")}
              className={`
                flex flex-col items-center justify-center p-6 cursor-pointer
                bg-white/70 rounded-2xl border-2 border-[#F6A5B7]/60
                ${selectedDuration === "short" ? 'ring-4 ring-[#F6A5B7] shadow-lg transform scale-105' : 'hover:bg-[#F6A5B7]/10 hover:scale-105 hover:shadow-md'}
                transition-all duration-300
              `}
            >
              <div className="text-[#F6A5B7] text-3xl mb-3">
                <Clock />
              </div>
              <span className="text-[#222] text-center font-medium">Breve (3-5 min)</span>
            </div>
            
            <div 
              onClick={() => handleSelectDuration("medium")}
              className={`relative
                flex flex-col items-center justify-center p-6 cursor-pointer
                bg-white/70 rounded-2xl border-2 border-[#F9DA60]/60
                ${selectedDuration === "medium" ? 'ring-4 ring-[#F9DA60] shadow-lg transform scale-105' : 'hover:bg-[#F9DA60]/10 hover:scale-105 hover:shadow-md'}
                transition-all duration-300
              `}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#E6B7D9]/70 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                Narración no disponible
              </div>
              <div className="text-[#F9DA60] text-3xl mb-3">
                <Timer />
              </div>
              <span className="text-[#222] text-center font-medium">Media (5-10 min)</span>
            </div>
            
            <div 
              onClick={() => handleSelectDuration("long")}
              className={`relative
                flex flex-col items-center justify-center p-6 cursor-pointer
                bg-white/70 rounded-2xl border-2 border-[#7DC4E0]/60
                ${selectedDuration === "long" ? 'ring-4 ring-[#7DC4E0] shadow-lg transform scale-105' : 'hover:bg-[#7DC4E0]/10 hover:scale-105 hover:shadow-md'}
                transition-all duration-300
              `}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#E6B7D9]/70 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                Narración no disponible
              </div>
              <div className="text-[#7DC4E0] text-3xl mb-3">
                <Watch />
              </div>
              <span className="text-[#222] text-center font-medium">Larga (10-15 min)</span>
            </div>
          </div>
          
          {/* Botón centrado y alargado al estilo Home */}
          <div className="flex justify-center w-full mt-2 mb-2">
            <StoryButton
              onClick={handleContinue}
              isFullWidth={false}
              disabled={!selectedDuration}
              className="w-full max-w-xs py-4 rounded-2xl text-white text-lg font-semibold shadow-lg bg-[#BB79D1] hover:bg-[#BB79D1]/90 border-2 border-[#BB79D1]/50 transition-all duration-200"
            >
              Continuar
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
