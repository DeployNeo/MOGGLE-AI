"use client";

import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { TrackingQualityBar } from "@/components/dashboard/tracking-quality-bar";
import { cn, formatPercent, getScoreColor } from "@/lib/utils";
import type { TrackingQuality } from "@/lib/tracking";
import type { FaceShapeResult, FacialMetrics } from "@/types";

interface LiveMetricsHudProps {
  metrics: FacialMetrics | null;
  faceShape: FaceShapeResult | null;
  isReady: boolean;
  hints: string[];
  fps: number;
  isModelLoading: boolean;
  trackingQuality: TrackingQuality;
}

export function LiveMetricsHud({
  metrics,
  faceShape,
  isReady,
  hints,
  fps,
  isModelLoading,
  trackingQuality,
}: LiveMetricsHudProps) {
  if (isModelLoading) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-4">
        <p className="text-xs text-electric animate-pulse text-center">
          Loading face detection model...
        </p>
      </div>
    );
  }

  const quickMetrics = metrics
    ? [
        { label: "Sym", value: metrics.symmetry },
        { label: "Har", value: metrics.harmony },
        { label: "Jaw", value: metrics.jawline },
        { label: "Eye", value: metrics.eyes },
      ]
    : [];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-4 pointer-events-none">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isReady ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          )}
          <span
            className={cn(
              "text-[10px] sm:text-xs font-medium truncate",
              isReady ? "text-green-400" : "text-yellow-400"
            )}
          >
            {isReady ? "Tracking locked" : "Adjust position"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
          <Activity className="h-3 w-3" />
          {fps}
        </div>
      </div>

      <div className="mb-2">
        <TrackingQualityBar quality={trackingQuality} compact />
      </div>

      {faceShape && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 truncate">
          {faceShape.shape} · {faceShape.confidence}%
        </p>
      )}

      {quickMetrics.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {quickMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-md bg-white/5 border border-white/10 px-1.5 py-1 text-center"
            >
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
              <p className={cn("text-xs font-semibold", getScoreColor(m.value))}>
                {formatPercent(m.value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isReady && hints.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {hints.slice(0, 2).map((hint) => (
            <span
              key={hint}
              className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[9px] text-yellow-300"
            >
              {hint}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
