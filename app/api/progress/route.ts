import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import { getProgressHistory } from "@/services/firebase/server/analyses";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const history = await getProgressHistory(db, auth.uid);

    return jsonOk({
      progress: history.map((h) => ({
        date: new Date(h.recordedAt as number).toISOString(),
        harmonyScore: h.harmonyScore as number,
        symmetryScore: h.symmetryScore as number,
        pslNumeric: h.pslNumeric as number,
      })),
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
