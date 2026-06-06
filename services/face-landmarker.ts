import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import {
  FACE_LANDMARKER_MODEL,
  LIVE_MIN_FACE_SIZE_RATIO,
  MAX_ROTATION_ANGLE,
  MEDIAPIPE_WASM_PATH,
  MIN_BLUR_SCORE,
  MIN_FACE_SIZE_RATIO,
} from "@/lib/constants";
import type {
  FaceDetectionResult,
  LandmarkPoint,
  ValidationResult,
  ValidationMode,
} from "@/types";
import {
  computeBrightnessScores,
  validateFaceDetectionEnhanced,
} from "@/services/image-validation";

let imageLandmarker: FaceLandmarker | null = null;
let videoLandmarker: FaceLandmarker | null = null;
let imageInitPromise: Promise<FaceLandmarker> | null = null;
let videoInitPromise: Promise<FaceLandmarker> | null = null;

async function createLandmarker(
  runningMode: "IMAGE" | "VIDEO"
): Promise<FaceLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);

  const baseOptions = {
    modelAssetPath: FACE_LANDMARKER_MODEL,
    delegate: "CPU" as const,
  };

  try {
    return await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { ...baseOptions, delegate: "GPU" },
      runningMode,
      numFaces: runningMode === "VIDEO" ? 1 : 2,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
  } catch {
    return FaceLandmarker.createFromOptions(vision, {
      baseOptions,
      runningMode,
      numFaces: runningMode === "VIDEO" ? 1 : 2,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
  }
}

export async function getImageLandmarker(): Promise<FaceLandmarker> {
  if (imageLandmarker) return imageLandmarker;
  if (!imageInitPromise) {
    imageInitPromise = createLandmarker("IMAGE").then((lm) => {
      imageLandmarker = lm;
      return lm;
    });
  }
  return imageInitPromise;
}

export async function getVideoLandmarker(): Promise<FaceLandmarker> {
  if (videoLandmarker) return videoLandmarker;
  if (!videoInitPromise) {
    videoInitPromise = createLandmarker("VIDEO").then((lm) => {
      videoLandmarker = lm;
      return lm;
    });
  }
  return videoInitPromise;
}

export async function preloadFaceLandmarkers(): Promise<void> {
  await Promise.all([getImageLandmarker(), getVideoLandmarker()]);
}

function mapLandmarks(
  raw: Array<{ x: number; y: number; z: number }>
): LandmarkPoint[] {
  return raw.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }));
}

function calculateBlurScore(
  imageData: ImageData,
  landmarks: LandmarkPoint[]
): number {
  const xs = landmarks.map((l) => l.x * imageData.width);
  const ys = landmarks.map((l) => l.y * imageData.height);
  const minX = Math.max(0, Math.floor(Math.min(...xs)) - 20);
  const maxX = Math.min(imageData.width, Math.ceil(Math.max(...xs)) + 20);
  const minY = Math.max(0, Math.floor(Math.min(...ys)) - 20);
  const maxY = Math.min(imageData.height, Math.ceil(Math.max(...ys)) + 20);

  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let count = 0;
  const step = 2;

  for (let y = minY + 1; y < maxY - 1; y += step) {
    for (let x = minX + 1; x < maxX - 1; x += step) {
      const idx = (y * imageData.width + x) * 4;
      const gray =
        imageData.data[idx] * 0.299 +
        imageData.data[idx + 1] * 0.587 +
        imageData.data[idx + 2] * 0.114;

      const idxUp = ((y - 1) * imageData.width + x) * 4;
      const idxDown = ((y + 1) * imageData.width + x) * 4;
      const idxLeft = (y * imageData.width + (x - 1)) * 4;
      const idxRight = (y * imageData.width + (x + 1)) * 4;

      const grayUp =
        imageData.data[idxUp] * 0.299 +
        imageData.data[idxUp + 1] * 0.587 +
        imageData.data[idxUp + 2] * 0.114;
      const grayDown =
        imageData.data[idxDown] * 0.299 +
        imageData.data[idxDown + 1] * 0.587 +
        imageData.data[idxDown + 2] * 0.114;
      const grayLeft =
        imageData.data[idxLeft] * 0.299 +
        imageData.data[idxLeft + 1] * 0.587 +
        imageData.data[idxLeft + 2] * 0.114;
      const grayRight =
        imageData.data[idxRight] * 0.299 +
        imageData.data[idxRight + 1] * 0.587 +
        imageData.data[idxRight + 2] * 0.114;

      const laplacian = Math.abs(
        4 * gray - grayUp - grayDown - grayLeft - grayRight
      );
      laplacianSum += laplacian;
      laplacianSqSum += laplacian * laplacian;
      count++;
    }
  }

  if (count === 0) return 50;

  const mean = laplacianSum / count;
  const variance = laplacianSqSum / count - mean * mean;
  const score = Math.sqrt(Math.max(0, variance)) * 1.8;

  return Math.min(100, Math.max(0, score));
}

