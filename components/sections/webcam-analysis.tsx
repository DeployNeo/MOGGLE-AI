"use client";

import { Brain, Scan, Video, VideoOff } from "lucide-react";
import { useCallback } from "react";
import { FaceMeshCanvas } from "@/components/face-mesh-canvas";
import { TrackingQualityBar } from "@/components/dashboard/tracking-quality-bar";
import { LiveMetricsHud } from "@/components/live-metrics-hud";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLiveAnalysis } from "@/hooks/use-live-analysis";
import { useWebcam } from "@/hooks/use-webcam";
import { captureVideoFrame } from "@/lib/image-utils";
import type { AnalysisStatus, FaceDetectionResult } from "@/types";

interface WebcamAnalysisProps {
  onLiveAnalyze: (
    detection: FaceDetectionResult,
    imageDataUrl: string
  ) => void;
  analysisStatus: AnalysisStatus;
  compact?: boolean;
}

export function WebcamAnalysis({
  onLiveAnalyze,
  analysisStatus,
  compact = false,
}: WebcamAnalysisProps) {
  const { videoRef, isActive, isLoading, error, start, stop } = useWebcam();
  const live = useLiveAnalysis({ enabled: isActive, videoRef });

  const isAnalyzing =
    analysisStatus === "loading" || analysisStatus === "analyzing";

  const handleFullAnalysis = useCallback(() => {
    if (!videoRef.current || !live.detection || !live.isReady) return;
    const dataUrl = captureVideoFrame(videoRef.current);
    onLiveAnalyze(live.detection, dataUrl);
  }, [videoRef, live.detection, live.isReady, onLiveAnalyze]);

  return (
    <Card className="overflow-hidden border-white/10 bg-card/40">
      <CardHeader className={compact ? "p-4 pb-2" : "p-4 sm:p-6"}>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Video className="h-5 w-5 text-electric shrink-0" />
          Live Webcam
        </CardTitle>
        {!compact && (
          <CardDescription className="text-xs sm:text-sm">
            Real-time tracking with mesh overlay. Full AI report on demand.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden rounded-xl bg-black border border-white/10">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90">
              <LoadingSpinner label="Starting camera..." />
            </div>
          )}

          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
              <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-electric/10 border border-electric/20">
                <Scan className="h-7 w-7 sm:h-10 sm:w-10 text-electric" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Tap start for instant live analysis
              </p>
            </div>
          )}

          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)] ${isActive ? "block" : "hidden"}`}
            playsInline
            muted
            autoPlay
          />

          {isActive && (
            <>
              <FaceMeshCanvas
                landmarksRef={live.landmarksRef}
                active={isActive}
                mirrored
                className="absolute inset-0 z-10 pointer-events-none"
              />

              <div className="absolute inset-0 z-[5] pointer-events-none p-[10%] sm:p-[12%]">
                <div
                  className={`h-full w-full rounded-[50%] border-2 transition-colors duration-300 ${
                    live.isReady
                      ? "border-green-400/50"
                      : "border-electric/30"
                  }`}
                />
              </div>

              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-wrap gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-semibold text-white uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
                {live.isReady && (
                  <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-[9px] text-green-300">
                    Locked
                  </span>
                )}
              </div>

              <LiveMetricsHud
                metrics={live.metrics}
                faceShape={live.faceShape}
                isReady={live.isReady}
                hints={live.hints}
                fps={live.fps}
                isModelLoading={live.isModelLoading}
                trackingQuality={live.trackingQuality}
              />
            </>
          )}
        </div>

        {error && (
          <p className="text-xs sm:text-sm text-red-400 text-center">{error}</p>
        )}

        {isActive && !compact && (
          <TrackingQualityBar quality={live.trackingQuality} />
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-center">
          {!isActive ? (
            <Button
              onClick={start}
              disabled={isLoading || isAnalyzing}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Video className="h-4 w-4" />
              Start Live Analysis
            </Button>
          ) : (
            <>
              <Button
                onClick={handleFullAnalysis}
                disabled={!live.isReady || isAnalyzing}
                size="lg"
                className="w-full sm:w-auto sm:min-w-[160px]"
              >
                <Brain className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Full AI Report"}
              </Button>
              <Button
                variant="outline"
                onClick={stop}
                disabled={isAnalyzing}
                className="w-full sm:w-auto"
              >
                <VideoOff className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
