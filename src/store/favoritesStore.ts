import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (coinId: string) => {
        set((state) => {
          const isAlreadyFavorite = state.favorites.includes(coinId);
          return {
            favorites: isAlreadyFavorite
              ? state.favorites.filter((id) => id !== coinId)
              : [...state.favorites, coinId],
          };
        });
      },

      isFavorite: (coinId: string) => {
        return get().favorites.includes(coinId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'crypto-favorites',
    }
  )
);
