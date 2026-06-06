"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackPageView } from "@/lib/firebase/analytics";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (isFirebaseConfigured()) {
      initAnalytics();
    }
  }, []);

  useEffect(() => {
    if (pathname && isFirebaseConfigured()) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
