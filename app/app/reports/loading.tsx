export default function ReportsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-40 bg-valo-border rounded" />
        <div className="h-8 w-32 bg-valo-surface rounded" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 bg-valo-panel border border-valo-border h-24"
            style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}
          >
            <div className="h-2 w-24 bg-valo-border rounded mb-3" />
            <div className="h-6 w-16 bg-valo-surface rounded" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-valo-surface border border-valo-border rounded" />
        ))}
      </div>

      {/* Topic rows */}
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-valo-panel border border-valo-border h-20"
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
          >
            <div className="flex gap-4 items-center">
              <div className="w-1.5 h-12 bg-valo-surface rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-valo-surface rounded" style={{ width: `${60 + (i % 3) * 20}%` }} />
                <div className="h-3 bg-valo-border rounded w-1/3" />
              </div>
              <div className="flex gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="text-right space-y-1">
                    <div className="h-2 w-12 bg-valo-border rounded" />
                    <div className="h-4 w-10 bg-valo-surface rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
