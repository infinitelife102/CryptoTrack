import { useState, useEffect } from 'react';
import type { GlobalData } from '@/types/coin';
import { getGlobalData } from '@/lib/coinGecko';
import { useInterval } from './useInterval';

interface UseGlobalDataReturn {
  data: GlobalData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGlobalData(): UseGlobalDataReturn {
  const [data, setData] = useState<GlobalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setError(null);
      const globalData = await getGlobalData();
      setData(globalData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useInterval(fetchData, 30000);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
