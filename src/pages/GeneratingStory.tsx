import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { generateStory } from "../store/stories/storyGenerator";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import LoadingAnimation from "../components/LoadingAnimation";
import PageTransition from "../components/PageTransition";

export default function GeneratingStory() {
  const navigate = useNavigate();
  const { currentStoryOptions } = useStoryOptionsStore();
  const { isGeneratingStory } = useStoriesStore();
  
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
  }, []);
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <LoadingAnimation message="Creando tu historia..." />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-white/70 text-center max-w-sm"
          >
            <p>Estamos personalizando una historia mágica especialmente para ti...</p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
