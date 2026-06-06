import type { FacialMetrics, FitnessRecommendation } from "@/types";

export function generateFitnessRecommendations(
  metrics: FacialMetrics
): FitnessRecommendation {
  const jawFocus =
    metrics.jawline < 65
      ? "Include compound lifts and moderate caloric deficit to reduce facial adiposity."
      : "Maintain lean body composition to preserve jaw definition.";

  return {
    posture: [
      "Chin tucks: 3 sets of 10 daily to counter forward head posture.",
      "Wall angels: 2 sets of 12 to open chest and align cervical spine.",
      "Ergonomic desk setup — monitor at eye level reduces neck strain.",
    ],
    neck: [
      metrics.jawProminence < 65
        ? "Neck curls with light resistance — 3×15, 3× weekly."
        : "Isometric neck holds for stability — avoid excessive forward flexion.",
      "Stretch sternocleidomastoid bilaterally after desk work.",
    ],
    shoulders: [
      "Face pulls: 3×15 to retract scapulae and improve frame presentation.",
      "Overhead press and rows for balanced shoulder development.",
      "Daily shoulder rolls — 20 forward, 20 backward.",
    ],
    general: [
      "150+ minutes moderate cardio weekly for cardiovascular health.",
      "Resistance training 3–4× weekly for overall composition.",
      jawFocus,
    ],
    bodyComposition: [
      "Protein 0.7–1g per lb bodyweight supports lean mass.",
      "Track waist-to-height ratio as a simple health marker.",
      "Avoid crash diets — rapid fat loss can reduce facial vitality.",
    ],
  };
}
