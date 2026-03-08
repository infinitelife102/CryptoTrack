interface SkeletonRowProps {
  count?: number;
}

export function SkeletonRow({ count = 10 }: SkeletonRowProps): React.ReactElement {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <tr key={index} className="border-b border-[#2d3148]">
          <td className="px-4 py-4">
            <div className="h-4 w-8 animate-pulse rounded bg-[#2d3148]" />
          </td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[#2d3148]" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[#2d3148]" />
                <div className="h-3 w-12 animate-pulse rounded bg-[#2d3148]" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-20 animate-pulse rounded bg-[#2d3148]" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-16 animate-pulse rounded bg-[#2d3148]" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-16 animate-pulse rounded bg-[#2d3148]" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-16 animate-pulse rounded bg-[#2d3148]" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-24 animate-pulse rounded bg-[#2d3148]" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-20 animate-pulse rounded bg-[#2d3148]" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function SkeletonCard({ count = 5 }: SkeletonRowProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-[#2d3148] bg-[#1a1d27] p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[#2d3148]" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[#2d3148]" />
                <div className="h-3 w-12 animate-pulse rounded bg-[#2d3148]" />
              </div>
            </div>
            <div className="h-6 w-16 animate-pulse rounded bg-[#2d3148]" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-[#2d3148]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#2d3148]" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-[#2d3148]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#2d3148]" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-[#2d3148]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#2d3148]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