function calculateRotation(landmarks: LandmarkPoint[]): number {
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  return Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
}

function calculateFaceSizeRatio(landmarks: LandmarkPoint[]): number {
  const xs = landmarks.map((l) => l.x);
  const ys = landmarks.map((l) => l.y);
  const faceWidth = Math.max(...xs) - Math.min(...xs);
  const faceHeight = Math.max(...ys) - Math.min(...ys);
  return Math.max(faceWidth, faceHeight);
}

function buildDetectionResult(
  landmarks: LandmarkPoint[],
  faceCount: number,
  imageElement?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): FaceDetectionResult {
  if (faceCount === 0 || landmarks.length === 0) {
    return {
      landmarks: [],
      faceCount: 0,
      blurScore: 0,
      faceSizeRatio: 0,
      rotationAngle: 0,
    };
  }

  let blurScore = 75;
  let brightnessScore: number | undefined;
  let overexposureScore: number | undefined;

  if (imageElement) {
    try {
      const canvas = document.createElement("canvas");
      const width =
        imageElement instanceof HTMLVideoElement
          ? imageElement.videoWidth
          : imageElement instanceof HTMLImageElement
            ? imageElement.naturalWidth
            : imageElement.width;
      const height =
        imageElement instanceof HTMLVideoElement
          ? imageElement.videoHeight
          : imageElement instanceof HTMLImageElement
            ? imageElement.naturalHeight
            : imageElement.height;

      if (width > 0 && height > 0) {
        const sampleW = Math.min(320, width);
        const sampleH = Math.round((height / width) * sampleW);
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(imageElement, 0, 0, sampleW, sampleH);
          const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
          blurScore = calculateBlurScore(imageData, landmarks);
          const brightness = computeBrightnessScores(imageData, landmarks);
          brightnessScore = brightness.brightnessScore;
          overexposureScore = brightness.overexposureScore;
        }
      }
    } catch {
      blurScore = 75;
    }
  }

  return {
    landmarks,
    faceCount,
    blurScore,
    faceSizeRatio: calculateFaceSizeRatio(landmarks),
    rotationAngle: calculateRotation(landmarks),
    brightnessScore,
    overexposureScore,
  };
}

export function validateFaceDetection(
  result: FaceDetectionResult,
  mode: ValidationMode = "standard"
): ValidationResult {
  return validateFaceDetectionEnhanced(result, mode);
}

export function getQualityHints(result: FaceDetectionResult): string[] {
  const hints: string[] = [];

  if (result.faceCount === 0) hints.push("Position face in oval guide");
  if (result.faceCount > 1) hints.push("Only one person in frame");
  if (result.faceSizeRatio < LIVE_MIN_FACE_SIZE_RATIO)
    hints.push("Move closer");
  if (result.rotationAngle > MAX_ROTATION_ANGLE)
    hints.push("Look straight at camera");
  if (result.blurScore < MIN_BLUR_SCORE) hints.push("Hold still / add light");

  return hints;
}

export async function detectFaceFromImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<FaceDetectionResult> {
  const landmarker = await getImageLandmarker();

  try {
    const result = landmarker.detect(imageElement);
    const faceCount = result.faceLandmarks.length;

    if (faceCount === 0) {
      return buildDetectionResult([], 0);
    }

    const landmarks = mapLandmarks(result.faceLandmarks[0]);
    return buildDetectionResult(landmarks, faceCount, imageElement);
  } catch {
    return buildDetectionResult([], 0);
  }
}

export async function detectFaceFromVideo(
  videoElement: HTMLVideoElement,
  timestampMs: number
): Promise<FaceDetectionResult> {
  if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
    return buildDetectionResult([], 0);
  }

  const landmarker = await getVideoLandmarker();

  try {
    const result = landmarker.detectForVideo(videoElement, timestampMs);
    const faceCount = result.faceLandmarks.length;

    if (faceCount === 0) {
      return buildDetectionResult([], 0);
    }

    const landmarks = mapLandmarks(result.faceLandmarks[0]);
    return buildDetectionResult(landmarks, faceCount, videoElement);
  } catch {
    return buildDetectionResult([], 0);
  }
}
