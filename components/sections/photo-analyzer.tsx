"use client";

import { Camera, ImageIcon, Scan, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ACCEPTED_IMAGE_EXTENSIONS } from "@/lib/constants";
import { useImageUpload } from "@/hooks/use-image-upload";
import type { AnalysisStatus } from "@/types";

interface PhotoAnalyzerProps {
  onAnalyze: (imageDataUrl: string) => void;
  analysisStatus: AnalysisStatus;
}

export function PhotoAnalyzer({
  onAnalyze,
  analysisStatus,
}: PhotoAnalyzerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { preview, isProcessing, error, upload, clear } = useImageUpload();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const isAnalyzing =
    analysisStatus === "loading" || analysisStatus === "analyzing";

  const handleFile = useCallback(
    async (file: File) => {
      const dataUrl = await upload(file);
      if (dataUrl) setPendingUrl(dataUrl);
    },
    [upload]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const runAnalysis = useCallback(() => {
    if (pendingUrl) onAnalyze(pendingUrl);
  }, [pendingUrl, onAnalyze]);

  const handleClear = useCallback(() => {
    clear();
    setPendingUrl(null);
  }, [clear]);

  return (
    <Card className="border-white/10 bg-card/40">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Camera className="h-5 w-5 text-electric" />
          Photo Analyzer
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          High-accuracy static photo analysis — best for detailed PSL reports
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !preview && fileInputRef.current?.click()}
          className={`relative aspect-[3/4] sm:aspect-video overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
            preview
              ? "border-electric/40"
              : "border-white/10 hover:border-electric/30 cursor-pointer"
          }`}
        >
          {isProcessing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
              <LoadingSpinner label="Processing photo..." />
            </div>
          )}

          {preview ? (
            <div className="relative h-full w-full bg-black/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Photo preview"
                className="h-full w-full object-contain"
              />
              <div className="absolute top-2 right-2 rounded-full bg-electric/20 border border-electric/30 px-2 py-0.5 text-[10px] text-electric">
                Ready to analyze
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-electric/10 border border-electric/20">
                <ImageIcon className="h-8 w-8 text-electric" />
              </div>
              <p className="text-sm font-medium text-center">
                Drop photo or tap to upload
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {ACCEPTED_IMAGE_EXTENSIONS.join(", ")} · max 10MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/5 border border-white/10 p-2">
            <Scan className="h-4 w-4 mx-auto text-electric mb-1" />
            <p className="text-[10px] text-muted-foreground">468 landmarks</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-2">
            <Camera className="h-4 w-4 mx-auto text-electric mb-1" />
            <p className="text-[10px] text-muted-foreground">Front-facing best</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-2 sm:col-span-1 col-span-1">
            <Upload className="h-4 w-4 mx-auto text-electric mb-1" />
            <p className="text-[10px] text-muted-foreground">Auto-compress</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={runAnalysis}
            disabled={!pendingUrl || isAnalyzing}
            size="lg"
            className="flex-1"
          >
            <Scan className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Run Photo Analysis"}
          </Button>
          {preview && (
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isAnalyzing}
              className="sm:w-auto"
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
