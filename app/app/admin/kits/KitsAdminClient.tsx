"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LearningKit, Course } from "@/lib/types";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Save,
  Plus,
  Trash2,
  WifiOff,
  RotateCcw,
} from "lucide-react";
import HudPanel from "@/components/hud/HudPanel";

interface TopicRow {
  id: string;
  name: string;
  unitName: string;
  courseName: string;
  courseSlug: string;
  kit: LearningKit | null;
}

interface KitForm {
  summaryBullets: string[];
  summaryNotes: string[];
  methods: { name: string; when_to_use: string; steps: string[] }[];
  mistakes: { mistake: string; fix: string }[];
  verificationChecks: string[];
}

function defaultForm(): KitForm {
  return {
    summaryBullets: [""],
    summaryNotes: [],
    methods: [{ name: "", when_to_use: "", steps: [""] }],
    mistakes: [{ mistake: "", fix: "" }],
    verificationChecks: [""],
  };
}

function kitToForm(kit: LearningKit): KitForm {
  return {
    summaryBullets: kit.summary_json?.bullets?.length ? kit.summary_json.bullets : [""],
    summaryNotes: kit.summary_json?.notes ?? [],
    methods: kit.methods_json?.methods?.length
      ? kit.methods_json.methods.map((m) => ({
          name: m.name ?? "",
          when_to_use: m.when_to_use ?? "",
          steps: m.steps?.length ? m.steps : [""],
        }))
      : [{ name: "", when_to_use: "", steps: [""] }],
    mistakes: kit.common_mistakes_json?.mistakes?.length
      ? kit.common_mistakes_json.mistakes
      : [{ mistake: "", fix: "" }],
    verificationChecks: kit.verification_json?.checks?.length
      ? kit.verification_json.checks
      : [""],
  };
}

