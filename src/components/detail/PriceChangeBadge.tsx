interface PriceChangeBadgeProps {
  label: string;
  value: number | null;
}

export function PriceChangeBadge({ label, value }: PriceChangeBadgeProps): React.ReactElement {
  const isPositive = value !== null && value >= 0;
  const bgColor = isPositive
    ? 'bg-[#22c55e]/10'
    : value === null
    ? 'bg-[#94a3b8]/10'
    : 'bg-[#ef4444]/10';
  const textColor = isPositive
    ? 'text-[#22c55e]'
    : value === null
    ? 'text-[#94a3b8]'
    : 'text-[#ef4444]';

  return (
    <div className={`rounded-lg ${bgColor} px-4 py-3`}>
      <p className="text-xs text-[#94a3b8]">{label}</p>
      <p className={`text-lg font-semibold ${textColor}`}>
        {value === null ? '-' : `${isPositive ? '+' : ''}${value.toFixed(2)}%`}
      </p>
    </div>
  );
}
