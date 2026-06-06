import type { FaceShape, FacialMetrics, GlassesRecommendation } from "@/types";

const FRAMES = [
  "Aviator",
  "Round",
  "Rectangle",
  "Wayfarer",
  "Clubmaster",
] as const;

const SHAPE_MAP: Record<FaceShape, Record<(typeof FRAMES)[number], number>> = {
  Oval: { Aviator: 88, Round: 75, Rectangle: 82, Wayfarer: 85, Clubmaster: 80 },
  Round: { Aviator: 78, Round: 55, Rectangle: 92, Wayfarer: 85, Clubmaster: 82 },
  Square: { Aviator: 82, Round: 90, Rectangle: 70, Wayfarer: 78, Clubmaster: 85 },
  Rectangle: { Aviator: 90, Round: 72, Rectangle: 65, Wayfarer: 88, Clubmaster: 80 },
  Diamond: { Aviator: 85, Round: 80, Rectangle: 78, Wayfarer: 82, Clubmaster: 92 },
  Heart: { Aviator: 88, Round: 78, Rectangle: 75, Wayfarer: 90, Clubmaster: 85 },
  Triangle: { Aviator: 82, Round: 75, Rectangle: 70, Wayfarer: 78, Clubmaster: 92 },
};

function reasoningFor(
  frame: (typeof FRAMES)[number],
  shape: FaceShape
): string {
  const notes: Record<(typeof FRAMES)[number], string> = {
    Aviator: "Teardrop lenses add width and soften vertical length.",
    Round: "Curved rims contrast angular features and soften the profile.",
    Rectangle: "Horizontal lines add structure to softer face shapes.",
    Wayfarer: "Bold upper frame balances cheek width and brow line.",
    Clubmaster: "Browline emphasis suits diamond and heart proportions.",
  };
  return `${frame} frames complement ${shape.toLowerCase()} geometry. ${notes[frame]}`;
}

export function recommendGlasses(
  shape: FaceShape,
  metrics: FacialMetrics
): GlassesRecommendation[] {
  const base = SHAPE_MAP[shape];
  const eyeBonus = (metrics.eyes - 50) * 0.1;

  return FRAMES.map((style) => ({
    style,
    score: Math.round(Math.min(98, base[style] + eyeBonus)),
    reasoning: reasoningFor(style, shape),
  })).sort((a, b) => b.score - a.score);
}
