import { getFirebaseDb } from "@/lib/firebase/client";
import { saveAnalysis } from "@/services/firebase/analyses";
import { createNotification } from "@/services/firebase/notifications";
import { incrementScanStats, logActivity } from "@/services/firebase/users";
import { uploadAnalysisImage } from "@/services/firebase/storage";
import type { AnalysisResult } from "@/types";

export interface PersistResult {
  id: string;
  imageUrl: string | null;
}

export async function persistAnalysisResult(
  userId: string,
  result: AnalysisResult,
  source: "live" | "photo"
): Promise<PersistResult> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Database not available. Check Firebase configuration.");
  }

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  let imageUrl: string | null = null;
  let storagePath: string | null = null;

  if (result.imageDataUrl) {
    try {
      const uploaded = await uploadAnalysisImage(
        userId,
        id,
        result.imageDataUrl
      );
      if (uploaded) {
        imageUrl = uploaded.url;
        storagePath = uploaded.path;
      }
    } catch (err) {
      console.error("Storage upload failed:", err);
    }
  }

  await saveAnalysis(
    db,
    userId,
    result,
    source,
    imageUrl,
    storagePath,
    id
  );

  await incrementScanStats(
    db,
    userId,
    result.metrics.harmony,
    result.metrics.symmetry,
    result.aiAnalysis?.pslNumeric ?? 5
  );

  await logActivity(db, userId, "analysis.saved", { analysisId: id, source });

  await createNotification(db, userId, {
    type: "analysis",
    title: "Analysis Complete",
    message: `Your ${result.faceShape.shape} scan was saved — PSL ${result.aiAnalysis?.pslRating ?? "MTN"}`,
    link: `/dashboard?analysis=${id}`,
  });

  return { id, imageUrl };
}
