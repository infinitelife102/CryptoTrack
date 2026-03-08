import { useState, useEffect, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ProfitSummary } from '@/components/portfolio/ProfitSummary';
import { HoldingRow } from '@/components/portfolio/HoldingRow';
import { HoldingForm } from '@/components/portfolio/HoldingForm';
import { SearchBar } from '@/components/common/SearchBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { SkeletonCard } from '@/components/common/SkeletonRow';
import { usePortfolioStore } from '@/store/portfolioStore';
import type { Holding } from '@/types/coin';
import { searchCoins, getCoinsPrices } from '@/lib/coinGecko';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResultItem {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}

export function PortfolioPage(): React.ReactElement {
  const { holdings, addHolding, updateHolding, removeHolding } = usePortfolioStore();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(false);
  const [priceError, setPriceError] = useState<Error | null>(null);

  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<SearchResultItem | null>(null);
  const [selectedCoinPrice, setSelectedCoinPrice] = useState<number>(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchPrices = async (): Promise<void> => {
      if (holdings.length === 0) return;

      setIsLoadingPrices(true);
      setPriceError(null);

      try {
        const coinIds = holdings.map((h) => h.coinId);
        const pricesData = await getCoinsPrices(coinIds);

        const priceMap: Record<string, number> = {};
        Object.entries(pricesData).forEach(([id, data]) => {
          priceMap[id] = data.usd;
        });

        setPrices(priceMap);
      } catch (err) {
        setPriceError(err instanceof Error ? err : new Error('Failed to fetch prices'));
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();

    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [holdings]);

  useEffect(() => {
    const performSearch = async (): Promise<void> => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await searchCoins(debouncedSearchQuery);
        setSearchResults(results.coins.slice(0, 5));
      } catch {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const fetchSelectedCoinPrice = async (): Promise<void> => {
      if (!selectedCoin) return;

      try {
        const pricesData = await getCoinsPrices([selectedCoin.id]);
        setSelectedCoinPrice(pricesData[selectedCoin.id]?.usd || 0);
      } catch {
        setSelectedCoinPrice(0);
      }
    };

    fetchSelectedCoinPrice();
  }, [selectedCoin]);

  const { totalValue, totalInvested } = useMemo(() => {
    let value = 0;
    let invested = 0;

    holdings.forEach((holding) => {
      const currentPrice = prices[holding.coinId] || 0;
      value += holding.quantity * currentPrice;
      invested += holding.quantity * holding.avgBuyPrice;
    });

    return { totalValue: value, totalInvested: invested };
  }, [holdings, prices]);

  const handleSelectCoin = (coin: SearchResultItem): void => {
    setSelectedCoin(coin);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSaveHolding = (holding: Holding): void => {
    addHolding(holding);
    setIsAddingNew(false);
    setSelectedCoin(null);
  };

  const handleCancelAdd = (): void => {
    setIsAddingNew(false);
    setSelectedCoin(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#e2e8f0]">My Portfolio</h1>
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add Coin
            </button>
          )}
        </div>

        <section className="mb-6">
          <ProfitSummary totalValue={totalValue} totalInvested={totalInvested} priceError={priceError} />
        </section>

        {isAddingNew && (
          <div className="mb-6 rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-[#e2e8f0]">Add New Coin</h3>
              <button
                onClick={handleCancelAdd}
                className="rounded-lg p-1 text-[#94a3b8] hover:bg-[#22263a] hover:text-[#e2e8f0]"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!selectedCoin ? (
              <div className="space-y-4">
                <SearchBar onSearch={setSearchQuery} placeholder="Search coins..." />

                {debouncedSearchQuery.trim() && searchResults.length === 0 && (
                  <p className="rounded-lg border border-[#2d3148] bg-[#0f1117] px-4 py-3 text-sm text-[#94a3b8]">
                    No coins found. Try a different search term.
                  </p>
                )}
                {searchResults.length > 0 && (
                  <div className="rounded-lg border border-[#2d3148] bg-[#0f1117]">
                    {searchResults.map((coin) => (
                      <button
                        key={coin.id}
                        onClick={() => handleSelectCoin(coin)}
                        className="flex w-full items-center gap-3 border-b border-[#2d3148] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#22263a]"
                        type="button"
                      >
                        <img src={coin.thumb} alt={coin.name} className="h-8 w-8 rounded-full" />
                        <div>
                          <p className="font-medium text-[#e2e8f0]">{coin.name}</p>
                          <p className="text-xs uppercase text-[#94a3b8]">{coin.symbol}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <HoldingForm
                coinId={selectedCoin.id}
                coinName={selectedCoin.name}
                coinSymbol={selectedCoin.symbol}
                coinImage={selectedCoin.thumb}
                currentPrice={selectedCoinPrice}
                onSave={handleSaveHolding}
                onCancel={handleCancelAdd}
              />
            )}
          </div>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">
            Holdings ({holdings.length})
          </h2>

          {priceError && (
            <div className="mb-4">
              <ErrorBanner
                message="An error occurred while loading price data."
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {holdings.length === 0 ? (
            <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-8 text-center">
              <p className="text-[#94a3b8]">You have no holdings yet.</p>
              <p className="mt-1 text-sm text-[#94a3b8]">
                Click &quot;Add Coin&quot; to build your portfolio.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoadingPrices ? (
                <SkeletonCard count={3} />
              ) : (
                holdings.map((holding) => (
                  <HoldingRow
                    key={holding.coinId}
                    holding={holding}
                    currentPrice={prices[holding.coinId] || 0}
                    onUpdate={updateHolding}
                    onDelete={removeHolding}
                  />
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
