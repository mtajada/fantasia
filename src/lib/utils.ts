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

// Interfaces para el changelog
export interface ChangelogEntry {
  version: string;
  date: string;
  features?: string[];
  improvements?: string[];
  technical?: string[];
  fixes?: string[];
}

// Parser del changelog markdown
export function parseChangelog(markdownContent: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = markdownContent.split('\n');
  
  let currentEntry: Partial<ChangelogEntry> | null = null;
  let currentSection: 'features' | 'improvements' | 'technical' | 'fixes' | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines or irrelevant ones
    if (!trimmedLine || trimmedLine.startsWith('#') && !trimmedLine.startsWith('##')) {
      continue;
    }
    
    // Detect new version (format: ## [1.1.3] - 2024-12-19)
    const versionMatch = trimmedLine.match(/^##\s*\[([^\]]+)\]\s*-\s*(.+)$/);
    if (versionMatch) {
      // Save previous entry if it exists
      if (currentEntry && currentEntry.version && currentEntry.date) {
        entries.push(currentEntry as ChangelogEntry);
      }
      
      // Create new entry
      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2].trim(),
      };
      currentSection = null;
      continue;
    }
    
    // Detect sections (### Improvements, ### Technical Changes, etc.)
    const sectionMatch = trimmedLine.match(/^###\s*(.+)$/);
    if (sectionMatch && currentEntry) {
      const sectionTitle = sectionMatch[1].toLowerCase();
      
      if (sectionTitle.includes('improvements') || sectionTitle.includes('mejoras')) {
        currentSection = 'improvements';
        currentEntry.improvements = [];
      } else if (sectionTitle.includes('technical') || sectionTitle.includes('técnicos') || sectionTitle.includes('cambios técnicos')) {
        currentSection = 'technical';
        currentEntry.technical = [];
      } else if (sectionTitle.includes('fix') || sectionTitle.includes('bugs') || sectionTitle.includes('correcciones')) {
        currentSection = 'fixes';
        currentEntry.fixes = [];
      } else if (sectionTitle.includes('added') || sectionTitle.includes('features') || sectionTitle.includes('añadido') || sectionTitle.includes('funcionalidades') || sectionTitle.includes('nuevo')) {
        currentSection = 'features';
        currentEntry.features = [];
      }
      continue;
    }
    
    // Detect list items (- **item**: description or - item)
    const listItemMatch = trimmedLine.match(/^-\s*(.+)$/);
    if (listItemMatch && currentEntry && currentSection) {
      let itemText = listItemMatch[1];
      
      // Clean markdown (remove ** and other formats)
      itemText = itemText
        .replace(/\*\*(.*?)\*\*/g, '$1') // bold
        .replace(/`(.*?)`/g, '$1') // code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
        .trim();
      
      // Only add if not empty after cleaning
      if (itemText) {
        const targetArray = currentEntry[currentSection];
        if (Array.isArray(targetArray)) {
          targetArray.push(itemText);
        }
      }
    }
  }
  
  // Add the last entry if it exists
  if (currentEntry && currentEntry.version && currentEntry.date) {
    entries.push(currentEntry as ChangelogEntry);
  }
  
  return entries;
}

// Navigation utility functions for user conversion flow
export const navigationUtils = {
  /**
   * Redirects users to upgrade to premium subscription
   * Used when story generation limits are reached
   */
  redirectToUpgradePremium: () => {
    // Use replace: true to prevent back-button loops
    window.location.href = '/plans';
  },

  /**
   * Redirects users to buy more voice credits
   * Used when voice credit limits are reached  
   */
  redirectToBuyCredits: () => {
    // Add focus parameter to highlight credits section
    window.location.href = '/plans?focus=credits';
  }
};
