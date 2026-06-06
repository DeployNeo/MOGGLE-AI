import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
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

export async function createUserProfile(
  db: Firestore,
  uid: string,
  data: { email: string; displayName: string; photoURL?: string | null }
): Promise<UserProfile> {
  const username = data.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 24);
  const profile: UserProfile = {
    uid,
    username,
    displayName: data.displayName || username,
    email: data.email,
    bio: "",
    country: "",
    photoURL: data.photoURL ?? null,
    role: "user",
    scanCount: 0,
    avgHarmony: 0,
    avgSymmetry: 0,
    avgPsl: 0,
    favoriteHairstyles: [],
    savedRecommendations: [],
    joinDate: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, "users", uid), profile);
  await setDoc(doc(db, "userSettings", uid), DEFAULT_SETTINGS);
  return profile;
}

export async function getUserProfile(
  db: Firestore,
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  db: Firestore,
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function getUserSettings(
  db: Firestore,
  uid: string
): Promise<UserSettings> {
  const snap = await getDoc(doc(db, "userSettings", uid));
  return snap.exists() ? (snap.data() as UserSettings) : DEFAULT_SETTINGS;
}

export type UserSettingsPatch = {
  privacy?: Partial<UserSettings["privacy"]>;
  notifications?: Partial<UserSettings["notifications"]>;
  appearance?: Partial<UserSettings["appearance"]>;
};

export async function updateUserSettings(
  db: Firestore,
  uid: string,
  settings: UserSettingsPatch
): Promise<void> {
  const current = await getUserSettings(db, uid);
  await setDoc(doc(db, "userSettings", uid), {
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
  await updateDoc(doc(db, "users", uid), {
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
  await setDoc(doc(db, "activityLogs", id), {
    id,
    userId,
    action,
    metadata: metadata ?? {},
    createdAt: Date.now(),
  });
}
