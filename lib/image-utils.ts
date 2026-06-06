import imageCompression from "browser-image-compression";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/constants";
import type { ValidationResult } from "@/types";

export function validateImageFile(file: File): ValidationResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: "Please upload a JPG, PNG, or WEBP image.",
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      message: `Image must be smaller than ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  return { valid: true, message: "" };
}

export async function compressImage(file: File): Promise<File> {
  if (file.size <= 1024 * 1024) {
    return file;
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type,
  });

  return compressed;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = dataUrl;
  });
}

export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  quality = 0.92
): string {
  return canvas.toDataURL("image/jpeg", quality);
}

export function captureVideoFrame(
  video: HTMLVideoElement,
  width?: number,
  height?: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width ?? video.videoWidth;
  canvas.height = height ?? video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context.");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvasToDataUrl(canvas);
}
