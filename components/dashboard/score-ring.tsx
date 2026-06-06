"use client";

import { cn, getScoreColor } from "@/lib/utils";

interface ScoreRingProps {
  value: number;
  label: string;
  size?: number;
  className?: string;
}

export function ScoreRing({
  value,
  label,
  size = 88,
  className,
}: ScoreRingProps) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={getScoreColor(value)}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xl font-bold", getScoreColor(value))}>
            {value}
          </span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
}
