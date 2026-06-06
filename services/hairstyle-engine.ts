import { HAIRSTYLES } from "@/lib/constants";
import type {
  FaceShape,
  FacialMetrics,
  HairstyleRecommendation,
  LandmarkPoint,
} from "@/types";

interface StyleRule {
  name: string;
  baseScore: number;
  faceShapes: Partial<Record<FaceShape, number>>;
  foreheadBonus: (ratio: number) => number;
  proportionBonus: (metrics: FacialMetrics) => number;
  reasoning: string;
}

function distance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function getForeheadRatio(landmarks: LandmarkPoint[]): number {
  const forehead = landmarks[10];
  const glabella = landmarks[9];
  const chin = landmarks[152];
  const faceHeight = distance(forehead, chin);
  const foreheadHeight = distance(forehead, glabella);
  return foreheadHeight / faceHeight;
}

const STYLE_RULES: StyleRule[] = [
  {
    name: "Buzz Cut",
    baseScore: 70,
    faceShapes: { Oval: 15, Square: 20, Round: 10, Rectangle: 15 },
    foreheadBonus: (r) => (r > 0.35 ? 10 : 0),
    proportionBonus: (m) => (m.symmetry > 80 ? 10 : 0),
    reasoning: "Clean, low-maintenance style that highlights facial structure.",
  },
  {
    name: "Crew Cut",
    baseScore: 72,
    faceShapes: { Oval: 18, Square: 15, Round: 12, Heart: 10 },
    foreheadBonus: (r) => (r > 0.3 ? 8 : 0),
    proportionBonus: (m) => (m.jawline > 75 ? 8 : 0),
    reasoning: "Versatile short style with subtle texture on top.",
  },
  {
    name: "French Crop",
    baseScore: 75,
    faceShapes: { Oval: 15, Round: 18, Square: 12, Rectangle: 10 },
    foreheadBonus: (r) => (r > 0.32 ? 12 : 5),
    proportionBonus: (m) => (m.harmony > 75 ? 8 : 0),
    reasoning: "Textured fringe balances forehead and adds modern edge.",
  },
  {
    name: "Quiff",
    baseScore: 73,
    faceShapes: { Oval: 20, Round: 8, Rectangle: 15, Heart: 12 },
    foreheadBonus: (r) => (r < 0.35 ? 10 : 0),
    proportionBonus: (m) => (m.eyes > 75 ? 10 : 0),
    reasoning: "Volume on top adds height and elongates the face.",
  },
  {
    name: "Textured Fringe",
    baseScore: 76,
    faceShapes: { Oval: 18, Round: 15, Diamond: 12, Heart: 15 },
    foreheadBonus: (r) => (r > 0.3 ? 10 : 5),
    proportionBonus: (m) => (m.symmetry > 78 ? 8 : 0),
    reasoning: "Soft fringe frames the face and adds youthful texture.",
  },
  {
    name: "Curtains",
    baseScore: 74,
    faceShapes: { Oval: 20, Diamond: 15, Heart: 18, Round: 10 },
    foreheadBonus: (r) => (r > 0.28 ? 8 : 0),
    proportionBonus: (m) => (m.eyes > 70 ? 12 : 0),
    reasoning: "Center-parted style frames eyes and balances proportions.",
  },
  {
    name: "Middle Part",
    baseScore: 72,
    faceShapes: { Oval: 18, Diamond: 12, Heart: 15, Round: 8 },
    foreheadBonus: (r) => (r > 0.3 ? 6 : 0),
    proportionBonus: (m) => (m.symmetry > 82 ? 15 : 0),
    reasoning: "Symmetrical parting enhances balanced facial features.",
  },
  {
    name: "Side Part",
    baseScore: 78,
    faceShapes: { Oval: 20, Square: 12, Rectangle: 15, Round: 10 },
    foreheadBonus: () => 5,
    proportionBonus: (m) => (m.harmony > 70 ? 10 : 0),
    reasoning: "Classic versatile style that works across most face shapes.",
  },
  {
    name: "Pompadour",
    baseScore: 70,
    faceShapes: { Oval: 15, Rectangle: 18, Round: 5, Square: 12 },
    foreheadBonus: (r) => (r < 0.33 ? 12 : 0),
    proportionBonus: (m) => (m.jawline > 72 ? 10 : 0),
    reasoning: "Dramatic height adds vertical dimension to the face.",
  },
  {
    name: "Slick Back",
    baseScore: 71,
    faceShapes: { Oval: 18, Square: 15, Rectangle: 12, Diamond: 10 },
    foreheadBonus: (r) => (r < 0.32 ? 8 : 0),
    proportionBonus: (m) => (m.jawline > 78 ? 12 : 0),
    reasoning: "Sleek style showcases strong jawline and bone structure.",
  },
  {
    name: "Undercut",
    baseScore: 74,
    faceShapes: { Oval: 15, Square: 18, Rectangle: 15, Round: 8 },
    foreheadBonus: (r) => (r > 0.3 ? 8 : 5),
    proportionBonus: (m) => (m.jawline > 70 ? 10 : 0),
    reasoning: "Contrast between sides and top creates definition.",
  },
];

export function recommendHairstyles(
  faceShape: FaceShape,
  metrics: FacialMetrics,
  landmarks: LandmarkPoint[]
): HairstyleRecommendation[] {
  const foreheadRatio = getForeheadRatio(landmarks);

  const recommendations = STYLE_RULES.map((rule) => {
    const shapeBonus = rule.faceShapes[faceShape] ?? 0;
    const foreheadBonus = rule.foreheadBonus(foreheadRatio);
    const proportionBonus = rule.proportionBonus(metrics);
    const score = Math.min(
      99,
      rule.baseScore + shapeBonus + foreheadBonus + proportionBonus
    );

    return {
      name: rule.name,
      score,
      reasoning: rule.reasoning,
    };
  });

  recommendations.sort((a, b) => b.score - a.score);

  const top5 = recommendations.slice(0, 5);

  return top5.map((rec) => ({
    ...rec,
    length: rec.score > 85 ? "Short" : rec.score > 75 ? "Medium" : "Medium-long",
    texture: metrics.jawline > 70 ? "Textured matte" : "Light natural texture",
    volume: rec.name.includes("Quiff") || rec.name.includes("Pompadour")
      ? "High volume on top"
      : "Moderate volume",
    products: ["Matte clay or paste", "Sea salt spray for texture", "Light hold hairspray"],
    reasoning: `${rec.reasoning} Particularly suited for ${faceShape.toLowerCase()} face shapes.`,
  }));
}

export function getAllHairstyles(): readonly string[] {
  return HAIRSTYLES;
}
