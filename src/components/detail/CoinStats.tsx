import { BarChart3, Activity, Coins, TrendingUp, TrendingDown } from 'lucide-react';
import type { CoinDetail } from '@/types/coin';

interface CoinStatsProps {
  coin: CoinDetail;
}

export function CoinStats({ coin }: CoinStatsProps): React.ReactElement {
  const { market_data } = coin;

  const formatCurrency = (value: number): string => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value: number): string => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    return value.toLocaleString();
  };

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const stats = [
    {
      label: 'Market Cap',
      value: formatCurrency(market_data.market_cap.usd),
      icon: BarChart3,
    },
    {
      label: '24h Volume',
      value: formatCurrency(market_data.total_volume.usd),
      icon: Activity,
    },
    {
      label: 'Circulating Supply',
      value: formatNumber(market_data.circulating_supply),
      icon: Coins,
    },
    {
      label: 'All-Time High (ATH)',
      value: formatPrice(market_data.ath.usd),
      icon: TrendingUp,
    },
    {
      label: 'All-Time Low (ATL)',
      value: formatPrice(market_data.atl.usd),
      icon: TrendingDown,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">{stat.label}</p>
                <p className="text-lg font-semibold text-[#e2e8f0]">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
