"use client";

import { getAnalytics, logEvent, isSupported, type Analytics } from "firebase/analytics";
import { getFirebaseApp } from "@/lib/firebase/client";

let analytics: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

export async function initAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const app = getFirebaseApp();
    if (!app) return null;
    const supported = await isSupported();
    if (!supported) return null;
    analytics = getAnalytics(app);
    return analytics;
  })();

  return initPromise;
}

export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  const instance = await initAnalytics();
  if (!instance) return;
  logEvent(instance, name, params);
}

export async function trackPageView(path: string): Promise<void> {
  await trackEvent("page_view", { page_path: path });
}
