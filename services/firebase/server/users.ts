import type { Firestore } from "firebase-admin/firestore";
import type { UserProfile, UserSettings } from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
  privacy: { profilePublic: true, showScans: true, showStats: true },
  notifications: {
    analysisComplete: true,
    profileUpdates: true,
    systemAlerts: true,
    featureUpdates: true,
  },
  appearance: { theme: "dark", reducedMotion: false },
};

export async function getUserProfile(
  db: Firestore,
  uid: string
): Promise<UserProfile | null> {
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  db: Firestore,
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await db.collection("users").doc(uid).update({
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function getUserSettings(
  db: Firestore,
  uid: string
): Promise<UserSettings> {
  const snap = await db.collection("userSettings").doc(uid).get();
  return snap.exists ? (snap.data() as UserSettings) : DEFAULT_SETTINGS;
}

export async function updateUserSettings(
  db: Firestore,
  uid: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const current = await getUserSettings(db, uid);
  await db.collection("userSettings").doc(uid).set({
    ...current,
    ...settings,
    privacy: { ...current.privacy, ...settings.privacy },
    notifications: { ...current.notifications, ...settings.notifications },
    appearance: { ...current.appearance, ...settings.appearance },
  });
}

export async function incrementScanStats(
  db: Firestore,
  uid: string,
  harmony: number,
  symmetry: number,
  psl: number
): Promise<void> {
  const profile = await getUserProfile(db, uid);
  if (!profile) return;

  const count = profile.scanCount + 1;
  await db.collection("users").doc(uid).update({
    scanCount: count,
    avgHarmony: Math.round(((profile.avgHarmony * profile.scanCount) + harmony) / count),
    avgSymmetry: Math.round(((profile.avgSymmetry * profile.scanCount) + symmetry) / count),
    avgPsl: Math.round((((profile.avgPsl * profile.scanCount) + psl) / count) * 10) / 10,
    updatedAt: Date.now(),
  });
}

export async function logActivity(
  db: Firestore,
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db.collection("activityLogs").doc(id).set({
    id,
    userId,
    action,
    metadata: metadata ?? {},
    createdAt: Date.now(),
  });
}
