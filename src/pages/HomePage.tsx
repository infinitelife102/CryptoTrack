import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { GlobalStats } from '@/components/layout/GlobalStats';
import { CoinTable } from '@/components/dashboard/CoinTable';
import { useCoins } from '@/hooks/useCoins';
import { usePriceAlert } from '@/hooks/usePriceAlert';

export function HomePage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { coins, previousCoins, isLoading, error, lastUpdated, refetch, loadMore, hasMore, isLoadingMore } = useCoins();

  usePriceAlert({ coins });

  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return coins;

    const query = searchQuery.toLowerCase();
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)
    );
  }, [coins, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Header onSearch={setSearchQuery} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6">
          <GlobalStats />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#e2e8f0]">
              Cryptocurrency Prices
              {searchQuery && (
                <span className="ml-2 text-sm font-normal text-[#94a3b8]">
                  &quot;{searchQuery}&quot; search results
                </span>
              )}
            </h1>
          </div>

          <CoinTable
            coins={filteredCoins}
            previousCoins={previousCoins}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            lastUpdated={lastUpdated}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        </section>
      </main>

      <footer className="border-t border-[#2d3148] bg-[#0f1117] py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[#94a3b8] sm:px-6 lg:px-8">
          <p>Data provided by CoinGecko API</p>
          <p className="mt-1">Auto-refreshes every 30 seconds</p>
        </div>
      </footer>
    </div>
  );
}
