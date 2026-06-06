"use client";

import { cn } from "@/lib/utils";
import type { TrackingQuality } from "@/lib/tracking";

interface TrackingQualityBarProps {
  quality: TrackingQuality;
  compact?: boolean;
}

export function TrackingQualityBar({
  quality,
  compact = false,
}: TrackingQualityBarProps) {
  const color =
    quality.score >= 80
      ? "bg-green-400"
      : quality.score >= 65
        ? "bg-electric"
        : quality.score >= 45
          ? "bg-yellow-400"
          : "bg-red-400";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", color)}
            style={{ width: `${quality.score}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground w-14 text-right">
          {quality.label}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Tracking Quality</span>
        <span className="font-medium">{quality.label} · {quality.score}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${quality.score}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
        <span>Align {quality.alignment}%</span>
        <span>Sharp {quality.sharpness}%</span>
        <span>Stable {quality.stability}%</span>
      </div>
    </div>
  );
}
