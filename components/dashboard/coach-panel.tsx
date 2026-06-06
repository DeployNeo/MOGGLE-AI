"use client";

import { useEffect, useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { fetchCoachSuggestions } from "@/lib/api-client";
import type { CoachSuggestions, FacialMetrics } from "@/types";

interface CoachPanelProps {
  metrics?: FacialMetrics | null;
}

export function CoachPanel({ metrics }: CoachPanelProps) {
  const { getIdToken } = useAuth();
  const [coach, setCoach] = useState<CoachSuggestions | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!metrics) return;
    setLoading(true);
    getIdToken().then((token) =>
      fetchCoachSuggestions(metrics, token).then(setCoach).finally(() => setLoading(false))
    );
  }, [metrics, getIdToken]);

  if (!metrics) {
    return (
      <Card className="glass-card">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-electric" />
            AI Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground">Select a scan to receive coaching.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="p-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-electric" />
          AI Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {loading && <p className="text-xs text-muted-foreground animate-pulse">Generating plan...</p>}
        {coach && (
          <>
            <CoachSection title="Daily" items={coach.daily} />
            <CoachSection title="Weekly" items={coach.weekly} />
            <CoachSection title="Monthly Goals" items={coach.monthly} icon />
            <CoachSection title="Trends" items={coach.trends} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CoachSection({ title, items, icon }: { title: string; items: string[]; icon?: boolean }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-electric mb-2 flex items-center gap-1">
        {icon && <Calendar className="h-3 w-3" />}
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex gap-2">
            <span className="text-electric shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
