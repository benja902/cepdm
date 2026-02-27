import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}m ${rem}s`;
}

export function masteryColor(score: number): string {
  if (score >= 0.8) return "text-valo-green";
  if (score >= 0.5) return "text-valo-gold";
  if (score > 0) return "text-valo-red";
  return "text-valo-muted";
}

export function masteryLabel(score: number): string {
  if (score >= 0.9) return "DOMINADO";
  if (score >= 0.7) return "AVANZADO";
  if (score >= 0.5) return "EN PROGRESO";
  if (score > 0) return "INICIADO";
  return "SIN INTENTOS";
}

export function accuracyToMastery(
  correct: number,
  total: number
): number {
  if (total === 0) return 0;
  return correct / total;
}

export const COURSE_ICONS: Record<string, string> = {
  algebra: "∑",
  "aptitud-verbal": "Aa",
  ingles: "EN",
};

export const COURSE_COLORS: Record<
  string,
  { accent: string; glow: string; border: string }
> = {
  algebra: {
    accent: "#00d4ff",
    glow: "rgba(0,212,255,0.2)",
    border: "rgba(0,212,255,0.3)",
  },
  "aptitud-verbal": {
    accent: "#f5a623",
    glow: "rgba(245,166,35,0.2)",
    border: "rgba(245,166,35,0.3)",
  },
  ingles: {
    accent: "#39d264",
    glow: "rgba(57,210,100,0.2)",
    border: "rgba(57,210,100,0.3)",
  },
};
