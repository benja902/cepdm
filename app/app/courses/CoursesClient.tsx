"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COURSE_COLORS, COURSE_ICONS } from "@/lib/utils";
import { Course } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface PageData {
  courses: Course[];
  courseStats: Record<string, { total: number; correct: number }>;
}

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-40 bg-valo-border rounded" />
        <div className="h-8 w-28 bg-valo-surface rounded" />
      </div>
      <div className="grid grid-cols-1 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 p-6 bg-valo-panel border border-valo-border h-24"
            style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}>
            <div className="w-16 h-16 bg-valo-surface flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-valo-border rounded" />
              <div className="h-3 w-24 bg-valo-surface rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CoursesClient() {
  const [data, setData] = useState<PageData | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: courses }, { data: attempts }] = await Promise.all([
        supabase.from("courses").select("*").order("order"),
        user
          ? supabase.from("attempts").select("is_correct, questions(course_id)").eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

      const courseStats: Record<string, { total: number; correct: number }> = {};
      for (const a of attempts ?? []) {
        const cid = (a.questions as any)?.course_id;
        if (!cid) continue;
        if (!courseStats[cid]) courseStats[cid] = { total: 0, correct: 0 };
        courseStats[cid].total++;
        if (a.is_correct) courseStats[cid].correct++;
      }

      setData({ courses: courses ?? [], courseStats });
    }
    load();
  }, []);

  if (!data) return <Skeleton />;

  const { courses, courseStats } = data;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <p className="font-mono text-xs text-valo-muted tracking-widest mb-2">
          // ARSENAL DE ENTRENAMIENTO
        </p>
        <h1 className="text-3xl font-black text-valo-text tracking-tight">
          CURSOS
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-5">
        {courses.map((course, i) => {
          const colors = COURSE_COLORS[course.slug] ?? COURSE_COLORS["algebra"];
          const icon = COURSE_ICONS[course.slug] ?? "?";
          const stats = courseStats[course.id];
          const accuracy = stats && stats.total > 0
            ? Math.round((stats.correct / stats.total) * 100)
            : null;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <Link href={`/app/courses/${course.slug}`}>
                <div
                  className="relative flex items-center gap-6 p-6 border bg-valo-panel group cursor-pointer"
                  style={{
                    clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)",
                    borderColor: colors.border,
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${colors.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <div
                    className="flex-shrink-0 w-16 h-16 flex items-center justify-center font-mono font-black text-2xl border"
                    style={{
                      color: colors.accent,
                      borderColor: colors.border,
                      backgroundColor: `${colors.accent}11`,
                      clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
                    }}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-black text-valo-text">{course.name}</h2>
                      <span
                        className="font-mono text-xs px-2 py-0.5 border"
                        style={{
                          color: colors.accent,
                          borderColor: colors.border,
                          clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)",
                        }}
                      >
                        MÓDULO {String(course.order).padStart(2, "0")}
                      </span>
                    </div>
                    {stats ? (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="font-mono text-xs text-valo-muted">
                          {stats.total} intentos
                        </span>
                        {accuracy !== null && (
                          <span
                            className="font-mono text-xs font-bold"
                            style={{ color: accuracy >= 70 ? "#39d264" : accuracy >= 50 ? "#f5a623" : "#ff4655" }}
                          >
                            {accuracy}% precisión
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-valo-muted text-xs font-mono mt-1">Sin intentos aún</p>
                    )}
                  </div>

                  <ArrowRight
                    size={20}
                    className="flex-shrink-0 text-valo-muted group-hover:translate-x-1 transition-transform"
                    style={{ color: colors.accent }}
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
