export function CardSkeleton() {
  return (
    <div className="med-card-dark p-4 animate-pulse">
      <div className="h-40 bg-[#24324A] rounded-xl mb-4" />
      <div className="h-4 bg-[#24324A] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#24324A] rounded w-1/2 mb-3" />
      <div className="h-6 bg-[#24324A] rounded w-1/3" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-[#24324A]/50 rounded-xl">
          <div className="h-10 w-10 bg-[#2A3B56] rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[#2A3B56] rounded w-1/3" />
            <div className="h-3 bg-[#2A3B56] rounded w-1/4" />
          </div>
          <div className="h-6 w-16 bg-[#2A3B56] rounded" />
        </div>
      ))}
    </div>
  )
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-[#24324A] rounded-xl p-4 space-y-3">
          <div className="h-8 w-8 bg-[#2A3B56] rounded-lg" />
          <div className="h-3 bg-[#2A3B56] rounded w-1/2" />
          <div className="h-6 bg-[#2A3B56] rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}
