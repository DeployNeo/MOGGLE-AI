import type { FaceShape, FaceShapeResult, FacialMetrics, LandmarkPoint } from "@/types";

interface ShapeScore {
  shape: FaceShape;
  score: number;
  reasoning: string;
}

function distance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function detectFaceShape(
  landmarks: LandmarkPoint[],
  metrics: FacialMetrics
): FaceShapeResult {
  const forehead = landmarks[10];
  const chin = landmarks[152];
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const leftJaw = landmarks[172];
  const rightJaw = landmarks[397];
  const leftTemple = landmarks[54];
  const rightTemple = landmarks[284];

  const faceHeight = distance(forehead, chin);
  const faceWidth = distance(leftCheek, rightCheek);
  const jawWidth = distance(leftJaw, rightJaw);
  const foreheadWidth = distance(leftTemple, rightTemple);
  const cheekboneWidth = faceWidth;

  const heightToWidth = faceHeight / faceWidth;
  const jawToForehead = jawWidth / foreheadWidth;
  const jawToCheek = jawWidth / cheekboneWidth;
  const foreheadToCheek = foreheadWidth / cheekboneWidth;

  const scores: ShapeScore[] = [];

  scores.push({
    shape: "Oval",
    score:
      100 -
      Math.abs(heightToWidth - 1.4) * 40 -
      Math.abs(jawToForehead - 0.75) * 30,
    reasoning: "Balanced proportions with slightly longer height than width.",
  });

  scores.push({
    shape: "Round",
    score:
      100 -
      Math.abs(heightToWidth - 1.1) * 50 -
      Math.abs(jawToCheek - 0.95) * 40,
    reasoning: "Similar width and height with soft jaw angles.",
  });

  scores.push({
    shape: "Square",
    score:
      100 -
      Math.abs(heightToWidth - 1.15) * 40 -
      Math.abs(jawToCheek - 0.98) * 50 -
      (metrics.jawline > 75 ? 20 : 0),
    reasoning: "Strong jawline with similar forehead and jaw width.",
  });

  scores.push({
    shape: "Rectangle",
    score:
      100 -
      Math.abs(heightToWidth - 1.5) * 30 -
      Math.abs(jawToCheek - 0.95) * 30 -
      (metrics.jawline > 70 ? 15 : 0),
    reasoning: "Longer face with angular jaw structure.",
  });

  scores.push({
    shape: "Diamond",
    score:
      100 -
      Math.abs(foreheadToCheek - 0.85) * 40 -
      Math.abs(jawToCheek - 0.75) * 40,
    reasoning: "Wider cheekbones with narrower forehead and jaw.",
  });

  scores.push({
    shape: "Heart",
    score:
      100 -
      Math.abs(foreheadToCheek - 1.05) * 40 -
      Math.abs(jawToForehead - 0.65) * 40,
    reasoning: "Wider forehead tapering to a narrower chin.",
  });

  scores.push({
    shape: "Triangle",
    score:
      100 -
      Math.abs(jawToForehead - 1.15) * 50 -
      Math.abs(foreheadToCheek - 0.8) * 30,
    reasoning: "Wider jaw with narrower forehead.",
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  return {
    shape: best.shape,
    confidence: Math.min(99, Math.max(50, Math.round(best.score))),
    reasoning: best.reasoning,
  };
}
