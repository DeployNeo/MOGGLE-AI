"use client";

import { useCallback, useState } from "react";
import { loadImageFromDataUrl } from "@/lib/image-utils";
import {
  detectFaceFromImage,
  validateFaceDetection,
} from "@/services/face-landmarker";
import { calculateFacialMetrics } from "@/services/face-metrics";
import { detectFaceShape } from "@/services/face-shape";
import { recommendHairstyles } from "@/services/hairstyle-engine";
import { recommendBeards } from "@/services/beard-engine";
import { recommendGlasses } from "@/services/glasses-engine";
import { generateSkinRecommendations } from "@/services/skin-engine";
import { generateFitnessRecommendations } from "@/services/fitness-engine";
import { buildCvFallbackAnalysis } from "@/services/cv-fallback-ai";
import { generateRecommendations } from "@/services/recommendation-engine";
import type {
  AIAnalysisResult,
  AnalysisResult,
  AnalysisStatus,
  FaceDetectionResult,
  ValidationMode,
} from "@/types";

interface UseFaceAnalysisReturn {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  analyze: (imageDataUrl: string) => Promise<{
    result: AnalysisResult | null;
    error: string | null;
  }>;
  analyzeFromDetection: (
    detection: FaceDetectionResult,
    imageDataUrl: string,
    mode?: ValidationMode
  ) => Promise<{
    result: AnalysisResult | null;
    error: string | null;
  }>;
  reset: () => void;
}

async function fetchAIAnalysis(
  metrics: AnalysisResult["metrics"],
  faceShape: AnalysisResult["faceShape"]
): Promise<{ analysis: AIAnalysisResult | null; provider: string }> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metrics, faceShape }),
    });

    if (!response.ok) return { analysis: null, provider: "cv-only" };

    const data = (await response.json()) as {
      analysis: AIAnalysisResult | null;
      provider?: string;
    };
    return { analysis: data.analysis, provider: data.provider ?? "cv-only" };
  } catch {
    return { analysis: null, provider: "cv-only" };
  }
}

async function runAnalysisPipeline(
  detection: FaceDetectionResult,
  imageDataUrl: string,
  mode: ValidationMode = "standard"
): Promise<{ result: AnalysisResult | null; error: string | null }> {
  const validation = validateFaceDetection(detection, mode);

  if (!validation.valid) {
    return { result: null, error: validation.message };
  }

  const metrics = calculateFacialMetrics(detection.landmarks);
  const faceShape = detectFaceShape(detection.landmarks, metrics);
  const hairstyles = recommendHairstyles(
    faceShape.shape,
    metrics,
    detection.landmarks
  );
  const beards = recommendBeards(faceShape.shape, metrics);
  const glasses = recommendGlasses(faceShape.shape, metrics);
  const skin = generateSkinRecommendations(metrics);
  const fitness = generateFitnessRecommendations(metrics);

  const { analysis: aiFromApi, provider } = await fetchAIAnalysis(
    metrics,
    faceShape
  );
  const aiAnalysis = aiFromApi ?? buildCvFallbackAnalysis(metrics, faceShape);

  const recommendations = generateRecommendations(
    metrics,
    faceShape,
    hairstyles,
    aiAnalysis
  );

  return {
    result: {
      metrics,
      faceShape,
      hairstyles,
      beards,
      glasses,
      skin,
      fitness,
      aiAnalysis,
      recommendations,
      imageDataUrl,
      analyzedAt: Date.now(),
      aiProvider: provider,
    },
    error: null,
  };
}

export function useFaceAnalysis(): UseFaceAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeFromDetection = useCallback(
    async (
      detection: FaceDetectionResult,
      imageDataUrl: string,
      mode: ValidationMode = "standard"
    ) => {
      setStatus("analyzing");
      setError(null);

      try {
        const { result: analysisResult, error: analysisError } =
          await runAnalysisPipeline(detection, imageDataUrl, mode);

        if (analysisError) {
          setError(analysisError);
          setStatus("error");
          return { result: null, error: analysisError };
        }

        setResult(analysisResult);
        setStatus("success");
        return { result: analysisResult, error: null };
      } catch {
        const message = "Analysis failed. Please try again.";
        setError(message);
        setStatus("error");
        return { result: null, error: message };
      }
    },
    []
  );

  const analyze = useCallback(async (imageDataUrl: string) => {
    setStatus("loading");
    setError(null);

    try {
      const image = await loadImageFromDataUrl(imageDataUrl);
      setStatus("analyzing");

      const detection = await detectFaceFromImage(image);
      const { result: analysisResult, error: analysisError } =
        await runAnalysisPipeline(detection, imageDataUrl, "standard");

      if (analysisError) {
        setError(analysisError);
        setStatus("error");
        return { result: null, error: analysisError };
      }

      setResult(analysisResult);
      setStatus("success");
      return { result: analysisResult, error: null };
    } catch {
      const message =
        "Analysis failed. Please try again with a clear, well-lit photo.";
      setError(message);
      setStatus("error");
      return { result: null, error: message };
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, analyze, analyzeFromDetection, reset };
}
