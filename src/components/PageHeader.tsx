interface PageHeaderProps {
  title: string;
  days: number;
  onDaysChange: (n: number) => void;
  accentColor?: string;
  rangeOptions?: number[];
}

const DEFAULT_RANGES = [7, 14, 30, 90];

export function PageHeader({
  title,
  days,
  onDaysChange,
  accentColor = "bg-accent-blue text-dark-bg",
  rangeOptions = DEFAULT_RANGES,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
      <div className="flex gap-2" role="group" aria-label="Chọn khoảng thời gian">
        {rangeOptions.map((n) => (
          <button
            key={n}
            onClick={() => onDaysChange(n)}
            aria-pressed={days === n}
            className={`px-3 py-1 rounded-lg text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:outline-none ${
              days === n
                ? accentColor
                : "bg-dark-card text-gray-400 hover:text-gray-200"
            }`}
          >
            {n}d
          </button>
        ))}
      </div>
    </div>
  );
}
