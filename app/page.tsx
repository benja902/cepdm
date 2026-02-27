"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { ArrowRight, Zap, Target, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <Zap size={20} />,
    title: "Práctica Activa",
    desc: "MCQ A–E con timer, explicaciones y detección de errores comunes.",
  },
  {
    icon: <Target size={20} />,
    title: "Tutor Engine",
    desc: "Retroalimentación inmediata con explicación, error común y verificación.",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Mastery Tracking",
    desc: "Seguimiento de dominio por subtema. Sabe exactamente qué repasar.",
  },
];

const courses = [
  { name: "Álgebra", slug: "algebra", icon: "∑", color: "#00d4ff" },
  { name: "Aptitud Verbal", slug: "aptitud-verbal", icon: "Aa", color: "#f5a623" },
  { name: "Inglés", slug: "ingles", icon: "EN", color: "#39d264" },
];

export default function LandingPage() {


  return (
    <div className="min-h-screen bg-valo-bg overflow-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-valo-border/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-valo-accent/20 border border-valo-accent/40 flex items-center justify-center text-valo-accent font-mono text-xs font-bold"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
            CP
          </div>
          <span className="font-mono text-valo-text font-semibold tracking-wider text-sm">
            CEPREVAL<span className="text-valo-accent">PREP</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/auth/login"
            className="text-valo-muted hover:text-valo-text transition-colors text-sm font-mono">
            INICIAR SESIÓN
          </Link>
          <Link
            href="/auth/login"
            className="group flex items-center gap-2 bg-valo-accent text-valo-bg px-4 py-2 text-sm font-mono font-bold tracking-wider hover:bg-valo-accent/90 transition-colors"
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
          >
            ENTRAR
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 border border-valo-accent/30 bg-valo-accent/5 px-4 py-1.5 mb-8 font-mono text-xs text-valo-accent tracking-widest"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
            ◆ UNHEVAL / CEPREVAL — PREP PLATFORM v1
          </div>

          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight mb-6 leading-none">
            <span className="text-valo-text">DOMINA EL</span>
            <br />
            <span className="text-gradient-accent glow-accent">EXAMEN</span>
          </h1>

          <p className="text-valo-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Plataforma de preparación táctica para el examen de admisión UNHEVAL.
            Practica, mide tu dominio y aprende de tus errores.
          </p>

          <div className="flex items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-3 bg-valo-accent text-valo-bg px-8 py-4 text-base font-mono font-bold tracking-wider hover:bg-valo-accent/90 transition-colors shadow-glow-accent"
                style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}
              >
                COMENZAR AHORA
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Courses preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-valo-muted-2 font-mono text-xs tracking-widest mb-6 text-center">
            // MÓDULOS DE ENTRENAMIENTO
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course, i) => (
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative p-6 border border-valo-border bg-valo-panel hover:border-opacity-60 transition-all group"
                style={{
                  clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)",
                  borderColor: `${course.color}22`,
                }}
                whileHover={{ y: -2, borderColor: `${course.color}55` }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center font-mono font-black text-lg mb-4 border"
                  style={{
                    color: course.color,
                    borderColor: `${course.color}44`,
                    backgroundColor: `${course.color}11`,
                    clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
                  }}
                >
                  {course.icon}
                </div>
                <h3 className="font-sans font-semibold text-valo-text text-lg mb-1">
                  {course.name}
                </h3>
                <div
                  className="h-0.5 w-8 mt-3"
                  style={{ backgroundColor: `${course.color}66` }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-5 border border-valo-border/50 bg-valo-surface/50"
              style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
            >
              <div className="text-valo-accent mb-3">{f.icon}</div>
              <h4 className="font-mono font-semibold text-valo-text text-sm mb-2 tracking-wide">
                {f.title}
              </h4>
              <p className="text-valo-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-valo-border/30 px-8 py-6 mt-10">
        <p className="text-valo-muted-2 font-mono text-xs text-center tracking-widest">
          CEPREVAL PREP — MVP v1 · UNHEVAL
        </p>
      </footer>
    </div>
  );
}
