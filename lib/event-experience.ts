import {
  findUserTradeMatches,
  getListingCardKey,
  type MatchListing,
  type MatchUser,
  type UserTradeMatch,
} from "@/lib/listing-matches";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EventRecord = {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  join_code: string | null;
  banner_url: string | null;
};

export type EventStats = {
  attendeeCount: number;
  listingCount: number;
  wishlistCount: number;
  currentlyAtEventCount: number;
  attendeeCountIsEstimated: boolean;
};

export type EventPresence = {
  isAttending: boolean;
  isCurrentlyAtEvent: boolean;
};

export type EventListingSummary = {
  id: string;
  card_name: string;
  type: "want" | "trade" | "sale";
  set_name: string | null;
  condition: string | null;
};

export type WishlistMatchSummary = {
  id: string;
  card_name: string;
  set_name: string | null;
  listing_id: string;
  owner_id: string;
  owner_label: string;
  listing_type: "trade" | "sale";
};

export type EventPersonalDashboard = {
  bringingListings: EventListingSummary[];
  wishlistMatches: WishlistMatchSummary[];
  traderMatches: UserTradeMatch[];
};

type ListingRow = MatchListing & {
  user_id: string;
  users?: MatchUser | MatchUser[] | null;
};

type WishlistRow = {
  card_name: string;
  card_ref: string;
  set_name: string | null;
  tcg_api_card_id: string | null;
};

function getEmbeddedUser(users: ListingRow["users"]): MatchUser | null {
  if (!users) {
    return null;
  }

  return Array.isArray(users) ? (users[0] ?? null) : users;
}

function getUserLabel(user: MatchUser | null) {
  if (!user) {
    return "Unknown collector";
  }

  return user.display_name?.trim() || user.email;
}

function listingsMatchWishlist(
  listing: MatchListing,
  wishlistItem: WishlistRow,
) {
  if (
    listing.tcg_api_card_id &&
    wishlistItem.tcg_api_card_id &&
    listing.tcg_api_card_id === wishlistItem.tcg_api_card_id
  ) {
    return true;
  }

  return listing.card_ref === wishlistItem.card_ref;
}

export async function loadEventStats(
  supabase: SupabaseClient,
  eventId: string,
): Promise<EventStats> {
  const [
    { count: attendingCount },
    { count: currentlyAtCount },
    { count: listingCount },
    { count: wishlistCount },
    { data: listingOwners },
  ] = await Promise.all([
    supabase
      .from("event_attendees")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("is_attending", true),
    supabase
      .from("event_attendees")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("is_currently_at_event", true),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "active"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "active")
      .eq("type", "want"),
    supabase
      .from("listings")
      .select("user_id")
      .eq("event_id", eventId)
      .eq("status", "active"),
  ]);

  const distinctListingOwners = new Set(
    (listingOwners ?? []).map((row) => row.user_id),
  ).size;

  const confirmedAttendees = attendingCount ?? 0;
  const useEstimate = confirmedAttendees === 0 && distinctListingOwners > 0;

  return {
    attendeeCount: useEstimate ? distinctListingOwners : confirmedAttendees,
    listingCount: listingCount ?? 0,
    wishlistCount: wishlistCount ?? 0,
    currentlyAtEventCount: currentlyAtCount ?? 0,
    attendeeCountIsEstimated: useEstimate,
  };
}

export async function loadEventPresence(
  supabase: SupabaseClient,
  eventId: string,
  userId: string,
): Promise<EventPresence> {
  const { data } = await supabase
    .from("event_attendees")
    .select("is_attending, is_currently_at_event")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  return {
    isAttending: data?.is_attending ?? false,
    isCurrentlyAtEvent: data?.is_currently_at_event ?? false,
  };
}

export async function loadEventPersonalDashboard(
  supabase: SupabaseClient,
  eventId: string,
  userId: string,
  eventName: string,
): Promise<EventPersonalDashboard> {
  const [
    { data: bringingRows },
    { data: wishlistRows },
    { data: eventListings },
    { data: userListings },
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id, card_name, type, set_name, condition")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("status", "active")
      .in("type", ["sale", "trade"])
      .order("created_at", { ascending: false }),
    supabase
      .from("wishlist_items")
      .select("card_name, card_ref, set_name, tcg_api_card_id")
      .eq("user_id", userId),
    supabase
      .from("listings")
      .select(
        "id, event_id, user_id, type, card_name, card_ref, card_number, language, tcg_api_card_id, set_name, users(display_name, email)",
      )
      .eq("event_id", eventId)
      .eq("status", "active"),
    supabase
      .from("listings")
      .select(
        "id, event_id, user_id, type, card_name, card_ref, card_number, language, tcg_api_card_id, set_name",
      )
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  const bringingListings = (bringingRows ?? []) as EventListingSummary[];
  const wishlistItems = (wishlistRows ?? []) as WishlistRow[];
  const listingsAtEvent = (eventListings ?? []) as ListingRow[];
  const myActiveListings = (userListings ?? []) as MatchListing[];

  const wishlistMatches: WishlistMatchSummary[] = [];

  for (const wishlistItem of wishlistItems) {
    for (const listing of listingsAtEvent) {
      if (
        listing.user_id === userId ||
        (listing.type !== "sale" && listing.type !== "trade")
      ) {
        continue;
      }

      if (!listingsMatchWishlist(listing, wishlistItem)) {
        continue;
      }

      wishlistMatches.push({
        id: getListingCardKey(listing),
        card_name: wishlistItem.card_name,
        set_name: wishlistItem.set_name,
        listing_id: listing.id,
        owner_id: listing.user_id,
        owner_label: getUserLabel(getEmbeddedUser(listing.users)),
        listing_type: listing.type,
      });
      break;
    }
  }

  const otherListings = listingsAtEvent
    .filter((listing) => listing.user_id !== userId)
    .map((listing) => ({
      ...listing,
      user: getEmbeddedUser(listing.users),
    }));

  const traderMatches = findUserTradeMatches(
    myActiveListings,
    otherListings,
    new Map([[eventId, eventName]]),
  )
    .filter((match) => match.eventId === eventId)
    .slice(0, 5);

  return {
    bringingListings,
    wishlistMatches: wishlistMatches.slice(0, 8),
    traderMatches,
  };
}

export type ListingOwnerVendor = {
  id: string;
  display_name: string | null;
  email: string;
  is_vendor: boolean;
  vendor_stand_number: string | null;
};

export function getListingOwnerVendor(
  users: ListingOwnerVendor | ListingOwnerVendor[] | null,
): ListingOwnerVendor | null {
  if (!users) {
    return null;
  }

  return Array.isArray(users) ? (users[0] ?? null) : users;
}
