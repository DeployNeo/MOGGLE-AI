import {
  blendPslWithAnchor,
  analyzeMetricsForPrompt,
} from "@/lib/metric-analysis";
import { normalizePslRating } from "@/lib/psl";
import { sanitizeAnalysisText, sanitizeStringArray } from "@/lib/sanitize";
import type {
  AIAnalysisResult,
  FeatureBreakdown,
  FacialMetrics,
  FaceShapeResult,
  PSLRating,
} from "@/types";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseFeatureBreakdown(value: unknown): FeatureBreakdown[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      feature: typeof item.feature === "string" ? item.feature : "unknown",
      score: typeof item.score === "number" ? item.score : 0,
      verdict: sanitizeAnalysisText(
        typeof item.verdict === "string" ? item.verdict : ""
      ),
    }))
    .filter((item) => item.verdict.length > 0);
}

function buildDefaultFeatureBreakdown(
  metrics: FacialMetrics,
  ctx: ReturnType<typeof analyzeMetricsForPrompt>
): FeatureBreakdown[] {
  return ctx.metricInsights.map((m) => ({
    feature: m.name.toLowerCase(),
    score: m.value,
    verdict: sanitizeAnalysisText(m.fact),
  }));
}

export function parseAIResponse(
  content: string,
  metrics?: FacialMetrics,
  faceShape?: FaceShapeResult
): AIAnalysisResult {
  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  let pslRating = normalizePslRating(
    typeof parsed.pslRating === "string" ? parsed.pslRating : "MTN"
  );

  let pslNumeric =
    typeof parsed.pslNumeric === "number"
      ? parsed.pslNumeric
      : typeof parsed.pslScore === "number"
        ? parsed.pslScore
        : 5.8;

  const ctx =
    metrics && faceShape
      ? analyzeMetricsForPrompt(metrics, faceShape)
      : null;

  if (ctx) {
    const blended = blendPslWithAnchor(pslNumeric, ctx);
    pslRating = blended.rating;
    pslNumeric = blended.numeric;
  }

  const professionalAssessment = sanitizeAnalysisText(
    typeof parsed.professionalAssessment === "string"
      ? parsed.professionalAssessment
      : typeof parsed.brutalAssessment === "string"
        ? parsed.brutalAssessment
        : typeof parsed.honestAssessment === "string"
          ? parsed.honestAssessment
          : ""
  );

  const featureBreakdown = parseFeatureBreakdown(parsed.featureBreakdown);

  return {
    faceShape: typeof parsed.faceShape === "string" ? parsed.faceShape : "",
    verdict: sanitizeAnalysisText(
      typeof parsed.verdict === "string" ? parsed.verdict : ""
    ),
    pslRating,
    pslNumeric: Math.min(10, Math.max(1, pslNumeric)),
    pslReasoning: sanitizeAnalysisText(
      typeof parsed.pslReasoning === "string"
        ? parsed.pslReasoning
        : typeof parsed.pslBreakdown === "string"
          ? parsed.pslBreakdown
          : ""
    ),
    pslCeiling: sanitizeAnalysisText(
      typeof parsed.pslCeiling === "string" ? parsed.pslCeiling : ""
    ),
    professionalAssessment,
    structuralScore:
      typeof parsed.structuralScore === "number"
        ? Math.round(parsed.structuralScore)
        : ctx?.structuralScore ?? 0,
    dimorphismScore:
      typeof parsed.dimorphismScore === "number"
        ? Math.round(parsed.dimorphismScore)
        : metrics
          ? Math.round((metrics.jawline + metrics.chinProportion) / 2)
          : 0,
    featureBreakdown:
      featureBreakdown.length > 0
        ? featureBreakdown
        : ctx && metrics
          ? buildDefaultFeatureBreakdown(metrics, ctx)
          : [],
    strengths: sanitizeStringArray(toStringArray(parsed.strengths)),
    flaws: sanitizeStringArray(
      toStringArray(parsed.flaws ?? parsed.weaknesses ?? parsed.improvementAreas)
    ),
    improvements: sanitizeStringArray(toStringArray(parsed.improvements)),
    looksmaxxingPriority: sanitizeStringArray(
      toStringArray(parsed.looksmaxxingPriority ?? parsed.priority)
    ),
    recommendedHaircuts: sanitizeStringArray(
      toStringArray(parsed.recommendedHaircuts)
    ),
    recommendedGlasses: sanitizeStringArray(
      toStringArray(parsed.recommendedGlasses)
    ),
    skincare: sanitizeStringArray(toStringArray(parsed.skincare)),
    fitness: sanitizeStringArray(toStringArray(parsed.fitness)),
    posture: sanitizeStringArray(toStringArray(parsed.posture)),
    confidence:
      typeof parsed.confidence === "number" ? parsed.confidence : 75,
  };
}

export function averagePslRating(a: PSLRating, b: PSLRating): PSLRating {
  const order: PSLRating[] = [
    "Sub-3",
    "Sub-4",
    "Sub-5",
    "LTN",
    "MTN",
    "HTN",
    "Chadlite",
    "Chad",
  ];
  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);
  const avgIndex = Math.round((indexA + indexB) / 2);
  return order[Math.min(order.length - 1, Math.max(0, avgIndex))];
}
