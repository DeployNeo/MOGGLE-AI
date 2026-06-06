import { parseAIResponse } from "@/lib/ai-response";
import { buildUserPrompt, getSystemPrompt } from "@/lib/ai-prompt";
import { GROQ_MODEL } from "@/lib/constants";
import type { AIAnalysisResult, FaceShapeResult, FacialMetrics } from "@/types";

interface AnalyzePayload {
  metrics: FacialMetrics;
  faceShape: FaceShapeResult;
}

export async function analyzeWithGroq(
  payload: AnalyzePayload,
  apiKey: string
): Promise<AIAnalysisResult> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
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
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned empty response.");
  }

  return parseAIResponse(content, payload.metrics, payload.faceShape);
}
