import { Bell } from 'lucide-react';
import { useAlertStore } from '@/store/alertStore';

interface AlertBadgeProps {
  coinId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AlertBadge({ coinId, size = 'md' }: AlertBadgeProps): React.ReactElement {
  const { getActiveAlertsByCoin } = useAlertStore();
  const activeAlerts = getActiveAlertsByCoin(coinId);
  const hasAlert = activeAlerts.length > 0;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="relative inline-flex">
      <Bell
        className={`${sizeClasses[size]} ${
          hasAlert ? 'fill-indigo-500 text-indigo-500' : 'text-slate-400'
        }`}
      />
      {hasAlert && activeAlerts.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
          {activeAlerts.length}
        </span>
      )}
    </div>
  );
}
