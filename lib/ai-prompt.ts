import { AI_SYSTEM_PROMPT } from "@/lib/constants";
import { analyzeMetricsForPrompt } from "@/lib/metric-analysis";
import type { FaceShapeResult, FacialMetrics } from "@/types";

export interface AnalyzePayload {
  metrics: FacialMetrics;
  faceShape: FaceShapeResult;
}

export function getSystemPrompt(): string {
  return AI_SYSTEM_PROMPT;
}

export function buildUserPrompt(payload: AnalyzePayload): string {
  const ctx = analyzeMetricsForPrompt(payload.metrics, payload.faceShape);
  const m = payload.metrics;

  const insightsBlock = ctx.metricInsights
    .map((i) => `- ${i.fact}`)
    .join("\n");

  const flawsBlock =
    ctx.criticalFlaws.length > 0
      ? ctx.criticalFlaws.map((f) => `- ${f}`).join("\n")
      : "- No major structural deficits detected.";

  const strengthsBlock =
    ctx.verifiedStrengths.length > 0
      ? ctx.verifiedStrengths.map((s) => `- ${s}`).join("\n")
      : "- Moderate features — identify subtle strengths if metrics support them.";

  return `Analyze this facial structure data as a professional looksmaxer. Return JSON only.

FACE SHAPE: ${payload.faceShape.shape} (${payload.faceShape.confidence}% confidence)
${payload.faceShape.reasoning}

METRICS:
Symmetry ${m.symmetry}% | Harmony ${m.harmony}% | Jawline ${m.jawline}%
Eyes ${m.eyes}% | Nose ${m.nose}% | Lips ${m.lips}% | Chin ${m.chinProportion}%
Upper third ${m.upperThird}% | Middle ${m.middleThird}% | Lower ${m.lowerThird}%
Eye spacing ${m.eyeSpacing} | Jaw width ${m.jawWidth}

PRE-ANALYSIS:
Composite ${ctx.compositeScore}/100 | Structural index ${ctx.structuralScore}/100
Metric anchor: ${ctx.suggestedPsl} (${ctx.suggestedPslNumeric}/10)
${ctx.harmonyVerdict}
${ctx.thirds.verdict}

FEATURE INSIGHTS:
${insightsBlock}

AREAS TO OPTIMIZE:
${flawsBlock}

VERIFIED STRENGTHS:
${strengthsBlock}

PSL CALIBRATION GUIDE:
Composite 82+: Chadlite-Chad | 76-81: HTN | 68-75: MTN | 60-67: LTN | 52-59: Sub-5 | below 52: Sub-4 or lower

Stay within 1 tier of anchor ${ctx.suggestedPsl} unless metrics clearly contradict.
Use professional, constructive language. Cite numbers. No XML in output.`;
}
