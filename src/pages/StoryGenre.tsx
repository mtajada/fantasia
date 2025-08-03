import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStoryOptionsStore } from "../store/storyOptions/storyOptionsStore";
import BackButton from "../components/BackButton";
import StoryButton from "../components/StoryButton";
import PageTransition from "../components/PageTransition";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { StoryCharacter } from "../types";

const suggestedGenres = [
  { id: "erotic-romance", name: "Romance Erótico", icon: "💘" },
  { id: "bdsm", name: "BDSM", icon: "⛓️" },
  { id: "paranormal-erotica", name: "Erótica Paranormal", icon: "👻" },
  { id: "humillacion", name: "Humillación", icon: "😳" },
  { id: "sci-fi-erotica", name: "Ciencia Ficción Erótica", icon: "👽" },
  { id: "taboo-forbidden", name: "Tabú / Prohibido", icon: "🤫" },
];

export default function StoryGenre() {
  const navigate = useNavigate();
  const { currentStoryOptions, setGenre } = useStoryOptionsStore();
  const [customGenre, setCustomGenre] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState<StoryCharacter[]>([]);

  const selectedGenre = currentStoryOptions.genre || "";

  // Verify characters from sessionStorage
  useEffect(() => {
    const selectedCharactersData = sessionStorage.getItem('selectedCharacters');
    if (selectedCharactersData) {
      try {
        const characters = JSON.parse(selectedCharactersData);
        setSelectedCharacters(characters);
        console.log("🔍 StoryGenre - Protagonistas cargados desde sessionStorage:", characters.length);
      } catch (error) {
        console.error("Error parseando los protagonistas en StoryGenre:", error);
      }
    } else {
      console.warn("StoryGenre - No se encontraron protagonistas en sessionStorage, redirigiendo a la selección de protagonistas");
      navigate("/character-selection");
    }
  }, [navigate]);

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
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
          >
            Define el tono de tu fantasía
          </motion.h1>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-300 text-center mb-6 max-w-xl"
          >
            Elige un género o escribe el tuyo. Esto definirá el ambiente y el estilo de tu narrativa. ¡Vamos a ponernos picantes! 🔥
          </motion.p>

          {/* Show selected characters */}
          {selectedCharacters.length > 0 && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white/10 rounded-lg p-3 mb-6 text-center"
            >
              <p className="text-sm text-gray-300 mb-1">Protagonistas elegidos:</p>
              <p className="text-violet-300 font-medium">
                {selectedCharacters.map(char => char.name).join(', ')} ({selectedCharacters.length})
              </p>
            </motion.div>
          )}

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
            <p className="text-center text-gray-400 mb-3">O, si te atreves, crea el tuyo:</p>
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
              isFullWidth
            >
              Continuar
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
