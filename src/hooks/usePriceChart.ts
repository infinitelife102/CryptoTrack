import { useState, useEffect, useCallback } from 'react';
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

  const fetchChartData = useCallback(async (): Promise<void> => {
    if (!coinId) return;

    try {
      setIsLoading(true);
      setError(null);

      const chartData = await getCoinMarketChart(coinId, days);
      setData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [coinId, days]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchChartData,
  };
}
