import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Timer, Watch } from "lucide-react";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import StoryOptionCard from "../components/StoryOptionCard";
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
      <div className="gradient-bg min-h-screen relative flex flex-col items-center justify-center p-6">
        <BackButton />
        
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Duración de la Historia
          </h1>
          
          <p className="text-xl text-white/80 mb-10 text-center">
            ¿Cuánto tiempo quieres que dure la historia?
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StoryOptionCard
              icon={<Clock />}
              label="Breve (3-5 min)"
              onClick={() => handleSelectDuration("short")}
              selected={selectedDuration === "short"}
            />
            
            <StoryOptionCard
              icon={<Timer />}
              label="Media (5-10 min)"
              onClick={() => handleSelectDuration("medium")}
              selected={selectedDuration === "medium"}
            />
            
            <StoryOptionCard
              icon={<Watch />}
              label="Larga (10-15 min)"
              onClick={() => handleSelectDuration("long")}
              selected={selectedDuration === "long"}
            />
          </div>
          
          <StoryButton
            onClick={handleContinue}
            isFullWidth
            disabled={!selectedDuration}
          >
            Continuar
          </StoryButton>
        </div>
      </div>
    </PageTransition>
  );
}
