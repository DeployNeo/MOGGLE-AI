import { parseAIResponse } from "@/lib/ai-response";
import { buildUserPrompt, getSystemPrompt } from "@/lib/ai-prompt";
import { OPENROUTER_MODEL } from "@/lib/constants";
import type { AIAnalysisResult, FaceShapeResult, FacialMetrics } from "@/types";

interface AnalyzePayload {
  metrics: FacialMetrics;
  faceShape: FaceShapeResult;
}

export async function analyzeWithOpenRouter(
  payload: AnalyzePayload,
  apiKey: string
): Promise<AIAnalysisResult> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://moggle-ai.vercel.app",
      "X-Title": "Moggle AI",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: buildUserPrompt(payload) },
      ],
      temperature: 0.25,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned empty response.");
  }

  return parseAIResponse(content, payload.metrics, payload.faceShape);
}
