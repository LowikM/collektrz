/** Language-independent collector number normalization and comparison. */

const CARD_NUMBER_PATTERN = /^(\d+)\s*\/\s*(\d+)$/;

export type ParsedCardNumber = {
  primary: string;
  padded: string;
  total?: string;
  raw: string;
};

export function parseCollectorNumber(value: string | null | undefined): ParsedCardNumber | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, "");
  const match = normalized.match(CARD_NUMBER_PATTERN);

  if (!match) {
    const digitsOnly = normalized.match(/^(\d+)/);
    if (!digitsOnly) {
      return null;
    }

    const primary = String(Number.parseInt(digitsOnly[1], 10));
    return {
      primary,
      padded: primary.padStart(2, "0"),
      raw: normalized,
    };
  }

  const primary = String(Number.parseInt(match[1], 10));
  return {
    primary,
    padded: primary.padStart(2, "0"),
    total: match[2],
    raw: `${primary}/${match[2]}`,
  };
}

export function collectorNumbersMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const parsedA = parseCollectorNumber(a);
  const parsedB = parseCollectorNumber(b);

  if (!parsedA || !parsedB) {
    return false;
  }

  if (parsedA.primary === parsedB.primary) {
    if (parsedA.total && parsedB.total) {
      return parsedA.total === parsedB.total;
    }

    return true;
  }

  return (
    parsedA.padded === parsedB.primary ||
    parsedB.padded === parsedA.primary ||
    parsedA.primary === parsedB.padded ||
    parsedB.primary === parsedA.padded
  );
}

export function extractCardNumberFromText(text: string): string | null {
  const match = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return null;
  }

  return `${Number.parseInt(match[1], 10)}/${match[2]}`;
}
