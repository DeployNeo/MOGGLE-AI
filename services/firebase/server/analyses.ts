import type { Firestore } from "firebase-admin/firestore";
import type { AnalysisResult, SavedAnalysisRecord } from "@/types";
import { computeCompositeScore } from "@/services/face-metrics";

export async function saveAnalysis(
  db: Firestore,
  userId: string,
  result: AnalysisResult,
  source: "live" | "photo",
  imageUrl?: string | null,
  storagePath?: string | null
): Promise<string> {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const ai = result.aiAnalysis;
  const composite = computeCompositeScore(result.metrics);

  const record: SavedAnalysisRecord = {
    id,
    userId,
    pslRating: ai?.pslRating ?? "MTN",
    pslNumeric: ai?.pslNumeric ?? 5,
    faceShape: result.faceShape.shape,
    harmonyScore: result.metrics.harmony,
    symmetryScore: result.metrics.symmetry,
    compositeScore: composite,
    source,
    imageUrl: imageUrl ?? null,
    storagePath: storagePath ?? null,
    createdAt: Date.now(),
    metrics: result.metrics,
    aiAnalysis: ai,
    hairstyles: result.hairstyles,
    beards: result.beards,
    glasses: result.glasses,
  };

  await db.collection("analyses").doc(id).set(record);
  await db.collection("progressHistory").doc(`${userId}_${id}`).set({
    userId,
    analysisId: id,
    harmonyScore: result.metrics.harmony,
    symmetryScore: result.metrics.symmetry,
    pslNumeric: ai?.pslNumeric ?? 5,
    recordedAt: Date.now(),
  });

  return id;
}

export async function getUserAnalyses(
  db: Firestore,
  userId: string,
  max = 50
): Promise<SavedAnalysisRecord[]> {
  const snap = await db
    .collection("analyses")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return snap.docs.map((d) => d.data() as SavedAnalysisRecord);
}

export async function getAnalysisById(
  db: Firestore,
  userId: string,
  analysisId: string
): Promise<SavedAnalysisRecord | null> {
  const snap = await db.collection("analyses").doc(analysisId).get();
  if (!snap.exists) return null;
  const data = snap.data() as SavedAnalysisRecord;
  if (data.userId !== userId) return null;
  return data;
}

export async function deleteAnalysis(
  db: Firestore,
  userId: string,
  analysisId: string
): Promise<boolean> {
  const existing = await getAnalysisById(db, userId, analysisId);
  if (!existing) return false;
  await db.collection("analyses").doc(analysisId).delete();
  await db.collection("progressHistory").doc(`${userId}_${analysisId}`).delete().catch(() => {});
  return true;
}

export async function getProgressHistory(db: Firestore, userId: string, max = 50) {
  const snap = await db
    .collection("progressHistory")
    .where("userId", "==", userId)
    .orderBy("recordedAt", "asc")
    .limit(max)
    .get();
  return snap.docs.map((d) => d.data());
}
