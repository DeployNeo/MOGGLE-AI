"use client";

import { useCallback, useState } from "react";
import {
  compressImage,
  fileToDataUrl,
  validateImageFile,
} from "@/lib/image-utils";

interface UseImageUploadReturn {
  preview: string | null;
  file: File | null;
  isProcessing: boolean;
  error: string | null;
  upload: (file: File) => Promise<string | null>;
  clear: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (inputFile: File): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    const validation = validateImageFile(inputFile);
    if (!validation.valid) {
      setError(validation.message);
      setIsProcessing(false);
      return null;
    }

    try {
      const compressed = await compressImage(inputFile);
      const dataUrl = await fileToDataUrl(compressed);
      setPreview(dataUrl);
      setFile(compressed);
      return dataUrl;
    } catch {
      setError("Failed to process image. Please try another file.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPreview(null);
    setFile(null);
    setError(null);
  }, []);

  return { preview, file, isProcessing, error, upload, clear };
}
