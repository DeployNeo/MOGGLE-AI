import type { BeardRecommendation, FaceShape, FacialMetrics } from "@/types";

const STYLES = [
  "Clean shave",
  "Stubble",
  "Short boxed beard",
  "Goatee",
  "Full beard",
] as const;

function scoreStyle(
  style: (typeof STYLES)[number],
  shape: FaceShape,
  metrics: FacialMetrics
): { score: number; reasoning: string } {
  const jaw = metrics.jawline;
  const chin = metrics.chinProjection;
  const lower = metrics.lowerThird;

  switch (style) {
    case "Clean shave":
      return {
        score: Math.min(95, 60 + jaw * 0.25 + (100 - lower) * 0.1),
        reasoning:
          jaw > 70
            ? "Strong jaw definition reads well clean-shaven."
            : "Clean lines reduce visual bulk on the lower face.",
      };
    case "Stubble":
      return {
        score: Math.min(95, 55 + metrics.jawProminence * 0.35),
        reasoning: "Light stubble adds shadow and jaw contrast without hiding bone structure.",
      };
    case "Short boxed beard":
      return {
        score:
          shape === "Round" || shape === "Heart"
            ? Math.min(92, 70 + jaw * 0.2)
            : Math.min(88, 55 + chin * 0.25),
        reasoning:
          shape === "Round"
            ? "Angular boxed edges lengthen a round lower third."
            : "Structured beard frame complements your jaw width.",
      };
    case "Goatee":
      return {
        score:
          shape === "Square" || chin < 55
            ? Math.min(90, 65 + chin * 0.3)
            : Math.min(75, 50 + chin * 0.2),
        reasoning:
          chin < 55
            ? "Goatee adds forward projection to a softer chin."
            : "Vertical emphasis balances wider mid-face proportions.",
      };
    case "Full beard":
      return {
        score:
          shape === "Triangle" || lower > 38
            ? Math.min(88, 60 + metrics.jawProminence * 0.25)
            : Math.min(72, 45 + jaw * 0.2),
        reasoning:
          lower > 38
            ? "Full beard balances a dominant lower third."
            : "Volume adds width when jaw prominence is moderate.",
      };
    default:
      return { score: 50, reasoning: "Neutral fit for your geometry." };
  }
}

export function recommendBeards(
  shape: FaceShape,
  metrics: FacialMetrics
): BeardRecommendation[] {
  return STYLES.map((style) => {
    const { score, reasoning } = scoreStyle(style, shape, metrics);
    return {
      style,
      score: Math.round(score),
      reasoning,
    };
  }).sort((a, b) => b.score - a.score);
}
