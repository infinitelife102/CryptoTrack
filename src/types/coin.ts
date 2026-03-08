import type { ReactNode } from 'react';

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  total_volume: number;
  circulating_supply: number;
}

export interface ChartPoint {
  timestamp: number;
  price: number;
}

export interface Holding {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  quantity: number;
  avgBuyPrice: number;
}

export interface PriceAlert {
  coinId: string;
  coinName: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt?: number;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    circulating_supply: number;
    ath: { usd: number };
    atl: { usd: number };
    price_change_percentage_1h_in_currency: { usd: number } | null;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_30d: number | null;
  };
}

export interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: {
      btc: number;
    };
  };
}

export interface MarketChartResponse {
  prices: [number, number][];
}

export interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}

export type ChartPeriod = 1 | 7 | 30 | 365;

export type ReactElement = ReactNode;
