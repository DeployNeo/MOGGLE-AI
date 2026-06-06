import { analyzeWithGroq } from "@/services/ai-groq";
import { mergeAIResults } from "@/services/ai-merge";
import { analyzeWithOpenRouter } from "@/services/ai-openrouter";
import type { AIAnalysisResult, AIProvider, FaceShapeResult, FacialMetrics } from "@/types";

interface OrchestratorPayload {
  metrics: FacialMetrics;
  faceShape: FaceShapeResult;
}

interface OrchestratorResult {
  analysis: AIAnalysisResult | null;
  provider: AIProvider;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
      }
    }
  }
  throw lastError ?? new Error("Request failed after retries.");
}

export async function orchestrateAIAnalysis(
  payload: OrchestratorPayload,
  openRouterKey?: string,
  groqKey?: string
): Promise<OrchestratorResult> {
  const hasOpenRouter = Boolean(openRouterKey);
  const hasGroq = Boolean(groqKey);

  if (!hasOpenRouter && !hasGroq) {
    return { analysis: null, provider: "cv-only" };
  }

  let openRouterResult: AIAnalysisResult | null = null;
  let groqResult: AIAnalysisResult | null = null;

  const openRouterPromise = hasOpenRouter
    ? withRetry(() => analyzeWithOpenRouter(payload, openRouterKey!))
        .then((r) => {
          openRouterResult = r;
          return r;
        })
        .catch(() => null)
    : Promise.resolve(null);

  const groqPromise = hasGroq
    ? withRetry(() => analyzeWithGroq(payload, groqKey!))
        .then((r) => {
          groqResult = r;
          return r;
        })
        .catch(() => null)
    : Promise.resolve(null);

  await Promise.allSettled([openRouterPromise, groqPromise]);

  if (openRouterResult && groqResult) {
    return {
      analysis: mergeAIResults(openRouterResult, groqResult),
      provider: "openrouter",
    };
  }

  if (openRouterResult) {
    return { analysis: openRouterResult, provider: "openrouter" };
  }

  if (groqResult) {
    return { analysis: groqResult, provider: "groq" };
  }

  if (hasGroq && !groqResult) {
    try {
      const fallback = await withRetry(() =>
        analyzeWithGroq(payload, groqKey!)
      );
      return { analysis: fallback, provider: "groq" };
    } catch {
      // fall through
    }
  }

  if (hasOpenRouter && !openRouterResult) {
    try {
      const fallback = await withRetry(() =>
        analyzeWithOpenRouter(payload, openRouterKey!)
      );
      return { analysis: fallback, provider: "openrouter" };
    } catch {
      // fall through
    }
  }

  return { analysis: null, provider: "cv-only" };
}
