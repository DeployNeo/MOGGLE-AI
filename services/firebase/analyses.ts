import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  type Firestore,
} from "firebase/firestore";
import type { AnalysisResult, SavedAnalysisRecord } from "@/types";
import { computeCompositeScore } from "@/services/face-metrics";

export async function saveAnalysis(
  db: Firestore,
  userId: string,
  result: AnalysisResult,
  source: "live" | "photo",
  imageUrl?: string | null,
  storagePath?: string | null,
  analysisId?: string
): Promise<string> {
  const id = analysisId ?? `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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

  await setDoc(doc(db, "analyses", id), record);

  await setDoc(doc(db, "progressHistory", `${userId}_${id}`), {
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
  const q = query(
    collection(db, "analyses"),
    where("userId", "==", userId),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as SavedAnalysisRecord)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, max);
}

export async function getAnalysisById(
  db: Firestore,
  userId: string,
  analysisId: string
): Promise<SavedAnalysisRecord | null> {
  const snap = await getDoc(doc(db, "analyses", analysisId));
  if (!snap.exists()) return null;
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
  await deleteDoc(doc(db, "analyses", analysisId));
  await deleteDoc(doc(db, "progressHistory", `${userId}_${analysisId}`)).catch(() => {});
  return true;
}

export async function getProgressHistory(
  db: Firestore,
  userId: string,
  max = 50
) {
  const q = query(
    collection(db, "progressHistory"),
    where("userId", "==", userId),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.recordedAt as number) - (b.recordedAt as number));
}
