import type { PokemonTcgCardSearchResult } from "@/lib/pokemon-tcg";

export type CardRecognitionCandidate = {
  cardId: string;
  name: string;
  setName: string;
  setId?: string;
  number: string;
  imageUrl: string;
  confidence: number;
  reasons: string[];
};

import type { RecognitionConfidenceLevel } from "@/lib/card-recognition/confidence-config";

export type CardRecognitionResult = {
  extractedName?: string;
  extractedNumber?: string;
  extractedSetHint?: string;
  confidence: number;
  confidenceLevel?: RecognitionConfidenceLevel;
  candidates: CardRecognitionCandidate[];
  provider?: string;
  uncertain?: boolean;
  message?: string;
  fallbackReason?: string;
};

export type ExtractedCardHints = {
  rawText?: string;
  extractedName?: string;
  extractedNumber?: string;
  extractedSetHint?: string;
};

export type CardRecognitionProvider = {
  id: string;
  extractHintsFromImage?(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<ExtractedCardHints | null>;
};

export function cardSearchResultToCandidate(
  card: PokemonTcgCardSearchResult,
  confidence: number,
  reasons: string[],
): CardRecognitionCandidate {
  return {
    cardId: card.id,
    name: card.name,
    setName: card.set.name,
    setId: card.set.id,
    number: card.number,
    imageUrl: card.images.small || card.images.large || "",
    confidence,
    reasons,
  };
}

export function searchResultToSelectedCard(
  candidate: CardRecognitionCandidate,
): PokemonTcgCardSearchResult {
  return {
    id: candidate.cardId,
    name: candidate.name,
    number: candidate.number,
    set: {
      id: candidate.setId ?? "",
      name: candidate.setName,
    },
    images: {
      small: candidate.imageUrl,
      large: candidate.imageUrl,
    },
  };
}
