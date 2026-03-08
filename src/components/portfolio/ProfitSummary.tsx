import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';

interface ProfitSummaryProps {
  totalValue: number;
  totalInvested: number;
  priceError?: Error | null;
}

export function ProfitSummary({ totalValue, totalInvested, priceError }: ProfitSummaryProps): React.ReactElement {
  const profitLoss = totalValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
  const isProfit = profitLoss >= 0;
  const showPlaceholder = Boolean(priceError);
  const placeholder = '—';

  const formatPrice = (price: number): string => {
    if (price >= 1e9) {
      return `$${(price / 1e9).toFixed(2)}B`;
    }
    if (price >= 1e6) {
      return `$${(price / 1e6).toFixed(2)}M`;
    }
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const stats = [
    {
      label: 'Total Value',
      value: showPlaceholder ? placeholder : formatPrice(totalValue),
      icon: Wallet,
      color: 'text-[#e2e8f0]',
      bgColor: 'bg-indigo-600/20',
      iconColor: 'text-indigo-400',
    },
    {
      label: 'Total Invested',
      value: formatPrice(totalInvested),
      icon: DollarSign,
      color: 'text-[#e2e8f0]',
      bgColor: 'bg-[#0f1117]',
      iconColor: 'text-[#94a3b8]',
    },
    {
      label: 'Total Return',
      value: showPlaceholder ? placeholder : `${isProfit ? '+' : ''}${profitLossPercent.toFixed(2)}%`,
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]',
      bgColor: isProfit ? 'bg-[#22c55e]/10' : 'bg-[#ef4444]/10',
      iconColor: isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]',
    },
    {
      label: 'Profit/Loss',
      value: showPlaceholder ? placeholder : `${isProfit ? '+' : '-'}${formatPrice(Math.abs(profitLoss))}`,
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]',
      bgColor: isProfit ? 'bg-[#22c55e]/10' : 'bg-[#ef4444]/10',
      iconColor: isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={`rounded-lg border border-[#2d3148] ${stat.bgColor} p-4`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1117]">
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">{stat.label}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
