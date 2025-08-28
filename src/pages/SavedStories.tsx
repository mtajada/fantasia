import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Calendar, ChevronDown, ChevronRight, Bookmark, User, Clock, SortAsc, SortDesc, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoriesStore } from "../store/stories/storiesStore";
import { useChaptersStore } from "../store/stories/chapters/chaptersStore";
import BackButton from "../components/BackButton";
import PageTransition from "../components/PageTransition";
import { StoryWithChapters } from "../types";

export default function SavedStories() {
  const navigate = useNavigate();
  const { generatedStories } = useStoriesStore();
  const { getChaptersByStoryId } = useChaptersStore();
  const [expandedStories, setExpandedStories] = useState<{[key: string]: boolean}>({});
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
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

  const toggleExpand = (storyId: string) => {
    setExpandedStories(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  // Group stories that have chapters
  const storiesWithChaptersInfo = generatedStories.map(story => {
    const chapters = getChaptersByStoryId(story.id);
    return {
      ...story,
      hasMultipleChapters: chapters.length > 1,
      chaptersCount: chapters.length,
      chapters
    } as StoryWithChapters;
  });
  
  // Sort stories based on sort order
  const sortedStories = [...storiesWithChaptersInfo].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{
          backgroundColor: '#000000',
        }}
      >
        <BackButton />
        
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            Mis Historias ✨
          </h1>
          
          {storiesWithChaptersInfo.length > 0 && (
            <div 
              className="flex justify-center mb-6 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-1 max-w-xs mx-auto shadow-xl"
              onClick={toggleSortOrder}
            >
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortOrder === 'newest' ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/25' : 'hover:bg-gray-800/80 text-gray-300'}`}>
                <SortDesc size={16} />
                <span>Más Recientes</span>
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortOrder === 'oldest' ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/25' : 'hover:bg-gray-800/80 text-gray-300'}`}>
                <SortAsc size={16} />
                <span>Más Antiguas</span>
              </button>
            </div>
          )}
          
          {sortedStories.length === 0 ? (
            <div className="text-center bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-2xl">
              <p className="text-gray-300 font-medium">No tienes historias guardadas.</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {sortedStories.map((story) => (
                <motion.div
                  key={story.id}
                  variants={item}
                  className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-700/50"
                >
                  <div 
                    className="story-card p-4 cursor-pointer hover:bg-gray-800/80 transition-all"
                    onClick={() => story.hasMultipleChapters 
                      ? toggleExpand(story.id) 
                      : navigate(`/story/${story.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 flex items-center justify-center mr-4 shrink-0 border-2 border-pink-500/40">
                        <Book size={20} className="text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-100 font-semibold text-lg truncate">{story.title}</h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar size={14} className="mr-1 shrink-0" />
                          <span className="mr-3">{formatDate(story.createdAt)}</span>
                          {story.hasMultipleChapters && (
                            <span className="text-violet-400 flex items-center">
                              <Bookmark size={14} className="mr-1" />
                              {story.chaptersCount} chapters
                            </span>
                          )}
                        </div>
                      </div>
                      {story.hasMultipleChapters && (
                        <div className="ml-2">
                          {expandedStories[story.id] ? (
                            <ChevronDown size={20} className="text-violet-400" />
                          ) : (
                            <ChevronRight size={20} className="text-violet-400" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Character info */}
                    <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center">
                      <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 h-8 w-8 rounded-full flex items-center justify-center mr-2 border border-violet-500/40">
                        <User size={14} className="text-violet-400" />
                      </div>
                      <div className="text-gray-200 text-sm flex-1">
                        <span className="font-medium">
                          {story.options.characters?.map(char => char.name).join(', ') || "Sin personajes"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {story.options.genre && (
                          <div className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-400 border border-pink-500/30">
                            {story.options.genre}
                          </div>
                        )}
                        <div className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/40 flex items-center gap-1">
                          <Clock size={11} className="text-violet-400" />
                          {story.options.format === 'single' ? 'Completa' : 'Capítulos'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chapters list for expanded stories */}
                  <AnimatePresence>
                    {story.hasMultipleChapters && expandedStories[story.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-800/50 border-t border-gray-700/50">
                          {story.chapters.map((chapter, index) => (
                            <div 
                              key={`${story.id}-chapter-${index}`}
                              className="px-4 py-3 border-b border-gray-700/30 last:border-b-0 hover:bg-gray-700/50 cursor-pointer"
                              onClick={() => navigate(`/story/${story.id}?chapter=${index}`)}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-center justify-center mr-3 shrink-0 border border-violet-500/30">
                                  <span className="text-sm text-violet-400 font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-gray-200 font-medium">
                                    {chapter.title || `Capítulo ${index + 1}`}
                                  </h4>
                                  <span className="text-gray-400 text-xs">
                                    {formatDate(chapter.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
