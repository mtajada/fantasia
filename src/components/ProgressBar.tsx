import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-white/70 mb-2">
        <span>Paso {current} de {total}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
        />
      </div>
    </div>
  );
} 