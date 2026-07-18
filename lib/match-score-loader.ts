import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateCollectorMatchScore,
  type MatchScoreAttendance,
  type MatchScoreBatchContext,
  type MatchScoreCollectionItem,
  type MatchScoreListing,
  type MatchScoreWishlistItem,
} from "@/lib/match-score";

const LISTING_SELECT = `
  id,
  user_id,
  type,
  card_name,
  card_ref,
  card_number,
  set_name,
  tcg_api_card_id
`;

const WISHLIST_SELECT = `
  card_name,
  card_ref,
  card_number,
  set_name,
  tcg_api_card_id,
  user_id
`;

const COLLECTION_SELECT = `
  card_name,
  card_ref,
  card_number,
  set_name,
  tcg_api_card_id,
  item_kind
`;

function groupByUserId<T extends { user_id: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const row of rows) {
    const group = map.get(row.user_id) ?? [];
    group.push(row);
    map.set(row.user_id, group);
  }

  return map;
}

function groupWishlistsByUserId(
  rows: Array<MatchScoreWishlistItem & { user_id: string }>,
): Map<string, MatchScoreWishlistItem[]> {
  const map = new Map<string, MatchScoreWishlistItem[]>();

  for (const { user_id, ...item } of rows) {
    const group = map.get(user_id) ?? [];
    group.push(item);
    map.set(user_id, group);
  }

  return map;
}

/**
 * Batch-loads all data needed to score viewer ↔ collector matches at an event.
 * Avoids N+1 queries: fixed query count regardless of attendee count.
 *
 * Scaling note: practical for hundreds of attendees per event. Very large
 * events (1000+ users) may need pagination or precomputed scores later.
 */
export async function loadMatchScoreBatchContext(
  supabase: SupabaseClient,
  eventId: string,
  viewerUserId: string,
  otherUserIds: string[] = [],
): Promise<MatchScoreBatchContext> {
  const uniqueOtherIds = [...new Set(otherUserIds.filter(Boolean))];
  const allUserIds = [...new Set([viewerUserId, ...uniqueOtherIds])];

  const [
    { data: viewerWishlistRows },
    { data: viewerListingRows },
    { data: viewerCollectionRows },
    { data: eventListingRows },
    { data: wishlistRows },
    { data: attendanceRows },
  ] = await Promise.all([
    supabase
      .from("wishlist_items")
      .select("card_name, card_ref, card_number, set_name, tcg_api_card_id")
      .eq("user_id", viewerUserId),
    supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("event_id", eventId)
      .eq("user_id", viewerUserId)
      .eq("status", "active"),
    supabase
      .from("collection_items")
      .select(COLLECTION_SELECT)
      .eq("user_id", viewerUserId)
      .eq("item_kind", "card"),
    supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("event_id", eventId)
      .eq("status", "active"),
    allUserIds.length > 0
      ? supabase
          .from("wishlist_items")
          .select(WISHLIST_SELECT)
          .in("user_id", allUserIds)
      : Promise.resolve({ data: [] as Array<MatchScoreWishlistItem & { user_id: string }> }),
    allUserIds.length > 0
      ? supabase
          .from("event_attendees")
          .select("user_id, is_attending, is_currently_at_event")
          .eq("event_id", eventId)
          .in("user_id", allUserIds)
      : Promise.resolve({
          data: [] as Array<{
            user_id: string;
            is_attending: boolean;
            is_currently_at_event: boolean;
          }>,
        }),
  ]);

  const listingsByUser = groupByUserId(
    (eventListingRows ?? []) as MatchScoreListing[],
  );

  const wishlistsByUser = groupWishlistsByUserId(
    (wishlistRows ?? []) as Array<MatchScoreWishlistItem & { user_id: string }>,
  );

  const attendanceByUser = new Map<string, MatchScoreAttendance>();

  for (const row of attendanceRows ?? []) {
    attendanceByUser.set(row.user_id, {
      isAttending: row.is_attending,
      isCheckedIn: row.is_currently_at_event,
    });
  }

  const defaultAttendance: MatchScoreAttendance = {
    isAttending: false,
    isCheckedIn: false,
  };

  return {
    eventId,
    viewerUserId,
    viewerWishlist: (viewerWishlistRows ?? []) as MatchScoreWishlistItem[],
    viewerListings: (viewerListingRows ?? []) as MatchScoreListing[],
    viewerCollection: (viewerCollectionRows ?? []) as MatchScoreCollectionItem[],
    viewerAttendance: attendanceByUser.get(viewerUserId) ?? defaultAttendance,
    listingsByUser,
    wishlistsByUser,
    attendanceByUser,
  };
}

/**
 * Scores multiple collectors in memory from one batch context.
 */
export function scoreCollectorsAtEvent(
  context: MatchScoreBatchContext,
  otherUserIds: string[],
) {
  return otherUserIds
    .filter((id) => id !== context.viewerUserId)
    .map((otherUserId) => ({
      otherUserId,
      result: calculateCollectorMatchScore(context, otherUserId),
    }));
}
