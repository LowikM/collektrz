export const CARD_LANGUAGES = [
  "English",
  "Japanese",
  "Dutch",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Portuguese",
  "Traditional Chinese",
  "Simplified Chinese",
  "Korean",
  "Thai",
  "Indonesian",
] as const;

export type CardLanguage = (typeof CARD_LANGUAGES)[number];

export function isCardLanguage(value: string): value is CardLanguage {
  return (CARD_LANGUAGES as readonly string[]).includes(value);
}
