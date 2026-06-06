import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import type { AdminStats } from "@/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const [usersSnap, analysesSnap, logsSnap] = await Promise.all([
      db.collection("users").count().get(),
      db.collection("analyses").count().get(),
      db
        .collection("activityLogs")
        .where("action", "==", "error")
        .count()
        .get(),
    ]);

    const aiUsageSnap = await db.collection("analyses").select("aiProvider").get();
    const aiUsage: Record<string, number> = {};
    aiUsageSnap.docs.forEach((doc) => {
      const provider = (doc.data().aiProvider as string) ?? "cv-only";
      aiUsage[provider] = (aiUsage[provider] ?? 0) + 1;
    });

    const stats: AdminStats = {
      totalUsers: usersSnap.data().count,
      totalScans: analysesSnap.data().count,
      scansToday: 0,
      storageUsedMb: 0,
      aiUsage,
      errorsLast7d: logsSnap.data().count,
    };

    return jsonOk({ stats });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return jsonError("Forbidden", 403);
    }
    return jsonError("Unauthorized", 401);
  }
}
