import type {
  AIAnalysisResult,
  FaceShapeResult,
  FacialMetrics,
  HairstyleRecommendation,
  RecommendationItem,
  RecommendationSection,
} from "@/types";

function buildHairSection(
  hairstyles: HairstyleRecommendation[],
  ai: AIAnalysisResult | null
): RecommendationSection {
  const items: RecommendationItem[] = hairstyles.slice(0, 3).map((h) => ({
    observation: `Your facial structure aligns well with a ${h.name.toLowerCase()}.`,
    recommendation: `Consider trying a ${h.name} — ${h.reasoning}`,
    benefit: "A complementary hairstyle can enhance your natural proportions and boost confidence.",
  }));

  if (ai?.recommendedHaircuts) {
    ai.recommendedHaircuts.slice(0, 2).forEach((cut) => {
      if (!items.some((i) => i.recommendation.includes(cut))) {
        items.push({
          observation: "AI analysis identified additional style compatibility.",
          recommendation: `Explore a ${cut} for a fresh look.`,
          benefit: "Tailored to your unique facial geometry.",
        });
      }
    });
  }

  return { title: "Hair", items };
}

function buildSkinSection(ai: AIAnalysisResult | null, metrics: FacialMetrics): RecommendationSection {
  const items: RecommendationItem[] = [];

  if (ai?.skincare && ai.skincare.length > 0) {
    ai.skincare.forEach((tip) => {
      items.push({
        observation: "Based on your facial analysis.",
        recommendation: tip,
        benefit: "Healthy skin enhances overall presentation.",
      });
    });
  } else {
    items.push({
      observation: `Facial symmetry score: ${metrics.symmetry}%.`,
      recommendation: "Maintain a consistent skincare routine with cleanser, moisturizer, and SPF.",
      benefit: "Protects skin health and supports an even complexion.",
    });
    items.push({
      observation: "General grooming foundation.",
      recommendation: "Stay hydrated and get adequate sleep for skin recovery.",
      benefit: "Internal health reflects in skin appearance.",
    });
  }

  return { title: "Skin", items };
}

function buildFitnessSection(ai: AIAnalysisResult | null): RecommendationSection {
  const items: RecommendationItem[] = [];

  if (ai?.fitness && ai.fitness.length > 0) {
    ai.fitness.forEach((tip) => {
      items.push({
        observation: "Structural analysis insight.",
        recommendation: tip,
        benefit: "Overall fitness supports facial definition and energy.",
      });
    });
  } else {
    items.push({
      observation: "Jaw and neck area benefit from overall fitness.",
      recommendation: "Include cardio and resistance training 3-4 times per week.",
      benefit: "Reduces facial bloating and improves muscle tone.",
    });
    items.push({
      observation: "Facial fat distribution is influenced by body composition.",
      recommendation: "Maintain a balanced diet rich in whole foods.",
      benefit: "Supports lean facial contours over time.",
    });
  }

  return { title: "Fitness", items };
}

function buildPostureSection(ai: AIAnalysisResult | null): RecommendationSection {
  const items: RecommendationItem[] = [];

  if (ai?.posture && ai.posture.length > 0) {
    ai.posture.forEach((tip) => {
      items.push({
        observation: "Posture affects perceived facial alignment.",
        recommendation: tip,
        benefit: "Better posture projects confidence and improves appearance.",
      });
    });
  } else {
    items.push({
      observation: "Head position affects how your face is perceived.",
      recommendation: "Practice chin-tuck exercises and desk ergonomics.",
      benefit: "Reduces forward head posture and neck strain.",
    });
    items.push({
      observation: "Shoulder alignment impacts overall presentation.",
      recommendation: "Perform daily shoulder rolls and chest stretches.",
      benefit: "Opens up your frame and improves profile appearance.",
    });
  }

  return { title: "Posture", items };
}

function buildSleepSection(): RecommendationSection {
  return {
    title: "Sleep",
    items: [
      {
        observation: "Sleep quality directly impacts skin and facial appearance.",
        recommendation: "Aim for 7-9 hours of consistent sleep nightly.",
        benefit: "Reduces under-eye circles and supports skin repair.",
      },
      {
        observation: "Sleep position can affect facial symmetry over time.",
        recommendation: "Try sleeping on your back with a silk pillowcase.",
        benefit: "Minimizes sleep lines and reduces friction on skin.",
      },
    ],
  };
}

