export default function PracticeLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-32 bg-valo-border rounded" />
        <div className="h-3 w-16 bg-valo-border rounded" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-valo-border rounded" />

      {/* Topic label */}
      <div className="h-3 w-64 bg-valo-border rounded" />

      {/* Question card */}
      <div
        className="p-6 bg-valo-panel border border-valo-accent/30 space-y-5"
        style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}
      >
        <div className="h-3 w-24 bg-valo-border rounded" />
        <div className="space-y-2">
          <div className="h-5 bg-valo-surface rounded w-full" />
          <div className="h-5 bg-valo-surface rounded w-4/5" />
          <div className="h-5 bg-valo-surface rounded w-3/5" />
        </div>
        <div className="space-y-2 pt-2">
          {["A", "B", "C", "D", "E"].map((opt) => (
            <div
              key={opt}
              className="p-4 bg-valo-surface border border-valo-border h-14 flex items-center gap-3"
            >
              <div className="w-6 h-6 bg-valo-border flex-shrink-0" />
              <div className="h-3 bg-valo-border rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
