import type { ExtractedCardHints } from "@/lib/card-recognition/types";
import { buildSearchQueryFromHints } from "@/lib/card-recognition/normalize-recognition";

/** Builds the best manual-search query from recognition hints. */
export function buildFallbackSearchQuery(hints: ExtractedCardHints): string {
  const structured = [
    hints.extractedName,
    hints.extractedNumber,
    hints.extractedSetHint,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (structured.length >= 2) {
    return structured;
  }

  return buildSearchQueryFromHints(hints).trim();
}

export function splitFallbackHints(hints: ExtractedCardHints) {
  return {
    name: hints.extractedName ?? "",
    number: hints.extractedNumber ?? "",
    setHint: hints.extractedSetHint ?? "",
    query: buildFallbackSearchQuery(hints),
  };
}
