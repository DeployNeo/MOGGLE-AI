import type { FacialMetrics, SkinRecommendation } from "@/types";

export function generateSkinRecommendations(
  metrics: FacialMetrics
): SkinRecommendation {
  const symmetryNote =
    metrics.symmetry > 75
      ? "Even baseline — focus on maintenance and protection."
      : "Prioritize consistency; asymmetry often reflects lifestyle factors.";

  const routine = [
    "Gentle cleanser AM/PM — avoid over-stripping natural oils.",
    metrics.symmetry > 70
      ? "Antioxidant serum (vitamin C) in the morning."
      : "Niacinamide serum to support tone uniformity.",
    "Broad-spectrum SPF 30+ every morning.",
    "Light moisturizer matched to your skin type.",
  ];

  const hydration = [
    "Target 2–3L water daily; dehydration shows in under-eye and lip texture.",
    "Limit alcohol and excess sodium — both increase facial puffiness.",
    symmetryNote,
  ];

  const sleep = [
    "Aim for 7–9 hours; collagen repair peaks in deep sleep.",
    "Sleep on your back when possible to reduce asymmetrical compression.",
    "Silk or satin pillowcase reduces friction on cheeks and brow.",
  ];

  const guidance = [
    `Harmony ${metrics.harmony}% — lifestyle consistency supports visible skin quality.`,
    "Patch-test new products for 48 hours before full application.",
    "Consult a dermatologist for persistent acne, rosacea, or pigmentation.",
  ];

  return { routine, hydration, sleep, guidance };
}
