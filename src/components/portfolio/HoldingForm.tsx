import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Holding } from '@/types/coin';

interface HoldingFormProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  currentPrice: number;
  existingHolding?: Holding;
  onSave: (holding: Holding) => void;
  onCancel?: () => void;
}

export function HoldingForm({
  coinId,
  coinName,
  coinSymbol,
  coinImage,
  currentPrice,
  existingHolding,
  onSave,
  onCancel,
}: HoldingFormProps): React.ReactElement {
  const [quantity, setQuantity] = useState<string>(existingHolding?.quantity.toString() || '');
  const [avgBuyPrice, setAvgBuyPrice] = useState<string>(
    existingHolding?.avgBuyPrice.toString() || currentPrice.toString()
  );

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    const qty = parseFloat(quantity);
    const price = parseFloat(avgBuyPrice);

    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      return;
    }

    onSave({
      coinId,
      coinName,
      coinSymbol,
      coinImage,
      quantity: qty,
      avgBuyPrice: price,
    });

    if (!existingHolding) {
      setQuantity('');
      setAvgBuyPrice(currentPrice.toString());
    }
  };

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3">
        <img src={coinImage} alt={coinName} className="h-8 w-8 rounded-full" />
        <div>
          <p className="font-medium text-[#e2e8f0]">{coinName}</p>
          <p className="text-xs text-[#94a3b8]">Current: {formatPrice(currentPrice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-[#94a3b8]">Quantity</label>
          <input
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-[#2d3148] bg-[#0f1117] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#94a3b8]">Avg. Buy Price (USD)</label>
          <input
            type="number"
            step="any"
            value={avgBuyPrice}
            onChange={(e) => setAvgBuyPrice(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-[#2d3148] bg-[#0f1117] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          {existingHolding ? 'Update' : 'Add'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#2d3148] bg-[#0f1117] px-4 py-2 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#22263a] hover:text-[#e2e8f0]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
