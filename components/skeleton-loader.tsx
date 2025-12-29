/**
 * Reusable skeleton loader for table rows
 */
export function SkeletonLoader({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-8 bg-slate-200 rounded animate-pulse"
              style={{ flex: 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton loader for cards
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4 animate-pulse" />
      <div className="h-8 bg-slate-200 rounded w-2/3 mb-2 animate-pulse" />
      <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
    </div>
  )
}
