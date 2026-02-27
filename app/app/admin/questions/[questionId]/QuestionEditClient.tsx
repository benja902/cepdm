"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ExplanationBlock, SolutionTemplate } from "@/lib/types";
import { validateExplanation } from "@/lib/qualityGate";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  RotateCcw,
} from "lucide-react";
import HudPanel from "@/components/hud/HudPanel";

interface QuestionData {
  id: string;
  prompt_text: string;
  correct_option: string;
  difficulty: string;
  explanation_json: { blocks?: ExplanationBlock[]; text?: string; error_common?: string; verification?: string; error_comun?: string; verificacion?: string } | null;
  error_common: string | null;
  verification: string | null;
  topicName: string;
  unitName: string;
  courseName: string;
  courseSlug: string;
}

export default function QuestionEditClient() {
  const { questionId } = useParams<{ questionId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [templates, setTemplates] = useState<SolutionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [blocks, setBlocks] = useState<ExplanationBlock[]>([]);
  const [errorCommon, setErrorCommon] = useState("");
  const [verification, setVerification] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [skillTagsRaw, setSkillTagsRaw] = useState("");
  const [trapTagsRaw, setTrapTagsRaw] = useState("");

  useEffect(() => {
    if (!questionId) return;
    setError(false);
    setLoading(true);
    async function load() {
      try {
        const [{ data: q }, { data: meta }, { data: tmpl }] = await Promise.all([
          supabase
            .from("questions")
            .select("*, topics(name, units(name, courses(name, slug)))")
            .eq("id", questionId)
            .single(),
          supabase
            .from("question_solution_meta")
            .select("*")
            .eq("question_id", questionId)
            .single(),
          supabase.from("solution_templates").select("*").order("created_at"),
        ]);

        if (!q) { setError(true); return; }

        const qd: QuestionData = {
          id: q.id,
          prompt_text: q.prompt_text,
          correct_option: q.correct_option,
          difficulty: q.difficulty,
          explanation_json: q.explanation_json,
          error_common: q.error_common,
          verification: q.verification,
          topicName: (q as any).topics?.name ?? "–",
          unitName: (q as any).topics?.units?.name ?? "–",
          courseName: (q as any).topics?.units?.courses?.name ?? "–",
          courseSlug: (q as any).topics?.units?.courses?.slug ?? "",
        };

        setQuestion(qd);
        setBlocks(q.explanation_json?.blocks ?? (q.explanation_json?.text ? [{ type: "text", content: q.explanation_json.text }] : []));
        setErrorCommon(q.error_common ?? q.explanation_json?.error_common ?? q.explanation_json?.error_comun ?? "");
        setVerification(q.verification ?? q.explanation_json?.verification ?? q.explanation_json?.verificacion ?? "");
        setTemplateId(meta?.template_id ?? "");
        setSkillTagsRaw((meta?.skill_tags ?? []).join(", "));
        setTrapTagsRaw((meta?.trap_tags ?? []).join(", "));
        setTemplates(tmpl ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, retryCount]);

  const handleSave = useCallback(async () => {
    if (!question) return;
    setSaving(true);
    try {
      // Build new explanation_json preserving other fields
      const newExplanationJson = {
        ...(question.explanation_json ?? {}),
        blocks,
        // Remove old text field if blocks are present
        text: blocks.length > 0 ? undefined : (question.explanation_json?.text ?? undefined),
      };

      const skillTags = skillTagsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      const trapTags = trapTagsRaw.split(",").map((s) => s.trim()).filter(Boolean);

      const [qResult, metaResult] = await Promise.all([
        supabase.from("questions").update({
          explanation_json: newExplanationJson,
          error_common: errorCommon || null,
          verification: verification || null,
        }).eq("id", question.id),
        supabase.from("question_solution_meta").upsert({
          question_id: question.id,
          template_id: templateId || null,
          skill_tags: skillTags,
          trap_tags: trapTags,
          updated_at: new Date().toISOString(),
        }, { onConflict: "question_id" }),
      ]);

      if (qResult.error) throw qResult.error;
      if (metaResult.error) throw metaResult.error;

      setQuestion((prev) => prev ? {
        ...prev,
        explanation_json: newExplanationJson as any,
        error_common: errorCommon || null,
        verification: verification || null,
      } : prev);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      //
    } finally {
      setSaving(false);
    }
  }, [question, blocks, errorCommon, verification, templateId, skillTagsRaw, trapTagsRaw, supabase]);

  const addBlock = (type: "text" | "math") => {
    setBlocks((prev) => [...prev, type === "text" ? { type: "text", content: "" } : { type: "math", latex: "" }]);
  };

  const updateBlock = (i: number, val: string) => {
    setBlocks((prev) =>
      prev.map((b, j) => j === i ? (b.type === "text" ? { ...b, content: val } : { ...b, latex: val }) : b)
    );
  };

  const removeBlock = (i: number) => setBlocks((prev) => prev.filter((_, j) => j !== i));
  const moveBlock = (i: number, dir: -1 | 1) => {
    const ni = i + dir;
    if (ni < 0 || ni >= blocks.length) return;
    setBlocks((prev) => {
      const arr = [...prev];
      [arr[i], arr[ni]] = [arr[ni], arr[i]];
      return arr;
    });
  };

  const qualityResult = validateExplanation(
    { blocks, error_common: errorCommon },
    question?.courseSlug ?? "",
    errorCommon,
    verification
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-valo-surface rounded" />
        <div className="h-32 bg-valo-surface border border-valo-border rounded" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-valo-surface border border-valo-border" />)}
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <WifiOff size={32} className="text-valo-red mx-auto mb-4" />
        <p className="text-valo-muted text-sm font-mono mb-4">No se pudo cargar la pregunta</p>
        <button onClick={() => setRetryCount((c) => c + 1)}
          className="flex items-center gap-2 mx-auto px-4 py-2 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text">
          <RotateCcw size={12} /> REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/admin/questions"
          className="flex items-center gap-1.5 font-mono text-xs text-valo-muted hover:text-valo-text">
          <ChevronLeft size={12} /> PREGUNTAS
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-valo-muted tracking-widest">
            {question.courseName} › {question.unitName} › {question.topicName}
          </p>
          <h1 className="text-lg font-black text-valo-text truncate">{question.prompt_text}</h1>
        </div>
      </div>

      {/* Quality Gate */}
      <div
        className={`px-4 py-3 border font-mono text-xs flex items-start gap-2 ${qualityResult.valid ? "border-valo-green/30 bg-valo-green/5 text-valo-green" : "border-valo-gold/30 bg-valo-gold/5 text-valo-gold"}`}
        style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
      >
        {qualityResult.valid ? <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />}
        {qualityResult.valid ? "EXPLICACIÓN COMPLETA" : `PENDIENTE: ${qualityResult.issues.join(" · ")}`}
      </div>

      {/* Explanation blocks */}
      <HudPanel className="p-5 space-y-4">
        <p className="font-mono text-xs text-valo-accent tracking-widest">BLOQUES DE EXPLICACIÓN</p>

        {blocks.length === 0 && (
          <p className="text-valo-muted text-sm font-mono">Sin bloques. Añade bloques abajo.</p>
        )}

        {blocks.map((block, i) => (
          <div key={i}
            className="p-4 border border-valo-border space-y-2"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
          >
            <div className="flex items-center justify-between">
              <span className={`font-mono text-xs px-2 py-0.5 border ${block.type === "text" ? "border-valo-accent/30 text-valo-accent" : "border-valo-gold/30 text-valo-gold"}`}
                style={{ clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)" }}>
                {block.type === "text" ? "TEXTO" : "MATH"}
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => moveBlock(i, -1)} disabled={i === 0}
                  className="text-valo-muted hover:text-valo-text disabled:opacity-30 transition-colors">
                  <ArrowUp size={12} />
                </button>
                <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}
                  className="text-valo-muted hover:text-valo-text disabled:opacity-30 transition-colors">
                  <ArrowDown size={12} />
                </button>
                <button onClick={() => removeBlock(i)} className="text-valo-muted hover:text-valo-red transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            {block.type === "text" ? (
              <textarea
                value={block.content ?? ""}
                onChange={(e) => updateBlock(i, e.target.value)}
                placeholder="Texto del paso..."
                rows={3}
                className="admin-input w-full resize-y"
              />
            ) : (
              <input
                value={block.latex ?? ""}
                onChange={(e) => updateBlock(i, e.target.value)}
                placeholder="LaTeX (ej: x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a})"
                className="admin-input w-full font-mono"
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button onClick={() => addBlock("text")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-valo-accent/30 font-mono text-xs text-valo-accent hover:bg-valo-accent/10 transition-all"
            style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}>
            <Plus size={11} /> + TEXTO
          </button>
          <button onClick={() => addBlock("math")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-valo-gold/30 font-mono text-xs text-valo-gold hover:bg-valo-gold/10 transition-all"
            style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}>
            <Plus size={11} /> + MATH
          </button>
        </div>
      </HudPanel>

      {/* Error común + verificación */}
      <HudPanel className="p-5 space-y-4">
        <p className="font-mono text-xs text-valo-accent tracking-widest">ERROR COMÚN & VERIFICACIÓN</p>
        <div className="space-y-1">
          <label className="font-mono text-xs text-valo-gold">ERROR COMÚN</label>
          <textarea
            value={errorCommon}
            onChange={(e) => setErrorCommon(e.target.value)}
            placeholder="Describe el error más frecuente al resolver este tipo de pregunta..."
            rows={2}
            className="admin-input w-full resize-y"
          />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-xs text-valo-green">VERIFICACIÓN</label>
          <textarea
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            placeholder="¿Cómo verificar que la respuesta es correcta?..."
            rows={2}
            className="admin-input w-full resize-y"
          />
        </div>
      </HudPanel>

      {/* Template + tags */}
      <HudPanel className="p-5 space-y-4">
        <p className="font-mono text-xs text-valo-accent tracking-widest">METADATOS</p>
        <div className="space-y-1">
          <label className="font-mono text-xs text-valo-muted">PLANTILLA DE SOLUCIÓN</label>
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="admin-input w-full">
            <option value="">– Sin plantilla –</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-valo-muted">SKILL TAGS (separados por coma)</label>
            <input
              value={skillTagsRaw}
              onChange={(e) => setSkillTagsRaw(e.target.value)}
              placeholder="Ej: factorizar, binomio"
              className="admin-input w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-xs text-valo-muted">TRAP TAGS (separados por coma)</label>
            <input
              value={trapTagsRaw}
              onChange={(e) => setTrapTagsRaw(e.target.value)}
              placeholder="Ej: signo-error, orden"
              className="admin-input w-full"
            />
          </div>
        </div>
      </HudPanel>

      {/* Save */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="font-mono text-xs text-valo-muted hover:text-valo-text transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-valo-accent text-valo-bg font-mono text-xs font-bold hover:bg-valo-accent/90 transition-all disabled:opacity-50"
          style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
        >
          <Save size={13} />
          {saving ? "GUARDANDO..." : saved ? "GUARDADO ✓" : "GUARDAR CAMBIOS"}
        </button>
      </div>
    </div>
  );
}
