"use client";

import { useEffect, useRef, useState } from "react";
import {
  computeTrackingQuality,
  getLiveIntervalMs,
  getUiUpdateMs,
  smoothMetrics,
  type TrackingQuality,
} from "@/lib/tracking";
import { calculateFacialMetrics } from "@/services/face-metrics";
import { detectFaceShape } from "@/services/face-shape";
import {
  detectFaceFromVideo,
  getQualityHints,
  preloadFaceLandmarkers,
  validateFaceDetection,
} from "@/services/face-landmarker";
import type {
  FaceDetectionResult,
  FaceShapeResult,
  FacialMetrics,
  LandmarkPoint,
  LiveAnalysisState,
} from "@/types";
import { useIsMobile } from "@/hooks/use-media-query";

interface UseLiveAnalysisOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export interface UseLiveAnalysisReturn extends LiveAnalysisState {
  metrics: FacialMetrics | null;
  faceShape: FaceShapeResult | null;
  isModelLoading: boolean;
  trackingQuality: TrackingQuality;
  landmarksRef: React.RefObject<LandmarkPoint[] | null>;
}

export function useLiveAnalysis({
  enabled,
  videoRef,
}: UseLiveAnalysisOptions): UseLiveAnalysisReturn {
  const isMobile = useIsMobile();
  const landmarksRef = useRef<LandmarkPoint[] | null>(null);
  const detectionRef = useRef<FaceDetectionResult | null>(null);
  const metricsRef = useRef<FacialMetrics | null>(null);
  const faceShapeRef = useRef<FaceShapeResult | null>(null);
  const processingRef = useRef(false);
  const stabilityRef = useRef(0);

  const [detection, setDetection] = useState<FaceDetectionResult | null>(null);
  const [metrics, setMetrics] = useState<FacialMetrics | null>(null);
  const [faceShape, setFaceShape] = useState<FaceShapeResult | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [fps, setFps] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState<TrackingQuality>({
    score: 0,
    stability: 0,
    faceDetected: false,
    alignment: 0,
    sharpness: 0,
    label: "No face",
  });

  useEffect(() => {
    if (!enabled) {
      landmarksRef.current = null;
      detectionRef.current = null;
      metricsRef.current = null;
      faceShapeRef.current = null;
      stabilityRef.current = 0;
      setDetection(null);
      setMetrics(null);
      setFaceShape(null);
      setHints([]);
      setIsReady(false);
      setTrackingQuality({
        score: 0,
        stability: 0,
        faceDetected: false,
        alignment: 0,
        sharpness: 0,
        label: "No face",
      });
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let uiIntervalId = 0;
    setIsModelLoading(true);

    preloadFaceLandmarkers()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsModelLoading(false);
      });

    const intervalMs = getLiveIntervalMs(isMobile);
    let lastDetect = 0;
    let frameCount = 0;
    let fpsTimer = performance.now();

    const flushUi = () => {
      setDetection(detectionRef.current);
      setMetrics(metricsRef.current);
      setFaceShape(faceShapeRef.current);
      setIsReady(
        detectionRef.current
          ? validateFaceDetection(detectionRef.current, "live").valid
          : false
      );
      if (detectionRef.current) {
        setHints(getQualityHints(detectionRef.current));
        setTrackingQuality(
          computeTrackingQuality(
            detectionRef.current.faceCount,
            detectionRef.current.faceSizeRatio,
            detectionRef.current.rotationAngle,
            detectionRef.current.blurScore,
            stabilityRef.current
          )
        );
      }
    };

    uiIntervalId = window.setInterval(flushUi, getUiUpdateMs(isMobile));

    const loop = async (now: number) => {
      if (cancelled) return;
      rafId = requestAnimationFrame(loop);

      if (now - lastDetect < intervalMs) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || processingRef.current) return;

      lastDetect = now;
      processingRef.current = true;

      try {
        const result = await detectFaceFromVideo(video, now);
        const validation = validateFaceDetection(result, "live");

        detectionRef.current = result;
        landmarksRef.current =
          result.landmarks.length > 0 ? result.landmarks : null;

        if (validation.valid && result.landmarks.length > 0) {
          stabilityRef.current = Math.min(12, stabilityRef.current + 1);
          const raw = calculateFacialMetrics(result.landmarks);
          metricsRef.current = smoothMetrics(metricsRef.current, raw);
          faceShapeRef.current = detectFaceShape(
            result.landmarks,
            metricsRef.current
          );
        } else {
          stabilityRef.current = 0;
          metricsRef.current = null;
          faceShapeRef.current = null;
        }

        frameCount += 1;
        if (now - fpsTimer >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          fpsTimer = now;
        }
      } catch {
        landmarksRef.current = null;
        stabilityRef.current = 0;
      } finally {
        processingRef.current = false;
      }
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearInterval(uiIntervalId);
      processingRef.current = false;
    };
  }, [enabled, videoRef, isMobile]);

  return {
    detection,
    metrics,
    faceShape,
    hints,
    isReady,
    fps,
    isModelLoading,
    trackingQuality,
    landmarksRef,
  };
}
