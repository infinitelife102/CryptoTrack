import { useState, useEffect, useCallback, useRef } from 'react';
import type { CoinDetail } from '@/types/coin';
import { getCoinDetail } from '@/lib/coinGecko';
import { useInterval } from './useInterval';

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

  const fetchCoinDetail = useCallback(async (): Promise<void> => {
    if (!coinId) return;

    try {
      if (!hasFetchedOnce.current) setIsLoading(true);
      setError(null);

      const data = await getCoinDetail(coinId);
      setCoin(data);
      hasFetchedOnce.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [coinId]);

  useEffect(() => {
    hasFetchedOnce.current = false;
    fetchCoinDetail();
  }, [fetchCoinDetail]);

  useInterval(fetchCoinDetail, 30000);

  return {
    coin,
    isLoading,
    error,
    refetch: fetchCoinDetail,
  };
}
