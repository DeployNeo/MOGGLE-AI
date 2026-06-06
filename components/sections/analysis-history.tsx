"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, History, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { getPslColor } from "@/lib/psl";
import { deleteAnalysisApi } from "@/lib/api-client";
import { loadAnalysisHistory } from "@/lib/client-data";
import { getFirebaseDb } from "@/lib/firebase/client";
import { deleteAnalysis } from "@/services/firebase/analyses";
import { cn } from "@/lib/utils";
import type { PSLRating, SavedAnalysisRecord } from "@/types";

export function AnalysisHistory() {
  const { user, getIdToken } = useAuth();
  const [records, setRecords] = useState<SavedAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const token = await getIdToken();
      const data = await loadAnalysisHistory(user.uid, token);
      if (!cancelled) {
        setRecords(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, getIdToken]);

  const handleDelete = async (id: string) => {
    const token = await getIdToken();
    let ok = await deleteAnalysisApi(id, token);
    if (!ok && user) {
      const db = getFirebaseDb();
      if (db) ok = await deleteAnalysis(db, user.uid, id);
    }
    if (ok) setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  if (!user) {
    return (
      <Card className="glass-card">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-electric" />
            Scan History
          </CardTitle>
          <CardDescription className="text-xs">
            <Link href="/login" className="text-electric hover:underline">Sign in</Link> to save and compare scans.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="p-4">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-electric" />
          Your Scans
        </CardTitle>
        <CardDescription className="text-xs">
          {records.length} saved {records.length === 1 ? "analysis" : "analyses"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {loading && <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>}
        {!loading && records.length === 0 && (
          <p className="text-xs text-muted-foreground">No saved scans yet.</p>
        )}
        {records.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 group"
          >
            <Link href={`/dashboard?analysis=${r.id}`} className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold", getPslColor(r.pslRating as PSLRating))}>
                {r.pslRating} · {r.pslNumeric}/10
              </p>
              <p className="text-[10px] text-muted-foreground">
                {r.faceShape} · harmony {r.harmonyScore} · {r.source}
              </p>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(r.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-opacity"
                aria-label="Delete scan"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {records.length > 0 && (
          <Link href="/dashboard" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Open Dashboard
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
