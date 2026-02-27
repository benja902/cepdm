"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Question, OptionKey, Course, Unit, Topic } from "@/lib/types";
import { COURSE_COLORS, formatTime, masteryLabel } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  Clock,
  AlertTriangle,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  WifiOff,
} from "lucide-react";
import HudPanel from "@/components/hud/HudPanel";

interface PageData {
  topic: Topic;
  unit: Unit;
  course: Course;
  questions: Question[];
  userId: string;
  currentMastery: number;
}

const OPTIONS: OptionKey[] = ["A", "B", "C", "D", "E"];

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

        const [{ data: questions }, { data: mastery }] = await Promise.all([
          supabase.from("questions").select("*").eq("topic_id", topicId).order("created_at"),
          supabase.from("mastery")
            .select("mastery_score")
            .eq("user_id", user.id)
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
    const q = [...pageData.questions].sort(() => Math.random() - 0.5);
    setShuffled(q);
    setStartTime(Date.now());
    setLatestMastery(pageData.currentMastery);
  }, [pageData]);

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
        // silent
      } finally {
        setSubmitting(false);
      }
    },
    [revealed, submitting, currentQ, startTime, supabase, pageData]
  );

  const handleNext = useCallback(() => {
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

  const handleRestart = () => {
    if (!pageData) return;
    const q = [...pageData.questions].sort(() => Math.random() - 0.5);
    setShuffled(q);
    setCurrentIdx(0);
    setSelected(null);
    setRevealed(false);
    setStartTime(Date.now());
    setElapsedMs(0);
    setSessionStats({ correct: 0, total: 0, times: [] });
    setFinished(false);
  };

  if (error) return <ErrorState onRetry={() => { setPageData(null); setRetryCount((c) => c + 1); }} />;
  if (!pageData || !shuffled.length && !pageData.questions.length) return <Skeleton />;

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

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text hover:border-valo-accent/30 transition-all"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
              >
                <RotateCcw size={12} /> REINTENTAR
              </button>
              <Link href={`/app/courses/${course?.slug}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-valo-accent text-valo-bg font-mono text-xs font-bold hover:bg-valo-accent/90 transition-all"
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

      {/* Tutor Engine */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
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

            <HudPanel className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={13} className="text-valo-accent" />
                  <span className="font-mono text-xs text-valo-accent tracking-widest">EXPLICACIÓN</span>
                </div>
                <p className="text-valo-text text-sm leading-relaxed">
                  {currentQ.explanation_json?.text ?? "Pendiente de solucionario."}
                </p>
              </div>

              {currentQ.explanation_json?.error_comun &&
                currentQ.explanation_json.error_comun !== "Pendiente de solucionario." && (
                  <div>
                    <div className="hud-divider mb-3" />
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} className="text-valo-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-mono text-xs text-valo-gold tracking-widest mb-1">ERROR COMÚN</p>
                        <p className="text-valo-muted text-sm leading-relaxed">
                          {currentQ.explanation_json.error_comun}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {currentQ.explanation_json?.verificacion &&
                currentQ.explanation_json.verificacion !== "Pendiente de solucionario." && (
                  <div>
                    <div className="hud-divider mb-3" />
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={13} className="text-valo-green flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-mono text-xs text-valo-green tracking-widest mb-1">VERIFICACIÓN</p>
                        <p className="text-valo-muted text-sm leading-relaxed">
                          {currentQ.explanation_json.verificacion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </HudPanel>

            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs text-valo-muted">
                {sessionStats.total > 0 && (
                  <>
                    Sesión: {sessionStats.correct}/{sessionStats.total} correctas (
                    {Math.round((sessionStats.correct / sessionStats.total) * 100)}%)
                  </>
                )}
              </span>

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
