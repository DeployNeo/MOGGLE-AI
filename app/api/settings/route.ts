import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getUserSettings,
  updateUserSettings,
} from "@/services/firebase/server/users";
import type { UserSettings } from "@/types";

export const runtime = "nodejs";

const settingsSchema = z.object({
  privacy: z
    .object({
      profilePublic: z.boolean().optional(),
      showScans: z.boolean().optional(),
      showStats: z.boolean().optional(),
    })
    .optional(),
  notifications: z
    .object({
      analysisComplete: z.boolean().optional(),
      profileUpdates: z.boolean().optional(),
      systemAlerts: z.boolean().optional(),
      featureUpdates: z.boolean().optional(),
    })
    .optional(),
  appearance: z
    .object({
      theme: z.enum(["dark", "light", "system"]).optional(),
      reducedMotion: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const settings = await getUserSettings(db, auth.uid);
    return jsonOk({ settings });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request.");
    }

    await updateUserSettings(db, auth.uid, parsed.data as Partial<UserSettings>);
    const settings = await getUserSettings(db, auth.uid);

    return jsonOk({ settings });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
