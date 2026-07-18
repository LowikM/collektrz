import { collectorNumbersMatch, parseCollectorNumber } from "@/lib/card-recognition/card-number";
import {
  cardSearchResultToCandidate,
  type CardRecognitionCandidate,
  type ExtractedCardHints,
} from "@/lib/card-recognition/types";
import { parseCollectorQuery, type PokemonTcgCardSearchResult } from "@/lib/pokemon-tcg";

export function normalizeCardNameForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenOverlapScore(a: string, b: string): number {
  const tokensA = new Set(normalizeCardNameForMatch(a).split(" ").filter(Boolean));
  const tokensB = new Set(normalizeCardNameForMatch(b).split(" ").filter(Boolean));

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(tokensA.size, tokensB.size);
}

export function scoreCandidate(
  card: PokemonTcgCardSearchResult,
  hints: ExtractedCardHints,
  parsed: ReturnType<typeof parseCollectorQuery>,
): CardRecognitionCandidate {
  let score = 0.15;
  const reasons: string[] = [];

  const cardNameNorm = normalizeCardNameForMatch(card.name);
  const hintName = hints.extractedName
    ? normalizeCardNameForMatch(hints.extractedName)
    : null;

  const numberMatch = Boolean(
    hints.extractedNumber && collectorNumbersMatch(hints.extractedNumber, card.number),
  );
  const parsedNumberMatch = Boolean(
    parsed.cardNumber &&
      card.number &&
      parseCollectorNumber(card.number)?.primary &&
      parsed.cardNumber.cardNumbers.some((value) =>
        collectorNumbersMatch(value, card.number),
      ),
  );

  if (numberMatch || parsedNumberMatch) {
    score += 0.35;
    reasons.push("Collector number match");
  }

  if (hintName) {
    if (cardNameNorm === hintName) {
      score += 0.3;
      reasons.push("Exact name match");
    } else {
      const overlap = tokenOverlapScore(hints.extractedName ?? "", card.name);
      if (overlap >= 0.75) {
        score += 0.22;
        reasons.push("Strong name overlap");
      } else if (overlap >= 0.4) {
        score += 0.12;
        reasons.push("Partial name overlap");
      } else if (
        cardNameNorm.includes(hintName) ||
        hintName.includes(cardNameNorm)
      ) {
        score += 0.08;
        reasons.push("Weak name match");
      }
    }
  }

  const setHint = hints.extractedSetHint ?? parsed.setName;
  if (setHint && card.set.name) {
    const setHintNorm = normalizeCardNameForMatch(setHint);
    const setNameNorm = normalizeCardNameForMatch(card.set.name);

    if (setNameNorm.includes(setHintNorm) || setHintNorm.includes(setNameNorm)) {
      score += numberMatch || parsedNumberMatch ? 0.2 : 0.08;
      reasons.push(
        numberMatch || parsedNumberMatch ? "Set match with number" : "Set hint match",
      );
    } else if (numberMatch || parsedNumberMatch) {
      score -= 0.12;
      reasons.push("Number match, different set");
    }
  }

  if (hints.rawText) {
    const overlap = tokenOverlapScore(hints.rawText, `${card.name} ${card.set.name}`);
    if (overlap >= 0.35) {
      score += 0.08;
      reasons.push("OCR token overlap");
    }
  }

  if (!numberMatch && !parsedNumberMatch && !hintName) {
    score = Math.min(score, 0.4);
  }

  if (!numberMatch && !parsedNumberMatch && hintName && cardNameNorm !== hintName) {
    score = Math.min(score, 0.55);
  }

  return cardSearchResultToCandidate(
    card,
    Math.min(Math.max(Math.round(score * 100) / 100, 0.05), 0.98),
    reasons.length > 0 ? reasons : ["Catalog search result"],
  );
}

export function deduplicateCandidates(
  candidates: CardRecognitionCandidate[],
): CardRecognitionCandidate[] {
  const byId = new Map<string, CardRecognitionCandidate>();

  for (const candidate of candidates) {
    const existing = byId.get(candidate.cardId);
    if (!existing || candidate.confidence > existing.confidence) {
      byId.set(candidate.cardId, candidate);
    }
  }

  return [...byId.values()].sort((a, b) => b.confidence - a.confidence);
}
