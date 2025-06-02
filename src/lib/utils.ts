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
    
    // Saltar líneas vacías o que no son relevantes
    if (!trimmedLine || trimmedLine.startsWith('#') && !trimmedLine.startsWith('##')) {
      continue;
    }
    
    // Detectar nueva versión (formato: ## [1.1.3] - 2024-12-19)
    const versionMatch = trimmedLine.match(/^##\s*\[([^\]]+)\]\s*-\s*(.+)$/);
    if (versionMatch) {
      // Guardar entry anterior si existe
      if (currentEntry && currentEntry.version && currentEntry.date) {
        entries.push(currentEntry as ChangelogEntry);
      }
      
      // Crear nueva entry
      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2].trim(),
      };
      currentSection = null;
      continue;
    }
    
    // Detectar secciones (### Mejoras, ### Cambios Técnicos, etc.)
    const sectionMatch = trimmedLine.match(/^###\s*(.+)$/);
    if (sectionMatch && currentEntry) {
      const sectionTitle = sectionMatch[1].toLowerCase();
      
      if (sectionTitle.includes('mejoras') || sectionTitle.includes('improvements')) {
        currentSection = 'improvements';
        currentEntry.improvements = [];
      } else if (sectionTitle.includes('técnicos') || sectionTitle.includes('cambios técnicos') || sectionTitle.includes('technical')) {
        currentSection = 'technical';
        currentEntry.technical = [];
      } else if (sectionTitle.includes('correcciones') || sectionTitle.includes('fix') || sectionTitle.includes('bugs')) {
        currentSection = 'fixes';
        currentEntry.fixes = [];
      } else if (sectionTitle.includes('añadido') || sectionTitle.includes('funcionalidades') || sectionTitle.includes('features') || sectionTitle.includes('nuevo')) {
        currentSection = 'features';
        currentEntry.features = [];
      }
      continue;
    }
    
    // Detectar items de lista (- **item**: descripción o - item)
    const listItemMatch = trimmedLine.match(/^-\s*(.+)$/);
    if (listItemMatch && currentEntry && currentSection) {
      let itemText = listItemMatch[1];
      
      // Limpiar markdown (quitar ** y otros formatos)
      itemText = itemText
        .replace(/\*\*(.*?)\*\*/g, '$1') // bold
        .replace(/`(.*?)`/g, '$1') // code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
        .trim();
      
      // Solo agregar si no está vacío después de limpiar
      if (itemText) {
        const targetArray = currentEntry[currentSection];
        if (Array.isArray(targetArray)) {
          targetArray.push(itemText);
        }
      }
    }
  }
  
  // Agregar la última entry si existe
  if (currentEntry && currentEntry.version && currentEntry.date) {
    entries.push(currentEntry as ChangelogEntry);
  }
  
  return entries;
}
