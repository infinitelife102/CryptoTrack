import { useState, useEffect, useRef } from 'react';
import type { GlobalData } from '@/types/coin';
import { getGlobalData } from '@/lib/coinGecko';
import { useInterval } from './useInterval';

// Stagger the initial global-stats fetch to reduce concurrent requests on page load
const INITIAL_DELAY_MS = 800;

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

  const hasDataRef = useRef(false);
  // Track the AbortController for the latest in-flight request
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = async (): Promise<void> => {
    const isInitialLoad = !hasDataRef.current;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (isInitialLoad) {
        setError(null);
      }
      const globalData = await getGlobalData(controller.signal);
      setData(globalData);
      setError(null);
      hasDataRef.current = true;
    } catch (err) {
      // AbortError means the component unmounted — ignore silently
      if (err instanceof Error && err.name === 'AbortError') return;
      if (isInitialLoad) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
      // Background refresh failures are silently ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Stagger the initial fetch to avoid colliding with useCoins on the same page
    const timer = setTimeout(() => {
      fetchData();
    }, INITIAL_DELAY_MS);

    return () => {
      clearTimeout(timer);
      // Abort any in-flight request when the component unmounts
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 60s background refresh
  useInterval(fetchData, 60000);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
