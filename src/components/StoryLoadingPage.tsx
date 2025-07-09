import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';

interface StoryLoadingPageProps {
  type: 'generation' | 'continuation';
  characters?: Array<{name: string; gender: string}>;
  genre?: string;
  format?: string;
  onComplete?: () => void;
}

const ADULT_TIPS = [
  "Customize your story with explicit content preferences 🌶️",
  "Create multiple characters and make them interact ✨",
  "Try different situations and scenarios 🎭",
  "Your story can be narrated with sensual voices 💫",
  "Continue your story if you love where it's going 🔥",
  "Explore different genres and intensities 🪄",
  "Add personal details to make it uniquely yours 🤫",
  "Characters can have complex relationships and desires 💎",
  "Set the mood with different story formats 🌙",
  "AI creates personalized content just for you ✨",
  "Stories can range from sensual to passionate 🌶️",
  "Build tension with episodic storytelling 📚",
  "Single stories offer complete satisfaction 💫",
  "Voice narration adds an intimate touch 🎭",
  "Premium features unlock unlimited possibilities 💎",
  "Your preferences shape every story detail 🪄",
  "Multiple characters create complex dynamics 🔥",
  "Stories adapt to your personal tastes 🤫",
  "Continuation options let you direct the plot 🌙",
  "Each story is crafted with your desires in mind ✨",
  "AI understands nuance and sophistication 💫",
  "Stories can explore any theme or scenario 🎭",
  "Your imagination is the only limit 🌶️",
  "Privacy and discretion are always maintained 🤫",
  "Premium voices enhance the experience 💎",
  "Stories evolve based on your choices 🔥",
  "Every detail is tailored to your preferences 🪄",
  "Create your perfect fantasy world 🌙",
  "AI generates content that surprises and delights ✨",
  "Your story, your rules, your satisfaction 💫"
];

const StoryLoadingPage: React.FC<StoryLoadingPageProps> = ({ 
  type, 
  characters, 
  genre, 
  format, 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          onComplete?.();
          return 100;
        }
        return prev + (100 / 150); // 15 seconds * 10 updates per second
      });
    }, 100);
    
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % ADULT_TIPS.length);
    }, 3000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [onComplete]);
  
  const getMainMessage = () => {
    if (type === 'generation') {
      return "We're crafting your personalized story...";
    } else {
      return "Creating your story continuation...";
    }
  };
  
  const getSubMessage = () => {
    if (type === 'generation') {
      return "Your story is being tailored to your preferences. Please stay on this page while we work our magic ✨";
    } else {
      return "Continuing your story with the perfect next chapter. This won't take long! 🪄";
    }
  };
  
  return (
    <PageTransition>
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: 'black' }}
      >
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mb-8"
          >
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Creating your story...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
          
          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 mb-6 text-center shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-3">
              {getMainMessage()}
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {getSubMessage()}
            </p>
          </motion.div>
          
          {/* Story Details */}
          {(characters || genre || format) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 mb-6 w-full shadow-2xl"
            >
              <div className="grid grid-cols-3 gap-2">
                {characters && characters.length > 0 && (
                  <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                    <p className="text-xs font-semibold text-blue-400">Characters ({characters.length})</p>
                    <p className="text-sm text-gray-300 truncate">
                      {characters.map(char => char.name).join(', ')}
                    </p>
                  </div>
                )}
                
                {genre && (
                  <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
                    <p className="text-xs font-semibold text-purple-400">Genre</p>
                    <p className="text-sm text-gray-300 truncate">{genre}</p>
                  </div>
                )}
                
                {format && (
                  <div className="bg-yellow-500/20 p-2 rounded-lg border border-yellow-500/30">
                    <p className="text-xs font-semibold text-yellow-400">Format</p>
                    <p className="text-sm text-gray-300 truncate">
                      {format === 'single' ? 'Complete Story' : 'By Chapters'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Rotating Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 text-center shadow-2xl"
          >
            <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent mb-3">
              Did you know?
            </h3>
            <motion.p
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-gray-300 text-sm leading-relaxed"
            >
              {ADULT_TIPS[currentTip]}
            </motion.p>
          </motion.div>
          
        </div>
      </div>
    </PageTransition>
  );
};

export default StoryLoadingPage;