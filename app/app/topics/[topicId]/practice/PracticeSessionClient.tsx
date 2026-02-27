"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Question, OptionKey, Course, Unit, Topic, LearningKit } from "@/lib/types";
import { COURSE_COLORS, formatTime, masteryLabel } from "@/lib/utils";
import { validateExplanation, getBlocks } from "@/lib/qualityGate";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  WifiOff,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import HudPanel from "@/components/hud/HudPanel";

interface PageData {
  topic: Topic;
  unit: Unit;
  course: Course;
  questions: Question[];
  userId: string;
  currentMastery: number;
  learningKit: LearningKit | null;
}

const OPTIONS: OptionKey[] = ["A", "B", "C", "D", "E"];

// ─── Error State ────────────────────────────────────────────────────────────
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div
        className="p-10 border border-valo-red/30 bg-valo-red/5"
        style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}
      >
        <WifiOff size={32} className="text-valo-red mx-auto mb-4" />
        <h2 className="text-xl font-bold text-valo-text mb-2">Error al cargar</h2>
        <p className="text-valo-muted text-sm font-mono mb-6">
          No se pudieron cargar las preguntas. Verifica tu conexión e intenta de nuevo.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text hover:border-valo-red/40 transition-all"
          style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
        >
          <RotateCcw size={12} /> REINTENTAR
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-valo-surface rounded" />
        <div className="h-4 w-16 bg-valo-surface rounded" />
      </div>
      <div className="w-full h-1 bg-valo-border" />
      <div className="h-3 w-48 bg-valo-surface rounded" />
      <div className="p-6 border border-valo-border bg-valo-panel space-y-4"
        style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}>
        <div className="h-4 w-20 bg-valo-border rounded" />
        <div className="space-y-2">
          <div className="h-4 bg-valo-surface rounded w-full" />
          <div className="h-4 bg-valo-surface rounded w-4/5" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-valo-surface border border-valo-border rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tutor Panel ────────────────────────────────────────────────────────────
