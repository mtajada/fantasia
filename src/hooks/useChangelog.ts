import { useState, useEffect } from 'react';
import { parseChangelog, type ChangelogEntry } from '@/lib/utils';
import changelogContent from '../../CHANGELOG.md?raw';

interface UseChangelogReturn {
  changelogData: ChangelogEntry[];
  isLoading: boolean;
  error: string | null;
}

export function useChangelog(): UseChangelogReturn {
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChangelog = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Parsear el contenido del archivo CHANGELOG.md
        const parsedData = parseChangelog(changelogContent);
        setChangelogData(parsedData);
      } catch (err) {
        console.error('Error parsing changelog:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el changelog');
        setChangelogData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChangelog();
  }, []);

  return {
    changelogData,
    isLoading,
    error
  };
} 