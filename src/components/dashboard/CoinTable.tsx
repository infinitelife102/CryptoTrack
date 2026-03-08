import { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import type { CoinMarket } from '@/types/coin';
import { CoinRow } from './CoinRow';
import { CoinCardMobile } from './CoinCardMobile';
import { SkeletonRow, SkeletonCard } from '@/components/common/SkeletonRow';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useFavoritesStore } from '@/store/favoritesStore';

interface CoinTableProps {
  coins: CoinMarket[];
  previousCoins: CoinMarket[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  lastUpdated: Date | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

type TabType = 'all' | 'favorites';

export function CoinTable({
  coins,
  previousCoins,
  isLoading,
  error,
  onRetry,
  lastUpdated,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: CoinTableProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { favorites } = useFavoritesStore();

  const filteredCoins = useMemo(() => {
    if (activeTab === 'favorites') {
      return coins.filter((coin) => favorites.includes(coin.id));
    }
    return coins;
  }, [coins, activeTab, favorites]);

  const getPreviousCoin = (coinId: string): CoinMarket | null => {
    return previousCoins.find((c) => c.id === coinId) || null;
  };

  if (error) {
    return <ErrorBanner message={error.message} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1a1d27] text-[#94a3b8] hover:bg-[#22263a] hover:text-[#e2e8f0]'
            }`}
            type="button"
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1a1d27] text-[#94a3b8] hover:bg-[#22263a] hover:text-[#e2e8f0]'
            }`}
            type="button"
          >
            <Star className="h-4 w-4" />
            Favorites
          </button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-[#94a3b8]">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-[#2d3148] md:block">
        <table className="w-full">
          <thead className="bg-[#1a1d27]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">Coin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">1h</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">24h</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">7d</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">Market Cap</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#94a3b8]">Volume</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRow count={10} />
            ) : filteredCoins.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#94a3b8]">
                  {activeTab === 'favorites' ? 'No favorite coins.' : 'No data.'}
                </td>
              </tr>
            ) : (
              filteredCoins.map((coin) => (
                <CoinRow key={coin.id} coin={coin} previousCoin={getPreviousCoin(coin.id)} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <SkeletonCard count={5} />
        ) : filteredCoins.length === 0 ? (
          <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-8 text-center text-[#94a3b8]">
            {activeTab === 'favorites' ? 'No favorite coins.' : 'No data.'}
          </div>
        ) : (
          filteredCoins.map((coin) => <CoinCardMobile key={coin.id} coin={coin} />)
        )}
      </div>

      {activeTab === 'all' && hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="rounded-lg bg-[#1a1d27] px-6 py-2 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#22263a] hover:text-[#e2e8f0] disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
