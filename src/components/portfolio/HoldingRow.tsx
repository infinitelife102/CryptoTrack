import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Holding } from '@/types/coin';
import { HoldingForm } from './HoldingForm';

interface HoldingRowProps {
  holding: Holding;
  currentPrice: number;
  onUpdate: (holding: Holding) => void;
  onDelete: (coinId: string) => void;
}

export function HoldingRow({
  holding,
  currentPrice,
  onUpdate,
  onDelete,
}: HoldingRowProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const currentValue = holding.quantity * currentPrice;
  const investedValue = holding.quantity * holding.avgBuyPrice;
  const profitLoss = currentValue - investedValue;
  const profitLossPercent = (profitLoss / investedValue) * 100;

  const isProfit = profitLoss >= 0;

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatNumber = (value: number): string => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    return value.toLocaleString();
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4">
        <HoldingForm
          coinId={holding.coinId}
          coinName={holding.coinName}
          coinSymbol={holding.coinSymbol}
          coinImage={holding.coinImage}
          currentPrice={currentPrice}
          existingHolding={holding}
          onSave={(updatedHolding) => {
            onUpdate(updatedHolding);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={holding.coinImage} alt={holding.coinName} className="h-10 w-10 rounded-full" />
          <div>
            <p className="font-medium text-[#e2e8f0]">{holding.coinName}</p>
            <p className="text-xs uppercase text-[#94a3b8]">{holding.coinSymbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[#e2e8f0]">{formatPrice(currentValue)}</p>
          <p className={`text-sm font-medium ${isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {isProfit ? '+' : ''}
            {formatPrice(Math.abs(profitLoss))} ({isProfit ? '+' : ''}
            {profitLossPercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-[#94a3b8] hover:text-[#e2e8f0]"
        type="button"
      >
        {isExpanded ? (
          <>
            Collapse <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            View details <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 border-t border-[#2d3148] pt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-[#94a3b8]">Quantity</p>
              <p className="text-sm font-medium text-[#e2e8f0]">
                {formatNumber(holding.quantity)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">Avg. Buy Price</p>
              <p className="text-sm font-medium text-[#e2e8f0]">
                {formatPrice(holding.avgBuyPrice)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">Current Price</p>
              <p className="text-sm font-medium text-[#e2e8f0]">{formatPrice(currentPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">Invested</p>
              <p className="text-sm font-medium text-[#e2e8f0]">
                {formatPrice(investedValue)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f1117] px-4 py-2 text-sm font-medium text-[#e2e8f0] transition-colors hover:bg-[#22263a]"
              type="button"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(holding.coinId)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
