import {
  buildSearchQueryFromHints,
  normalizeRecognitionText,
} from "@/lib/card-recognition/normalize-recognition";
import { deduplicateCandidates, scoreCandidate } from "@/lib/card-recognition/score-candidate";
import {
  cardSearchResultToCandidate,
  type CardRecognitionCandidate,
  type ExtractedCardHints,
} from "@/lib/card-recognition/types";
import { CANDIDATE_LIMITS } from "@/lib/card-recognition/confidence-config";
import {
  parseCollectorQuery,
  searchCards,
  type PokemonTcgCardSearchResult,
} from "@/lib/pokemon-tcg";

export async function matchCatalogFromHints(
  hints: ExtractedCardHints,
): Promise<{
  candidates: CardRecognitionCandidate[];
  searchQuery: string;
  confidence: number;
}> {
  const searchQuery = buildSearchQueryFromHints(hints);

  if (!searchQuery || searchQuery.length < 2) {
    return { candidates: [], searchQuery: searchQuery ?? "", confidence: 0 };
  }

  let results: PokemonTcgCardSearchResult[];

  try {
    results = await searchCards(searchQuery, 20);
  } catch {
    throw new Error("CARD_API_UNAVAILABLE");
  }

  if (results.length === 0 && hints.rawText && hints.rawText !== searchQuery) {
    try {
      results = await searchCards(hints.rawText.slice(0, 100), 20);
    } catch {
      throw new Error("CARD_API_UNAVAILABLE");
    }
  }

  const parsed = parseCollectorQuery(searchQuery);
  const scored = deduplicateCandidates(
    results.map((card) => scoreCandidate(card, hints, parsed)),
  ).slice(0, CANDIDATE_LIMITS.maxSearch);

  const topConfidence = scored[0]?.confidence ?? 0;

  return {
    candidates: scored,
    searchQuery,
    confidence: topConfidence,
  };
}

export async function matchCatalogFromRawText(rawText: string) {
  const hints = normalizeRecognitionText(rawText);
  return matchCatalogFromHints(hints);
}

/** @deprecated Use scoreCandidate from score-candidate.ts */
export { scoreCandidate, cardSearchResultToCandidate };
