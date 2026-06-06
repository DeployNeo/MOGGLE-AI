import { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { UserRole } from "@/types";

export interface AuthContext {
  uid: string;
  email: string | null;
  role: UserRole;
}

async function getUserRoleFromDb(uid: string): Promise<UserRole> {
  const db = getAdminDb();
  if (!db) return "user";

  try {
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) return "user";
    const role = snap.data()?.role as UserRole | undefined;
    return role ?? "user";
  } catch {
    return "user";
  }
}

export async function verifyAuthToken(
  request: NextRequest
): Promise<AuthContext | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice(7);

  if (isFirebaseAdminConfigured()) {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        const role = await getUserRoleFromDb(decoded.uid);
        return {
          uid: decoded.uid,
          email: decoded.email ?? null,
          role,
        };
      } catch {
        return null;
      }
    }
  }

  return null;
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthContext> {
  const ctx = await verifyAuthToken(request);
  if (!ctx) throw new Error("Unauthorized");
  return ctx;
}

export async function requireAdmin(
  request: NextRequest
): Promise<AuthContext> {
  const ctx = await requireAuth(request);
  if (ctx.role !== "admin") throw new Error("Forbidden");
  return ctx;
}
