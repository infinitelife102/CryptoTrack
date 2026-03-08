import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PriceAlert } from '@/types/coin';

interface AlertState {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'triggered'>) => void;
  removeAlert: (coinId: string, targetPrice: number) => void;
  markAsTriggered: (coinId: string, targetPrice: number) => void;
  resetTriggered: (coinId: string, targetPrice: number) => void;
  getAlertsByCoin: (coinId: string) => PriceAlert[];
  getActiveAlertsByCoin: (coinId: string) => PriceAlert[];
  clearAlerts: () => void;
  clearAlertsByCoin: (coinId: string) => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (alert: Omit<PriceAlert, 'triggered'>) => {
        set((state) => {
          const exists = state.alerts.some(
            (a) =>
              a.coinId === alert.coinId && a.targetPrice === alert.targetPrice
          );

          if (exists) {
            return state;
          }

          return {
            alerts: [...state.alerts, { ...alert, triggered: false, createdAt: Date.now() }],
          };
        });
      },

      removeAlert: (coinId: string, targetPrice: number) => {
        set((state) => ({
          alerts: state.alerts.filter(
            (a) => !(a.coinId === coinId && a.targetPrice === targetPrice)
          ),
        }));
      },

      markAsTriggered: (coinId: string, targetPrice: number) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.coinId === coinId && a.targetPrice === targetPrice
              ? { ...a, triggered: true }
              : a
          ),
        }));
      },

      resetTriggered: (coinId: string, targetPrice: number) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.coinId === coinId && a.targetPrice === targetPrice
              ? { ...a, triggered: false }
              : a
          ),
        }));
      },

      getAlertsByCoin: (coinId: string) => {
        return get().alerts.filter((a) => a.coinId === coinId);
      },

      getActiveAlertsByCoin: (coinId: string) => {
        return get().alerts.filter((a) => a.coinId === coinId && !a.triggered);
      },

      clearAlerts: () => {
        set({ alerts: [] });
      },

      clearAlertsByCoin: (coinId: string) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.coinId !== coinId),
        }));
      },
    }),
    {
      name: 'crypto-alerts',
    }
  )
);
