import { normalizeScore } from "@/lib/utils";
import type { FacialMetrics, LandmarkPoint } from "@/types";

function distance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );
}

function midpoint(a: LandmarkPoint, b: LandmarkPoint): LandmarkPoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}

function angleDegrees(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

export function calculateFacialMetrics(
  landmarks: LandmarkPoint[]
): FacialMetrics {
  const forehead = landmarks[10];
  const chin = landmarks[152];
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const leftEyeOuter = landmarks[133];
  const rightEyeOuter = landmarks[362];
  const noseTip = landmarks[1];
  const noseBridge = landmarks[6];
  const leftMouth = landmarks[61];
  const rightMouth = landmarks[291];
  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];
  const leftJaw = landmarks[172];
  const rightJaw = landmarks[397];
  const leftBrow = landmarks[70];
  const rightBrow = landmarks[300];
  const glabella = landmarks[9];

  const faceHeight = distance(forehead, chin);
  const faceWidth = distance(leftCheek, rightCheek);
  const jawWidth = distance(leftJaw, rightJaw);
  const eyeSpacing = distance(leftEye, rightEye);
  const eyeWidth = distance(leftEye, landmarks[133]);
  const noseLength = distance(noseBridge, noseTip);
  const mouthWidth = distance(leftMouth, rightMouth);
  const lipHeight = distance(upperLip, lowerLip);
  const chinHeight = distance(lowerLip, chin);
  const foreheadHeight = distance(forehead, glabella);
  const browToNose = distance(midpoint(leftBrow, rightBrow), noseTip);

  const upperThird = foreheadHeight / faceHeight;
  const middleThird = browToNose / faceHeight;
  const lowerThird = 1 - upperThird - middleThird;

  const leftFacePoints = [landmarks[234], landmarks[93], landmarks[172], landmarks[136]];
  const rightFacePoints = [landmarks[454], landmarks[323], landmarks[397], landmarks[365]];
  const faceCenterX = (leftCheek.x + rightCheek.x) / 2;

  let symmetryDiff = 0;
  for (let i = 0; i < leftFacePoints.length; i++) {
    const leftDist = Math.abs(leftFacePoints[i].x - faceCenterX);
    const rightDist = Math.abs(rightFacePoints[i].x - faceCenterX);
    symmetryDiff += Math.abs(leftDist - rightDist);
  }
  const symmetry = normalizeScore(100 - symmetryDiff * 500);

  const idealThird = 1 / 3;
  const thirdDeviation =
    Math.abs(upperThird - idealThird) +
    Math.abs(middleThird - idealThird) +
    Math.abs(lowerThird - idealThird);
  const harmony = normalizeScore(100 - thirdDeviation * 200);

  const widthToHeight = faceWidth / faceHeight;
  const jawToFace = jawWidth / faceWidth;
  const jawline = normalizeScore(
    100 - Math.abs(jawToFace - 0.85) * 150 - Math.abs(widthToHeight - 0.75) * 50
  );

  const eyeRatio = eyeSpacing / eyeWidth;
  const eyes = normalizeScore(100 - Math.abs(eyeRatio - 2.5) * 30);

  const noseToFace = noseLength / faceHeight;
  const noseProportion = normalizeScore(100 - Math.abs(noseToFace - 0.28) * 200);
  const nose = noseProportion;

  const lipToFace = mouthWidth / faceWidth;
  const lipRatio = lipHeight / mouthWidth;
  const lipProportion = normalizeScore(
    100 - Math.abs(lipToFace - 0.45) * 150 - Math.abs(lipRatio - 0.2) * 100
  );
  const lips = lipProportion;

  const chinProportion = normalizeScore(
    100 - Math.abs(chinHeight / faceHeight - 0.18) * 250
  );

  const leftEyeTilt = angleDegrees(leftEye, leftEyeOuter);
  const rightEyeTilt = angleDegrees(rightEye, rightEyeOuter);
  const eyeTilt = normalizeScore(
    100 - (Math.abs(leftEyeTilt) + Math.abs(rightEyeTilt)) * 2
  );

  const canthalLeft = angleDegrees(leftEyeOuter, leftEye);
  const canthalRight = angleDegrees(rightEye, rightEyeOuter);
  const canthalTilt = normalizeScore(
    100 - Math.abs((canthalLeft + canthalRight) / 2 - 5) * 4
  );

  const jawProminence = normalizeScore(
    100 - Math.abs(jawWidth / faceWidth - 0.82) * 180
  );

  const chinProjection = normalizeScore(
    100 - Math.abs(chin.z - noseTip.z) * 800 - Math.abs(chinHeight / faceHeight - 0.18) * 120
  );

  const fifthWidth = faceWidth / 5;
  const facialFifths = [
    distance(landmarks[127], landmarks[234]) / fifthWidth,
    distance(landmarks[234], leftEye) / fifthWidth,
    eyeSpacing / fifthWidth,
    distance(rightEye, landmarks[454]) / fifthWidth,
    distance(landmarks[454], landmarks[356]) / fifthWidth,
  ].map((v) => Math.round(v * 100) / 100);

  return {
    symmetry,
    jawline,
    eyes,
    nose,
    lips,
    harmony,
    faceWidth: Math.round(faceWidth * 1000) / 1000,
    faceHeight: Math.round(faceHeight * 1000) / 1000,
    eyeSpacing: Math.round(eyeSpacing * 1000) / 1000,
    noseProportion: Math.round(noseProportion),
    lipProportion: Math.round(lipProportion),
    jawWidth: Math.round(jawWidth * 1000) / 1000,
    chinProportion: Math.round(chinProportion),
    upperThird: Math.round(upperThird * 100),
    middleThird: Math.round(middleThird * 100),
    lowerThird: Math.round(lowerThird * 100),
    eyeTilt: Math.round(eyeTilt),
    canthalTilt: Math.round(canthalTilt),
    jawProminence: Math.round(jawProminence),
    chinProjection: Math.round(chinProjection),
    facialFifths,
  };
}

export function computeCompositeScore(metrics: FacialMetrics): number {
  return Math.round(
    (metrics.symmetry +
      metrics.harmony +
      metrics.jawline +
      metrics.eyes +
      metrics.nose +
      metrics.lips) /
      6
  );
}
