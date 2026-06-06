import type { Firestore } from "firebase-admin/firestore";
import type { AppNotification } from "@/types";

export async function createNotification(
  db: Firestore,
  userId: string,
  data: Omit<AppNotification, "id" | "userId" | "read" | "createdAt">
): Promise<string> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const notification: AppNotification = {
    id,
    userId,
    read: false,
    createdAt: Date.now(),
    ...data,
  };
  await db.collection("notifications").doc(id).set(notification);
  return id;
}

export async function getUserNotifications(
  db: Firestore,
  userId: string,
  max = 30
): Promise<AppNotification[]> {
  const snap = await db
    .collection("notifications")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return snap.docs.map((d) => d.data() as AppNotification);
}

export async function markAllNotificationsRead(
  db: Firestore,
  userId: string
): Promise<void> {
  const snap = await db
    .collection("notifications")
    .where("userId", "==", userId)
    .where("read", "==", false)
    .get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
  await batch.commit();
}
