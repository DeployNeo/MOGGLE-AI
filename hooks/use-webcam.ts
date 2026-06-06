"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { captureVideoFrame } from "@/lib/image-utils";

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  capture: () => string | null;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      stop();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
    } catch {
      setError(
        "Unable to access webcam. Please check permissions and try again."
      );
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [stop]);

  const capture = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null;
    try {
      return captureVideoFrame(videoRef.current);
    } catch {
      setError("Failed to capture image from webcam.");
      return null;
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, isActive, isLoading, error, start, stop, capture };
}
