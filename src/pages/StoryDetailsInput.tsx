import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStoryOptionsStore } from '../store/storyOptions/storyOptionsStore';
import PageTransition from '../components/PageTransition';
import BackButton from '../components/BackButton';
import StoryButton from '../components/StoryButton';
import { supabase } from '../supabaseClient';
import type { PresetSuggestion, StoryFormat } from '../types';
import { RefreshCw, Sparkles } from 'lucide-react';

const StoryDetailsInput: React.FC = () => {
  const [detailsText, setDetailsText] = useState('');
  const [format, setFormatState] = useState<StoryFormat>('episodic'); // Default to episodic
  const { setAdditionalDetails, setFormat } = useStoryOptionsStore();
  const navigate = useNavigate();

  // --- State for Presets ---
  const [presets, setPresets] = useState<PresetSuggestion[]>([]);
  const [allPresets, setAllPresets] = useState<PresetSuggestion[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState<boolean>(true);

  // --- Function to fetch all presets ---
  const fetchAndStoreAllPresets = useCallback(async () => {
    setIsLoadingPresets(true);
    try {
      const { data, error } = await supabase
        .from('preset_suggestions')
        .select('id, text_prompt')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching presets:', error.message);
      } else if (data) {
        setAllPresets(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching presets:', err);
    } finally {
      setIsLoadingPresets(false);
    }
  }, []);

  // --- Function to select 3 random presets ---
  const selectRandomPresets = useCallback(() => {
    if (allPresets.length < 3) {
      setPresets(allPresets);
      return;
    }

    // Simple shuffle and take 3
    const shuffled = [...allPresets].sort(() => 0.5 - Math.random());
    setPresets(shuffled.slice(0, 3));
  }, [allPresets]);

  // --- Effect to load all presets on mount ---
  useEffect(() => {
    fetchAndStoreAllPresets();
  }, [fetchAndStoreAllPresets]);

  // --- Effect to select initial random presets ---
  useEffect(() => {
    if (allPresets.length > 0) {
      selectRandomPresets();
    }
  }, [allPresets, selectRandomPresets]);

  // --- Handler to generate the story ---
  const handleGenerate = () => {
    // Pass details only if the textarea has content
    if (detailsText.trim()) {
      setAdditionalDetails(detailsText.trim());
    } else {
      setAdditionalDetails(undefined); // Treat as skipped if empty
    }
    
    // Set the selected format in the store
    setFormat(format);
    
    navigate('/generating'); // Navigate to the generation screen
  };

  // --- Handler to apply a preset to the textarea ---
  const handlePresetClick = (text: string) => {
    setDetailsText(text);
  };

  // Page element animations
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Preset animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundColor: 'black',
        }}
      >
        <BackButton />
        
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center p-4">
          {/* Animated title and subtitle */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
          >
            Any <span className="text-pink-400">juicy details</span>? 🤫
          </motion.h1>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-300 text-center mb-10 max-w-xl"
          >
            Spice up your story with some extra instructions or wild ideas! 🌶️
          </motion.p>

          {/* "Optional Step" Badge */}
          <motion.div
            className="flex justify-center mb-2"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
          >
            <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-gray-800/80 border border-gray-700 text-violet-300 shadow-sm">
              <Sparkles className="w-4 h-4 mr-1.5 text-violet-400" />
              Optional, but fun! ✨
            </span>
          </motion.div>
          
          {/* Presets Section */}
          <motion.div
            className="mb-4 w-full"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3 w-full">
              <p className="text-center text-gray-400">Need some inspo? 😉</p>
              <button
                onClick={selectRandomPresets}
                disabled={isLoadingPresets || allPresets.length < 3}
                className="text-violet-400 hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center bg-gray-800/80 px-3 py-1 rounded-full shadow-sm border border-gray-700"
              >
                <RefreshCw size={14} className="mr-1.5" />
                New Ideas
              </button>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8"
            >
              {isLoadingPresets ? (
                <div className="col-span-full flex justify-center items-center p-4 h-24 rounded-lg bg-gray-800/50 border-2 border-gray-700">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2.5 w-2.5 bg-violet-400/60 rounded-full"></div>
                    <div className="h-2.5 w-2.5 bg-violet-400/60 rounded-full animation-delay-200"></div>
                    <div className="h-2.5 w-2.5 bg-violet-400/60 rounded-full animation-delay-400"></div>
                  </div>
                </div>
              ) : presets.length > 0 ? (
                presets.map((preset) => (
                  <motion.div key={preset.id} variants={item}>
                    <button
                      onClick={() => handlePresetClick(preset.text_prompt)}
                      className="w-full text-center p-3 h-24 rounded-lg bg-gray-800/50 border-2 border-gray-700 text-gray-300 text-sm hover:border-violet-500 hover:bg-gray-700/70 transition-all shadow-sm hover:shadow-lg"
                    >
                      {preset.text_prompt}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 text-sm italic p-4 h-24 rounded-lg bg-gray-800/50 border-2 border-gray-700">
                  No suggestions available right now. Get creative! 💡
                </div>
              )}
            </motion.div>
          </motion.div>
          
          {/* Format Selector */}
          <motion.div
            className="mb-6 w-full"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400 text-center mb-3">Choose your story format 📚</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setFormatState('episodic')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  format === 'episodic' 
                    ? 'border-violet-500 bg-violet-500/20 ring-2 ring-violet-500/50' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-violet-400 hover:bg-violet-400/10'
                }`}
              >
                <span className="block font-semibold text-violet-300 mb-1">By Chapters</span>
                <span className="text-sm text-gray-400">Story with open ending for continuation</span>
              </button>
              
              <button
                onClick={() => setFormatState('single')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  format === 'single' 
                    ? 'border-pink-500 bg-pink-500/20 ring-2 ring-pink-500/50' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-pink-400 hover:bg-pink-400/10'
                }`}
              >
                <span className="block font-semibold text-pink-300 mb-1">Complete Story</span>
                <span className="text-sm text-gray-400">Full story with beginning, middle, and end</span>
              </button>
            </div>
          </motion.div>
          
          {/* Animated Textarea Container */} 
          <motion.div
            className="mb-6 w-full"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.35 }}
          >
            <textarea
              id="storyDetailsTextarea"
              value={detailsText}
              onChange={(e) => setDetailsText(e.target.value)}
              placeholder="Drop your brilliant ideas here, or pick a suggestion from above... ✨"
              className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all h-32 resize-none"
            />
          </motion.div>
          
          {/* Generate Story Button */} 
          <div className="w-full max-w-xs mt-6">
            <StoryButton
              onClick={handleGenerate}
              className="w-full"
            >
              Let's make magic! 🪄
            </StoryButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StoryDetailsInput;

