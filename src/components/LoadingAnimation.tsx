
import { motion } from "framer-motion";

interface LoadingAnimationProps {
  message?: string;
}

export default function LoadingAnimation({ message = "Loading..." }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <motion.div
        className="w-24 h-24 rounded-full bg-story-orange-400 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-story-purple-500 flex items-center justify-center"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        >
          <motion.div
            className="w-8 h-8 rounded-full bg-story-blue-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </motion.div>
      </motion.div>
      
      <motion.p
        className="text-xl font-medium text-white"
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {message}
      </motion.p>
    </div>
  );
}
