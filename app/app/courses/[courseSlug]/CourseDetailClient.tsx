"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COURSE_COLORS, COURSE_ICONS, masteryLabel } from "@/lib/utils";
import { Course } from "@/lib/types";
import { ChevronDown, Play, WifiOff, RotateCcw } from "lucide-react";

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
          No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.
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

interface PageData {
  course: Course;
  units: any[];
  masteryMap: Record<string, number>;
  questionCountMap: Record<string, number>;
}

function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="p-6 border border-valo-border bg-valo-panel h-28"
        style={{ clipPath: "polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)" }}>
        <div className="flex gap-5 items-center">
          <div className="w-16 h-16 bg-valo-surface flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-valo-border rounded" />
            <div className="h-7 w-48 bg-valo-surface rounded" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-valo-panel border border-valo-border"
            style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }} />
        ))}
      </div>
    </div>
  );
}

export default function CourseDetailClient() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const [data, setData] = useState<PageData | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!courseSlug) return;
    setError(false);
    async function load() {
      try {
        const supabase = createClient();

        const [{ data: { user } }, { data: course }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from("courses").select("*").eq("slug", courseSlug).single(),
        ]);

        if (!course) return;

        const [{ data: units }, { data: qCounts }] = await Promise.all([
          supabase.from("units").select("*, topics(*)").eq("course_id", course.id).order("order"),
          supabase.from("questions").select("topic_id").eq("course_id", course.id),
        ]);

        const unitsWithSortedTopics = (units ?? []).map((u) => ({
          ...u,
          topics: [...(u.topics ?? [])].sort((a: any, b: any) => a.order - b.order),
        }));

        const masteryMap: Record<string, number> = {};
        if (user) {
          const topicIds = unitsWithSortedTopics.flatMap((u) => u.topics.map((t: any) => t.id));
          if (topicIds.length > 0) {
            const { data: mastery } = await supabase
              .from("mastery")
              .select("topic_id, mastery_score")
              .eq("user_id", user.id)
              .in("topic_id", topicIds);
            for (const m of mastery ?? []) masteryMap[m.topic_id] = m.mastery_score;
          }
        }

        const questionCountMap: Record<string, number> = {};
        for (const q of qCounts ?? []) {
          questionCountMap[q.topic_id] = (questionCountMap[q.topic_id] ?? 0) + 1;
        }

        setExpandedUnits(new Set(unitsWithSortedTopics.slice(0, 1).map((u) => u.id)));
        setData({ course, units: unitsWithSortedTopics, masteryMap, questionCountMap });
      } catch {
        setError(true);
      }
    }
    load();
  }, [courseSlug, retryCount]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  if (error) return <ErrorState onRetry={() => setRetryCount((c) => c + 1)} />;
  if (!data) return <Skeleton />;

  const { course, units, masteryMap, questionCountMap } = data;
  const colors = COURSE_COLORS[course.slug] ?? COURSE_COLORS["algebra"];
  const icon = COURSE_ICONS[course.slug] ?? "?";

  const allTopicIds = units.flatMap((u) => u.topics.map((t: any) => t.id));
  const masteryValues = allTopicIds.map((id) => masteryMap[id]).filter((v) => v !== undefined);
  const courseAvgMastery =
    masteryValues.length > 0
      ? Math.round((masteryValues.reduce((s, v) => s + v, 0) / masteryValues.length) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Course header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 border"
        style={{
          clipPath: "polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)",
          borderColor: colors.border,
          background: `linear-gradient(135deg, ${colors.glow} 0%, transparent 50%)`,
          backgroundColor: "#131b24",
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 flex items-center justify-center font-mono font-black text-2xl border flex-shrink-0"
            style={{
              color: colors.accent,
              borderColor: colors.border,
              backgroundColor: `${colors.accent}11`,
              clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
            }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <p className="font-mono text-xs tracking-widest mb-1" style={{ color: colors.accent }}>
              MÓDULO {String(course.order).padStart(2, "0")} · {units.length} UNIDADES
            </p>
            <h1 className="text-3xl font-black text-valo-text">{course.name}</h1>
          </div>
          {courseAvgMastery > 0 && (
            <div className="text-right">
              <p className="font-mono text-xs text-valo-muted mb-1">DOMINIO</p>
              <p
                className="text-2xl font-black font-mono"
                style={{ color: courseAvgMastery >= 80 ? "#39d264" : courseAvgMastery >= 50 ? "#f5a623" : "#ff4655" }}
              >
                {courseAvgMastery}%
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Units list */}
      <div className="space-y-3">
        {units.map((unit, ui) => {
          const expanded = expandedUnits.has(unit.id);
          const unitTopicIds = unit.topics.map((t: any) => t.id);
          const unitMasteryVals = unitTopicIds
            .map((id: string) => masteryMap[id])
            .filter((v: number | undefined) => v !== undefined);
          const unitAvg =
            unitMasteryVals.length > 0
              ? Math.round(
                  (unitMasteryVals.reduce((s: number, v: number) => s + v, 0) / unitMasteryVals.length) * 100
                )
              : 0;

          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ui * 0.05 }}
            >
              <button onClick={() => toggleUnit(unit.id)} className="w-full text-left">
                <div
                  className="flex items-center justify-between p-4 border bg-valo-panel hover:bg-valo-surface transition-colors group"
                  style={{
                    clipPath: expanded
                      ? "polygon(8px 0,100% 0,100% 100%,0 100%,0 8px)"
                      : "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)",
                    borderColor: expanded ? colors.border : "var(--valo-border, #1e2d3d)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-mono text-xs font-bold border"
                      style={{
                        color: colors.accent,
                        borderColor: colors.border,
                        backgroundColor: `${colors.accent}11`,
                        clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)",
                      }}
                    >
                      {String(unit.order).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-valo-text text-sm leading-snug">{unit.name}</h3>
                      <p className="text-valo-muted text-xs mt-0.5 font-mono">
                        {unit.topics.length} subtemas
                        {unitAvg > 0 && (
                          <span
                            className="ml-3"
                            style={{ color: unitAvg >= 80 ? "#39d264" : unitAvg >= 50 ? "#f5a623" : "#ff4655" }}
                          >
                            {unitAvg}% dominio
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-valo-muted"
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border-x border-b divide-y"
                      style={{
                        borderColor: colors.border,
                        clipPath: "polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%)",
                      }}
                    >
                      {unit.topics.map((topic: any, ti: number) => {
                        const mastery = masteryMap[topic.id] ?? 0;
                        const qCount = questionCountMap[topic.id] ?? 0;
                        const masteryPct = Math.round(mastery * 100);

                        return (
                          <div key={topic.id} className="group flex items-center justify-between px-4 py-3 bg-valo-surface hover:bg-valo-panel transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className="flex-shrink-0 w-1.5 h-8"
                                style={{
                                  backgroundColor:
                                    masteryPct >= 80 ? "#39d264" :
                                    masteryPct >= 50 ? "#f5a623" :
                                    masteryPct > 0 ? "#ff4655" :
                                    "#1e2d3d",
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-valo-text truncate">{topic.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  {masteryPct > 0 ? (
                                    <span
                                      className="font-mono text-xs"
                                      style={{
                                        color:
                                          masteryPct >= 80 ? "#39d264" :
                                          masteryPct >= 50 ? "#f5a623" :
                                          "#ff4655",
                                      }}
                                    >
                                      {masteryPct}% · {masteryLabel(mastery)}
                                    </span>
                                  ) : (
                                    <span className="font-mono text-xs text-valo-muted-2">SIN INTENTOS</span>
                                  )}
                                  {qCount > 0 && (
                                    <span className="font-mono text-xs text-valo-muted-2">{qCount} preguntas</span>
                                  )}
                                </div>
                                {masteryPct > 0 && (
                                  <div className="mt-1.5 mastery-bar w-32">
                                    <motion.div
                                      className="mastery-bar-fill"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${masteryPct}%` }}
                                      transition={{ duration: 0.6, delay: ti * 0.05 }}
                                      style={{
                                        backgroundColor:
                                          masteryPct >= 80 ? "#39d264" :
                                          masteryPct >= 50 ? "#f5a623" :
                                          "#ff4655",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <Link href={`/app/topics/${topic.id}/practice`}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs tracking-wider border transition-all opacity-0 group-hover:opacity-100"
                                style={{
                                  color: colors.accent,
                                  borderColor: colors.border,
                                  backgroundColor: `${colors.accent}11`,
                                  clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)",
                                }}
                              >
                                <Play size={10} />
                                PRACTICAR
                              </motion.button>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
