import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Holding } from '@/types/coin';

interface PortfolioState {
  holdings: Holding[];
  addHolding: (holding: Holding) => void;
  updateHolding: (holding: Holding) => void;
  removeHolding: (coinId: string) => void;
  hasHolding: (coinId: string) => boolean;
  getHolding: (coinId: string) => Holding | undefined;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      holdings: [],

      addHolding: (holding: Holding) => {
        set((state) => {
          const existingIndex = state.holdings.findIndex(
            (h) => h.coinId === holding.coinId
          );

          if (existingIndex >= 0) {
            const updatedHoldings = [...state.holdings];
            updatedHoldings[existingIndex] = {
              ...updatedHoldings[existingIndex],
              ...holding,
            };
            return { holdings: updatedHoldings };
          }

          return { holdings: [...state.holdings, holding] };
        });
      },

      updateHolding: (holding: Holding) => {
        set((state) => ({
          holdings: state.holdings.map((h) =>
            h.coinId === holding.coinId ? { ...h, ...holding } : h
          ),
        }));
      },

      removeHolding: (coinId: string) => {
        set((state) => ({
          holdings: state.holdings.filter((h) => h.coinId !== coinId),
        }));
      },

      hasHolding: (coinId: string) => {
        return get().holdings.some((h) => h.coinId === coinId);
      },

      getHolding: (coinId: string) => {
        return get().holdings.find((h) => h.coinId === coinId);
      },

      clearPortfolio: () => {
        set({ holdings: [] });
      },
    }),
    {
      name: 'crypto-portfolio',
    }
  )
);
