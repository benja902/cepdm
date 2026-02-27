export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-48 bg-valo-border rounded" />
        <div className="h-8 w-72 bg-valo-surface rounded" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 bg-valo-panel border border-valo-border h-24"
            style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}>
            <div className="h-2 w-24 bg-valo-border rounded mb-3" />
            <div className="h-6 w-16 bg-valo-surface rounded" />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-valo-border" />

      {/* Course cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-valo-panel border border-valo-border h-48"
            style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}>
            <div className="w-14 h-14 bg-valo-surface rounded mb-4" />
            <div className="h-5 w-32 bg-valo-surface rounded mb-2" />
            <div className="h-3 w-20 bg-valo-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
