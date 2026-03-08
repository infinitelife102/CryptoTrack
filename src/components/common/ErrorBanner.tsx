import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorBanner({
  message = 'An error occurred while loading data.',
  onRetry,
}: ErrorBannerProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
        <div className="flex-1">
          <p className="text-sm text-red-200">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
