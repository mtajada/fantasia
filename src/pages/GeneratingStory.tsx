import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { generateStory } from "../store/stories/storyGenerator";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import StoryLoadingPage from "../components/StoryLoadingPage";

export default function GeneratingStory() {
  const navigate = useNavigate();
  const { currentStoryOptions } = useStoryOptionsStore();
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const generationStartedRef = useRef(false);
  const initialOptionsRef = useRef(currentStoryOptions);
  
  useEffect(() => {
    // Prevent double execution
    if (hasStartedGeneration || generationStartedRef.current) {
      console.log("🔍 DEBUG - La generación ya ha comenzado, saltando.");
      return;
    }
    
    // Mark as started immediately
    setHasStartedGeneration(true);
    generationStartedRef.current = true;
    
    const generate = async () => {
      try {
        console.log("🔍 DEBUG - Iniciando la generación de la historia con las opciones:", initialOptionsRef.current);
        const story = await generateStory(initialOptionsRef.current);
        if (story) {
          navigate(`/story/${story.id}`);
        } else {
          console.error("La generación de la historia falló - devolvió nulo");
          navigate("/error", { state: { error: "La generación de la historia falló - no se devolvió ninguna historia" } });
        }
      } catch (error) {
        console.error("Error generando historia:", error);
        navigate("/error", { state: { error } });
      }
    };
    
    generate();
  }, [hasStartedGeneration, navigate]); // Using ref to avoid dependency on currentStoryOptions
  
  return (
    <StoryLoadingPage
      type="generation"
      characters={currentStoryOptions.characters}
      genre={currentStoryOptions.genre}
      format={currentStoryOptions.format}
    />
  );
}
