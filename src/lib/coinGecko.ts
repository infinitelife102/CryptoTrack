import type {
  CoinMarket,
  CoinDetail,
  GlobalData,
  ChartPoint,
  MarketChartResponse,
} from '@/types/coin';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const FETCH_TIMEOUT_MS = 15000;

// Retry delays for 429 rate-limit responses
const RETRY_DELAYS_MS = [1500, 4000] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    return err.message === 'Failed to fetch' || err.message === 'Load failed';
  }
  if (err instanceof Error) {
    return err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
  }
  return false;
}

/**
 * Core fetch wrapper.
 *
 * `signal` — caller-supplied AbortSignal (e.g. from a hook's AbortController).
 *   Aborting via this signal throws a DOMException with name 'AbortError' so
 *   hooks can detect the cancellation and ignore it silently.
 *
 * The internal timeout controller throws a friendly Error when it fires so the
 * user sees "Request timed out" rather than a raw AbortError.
 */
async function fetchAPI<T>(endpoint: string, signal?: AbortSignal, attempt = 0): Promise<T> {
  // Already cancelled before we even started
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  let isTimedOut = false;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    isTimedOut = true;
    timeoutController.abort();
  }, FETCH_TIMEOUT_MS);

  // Forward the caller's cancellation to our timeout controller
  const onCallerAbort = (): void => timeoutController.abort();
  signal?.addEventListener('abort', onCallerAbort, { once: true });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onCallerAbort);

    // Caller cancelled after the response arrived but before we processed it
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    if (response.status === 429) {
      if (attempt < RETRY_DELAYS_MS.length) {
        // Rate-limited — wait silently then retry
        await sleep(RETRY_DELAYS_MS[attempt]);
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        return fetchAPI<T>(endpoint, signal, attempt + 1);
      }
      throw new Error('Too many requests. Please wait a moment and try again.');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onCallerAbort);

    if (err instanceof Error && err.name === 'AbortError') {
      if (isTimedOut) {
        // Our internal timeout fired → user-visible message
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      // Caller cancelled (component unmounting) → rethrow as AbortError
      // so hooks can detect it and exit silently
      throw err;
    }

    // Don't double-wrap errors that already have a friendly message
    if (
      err instanceof Error &&
      (err.message.startsWith('Too many requests') ||
        err.message.startsWith('Request timed out') ||
        err.message.startsWith('Network error') ||
        err.message.startsWith('API error'))
    ) {
      throw err;
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
  page: number = 1,
  signal?: AbortSignal
): Promise<CoinMarket[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: 'false',
    price_change_percentage: '1h,7d',
  });

  return fetchAPI<CoinMarket[]>(`/coins/markets?${params.toString()}`, signal);
}

export async function getCoinDetail(id: string, signal?: AbortSignal): Promise<CoinDetail> {
  const params = new URLSearchParams({
    localization: 'false',
    tickers: 'false',
    community_data: 'false',
  });

  return fetchAPI<CoinDetail>(`/coins/${id}?${params.toString()}`, signal);
}

export async function getCoinMarketChart(
  id: string,
  days: number,
  signal?: AbortSignal
): Promise<ChartPoint[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    days: days.toString(),
  });

  const data = await fetchAPI<MarketChartResponse>(
    `/coins/${id}/market_chart?${params.toString()}`,
    signal
  );

  return data.prices.map(([timestamp, price]) => ({
    timestamp,
    price,
  }));
}

export async function getGlobalData(signal?: AbortSignal): Promise<GlobalData> {
  return fetchAPI<GlobalData>('/global', signal);
}

export async function searchCoins(
  query: string,
  signal?: AbortSignal
): Promise<{
  coins: Array<{ id: string; symbol: string; name: string; thumb: string }>;
}> {
  if (!query.trim()) {
    return { coins: [] };
  }

  const params = new URLSearchParams({ query: query.trim() });

  return fetchAPI<{ coins: Array<{ id: string; symbol: string; name: string; thumb: string }> }>(
    `/search?${params.toString()}`,
    signal
  );
}

export async function getCoinsPrices(
  ids: string[],
  signal?: AbortSignal
): Promise<Record<string, { usd: number }>> {
  if (ids.length === 0) {
    return {};
  }

  const params = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: 'usd',
  });

  return fetchAPI<Record<string, { usd: number }>>(
    `/simple/price?${params.toString()}`,
    signal
  );
}
