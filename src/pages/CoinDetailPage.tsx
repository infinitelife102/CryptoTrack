import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, RotateCcw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PriceChart } from '@/components/detail/PriceChart';
import { CoinStats } from '@/components/detail/CoinStats';
import { PriceChangeBadge } from '@/components/detail/PriceChangeBadge';
import { AlertBadge } from '@/components/common/AlertBadge';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { SkeletonCard } from '@/components/common/SkeletonRow';
import { useCoinDetail } from '@/hooks/useCoinDetail';
import { usePriceChart } from '@/hooks/usePriceChart';
import { useAlertStore } from '@/store/alertStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import type { ChartPeriod } from '@/types/coin';

function AlertListSection({
  coinId,
  currentPrice,
}: {
  coinId: string;
  currentPrice: number;
}): React.ReactElement | null {
  const alerts = useAlertStore((state) => state.alerts);
  const removeAlert = useAlertStore((state) => state.removeAlert);
  const resetTriggered = useAlertStore((state) => state.resetTriggered);

  const coinAlerts = alerts.filter((a) => a.coinId === coinId);

  if (coinAlerts.length === 0) return null;

  const formatPrice = (p: number): string =>
    p >= 1
      ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${p.toFixed(6)}`;

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">Your Alerts</h2>
      <div className="space-y-2">
        {coinAlerts.map((alert) => (
          <div
            key={`${alert.coinId}-${alert.targetPrice}-${alert.direction}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2d3148] bg-[#1a1d27] px-4 py-3"
          >
            <div className="text-sm text-[#e2e8f0]">
              <span className="text-[#94a3b8]">When price goes </span>
              <span className="font-medium">
                {alert.direction === 'above' ? 'above' : 'below'}
              </span>
              <span className="ml-1 font-medium">{formatPrice(alert.targetPrice)}</span>
              {alert.triggered && (
                <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                  Triggered
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {alert.triggered && (
                <button
                  type="button"
                  onClick={() => resetTriggered(coinId, alert.targetPrice)}
                  className="flex items-center gap-1 rounded-lg border border-[#2d3148] bg-[#0f1117] px-3 py-1.5 text-xs font-medium text-[#94a3b8] transition-colors hover:bg-[#22263a] hover:text-[#e2e8f0]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAlert(coinId, alert.targetPrice)}
                className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#94a3b8]">Current price: {formatPrice(currentPrice)}</p>
    </div>
  );
}

interface AlertModalProps {
  coinId: string;
  coinName: string;
  currentPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

function AlertModal({
  coinId,
  coinName,
  currentPrice,
  isOpen,
  onClose,
}: AlertModalProps): React.ReactElement | null {
  const [targetPrice, setTargetPrice] = useState<string>(
    isFinite(currentPrice) ? currentPrice.toFixed(2) : '0.00'
  );
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const addAlert = useAlertStore((state) => state.addAlert);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    addAlert({
      coinId,
      coinName,
      targetPrice: price,
      direction,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#2d3148] bg-[#1a1d27] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[#e2e8f0]">Price Alert</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#94a3b8]">Target Price (USD)</label>
            <input
              type="number"
              step="any"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full rounded-lg border border-[#2d3148] bg-[#0f1117] px-3 py-2 text-sm text-[#e2e8f0] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#94a3b8]">Condition</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDirection('above')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  direction === 'above'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#0f1117] text-[#94a3b8] hover:bg-[#22263a]'
                }`}
              >
                When price goes above
              </button>
              <button
                type="button"
                onClick={() => setDirection('below')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  direction === 'below'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#0f1117] text-[#94a3b8] hover:bg-[#22263a]'
                }`}
              >
                When price goes below
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Add Alert
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#2d3148] bg-[#0f1117] px-4 py-2 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#22263a] hover:text-[#e2e8f0]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CoinDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const coinId = id ?? '';
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>(7);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  const {
    coin,
    isLoading: isCoinLoading,
    error: coinError,
    refetch: refetchCoin,
  } = useCoinDetail(coinId);

  const {
    data: chartData,
    isLoading: isChartLoading,
    error: chartError,
    refetch: refetchChart,
  } = usePriceChart(coinId, chartPeriod);

  const isFavorite = useFavoritesStore((state) => state.isFavorite(coinId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const formatPrice = (price: number): string => {
    if (!isFinite(price)) return '—';
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  if (coinError) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBanner message={coinError.message} onRetry={refetchCoin} />
        </main>
      </div>
    );
  }

  if (isCoinLoading || !coin) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SkeletonCard count={3} />
        </main>
      </div>
    );
  }

  const currentPrice = coin.market_data.current_price.usd ?? 0;
  const priceChange24h = coin.market_data.price_change_percentage_24h ?? 0;

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#e2e8f0]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {coin.image?.large && (
              <img src={coin.image.large} alt={coin.name} className="h-16 w-16 rounded-full" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#e2e8f0]">
                {coin.name}
                <span className="ml-2 text-lg font-normal uppercase text-[#94a3b8]">
                  {coin.symbol}
                </span>
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-semibold text-[#e2e8f0]">
                  {formatPrice(currentPrice)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    priceChange24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}
                >
                  {priceChange24h >= 0 ? '+' : ''}
                  {priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggleFavorite(coinId)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isFavorite
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-[#1a1d27] text-[#94a3b8] hover:bg-[#22263a] hover:text-[#e2e8f0]'
              }`}
              type="button"
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#1a1d27] px-4 py-2 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#22263a] hover:text-[#e2e8f0]"
              type="button"
            >
              <AlertBadge coinId={coinId} size="sm" />
              Set Alert
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <PriceChangeBadge
            label="1h"
            value={coin.market_data.price_change_percentage_1h_in_currency?.usd ?? null}
          />
          <PriceChangeBadge
            label="24h"
            value={coin.market_data.price_change_percentage_24h ?? null}
          />
          <PriceChangeBadge
            label="7d"
            value={coin.market_data.price_change_percentage_7d ?? null}
          />
          <PriceChangeBadge
            label="30d"
            value={coin.market_data.price_change_percentage_30d ?? null}
          />
        </div>

        <div className="mb-6">
          <PriceChart
            data={chartData}
            isLoading={isChartLoading}
            error={chartError}
            onPeriodChange={setChartPeriod}
            currentPeriod={chartPeriod}
            onRetry={refetchChart}
          />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-[#e2e8f0]">Market Stats</h2>
          <CoinStats coin={coin} />
        </div>

        <AlertListSection coinId={coinId} currentPrice={currentPrice} />
      </main>

      <AlertModal
        coinId={coinId}
        coinName={coin.name}
        currentPrice={currentPrice}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
}
