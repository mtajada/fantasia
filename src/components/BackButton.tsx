import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function BackButton({ onClick, className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      className={`absolute top-6 left-6 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-[#BB79D1]/60 text-[#BB79D1] hover:bg-[#BB79D1]/10 hover:text-[#7DC4E0] focus:ring-4 focus:ring-[#BB79D1]/30 transition-all duration-300 z-20 ${className}`}
      aria-label="Go back"
    >
      <ChevronLeft size={28} />
    </button>
  );
}
