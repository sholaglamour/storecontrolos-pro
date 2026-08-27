export function KpiSkeleton() {
  return (
    <div className="panel p-5">
      <div className="h-3 w-20 rounded shimmer mb-4" />
      <div className="h-7 w-28 rounded shimmer mb-3" />
      <div className="h-4 w-14 rounded shimmer" />
    </div>
  );
}

export function PanelSkeleton({ height = "h-64" }: { height?: string }) {
  return <div className={`panel ${height} shimmer`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <PanelSkeleton height="h-72" />
        <PanelSkeleton height="h-72" />
        <PanelSkeleton height="h-72" />
      </div>
      <PanelSkeleton height="h-80" />
    </div>
  );
}
