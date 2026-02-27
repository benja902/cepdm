import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="font-mono text-xs text-valo-muted tracking-widest mb-2">
          // PANEL DE ADMINISTRACIÓN
        </p>
        <h1 className="text-3xl font-black text-valo-text">ADMIN</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: "/app/admin/kits",
            label: "LEARNING KITS",
            desc: "Teoría, métodos, errores y verificación por subtema",
            color: "#00d4ff",
          },
          {
            href: "/app/admin/templates",
            label: "PLANTILLAS",
            desc: "Plantillas de solución por curso",
            color: "#f5a623",
          },
          {
            href: "/app/admin/questions",
            label: "PREGUNTAS",
            desc: "Editar explicaciones, tags y metadatos",
            color: "#39d264",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-5 border border-valo-border bg-valo-panel hover:bg-valo-surface transition-colors"
            style={{
              clipPath:
                "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)",
            }}
          >
            <p
              className="font-mono text-xs font-bold tracking-widest mb-2"
              style={{ color: item.color }}
            >
              {item.label}
            </p>
            <p className="text-valo-muted text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
