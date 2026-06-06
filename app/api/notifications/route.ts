import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getUserNotifications,
  markAllNotificationsRead,
} from "@/services/firebase/server/notifications";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const notifications = await getUserNotifications(db, auth.uid);
    return jsonOk({ notifications });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    await markAllNotificationsRead(db, auth.uid);
    return jsonOk({ success: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
