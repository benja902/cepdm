export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-valo-accent/20 rotate-45" />
          <div className="absolute inset-1 border-2 border-t-valo-accent border-r-transparent border-b-transparent border-l-transparent rotate-45 animate-spin" />
        </div>
        <p className="font-mono text-xs text-valo-muted tracking-widest animate-pulse">
          CARGANDO...
        </p>
      </div>
    </div>
  );
}
