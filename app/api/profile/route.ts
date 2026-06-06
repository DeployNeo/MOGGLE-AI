import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/server/users";

export const runtime = "nodejs";

const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(300).optional(),
  country: z.string().max(60).optional(),
  photoURL: z.string().url().nullable().optional(),
  favoriteHairstyles: z.array(z.string()).optional(),
  savedRecommendations: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const db = getAdminDb();
    if (!db) return jsonError("Database unavailable.", 503);

    const profile = await getUserProfile(db, auth.uid);
    if (!profile) return jsonError("Profile not found.", 404);

    return jsonOk({ profile });
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
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request.");
    }

    await updateUserProfile(db, auth.uid, parsed.data);
    const profile = await getUserProfile(db, auth.uid);

    return jsonOk({ profile });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
