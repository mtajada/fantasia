import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { Compass, Sparkles, Search, Rocket, SmilePlus, Feather } from "lucide-react";

const storyGenres = [
  { id: "adventure", name: "Aventura", icon: <Compass /> },
  { id: "fantasy", name: "Fantasía", icon: <Sparkles /> },
  { id: "mystery", name: "Misterio", icon: <Search /> },
  { id: "science-fiction", name: "Ciencia Ficción", icon: <Rocket /> },
  { id: "comedy", name: "Comedia", icon: <SmilePlus /> },
  { id: "fable", name: "Fábula", icon: <Feather /> }
];

export default function StoryGenre() {
  const navigate = useNavigate();
  const { currentStoryOptions, setGenre } = useStoryOptionsStore();
  const selectedGenre = currentStoryOptions.genre || "";
  
  const handleSelectGenre = (genre: string) => {
    setGenre(genre);
  };
  
  const handleContinue = () => {
    navigate("/story-moral");
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <PageTransition>
      <div className="gradient-bg min-h-screen relative overflow-auto py-20 px-6">
        <BackButton />
        
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-10 text-center">
            Género del Cuento
          </h1>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10"
          >
            {storyGenres.map((genre) => (
              <motion.div key={genre.id} variants={item}>
                <div
                  onClick={() => handleSelectGenre(genre.id)}
                  className={`
                    story-choice-card h-32 sm:h-40 relative overflow-hidden
                    ${selectedGenre === genre.id 
                      ? 'ring-4 ring-story-orange-400 bg-white/20 shadow-lg transform scale-105' 
                      : 'hover:scale-105 hover:shadow-md transition-all duration-300'}
                  `}
                >
                  <div className="text-white text-3xl mb-3">
                    {genre.icon}
                  </div>
                  <span className="text-white text-center font-medium">{genre.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="flex justify-center mb-6">
            <StoryButton
              onClick={handleContinue}
              disabled={!selectedGenre}
              className="w-full max-w-md text-lg py-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-story-orange-500 to-story-orange-400 text-white rounded-full border-2 border-white/50 font-medium"
            >
              Continuar
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
