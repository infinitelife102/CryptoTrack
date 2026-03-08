import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChartPoint, ChartPeriod } from '@/types/coin';
import { getCoinMarketChart } from '@/lib/coinGecko';

interface UsePriceChartReturn {
  data: ChartPoint[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePriceChart(
  coinId: string,
  days: ChartPeriod
): UsePriceChartReturn {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Track the AbortController for the latest in-flight request
  const abortRef = useRef<AbortController | null>(null);

  const fetchChartData = useCallback(async (): Promise<void> => {
    if (!coinId) return;

    // Cancel any previous in-flight chart request before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsLoading(true);
      setError(null);

      const chartData = await getCoinMarketChart(coinId, days, controller.signal);
      setData(chartData);
      setError(null);
    } catch (err) {
      // AbortError means the component unmounted or the period changed — ignore silently
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [coinId, days]);

  useEffect(() => {
    fetchChartData();

    // Abort the in-flight request when the component unmounts or deps change
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchChartData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchChartData,
  };
}
