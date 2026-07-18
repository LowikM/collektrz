/**
 * Internal analytics extension points for Fast Add.
 * No external provider is wired — safe to call from client/server.
 */

export type FastAddAnalyticsEvent =
  | "fast_add_started"
  | "search_used"
  | "photo_uploaded"
  | "recognition_succeeded"
  | "recognition_failed"
  | "recognition_diagnostic"
  | "candidate_changed"
  | "card_confirmed"
  | "collection_item_added";

export function trackFastAddEvent(
  event: FastAddAnalyticsEvent,
  payload?: Record<string, string | number | boolean | null | undefined>,
) {
  if (process.env.NODE_ENV === "development") {
    console.info("[fast-add]", event, payload ?? {});
  }
}
