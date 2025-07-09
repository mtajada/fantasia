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
        
        // Parse the CHANGELOG.md file content
        const parsedData = parseChangelog(changelogContent);
        setChangelogData(parsedData);
      } catch (err) {
        console.error('Error parsing changelog:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading changelog');
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