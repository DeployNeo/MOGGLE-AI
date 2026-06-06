import type { FacialMetrics, LandmarkPoint } from "@/types";

export function smoothMetrics(
  prev: FacialMetrics | null,
  next: FacialMetrics,
  alpha = 0.35
): FacialMetrics {
  if (!prev) return next;
  const blend = (a: number, b: number) =>
    Math.round(a * (1 - alpha) + b * alpha);

  return {
    symmetry: blend(prev.symmetry, next.symmetry),
    jawline: blend(prev.jawline, next.jawline),
    eyes: blend(prev.eyes, next.eyes),
    nose: blend(prev.nose, next.nose),
    lips: blend(prev.lips, next.lips),
    harmony: blend(prev.harmony, next.harmony),
    faceWidth: next.faceWidth,
    faceHeight: next.faceHeight,
    eyeSpacing: next.eyeSpacing,
    noseProportion: blend(prev.noseProportion, next.noseProportion),
    lipProportion: blend(prev.lipProportion, next.lipProportion),
    jawWidth: next.jawWidth,
    chinProportion: blend(prev.chinProportion, next.chinProportion),
    upperThird: blend(prev.upperThird, next.upperThird),
    middleThird: blend(prev.middleThird, next.middleThird),
    lowerThird: blend(prev.lowerThird, next.lowerThird),
    eyeTilt: blend(prev.eyeTilt, next.eyeTilt),
    canthalTilt: blend(prev.canthalTilt, next.canthalTilt),
    jawProminence: blend(prev.jawProminence, next.jawProminence),
    chinProjection: blend(prev.chinProjection, next.chinProjection),
    facialFifths: next.facialFifths,
  };
}

export interface TrackingQuality {
  score: number;
  stability: number;
  faceDetected: boolean;
  alignment: number;
  sharpness: number;
  label: string;
}

export function computeTrackingQuality(
  faceCount: number,
  faceSizeRatio: number,
  rotationAngle: number,
  blurScore: number,
  stabilityFrames: number
): TrackingQuality {
  if (faceCount === 0) {
    return {
      score: 0,
      stability: 0,
      faceDetected: false,
      alignment: 0,
      sharpness: 0,
      label: "No face",
    };
  }

  const sizeScore = Math.min(100, (faceSizeRatio / 0.2) * 100);
  const rotationScore = Math.max(0, 100 - rotationAngle * 3);
  const blurNorm = Math.min(100, blurScore * 2);
  const stabilityScore = Math.min(100, stabilityFrames * 8);

  const alignment = Math.round((sizeScore + rotationScore) / 2);
  const sharpness = Math.round(blurNorm);
  const score = Math.round(
    alignment * 0.35 + sharpness * 0.25 + stabilityScore * 0.4
  );

  let label = "Poor";
  if (score >= 80) label = "Excellent";
  else if (score >= 65) label = "Good";
  else if (score >= 45) label = "Fair";

  return {
    score,
    stability: stabilityScore,
    faceDetected: true,
    alignment,
    sharpness,
    label,
  };
}

export function getLiveIntervalMs(isMobile: boolean): number {
  return isMobile ? 180 : 130;
}

export function getUiUpdateMs(isMobile: boolean): number {
  return isMobile ? 300 : 200;
}

export function simplifyLandmarksForMesh(
  landmarks: LandmarkPoint[]
): LandmarkPoint[] {
  return landmarks;
}
