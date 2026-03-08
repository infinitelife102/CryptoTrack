import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import type { ChartPoint, ChartPeriod } from '@/types/coin';

const CHART_PERIODS: ChartPeriod[] = [1, 7, 30, 365];

const periodLabels: Record<ChartPeriod, string> = {
  1: '1D',
  7: '7D',
  30: '30D',
  365: '1Y',
};

interface PriceChartProps {
  data: ChartPoint[];
  isLoading: boolean;
  error?: Error | null;
  onPeriodChange: (period: ChartPeriod) => void;
  currentPeriod: ChartPeriod;
  onRetry?: () => void;
}

export function PriceChart({
  data,
  isLoading,
  error,
  onPeriodChange,
  currentPeriod,
  onRetry,
}: PriceChartProps): React.ReactElement {
  const isPositive = data.length > 1 && data[data.length - 1].price >= data[0].price;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    if (currentPeriod === 1) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (currentPeriod === 7) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
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

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartPoint }>;
  }): React.ReactElement | null => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-3 shadow-lg">
          <p className="text-xs text-[#94a3b8]">
            {new Date(point.timestamp).toLocaleString('en-US')}
          </p>
          <p className="text-lg font-semibold text-[#e2e8f0]">{formatPrice(point.price)}</p>
        </div>
      );
    }
    return null;
  };

  if (error && onRetry) {
    return (
      <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-6">
        <div className="mb-4 flex gap-2">
          {CHART_PERIODS.map((period) => (
            <button
              key={period}
              disabled
              className="rounded-lg bg-[#2d3148] px-4 py-2 text-sm font-medium text-[#94a3b8]"
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
        <ErrorBanner message={error.message} onRetry={onRetry} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-6">
        <div className="mb-4 flex gap-2">
          {CHART_PERIODS.map((period) => (
            <button
              key={period}
              disabled
              className="rounded-lg bg-[#2d3148] px-4 py-2 text-sm font-medium text-[#94a3b8]"
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
        <div className="h-[400px] animate-pulse rounded-lg bg-[#2d3148]" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-6">
      <div className="mb-4 flex gap-2">
        {CHART_PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => onPeriodChange(period)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentPeriod === period
                ? 'bg-indigo-600 text-white'
                : 'bg-[#0f1117] text-[#94a3b8] hover:bg-[#22263a] hover:text-[#e2e8f0]'
            }`}
            type="button"
          >
            {periodLabels[period]}
          </button>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value: number) => {
                if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
                if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
                if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
                return `$${value}`;
              }}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickMargin={10}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{ r: 6, fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
