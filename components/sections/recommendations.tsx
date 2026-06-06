"use client";

import { useState } from "react";
import {
  Camera,
  ChevronDown,
  Dumbbell,
  Heart,
  Moon,
  Scissors,
  Shirt,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RecommendationSection } from "@/types";

interface RecommendationsProps {
  sections: RecommendationSection[];
}

const sectionIcons: Record<string, React.ReactNode> = {
  Hair: <Scissors className="h-4 w-4" />,
  Skin: <Sun className="h-4 w-4" />,
  Fitness: <Dumbbell className="h-4 w-4" />,
  Posture: <User className="h-4 w-4" />,
  Sleep: <Moon className="h-4 w-4" />,
  Fashion: <Shirt className="h-4 w-4" />,
  Photography: <Camera className="h-4 w-4" />,
  Confidence: <Heart className="h-4 w-4" />,
};

function RecommendationCard({
  section,
  defaultOpen,
}: {
  section: RecommendationSection;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left"
      >
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <span className="text-electric">
              {sectionIcons[section.title] ?? <Sparkles className="h-4 w-4" />}
            </span>
            {section.title}
            <span className="text-[10px] font-normal text-muted-foreground">
              ({section.items.length})
            </span>
          </CardTitle>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180"
            )}
          />
        </CardHeader>
      </button>
      {open && (
        <CardContent className="p-4 pt-0 space-y-3">
          {section.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2"
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-electric/80 mb-0.5">
                  Observation
                </p>
                <p className="text-xs text-muted-foreground">{item.observation}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/60 mb-0.5">
                  Action
                </p>
                <p className="text-xs">{item.recommendation}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-green-400/80 mb-0.5">
                  Benefit
                </p>
                <p className="text-xs text-muted-foreground">{item.benefit}</p>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function Recommendations({ sections }: RecommendationsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-electric" />
        Recommendations
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((section, i) => (
          <RecommendationCard
            key={section.title}
            section={section}
            defaultOpen={i < 2}
          />
        ))}
      </div>
    </section>
  );
}