function TutorPanel({
  question,
  learningKit,
  courseSlug,
  guidedMode,
  guidedStep,
  onToggleGuided,
  onNextStep,
}: {
  question: Question;
  learningKit: LearningKit | null;
  courseSlug: string;
  guidedMode: boolean;
  guidedStep: number;
  onToggleGuided: () => void;
  onNextStep: () => void;
}) {
  const exp = question.explanation_json;
  const blocks = getBlocks(exp);
  const hasBlocks = blocks.length > 0;
  const useFallback = !hasBlocks;

  const qualityResult = validateExplanation(exp, courseSlug, question.error_common, question.verification);

  const visibleBlocks = guidedMode ? blocks.slice(0, Math.max(1, guidedStep + 1)) : blocks;
  const allRevealed = !guidedMode || guidedStep >= blocks.length - 1;

  const errorText = question.error_common ?? exp?.error_common ?? exp?.error_comun;
  const verificationText = question.verification ?? exp?.verification ?? exp?.verificacion;

  return (
    <div className="space-y-3">
      {/* Quality Gate badge */}
      {qualityResult.needsReview && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 border border-valo-gold/30 bg-valo-gold/5 font-mono text-xs text-valo-gold"
          style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
        >
          <AlertTriangle size={11} />
          REVISIÓN PENDIENTE — {qualityResult.issues.join(" · ")}
        </motion.div>
      )}

      <HudPanel className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <BookOpen size={13} className="text-valo-accent" />
            <span className="font-mono text-xs text-valo-accent tracking-widest">
              {useFallback ? "GUÍA DEL TEMA" : "SOLUCIÓN PASO A PASO"}
            </span>
            {useFallback && (
              <span className="font-mono text-xs text-valo-muted">(explicación específica pendiente)</span>
            )}
          </div>
          {!useFallback && blocks.length > 1 && (
            <button
              onClick={onToggleGuided}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text hover:border-valo-accent/30 transition-all"
              style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}
            >
              {guidedMode ? <Eye size={10} /> : <EyeOff size={10} />}
              {guidedMode ? "VER TODO" : "GUIADO"}
            </button>
          )}
        </div>

        {/* Content */}
        {!useFallback ? (
          <div className="space-y-3">
            <AnimatePresence>
              {visibleBlocks.map((block, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: guidedMode ? 0 : i * 0.06 }}
                >
                  {block.type === "text" ? (
                    <div className="flex gap-3">
                      <div
                        className="flex-shrink-0 w-5 h-5 border border-valo-accent/40 bg-valo-accent/10 flex items-center justify-center font-mono text-xs text-valo-accent mt-0.5"
                        style={{ clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)" }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-valo-text text-sm leading-relaxed">{block.content}</p>
                    </div>
                  ) : (
                    <div
                      className="flex gap-3 items-start p-3 border border-valo-accent/20 bg-valo-accent/5"
                      style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
                    >
                      <div
                        className="flex-shrink-0 w-5 h-5 border border-valo-accent/40 bg-valo-accent/10 flex items-center justify-center font-mono text-xs text-valo-accent mt-0.5"
                        style={{ clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)" }}
                      >
                        {i + 1}
                      </div>
                      <code className="font-mono text-sm text-valo-accent break-all">{block.latex}</code>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {guidedMode && !allRevealed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onNextStep}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2 px-3 py-1.5 border border-valo-accent/30 bg-valo-accent/10 font-mono text-xs text-valo-accent transition-all"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
              >
                <ChevronRight size={12} />
                SIGUIENTE PASO ({guidedStep + 1}/{blocks.length})
              </motion.button>
            )}
          </div>
        ) : learningKit ? (
          <div className="space-y-4">
            {(learningKit.summary_json?.bullets?.length ?? 0) > 0 && (
              <div>
                <p className="font-mono text-xs text-valo-muted tracking-widest mb-2">TEORÍA</p>
                <ul className="space-y-1">
                  {learningKit.summary_json.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-valo-text">
                      <span className="text-valo-accent mt-0.5 flex-shrink-0">›</span>
                      {b}
                    </li>
                  ))}
                </ul>
                {(learningKit.summary_json.notes ?? []).map((n, i) => (
                  <p key={i} className="text-xs text-valo-muted mt-2 italic">{n}</p>
                ))}
              </div>
            )}
            {(learningKit.methods_json?.methods?.length ?? 0) > 0 && (
              <div>
                <p className="font-mono text-xs text-valo-muted tracking-widest mb-2">MÉTODOS</p>
                {learningKit.methods_json.methods.map((m, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-sm font-semibold text-valo-text mb-1">{m.name}</p>
                    {m.when_to_use && (
                      <p className="text-xs text-valo-muted font-mono mb-1">
                        Cuándo usarlo: {m.when_to_use}
                      </p>
                    )}
                    <ol className="space-y-0.5">
                      {m.steps.map((step, j) => (
                        <li key={j} className="flex gap-2 text-sm text-valo-text">
                          <span className="font-mono text-xs text-valo-muted mt-0.5 flex-shrink-0">{j + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-valo-muted text-sm font-mono">Pendiente de solucionario.</p>
        )}

        {/* Error común */}
        {(errorText || (useFallback && (learningKit?.common_mistakes_json?.mistakes?.length ?? 0) > 0)) && (
          <>
            <div className="hud-divider" />
            <div className="flex items-start gap-2">
              <AlertTriangle size={13} className="text-valo-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-valo-gold tracking-widest mb-1">ERROR COMÚN</p>
                {errorText ? (
                  <p className="text-valo-muted text-sm leading-relaxed">{errorText}</p>
                ) : (
                  <div className="space-y-1.5">
                    {learningKit!.common_mistakes_json.mistakes.map((m, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-valo-red">{m.mistake}</span>
                        <span className="text-valo-muted"> → </span>
                        <span className="text-valo-text">{m.fix}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Verificación */}
        {(verificationText || (useFallback && (learningKit?.verification_json?.checks?.length ?? 0) > 0)) && (
          <>
            <div className="hud-divider" />
            <div className="flex items-start gap-2">
              <ShieldCheck size={13} className="text-valo-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-valo-green tracking-widest mb-1">VERIFICACIÓN</p>
                {verificationText ? (
                  <p className="text-valo-muted text-sm leading-relaxed">{verificationText}</p>
                ) : (
                  <ul className="space-y-0.5">
                    {learningKit!.verification_json.checks.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-valo-text">
                        <span className="text-valo-green flex-shrink-0">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </HudPanel>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PracticeSessionClient() {
  const { topicId } = useParams<{ topicId: string }>();
  const supabase = createClient();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [shuffled, setShuffled] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, times: [] as number[] });
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [latestMastery, setLatestMastery] = useState(0);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // Tutor Engine states
  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [practiceLimit, setPracticeLimit] = useState<number | null>(null);

  // Load page data
  useEffect(() => {
    if (!topicId) return;
    setError(false);
    async function load() {
      try {
        const [{ data: { user } }, { data: topic }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from("topics").select("*, units(*, courses(*))").eq("id", topicId).single(),
        ]);
        if (!user || !topic) return;

        const [{ data: questions }, { data: mastery }, { data: kit }] = await Promise.all([
          supabase.from("questions").select("*").eq("topic_id", topicId).order("created_at"),
          supabase.from("mastery")
            .select("mastery_score")
            .eq("user_id", user.id)
            .eq("topic_id", topicId)
            .single(),
          supabase.from("learning_kits")
            .select("*")
            .eq("topic_id", topicId)
            .single(),
        ]);

        setPageData({
          topic,
          unit: (topic as any).units,
          course: (topic as any).units?.courses,
          questions: questions ?? [],
          userId: user.id,
          currentMastery: mastery?.mastery_score ?? 0,
          learningKit: kit ?? null,
        });
      } catch {
        setError(true);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, retryCount]);

  // Shuffle questions once data loads
  useEffect(() => {
    if (!pageData) return;
    let q = [...pageData.questions].sort(() => Math.random() - 0.5);
    if (practiceLimit) q = q.slice(0, practiceLimit);
    setShuffled(q);
    setStartTime(Date.now());
    setLatestMastery(pageData.currentMastery);
  }, [pageData, practiceLimit]);

  // Timer
  useEffect(() => {
    if (revealed || !shuffled.length) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, revealed, shuffled.length]);

  const currentQ = shuffled[currentIdx];

  const handleSelect = useCallback(
    async (opt: OptionKey) => {
      if (revealed || submitting || !pageData) return;
      setSelected(opt);
      setRevealed(true);
      setGuidedStep(0);
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);
      const isCorrect = opt === currentQ.correct_option;

      setSessionStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        times: [...prev.times, elapsed],
      }));

      setSubmitting(true);
      try {
        await supabase.from("attempts").insert({
          user_id: pageData.userId,
          question_id: currentQ.id,
          selected_option: opt,
          is_correct: isCorrect,
          time_ms: elapsed,
        });
        const { data } = await supabase
          .from("mastery")
          .select("mastery_score")
          .eq("user_id", pageData.userId)
          .eq("topic_id", pageData.topic.id)
          .single();
        if (data) setLatestMastery(data.mastery_score);
      } catch {
        // silent — attempt saved optimistically in UI
      } finally {
        setSubmitting(false);
      }
    },
    [revealed, submitting, currentQ, startTime, supabase, pageData]
  );

  const handleNext = useCallback(() => {
    setGuidedMode(false);
    setGuidedStep(0);
    if (currentIdx + 1 >= shuffled.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      setStartTime(Date.now());
      setElapsedMs(0);
    }
  }, [currentIdx, shuffled.length]);

  const handleRestart = (limit?: number) => {
    if (!pageData) return;
    setPracticeLimit(limit ?? null);
    setCurrentIdx(0);
    setSelected(null);
    setRevealed(false);
    setGuidedMode(false);
    setGuidedStep(0);
    setStartTime(Date.now());
    setElapsedMs(0);
    setSessionStats({ correct: 0, total: 0, times: [] });
    setFinished(false);
    // shuffled will be re-set by the practiceLimit useEffect
    let q = [...pageData.questions].sort(() => Math.random() - 0.5);
    if (limit) q = q.slice(0, limit);
    setShuffled(q);
  };

  if (error) return <ErrorState onRetry={() => { setPageData(null); setRetryCount((c) => c + 1); }} />;
  if (!pageData || (!shuffled.length && !pageData.questions.length)) return <Skeleton />;

  const { topic, unit, course } = pageData;
  const colors = COURSE_COLORS[course?.slug ?? "algebra"] ?? COURSE_COLORS["algebra"];

  if (!shuffled.length) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <HudPanel className="p-10">
          <BookOpen size={32} className="text-valo-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-valo-text mb-2">Sin preguntas disponibles</h2>
          <p className="text-valo-muted text-sm font-mono">
            Este subtema aún no tiene preguntas cargadas.
          </p>
          <Link
            href={`/app/courses/${course?.slug}`}
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text transition-colors"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
          >
            <ChevronLeft size={12} /> VOLVER AL CURSO
          </Link>
        </HudPanel>
      </div>
    );
  }

  if (finished) {
    const accuracy = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;
    const avgTime = sessionStats.times.length > 0
      ? Math.round(sessionStats.times.reduce((a, b) => a + b, 0) / sessionStats.times.length)
      : 0;

    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <HudPanel className="p-8 text-center" accent>
            <div className="mb-6">
              <h2 className="font-mono text-xs tracking-widest text-valo-muted mb-3">
                SESIÓN COMPLETADA
              </h2>
              <h1 className="text-4xl font-black text-valo-text">
                {accuracy >= 80 ? "EXCELENTE" : accuracy >= 60 ? "BIEN HECHO" : "SIGUE ENTRENANDO"}
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-4 my-8">
              {[
                { label: "PRECISIÓN", value: `${accuracy}%`, color: accuracy >= 70 ? "#39d264" : accuracy >= 50 ? "#f5a623" : "#ff4655" },
                { label: "RESPONDIDAS", value: sessionStats.total, color: colors.accent },
                { label: "TIEMPO PROM.", value: formatTime(avgTime), color: "#f5a623" },
              ].map((s) => (
                <div key={s.label} className="p-4 border border-valo-border bg-valo-surface"
                  style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                  <div className="font-mono text-xs text-valo-muted mb-1">{s.label}</div>
                  <div className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mb-6 p-4 border border-valo-border bg-valo-surface"
              style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
              <p className="font-mono text-xs text-valo-muted mb-1">DOMINIO DEL SUBTEMA</p>
              <p className="text-lg font-black font-mono" style={{ color: colors.accent }}>
                {Math.round(latestMastery * 100)}% — {masteryLabel(latestMastery)}
              </p>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => handleRestart(3)}
                className="flex items-center gap-2 px-4 py-2.5 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text hover:border-valo-accent/30 transition-all"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
              >
                <Layers size={12} /> 3 SIMILARES
              </button>
              <button
                onClick={() => handleRestart()}
                className="flex items-center gap-2 px-4 py-2.5 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text hover:border-valo-accent/30 transition-all"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
              >
                <RotateCcw size={12} /> REINTENTAR
              </button>
              <Link href={`/app/courses/${course?.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-valo-accent text-valo-bg font-mono text-xs font-bold hover:bg-valo-accent/90 transition-all"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                <ArrowRight size={12} /> VER CURSO
              </Link>
            </div>
          </HudPanel>
        </motion.div>
      </div>
    );
  }

  const isCorrect = revealed && selected === currentQ.correct_option;
  const progressPct = ((currentIdx + (revealed ? 1 : 0)) / shuffled.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Breadcrumb + progress */}
      <div className="flex items-center justify-between">
        <Link
          href={`/app/courses/${course?.slug}`}
          className="flex items-center gap-1.5 font-mono text-xs text-valo-muted hover:text-valo-text transition-colors"
        >
          <ChevronLeft size={12} />
          {course?.name}
        </Link>
        <div className="flex items-center gap-3">
          {!revealed && (
            <div className="flex items-center gap-1.5 font-mono text-xs text-valo-muted">
              <Clock size={12} />
              {formatTime(elapsedMs)}
            </div>
          )}
          <span className="font-mono text-xs text-valo-muted">
            {currentIdx + 1} / {shuffled.length}
            {practiceLimit && ` (modo ${practiceLimit})`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-valo-border overflow-hidden">
        <motion.div
          className="h-full"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: colors.accent }}
        />
      </div>

      {/* Topic label */}
      <div className="font-mono text-xs text-valo-muted-2">
        <span className="text-valo-muted">{unit?.name}</span>
        <span className="mx-2 text-valo-muted-2">›</span>
        {topic.name}
        {latestMastery > 0 && (
          <span className="ml-3" style={{ color: latestMastery >= 0.8 ? "#39d264" : "#f5a623" }}>
            [{Math.round(latestMastery * 100)}% dominio]
          </span>
        )}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <HudPanel className="p-6 space-y-5" accent>
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-xs px-2 py-0.5 border tracking-widest"
                style={{
                  color: currentQ.difficulty === "easy" ? "#39d264" : currentQ.difficulty === "medium" ? "#f5a623" : "#ff4655",
                  borderColor: currentQ.difficulty === "easy" ? "#39d264" : currentQ.difficulty === "medium" ? "#f5a623" : "#ff4655",
                  clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)",
                  backgroundColor: currentQ.difficulty === "easy" ? "#39d26411" : currentQ.difficulty === "medium" ? "#f5a62311" : "#ff465511",
                }}
              >
                {currentQ.difficulty === "easy" ? "BÁSICO" : currentQ.difficulty === "medium" ? "INTERMEDIO" : "AVANZADO"}
              </span>
              {revealed && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 font-mono text-xs"
                  style={{ color: isCorrect ? "#39d264" : "#ff4655" }}
                >
                  {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {isCorrect ? "CORRECTO" : "INCORRECTO"}
                  <span className="text-valo-muted ml-1">· {formatTime(elapsedMs)}</span>
                </motion.div>
              )}
            </div>

            <p className="text-valo-text text-base leading-relaxed font-sans whitespace-pre-wrap">
              {currentQ.prompt_text}
            </p>

            <div className="space-y-2">
              {OPTIONS.map((opt) => {
                const optText = currentQ.options_json[opt];
                if (!optText) return null;

                const isSelected = selected === opt;
                const isAnswer = opt === currentQ.correct_option;

                let btnClass = "option-btn";
                if (revealed) {
                  if (isAnswer) btnClass += " correct";
                  else if (isSelected && !isAnswer) btnClass += " incorrect";
                } else if (isSelected) {
                  btnClass += " selected";
                }

                return (
                  <motion.button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={revealed}
                    className={btnClass}
                    whileHover={!revealed ? { x: 2 } : {}}
                    whileTap={!revealed ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 border flex items-center justify-center font-mono text-xs font-bold"
                        style={{
                          borderColor: revealed && isAnswer ? "#39d264" : revealed && isSelected && !isAnswer ? "#ff4655" : "inherit",
                          color: revealed && isAnswer ? "#39d264" : revealed && isSelected && !isAnswer ? "#ff4655" : "inherit",
                          clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)",
                        }}
                      >
                        {opt}
                      </span>
                      <span className="text-sm leading-relaxed">{optText}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </HudPanel>
        </motion.div>
      </AnimatePresence>

      {/* Tutor Engine — revealed */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Result feedback bar */}
            <div
              className="px-4 py-3 border font-mono text-sm flex items-center gap-2"
              style={{
                clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)",
                borderColor: isCorrect ? "#39d264" : "#ff4655",
                backgroundColor: isCorrect ? "#39d26411" : "#ff465511",
                color: isCorrect ? "#39d264" : "#ff4655",
              }}
            >
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect
                ? `¡Correcto! La respuesta es (${currentQ.correct_option}).`
                : `Incorrecto. La respuesta correcta es (${currentQ.correct_option}).`}
            </div>

            {/* Tutor Panel */}
            <TutorPanel
              question={currentQ}
              learningKit={pageData.learningKit}
              courseSlug={course?.slug ?? ""}
              guidedMode={guidedMode}
              guidedStep={guidedStep}
              onToggleGuided={() => { setGuidedMode((m) => !m); setGuidedStep(0); }}
              onNextStep={() => setGuidedStep((s) => s + 1)}
            />

            {/* Session stats + action buttons */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-valo-muted">
                  {sessionStats.total > 0 && (
                    <>
                      {sessionStats.correct}/{sessionStats.total} ({Math.round((sessionStats.correct / sessionStats.total) * 100)}%)
                    </>
                  )}
                </span>
                {pageData.questions.length > 3 && (
                  <button
                    onClick={() => handleRestart(3)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text hover:border-valo-accent/30 transition-all"
                    style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}
                  >
                    <Layers size={11} /> 3 SIMILARES
                  </button>
                )}
              </div>

              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-bold tracking-widest"
                style={{
                  backgroundColor: colors.accent,
                  color: "#0a0e14",
                  clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)",
                }}
              >
                {currentIdx + 1 >= shuffled.length ? "VER RESULTADO" : "SIGUIENTE"}
                <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
