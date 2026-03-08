import { useState, useEffect, useCallback, useRef } from 'react';
import type { CoinDetail } from '@/types/coin';
import { getCoinDetail } from '@/lib/coinGecko';
import { useInterval } from './useInterval';

// Stagger the first coin-detail fetch so it doesn't race with usePriceChart
const INITIAL_DELAY_MS = 400;

interface UseCoinDetailReturn {
  coin: CoinDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCoinDetail(coinId: string): UseCoinDetailReturn {
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const hasFetchedOnce = useRef(false);
  // Track the AbortController for the latest in-flight request
  const abortRef = useRef<AbortController | null>(null);

  const fetchCoinDetail = useCallback(async (): Promise<void> => {
    if (!coinId) return;

    // Cancel any previous in-flight request before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isInitialLoad = !hasFetchedOnce.current;

    try {
      if (isInitialLoad) {
        setIsLoading(true);
        setError(null);
      }

      const data = await getCoinDetail(coinId, controller.signal);

      setCoin(data);
      hasFetchedOnce.current = true;
      setError(null);
    } catch (err) {
      // AbortError means the component unmounted or coinId changed — ignore silently
      if (err instanceof Error && err.name === 'AbortError') return;
      if (isInitialLoad) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
      // Background refresh failures are silently ignored
    } finally {
      setIsLoading(false);
    }
  }, [coinId]);

  useEffect(() => {
    hasFetchedOnce.current = false;

    // Stagger the initial fetch to reduce concurrent requests on page load
    const timer = setTimeout(() => {
      fetchCoinDetail();
    }, INITIAL_DELAY_MS);

    return () => {
      clearTimeout(timer);
      // Abort any in-flight request when navigating away
      abortRef.current?.abort();
    };
  }, [fetchCoinDetail]);

  // 60s background refresh
  useInterval(fetchCoinDetail, 60000);

  return {
    coin,
    isLoading,
    error,
    refetch: fetchCoinDetail,
  };
}
