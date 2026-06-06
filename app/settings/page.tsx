"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Lock, Palette, Trash2, User } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/hooks/use-toast";
import { fetchSettings, updateSettingsApi } from "@/lib/api-client";
import { loadNotifications } from "@/lib/client-data";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  getUserSettings,
  updateUserSettings,
} from "@/services/firebase/users";
import { markAllNotificationsRead } from "@/services/firebase/notifications";
import type { AppNotification, UserSettings } from "@/types";

export default function SettingsPage() {
  const { user, getIdToken, logOut } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const token = await getIdToken();
    let s = await fetchSettings(token);
    const n = await loadNotifications(user.uid, token);

    const db = getFirebaseDb();
    if (db && !s) s = await getUserSettings(db, user.uid);

    setSettings(s);
    setNotifications(n);
    setLoading(false);
  }, [user, getIdToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSetting = async (patch: {
    privacy?: Partial<UserSettings["privacy"]>;
    notifications?: Partial<UserSettings["notifications"]>;
    appearance?: Partial<UserSettings["appearance"]>;
  }) => {
    if (!settings || !user) return;

    const next: UserSettings = {
      ...settings,
      privacy: { ...settings.privacy, ...patch.privacy },
      notifications: { ...settings.notifications, ...patch.notifications },
      appearance: { ...settings.appearance, ...patch.appearance },
    };
    setSettings(next);

    const token = await getIdToken();
    const apiOk = await updateSettingsApi(token, patch);

    if (apiOk) {
      toast({ title: "Settings saved", variant: "success" });
    } else {
      const db = getFirebaseDb();
      if (db) {
        try {
          await updateUserSettings(db, user.uid, patch);
          toast({ title: "Settings saved", variant: "success" });
        } catch {
          toast({ title: "Failed to save settings", variant: "destructive" });
        }
      } else {
        toast({ title: "Failed to save settings", variant: "destructive" });
      }
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    const token = await getIdToken();
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }).catch(() => {});

    const db = getFirebaseDb();
    if (db) await markAllNotificationsRead(db, user.uid);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "All notifications marked read" });
  };

  if (!user) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-lg mx-auto p-8 text-center">
          <Link href="/login"><Button>Sign In</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground mb-8">Manage your account and preferences</p>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading settings...</p>
        ) : (
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 glass p-1.5">
              <TabsTrigger value="notifications" className="text-xs gap-1.5 px-3 py-2">
                <Bell className="h-3.5 w-3.5 shrink-0" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs gap-1.5 px-3 py-2">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs gap-1.5 px-3 py-2">
                <Palette className="h-3.5 w-3.5 shrink-0" />
                Look
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs gap-1.5 px-3 py-2">
                <User className="h-3.5 w-3.5 shrink-0" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription>Choose what you want to be notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {settings && (
                    <>
                      <SettingRow
                        label="Analysis completed"
                        description="When a scan is saved to your account"
                        checked={settings.notifications.analysisComplete}
                        onCheckedChange={(v) =>
                          updateSetting({ notifications: { analysisComplete: v } })
                        }
                      />
                      <SettingRow
                        label="Profile updates"
                        description="Changes to your profile information"
                        checked={settings.notifications.profileUpdates}
                        onCheckedChange={(v) =>
                          updateSetting({ notifications: { profileUpdates: v } })
                        }
                      />
                      <SettingRow
                        label="System alerts"
                        description="Important service announcements"
                        checked={settings.notifications.systemAlerts}
                        onCheckedChange={(v) =>
                          updateSetting({ notifications: { systemAlerts: v } })
                        }
                      />
                      <SettingRow
                        label="Feature updates"
                        description="New features and improvements"
                        checked={settings.notifications.featureUpdates}
                        onCheckedChange={(v) =>
                          updateSetting({ notifications: { featureUpdates: v } })
                        }
                      />
                    </>
                  )}

                  <div className="border-t border-white/10 pt-6 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Recent notifications</p>
                      {notifications.some((n) => !n.read) && (
                        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={markAllRead}>
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`text-xs p-3 rounded-xl border ${
                            n.read
                              ? "border-white/5 bg-white/[0.02] opacity-70"
                              : "border-electric/20 bg-electric/5"
                          }`}
                        >
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-xs text-muted-foreground">No notifications yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {settings && (
                    <>
                      <SettingRow
                        label="Public profile"
                        checked={settings.privacy.profilePublic}
                        onCheckedChange={(v) => updateSetting({ privacy: { profilePublic: v } })}
                      />
                      <SettingRow
                        label="Show scan history"
                        checked={settings.privacy.showScans}
                        onCheckedChange={(v) => updateSetting({ privacy: { showScans: v } })}
                      />
                      <SettingRow
                        label="Show stats"
                        checked={settings.privacy.showStats}
                        onCheckedChange={(v) => updateSetting({ privacy: { showStats: v } })}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {settings && (
                    <SettingRow
                      label="Reduce motion"
                      checked={settings.appearance.reducedMotion}
                      onCheckedChange={(v) => updateSetting({ appearance: { reducedMotion: v } })}
                    />
                  )}
                  <p className="text-xs text-muted-foreground pt-4">Dark theme is enabled by default.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Button variant="outline" onClick={() => logOut()}>Sign Out</Button>
                  <Button variant="destructive" className="gap-2" disabled>
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                  <p className="text-[10px] text-muted-foreground">Contact support to delete your account and data.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
