import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { coachRequestSchema } from "@/lib/validations";
import { generateCoachSuggestions } from "@/services/coach-engine";
import { getAdminDb } from "@/lib/firebase/admin";
import { getProgressHistory } from "@/services/firebase/server/analyses";
import type { ProgressDataPoint } from "@/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body.");
    }

    const parsed = coachRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request.");
    }

    let progress: ProgressDataPoint[] = [];
    if (db) {
      const historyRows = await getProgressHistory(db, auth.uid, 30);
      progress = historyRows.map((h) => ({
        date: new Date(h.recordedAt as number).toISOString(),
        harmonyScore: h.harmonyScore as number,
        symmetryScore: h.symmetryScore as number,
        pslNumeric: h.pslNumeric as number,
      }));
    }

    const coach = generateCoachSuggestions(parsed.data.metrics, progress);
    return jsonOk({ coach });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
