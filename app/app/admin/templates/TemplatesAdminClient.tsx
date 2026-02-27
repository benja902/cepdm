"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SolutionTemplate, Course } from "@/lib/types";
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

interface TemplateForm {
  name: string;
  slug: string;
  courseId: string;
  steps: string[];
  minTextBlocks: number;
  requiresMath: boolean;
  requiresErrorCommon: boolean;
  requiresVerification: boolean;
}

function defaultForm(courses: Course[]): TemplateForm {
  return {
    name: "",
    slug: "",
    courseId: courses[0]?.id ?? "",
    steps: [""],
    minTextBlocks: 2,
    requiresMath: false,
    requiresErrorCommon: true,
    requiresVerification: true,
  };
}

function templateToForm(t: SolutionTemplate): TemplateForm {
  return {
    name: t.name,
    slug: t.slug,
    courseId: t.course_id,
    steps: t.schema_json?.steps?.length ? t.schema_json.steps : [""],
    minTextBlocks: t.min_requirements_json?.min_text_blocks ?? 2,
    requiresMath: t.min_requirements_json?.requires_math ?? false,
    requiresErrorCommon: t.min_requirements_json?.requires_error_common ?? true,
    requiresVerification: t.min_requirements_json?.requires_verification ?? true,
  };
}

