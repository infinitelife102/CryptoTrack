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

  const fetchFirstPage = useCallback(async (): Promise<void> => {
    try {
      if (isFirstLoad.current) {
        setIsLoading(true);
      }
      setError(null);
      const data = await getCoinsMarkets(PAGE_SIZE, 1);
      setPreviousCoins((prev) => (prev.length > 0 ? prev : data));
      setCoins((prev) => (prev.length > PAGE_SIZE ? [...data, ...prev.slice(PAGE_SIZE)] : data));
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
      setCoins((prev) => {
        setPreviousCoins(prev);
        return [...prev, ...data];
      });
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
