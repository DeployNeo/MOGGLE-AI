"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgressDataPoint } from "@/types";

interface ProgressChartProps {
  data: ProgressDataPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Progress Trends</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground">
            Complete more scans to unlock trend charts.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Progress Trends</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#888" }} />
            <Tooltip
              contentStyle={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="harmonyScore"
              name="Harmony"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="symmetryScore"
              name="Symmetry"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="pslNumeric"
              name="PSL"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
