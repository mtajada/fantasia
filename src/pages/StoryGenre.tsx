import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

const suggestedGenres = [
  { id: "erotic-romance", name: "Romance Erótico", icon: "💘" },
  { id: "bdsm", name: "BDSM", icon: "⛓️" },
  { id: "paranormal-erotica", name: "Erótica Paranormal", icon: "👻" },
  { id: "lgbtq+", name: "LGBTQ+", icon: "🏳️‍🌈" },
  { id: "sci-fi-erotica", name: "Sci-Fi Erótica", icon: "👽" },
  { id: "taboo-forbidden", name: "Tabú / Prohibido", icon: "🤫" },
];

export default function StoryGenre() {
  const navigate = useNavigate();
  const { currentStoryOptions, setGenre } = useStoryOptionsStore();
  const [customGenre, setCustomGenre] = useState("");

  const selectedGenre = currentStoryOptions.genre || "";

  const handleSelectGenre = (genre: string) => {
    setGenre(genre);
    setCustomGenre(""); // Clear custom input when a suggestion is picked
  };

  const handleCustomGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomGenre(value);
    setGenre(value); // Update the store with the custom value
  };

  const handleContinue = () => {
    navigate("/story-details-input");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <BackButton />

        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
          >
            Elige el Tono de tu Historia
          </motion.h1>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-300 text-center mb-10 max-w-xl"
          >
            Selecciona un género sugerido o escribe el tuyo. Esto definirá el ambiente y el estilo de tu narración.
          </motion.p>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8"
          >
            {suggestedGenres.map((genre) => (
              <motion.div
                key={genre.id}
                variants={item}
                onClick={() => handleSelectGenre(genre.name)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 h-32 rounded-lg cursor-pointer border-2 transition-all duration-300",
                  selectedGenre === genre.name
                    ? "bg-violet-800/50 border-violet-400 scale-105 shadow-lg shadow-violet-500/30"
                    : "bg-gray-800/50 border-gray-700 hover:border-violet-500 hover:bg-gray-700/70"
                )}
              >
                <span className="text-4xl mb-2">{genre.icon}</span>
                <span className="text-center font-medium text-gray-200">{genre.name}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md mb-10"
          >
            <p className="text-center text-gray-400 mb-3">O introduce tu propio género:</p>
            <Input
              type="text"
              placeholder="Ej: Comedia Oscura, Thriller Psicológico..."
              value={customGenre}
              onChange={handleCustomGenreChange}
              className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg text-center text-white placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </motion.div>

          <div className="w-full max-w-xs">
            <StoryButton
              onClick={handleContinue}
              disabled={!selectedGenre}
              className="w-full"
            >
              Continuar
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
