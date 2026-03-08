import type {
  CoinMarket,
  CoinDetail,
  GlobalData,
  ChartPoint,
  MarketChartResponse,
} from '@/types/coin';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const FETCH_TIMEOUT_MS = 15000;

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    return err.message === 'Failed to fetch' || err.message === 'Load failed';
  }
  if (err instanceof Error) {
    return err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
  }
  return false;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error(
        'Too many requests. CoinGecko rate limit reached. Please wait a minute and try again.'
      );
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    if (isNetworkError(err)) {
      throw new Error(
        'Network error. Please check your internet connection or try again later.'
      );
    }
    throw err;
  }
}

export async function getCoinsMarkets(
  perPage: number = 50,
  page: number = 1
): Promise<CoinMarket[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: 'false',
    price_change_percentage: '1h,7d',
  });

  return fetchAPI<CoinMarket[]>(`/coins/markets?${params.toString()}`);
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  const params = new URLSearchParams({
    localization: 'false',
    tickers: 'false',
    community_data: 'false',
  });

  return fetchAPI<CoinDetail>(`/coins/${id}?${params.toString()}`);
}

export async function getCoinMarketChart(
  id: string,
  days: number
): Promise<ChartPoint[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    days: days.toString(),
  });

  const data = await fetchAPI<MarketChartResponse>(
    `/coins/${id}/market_chart?${params.toString()}`
  );

  return data.prices.map(([timestamp, price]) => ({
    timestamp,
    price,
  }));
}

export async function getGlobalData(): Promise<GlobalData> {
  return fetchAPI<GlobalData>('/global');
}

export async function searchCoins(query: string): Promise<{
  coins: Array<{
    id: string;
    symbol: string;
    name: string;
    thumb: string;
  }>;
}> {
  if (!query.trim()) {
    return { coins: [] };
  }

  const params = new URLSearchParams({
    query: query.trim(),
  });

  return fetchAPI<{ coins: Array<{ id: string; symbol: string; name: string; thumb: string }> }>(
    `/search?${params.toString()}`
  );
}

export async function getCoinsPrices(
  ids: string[]
): Promise<Record<string, { usd: number }>> {
  if (ids.length === 0) {
    return {};
  }

  const params = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: 'usd',
  });

  return fetchAPI<Record<string, { usd: number }>>(
    `/simple/price?${params.toString()}`
  );
}
