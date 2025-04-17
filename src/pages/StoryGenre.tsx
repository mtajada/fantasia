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
        
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#BB79D1] text-center mb-4 font-heading drop-shadow-lg">
            Género del Cuento
          </h1>
          
          <p className="text-lg text-[#222] bg-white/80 rounded-xl px-4 py-2 text-center mb-8 font-medium shadow-sm">
            Elige el tipo de historia que quieres crear
          </p>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
          >
            <motion.div key="adventure" variants={item}>
              <div
                onClick={() => handleSelectGenre("adventure")}
                className={`
                  flex flex-col items-center justify-center p-6 h-32 sm:h-40 cursor-pointer
                  bg-white/70 rounded-2xl border-2 border-[#F9DA60]/60
                  ${selectedGenre === "adventure" ? 'ring-4 ring-[#F9DA60] shadow-lg transform scale-105' : 'hover:bg-[#F9DA60]/10 hover:scale-105 hover:shadow-md'}
                  transition-all duration-300
                `}
              >
                <div className="text-[#F9DA60] text-3xl mb-3">
                  <Compass />
                </div>
                <span className="text-[#222] text-center font-medium">Aventura</span>
              </div>
            </motion.div>
            
            <motion.div key="fantasy" variants={item}>
              <div
                onClick={() => handleSelectGenre("fantasy")}
                className={`
                  flex flex-col items-center justify-center p-6 h-32 sm:h-40 cursor-pointer
                  bg-white/70 rounded-2xl border-2 border-[#BB79D1]/60
                  ${selectedGenre === "fantasy" ? 'ring-4 ring-[#BB79D1] shadow-lg transform scale-105' : 'hover:bg-[#BB79D1]/10 hover:scale-105 hover:shadow-md'}
                  transition-all duration-300
                `}
              >
                <div className="text-[#BB79D1] text-3xl mb-3">
                  <Sparkles />
                </div>
                <span className="text-[#222] text-center font-medium">Fantasía</span>
              </div>
            </motion.div>
            
            <motion.div key="mystery" variants={item}>
              <div
                onClick={() => handleSelectGenre("mystery")}
                className={`
                  flex flex-col items-center justify-center p-6 h-32 sm:h-40 cursor-pointer
                  bg-white/70 rounded-2xl border-2 border-[#7DC4E0]/60
                  ${selectedGenre === "mystery" ? 'ring-4 ring-[#7DC4E0] shadow-lg transform scale-105' : 'hover:bg-[#7DC4E0]/10 hover:scale-105 hover:shadow-md'}
                  transition-all duration-300
                `}
              >
                <div className="text-[#7DC4E0] text-3xl mb-3">
                  <Search />
                </div>
                <span className="text-[#222] text-center font-medium">Misterio</span>
              </div>
            </motion.div>
            
            <motion.div key="science-fiction" variants={item}>
              <div
                onClick={() => handleSelectGenre("science-fiction")}
                className={`
                  flex flex-col items-center justify-center p-6 h-32 sm:h-40 cursor-pointer
                  bg-white/70 rounded-2xl border-2 border-[#7DC4E0]/60
                  ${selectedGenre === "science-fiction" ? 'ring-4 ring-[#7DC4E0] shadow-lg transform scale-105' : 'hover:bg-[#7DC4E0]/10 hover:scale-105 hover:shadow-md'}
                  transition-all duration-300
                `}
              >
                <div className="text-[#7DC4E0] text-3xl mb-3">
                  <Rocket />
                </div>
                <span className="text-[#222] text-center font-medium">Ciencia Ficción</span>
              </div>
            </motion.div>
            
            <motion.div key="comedy" variants={item}>
              <div
                onClick={() => handleSelectGenre("comedy")}
                className={`
                  flex flex-col items-center justify-center p-6 h-32 sm:h-40 cursor-pointer
                  bg-white/70 rounded-2xl border-2 border-[#F6A5B7]/60
                  ${selectedGenre === "comedy" ? 'ring-4 ring-[#F6A5B7] shadow-lg transform scale-105' : 'hover:bg-[#F6A5B7]/10 hover:scale-105 hover:shadow-md'}
                  transition-all duration-300
                `}
              >
                <div className="text-[#F6A5B7] text-3xl mb-3">
                  <SmilePlus />
                </div>
                <span className="text-[#222] text-center font-medium">Comedia</span>
              </div>
            </motion.div>
            
            <motion.div key="fable" variants={item}>
              <div
                onClick={() => handleSelectGenre("fable")}
                className={`
                  flex flex-col items-center justify-center p-6 h-32 sm:h-40 cursor-pointer
                  bg-white/70 rounded-2xl border-2 border-[#F9DA60]/60
                  ${selectedGenre === "fable" ? 'ring-4 ring-[#F9DA60] shadow-lg transform scale-105' : 'hover:bg-[#F9DA60]/10 hover:scale-105 hover:shadow-md'}
                  transition-all duration-300
                `}
              >
                <div className="text-[#F9DA60] text-3xl mb-3">
                  <Feather />
                </div>
                <span className="text-[#222] text-center font-medium">Fábula</span>
              </div>
            </motion.div>
          </motion.div>
          
          <div className="flex justify-center w-full mt-2 mb-2">
            <StoryButton
              onClick={handleContinue}
              disabled={!selectedGenre}
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
