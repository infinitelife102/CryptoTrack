# 🚀 CryptoTracker

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-blue?style=for-the-badge&logo=vercel)](https://crypto-track-fawn.vercel.app/)

🌍 **Live Website:** [https://crypto-track-fawn.vercel.app/](https://crypto-track-fawn.vercel.app/)

A real-time cryptocurrency market dashboard built with **React 19** and **TypeScript**, powered by the free [CoinGecko API](https://www.coingecko.com/en/api). Track prices, manage a virtual portfolio, set price alerts, and save favorites — all in your browser with no backend required. 📈💎

---

## ✨ Live Features

| Feature | Description |
|---|---|
| 📊 **Market Dashboard** | Live prices for the top 50 coins, auto-refreshed every 60 seconds |
| 🔍 **Coin Detail** | Interactive price chart (1D / 7D / 30D / 1Y), market stats, ATH/ATL |
| 💼 **Portfolio Tracker** | Add holdings with quantity and average buy price; track P&L in real time |
| ⭐ **Favorites** | Star any coin to filter the dashboard to your watchlist |
| 🔔 **Price Alerts** | Set above/below price triggers; browser notifications fire when hit |
| 🔎 **Search** | Debounced live search by coin name or symbol |
| 📱 **Responsive UI** | Full mobile card layout + desktop table layout |

---

## 🛠️ Tech Stack

| Layer | Library / Tool |
|---|---|
| **Framework** | ⚛️ React 19 + 📘 TypeScript 5.9 |
| **Build tool** | ⚡ Vite 7 |
| **Styling** | 🎨 Tailwind CSS 3.4 + shadcn/ui (Radix UI primitives) |
| **Charts** | 📉 Recharts 2 |
| **Routing** | 🛣️ React Router DOM 7 |
| **State / Persistence** | 🐻 Zustand 5 with `persist` middleware (localStorage) |
| **Data source** | 🦎 CoinGecko Public API v3 (no API key required) |
| **Icons** | 🌟 Lucide React |
| **Forms** | 📝 React Hook Form + Zod |

---

## 📂 Project Structure

```text
src/
├── pages/
│   ├── HomePage.tsx          # 🏠 Dashboard — live market table
│   ├── CoinDetailPage.tsx    # 🪙 Per-coin chart + stats + alerts
│   └── PortfolioPage.tsx     # 💼 Virtual portfolio manager
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # 🧭 Navigation + search bar
│   │   └── GlobalStats.tsx   # 🌍 Total market cap / 24h volume / BTC dominance
│   ├── dashboard/
│   │   ├── CoinTable.tsx     # 🖥️ Desktop table with All / Favorites tabs
│   │   ├── CoinRow.tsx       # ⚡ Single row with flash animations on price change
│   │   └── CoinCardMobile.tsx# 📱 Mobile card layout
│   ├── detail/
│   │   ├── PriceChart.tsx    # 📈 Area chart with period selector
│   │   ├── CoinStats.tsx     # 📊 Market cap, volume, supply, ATH, ATL
│   │   └── PriceChangeBadge.tsx
│   ├── portfolio/
│   │   ├── ProfitSummary.tsx # 💰 Total value / invested / return / P&L cards
│   │   ├── HoldingRow.tsx    # 📋 Expandable row per holding
│   │   └── HoldingForm.tsx   # ✍️ Add / edit holding form
│   ├── common/
│   │   ├── ErrorBanner.tsx   # ⚠️ Error display with Retry button
│   │   ├── SearchBar.tsx     # 🔍 Debounced search input
│   │   ├── FavoriteButton.tsx# ⭐ Star toggle
│   │   ├── AlertBadge.tsx    # 🔔 Active alert count badge
│   │   └── SkeletonRow.tsx   # ⏳ Loading skeletons
│   └── ui/                   # 🧩 40+ shadcn/ui base components
├── hooks/
│   ├── useCoins.ts           # 🎣 Fetch + poll top 50 coins
│   ├── useCoinDetail.ts      # 🎣 Fetch single coin detail
│   ├── usePriceChart.ts      # 🎣 Fetch OHLC chart data
│   ├── useGlobalData.ts      # 🎣 Fetch global market stats
│   ├── usePriceAlert.ts      # 🎣 Check alerts against live prices
│   ├── useInterval.ts        # ⏱️ setInterval wrapper
│   └── useDebounce.ts        # ⏳ Input debounce hook
├── store/
│   ├── portfolioStore.ts     # 🗄️ Holdings CRUD (persisted)
│   ├── alertStore.ts         # 🗄️ Price alerts CRUD (persisted)
│   └── favoritesStore.ts     # 🗄️ Favorites list (persisted)
├── lib/
│   └── coinGecko.ts          # 🌐 API client: global queue, timeout, 429 retry, abort
└── types/
    └── coin.ts               # 🏷️ TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- 🟢 Node.js 18+ (recommended: 20 LTS)
- 📦 npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5174 (or the port Vite prints)

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 📡 API

All data comes from the **CoinGecko Public API** (v3). No API key is required.

| Endpoint used | Purpose |
|---|---|
| `/coins/markets` | 📊 Top 50 coins list (price, volume, market cap, % changes) |
| `/coins/{id}` | 🪙 Single coin details (market data, ATH, ATL, supply) |
| `/coins/{id}/market_chart` | 📉 Historical OHLC price data for charts |
| `/global` | 🌍 Global market stats (total cap, BTC dominance) |
| `/search` | 🔍 Coin search by name/symbol |
| `/simple/price` | 🏷️ Batch price lookup for portfolio holdings |

### 🚦 Rate limit and queue

The **free tier allows ~30 requests per minute** (see [CoinGecko docs](https://docs.coingecko.com/docs/common-errors-rate-limit)). To stay under this limit:

- 🛤️ **Global request queue** (`src/lib/coinGecko.ts`): Every API call goes through a single queue. Only one request runs at a time, with a **minimum 2.2s gap** between starts (~27/min).
- 🛑 **Abort on navigation**: When you leave a page, in-flight requests for that page are cancelled so they don’t waste the limit.
- ♻️ **429 retry**: If the server returns “Too many requests”, the app retries with backoff (1.5s, then 4s) before showing an error.

If you see a **CORS error** in the console (e.g. “No 'Access-Control-Allow-Origin' header”), it usually means the server returned **429** and didn’t send CORS headers on that error response. The underlying cause is rate limiting, not a CORS misconfiguration in the app.

---

## 💾 Data Persistence

All user data is saved in the browser's `localStorage` via Zustand `persist`. No account or server is needed.

| Store key | Contents |
|---|---|
| 💼 `crypto-portfolio` | Coin holdings (id, name, quantity, avg buy price) |
| 🔔 `crypto-alerts` | Price alerts (coin, target price, direction, triggered status) |
| ⭐ `crypto-favorites` | Array of starred coin IDs |

🗑️ Clearing browser storage resets all user data.

---

## 🎯 Feature Details

### 1. Market Dashboard (`/`)
- 🏆 Displays top 50 cryptocurrencies ranked by market cap.
- 📊 Columns: Rank, Coin, Price, 1h %, 24h %, 7d %, Market Cap, Volume.
- 🟢🔴 Price cells flash green (up) or red (down) when live data refreshes.
- 🗂️ Tabs: **All** coins or **Favorites** only.
- ⏱️ Last updated timestamp shown in the header row.
- 🔄 Auto-refreshes every **60 seconds**.

### 2. Coin Detail (`/coin/:id`)
- 📉 Interactive **area chart** with 4 period buttons: 1D, 7D, 30D, 1Y.
- 🏷️ Price change badges for 1h, 24h, 7d, 30d.
- 📈 Market stats: Market Cap, 24h Volume, Circulating Supply, ATH, ATL.
- ⭐ **Favorite toggle** (star button).
- 🔔 **Price alert modal**: set a target price and choose "above" or "below" as the trigger direction.

### 3. Portfolio (`/portfolio`)
- 🔍 Add any coin by searching (live search powered by CoinGecko `/search`).
- 🔢 Enter **quantity** and **average buy price** per coin.
- 💵 Summary cards: Total Value, Total Invested, Total Return (%), Profit/Loss ($).
- 📋 Each holding row expands to show: Quantity, Avg Buy Price, Current Price, Amount Invested.
- ✏️ Edit or delete individual holdings.
- 💾 Holdings and prices persist across sessions.

### 4. Price Alerts
- 📍 Set from the Coin Detail page.
- 📲 Triggers a **browser push notification** when the live price crosses the target.
- 🔄 Alerts survive page refresh (persisted in localStorage).
- 🔴 Active alert count shown as a badge on the Bell icon.

### 5. Favorites
- ⭐ Click the star icon on any coin row or detail page.
- 🗂️ Filtered view available on the Dashboard ("Favorites" tab).
- 💾 Persisted across sessions.

### 6. Global Market Stats (Header Bar)
- 🌍 Total Market Cap, 24h Volume, BTC Dominance — refreshed every 60 seconds.

---

## ⚠️ Error Handling

- ⏳ **15-second timeout** — shows "Request timed out" if the server doesn’t respond in time.
- 🌐 **Network errors** — shows "Network error. Please check your internet connection or try again later."
- 🛑 **Rate limit (HTTP 429)** — retried automatically with backoff; if all retries fail, shows "Too many requests. Please wait a moment and try again."
- 🚪 **Abort on leave** — requests for a page are cancelled when you navigate away so they don’t count toward the limit or block the queue.
- 🔄 **Retry button** on all error banners.

*Background refresh failures (e.g. 429 after data has already loaded once) are ignored so the UI doesn’t flash error messages.*

---

## 📓 Development notes

- ⚡ **Dashboard cache**: The coin list is cached at module level (`useCoins`). When you navigate back to the home page, the last list is shown immediately while a fresh request runs in the background.
- ⏱️ **Staggered first fetch**: Global stats and coin-detail hooks delay their first request (800ms and 400ms) so they don’t all hit the queue at once on load.
- 🛡️ **Error boundary**: A root `ErrorBoundary` catches render errors so a single component failure doesn’t blank the whole app.

---

## 🌐 Browser Compatibility

Modern evergreen browsers (Chrome, Firefox, Edge, Safari). Requires browser Notification API support for price alerts; the feature gracefully degrades when unavailable.

---

## 📜 License

MIT — free to use, modify, and deploy.
