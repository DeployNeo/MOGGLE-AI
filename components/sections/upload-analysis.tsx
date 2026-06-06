"use client";

import { motion } from "framer-motion";
import { ImagePlus, Upload, X } from "lucide-react";
import { useCallback, useRef } from "react";
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

interface UploadAnalysisProps {
  onUpload: (imageDataUrl: string) => void;
  analysisStatus: AnalysisStatus;
}

export function UploadAnalysis({
  onUpload,
  analysisStatus,
}: UploadAnalysisProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { preview, isProcessing, error, upload, clear } = useImageUpload();
  const isAnalyzing =
    analysisStatus === "loading" || analysisStatus === "analyzing";

  const handleFile = useCallback(
    async (file: File) => {
      const dataUrl = await upload(file);
      if (dataUrl) onUpload(dataUrl);
    },
    [upload, onUpload]
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-electric" />
          Upload Image
        </CardTitle>
        <CardDescription>
          Upload a JPG, PNG, or WEBP image (max 10MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !preview && fileInputRef.current?.click()}
          className={`relative aspect-video overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
            preview
              ? "border-electric/30"
              : "border-white/10 hover:border-electric/30 cursor-pointer"
          }`}
        >
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <LoadingSpinner label="Processing image..." />
            </div>
          )}

          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded preview"
                className="h-full w-full object-contain bg-black/50"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-black/50"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag & drop or click to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ACCEPTED_IMAGE_EXTENSIONS.join(", ")} up to 10MB
                </p>
              </div>
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

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        {preview && (
          <div className="flex justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isAnalyzing || isProcessing}
            >
              <Upload className="h-4 w-4" />
              Upload Different Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
