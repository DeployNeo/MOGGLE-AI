import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { orchestrateAIAnalysis } from "@/services/ai-orchestrator";
import { verifyAuthToken } from "@/lib/auth-server";
import { jsonError, jsonOk, getClientIp } from "@/lib/api-response";
import { rateLimitAnalyze, rateLimitHeaders } from "@/lib/rate-limit";
import { cacheGetOrSet } from "@/lib/cache";
import { analyzeRequestSchema } from "@/lib/validations";
import { getAdminDb } from "@/lib/firebase/admin";
import { logActivity } from "@/services/firebase/server/users";

export const runtime = "nodejs";

function cacheKey(metrics: unknown, faceShape: unknown): string {
  const payload = JSON.stringify({ metrics, faceShape });
  return `analyze:${createHash("sha256").update(payload).digest("hex")}`;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  const ip = getClientIp(request);
  const identifier = auth?.uid ?? ip;

  const rate = await rateLimitAnalyze(identifier);
  if (!rate.success) {
    return jsonError("Rate limit exceeded. Try again shortly.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.");
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Invalid request.");
  }

  const { metrics, faceShape } = parsed.data;
  const key = cacheKey(metrics, faceShape);

  try {
    const cached = await cacheGetOrSet(
      key,
      async () => {
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_KEY;
        return orchestrateAIAnalysis(
          { metrics, faceShape },
          openRouterKey,
          groqKey
        );
      },
      600
    );

    if (auth) {
      const db = getAdminDb();
      if (db) {
        await logActivity(db, auth.uid, "ai.analyze", {
          provider: cached.provider,
        });
      }
    }

    return jsonOk(
      { analysis: cached.analysis, provider: cached.provider },
      { headers: rateLimitHeaders(rate) }
    );
  } catch {
    return jsonOk(
      {
        analysis: null,
        provider: "cv-only",
        error:
          "AI analysis temporarily unavailable. Computer vision results are still available.",
      },
      { headers: rateLimitHeaders(rate) }
    );
  }
}
