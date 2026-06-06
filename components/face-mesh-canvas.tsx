"use client";

import { useEffect, useRef } from "react";
import type { LandmarkPoint } from "@/types";

const OUTLINE_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
  162, 21, 54, 103, 67, 109,
];

const KEY_POINTS = [33, 263, 1, 61, 291, 152, 10];

interface FaceMeshCanvasProps {
  landmarksRef: React.RefObject<LandmarkPoint[] | null>;
  active?: boolean;
  mirrored?: boolean;
  className?: string;
}

export function FaceMeshCanvas({
  landmarksRef,
  active = true,
  mirrored = true,
  className,
}: FaceMeshCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const landmarks = landmarksRef.current;
      if (landmarks && landmarks.length > 0) {
        ctx.save();
        if (mirrored) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }

        ctx.strokeStyle = "rgba(59, 130, 246, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < OUTLINE_INDICES.length; i++) {
          const idx = OUTLINE_INDICES[i];
          const lm = landmarks[idx];
          if (!lm) continue;
          const x = lm.x * w;
          const y = lm.y * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "rgba(96, 165, 250, 0.9)";
        for (const idx of KEY_POINTS) {
          const lm = landmarks[idx];
          if (!lm) continue;
          ctx.beginPath();
          ctx.arc(lm.x * w, lm.y * h, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, mirrored, landmarksRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
