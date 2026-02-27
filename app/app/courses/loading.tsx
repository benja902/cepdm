export default function CoursesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-32 bg-valo-border rounded" />
        <div className="h-8 w-28 bg-valo-surface rounded" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-6 p-6 bg-valo-panel border border-valo-border h-24"
          style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}>
          <div className="w-16 h-16 bg-valo-surface flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 bg-valo-surface rounded" />
            <div className="h-3 w-24 bg-valo-border rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
