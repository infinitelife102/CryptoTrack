import { useEffect, useRef, useState } from 'react';
import type { CoinMarket } from '@/types/coin';
import { useAlertStore } from '@/store/alertStore';
import { getCoinsPrices } from '@/lib/coinGecko';
import { useInterval } from './useInterval';

interface UsePriceAlertProps {
  coins: CoinMarket[];
}

export function usePriceAlert({ coins }: UsePriceAlertProps): void {
  const { alerts, markAsTriggered } = useAlertStore();
  const notifiedAlerts = useRef<Set<string>>(new Set());
  const [alertPrices, setAlertPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const dashboardCoinIds = new Set(coins.map((c) => c.id));
  const alertOnlyCoinIds = alerts
    .filter((a) => !a.triggered && !dashboardCoinIds.has(a.coinId))
    .map((a) => a.coinId);
  const uniqueAlertCoinIds = [...new Set(alertOnlyCoinIds)];
  const alertIdsKey = uniqueAlertCoinIds.join(',');

  const fetchAlertPrices = async (): Promise<void> => {
    if (uniqueAlertCoinIds.length === 0) return;
    try {
      const data = await getCoinsPrices(uniqueAlertCoinIds);
      const map: Record<string, number> = {};
      Object.entries(data).forEach(([id, d]) => {
        map[id] = d.usd;
      });
      setAlertPrices(map);
    } catch {
      setAlertPrices({});
    }
  };

  useEffect(() => {
    fetchAlertPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when alert-only coin set changes
  }, [alertIdsKey]);
  useInterval(fetchAlertPrices, 30000);

  const getCurrentPrice = (coinId: string): number | null => {
    const fromDashboard = coins.find((c) => c.id === coinId);
    if (fromDashboard) return fromDashboard.current_price;
    if (alertPrices[coinId] != null) return alertPrices[coinId];
    return null;
  };

  useEffect(() => {
    if (alerts.length === 0) return;

    alerts.forEach((alert) => {
      if (alert.triggered) return;

      const currentPrice = getCurrentPrice(alert.coinId);
      if (currentPrice == null) return;

      const alertKey = `${alert.coinId}-${alert.targetPrice}`;
      if (notifiedAlerts.current.has(alertKey)) return;

      let shouldNotify = false;
      if (alert.direction === 'above' && currentPrice >= alert.targetPrice) {
        shouldNotify = true;
      } else if (alert.direction === 'below' && currentPrice <= alert.targetPrice) {
        shouldNotify = true;
      }

      if (shouldNotify) {
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          const directionText = alert.direction === 'above' ? 'above' : 'below';
          new Notification('Price Alert', {
            body: `${alert.coinName} reached $${alert.targetPrice.toLocaleString()} ${directionText}! (Current: $${currentPrice.toLocaleString()})`,
            icon: '/favicon.svg',
          });
        }
        markAsTriggered(alert.coinId, alert.targetPrice);
        notifiedAlerts.current.add(alertKey);
      }
    });
  }, [coins, alerts, alertPrices, markAsTriggered]);
}
