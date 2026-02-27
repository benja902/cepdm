"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COURSE_COLORS, COURSE_ICONS } from "@/lib/utils";
import { Course } from "@/lib/types";
import { Target, Zap, Trophy, BookOpen, ArrowRight, WifiOff, RotateCcw } from "lucide-react";
import HudPanel from "@/components/hud/HudPanel";

interface PageData {
  email: string;
  courses: Course[];
  totalAttempts: number;
  accuracy: number;
  avgMastery: number;
  masteredTopics: number;
}

const statVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

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

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-48 bg-valo-border rounded" />
        <div className="h-9 w-72 bg-valo-surface rounded" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-valo-panel border border-valo-border h-40"
            style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}>
            <div className="h-14 w-14 bg-valo-surface rounded mb-4" />
            <div className="h-5 w-32 bg-valo-border rounded mb-2" />
            <div className="h-3 w-20 bg-valo-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setError(false);
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const [
          { data: courses },
          { data: mastery },
          { data: recentAttempts },
        ] = await Promise.all([
          supabase.from("courses").select("*").order("order"),
          user
            ? supabase.from("mastery").select("topic_id, mastery_score").eq("user_id", user.id)
            : Promise.resolve({ data: [] }),
          user
            ? supabase.from("attempts")
                .select("id, is_correct, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10)
            : Promise.resolve({ data: [] }),
        ]);

        const totalAttempts = (recentAttempts ?? []).length;
        const correctCount = (recentAttempts ?? []).filter((a) => a.is_correct).length;
        const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
        const masteryArr = mastery ?? [];
        const avgMastery = masteryArr.length > 0
          ? Math.round((masteryArr.reduce((s, m) => s + m.mastery_score, 0) / masteryArr.length) * 100)
          : 0;

        setData({
          email: user?.email ?? "",
          courses: courses ?? [],
          totalAttempts,
          accuracy,
          avgMastery,
          masteredTopics: masteryArr.filter((m) => m.mastery_score >= 0.8).length,
        });
      } catch {
        setError(true);
      }
    }
    load();
  }, [retryCount]);

  if (error) return <ErrorState onRetry={() => setRetryCount((c) => c + 1)} />;
  if (!data) return <Skeleton />;

  const { email, courses, totalAttempts, accuracy, avgMastery, masteredTopics } = data;

  const stats = [
    { label: "PREGUNTAS RESPONDIDAS", value: totalAttempts, icon: <Zap size={14} />, color: "#00d4ff" },
    { label: "PRECISIÓN (ÚLTIMAS 10)", value: `${accuracy}%`, icon: <Target size={14} />, color: "#f5a623" },
    { label: "DOMINIO PROMEDIO", value: `${avgMastery}%`, icon: <Trophy size={14} />, color: "#39d264" },
    { label: "TEMAS DOMINADOS", value: masteredTopics, icon: <BookOpen size={14} />, color: "#ff4655" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="font-mono text-xs text-valo-muted tracking-widest mb-2">
            // CAMPO BASE — TRAINING RANGE
          </p>
          <h1 className="text-3xl font-black text-valo-text tracking-tight">
            BIENVENIDO,{" "}
            <span className="text-valo-accent glow-accent">
              {email.split("@")[0].toUpperCase() || "AGENTE"}
            </span>
          </h1>
          <p className="text-valo-muted text-sm mt-1">
            Selecciona un módulo de entrenamiento o continúa donde lo dejaste.
          </p>
        </div>

        <div
          className="hidden md:flex items-center gap-2 border border-valo-accent/30 bg-valo-accent/5 px-4 py-2 font-mono text-xs text-valo-accent"
          style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
        >
          <div className="w-2 h-2 bg-valo-green rounded-full animate-pulse-glow" />
          MODO ENTRENAMIENTO ACTIVO
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={statVariants}
            initial="hidden"
            animate="show"
          >
            <HudPanel className="p-5">
              <div className="flex items-center gap-2 mb-3" style={{ color: stat.color }}>
                {stat.icon}
                <span className="font-mono text-xs tracking-widest text-valo-muted">
                  {stat.label}
                </span>
              </div>
              <div
                className="text-2xl font-black font-mono tracking-tight"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </HudPanel>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="hud-divider" />

      {/* Course cards */}
      <div>
        <p className="font-mono text-xs text-valo-muted-2 tracking-widest mb-4">
          // MÓDULOS DISPONIBLES
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {courses.map((course, i) => {
            const colors = COURSE_COLORS[course.slug] ?? COURSE_COLORS["algebra"];
            const icon = COURSE_ICONS[course.slug] ?? "?";
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <Link href={`/app/courses/${course.slug}`}>
                  <div
                    className="relative p-6 border bg-valo-panel group cursor-pointer transition-all"
                    style={{
                      clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)",
                      borderColor: colors.border,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${colors.glow}`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}
                  >
                    <div
                      className="w-14 h-14 flex items-center justify-center font-mono font-black text-xl mb-5 border"
                      style={{
                        color: colors.accent,
                        borderColor: colors.border,
                        backgroundColor: `${colors.accent}11`,
                        clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
                      }}
                    >
                      {icon}
                    </div>

                    <h3 className="font-sans font-bold text-valo-text text-xl mb-2">
                      {course.name}
                    </h3>
                    <p className="text-valo-muted text-sm font-mono">
                      MÓDULO {String(course.order).padStart(2, "0")}
                    </p>

                    <div
                      className="flex items-center gap-2 mt-5 font-mono text-xs tracking-wider"
                      style={{ color: colors.accent }}
                    >
                      ENTRAR AL MÓDULO
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: colors.border }}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-3"
      >
        <Link
          href="/app/reports"
          className="flex items-center gap-2 border border-valo-border bg-valo-surface px-4 py-2.5 font-mono text-xs text-valo-muted hover:text-valo-text hover:border-valo-accent/30 transition-all"
          style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
        >
          <ArrowRight size={12} />
          VER REPORTE COMPLETO
        </Link>
      </motion.div>
    </div>
  );
}
