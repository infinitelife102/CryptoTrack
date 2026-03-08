import { Link } from 'react-router-dom';
import type { CoinMarket } from '@/types/coin';
import { FavoriteButton } from '@/components/common/FavoriteButton';

interface CoinCardMobileProps {
  coin: CoinMarket;
}

function PriceChangeBadge({ value }: { value: number | null }): React.ReactElement {
  if (value === null) {
    return <span className="text-[#94a3b8]">-</span>;
  }

  const isPositive = value >= 0;
  const colorClass = isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]';

  return (
    <span className={`text-sm font-medium ${colorClass}`}>
      {isPositive ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  );
}

export function CoinCardMobile({ coin }: CoinCardMobileProps): React.ReactElement {
  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (value: number): string => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <Link to={`/coin/${coin.id}`}>
      <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4 transition-colors hover:bg-[#22263a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />
            <div>
              <p className="font-medium text-[#e2e8f0]">{coin.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-[#94a3b8]">{coin.symbol}</span>
                <span className="text-xs text-[#94a3b8]">#{coin.market_cap_rank}</span>
              </div>
            </div>
          </div>
          <FavoriteButton coinId={coin.id} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#94a3b8]">Price</p>
            <p className="text-lg font-semibold text-[#e2e8f0]">
              {formatPrice(coin.current_price)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8]">24h</p>
            <PriceChangeBadge value={coin.price_change_percentage_24h} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#2d3148] pt-3">
          <div>
            <p className="text-xs text-[#94a3b8]">1h</p>
            <PriceChangeBadge value={coin.price_change_percentage_1h_in_currency} />
          </div>
          <div>
            <p className="text-xs text-[#94a3b8]">7d</p>
            <PriceChangeBadge value={coin.price_change_percentage_7d_in_currency} />
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94a3b8]">Mkt Cap</p>
            <p className="text-sm text-[#e2e8f0]">{formatMarketCap(coin.market_cap)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
