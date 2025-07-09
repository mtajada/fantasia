// src/pages/StoryContinuation.tsx
// VERSIÓN CORREGIDA para manejar la respuesta { content, title } del servicio

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
import { useUserStore } from "../store/user/userStore";
import BackButton from "../components/BackButton";
import PageTransition from "../components/PageTransition";
import StoryContinuationOptions from "../components/StoryContinuationOptions";
import StoryContinuationCustomInput from "../components/StoryContinuationCustomInput";
import { toast } from "sonner";
import { Story, StoryChapter as StoryChapterType } from "../types";
import { StoryContinuationService } from "../services/ai/StoryContinuationService";
import { generateId } from "../store/core/utils";
import StoryLoadingPage from "../components/StoryLoadingPage";

export default function StoryContinuation() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getStoryById } = useStoriesStore();
  const { getChaptersByStoryId, addChapter } = useChaptersStore();
  const { canContinueStory } = useUserStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [continuationOptions, setContinuationOptions] = useState<{ summary: string }[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<StoryChapterType[]>([]);
  const [shouldGenerateOptions, setShouldGenerateOptions] = useState(true);
  const [isAllowedToContinue, setIsAllowedToContinue] = useState(true);

  useEffect(() => {
    if (!storyId) {
      navigate("/home");
      return;
    }

    const fetchedStory = getStoryById(storyId);
    if (!fetchedStory) {
      toast.error("Story not found");
      navigate("/saved-stories");
      return;
    }
    setStory(fetchedStory);

    const existingChapters = getChaptersByStoryId(storyId);
    let currentChapters: StoryChapterType[];

    if (existingChapters.length === 0 && fetchedStory.content) {
      const initialChapter: StoryChapterType = {
        id: generateId("chapter"),
        chapterNumber: 1,
        title: fetchedStory.title || "Chapter 1",
        content: fetchedStory.content,
        createdAt: fetchedStory.createdAt,
      };
      currentChapters = [initialChapter];
    } else {
      currentChapters = existingChapters;
    }
    setChapters(currentChapters);

    const allowed = canContinueStory(storyId);
    setIsAllowedToContinue(allowed);
    if (!allowed) {
      toast.info("You've reached the free continuation limit for this story.");
    }

  }, [storyId, getStoryById, getChaptersByStoryId, navigate, canContinueStory]);

  useEffect(() => {
    if (isAllowedToContinue) {
      setShouldGenerateOptions(true);
    }
  }, [location.search, isAllowedToContinue]);

  const generateOptions = useCallback(async () => {
    if (!story || chapters.length === 0 || !isAllowedToContinue) return;

    console.log(`Generating options for story ${story.id}`);
    setIsLoadingOptions(true);
    setContinuationOptions([]);
    try {
      const response = await StoryContinuationService.generateContinuationOptions(
        story, 
        chapters
      );
      if (response?.options?.length === 3) {
        setContinuationOptions(response.options);
      } else {
        console.warn("generateOptions: Didn't receive 3 valid options. Using defaults.");
        throw new Error("Fallback");
      }
    } catch (error) {
      console.error("Error generating continuation options:", error);
      toast.error("Could not generate options. Try again.");
      setContinuationOptions([
        { summary: "Explore the mysterious sanctuary." },
        { summary: "Follow the intriguing whisper." },
        { summary: "Discover the hidden desire." }
      ]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [story, chapters, isAllowedToContinue]);

  useEffect(() => {
    if (story && chapters.length > 0 && shouldGenerateOptions && isAllowedToContinue) {
      generateOptions();
      setShouldGenerateOptions(false);
    }
  }, [chapters, story, shouldGenerateOptions, generateOptions, isAllowedToContinue]);

  const handleGenerateAndSaveChapter = useCallback(async (
    generationPromise: Promise<{ content: string; title: string }>,
    generationMethod: StoryChapterType['generationMethod'],
    customInput?: string
  ) => {
    if (!story || !storyId || !isAllowedToContinue) {
      toast.error("You can't continue this story (limit reached).");
      return;
    }

    setIsLoading(true);
    toast.loading("Creating your continuation...");

    try {
      const nextChapterNumber = chapters.length + 1;
      const { content, title } = await generationPromise;

      const newChapter: StoryChapterType = {
        id: generateId("chapter"),
        chapterNumber: nextChapterNumber,
        title: title || `Chapter ${nextChapterNumber}`,
        content: content,
        createdAt: new Date().toISOString(),
        generationMethod: generationMethod,
        ...(customInput && { customInput: customInput })
      };

      await addChapter(storyId, newChapter);

      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);

      toast.dismiss();
      toast.success("Continuation created successfully! ✨");

      setShouldGenerateOptions(true);

      navigate(`/story/${storyId}?chapter=${newChapter.chapterNumber - 1}`);

    } catch (error: any) {
      console.error("Error generating continuation:", error);
      toast.dismiss();
      toast.error("Error generating continuation", {
        description: error?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [story, storyId, isAllowedToContinue, addChapter, chapters, navigate]);

  const handleSelectFree = () => {
    if (!story) return; // Añadir guarda por si acaso
    // Obtener el estado MÁS ACTUAL de los capítulos ANTES de enviar
    const currentChaptersFromStore = useChaptersStore.getState().getChaptersByStoryId(story.id);
    console.log(`[StoryContinuation] Passing ${currentChaptersFromStore.length} chapters to freeContinuation service.`);

    handleGenerateAndSaveChapter(
      // Pasar los capítulos correctos del store
      StoryContinuationService.generateFreeContinuation(story, currentChaptersFromStore),
      "free"
    );
  };

  const handleSelectOption = (index: number) => {
    if (!story) return; // Añadir guarda
    const selectedOptionSummary = continuationOptions[index]?.summary;
    if (!selectedOptionSummary) {
      toast.error("Selected option is not valid.");
      return;
    }
    // Obtener el estado MÁS ACTUAL de los capítulos ANTES de enviar
    const currentChaptersFromStore = useChaptersStore.getState().getChaptersByStoryId(story.id);
    console.log(`[StoryContinuation] Passing ${currentChaptersFromStore.length} chapters to optionContinuation service.`);

    handleGenerateAndSaveChapter(
      // Pasar los capítulos correctos del store
      StoryContinuationService.generateOptionContinuation(story, currentChaptersFromStore, selectedOptionSummary),
      `option${index + 1}` as "option1" | "option2" | "option3"
    );
  };

  const handleCustomContinuation = (userDirection: string) => {
    if (!story) return; // Añadir guarda
    setShowCustomInput(false);
    // Obtener el estado MÁS ACTUAL de los capítulos ANTES de enviar
    const currentChaptersFromStore = useChaptersStore.getState().getChaptersByStoryId(story.id);
    console.log(`[StoryContinuation] Passing ${currentChaptersFromStore.length} chapters to directedContinuation service.`);

    handleGenerateAndSaveChapter(
      // Pasar los capítulos correctos del store
      StoryContinuationService.generateDirectedContinuation(story, currentChaptersFromStore, userDirection),
      "custom",
      userDirection
    );
  };

  if (isLoading) {
    return (
      <StoryLoadingPage
        type="continuation"
        characters={story?.options?.characters}
        genre={story?.options?.genre}
        format={story?.options?.format}
      />
    );
  }

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundColor: 'black',
        }}
      >
        <BackButton
          onClick={() => {
            if (showCustomInput) {
              setShowCustomInput(false);
            } else {
              navigate(`/story/${storyId}?chapter=${chapters.length > 0 ? chapters.length - 1 : 0}`);
            }
          }}
        />

        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          {chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-4 mb-4 text-gray-200 shadow-xl ring-1 ring-gray-700/50"
            >
              <div className="flex items-center">
                <BookOpen size={20} className="mr-2 text-violet-400" />
                <h2 className="text-lg font-medium truncate" title={chapters[chapters.length - 1].title || `Chapter ${chapters.length}`}>
                  Continuing: {chapters[chapters.length - 1].title || `Chapter ${chapters.length}`}
                </h2>
              </div>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 font-heading bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent drop-shadow-lg"
          >
            How would you like it to continue? ✨
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-200 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl px-4 py-3 text-center mb-6 font-medium shadow-xl ring-1 ring-gray-700/50"
          >
            Choose your path to continue the story 🤫
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {!showCustomInput ? (
              <StoryContinuationOptions
                options={continuationOptions}
                onSelectOption={handleSelectOption}
                onSelectFree={handleSelectFree}
                onSelectCustom={() => setShowCustomInput(true)}
                isLoading={isLoadingOptions}
                disabled={!isAllowedToContinue}
              />
            ) : (
              <StoryContinuationCustomInput
                onSubmit={handleCustomContinuation}
                onBack={() => setShowCustomInput(false)}
                disabled={!isAllowedToContinue}
              />
            )}
          </motion.div>

          {!isAllowedToContinue && chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-center bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-4 mt-6 shadow-xl ring-1 ring-gray-700/50"
            >
              <p className="text-pink-400 font-semibold">
                You've reached the free continuation limit for this story. Consider upgrading to Premium for unlimited continuations! 💎
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}