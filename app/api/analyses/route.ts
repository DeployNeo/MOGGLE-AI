import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { rateLimitApi, rateLimitHeaders } from "@/lib/rate-limit";
import { analysisSaveSchema } from "@/lib/validations";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  saveAnalysis,
  getUserAnalyses,
} from "@/services/firebase/server/analyses";
import {
  incrementScanStats,
  logActivity,
} from "@/services/firebase/server/users";
import { createNotification } from "@/services/firebase/server/notifications";
import type { AnalysisResult } from "@/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const analyses = await getUserAnalyses(db, auth.uid);
    return jsonOk({ analyses });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to fetch analyses.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const rate = await rateLimitApi(auth.uid);
    if (!rate.success) return jsonError("Rate limit exceeded.", 429);

    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body.");
    }

    const parsed = analysisSaveSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request.");
    }

    const { source, result: rawResult } = parsed.data;
    const result = rawResult as unknown as AnalysisResult;
    const sourceKey = source === "LIVE" ? "live" : "photo";

    const id = await saveAnalysis(db, auth.uid, result, sourceKey);
    const ai = result.aiAnalysis;

    await incrementScanStats(
      db,
      auth.uid,
      result.metrics.harmony,
      result.metrics.symmetry,
      ai?.pslNumeric ?? 5
    );

    await logActivity(db, auth.uid, "analysis.saved", { analysisId: id });

    await createNotification(db, auth.uid, {
      type: "analysis",
      title: "Analysis Complete",
      message: `Your ${result.faceShape.shape} scan saved — PSL ${ai?.pslRating ?? "MTN"}`,
      link: `/dashboard?analysis=${id}`,
    });

    return jsonOk({ id }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to save analysis.", 500);
  }
}
