import { analyzeMetricsForPrompt } from "@/lib/metric-analysis";
import { estimatePslFromMetrics, numericToPslRating } from "@/lib/psl";
import type {
  AIAnalysisResult,
  FaceShapeResult,
  FacialMetrics,
  FeatureBreakdown,
} from "@/types";

function buildFlaws(
  ctx: ReturnType<typeof analyzeMetricsForPrompt>
): string[] {
  const flaws = ctx.criticalFlaws.map((f) =>
    f.replace(/DEFICIENT|BELOW AVERAGE/gi, "").trim()
  );

  if (flaws.length === 0) {
    flaws.push(
      "No major deficits — focus on refinement and presentation to maximize your baseline."
    );
  }

  return flaws;
}

function buildStrengths(
  ctx: ReturnType<typeof analyzeMetricsForPrompt>
): string[] {
  return ctx.verifiedStrengths;
}

function buildFeatureBreakdown(
  metrics: FacialMetrics,
  ctx: ReturnType<typeof analyzeMetricsForPrompt>
): FeatureBreakdown[] {
  return [
    ...ctx.metricInsights.map((m) => ({
      feature: m.name.toLowerCase(),
      score: m.value,
      verdict: m.fact.replace(/DEFICIENT|BELOW AVERAGE|ELITE/gi, (m) =>
        m.toLowerCase()
      ),
    })),
    {
      feature: "chin",
      score: metrics.chinProportion,
      verdict:
        metrics.chinProportion >= 72
          ? `Chin at ${metrics.chinProportion}% — good lower-third projection.`
          : metrics.chinProportion >= 58
            ? `Chin at ${metrics.chinProportion}% — average, improvable with posture and leanness.`
            : `Chin at ${metrics.chinProportion}% — prioritize lower-third optimization.`,
    },
  ];
}

function buildLooksmaxxingPriority(
  flaws: string[],
  metrics: FacialMetrics
): string[] {
  const priorities: string[] = [];

  if (metrics.jawline < 68 || metrics.chinProportion < 62) {
    priorities.push(
      "Reduce body fat to reveal mandible — often the highest-impact change."
    );
    priorities.push("Posture + mewing consistency for jaw presentation.");
  }
  if (metrics.harmony < 72) {
    priorities.push(
      "Choose a hairstyle that balances your facial thirds."
    );
  }
  if (metrics.symmetry < 72) {
    priorities.push(
      "Address asymmetry habits: sleep position, chewing, posture."
    );
  }
  priorities.push("Skincare stack: cleanser, moisturizer, SPF daily.");
  priorities.push("Wardrobe and grooming aligned to your face shape.");

  return priorities.slice(0, 5);
}

export function buildCvFallbackAnalysis(
  metrics: FacialMetrics,
  faceShape: FaceShapeResult
): AIAnalysisResult {
  const ctx = analyzeMetricsForPrompt(metrics, faceShape);
  const psl = estimatePslFromMetrics(metrics);
  const flaws = buildFlaws(ctx);
  const strengths = buildStrengths(ctx);
  const dimorphismScore = Math.round(
    (metrics.jawline + metrics.chinProportion + metrics.harmony) / 3
  );

  const ceilingNumeric = Math.min(8.5, psl.numeric + 1.0);
  const ceilingLabel = numericToPslRating(ceilingNumeric);

  return {
    faceShape: faceShape.shape,
    verdict: `PSL ${psl.rating} (${psl.numeric}/10). ${ctx.harmonyVerdict}`,
    pslRating: psl.rating,
    pslNumeric: psl.numeric,
    pslReasoning: psl.reasoning,
    pslCeiling: `${psl.rating} → ${ceilingLabel} (~${ceilingNumeric.toFixed(1)}/10) with optimized grooming, leanness, and style.`,
    professionalAssessment: `${faceShape.shape} face structure. Composite ${ctx.compositeScore}/100, structural index ${ctx.structuralScore}/100. ${ctx.thirds.verdict} ${
      strengths.length > 0
        ? `Notable strengths: ${strengths.length} feature(s) above baseline.`
        : "Focus on presentation and targeted optimization."
    } Key areas to improve are specific and actionable — not a fixed ceiling.`,
    structuralScore: ctx.structuralScore,
    dimorphismScore: Math.min(100, dimorphismScore),
    featureBreakdown: buildFeatureBreakdown(metrics, ctx),
    strengths,
    flaws,
    improvements: flaws.map((flaw) => {
      const lower = flaw.toLowerCase();
      if (lower.includes("jaw") || lower.includes("chin")) {
        return "Optimize body composition and jaw posture for better lower-third definition.";
      }
      if (lower.includes("asymmetry") || lower.includes("symmetry")) {
        return "Correct posture and daily habits that worsen asymmetry.";
      }
      if (lower.includes("third") || lower.includes("harmony")) {
        return "Use hairstyle and grooming to visually balance facial proportions.";
      }
      return "Target your weakest metric with a consistent grooming and fitness routine.";
    }),
    looksmaxxingPriority: buildLooksmaxxingPriority(flaws, metrics),
    recommendedHaircuts: [],
    recommendedGlasses: [],
    skincare: [
      "Daily SPF and moisturizer — skin quality noticeably affects perceived tier.",
      "Address texture or acne for a cleaner overall presentation.",
    ],
    fitness: [
      "Aim for lean body composition to reveal bone structure.",
      "Neck training and posture work improve jawline presentation.",
    ],
    posture: [
      "Fix forward head posture for an instant profile upgrade.",
      "Consistent tongue posture supports midface and jaw alignment.",
    ],
    confidence: Math.round(psl.numeric * 10),
  };
}
