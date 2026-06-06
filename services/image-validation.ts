import {
  LIVE_MIN_FACE_SIZE_RATIO,
  MAX_ROTATION_ANGLE,
  MIN_BLUR_SCORE,
  MIN_FACE_SIZE_RATIO,
} from "@/lib/constants";
import type {
  FaceDetectionResult,
  ValidationMode,
  ValidationResult,
} from "@/types";

const MIN_BRIGHTNESS = 35;
const MAX_BRIGHTNESS = 92;
const MIN_OVEREXPOSURE = 15;

function isPartiallyHidden(landmarks: FaceDetectionResult["landmarks"]): boolean {
  if (landmarks.length < 468) return true;

  const keyIndices = [1, 33, 263, 61, 291, 152, 10];
  for (const idx of keyIndices) {
    const p = landmarks[idx];
    if (p.x < 0.02 || p.x > 0.98 || p.y < 0.02 || p.y > 0.98) {
      return true;
    }
  }
  return false;
}

export function validateFaceDetectionEnhanced(
  result: FaceDetectionResult,
  mode: ValidationMode = "standard"
): ValidationResult {
  if (result.faceCount === 0) {
    return {
      valid: false,
      message: "No face detected. Center your face in the frame.",
    };
  }

  if (result.faceCount > 1 && mode !== "live") {
    return {
      valid: false,
      message: "Multiple faces detected. Only one face allowed.",
    };
  }

  const minSize =
    mode === "live" ? LIVE_MIN_FACE_SIZE_RATIO : MIN_FACE_SIZE_RATIO;

  if (result.faceSizeRatio < minSize) {
    return {
      valid: false,
      message: "Move closer — face is too small in frame.",
    };
  }

  if (result.rotationAngle > MAX_ROTATION_ANGLE) {
    return {
      valid: false,
      message: "Face the camera directly — extreme angle detected.",
    };
  }

  if (mode !== "live" && result.blurScore < MIN_BLUR_SCORE) {
    return {
      valid: false,
      message: `Image too blurry (sharpness ${Math.round(result.blurScore)}%). Hold steady and improve lighting.`,
    };
  }

  if (
    mode !== "live" &&
    result.brightnessScore !== undefined &&
    result.brightnessScore < MIN_BRIGHTNESS
  ) {
    return {
      valid: false,
      message: "Image too dark. Move to a well-lit area or add front lighting.",
    };
  }

  if (
    mode !== "live" &&
    result.brightnessScore !== undefined &&
    result.brightnessScore > MAX_BRIGHTNESS
  ) {
    return {
      valid: false,
      message: "Image overexposed. Reduce direct light on your face.",
    };
  }

  if (
    mode !== "live" &&
    result.overexposureScore !== undefined &&
    result.overexposureScore > MIN_OVEREXPOSURE
  ) {
    return {
      valid: false,
      message: "Highlights are blown out. Soften lighting for accurate analysis.",
    };
  }

  if (mode !== "live" && isPartiallyHidden(result.landmarks)) {
    return {
      valid: false,
      message: "Face partially hidden. Ensure full face is visible.",
    };
  }

  return { valid: true, message: "" };
}

export function computeBrightnessScores(
  imageData: ImageData,
  landmarks: FaceDetectionResult["landmarks"]
): { brightnessScore: number; overexposureScore: number } {
  const xs = landmarks.map((l) => l.x * imageData.width);
  const ys = landmarks.map((l) => l.y * imageData.height);
  const minX = Math.max(0, Math.floor(Math.min(...xs)));
  const maxX = Math.min(imageData.width, Math.ceil(Math.max(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(imageData.height, Math.ceil(Math.max(...ys)));

  let sum = 0;
  let clipped = 0;
  let count = 0;
  const step = 3;

  for (let y = minY; y < maxY; y += step) {
    for (let x = minX; x < maxX; x += step) {
      const idx = (y * imageData.width + x) * 4;
      const lum =
        imageData.data[idx] * 0.299 +
        imageData.data[idx + 1] * 0.587 +
        imageData.data[idx + 2] * 0.114;
      sum += lum;
      if (lum > 245) clipped++;
      count++;
    }
  }

  if (count === 0) {
    return { brightnessScore: 50, overexposureScore: 0 };
  }

  const avg = sum / count;
  const brightnessScore = Math.round((avg / 255) * 100);
  const overexposureScore = Math.round((clipped / count) * 100);

  return { brightnessScore, overexposureScore };
}
