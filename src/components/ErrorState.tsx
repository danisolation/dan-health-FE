interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" role="alert">
      <span className="text-4xl mb-4" role="img" aria-label="Error">⚠️</span>
      <h3 className="text-lg font-medium text-gray-200 mb-2">Không thể tải dữ liệu</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-accent-blue text-dark-bg text-sm font-medium
                     hover:bg-accent-blue/80 transition-colors
                     focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:outline-none"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
