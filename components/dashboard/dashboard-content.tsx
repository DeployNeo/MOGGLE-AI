"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Plus,
  Scissors,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/header";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { CoachPanel } from "@/components/dashboard/coach-panel";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import {
  loadAnalysisHistory,
  loadNotifications,
  loadProgressHistory,
} from "@/lib/client-data";
import { getPslColor } from "@/lib/psl";
import { cn } from "@/lib/utils";
import type { AppNotification, PSLRating, ProgressDataPoint, SavedAnalysisRecord } from "@/types";

const FaceSimulator = dynamic(
  () => import("@/components/simulator/face-simulator").then((m) => m.FaceSimulator),
  { ssr: false, loading: () => <p className="text-xs text-muted-foreground p-4">Loading...</p> }
);

export function DashboardContent() {
  const { user, profile, getIdToken } = useAuth();
  const searchParams = useSearchParams();
  const [analyses, setAnalyses] = useState<SavedAnalysisRecord[]>([]);
  const [progress, setProgress] = useState<ProgressDataPoint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedId = searchParams.get("analysis");
  const selected = analyses.find((a) => a.id === selectedId) ?? analyses[0];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const token = await getIdToken();
      const [history, prog, notifs] = await Promise.all([
        loadAnalysisHistory(user.uid, token),
        loadProgressHistory(user.uid, token),
        loadNotifications(user.uid, token),
      ]);
      setAnalyses(history);
      setProgress(prog);
      setNotifications(notifs);
      setLoading(false);
    })();
  }, [user, getIdToken]);

  if (!user) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-lg mx-auto p-12 text-center">
          <h1 className="text-xl font-bold mb-2">Premium Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to access your analysis hub.</p>
          <Link href="/login"><Button>Sign In</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-xs text-electric font-medium mb-1">Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Hey, {profile?.displayName?.split(" ")[0] ?? "there"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.scanCount ?? 0} scans · track your progress
            </p>
          </div>
          <Link href="/#analyze">
            <Button className="gap-2 glow-electric">
              <Plus className="h-4 w-4" />
              New Scan
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        ) : analyses.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Sparkles className="h-8 w-8 text-electric mx-auto mb-4" />
            <h2 className="font-semibold mb-2">No scans yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Run your first analysis to unlock insights.</p>
            <Link href="/#analyze"><Button>Start Analysis</Button></Link>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard ring label="Harmony" value={selected?.harmonyScore ?? 0} />
              <StatCard ring label="Symmetry" value={selected?.symmetryScore ?? 0} />
              <StatCard ring label="Composite" value={selected?.compositeScore ?? 0} />
              <Card className="glass-card">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">PSL</p>
                  <p className={cn("text-2xl font-bold", getPslColor((selected?.pslRating ?? "MTN") as PSLRating))}>
                    {selected?.pslRating}
                  </p>
                  <p className="text-xs text-muted-foreground">{selected?.pslNumeric}/10</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="glass p-1 h-auto flex flex-wrap gap-1">
                {["overview", "metrics", "recommendations", "progress", "coach", "simulator", "notifications"].map((t) => (
                  <TabsTrigger key={t} value={t} className="text-xs capitalize px-3 py-2">
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-electric" />
                        Recent Scan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{selected?.faceShape} · {selected?.source}</p>
                      <p className="text-xs text-muted-foreground">
                        {selected?.createdAt && new Date(selected.createdAt).toLocaleString()}
                      </p>
                      {selected?.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selected.imageUrl} alt="Scan" className="rounded-xl max-h-44 object-contain bg-black/30" />
                      )}
                      <Link href={`/dashboard?analysis=${selected?.id}`} className="text-xs text-electric flex items-center gap-1">
                        View details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>
                  <ProgressChart data={progress} />
                </div>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />Saved Scans
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analyses.map((a) => (
                      <Link
                        key={a.id}
                        href={`/dashboard?analysis=${a.id}`}
                        className={cn(
                          "flex justify-between rounded-xl border p-3 text-xs transition-all hover:border-electric/30",
                          a.id === selected?.id ? "border-electric/40 bg-electric/5" : "border-white/10"
                        )}
                      >
                        <span className={getPslColor(a.pslRating as PSLRating)}>{a.pslRating} · {a.faceShape}</span>
                        <span className="text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics">
                {selected?.metrics ? (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    {Object.entries({
                      Harmony: selected.metrics.harmony,
                      Symmetry: selected.metrics.symmetry,
                      Jawline: selected.metrics.jawline,
                      Eyes: selected.metrics.eyes,
                      "Eye Tilt": selected.metrics.eyeTilt,
                      "Canthal Tilt": selected.metrics.canthalTilt,
                      "Jaw Prominence": selected.metrics.jawProminence,
                      "Chin Projection": selected.metrics.chinProjection,
                    }).map(([label, value]) => (
                      <Card key={label} className="glass-card">
                        <CardContent className="p-4 text-center">
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                          <p className="text-xl font-bold">{value}%</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a scan with full metrics.</p>
                )}
              </TabsContent>

              <TabsContent value="recommendations">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-electric" />
                      Top Hairstyles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selected?.hairstyles?.slice(0, 5).map((h) => (
                      <div key={h.name} className="flex justify-between text-sm p-3 rounded-xl bg-white/[0.03]">
                        <span>{h.name}</span>
                        <span className="text-electric font-medium">{h.score}%</span>
                      </div>
                    )) ?? <p className="text-xs text-muted-foreground">No recommendations stored.</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress"><ProgressChart data={progress} /></TabsContent>
              <TabsContent value="coach">
                <CoachPanel metrics={selected?.metrics ?? null} />
              </TabsContent>
              <TabsContent value="simulator">
                <FaceSimulator faceShape={selected?.faceShape ?? "Oval"} />
              </TabsContent>
              <TabsContent value="notifications">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className={cn("p-3 rounded-xl border text-xs", n.read ? "border-white/5 opacity-70" : "border-electric/20 bg-electric/5")}>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-muted-foreground">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && <p className="text-xs text-muted-foreground">No notifications.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, ring }: { label: string; value: number; ring?: boolean }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 flex justify-center">
        {ring ? <ScoreRing value={value} label={label} size={68} /> : <p className="text-2xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  );
}
