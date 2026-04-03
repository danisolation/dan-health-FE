interface EmptyStateProps {
  message?: string;
  icon?: string;
}

export function EmptyState({
  message = "Chưa có dữ liệu cho khoảng thời gian này.",
  icon = "📭",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3" role="img" aria-hidden="true">{icon}</span>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
