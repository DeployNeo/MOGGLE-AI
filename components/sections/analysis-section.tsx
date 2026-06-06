"use client";

import { useCallback, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AuthGate } from "@/components/auth/auth-gate";
import { AnalysisHistory } from "@/components/sections/analysis-history";
import { PhotoAnalyzer } from "@/components/sections/photo-analyzer";
import { Recommendations } from "@/components/sections/recommendations";
import { ResultsDashboard } from "@/components/sections/results-dashboard";
import { WebcamAnalysis } from "@/components/sections/webcam-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFaceAnalysis } from "@/hooks/use-face-analysis";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { saveAnalysisToApi } from "@/lib/api-client";
import { persistAnalysisResult } from "@/services/firebase/persist-analysis";
import type { AnalysisResult, FaceDetectionResult } from "@/types";

export function AnalysisSection() {
  const { user, getIdToken, refreshProfile } = useAuth();
  const { status, result, error, analyze, analyzeFromDetection, reset } =
    useFaceAnalysis();
  const [activeTab, setActiveTab] = useState("webcam");
  const [saving, setSaving] = useState(false);

  const persistAnalysis = useCallback(
    async (analysisResult: AnalysisResult, source: "live" | "photo") => {
      if (!user) return;

      setSaving(true);
      try {
        const token = await getIdToken();
        const apiResult = await saveAnalysisToApi(analysisResult, source, token);

        if (!apiResult) {
          await persistAnalysisResult(user.uid, analysisResult, source);
        }

        await refreshProfile();

        toast({
          title: "Saved",
          description: "Scan, image, and metrics saved to your account.",
          variant: "success",
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save analysis.";
        toast({
          title: "Save Failed",
          description: message,
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    },
    [user, getIdToken, refreshProfile]
  );

  const onSuccess = useCallback(
    async (analysisResult: AnalysisResult, source: "live" | "photo") => {
      const psl = analysisResult.aiAnalysis?.pslRating ?? "N/A";
      toast({
        title: "Analysis Complete",
        description: `PSL: ${psl} · ${analysisResult.faceShape.shape}`,
        variant: "success",
      });
      await persistAnalysis(analysisResult, source);
    },
    [persistAnalysis]
  );

  const handlePhotoAnalyze = useCallback(
    async (imageDataUrl: string) => {
      const { result: analysisResult, error: analysisError } =
        await analyze(imageDataUrl);
      if (analysisResult) await onSuccess(analysisResult, "photo");
      else if (analysisError) {
        toast({ title: "Analysis Failed", description: analysisError, variant: "destructive" });
      }
    },
    [analyze, onSuccess]
  );

  const handleLiveAnalyze = useCallback(
    async (detection: FaceDetectionResult, imageDataUrl: string) => {
      const { result: analysisResult, error: analysisError } =
        await analyzeFromDetection(detection, imageDataUrl, "live");
      if (analysisResult) await onSuccess(analysisResult, "live");
      else if (analysisError) {
        toast({ title: "Analysis Failed", description: analysisError, variant: "destructive" });
      }
    },
    [analyzeFromDetection, onSuccess]
  );

  const isAnalyzing = status === "loading" || status === "analyzing";

  return (
    <section id="analyze" className="px-3 sm:px-4 py-10 sm:py-16 pb-safe">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Analyze</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Sign in required — live webcam or photo upload with full save to your profile
          </p>
        </div>

        <AuthGate>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-6 h-auto glass p-1">
              <TabsTrigger value="webcam" className="text-xs py-2.5">Live</TabsTrigger>
              <TabsTrigger value="photo" className="text-xs py-2.5">Photo</TabsTrigger>
              <TabsTrigger value="history" className="text-xs py-2.5">History</TabsTrigger>
            </TabsList>

            <div
              className={
                result && activeTab !== "history"
                  ? "flex flex-col lg:grid lg:grid-cols-2 gap-6"
                  : "max-w-3xl mx-auto space-y-4"
              }
            >
              <TabsContent value="webcam" className="mt-0">
                <WebcamAnalysis
                  onLiveAnalyze={handleLiveAnalyze}
                  analysisStatus={status}
                  compact={Boolean(result)}
                />
              </TabsContent>
              <TabsContent value="photo" className="mt-0">
                <PhotoAnalyzer onAnalyze={handlePhotoAnalyze} analysisStatus={status} />
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <AnalysisHistory />
              </TabsContent>

              {(isAnalyzing || saving) && activeTab !== "history" && (
                <div className="lg:col-span-2 flex items-center justify-center gap-3 py-4 rounded-2xl glass">
                  <LoadingSpinner size={result ? "sm" : "lg"} />
                  <p className="text-sm text-muted-foreground">
                    {saving ? "Saving scan to your account..." : "Running analysis..."}
                  </p>
                </div>
              )}

              {error && status === "error" && !isAnalyzing && !result && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {result && status === "success" && activeTab !== "history" && (
                <div className="space-y-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between sticky top-0 glass py-3 z-10 rounded-xl px-3">
                    <h3 className="font-semibold">Report</h3>
                    <button onClick={reset} className="text-xs text-electric hover:underline px-2 min-h-[44px]">
                      New scan
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl glass">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.imageDataUrl} alt="Analyzed" className="w-full max-h-48 object-contain bg-black/40" />
                  </div>
                  <ResultsDashboard result={result} />
                  <Recommendations sections={result.recommendations} />
                </div>
              )}
            </div>
          </Tabs>
        </AuthGate>
      </div>
    </section>
  );
}
