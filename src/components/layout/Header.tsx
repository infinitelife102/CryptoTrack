import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Menu, X, PieChart, Home } from 'lucide-react';
import { SearchBar } from '@/components/common/SearchBar';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps): React.ReactElement {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/portfolio', label: 'Portfolio', icon: PieChart },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#2d3148] bg-[#0f1117]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="hidden text-lg font-bold text-[#e2e8f0] sm:block">
              CryptoTracker
            </span>
          </Link>

          {location.pathname === '/' && onSearch && (
            <div className="hidden flex-1 max-w-md md:block">
              <SearchBar onSearch={onSearch} />
            </div>
          )}

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-[#94a3b8] hover:bg-[#1a1d27] hover:text-[#e2e8f0]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-[#94a3b8] hover:bg-[#1a1d27] hover:text-[#e2e8f0] md:hidden"
            type="button"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {location.pathname === '/' && onSearch && (
          <div className="pb-3 md:hidden">
            <SearchBar onSearch={onSearch} />
          </div>
        )}

        {isMobileMenuOpen && (
          <nav className="border-t border-[#2d3148] py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400'
                        : 'text-[#94a3b8] hover:bg-[#1a1d27] hover:text-[#e2e8f0]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
