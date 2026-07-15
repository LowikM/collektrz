export const SEALED_PRODUCT_TYPES = [
  "Booster Box",
  "Elite Trainer Box",
  "Booster Bundle",
  "Tin",
  "Collection Box",
  "Blister",
  "Booster Pack",
  "Build & Battle",
  "Other",
] as const;

export type SealedProductType = (typeof SEALED_PRODUCT_TYPES)[number];

export const SEALED_CONDITIONS = [
  "Factory Sealed",
  "Seal Damaged",
  "Opened",
] as const;

export type SealedCondition = (typeof SEALED_CONDITIONS)[number];

export const COLLECTION_IMAGE_URL_MAX_LENGTH = 500;

export function isSealedProductType(value: string): value is SealedProductType {
  return SEALED_PRODUCT_TYPES.includes(value as SealedProductType);
}

export function isSealedCondition(value: string): value is SealedCondition {
  return SEALED_CONDITIONS.includes(value as SealedCondition);
}

export function isValidCollectionImageUrl(value: string): boolean {
  if (value.length > COLLECTION_IMAGE_URL_MAX_LENGTH) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
