"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Globe,
  Loader2,
  Scissors,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/header";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/hooks/use-toast";
import { updateProfileApi } from "@/lib/api-client";
import { loadProgressHistory } from "@/lib/client-data";
import { getFirebaseDb } from "@/lib/firebase/client";
import { updateUserProfile } from "@/services/firebase/users";
import { getPslColor } from "@/lib/psl";
import { cn } from "@/lib/utils";
import type { ProgressDataPoint } from "@/types";

export default function ProfilePage() {
  const { user, profile, configured, getIdToken, refreshProfile } = useAuth();
  const [progress, setProgress] = useState<ProgressDataPoint[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profile) {
      setBio(profile.bio);
      setCountry(profile.country);
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getIdToken();
      const data = await loadProgressHistory(user.uid, token);
      setProgress(data);
    })();
  }, [user, getIdToken]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const updates = { bio, country, displayName };
    const token = await getIdToken();
    const apiOk = await updateProfileApi(token, updates);
    let saved = apiOk;

    if (!apiOk) {
      const db = getFirebaseDb();
      if (db) {
        try {
          await updateUserProfile(db, user.uid, updates);
          saved = true;
        } catch {
          toast({ title: "Failed to save profile", variant: "destructive" });
          setSaving(false);
          return;
        }
      }
    }

    if (!saved) {
      toast({ title: "Failed to save profile", variant: "destructive" });
      setSaving(false);
      return;
    }

    await refreshProfile();
    setEditing(false);
    setSaving(false);
    toast({ title: "Profile saved", description: "Your changes are stored in Firestore.", variant: "success" });
  };

  if (!configured) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-lg mx-auto p-8 text-center text-muted-foreground">
          Configure Firebase to enable profiles.
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-lg mx-auto p-8 text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your profile.</p>
          <Link href="/login"><Button>Sign In</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-electric/30 to-electric/5 border border-electric/20 flex items-center justify-center text-3xl font-bold text-electric shrink-0 overflow-hidden">
              {profile?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                profile?.displayName?.charAt(0)?.toUpperCase() ?? "?"
              )}
            </div>
            <div className="flex-1 min-w-0 w-full">
              {editing ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Display name</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Country</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Your country"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{profile?.displayName}</h1>
                  <p className="text-sm text-muted-foreground">@{profile?.username}</p>
                  <p className="text-sm text-muted-foreground mt-2">{profile?.bio || "No bio yet."}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                    {profile?.country && (
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{profile.country}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {profile?.scanCount ?? 0} scans
                    </span>
                  </div>
                </>
              )}
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 flex justify-center">
              <ScoreRing value={profile?.avgHarmony ?? 0} label="Avg Harmony" size={72} />
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex justify-center">
              <ScoreRing value={profile?.avgSymmetry ?? 0} label="Avg Symmetry" size={72} />
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Avg PSL</p>
              <p className={cn("text-2xl font-bold", getPslColor("MTN"))}>
                {profile?.avgPsl?.toFixed(1) ?? "—"}/10
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ProgressChart data={progress} />
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Scissors className="h-4 w-4 text-electric" />
                Favorite Hairstyles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.favoriteHairstyles?.length ? (
                <ul className="space-y-2">
                  {profile.favoriteHairstyles.map((h) => (
                    <li key={h} className="text-sm text-muted-foreground">• {h}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Save recommendations from your scans.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-electric" />
              Improvement Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Track harmony, symmetry, and PSL trends as you complete more scans.
            {progress.length > 1 && (
              <p className="mt-2 text-foreground text-sm">
                Latest harmony: {progress[progress.length - 1]?.harmonyScore}% ·{" "}
                {progress[progress.length - 1].harmonyScore - progress[0].harmonyScore > 0 ? "+" : ""}
                {progress[progress.length - 1].harmonyScore - progress[0].harmonyScore}% since first scan
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
