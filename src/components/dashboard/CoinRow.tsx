import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CoinMarket } from '@/types/coin';
import { FavoriteButton } from '@/components/common/FavoriteButton';

interface CoinRowProps {
  coin: CoinMarket;
  previousCoin?: CoinMarket | null;
}

function PriceChange({
  value,
  flash,
}: {
  value: number | null;
  flash?: 'up' | 'down' | null;
}): React.ReactElement {
  if (value === null) {
    return <span className="text-[#94a3b8]">-</span>;
  }

  const isPositive = value >= 0;
  const baseColor = isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]';
  const flashClass =
    flash === 'up' ? 'animate-flash-up' : flash === 'down' ? 'animate-flash-down' : '';

  return (
    <span className={`${baseColor} ${flashClass} transition-colors duration-500`}>
      {isPositive ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  );
}

export function CoinRow({ coin, previousCoin }: CoinRowProps): React.ReactElement {
  const [flashStates, setFlashStates] = useState<{
    price: 'up' | 'down' | null;
    h1: 'up' | 'down' | null;
    h24: 'up' | 'down' | null;
    d7: 'up' | 'down' | null;
  }>({
    price: null,
    h1: null,
    h24: null,
    d7: null,
  });

  useEffect(() => {
    if (!previousCoin) return;

    const newFlashes: typeof flashStates = {
      price: null,
      h1: null,
      h24: null,
      d7: null,
    };

    if (coin.current_price > previousCoin.current_price) {
      newFlashes.price = 'up';
    } else if (coin.current_price < previousCoin.current_price) {
      newFlashes.price = 'down';
    }

    if (
      coin.price_change_percentage_1h_in_currency !== null &&
      previousCoin.price_change_percentage_1h_in_currency !== null
    ) {
      if (
        coin.price_change_percentage_1h_in_currency >
        previousCoin.price_change_percentage_1h_in_currency
      ) {
        newFlashes.h1 = 'up';
      } else if (
        coin.price_change_percentage_1h_in_currency <
        previousCoin.price_change_percentage_1h_in_currency
      ) {
        newFlashes.h1 = 'down';
      }
    }

    if (
      coin.price_change_percentage_24h !== null &&
      previousCoin.price_change_percentage_24h !== null
    ) {
      if (coin.price_change_percentage_24h > previousCoin.price_change_percentage_24h) {
        newFlashes.h24 = 'up';
      } else if (coin.price_change_percentage_24h < previousCoin.price_change_percentage_24h) {
        newFlashes.h24 = 'down';
      }
    }

    if (
      coin.price_change_percentage_7d_in_currency !== null &&
      previousCoin.price_change_percentage_7d_in_currency !== null
    ) {
      if (
        coin.price_change_percentage_7d_in_currency >
        previousCoin.price_change_percentage_7d_in_currency
      ) {
        newFlashes.d7 = 'up';
      } else if (
        coin.price_change_percentage_7d_in_currency <
        previousCoin.price_change_percentage_7d_in_currency
      ) {
        newFlashes.d7 = 'down';
      }
    }

    setFlashStates(newFlashes);

    const timer = setTimeout(() => {
      setFlashStates({
        price: null,
        h1: null,
        h24: null,
        d7: null,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [coin, previousCoin]);

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
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (value: number): string => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <tr className="border-b border-[#2d3148] transition-colors hover:bg-[#22263a]">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <FavoriteButton coinId={coin.id} size="sm" />
          <span className="text-sm text-[#94a3b8]">{coin.market_cap_rank}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <Link to={`/coin/${coin.id}`} className="flex items-center gap-3 hover:opacity-80">
          <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
          <div>
            <p className="font-medium text-[#e2e8f0]">{coin.name}</p>
            <p className="text-xs uppercase text-[#94a3b8]">{coin.symbol}</p>
          </div>
        </Link>
      </td>
      <td
        className={`px-4 py-4 text-sm font-medium text-[#e2e8f0] ${
          flashStates.price === 'up'
            ? 'animate-flash-up'
            : flashStates.price === 'down'
            ? 'animate-flash-down'
            : ''
        }`}
      >
        {formatPrice(coin.current_price)}
      </td>
      <td className="px-4 py-4 text-sm">
        <PriceChange value={coin.price_change_percentage_1h_in_currency} flash={flashStates.h1} />
      </td>
      <td className="px-4 py-4 text-sm">
        <PriceChange value={coin.price_change_percentage_24h} flash={flashStates.h24} />
      </td>
      <td className="px-4 py-4 text-sm">
        <PriceChange value={coin.price_change_percentage_7d_in_currency} flash={flashStates.d7} />
      </td>
      <td className="px-4 py-4 text-sm text-[#e2e8f0]">{formatMarketCap(coin.market_cap)}</td>
      <td className="px-4 py-4 text-sm text-[#e2e8f0]">{formatVolume(coin.total_volume)}</td>
    </tr>
  );
}
