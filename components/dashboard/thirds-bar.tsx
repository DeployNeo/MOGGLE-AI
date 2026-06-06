"use client";

import { cn } from "@/lib/utils";

interface ThirdsBarProps {
  upper: number;
  middle: number;
  lower: number;
  className?: string;
}

export function ThirdsBar({ upper, middle, lower, className }: ThirdsBarProps) {
  const ideal = 33.33;
  const segments = [
    { label: "Upper", value: upper, ideal },
    { label: "Middle", value: middle, ideal },
    { label: "Lower", value: lower, ideal },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
        {segments.map((s) => (
          <div
            key={s.label}
            className="h-full bg-electric/70 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${s.value}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {segments.map((s) => {
          const dev = Math.abs(s.value - s.ideal);
          return (
            <div key={s.label} className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase">
                {s.label}
              </p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  dev <= 3
                    ? "text-green-400"
                    : dev <= 7
                      ? "text-yellow-400"
                      : "text-red-400"
                )}
              >
                {s.value}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