export default function KitsAdminClient() {
  const supabase = createClient();
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<KitForm>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setError(false);
    setLoading(true);
    async function load() {
      try {
        const [{ data: topicsData }, { data: kits }, { data: coursesData }] = await Promise.all([
          supabase.from("topics").select("*, units(*, courses(*))").order("id"),
          supabase.from("learning_kits").select("*"),
          supabase.from("courses").select("*").order("order"),
        ]);

        const kitsMap: Record<string, LearningKit> = {};
        for (const k of kits ?? []) kitsMap[k.topic_id] = k;

        const rows: TopicRow[] = (topicsData ?? []).map((t: any) => ({
          id: t.id,
          name: t.name,
          unitName: t.units?.name ?? "–",
          courseName: t.units?.courses?.name ?? "–",
          courseSlug: t.units?.courses?.slug ?? "",
          kit: kitsMap[t.id] ?? null,
        }));

        setTopics(rows);
        setCourses(coursesData ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  const handleExpand = useCallback(
    (topicId: string) => {
      if (expandedId === topicId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(topicId);
      const topic = topics.find((t) => t.id === topicId);
      setForm(topic?.kit ? kitToForm(topic.kit) : defaultForm());
    },
    [expandedId, topics]
  );

  const handleSave = async (topicId: string) => {
    setSaving(true);
    try {
      const payload = {
        topic_id: topicId,
        summary_json: {
          bullets: form.summaryBullets.filter(Boolean),
          notes: form.summaryNotes.filter(Boolean),
        },
        methods_json: {
          methods: form.methods
            .filter((m) => m.name.trim())
            .map((m) => ({
              name: m.name,
              when_to_use: m.when_to_use || undefined,
              steps: m.steps.filter(Boolean),
            })),
        },
        common_mistakes_json: {
          mistakes: form.mistakes.filter((m) => m.mistake.trim()),
        },
        verification_json: {
          checks: form.verificationChecks.filter(Boolean),
        },
      };

      const { error: err } = await supabase
        .from("learning_kits")
        .upsert(payload, { onConflict: "topic_id" });

      if (err) throw err;

      // Update local state
      const { data: updatedKit } = await supabase
        .from("learning_kits")
        .select("*")
        .eq("topic_id", topicId)
        .single();

      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, kit: updatedKit ?? null } : t))
      );
      setSavedId(topicId);
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-valo-surface border border-valo-border" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <WifiOff size={32} className="text-valo-red mx-auto mb-4" />
        <p className="text-valo-muted text-sm font-mono mb-4">Error al cargar</p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="flex items-center gap-2 mx-auto px-4 py-2 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text"
        >
          <RotateCcw size={12} /> REINTENTAR
        </button>
      </div>
    );
  }

  const filtered = topics.filter(
    (t) => filterCourse === "all" || t.courseSlug === filterCourse
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/app/admin"
          className="flex items-center gap-1.5 font-mono text-xs text-valo-muted hover:text-valo-text"
        >
          <ChevronLeft size={12} /> ADMIN
        </Link>
        <div>
          <p className="font-mono text-xs text-valo-muted tracking-widest">// LEARNINGKITS</p>
          <h1 className="text-2xl font-black text-valo-text">KITS DE APRENDIZAJE</h1>
        </div>
      </div>

      {/* Course filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCourse("all")}
          className={`px-3 py-1 font-mono text-xs border transition-all ${filterCourse === "all" ? "border-valo-accent text-valo-accent" : "border-valo-border text-valo-muted"}`}
          style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}
        >
          TODOS
        </button>
        {courses.map((c) => (
          <button
            key={c.slug}
            onClick={() => setFilterCourse(c.slug)}
            className={`px-3 py-1 font-mono text-xs border transition-all ${filterCourse === c.slug ? "border-valo-accent text-valo-accent" : "border-valo-border text-valo-muted"}`}
            style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}
          >
            {c.name.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((topic) => {
          const isOpen = expandedId === topic.id;
          return (
            <div key={topic.id}>
              <button
                onClick={() => handleExpand(topic.id)}
                className="w-full p-4 border border-valo-border bg-valo-panel hover:bg-valo-surface transition-colors text-left"
                style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: topic.kit ? "#39d264" : "#4a5c6e" }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-valo-text">{topic.name}</p>
                      <p className="text-xs text-valo-muted font-mono">{topic.courseName} › {topic.unitName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs ${topic.kit ? "text-valo-green" : "text-valo-muted"}`}>
                      {topic.kit ? "KIT OK" : "SIN KIT"}
                    </span>
                    {isOpen ? <ChevronUp size={14} className="text-valo-muted" /> : <ChevronDown size={14} className="text-valo-muted" />}
                  </div>
                </div>
              </button>

              {isOpen && (
                <HudPanel className="p-6 space-y-6 border-t-0">
                  {/* Summary bullets */}
                  <Section label="TEORÍA — BULLETS">
                    {form.summaryBullets.map((b, i) => (
                      <InputRow
                        key={i}
                        value={b}
                        onChange={(v) => setForm((f) => ({ ...f, summaryBullets: f.summaryBullets.map((x, j) => (j === i ? v : x)) }))}
                        onRemove={() => setForm((f) => ({ ...f, summaryBullets: f.summaryBullets.filter((_, j) => j !== i) }))}
                        placeholder="Punto de teoría..."
                      />
                    ))}
                    <AddButton onClick={() => setForm((f) => ({ ...f, summaryBullets: [...f.summaryBullets, ""] }))} />
                  </Section>

                  {/* Summary notes */}
                  <Section label="NOTAS ADICIONALES (opcional)">
                    {form.summaryNotes.map((n, i) => (
                      <InputRow
                        key={i}
                        value={n}
                        onChange={(v) => setForm((f) => ({ ...f, summaryNotes: f.summaryNotes.map((x, j) => (j === i ? v : x)) }))}
                        onRemove={() => setForm((f) => ({ ...f, summaryNotes: f.summaryNotes.filter((_, j) => j !== i) }))}
                        placeholder="Nota..."
                      />
                    ))}
                    <AddButton onClick={() => setForm((f) => ({ ...f, summaryNotes: [...f.summaryNotes, ""] }))} />
                  </Section>

                  {/* Methods */}
                  <Section label="MÉTODOS">
                    {form.methods.map((m, mi) => (
                      <div key={mi} className="p-4 border border-valo-border space-y-3"
                        style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-valo-accent">MÉTODO {mi + 1}</span>
                          {form.methods.length > 1 && (
                            <button onClick={() => setForm((f) => ({ ...f, methods: f.methods.filter((_, j) => j !== mi) }))}
                              className="text-valo-muted hover:text-valo-red transition-colors">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <input
                          value={m.name}
                          onChange={(e) => setForm((f) => ({ ...f, methods: f.methods.map((x, j) => j === mi ? { ...x, name: e.target.value } : x) }))}
                          placeholder="Nombre del método"
                          className="admin-input"
                        />
                        <input
                          value={m.when_to_use}
                          onChange={(e) => setForm((f) => ({ ...f, methods: f.methods.map((x, j) => j === mi ? { ...x, when_to_use: e.target.value } : x) }))}
                          placeholder="¿Cuándo usarlo? (opcional)"
                          className="admin-input"
                        />
                        <div className="space-y-1.5">
                          <p className="font-mono text-xs text-valo-muted">PASOS</p>
                          {m.steps.map((s, si) => (
                            <InputRow
                              key={si}
                              value={s}
                              onChange={(v) => setForm((f) => ({ ...f, methods: f.methods.map((x, j) => j === mi ? { ...x, steps: x.steps.map((st, k) => k === si ? v : st) } : x) }))}
                              onRemove={() => setForm((f) => ({ ...f, methods: f.methods.map((x, j) => j === mi ? { ...x, steps: x.steps.filter((_, k) => k !== si) } : x) }))}
                              placeholder={`Paso ${si + 1}...`}
                            />
                          ))}
                          <AddButton onClick={() => setForm((f) => ({ ...f, methods: f.methods.map((x, j) => j === mi ? { ...x, steps: [...x.steps, ""] } : x) }))} label="+ PASO" />
                        </div>
                      </div>
                    ))}
                    <AddButton onClick={() => setForm((f) => ({ ...f, methods: [...f.methods, { name: "", when_to_use: "", steps: [""] }] }))} label="+ MÉTODO" />
                  </Section>

                  {/* Common mistakes */}
                  <Section label="ERRORES COMUNES">
                    {form.mistakes.map((mk, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="flex-1 flex gap-2">
                          <input
                            value={mk.mistake}
                            onChange={(e) => setForm((f) => ({ ...f, mistakes: f.mistakes.map((x, j) => j === i ? { ...x, mistake: e.target.value } : x) }))}
                            placeholder="Error..."
                            className="admin-input flex-1"
                          />
                          <input
                            value={mk.fix}
                            onChange={(e) => setForm((f) => ({ ...f, mistakes: f.mistakes.map((x, j) => j === i ? { ...x, fix: e.target.value } : x) }))}
                            placeholder="Corrección..."
                            className="admin-input flex-1"
                          />
                        </div>
                        <button onClick={() => setForm((f) => ({ ...f, mistakes: f.mistakes.filter((_, j) => j !== i) }))}
                          className="text-valo-muted hover:text-valo-red transition-colors mt-2 flex-shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <AddButton onClick={() => setForm((f) => ({ ...f, mistakes: [...f.mistakes, { mistake: "", fix: "" }] }))} label="+ ERROR" />
                  </Section>

                  {/* Verification checks */}
                  <Section label="VERIFICACIÓN">
                    {form.verificationChecks.map((c, i) => (
                      <InputRow
                        key={i}
                        value={c}
                        onChange={(v) => setForm((f) => ({ ...f, verificationChecks: f.verificationChecks.map((x, j) => (j === i ? v : x)) }))}
                        onRemove={() => setForm((f) => ({ ...f, verificationChecks: f.verificationChecks.filter((_, j) => j !== i) }))}
                        placeholder="Check de verificación..."
                      />
                    ))}
                    <AddButton onClick={() => setForm((f) => ({ ...f, verificationChecks: [...f.verificationChecks, ""] }))} />
                  </Section>

                  <button
                    onClick={() => handleSave(topic.id)}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-valo-accent text-valo-bg font-mono text-xs font-bold hover:bg-valo-accent/90 transition-all disabled:opacity-50"
                    style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
                  >
                    <Save size={12} />
                    {saving ? "GUARDANDO..." : savedId === topic.id ? "GUARDADO ✓" : "GUARDAR KIT"}
                  </button>
                </HudPanel>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-xs text-valo-muted tracking-widest">{label}</p>
      {children}
    </div>
  );
}

function InputRow({
  value, onChange, onRemove, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-input flex-1"
      />
      <button onClick={onRemove} className="text-valo-muted hover:text-valo-red transition-colors flex-shrink-0">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function AddButton({ onClick, label = "+ AÑADIR" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-valo-muted hover:text-valo-accent font-mono text-xs transition-colors"
    >
      <Plus size={11} /> {label}
    </button>
  );
}
