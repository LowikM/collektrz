export const ITEM_VISIBILITY_VALUES = ["public", "private"] as const;

export type ItemVisibility = (typeof ITEM_VISIBILITY_VALUES)[number];

export const SECTION_VISIBILITY_VALUES = ["public", "private"] as const;

export type SectionVisibility = (typeof SECTION_VISIBILITY_VALUES)[number];

export function isItemVisibility(value: string): value is ItemVisibility {
  return ITEM_VISIBILITY_VALUES.includes(value as ItemVisibility);
}

export function isSectionVisibility(value: string): value is SectionVisibility {
  return SECTION_VISIBILITY_VALUES.includes(value as SectionVisibility);
}

export function parseItemVisibilityField(
  formData: FormData,
  fieldName = "visibility",
):
  | { error: string }
  | { value: ItemVisibility } {
  const raw = formData.get(fieldName);

  if (typeof raw !== "string" || !isItemVisibility(raw)) {
    return { error: "Please select a valid visibility option." };
  }

  return { value: raw };
}

export function parseSectionVisibilityField(
  formData: FormData,
  fieldName: string,
):
  | { error: string }
  | { value: SectionVisibility } {
  const raw = formData.get(fieldName);

  if (typeof raw !== "string" || !isSectionVisibility(raw)) {
    return { error: "Please select a valid visibility option." };
  }

  return { value: raw };
}

export function parseBooleanField(
  formData: FormData,
  fieldName: string,
): boolean {
  const raw = formData.get(fieldName);
  return raw === "on" || raw === "true" || raw === "1";
}

export function parseItemIds(formData: FormData, fieldName: string): string[] {
  const values = formData.getAll(fieldName);
  return values.filter((value): value is string => typeof value === "string" && value.length > 0);
}

export const ITEM_VISIBILITY_LABELS: Record<ItemVisibility, string> = {
  public: "Public",
  private: "Private",
};
