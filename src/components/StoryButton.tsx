
import { ButtonHTMLAttributes, ReactNode } from "react";

// Botón personalizado para acciones de historia con estilo spicy
interface StoryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  isFullWidth?: boolean;
}

export default function StoryButton({ 
  children, 
  variant = "primary", 
  icon, 
  isFullWidth = false,
  ...props 
}: StoryButtonProps) {
  return (
    <button
      className={`
        ${variant === "primary" ? "story-btn-primary" : "story-btn-secondary"}
        ${isFullWidth ? "w-full" : ""}
        ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${props.className || ""}
      `}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
