import { averagePslRating } from "@/lib/ai-response";
import type { AIAnalysisResult, FeatureBreakdown } from "@/types";

function uniqueMerge(arrays: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const arr of arrays) {
    for (const item of arr) {
      const key = item.toLowerCase().trim();
      if (!seen.has(key) && item.trim()) {
        seen.add(key);
        result.push(item);
      }
    }
  }
  return result;
}

function mergeFeatureBreakdown(
  a: FeatureBreakdown[],
  b: FeatureBreakdown[]
): FeatureBreakdown[] {
  const map = new Map<string, FeatureBreakdown>();
  for (const item of [...a, ...b]) {
    const existing = map.get(item.feature);
    if (!existing || item.score > existing.score) {
      map.set(item.feature, item);
    }
  }
  return Array.from(map.values());
}

export function mergeAIResults(
  primary: AIAnalysisResult,
  secondary: AIAnalysisResult
): AIAnalysisResult {
  const pslRating = averagePslRating(primary.pslRating, secondary.pslRating);

  return {
    faceShape: primary.faceShape || secondary.faceShape,
    verdict: primary.verdict || secondary.verdict,
    pslRating,
    pslNumeric:
      Math.round(((primary.pslNumeric + secondary.pslNumeric) / 2) * 10) / 10,
    pslReasoning: [primary.pslReasoning, secondary.pslReasoning]
      .filter(Boolean)
      .join(" "),
    pslCeiling: primary.pslCeiling || secondary.pslCeiling,
    professionalAssessment:
      primary.professionalAssessment || secondary.professionalAssessment,
    structuralScore: Math.round(
      (primary.structuralScore + secondary.structuralScore) / 2
    ),
    dimorphismScore: Math.round(
      (primary.dimorphismScore + secondary.dimorphismScore) / 2
    ),
    featureBreakdown: mergeFeatureBreakdown(
      primary.featureBreakdown,
      secondary.featureBreakdown
    ),
    strengths: uniqueMerge([primary.strengths, secondary.strengths]).slice(0, 5),
    flaws: uniqueMerge([primary.flaws, secondary.flaws]).slice(0, 6),
    improvements: uniqueMerge([primary.improvements, secondary.improvements]).slice(
      0,
      6
    ),
    looksmaxxingPriority: uniqueMerge([
      primary.looksmaxxingPriority,
      secondary.looksmaxxingPriority,
    ]).slice(0, 5),
    recommendedHaircuts: uniqueMerge([
      primary.recommendedHaircuts,
      secondary.recommendedHaircuts,
    ]).slice(0, 5),
    recommendedGlasses: uniqueMerge([
      primary.recommendedGlasses,
      secondary.recommendedGlasses,
    ]).slice(0, 4),
    skincare: uniqueMerge([primary.skincare, secondary.skincare]).slice(0, 4),
    fitness: uniqueMerge([primary.fitness, secondary.fitness]).slice(0, 4),
    posture: uniqueMerge([primary.posture, secondary.posture]).slice(0, 4),
    confidence: Math.round((primary.confidence + secondary.confidence) / 2),
  };
}
