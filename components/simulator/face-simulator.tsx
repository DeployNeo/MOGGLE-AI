"use client";

import { useState } from "react";
import { Glasses, Scissors, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const HAIR_STYLES = ["Buzz Cut", "French Crop", "Quiff", "Curtains", "Textured Fringe"];
const BEARD_STYLES = ["Clean shave", "Stubble", "Short boxed beard", "Goatee", "Full beard"];
const GLASSES_STYLES = ["Aviator", "Round", "Rectangle", "Wayfarer", "Clubmaster"];

interface FaceSimulatorProps {
  faceShape: string;
}

export function FaceSimulator({ faceShape }: FaceSimulatorProps) {
  const [category, setCategory] = useState<"hair" | "beard" | "glasses">("hair");
  const [selection, setSelection] = useState<string>(HAIR_STYLES[0]);

  const options =
    category === "hair"
      ? HAIR_STYLES
      : category === "beard"
        ? BEARD_STYLES
        : GLASSES_STYLES;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Face Shape Simulator</CardTitle>
        <p className="text-xs text-muted-foreground">
          Preview styles for your {faceShape.toLowerCase()} face before committing
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <Tabs
          value={category}
          onValueChange={(v) => {
            setCategory(v as typeof category);
            const next =
              v === "hair" ? HAIR_STYLES[0] : v === "beard" ? BEARD_STYLES[0] : GLASSES_STYLES[0];
            setSelection(next);
          }}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="hair" className="text-xs gap-1">
              <Scissors className="h-3 w-3" /> Hair
            </TabsTrigger>
            <TabsTrigger value="beard" className="text-xs gap-1">
              <User className="h-3 w-3" /> Beard
            </TabsTrigger>
            <TabsTrigger value="glasses" className="text-xs gap-1">
              <Glasses className="h-3 w-3" /> Glasses
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative mx-auto max-w-xs aspect-[3/4] rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-black flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-36 rounded-[50%] bg-gradient-to-b from-zinc-700 to-zinc-900 border border-white/20 relative">
              {category === "hair" && (
                <div
                  className={cn(
                    "absolute -top-4 left-1/2 -translate-x-1/2 rounded-t-full bg-zinc-800 border border-white/20",
                    selection.includes("Buzz") ? "w-36 h-8" : "w-40 h-14"
                  )}
                />
              )}
              {category === "beard" && selection !== "Clean shave" && (
                <div
                  className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 bg-zinc-800 border border-white/10",
                    selection === "Stubble"
                      ? "w-28 h-6 rounded-b-full opacity-60"
                      : selection === "Goatee"
                        ? "w-12 h-14 rounded-b-2xl"
                        : "w-32 h-16 rounded-b-[40%]"
                  )}
                />
              )}
              {category === "glasses" && (
                <div className="absolute top-[38%] left-1/2 -translate-x-1/2 flex gap-1">
                  <div
                    className={cn(
                      "h-5 w-8 border-2 border-electric/70 bg-electric/10",
                      selection === "Round" && "rounded-full",
                      selection === "Aviator" && "rounded-b-full rounded-t-sm",
                      selection === "Rectangle" && "rounded-sm",
                      selection === "Wayfarer" && "rounded-sm skew-x-3",
                      selection === "Clubmaster" && "rounded-sm border-t-4"
                    )}
                  />
                  <div
                    className={cn(
                      "h-5 w-8 border-2 border-electric/70 bg-electric/10",
                      selection === "Round" && "rounded-full",
                      selection === "Aviator" && "rounded-b-full rounded-t-sm",
                      selection === "Rectangle" && "rounded-sm",
                      selection === "Wayfarer" && "rounded-sm -skew-x-3",
                      selection === "Clubmaster" && "rounded-sm border-t-4"
                    )}
                  />
                </div>
              )}
            </div>
          </div>
          <p className="absolute bottom-3 text-[10px] text-muted-foreground">
            Preview · {selection}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelection(opt)}
              className={cn(
                "text-[10px] px-3 py-1.5 rounded-full border transition-colors",
                selection === opt
                  ? "border-electric bg-electric/10 text-electric"
                  : "border-white/10 text-muted-foreground hover:border-white/20"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
