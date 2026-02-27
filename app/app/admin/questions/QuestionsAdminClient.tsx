"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, WifiOff, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import HudPanel from "@/components/hud/HudPanel";

interface QuestionRow {
  id: string;
  prompt: string;
  difficulty: string;
  topicName: string;
  unitName: string;
  courseName: string;
  hasBlocks: boolean;
  hasErrorCommon: boolean;
  hasVerification: boolean;
}

export default function QuestionsAdminClient() {
  const supabase = createClient();
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "incomplete">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setError(false);
    setLoading(true);
    async function load() {
      try {
        const { data, error: err } = await supabase
          .from("questions")
          .select("id, prompt_text, difficulty, explanation_json, error_common, verification, topics(name, units(name, courses(name)))")
          .order("created_at");
        if (err) throw err;

        const rows: QuestionRow[] = (data ?? []).map((q: any) => ({
          id: q.id,
          prompt: q.prompt_text,
          difficulty: q.difficulty,
          topicName: q.topics?.name ?? "–",
          unitName: q.topics?.units?.name ?? "–",
          courseName: q.topics?.units?.courses?.name ?? "–",
          hasBlocks: !!(q.explanation_json?.blocks?.length > 0 || q.explanation_json?.text),
          hasErrorCommon: !!(q.error_common?.trim() || q.explanation_json?.error_common?.trim() || q.explanation_json?.error_comun?.trim()),
          hasVerification: !!(q.verification?.trim() || q.explanation_json?.verification?.trim() || q.explanation_json?.verificacion?.trim()),
        }));

        setQuestions(rows);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-2 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-valo-surface border border-valo-border" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <WifiOff size={32} className="text-valo-red mx-auto mb-4" />
        <p className="text-valo-muted text-sm font-mono mb-4">Error al cargar</p>
        <button onClick={() => setRetryCount((c) => c + 1)}
          className="flex items-center gap-2 mx-auto px-4 py-2 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text">
          <RotateCcw size={12} /> REINTENTAR
        </button>
      </div>
    );
  }

  const filtered = questions
    .filter((q) => {
      if (filter === "incomplete") return !q.hasBlocks || !q.hasErrorCommon || !q.hasVerification;
      return true;
    })
    .filter((q) =>
      !search || q.prompt.toLowerCase().includes(search.toLowerCase()) || q.topicName.toLowerCase().includes(search.toLowerCase())
    );

  const incomplete = questions.filter((q) => !q.hasBlocks || !q.hasErrorCommon || !q.hasVerification).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/admin" className="flex items-center gap-1.5 font-mono text-xs text-valo-muted hover:text-valo-text">
          <ChevronLeft size={12} /> ADMIN
        </Link>
        <div>
          <p className="font-mono text-xs text-valo-muted tracking-widest">// QUESTIONS_EDITOR</p>
          <h1 className="text-2xl font-black text-valo-text">PREGUNTAS</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pregunta o subtema..."
          className="admin-input flex-1 min-w-48"
        />
        <div className="flex gap-2">
          {(["all", "incomplete"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-mono text-xs border transition-all ${filter === f ? "border-valo-accent text-valo-accent bg-valo-accent/10" : "border-valo-border text-valo-muted"}`}
              style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}
            >
              {f === "all" ? `TODAS (${questions.length})` : `INCOMPLETAS (${incomplete})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {filtered.map((q) => (
          <Link
            key={q.id}
            href={`/app/admin/questions/${q.id}`}
            className="block p-4 border border-valo-border bg-valo-panel hover:bg-valo-surface transition-colors"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-valo-text truncate">{q.prompt}</p>
                <p className="text-xs text-valo-muted font-mono mt-0.5">
                  {q.courseName} › {q.unitName} › {q.topicName}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="font-mono text-xs"
                  style={{
                    color: q.difficulty === "easy" ? "#39d264" : q.difficulty === "medium" ? "#f5a623" : "#ff4655",
                  }}
                >
                  {q.difficulty === "easy" ? "BÁSICO" : q.difficulty === "medium" ? "MEDIO" : "AVANZ."}
                </span>
                <div className="flex items-center gap-1.5">
                  {q.hasBlocks ? <CheckCircle2 size={12} className="text-valo-green" /> : <AlertTriangle size={12} className="text-valo-gold" />}
                  {q.hasErrorCommon ? <CheckCircle2 size={12} className="text-valo-green" /> : <AlertTriangle size={12} className="text-valo-gold" />}
                  {q.hasVerification ? <CheckCircle2 size={12} className="text-valo-green" /> : <AlertTriangle size={12} className="text-valo-gold" />}
                </div>
                <ChevronRight size={14} className="text-valo-muted" />
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <HudPanel className="p-8 text-center">
            <p className="text-valo-muted text-sm font-mono">Sin preguntas que mostrar.</p>
          </HudPanel>
        )}
      </div>
    </div>
  );
}
