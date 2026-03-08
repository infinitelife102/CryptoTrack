import { Bitcoin, BarChart3, Activity } from 'lucide-react';
import { useGlobalData } from '@/hooks/useGlobalData';
import { ErrorBanner } from '@/components/common/ErrorBanner';

export function GlobalStats(): React.ReactElement {
  const { data, isLoading, error, refetch } = useGlobalData();

  const formatCurrency = (value: number): string => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    return `$${value.toLocaleString()}`;
  };

  const stats = [
    {
      label: 'Total Market Cap',
      value: data ? formatCurrency(data.data.total_market_cap.usd) : '-',
      icon: BarChart3,
    },
    {
      label: '24h Volume',
      value: data ? formatCurrency(data.data.total_volume.usd) : '-',
      icon: Activity,
    },
    {
      label: 'BTC Dominance',
      value: data ? `${data.data.market_cap_percentage.btc.toFixed(1)}%` : '-',
      icon: Bitcoin,
    },
  ];

  if (error && refetch) {
    return (
      <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4">
        <ErrorBanner message={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-lg bg-[#0f1117] p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">{stat.label}</p>
                <p className="text-lg font-semibold text-[#e2e8f0]">
                  {isLoading ? (
                    <span className="inline-block h-5 w-16 animate-pulse rounded bg-[#2d3148]" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
