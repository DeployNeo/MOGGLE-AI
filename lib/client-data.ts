import {
  fetchAnalysisHistory,
  fetchNotifications,
  fetchProgressHistory,
} from "@/lib/api-client";
import { getFirebaseDb } from "@/lib/firebase/client";
import { getProgressHistory, getUserAnalyses } from "@/services/firebase/analyses";
import { getUserNotifications } from "@/services/firebase/notifications";
import type { AppNotification, ProgressDataPoint, SavedAnalysisRecord } from "@/types";

/** Prefer direct Firestore reads (works without Firebase Admin on the server). */
export async function loadAnalysisHistory(
  userId: string,
  token: string | null
): Promise<SavedAnalysisRecord[]> {
  const db = getFirebaseDb();
  if (db) {
    try {
      return await getUserAnalyses(db, userId);
    } catch {
      /* fall through to API */
    }
  }
  return fetchAnalysisHistory(token);
}

export async function loadProgressHistory(
  userId: string,
  token: string | null
): Promise<ProgressDataPoint[]> {
  const db = getFirebaseDb();
  if (db) {
    try {
      const rows = await getProgressHistory(db, userId);
      return rows.map((h) => ({
        date: new Date(h.recordedAt as number).toISOString(),
        harmonyScore: h.harmonyScore as number,
        symmetryScore: h.symmetryScore as number,
        pslNumeric: h.pslNumeric as number,
      }));
    } catch {
      /* fall through */
    }
  }
  return fetchProgressHistory(token);
}

export async function loadNotifications(
  userId: string,
  token: string | null
): Promise<AppNotification[]> {
  const db = getFirebaseDb();
  if (db) {
    try {
      return await getUserNotifications(db, userId);
    } catch {
      /* fall through */
    }
  }
  return fetchNotifications(token);
}
