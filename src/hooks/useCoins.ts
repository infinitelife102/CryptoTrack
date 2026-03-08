import { useState, useEffect, useCallback, useRef } from 'react';
import type { CoinMarket } from '@/types/coin';
import { getCoinsMarkets } from '@/lib/coinGecko';
import { useInterval } from './useInterval';

const PAGE_SIZE = 50;
const MAX_PAGES = 3;

/**
 * Module-level cache persists across component unmount/remount.
 * When the user navigates Home → Detail → Home, the coin list is
 * immediately visible from cache while a fresh fetch happens in the background.
 */
let cachedCoins: CoinMarket[] = [];
let cachedPreviousCoins: CoinMarket[] = [];
let cachedPage: number = 1;

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
  // Initialise from cache so data is visible immediately on navigation back
  const [coins, setCoins] = useState<CoinMarket[]>(cachedCoins);
  const [previousCoins, setPreviousCoins] = useState<CoinMarket[]>(cachedPreviousCoins);
  const [page, setPage] = useState<number>(cachedPage);
  // Only show the skeleton on the very first load (cache is empty)
  const [isLoading, setIsLoading] = useState<boolean>(cachedCoins.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Keep a ref that always reflects the latest coins array so callbacks
  // with empty deps can read up-to-date state without stale closures.
  const coinsRef = useRef<CoinMarket[]>(cachedCoins);
  const abortRef = useRef<AbortController | null>(null);

  const fetchFirstPage = useCallback(async (): Promise<void> => {
    const hasData = coinsRef.current.length > 0;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!hasData) {
        setIsLoading(true);
        setError(null);
      }

      const data = await getCoinsMarkets(PAGE_SIZE, 1, controller.signal);

      const current = coinsRef.current;
      const newPrev = current.length > 0 ? current.slice(0, PAGE_SIZE) : data;
      const merged = current.length > PAGE_SIZE ? [...data, ...current.slice(PAGE_SIZE)] : data;

      setPreviousCoins(newPrev);
      setCoins(merged);
      coinsRef.current = merged;

      // Update module-level cache
      cachedCoins = merged;
      cachedPreviousCoins = newPrev;
      cachedPage = 1;

      setError(null);
      setPage(1);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was intentionally cancelled (unmount or new fetch started).
        // Do NOT call setIsLoading(false) here when there is no data yet —
        // the next fetch triggered by the re-mount will handle loading state.
        if (hasData) setIsLoading(false);
        return;
      }
      if (!hasData) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
      // Background refresh failures are silently ignored when data already exists
    } finally {
      // Guard: only clear loading when the abort path did not already return early
      if (!controller.signal.aborted || hasData) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchFirstPage();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchFirstPage]);

  // 60 s background refresh
  useInterval(fetchFirstPage, 60000);

  const loadMore = useCallback(async (): Promise<void> => {
    if (page >= MAX_PAGES) return;
    try {
      setIsLoadingMore(true);
      setError(null);
      const nextPage = page + 1;
      const data = await getCoinsMarkets(PAGE_SIZE, nextPage);

      const current = coinsRef.current;
      const merged = [...current, ...data];
      setPreviousCoins(current);
      setCoins(merged);
      coinsRef.current = merged;

      // Update cache for extra pages too
      cachedCoins = merged;
      cachedPreviousCoins = current;
      cachedPage = nextPage;

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
