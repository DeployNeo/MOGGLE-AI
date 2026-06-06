import { estimatePslFromMetrics, numericToPslRating } from "@/lib/psl";
import type { FaceShapeResult, FacialMetrics, PSLRating } from "@/types";

export type MetricTier = "deficient" | "below_average" | "average" | "above_average" | "elite";

export interface MetricInsight {
  name: string;
  value: number;
  tier: MetricTier;
  fact: string;
}

export interface ThirdsAnalysis {
  upper: number;
  middle: number;
  lower: number;
  deviation: number;
  verdict: string;
}

export interface MetricAnalysisContext {
  compositeScore: number;
  structuralScore: number;
  suggestedPsl: PSLRating;
  suggestedPslNumeric: number;
  metricInsights: MetricInsight[];
  thirds: ThirdsAnalysis;
  criticalFlaws: string[];
  verifiedStrengths: string[];
  harmonyVerdict: string;
  summaryFacts: string[];
}

function tierFromScore(score: number): MetricTier {
  if (score >= 85) return "elite";
  if (score >= 72) return "above_average";
  if (score >= 58) return "average";
  if (score >= 45) return "below_average";
  return "deficient";
}

function tierLabel(tier: MetricTier): string {
  const map: Record<MetricTier, string> = {
    deficient: "DEFICIENT",
    below_average: "BELOW AVERAGE",
    average: "AVERAGE",
    above_average: "ABOVE AVERAGE",
    elite: "ELITE",
  };
  return map[tier];
}

function buildMetricInsight(
  name: string,
  value: number,
  deficientFact: string,
  averageFact: string,
  eliteFact: string
): MetricInsight {
  const tier = tierFromScore(value);
  let fact: string;
  if (tier === "deficient" || tier === "below_average") fact = deficientFact;
  else if (tier === "elite" || tier === "above_average") fact = eliteFact;
  else fact = averageFact;

  return { name, value, tier, fact: `${name} ${value}% — ${tierLabel(tier)}. ${fact}` };
}

export function analyzeMetricsForPrompt(
  metrics: FacialMetrics,
  faceShape: FaceShapeResult
): MetricAnalysisContext {
  const compositeScore = Math.round(
    metrics.symmetry * 0.22 +
      metrics.harmony * 0.24 +
      metrics.jawline * 0.2 +
      metrics.eyes * 0.14 +
      metrics.nose * 0.1 +
      metrics.lips * 0.1
  );

  const structuralScore = Math.round(
    (metrics.jawline + metrics.chinProportion + metrics.harmony) / 3
  );

  const pslEstimate = estimatePslFromMetrics(metrics);

  const idealThird = 33.33;
  const thirdDeviation =
    Math.abs(metrics.upperThird - idealThird) +
    Math.abs(metrics.middleThird - idealThird) +
    Math.abs(metrics.lowerThird - idealThird);

  let thirdsVerdict: string;
  if (thirdDeviation <= 6) {
    thirdsVerdict = `Facial thirds near ideal (deviation ${thirdDeviation.toFixed(1)}%). Balanced vertical proportions.`;
  } else if (thirdDeviation <= 12) {
    thirdsVerdict = `Moderate thirds imbalance (deviation ${thirdDeviation.toFixed(1)}%). U:${metrics.upperThird}% M:${metrics.middleThird}% L:${metrics.lowerThird}%.`;
  } else {
    thirdsVerdict = `Significant thirds imbalance (deviation ${thirdDeviation.toFixed(1)}%). Vertical proportions hurt harmony — long midface or short chin likely.`;
  }

  const metricInsights: MetricInsight[] = [
    buildMetricInsight(
      "Symmetry",
      metrics.symmetry,
      "Visible asymmetry reduces front-facing appeal.",
      "Symmetry is unremarkable — neither asset nor major liability.",
      "Symmetry is a genuine structural asset."
    ),
    buildMetricInsight(
      "Harmony",
      metrics.harmony,
      "Proportions clash — features do not work cohesively.",
      "Harmony is statistically average.",
      "Strong proportional harmony across features."
    ),
    buildMetricInsight(
      "Jawline",
      metrics.jawline,
      "Weak mandibular definition — profile suffers.",
      "Jaw definition is average for male facial structure.",
      "Well-defined jawline adds lower-third structure."
    ),
    buildMetricInsight(
      "Eyes",
      metrics.eyes,
      "Orbital spacing/ratio is suboptimal.",
      "Eye area is average — not a standout feature.",
      "Eye proportions are structurally favorable."
    ),
    buildMetricInsight(
      "Nose",
      metrics.nose,
      "Nose-to-face ratio hurts midface balance.",
      "Nasal proportions are within normal range.",
      "Nose proportions complement the face well."
    ),
    buildMetricInsight(
      "Lips",
      metrics.lips,
      "Mouth width/height ratio is off — lower third weakened.",
      "Lip proportions are unremarkable.",
      "Lip proportions add balance to lower third."
    ),
  ];

  const criticalFlaws = metricInsights
    .filter((m) => m.tier === "deficient" || m.tier === "below_average")
    .map((m) => m.fact);

  if (metrics.chinProportion < 58) {
    criticalFlaws.push(
      `Chin proportion ${metrics.chinProportion}% — underprojected chin weakens lower third.`
    );
  }
  if (thirdDeviation > 12) {
    criticalFlaws.push(thirdsVerdict);
  }

  const verifiedStrengths = metricInsights
    .filter((m) => m.tier === "elite" || m.tier === "above_average")
    .map((m) => m.fact);

  let harmonyVerdict: string;
  if (compositeScore >= 76) {
    harmonyVerdict = "Strong structural foundation with clear optimization upside.";
  } else if (compositeScore >= 68) {
    harmonyVerdict = "Balanced average structure — solid MTN baseline with room to level up.";
  } else if (compositeScore >= 60) {
    harmonyVerdict = "Functional structure with specific features to optimize.";
  } else if (compositeScore >= 52) {
    harmonyVerdict = "Several proportions need targeted improvement.";
  } else {
    harmonyVerdict = "Multiple structural areas benefit from a focused looksmaxxing plan.";
  }

  const summaryFacts = [
    `Composite ${compositeScore}/100. Structural index ${structuralScore}/100.`,
    `Face shape: ${faceShape.shape} (${faceShape.confidence}% confidence). ${faceShape.reasoning}`,
    `PSL anchor: ${pslEstimate.rating} (${pslEstimate.numeric}/10).`,
    harmonyVerdict,
    `Chin ${metrics.chinProportion}%. Jaw width ${metrics.jawWidth}. Eye spacing ${metrics.eyeSpacing}.`,
  ];

  return {
    compositeScore,
    structuralScore,
    suggestedPsl: pslEstimate.rating,
    suggestedPslNumeric: pslEstimate.numeric,
    metricInsights,
    thirds: {
      upper: metrics.upperThird,
      middle: metrics.middleThird,
      lower: metrics.lowerThird,
      deviation: Math.round(thirdDeviation * 10) / 10,
      verdict: thirdsVerdict,
    },
    criticalFlaws,
    verifiedStrengths,
    harmonyVerdict,
    summaryFacts,
  };
}

export function blendPslWithAnchor(
  aiNumeric: number,
  context: MetricAnalysisContext
): { rating: PSLRating; numeric: number } {
  const anchor = context.suggestedPslNumeric;
  const blended =
    Math.round((anchor * 0.45 + aiNumeric * 0.55) * 10) / 10;
  const numeric = Math.max(2.5, Math.min(8.5, blended));
  return {
    rating: numericToPslRating(numeric),
    numeric,
  };
}
