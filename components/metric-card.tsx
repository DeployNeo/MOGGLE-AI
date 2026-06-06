"use client";

import { Progress } from "@/components/ui/progress";
import { cn, formatPercent, getScoreColor } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  className?: string;
}

export function MetricCard({ label, value, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground truncate">
          {label}
        </span>
        <span className={cn("text-base sm:text-lg font-semibold shrink-0", getScoreColor(value))}>
          {formatPercent(value)}
        </span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
