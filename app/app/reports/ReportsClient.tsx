"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState as useFilterState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COURSE_COLORS, formatTime } from "@/lib/utils";
import { Course } from "@/lib/types";
import { BarChart3, Target, Clock, Trophy, ChevronRight } from "lucide-react";
import HudPanel from "@/components/hud/HudPanel";

type TopicStat = {
  name: string;
  unitName: string;
  courseName: string;
  courseSlug: string;
  total: number;
  correct: number;
  totalTime: number;
  mastery: number;
};

interface PageData {
  courses: Course[];
  topicStats: Record<string, TopicStat>;
  totalAttempts: number;
  overallAccuracy: number;
  avgTime: number;
  masteryCount: number;
}

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-40 bg-valo-border rounded" />
        <div className="h-8 w-32 bg-valo-surface rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 bg-valo-panel border border-valo-border h-24"
            style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}>
            <div className="h-2 w-24 bg-valo-border rounded mb-3" />
            <div className="h-6 w-16 bg-valo-surface rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-valo-surface border border-valo-border rounded" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 bg-valo-panel border border-valo-border h-20"
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
            <div className="flex gap-4 items-center">
              <div className="w-1.5 h-12 bg-valo-surface rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-valo-surface rounded w-3/4" />
                <div className="h-3 bg-valo-border rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsClient() {
  const [data, setData] = useState<PageData | null>(null);
  const [filterCourse, setFilterCourse] = useFilterState<string>("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: courses }, { data: attempts }, { data: mastery }] = await Promise.all([
        supabase.from("courses").select("*").order("order"),
        supabase.from("attempts")
          .select("id, is_correct, time_ms, question_id, questions(course_id, unit_id, topic_id, topics(name), units(name), courses(name, slug))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("mastery").select("topic_id, mastery_score").eq("user_id", user.id),
      ]);

      const topicStats: Record<string, TopicStat> = {};
      for (const a of attempts ?? []) {
        const q = a.questions as any;
        if (!q) continue;
        const tid = q.topic_id;
        if (!topicStats[tid]) {
          topicStats[tid] = {
            name: q.topics?.name ?? "–",
            unitName: q.units?.name ?? "–",
            courseName: q.courses?.name ?? "–",
            courseSlug: q.courses?.slug ?? "",
            total: 0, correct: 0, totalTime: 0, mastery: 0,
          };
        }
        topicStats[tid].total++;
        if (a.is_correct) topicStats[tid].correct++;
        topicStats[tid].totalTime += a.time_ms;
      }
      for (const m of mastery ?? []) {
        if (topicStats[m.topic_id]) topicStats[m.topic_id].mastery = m.mastery_score;
      }

      const totalAttempts = (attempts ?? []).length;
      const totalCorrect = (attempts ?? []).filter((a) => a.is_correct).length;
      const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
      const avgTime = totalAttempts > 0
        ? Math.round((attempts ?? []).reduce((s, a) => s + a.time_ms, 0) / totalAttempts)
        : 0;

      setData({
        courses: courses ?? [],
        topicStats,
        totalAttempts,
        overallAccuracy,
        avgTime,
        masteryCount: (mastery ?? []).filter((m) => m.mastery_score >= 0.8).length,
      });
    }
    load();
  }, []);

  if (!data) return <Skeleton />;

  const { courses, topicStats, totalAttempts, overallAccuracy, avgTime, masteryCount } = data;

  const topicList = Object.entries(topicStats)
    .map(([id, s]) => ({ id, ...s }))
    .filter((t) => filterCourse === "all" || t.courseSlug === filterCourse)
    .sort((a, b) => b.total - a.total);

  const summaryStats = [
    { label: "TOTAL INTENTOS", value: totalAttempts, color: "#00d4ff", icon: <BarChart3 size={14} /> },
    { label: "PRECISIÓN GLOBAL", value: `${Math.round(overallAccuracy)}%`, color: overallAccuracy >= 70 ? "#39d264" : "#f5a623", icon: <Target size={14} /> },
    { label: "TIEMPO PROMEDIO", value: formatTime(avgTime), color: "#f5a623", icon: <Clock size={14} /> },
    { label: "TEMAS DOMINADOS", value: masteryCount, color: "#39d264", icon: <Trophy size={14} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <p className="font-mono text-xs text-valo-muted tracking-widest mb-2">
          // ANÁLISIS DE RENDIMIENTO
        </p>
        <h1 className="text-3xl font-black text-valo-text">REPORTES</h1>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <HudPanel className="p-5">
              <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                {s.icon}
                <span className="font-mono text-xs tracking-widest text-valo-muted">{s.label}</span>
              </div>
              <div className="text-2xl font-black font-mono" style={{ color: s.color }}>
                {s.value}
              </div>
            </HudPanel>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-xs text-valo-muted-2 tracking-widest mr-2">FILTRAR:</span>
        <button
          onClick={() => setFilterCourse("all")}
          className={`px-3 py-1.5 font-mono text-xs border transition-all ${filterCourse === "all" ? "border-valo-accent text-valo-accent bg-valo-accent/10" : "border-valo-border text-valo-muted hover:text-valo-text"}`}
          style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}
        >
          TODOS
        </button>
        {courses.map((c) => {
          const col = COURSE_COLORS[c.slug];
          return (
            <button
              key={c.slug}
              onClick={() => setFilterCourse(c.slug)}
              className="px-3 py-1.5 font-mono text-xs border transition-all"
              style={{
                clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)",
                borderColor: filterCourse === c.slug ? col.accent : "#1e2d3d",
                color: filterCourse === c.slug ? col.accent : "#7b8fa8",
                backgroundColor: filterCourse === c.slug ? `${col.accent}18` : "transparent",
              }}
            >
              {c.name.toUpperCase()}
            </button>
          );
        })}
      </div>

      {topicList.length === 0 ? (
        <HudPanel className="p-12 text-center">
          <BarChart3 size={32} className="text-valo-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-valo-text mb-2">Sin datos aún</h3>
          <p className="text-valo-muted text-sm font-mono mb-6">
            Practica preguntas para ver tus estadísticas.
          </p>
          <Link
            href="/app/courses"
            className="inline-flex items-center gap-2 px-4 py-2 border border-valo-border font-mono text-xs text-valo-muted hover:text-valo-text transition-colors"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
          >
            IR A CURSOS <ChevronRight size={12} />
          </Link>
        </HudPanel>
      ) : (
        <div className="space-y-2">
          <p className="font-mono text-xs text-valo-muted-2 tracking-widest">
            // DESGLOSE POR SUBTEMA ({topicList.length} subtemas con actividad)
          </p>
          {topicList.map((topic, i) => {
            const accuracy = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
            const avgTopicTime = topic.total > 0 ? Math.round(topic.totalTime / topic.total) : 0;
            const masteryPct = Math.round(topic.mastery * 100);
            const courseColors = COURSE_COLORS[topic.courseSlug] ?? COURSE_COLORS["algebra"];

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
              >
                <div
                  className="p-4 border bg-valo-panel hover:bg-valo-surface transition-colors"
                  style={{
                    clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)",
                    borderColor: "#1e2d3d",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div
                        className="w-1.5 h-12"
                        style={{
                          backgroundColor:
                            masteryPct >= 80 ? "#39d264" :
                            masteryPct >= 50 ? "#f5a623" :
                            masteryPct > 0 ? "#ff4655" :
                            "#1e2d3d",
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-valo-text truncate">{topic.name}</p>
                          <p className="text-xs text-valo-muted font-mono mt-0.5">
                            <span style={{ color: courseColors.accent }}>{topic.courseName}</span>
                            <span className="mx-1.5 text-valo-muted-2">›</span>
                            {topic.unitName}
                          </p>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-4 text-right">
                          <div>
                            <p className="font-mono text-xs text-valo-muted">PRECISIÓN</p>
                            <p className="font-mono text-sm font-bold"
                              style={{ color: accuracy >= 70 ? "#39d264" : accuracy >= 50 ? "#f5a623" : "#ff4655" }}>
                              {accuracy}%
                            </p>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-valo-muted">INTENTOS</p>
                            <p className="font-mono text-sm font-bold text-valo-text">{topic.total}</p>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-valo-muted">T.PROM.</p>
                            <p className="font-mono text-sm font-bold text-valo-text">{formatTime(avgTopicTime)}</p>
                          </div>
                          <div>
                            <p className="font-mono text-xs text-valo-muted">DOMINIO</p>
                            <p className="font-mono text-sm font-bold"
                              style={{ color: masteryPct >= 80 ? "#39d264" : masteryPct >= 50 ? "#f5a623" : masteryPct > 0 ? "#ff4655" : "#4a5c6e" }}>
                              {masteryPct > 0 ? `${masteryPct}%` : "–"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {masteryPct > 0 && (
                        <div className="mt-2 mastery-bar w-full">
                          <motion.div
                            className="mastery-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${masteryPct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.04 }}
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
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
