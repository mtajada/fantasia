import { motion } from "framer-motion";
import { StoryChapter as StoryChapterType } from "../types";

interface StoryChapterProps {
  chapter: StoryChapterType;
  isLatest?: boolean;
}

export default function StoryChapter({ chapter, isLatest = false }: StoryChapterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${isLatest ? 'bg-white/20' : 'bg-white/15'} backdrop-blur-md rounded-3xl p-6 mb-8 text-white leading-relaxed shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-story-orange-400 text-white text-xs font-bold rounded-full px-3 py-1 mr-3">
            Capítulo {chapter.chapterNumber}
          </div>
          <h3 className="text-xl font-bold">{chapter.title}</h3>
        </div>
        <div className="text-xs text-white/60">
          {new Date(chapter.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        {chapter.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </motion.div>
  );
}