export default function TemplatesAdminClient() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<SolutionTemplate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<TemplateForm | null>(null);

  useEffect(() => {
    setError(false);
    setLoading(true);
    async function load() {
      try {
        const [{ data: t }, { data: c }] = await Promise.all([
          supabase.from("solution_templates").select("*").order("created_at"),
          supabase.from("courses").select("*").order("order"),
        ]);
        setTemplates(t ?? []);
        setCourses(c ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  const handleExpand = (t: SolutionTemplate) => {
    if (expandedId === t.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(t.id);
    setForm(templateToForm(t));
    setShowNew(false);
  };

  const handleSave = async (templateId: string) => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        course_id: form.courseId,
        schema_json: { steps: form.steps.filter(Boolean) },
        min_requirements_json: {
          min_text_blocks: form.minTextBlocks,
          requires_math: form.requiresMath,
          requires_error_common: form.requiresErrorCommon,
          requires_verification: form.requiresVerification,
        },
      };
      const { error: err } = await supabase
        .from("solution_templates")
        .update(payload)
        .eq("id", templateId);
      if (err) throw err;
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? { ...t, ...payload } : t))
      );
      setSavedId(templateId);
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newForm) return;
    setSaving(true);
    try {
      const payload = {
        name: newForm.name,
        slug: newForm.slug,
        course_id: newForm.courseId,
        schema_json: { steps: newForm.steps.filter(Boolean) },
        min_requirements_json: {
          min_text_blocks: newForm.minTextBlocks,
          requires_math: newForm.requiresMath,
          requires_error_common: newForm.requiresErrorCommon,
          requires_verification: newForm.requiresVerification,
        },
      };
      const { data, error: err } = await supabase
        .from("solution_templates")
        .insert(payload)
        .select()
        .single();
      if (err) throw err;
      if (data) setTemplates((prev) => [...prev, data]);
      setShowNew(false);
      setNewForm(null);
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    await supabase.from("solution_templates").delete().eq("id", templateId);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (expandedId === templateId) setExpandedId(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/app/admin"
            className="flex items-center gap-1.5 font-mono text-xs text-valo-muted hover:text-valo-text"
          >
            <ChevronLeft size={12} /> ADMIN
          </Link>
          <div>
            <p className="font-mono text-xs text-valo-muted tracking-widest">// SOLUTION_TEMPLATES</p>
            <h1 className="text-2xl font-black text-valo-text">PLANTILLAS</h1>
          </div>
        </div>
        <button
          onClick={() => { setShowNew(true); setNewForm(defaultForm(courses)); setExpandedId(null); }}
          className="flex items-center gap-2 px-4 py-2 border border-valo-accent/40 bg-valo-accent/10 font-mono text-xs text-valo-accent hover:bg-valo-accent/20 transition-all"
          style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
        >
          <Plus size={12} /> NUEVA
        </button>
      </div>

      {/* New template form */}
      {showNew && newForm && (
        <HudPanel className="p-6 space-y-4">
          <p className="font-mono text-xs text-valo-accent tracking-widest">NUEVA PLANTILLA</p>
          <TemplateFormFields form={newForm} setForm={(fn) => setNewForm((prev) => prev ? fn(prev) : prev)} courses={courses} />
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-valo-accent text-valo-bg font-mono text-xs font-bold hover:bg-valo-accent/90 transition-all"
              style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
            >
              <Save size={12} /> {saving ? "CREANDO..." : "CREAR"}
            </button>
            <button
              onClick={() => { setShowNew(false); setNewForm(null); }}
              className="px-4 py-2 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text"
            >
              CANCELAR
            </button>
          </div>
        </HudPanel>
      )}

      <div className="space-y-2">
        {templates.map((t) => {
          const isOpen = expandedId === t.id;
          const course = courses.find((c) => c.id === t.course_id);
          return (
            <div key={t.id}>
              <button
                onClick={() => handleExpand(t)}
                className="w-full p-4 border border-valo-border bg-valo-panel hover:bg-valo-surface transition-colors text-left"
                style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-valo-text">{t.name}</p>
                    <p className="text-xs text-valo-muted font-mono">
                      {course?.name ?? "–"} · slug: {t.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-valo-muted">
                      {t.schema_json?.steps?.length ?? 0} pasos
                    </span>
                    {isOpen ? <ChevronUp size={14} className="text-valo-muted" /> : <ChevronDown size={14} className="text-valo-muted" />}
                  </div>
                </div>
              </button>

              {isOpen && form && (
                <HudPanel className="p-6 space-y-4 border-t-0">
                  <TemplateFormFields form={form} setForm={(fn) => setForm((prev) => prev ? fn(prev) : prev)} courses={courses} />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSave(t.id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 bg-valo-accent text-valo-bg font-mono text-xs font-bold hover:bg-valo-accent/90 transition-all"
                      style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
                    >
                      <Save size={12} />
                      {saving ? "GUARDANDO..." : savedId === t.id ? "GUARDADO ✓" : "GUARDAR"}
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-valo-red/30 font-mono text-xs text-valo-red hover:bg-valo-red/10 transition-all"
                      style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
                    >
                      <Trash2 size={12} /> ELIMINAR
                    </button>
                  </div>
                </HudPanel>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TemplateFormFields({
  form, setForm, courses,
}: {
  form: TemplateForm;
  setForm: (fn: (f: TemplateForm) => TemplateForm) => void;
  courses: Course[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="font-mono text-xs text-valo-muted">NOMBRE</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="admin-input w-full"
            placeholder="Ej: Ecuación Lineal"
          />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-xs text-valo-muted">SLUG</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="admin-input w-full"
            placeholder="Ej: algebra-ecuacion-lineal"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-mono text-xs text-valo-muted">CURSO</label>
        <select
          value={form.courseId}
          onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
          className="admin-input w-full"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-xs text-valo-muted">PASOS DEL ESQUEMA</p>
        {form.steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={s}
              onChange={(e) => setForm((f) => ({ ...f, steps: f.steps.map((x, j) => (j === i ? e.target.value : x)) }))}
              placeholder={`Paso ${i + 1}...`}
              className="admin-input flex-1"
            />
            <button onClick={() => setForm((f) => ({ ...f, steps: f.steps.filter((_, j) => j !== i) }))}
              className="text-valo-muted hover:text-valo-red transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, ""] }))}
          className="flex items-center gap-1.5 text-valo-muted hover:text-valo-accent font-mono text-xs">
          <Plus size={11} /> + PASO
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="font-mono text-xs text-valo-muted">MIN. BLOQUES TEXTO</label>
          <input
            type="number"
            min={1}
            value={form.minTextBlocks}
            onChange={(e) => setForm((f) => ({ ...f, minTextBlocks: parseInt(e.target.value) || 2 }))}
            className="admin-input w-full"
          />
        </div>
        <div className="space-y-2 pt-4">
          {[
            { key: "requiresMath" as const, label: "Requiere Math" },
            { key: "requiresErrorCommon" as const, label: "Requiere Error Común" },
            { key: "requiresVerification" as const, label: "Requiere Verificación" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                className="accent-valo-accent"
              />
              <span className="font-mono text-xs text-valo-muted">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
