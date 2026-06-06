import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  type Firestore,
} from "firebase/firestore";
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
  await setDoc(doc(db, "notifications", id), notification);
  return id;
}

export async function getUserNotifications(
  db: Firestore,
  userId: string,
  max = 30
): Promise<AppNotification[]> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as AppNotification)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, max);
}

export async function markNotificationRead(
  db: Firestore,
  notificationId: string
): Promise<void> {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

export async function markAllNotificationsRead(
  db: Firestore,
  userId: string
): Promise<void> {
  const notifications = await getUserNotifications(db, userId, 100);
  const unread = notifications.filter((n) => !n.read);
  await Promise.all(
    unread.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }))
  );
}
