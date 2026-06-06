import type { FacialMetrics, PSLRating } from "@/types";

export const PSL_LABELS: PSLRating[] = [
  "Sub-3",
  "Sub-4",
  "Sub-5",
  "LTN",
  "MTN",
  "HTN",
  "Chadlite",
  "Chad",
];

const PSL_NUMERIC_MAP: Record<PSLRating, number> = {
  "Sub-3": 2.8,
  "Sub-4": 3.8,
  "Sub-5": 4.5,
  LTN: 5.2,
  MTN: 5.8,
  HTN: 6.6,
  Chadlite: 7.4,
  Chad: 8.2,
};

export function normalizePslRating(value: string): PSLRating {
  const cleaned = value.trim().replace(/\s+/g, "");
  const aliases: Record<string, PSLRating> = {
    sub3: "Sub-3",
    "sub-3": "Sub-3",
    sub4: "Sub-4",
    "sub-4": "Sub-4",
    sub5: "Sub-5",
    "sub-5": "Sub-5",
    ltn: "LTN",
    mtn: "MTN",
    htn: "HTN",
    chadlite: "Chadlite",
    "chad-lite": "Chadlite",
    chad: "Chad",
  };

  const key = cleaned.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (aliases[key]) return aliases[key];

  for (const label of PSL_LABELS) {
    if (cleaned.toLowerCase() === label.toLowerCase()) return label;
  }

  return "MTN";
}

export function pslToNumeric(rating: PSLRating): number {
  return PSL_NUMERIC_MAP[rating];
}

export function numericToPslRating(numeric: number): PSLRating {
  if (numeric < 3.3) return "Sub-3";
  if (numeric < 4.2) return "Sub-4";
  if (numeric < 4.9) return "Sub-5";
  if (numeric < 5.5) return "LTN";
  if (numeric < 6.2) return "MTN";
  if (numeric < 7.0) return "HTN";
  if (numeric < 7.8) return "Chadlite";
  return "Chad";
}

export function getPslColor(rating: PSLRating): string {
  const numeric = pslToNumeric(rating);
  if (numeric >= 7.4) return "text-green-400";
  if (numeric >= 6.6) return "text-emerald-400";
  if (numeric >= 5.8) return "text-electric-light";
  if (numeric >= 5.2) return "text-yellow-400";
  if (numeric >= 4.5) return "text-orange-400";
  if (numeric >= 3.8) return "text-red-400";
  return "text-red-500";
}

export function getPslBorderColor(rating: PSLRating): string {
  const numeric = pslToNumeric(rating);
  if (numeric >= 7.4) return "border-green-500/40";
  if (numeric >= 6.6) return "border-emerald-500/40";
  if (numeric >= 5.8) return "border-electric/40";
  if (numeric >= 5.2) return "border-yellow-500/40";
  if (numeric >= 4.5) return "border-orange-500/40";
  return "border-red-500/40";
}

export function compositeToNumeric(composite: number): number {
  const normalized = 3.2 + (composite / 100) * 4.8;
  return Math.round(Math.min(8.5, Math.max(2.5, normalized)) * 10) / 10;
}

export function estimatePslFromMetrics(metrics: FacialMetrics): {
  rating: PSLRating;
  numeric: number;
  reasoning: string;
} {
  const composite = Math.round(
    metrics.symmetry * 0.2 +
      metrics.jawline * 0.2 +
      metrics.eyes * 0.15 +
      metrics.nose * 0.1 +
      metrics.lips * 0.1 +
      metrics.harmony * 0.25
  );

  const numeric = compositeToNumeric(composite);
  const rating = numericToPslRating(numeric);

  return {
    rating,
    numeric,
    reasoning: `Composite score ${composite}/100 from symmetry (${metrics.symmetry}%), harmony (${metrics.harmony}%), and jawline (${metrics.jawline}%). Maps to ${rating} tier.`,
  };
}
