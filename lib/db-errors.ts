import type { PostgrestError } from "@supabase/supabase-js";

export const USER_LOAD_ERROR = {
  profile:
    "We couldn't load your profile right now. Please try again in a moment.",
  collection:
    "We couldn't load your collection right now. Please try again.",
  wishlist: "We couldn't load your wishlist right now. Please try again.",
  portfolio:
    "We couldn't load your portfolio right now. Your collection is safe. Please try again.",
} as const;

export const SCHEMA_DRIFT_BANNER =
  "Some account privacy settings are temporarily unavailable while the database is being updated. Your items remain private.";

/** PostgREST / Postgres missing-column errors (42703). */
export function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const pgError = error as PostgrestError & { code?: string };

  if (pgError.code === "42703") {
    return true;
  }

  const message = pgError.message?.toLowerCase() ?? "";
  return message.includes("does not exist") && message.includes("column");
}

export function logDatabaseError(
  scope: string,
  error: unknown,
  context?: Record<string, unknown>,
) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  console.error(`[db:${scope}]`, {
    message,
    missingColumn: isMissingColumnError(error),
    ...context,
  });
}

export function getUserFacingLoadError(
  scope: keyof typeof USER_LOAD_ERROR,
  error: unknown,
): string {
  if (isMissingColumnError(error)) {
    return USER_LOAD_ERROR[scope];
  }

  return USER_LOAD_ERROR[scope];
}
