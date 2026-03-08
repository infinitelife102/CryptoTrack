import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CoinDetailPage } from '@/pages/CoinDetailPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/coin/:id" element={<CoinDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
