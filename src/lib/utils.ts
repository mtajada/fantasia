import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTextToParagraphs(content: string): string[] {
  return content
    .split('\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);
}

let lastToastId: string | number | null = null;
let lastToastMessage: string | null = null;

export const toastManager = {
  show: (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string, force = false) => {
    if (!force && lastToastMessage === message) {
      return lastToastId;
    }

    if (lastToastId) {
      toast.dismiss(lastToastId);
    }

    let toastId: string | number;
    
    switch (type) {
      case 'success':
        toastId = toast.success(message, description ? { description } : undefined);
        break;
      case 'error':
        toastId = toast.error(message, description ? { description } : undefined);
        break;
      case 'info':
        toastId = toast.info(message, description ? { description } : undefined);
        break;
      case 'warning':
        toastId = toast.warning(message, description ? { description } : undefined);
        break;
      default:
        toastId = toast(message, description ? { description } : undefined);
    }

    lastToastId = toastId;
    lastToastMessage = message;
    
    return toastId;
  },
  
  clear: () => {
    if (lastToastId) {
      toast.dismiss(lastToastId);
      lastToastId = null;
      lastToastMessage = null;
    }
  },
  
  clearAll: () => {
    toast.dismiss();
    lastToastId = null;
    lastToastMessage = null;
  }
};
