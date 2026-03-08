import { useState, useEffect, useCallback, useRef } from 'react';
import type { CoinMarket } from '@/types/coin';
import { getCoinsMarkets } from '@/lib/coinGecko';
import { useInterval } from './useInterval';

const PAGE_SIZE = 50;
const MAX_PAGES = 3;

interface UseCoinsReturn {
  coins: CoinMarket[];
  previousCoins: CoinMarket[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function useCoins(): UseCoinsReturn {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [previousCoins, setPreviousCoins] = useState<CoinMarket[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isFirstLoad = useRef(true);
  // Track current coins so callbacks with empty deps can read the latest value
  const coinsRef = useRef<CoinMarket[]>([]);
  // Track the AbortController for the latest in-flight request
  const abortRef = useRef<AbortController | null>(null);

  const fetchFirstPage = useCallback(async (): Promise<void> => {
    const hasData = coinsRef.current.length > 0;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (isFirstLoad.current) {
        setIsLoading(true);
      }
      if (!hasData) {
        setError(null);
      }

      const data = await getCoinsMarkets(PAGE_SIZE, 1, controller.signal);

      const current = coinsRef.current;
      setPreviousCoins(current.length > 0 ? current.slice(0, PAGE_SIZE) : data);

      const merged =
        current.length > PAGE_SIZE ? [...data, ...current.slice(PAGE_SIZE)] : data;
      setCoins(merged);
      coinsRef.current = merged;

      setError(null);
      setPage(1);
      setLastUpdated(new Date());
    } catch (err) {
      // AbortError means the component unmounted — ignore silently
      if (err instanceof Error && err.name === 'AbortError') return;
      if (!hasData) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
      // Background refresh failures are silently ignored
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchFirstPage();

    return () => {
      // Abort the in-flight request when navigating away from the home page
      abortRef.current?.abort();
    };
  }, [fetchFirstPage]);

  // 60s background refresh
  useInterval(fetchFirstPage, 60000);

  const loadMore = useCallback(async (): Promise<void> => {
    if (page >= MAX_PAGES) return;
    try {
      setIsLoadingMore(true);
      setError(null);
      const nextPage = page + 1;
      const data = await getCoinsMarkets(PAGE_SIZE, nextPage);

      const current = coinsRef.current;
      setPreviousCoins(current);
      const merged = [...current, ...data];
      setCoins(merged);
      coinsRef.current = merged;

      setPage(nextPage);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [page]);

  const hasMore = page < MAX_PAGES;

  return {
    coins,
    previousCoins,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchFirstPage,
    loadMore,
    hasMore,
    isLoadingMore,
  };
}
