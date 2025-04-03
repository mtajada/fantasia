
import { ReactNode } from "react";

interface StoryOptionCardProps {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  selected?: boolean;
  className?: string;
}

export default function StoryOptionCard({ 
  icon, 
  label, 
  onClick, 
  selected = false,
  className = ""
}: StoryOptionCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        story-choice-card
        ${selected ? 'ring-4 ring-story-orange-400 bg-white/20 shadow-lg transform scale-105' : 'hover:scale-105 hover:shadow-md transition-all duration-300'}
        ${className}
      `}
    >
      {icon && (
        <div className="text-white text-3xl mb-3">
          {icon}
        </div>
      )}
      <span className="text-white text-center font-medium text-shadow">{label}</span>
    </div>
  );
}
