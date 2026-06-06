export function sanitizeAnalysisText(text: string): string {
  if (!text) return "";

  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\bCV[- ]?(only|composite|autopsy|confidence|pre[- ]?analysis)\b/gi, "analysis")
    .replace(/\bcomputer vision\b/gi, "facial scan")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeStringArray(items: string[]): string[] {
  return items.map(sanitizeAnalysisText).filter(Boolean);
}
