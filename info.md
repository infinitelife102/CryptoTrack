# CryptoTrack — development info

- **Runtime**: Node.js 18+ (recommended 20 LTS)
- **Build**: Vite 7, Tailwind CSS 3.4, shadcn theme
- **UI**: 40+ shadcn/ui components (button, card, dialog, etc.)

## Structure

- `src/pages/` — HomePage, CoinDetailPage, PortfolioPage
- `src/components/` — layout (Header, GlobalStats), dashboard (CoinTable, CoinRow), detail (PriceChart, CoinStats), portfolio, common (ErrorBanner, SkeletonRow, etc.), ui (shadcn)
- `src/hooks/` — useCoins, useCoinDetail, usePriceChart, useGlobalData, usePriceAlert, useInterval, useDebounce
- `src/store/` — portfolioStore, alertStore, favoritesStore (Zustand + persist)
- `src/lib/coinGecko.ts` — CoinGecko API client with global rate-limited queue, timeout, 429 retry, AbortSignal support
- `src/types/coin.ts` — TypeScript interfaces for API data

## API (CoinGecko)

- Public API v3, no key. Free tier ~30 requests/min.
- All requests go through a single queue (min 2.2s between starts) to avoid 429.
- Hooks pass AbortSignal so requests are cancelled on unmount or when dependencies change.

## Commands

```bash
npm install
npm run dev    # dev server
npm run build
npm run preview
npm run lint
```
