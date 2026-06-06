import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeScore(value: number, min = 0, max = 100): number {
  return Math.round(clamp(value, min, max));
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-electric-light";
  if (score >= 40) return "text-yellow-400";
  return "text-orange-400";
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return "from-green-500 to-emerald-400";
  if (score >= 60) return "from-electric to-electric-light";
  if (score >= 40) return "from-yellow-500 to-amber-400";
  return "from-orange-500 to-red-400";
}
