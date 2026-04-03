interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
      <span className="text-xs text-gray-500">90 ngày gần nhất</span>
    </div>
  );
}
