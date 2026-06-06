import { collection, getDocs, limit, query, type Firestore } from "firebase/firestore";
import type { AdminStats } from "@/types";

export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  role: string;
  scanCount: number;
  joinDate: number;
}

/** Client-side admin data when server Admin SDK is not configured. Requires admin/moderator Firestore rules. */
export async function fetchAdminStatsClient(db: Firestore): Promise<AdminStats> {
  const [usersSnap, analysesSnap] = await Promise.all([
    getDocs(query(collection(db, "users"), limit(500))),
    getDocs(query(collection(db, "analyses"), limit(500))),
  ]);

  const aiUsage: Record<string, number> = {};
  analysesSnap.docs.forEach((docSnap) => {
    const provider = (docSnap.data().aiProvider as string) ?? "cv-only";
    aiUsage[provider] = (aiUsage[provider] ?? 0) + 1;
  });

  return {
    totalUsers: usersSnap.size,
    totalScans: analysesSnap.size,
    scansToday: 0,
    storageUsedMb: 0,
    aiUsage,
    errorsLast7d: 0,
  };
}

export async function fetchAdminUsersClient(db: Firestore): Promise<AdminUserRow[]> {
  const snap = await getDocs(query(collection(db, "users"), limit(200)));
  return snap.docs
    .map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        email: (data.email as string) ?? "",
        displayName: (data.displayName as string) ?? "",
        role: (data.role as string) ?? "user",
        scanCount: (data.scanCount as number) ?? 0,
        joinDate: (data.joinDate as number) ?? 0,
      };
    })
    .sort((a, b) => b.joinDate - a.joinDate);
}
