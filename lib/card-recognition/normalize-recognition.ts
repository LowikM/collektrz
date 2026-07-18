import type { ExtractedCardHints } from "@/lib/card-recognition/types";
import { parseCollectorQuery } from "@/lib/pokemon-tcg";

const CARD_NUMBER_PATTERN = /(\d+)\s*\/\s*(\d+)/g;
const NOISE_LINE_PATTERN =
  /^(pok[eé]mon|trainer|energy|basic|stage|hp|weakness|resistance|retreat|illus\.|©|\d{4})$/i;

/**
 * Cleans OCR / vision output into structured hints without mutating source data.
 */
export function normalizeRecognitionText(rawText: string): ExtractedCardHints {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !NOISE_LINE_PATTERN.test(line))
    .filter((line) => line.length > 1);

  const joined = lines.join(" ").replace(/\s+/g, " ").trim();
  const parsed = parseCollectorQuery(joined);

  let extractedNumber: string | undefined;
  const numberMatch = joined.match(CARD_NUMBER_PATTERN);
  if (numberMatch) {
    extractedNumber = numberMatch[0].replace(/\s+/g, "");
  } else if (parsed.cardNumber) {
    const first = parsed.cardNumber.cardNumbers[0];
    extractedNumber = `${first}/${parsed.cardNumber.setTotal}`;
  }

  const extractedName = parsed.cardName ?? guessNameFromLines(lines);
  const extractedSetHint = parsed.setName ?? guessSetFromLines(lines, extractedName);

  return {
    rawText: joined,
    extractedName,
    extractedNumber,
    extractedSetHint,
  };
}

function guessNameFromLines(lines: string[]): string | undefined {
  const candidates = lines.filter(
    (line) =>
      !CARD_NUMBER_PATTERN.test(line) &&
      line.length >= 3 &&
      line.length <= 48 &&
      /[a-zA-Z]/.test(line),
  );

  return candidates.sort((a, b) => b.length - a.length)[0];
}

function guessSetFromLines(lines: string[], name?: string): string | undefined {
  const withoutName = lines.filter(
    (line) => !name || !line.toLowerCase().includes(name.toLowerCase()),
  );

  return withoutName.find((line) => line.length >= 4 && line.length <= 40);
}

export function mergeExtractedHints(
  ...sources: Array<ExtractedCardHints | null | undefined>
): ExtractedCardHints {
  const merged: ExtractedCardHints = {};

  for (const source of sources) {
    if (!source) {
      continue;
    }

    merged.rawText = merged.rawText || source.rawText;
    merged.extractedName = merged.extractedName || source.extractedName;
    merged.extractedNumber = merged.extractedNumber || source.extractedNumber;
    merged.extractedSetHint = merged.extractedSetHint || source.extractedSetHint;
  }

  return merged;
}

export function buildSearchQueryFromHints(hints: ExtractedCardHints): string {
  const parts = [
    hints.extractedName,
    hints.extractedNumber,
    hints.extractedSetHint,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return hints.rawText?.trim() ?? "";
}
