/**
 * Canonical card identity for event intelligence matching.
 *
 * Priority:
 * 1. tcg_api_card_id when both records have it
 * 2. normalized card_ref fallback
 * 3. never card name, card number, or set alone
 */

export type EventCardIdentityInput = {
  tcg_api_card_id?: string | null;
  card_ref?: string | null;
};

export function normalizeCardRef(
  cardRef: string | null | undefined,
): string | null {
  if (!cardRef) {
    return null;
  }

  const trimmed = cardRef.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function isExactTcgIdentityMatch(
  a: EventCardIdentityInput,
  b: EventCardIdentityInput,
): boolean {
  return Boolean(
    a.tcg_api_card_id &&
      b.tcg_api_card_id &&
      a.tcg_api_card_id === b.tcg_api_card_id,
  );
}

export function cardsShareIdentity(
  a: EventCardIdentityInput,
  b: EventCardIdentityInput,
): boolean {
  if (isExactTcgIdentityMatch(a, b)) {
    return true;
  }

  const refA = normalizeCardRef(a.card_ref);
  const refB = normalizeCardRef(b.card_ref);

  return Boolean(refA && refB && refA === refB);
}

export function getEventCardIdentityKey(
  input: EventCardIdentityInput,
): string | null {
  if (input.tcg_api_card_id) {
    return `tcg:${input.tcg_api_card_id}`;
  }

  const ref = normalizeCardRef(input.card_ref);
  if (ref) {
    return `ref:${ref}`;
  }

  return null;
}
