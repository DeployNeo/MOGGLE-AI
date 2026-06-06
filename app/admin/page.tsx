"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Database,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  fetchAdminStatsClient,
  fetchAdminUsersClient,
  type AdminUserRow,
} from "@/services/firebase/admin-client";
import { cn } from "@/lib/utils";
import type { AdminStats } from "@/types";

export default function AdminPage() {
  const { user, profile, getIdToken, refreshProfile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    refreshProfile();
  }, [user, refreshProfile]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getIdToken();
        if (!token) {
          setError("Could not get auth token.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats", { headers }),
          fetch("/api/admin/users", { headers }),
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();

        if (statsRes.ok) {
          setStats(statsData.stats);
        }

        if (usersRes.ok) {
          setUsers(usersData.users ?? []);
        }

        if (!statsRes.ok || !usersRes.ok) {
          const db = getFirebaseDb();
          if (db) {
            try {
              const [clientStats, clientUsers] = await Promise.all([
                !statsRes.ok ? fetchAdminStatsClient(db) : Promise.resolve(null),
                !usersRes.ok ? fetchAdminUsersClient(db) : Promise.resolve(null),
              ]);
              if (clientStats) setStats(clientStats);
              if (clientUsers) setUsers(clientUsers);
              if (clientStats || clientUsers) setError(null);
            } catch {
              setError(
                statsData.error ??
                  usersData.error ??
                  "Failed to load admin data. Set role: admin on your user document in Firestore."
              );
            }
          } else if (!statsRes.ok || !usersRes.ok) {
            setError(
              statsData.error ??
                usersData.error ??
                "Server admin API unavailable. Configure FIREBASE_ADMIN_* or use client Firestore."
            );
          }
        }
      } catch {
        const db = getFirebaseDb();
        if (db) {
          try {
            const [clientStats, clientUsers] = await Promise.all([
              fetchAdminStatsClient(db),
              fetchAdminUsersClient(db),
            ]);
            setStats(clientStats);
            setUsers(clientUsers);
          } catch {
            setError("Failed to load admin data.");
          }
        } else {
          setError("Failed to load admin data.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, profile?.role, getIdToken]);

  if (!user) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="p-12 text-center">
          <Link href="/login"><Button>Sign In</Button></Link>
        </div>
      </main>
    );
  }

  if (loading && !profile) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading...</div>
      </main>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-lg mx-auto p-12 text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-semibold mb-2">Admin access required</h1>
          <p className="text-sm text-muted-foreground mb-4">
            In Firebase Console → Firestore → users → your document, set:
          </p>
          <code className="text-xs bg-white/5 px-3 py-2 rounded-lg block">
            role: &quot;admin&quot;
          </code>
        </div>
      </main>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-electric/15 flex items-center justify-center">
            <Shield className="h-5 w-5 text-electric" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Console</h1>
            <p className="text-sm text-muted-foreground">System monitoring and user management</p>
          </div>
        </div>

        {error && (
          <Card className="border-amber-500/30 mb-6">
            <CardContent className="p-4 text-sm text-amber-400">{error}</CardContent>
          </Card>
        )}

        {loading && <p className="text-sm text-muted-foreground animate-pulse mb-4">Loading admin data...</p>}

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
            <StatCard icon={BarChart3} label="Total Scans" value={stats.totalScans} />
            <StatCard icon={Activity} label="Errors (7d)" value={stats.errorsLast7d} />
            <StatCard
              icon={Database}
              label="AI Providers"
              value={Object.keys(stats.aiUsage).length}
              sub={Object.entries(stats.aiUsage).map(([k, v]) => `${k}: ${v}`).join(" · ")}
            />
          </div>
        )}

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </CardTitle>
            <CardDescription>Search and monitor user activity</CardDescription>
            <div className="relative mt-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Scans</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3">
                      <p className="font-medium">{u.displayName}</p>
                      <p className="text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px]", u.role === "admin" ? "bg-electric/20 text-electric" : "bg-white/5")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.scanCount}</td>
                    <td className="p-3 text-muted-foreground">
                      {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground p-4">No users found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-electric" />
          <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</p>}
      </CardContent>
    </Card>
  );
}
