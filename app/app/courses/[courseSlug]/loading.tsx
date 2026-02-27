export default function CourseDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-4 animate-pulse">
      {/* Course header skeleton */}
      <div
        className="p-6 bg-valo-panel border border-valo-border h-28"
        style={{ clipPath: "polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)" }}
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-valo-surface flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-32 bg-valo-border rounded" />
            <div className="h-7 w-48 bg-valo-surface rounded" />
          </div>
        </div>
      </div>

      {/* Unit skeletons */}
      {[200, 260, 180, 220, 240].map((w, i) => (
        <div
          key={i}
          className="p-4 bg-valo-panel border border-valo-border h-16"
          style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-valo-surface flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 bg-valo-surface rounded" style={{ width: `${w}px` }} />
              <div className="h-2 w-20 bg-valo-border rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
