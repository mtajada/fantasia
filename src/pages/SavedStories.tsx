import { useState } from "react";
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
    return new Intl.DateTimeFormat('es-ES', { 
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
      <div className="gradient-bg min-h-screen relative">
        <BackButton />
        
        <div className="container max-w-2xl mx-auto py-20 px-6">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Mis Historias
          </h1>
          
          {storiesWithChaptersInfo.length > 0 && (
            <div 
              className="flex justify-center mb-6 bg-white/10 backdrop-blur-sm rounded-full p-1 max-w-xs mx-auto"
              onClick={toggleSortOrder}
            >
              <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white font-medium transition-all ${sortOrder === 'newest' ? 'bg-story-orange-400 shadow-lg' : 'hover:bg-white/10'}`}>
                <SortDesc size={16} />
                <span>Más recientes</span>
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white font-medium transition-all ${sortOrder === 'oldest' ? 'bg-story-orange-400 shadow-lg' : 'hover:bg-white/10'}`}>
                <SortAsc size={16} />
                <span>Más antiguas</span>
              </button>
            </div>
          )}
          
          {sortedStories.length === 0 ? (
            <div className="text-center text-white/80">
              <p>No tienes historias guardadas.</p>
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
                  className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden"
                >
                  <div 
                    className="story-card p-4 cursor-pointer hover:bg-white/5 transition-all"
                    onClick={() => story.hasMultipleChapters 
                      ? toggleExpand(story.id) 
                      : navigate(`/story/${story.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-story-orange-400/20 flex items-center justify-center mr-4 shrink-0">
                        <Book size={20} className="text-story-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-lg truncate">{story.title}</h3>
                        <div className="flex items-center text-white/60 text-sm">
                          <Calendar size={14} className="mr-1 shrink-0" />
                          <span className="mr-3">{formatDate(story.createdAt)}</span>
                          {story.hasMultipleChapters && (
                            <span className="text-purple-300 flex items-center">
                              <Bookmark size={14} className="mr-1" />
                              {story.chaptersCount} capítulos
                            </span>
                          )}
                        </div>
                      </div>
                      {story.hasMultipleChapters && (
                        <div className="ml-2">
                          {expandedStories[story.id] ? (
                            <ChevronDown size={20} className="text-white/60" />
                          ) : (
                            <ChevronRight size={20} className="text-white/60" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Character info */}
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center">
                      <div className="bg-gradient-to-br from-purple-600/40 to-indigo-600/40 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="text-white/80 text-sm flex-1">
                        <span className="font-medium">{story.options.character.name || "Personaje"}</span>
                        {story.options.character.profession && (
                          <span className="ml-2 text-white/60">• {story.options.character.profession}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {story.options.genre && (
                          <div className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80">
                            {story.options.genre}
                          </div>
                        )}
                        <div className="px-2 py-1 text-xs rounded-full bg-story-orange-400/20 text-story-orange-300 flex items-center gap-1">
                          <Clock size={11} />
                          {story.options.duration}
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
                        <div className="bg-white/5 border-t border-white/10">
                          {story.chapters.map((chapter, index) => (
                            <div 
                              key={`${story.id}-chapter-${index}`}
                              className="px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 cursor-pointer"
                              onClick={() => navigate(`/story/${story.id}?chapter=${index}`)}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 shrink-0">
                                  <span className="text-sm text-purple-300">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">
                                    {chapter.title || `Capítulo ${index + 1}`}
                                  </h4>
                                  <span className="text-white/60 text-xs">
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
