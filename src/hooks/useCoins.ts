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
  // Track current coins in a ref so callbacks with empty deps can read the latest value
  const coinsRef = useRef<CoinMarket[]>([]);

  const fetchFirstPage = useCallback(async (): Promise<void> => {
    try {
      if (isFirstLoad.current) {
        setIsLoading(true);
      }
      setError(null);
      const data = await getCoinsMarkets(PAGE_SIZE, 1);

      // Save the current coins as "previous" before replacing them
      const current = coinsRef.current;
      setPreviousCoins(current.length > 0 ? current.slice(0, PAGE_SIZE) : data);

      // Keep any extra pages the user has loaded; only refresh page 1
      const merged = current.length > PAGE_SIZE ? [...data, ...current.slice(PAGE_SIZE)] : data;
      setCoins(merged);
      coinsRef.current = merged;

      setPage(1);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  useInterval(fetchFirstPage, 30000);

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
