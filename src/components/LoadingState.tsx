interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Đang tải dữ liệu..." }: LoadingStateProps) {
  return (
    <div className="space-y-6 motion-safe:animate-pulse" aria-busy="true" aria-label={message}>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-2">
            <div className="h-6 w-6 mx-auto rounded-full bg-dark-hover" />
            <div className="h-5 w-12 mx-auto rounded bg-dark-hover" />
            <div className="h-3 w-16 mx-auto rounded bg-dark-hover" />
          </div>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-4">
            <div className="h-4 w-32 rounded bg-dark-hover" />
            <div className="h-[250px] rounded bg-dark-hover/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
