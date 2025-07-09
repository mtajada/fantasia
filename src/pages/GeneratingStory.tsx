import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { generateStory } from "../store/stories/storyGenerator";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import StoryLoadingPage from "../components/StoryLoadingPage";

export default function GeneratingStory() {
  const navigate = useNavigate();
  const { currentStoryOptions } = useStoryOptionsStore();
  
  useEffect(() => {
    const generate = async () => {
      try {
        const story = await generateStory(currentStoryOptions);
        navigate(`/story/${story.id}`);
      } catch (error) {
        console.error("Error generating story:", error);
        navigate("/error", { state: { error } });
      }
    };
    
    generate();
  }, [currentStoryOptions, navigate]);
  
  return (
    <StoryLoadingPage
      type="generation"
      characters={currentStoryOptions.characters}
      genre={currentStoryOptions.genre}
      format={currentStoryOptions.format}
    />
  );
}
