import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getAnalysisById,
  deleteAnalysis,
} from "@/services/firebase/server/analyses";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const analysis = await getAnalysisById(db, auth.uid, id);
    if (!analysis) return jsonError("Analysis not found.", 404);

    return jsonOk({ analysis });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const deleted = await deleteAnalysis(db, auth.uid, id);
    if (!deleted) return jsonError("Analysis not found.", 404);

    return jsonOk({ deleted: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
