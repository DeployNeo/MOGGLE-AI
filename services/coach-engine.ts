import type {
  CoachSuggestions,
  FacialMetrics,
  ProgressDataPoint,
} from "@/types";

function trendDirection(
  points: ProgressDataPoint[],
  key: keyof Pick<ProgressDataPoint, "harmonyScore" | "symmetryScore" | "pslNumeric">
): "up" | "down" | "flat" {
  if (points.length < 2) return "flat";
  const recent = points.slice(-3);
  const first = recent[0][key];
  const last = recent[recent.length - 1][key];
  const delta = last - first;
  if (delta > 1) return "up";
  if (delta < -1) return "down";
  return "flat";
}

export function generateCoachSuggestions(
  metrics: FacialMetrics,
  history: ProgressDataPoint[] = []
): CoachSuggestions {
  const harmonyTrend = trendDirection(history, "harmonyScore");
  const symmetryTrend = trendDirection(history, "symmetryScore");
  const pslTrend = trendDirection(history, "pslNumeric");

  const daily = [
    "Morning: cleanse, SPF, 2 minutes posture reset (chin tuck + shoulder rolls).",
    "Hydration: 500ml water before noon.",
    metrics.symmetry < 70
      ? "Sleep on back tonight to reduce unilateral facial compression."
      : "Maintain grooming consistency — small daily wins compound.",
  ].slice(0, 3);

  const weekly = [
    "Schedule one progress scan under consistent lighting.",
    metrics.jawline < 65
      ? "Add 2 neck/posture sessions and 3 resistance workouts."
      : "Maintain training volume; prioritize sleep quality this week.",
    "Review hairstyle and grooming against latest recommendations.",
  ];

  const monthly = [
    harmonyTrend === "up"
      ? "Harmony trending up — double down on what's working."
      : "Set one structural goal: posture, body fat, or grooming upgrade.",
    symmetryTrend === "down"
      ? "Investigate sleep position and unilateral habits affecting symmetry."
      : "Compare monthly scans side-by-side in your dashboard.",
    pslTrend === "flat"
      ? "Pick highest-ROI looksmaxxing priority and execute for 30 days."
      : "Document wins; adjust plan based on measurable progress.",
  ];

  const trends = [
    history.length === 0
      ? "No history yet — save analyses to unlock trend coaching."
      : `Harmony trend: ${harmonyTrend}, symmetry: ${symmetryTrend}, PSL: ${pslTrend}.`,
    `Current harmony ${metrics.harmony}%, symmetry ${metrics.symmetry}%.`,
  ];

  return { daily, weekly, monthly, trends };
}
