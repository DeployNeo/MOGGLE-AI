import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const limit = Math.min(
      100,
      parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10)
    );

    const snap = await db
      .collection("users")
      .orderBy("joinDate", "desc")
      .limit(limit)
      .get();

    const users = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = doc.data();
        const scans = await db
          .collection("analyses")
          .where("userId", "==", doc.id)
          .count()
          .get();
        return {
          id: doc.id,
          ...data,
          scanCount: scans.data().count,
        };
      })
    );

    return jsonOk({ users });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return jsonError("Forbidden", 403);
    }
    return jsonError("Unauthorized", 401);
  }
}
