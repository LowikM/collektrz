/**
 * Portfolio normalization helpers.
 * Does not mutate stored collection data.
 */

export const UNKNOWN_SET_LABEL = "Unknown set";

const GRADED_CONDITION_PATTERN =
  /\b(psa|bgs|cgc|sgc|ace|graded|gem mint|mint\s*\d|black label)\b/i;

const GRADE_SCORE_PATTERN = /\b\d+(\.\d+)?\s*(?:\/\s*10|gem)\b/i;

const RARITY_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: "Special Illustration Rare", pattern: /special illustration rare|\bsir\b/i },
  { label: "Illustration Rare", pattern: /illustration rare|\bir\b/i },
  { label: "Ultra Rare", pattern: /ultra rare|\bur\b/i },
  { label: "Hyper Rare", pattern: /hyper rare|\bhr\b/i },
  { label: "Secret Rare", pattern: /secret rare|\bsr\b/i },
  { label: "Double Rare", pattern: /double rare|\brr\b/i },
  { label: "Rare", pattern: /\brare\b/i },
  { label: "Uncommon", pattern: /uncommon|\buc\b/i },
  { label: "Common", pattern: /common|\bc\b/i },
  { label: "Promo", pattern: /promo/i },
];

export function isGradedCondition(condition: string | null | undefined): boolean {
  if (!condition?.trim()) {
    return false;
  }

  return (
    GRADED_CONDITION_PATTERN.test(condition) ||
    GRADE_SCORE_PATTERN.test(condition)
  );
}

/**
 * Attempts to infer rarity from notes or condition text.
 * Returns null when no reliable signal exists.
 */
export function normalizeRarity(
  notes: string | null | undefined,
  condition: string | null | undefined,
): string | null {
  const sources = [notes, condition].filter(Boolean).join(" ");

  if (!sources.trim()) {
    return null;
  }

  for (const rule of RARITY_RULES) {
    if (rule.pattern.test(sources)) {
      return rule.label;
    }
  }

  return null;
}

export function normalizeSetName(setName: string | null | undefined): string {
  const trimmed = setName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : UNKNOWN_SET_LABEL;
}

export function getItemUniqueKey(input: {
  tcg_api_card_id: string | null;
  card_ref: string;
}): string {
  if (input.tcg_api_card_id) {
    return `tcg:${input.tcg_api_card_id}`;
  }

  return `ref:${input.card_ref}`;
}

export function hasRepresentativeImage(input: {
  image_url: string | null;
  tcg_api_card_id: string | null;
}): boolean {
  return Boolean(input.image_url?.trim() || input.tcg_api_card_id);
}

export function percentOf(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 1000) / 10;
}
