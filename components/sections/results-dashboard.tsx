"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Copy,
  Dna,
  Layers,
  ListOrdered,
  Scissors,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { ThirdsBar } from "@/components/dashboard/thirds-bar";
import { MetricCard } from "@/components/metric-card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeMetricsForPrompt } from "@/lib/metric-analysis";
import { getPslBorderColor, getPslColor } from "@/lib/psl";
import { toast } from "@/hooks/use-toast";
import { cn, formatPercent, getScoreColor } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface ResultsDashboardProps {
  result: AnalysisResult;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const { metrics, faceShape, hairstyles, aiAnalysis } = result;
  const [tab, setTab] = useState("overview");
  const ctx = analyzeMetricsForPrompt(metrics, faceShape);
  const psl = aiAnalysis;

  const mainMetrics = [
    { key: "symmetry", label: "Symmetry", value: metrics.symmetry },
    { key: "jawline", label: "Jawline", value: metrics.jawline },
    { key: "eyes", label: "Eyes", value: metrics.eyes },
    { key: "nose", label: "Nose", value: metrics.nose },
    { key: "lips", label: "Lips", value: metrics.lips },
    { key: "harmony", label: "Harmony", value: metrics.harmony },
    { key: "eyeTilt", label: "Eye Tilt", value: metrics.eyeTilt },
    { key: "canthalTilt", label: "Canthal Tilt", value: metrics.canthalTilt },
    { key: "jawProminence", label: "Jaw Prominence", value: metrics.jawProminence },
    { key: "chinProjection", label: "Chin Projection", value: metrics.chinProjection },
  ];

  const copySummary = () => {
    const text = [
      `Moggle AI Report`,
      `PSL: ${psl?.pslRating} (${psl?.pslNumeric}/10)`,
      psl?.verdict ?? "",
      `Face: ${faceShape.shape}`,
      `Composite: ${ctx.compositeScore}/100`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied", description: "Summary copied to clipboard." });
    });
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Analysis Results</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Professional looksmaxing analysis
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={copySummary} className="w-full sm:w-auto">
          <Copy className="h-3.5 w-3.5" />
          Copy Summary
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-0.5">
          <TabsTrigger value="overview" className="text-[10px] sm:text-xs px-1 sm:px-3 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="text-[10px] sm:text-xs px-1 sm:px-3 py-2">
            Features
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-[10px] sm:text-xs px-1 sm:px-3 py-2">
            Actions
          </TabsTrigger>
          <TabsTrigger value="hair" className="text-[10px] sm:text-xs px-1 sm:px-3 py-2">
            Hair
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {psl && (
            <Card
              className={cn(
                "border-2 bg-gradient-to-br from-white/5 to-transparent",
                getPslBorderColor(psl.pslRating)
              )}
            >
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Zap className="h-5 w-5 text-electric" />
                  PSL Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="flex flex-col xs:flex-row items-center gap-4 sm:gap-6">
                  <p
                    className={cn(
                      "text-4xl sm:text-5xl font-black tracking-tight text-center",
                      getPslColor(psl.pslRating)
                    )}
                  >
                    {psl.pslRating}
                  </p>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{psl.pslNumeric}/10</span>
                      <span>{psl.confidence}% conf</span>
                    </div>
                    <Progress value={psl.pslNumeric * 10} className="h-2.5" />
                  </div>
                </div>

                {psl.verdict && (
                  <p className="text-sm sm:text-base font-medium border-t border-white/10 pt-3">
                    {psl.verdict}
                  </p>
                )}

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 py-2">
                  <ScoreRing value={ctx.compositeScore} label="Composite" size={72} />
                  <ScoreRing value={psl.structuralScore} label="Structure" size={72} />
                  <ScoreRing value={psl.dimorphismScore} label="Dimorphism" size={72} />
                </div>

                {psl.pslCeiling && (
                  <div className="rounded-lg bg-electric/5 border border-electric/20 p-3 flex gap-2">
                    <ArrowUpRight className="h-4 w-4 text-electric shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase text-electric/80">PSL Ceiling</p>
                      <p className="text-xs sm:text-sm">{psl.pslCeiling}</p>
                    </div>
                  </div>
                )}

                {psl.professionalAssessment && (
                  <div className="rounded-lg border border-electric/20 bg-electric/5 p-3 sm:p-4">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-electric mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Expert Assessment
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed">{psl.professionalAssessment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Face Shape</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-electric/10 border border-electric/30 shrink-0">
                    <span className="text-xl font-bold text-electric">
                      {faceShape.shape.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{faceShape.shape}</h3>
                    <p className="text-xs text-muted-foreground">
                      {faceShape.confidence}% confidence
                    </p>
                  </div>
                </div>
                <Progress value={faceShape.confidence} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{faceShape.reasoning}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Facial Thirds</CardTitle>
                <CardDescription className="text-xs">Ideal ~33% each</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ThirdsBar
                  upper={metrics.upperThird}
                  middle={metrics.middleThird}
                  lower={metrics.lowerThird}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Core Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-2 grid-cols-2 lg:grid-cols-3">
                {mainMetrics.map((m) => (
                  <MetricCard key={m.key} label={m.label} value={m.value} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4 mt-4">
          {psl && psl.featureBreakdown.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-electric" />
                  Feature Autopsy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 grid gap-2">
                {psl.featureBreakdown.map((f) => (
                  <div
                    key={f.feature}
                    className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium uppercase text-muted-foreground">
                        {f.feature}
                      </span>
                      <span className={cn("text-sm font-bold", getScoreColor(f.score))}>
                        {f.score}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {f.verdict}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {psl && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-electric" />
                  Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Strengths
                  </h4>
                  {psl.strengths.length > 0 ? (
                    <ul className="space-y-1.5">
                      {psl.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-green-400">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">None detected.</p>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5" /> Flaws
                  </h4>
                  <ul className="space-y-1.5">
                    {psl.flaws.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-red-400">•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
                {psl.pslReasoning && (
                  <p className="text-xs text-muted-foreground border-t border-white/10 pt-3">
                    {psl.pslReasoning}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4 mt-4">
          {psl && psl.looksmaxxingPriority.length > 0 && (
            <Card className="border-electric/20">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListOrdered className="h-4 w-4 text-electric" />
                  Looksmaxxing Priority
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {psl.looksmaxxingPriority.map((action, i) => (
                  <div
                    key={i}
                    className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-electric/20 text-[10px] font-bold text-electric">
                      {i + 1}
                    </span>
                    <p className="text-xs text-muted-foreground">{action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {psl && psl.improvements.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-electric" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {psl.improvements.map((imp, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex gap-2 p-2 rounded bg-white/[0.02]">
                    <span className="text-electric shrink-0">{i + 1}.</span>
                    {imp}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {psl && (psl.skincare.length > 0 || psl.fitness.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {psl.skincare.length > 0 && (
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">Skincare</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {psl.skincare.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {psl.fitness.length > 0 && (
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">Fitness</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {psl.fitness.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hair" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scissors className="h-4 w-4 text-electric" />
                Top Hairstyles
              </CardTitle>
              <CardDescription className="text-xs">
                <Dna className="inline h-3 w-3 mr-1" />
                Matched to {faceShape.shape} shape
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {hairstyles.map((style, i) => (
                <div
                  key={style.name}
                  className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric/10 text-[10px] font-bold text-electric">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="text-sm font-medium truncate">{style.name}</h4>
                      <span className={cn("text-xs font-semibold shrink-0", getScoreColor(style.score))}>
                        {formatPercent(style.score)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {style.reasoning}
                    </p>
                    <Progress value={style.score} className="mt-1.5 h-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {psl && psl.recommendedHaircuts.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">AI Hair Picks</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="text-xs text-muted-foreground space-y-1">
                  {psl.recommendedHaircuts.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