function buildFashionSection(
  ai: AIAnalysisResult | null,
  faceShape: FaceShapeResult
): RecommendationSection {
  const items: RecommendationItem[] = [];

  if (ai?.recommendedGlasses && ai.recommendedGlasses.length > 0) {
    ai.recommendedGlasses.forEach((frame) => {
      items.push({
        observation: `Your ${faceShape.shape.toLowerCase()} face shape guides frame selection.`,
        recommendation: `Consider ${frame} frames.`,
        benefit: "Complementary eyewear balances facial proportions.",
      });
    });
  } else {
    const frameMap: Record<string, string> = {
      Oval: "most frame shapes, especially rectangular or aviator",
      Round: "angular or rectangular frames for contrast",
      Square: "round or oval frames to soften angles",
      Rectangle: "wide frames or aviators to add width",
      Diamond: "oval or cat-eye frames to highlight cheekbones",
      Heart: "bottom-heavy frames or light-colored rims",
      Triangle: "top-heavy frames like cat-eye or browline",
    };
    items.push({
      observation: `${faceShape.shape} face shape detected with ${faceShape.confidence}% confidence.`,
      recommendation: `Eyewear suggestion: ${frameMap[faceShape.shape] ?? "versatile frames"}.`,
      benefit: "Proper frame selection enhances facial harmony.",
    });
  }

  items.push({
    observation: "Neckline choices affect perceived face shape.",
    recommendation: "Choose V-necks for round faces, crew necks for longer faces.",
    benefit: "Creates visual balance in your overall look.",
  });

  return { title: "Fashion", items };
}

function buildPhotographySection(metrics: FacialMetrics): RecommendationSection {
  return {
    title: "Photography",
    items: [
      {
        observation: `Eye spacing proportion: ${metrics.eyes}%.`,
        recommendation: "Position camera slightly above eye level for flattering angles.",
        benefit: "Defines jawline and reduces double-chin appearance.",
      },
      {
        observation: "Lighting dramatically affects facial perception.",
        recommendation: "Use soft, diffused natural light facing a window.",
        benefit: "Minimizes harsh shadows and highlights your best features.",
      },
      {
        observation: "Symmetry score informs photo composition.",
        recommendation: metrics.symmetry > 80
          ? "A straight-on angle showcases your balanced features."
          : "A slight 3/4 angle can create visual interest.",
        benefit: "Optimized angles for your unique structure.",
      },
    ],
  };
}

function buildConfidenceSection(
  ai: AIAnalysisResult | null,
  metrics: FacialMetrics
): RecommendationSection {
  const items: RecommendationItem[] = [];

  if (ai?.pslRating) {
    items.push({
      observation: ai.verdict || `PSL ${ai.pslRating} (${ai.pslNumeric}/10). Structural: ${ai.structuralScore}/100.`,
      recommendation: ai.professionalAssessment || ai.pslReasoning,
      benefit: `Ceiling with looksmaxxing: ${ai.pslCeiling || "see priority list"}.`,
    });
  }

  if (ai?.looksmaxxingPriority && ai.looksmaxxingPriority.length > 0) {
    items.push({
      observation: "Highest-ROI action identified.",
      recommendation: ai.looksmaxxingPriority[0],
      benefit: "Execute #1 priority before anything else — compounding gains.",
    });
  }

  if (ai?.flaws && ai.flaws.length > 0) {
    ai.flaws.slice(0, 2).forEach((flaw) => {
      items.push({
        observation: flaw,
        recommendation:
          "Accept the baseline honestly, then execute a looksmaxxing plan targeting this weakness.",
        benefit: "Denial wastes time; clarity enables targeted improvement.",
      });
    });
  }

  if (ai?.strengths && ai.strengths.length > 0) {
    ai.strengths.slice(0, 1).forEach((strength) => {
      items.push({
        observation: `Verified asset: ${strength}`,
        recommendation: "Lead with this in photos and grooming — don't hide your only edge.",
        benefit: "Maximizing real strengths is higher ROI than fixing minor flaws.",
      });
    });
  } else if (!ai) {
    items.push({
      observation: `Harmony ${metrics.harmony}%, symmetry ${metrics.symmetry}%.`,
      recommendation:
        "No AI depth available — assume average (MTN/LTN) until proven otherwise.",
      benefit: "Default to honest self-assessment, not wishful thinking.",
    });
  }

  if (ai?.improvements && ai.improvements.length > 0) {
    items.push({
      observation: "Looksmaxxing path identified.",
      recommendation: ai.improvements[0],
      benefit: "Consistent execution on weak points can shift PSL over time.",
    });
  }

  return { title: "Confidence", items };
}

export function generateRecommendations(
  metrics: FacialMetrics,
  faceShape: FaceShapeResult,
  hairstyles: HairstyleRecommendation[],
  aiAnalysis: AIAnalysisResult | null
): RecommendationSection[] {
  return [
    buildHairSection(hairstyles, aiAnalysis),
    buildSkinSection(aiAnalysis, metrics),
    buildFitnessSection(aiAnalysis),
    buildPostureSection(aiAnalysis),
    buildSleepSection(),
    buildFashionSection(aiAnalysis, faceShape),
    buildPhotographySection(metrics),
    buildConfidenceSection(aiAnalysis, metrics),
  ];
}
