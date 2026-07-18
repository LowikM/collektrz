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
  vendorCount: number;
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
    { data: vendorRows },
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
    supabase
      .from("listings")
      .select("user_id, users!inner(is_vendor)")
      .eq("event_id", eventId)
      .eq("status", "active")
      .eq("users.is_vendor", true),
  ]);

  const distinctListingOwners = new Set(
    (listingOwners ?? []).map((row) => row.user_id),
  ).size;

  const distinctVendors = new Set(
    (vendorRows ?? []).map((row) => row.user_id),
  ).size;

  const confirmedAttendees = attendingCount ?? 0;
  const useEstimate = confirmedAttendees === 0 && distinctListingOwners > 0;

  return {
    attendeeCount: useEstimate ? distinctListingOwners : confirmedAttendees,
    listingCount: listingCount ?? 0,
    wishlistCount: wishlistCount ?? 0,
    vendorCount: distinctVendors,
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

export type EventCollectorProfile = {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  isVendor: boolean;
  vendorStandNumber: string | null;
  isCurrentlyAtEvent: boolean;
  listingCount: number;
  wishlistCount: number;
  /** 0–100 when computed for a viewer; null otherwise. Ready for Match Score v2. */
  matchScore: number | null;
  /** Simple reason string for social recommendations. */
  matchReason: string | null;
  /** Placeholder for future collector levels. */
  collectorLevel: string | null;
};

export type EventVendorProfile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  standNumber: string | null;
  listingCount: number;
  description: string | null;
};

type AttendeeUserRow = {
  id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  is_vendor: boolean;
  vendor_stand_number: string | null;
};

type AttendeeRow = {
  is_currently_at_event: boolean;
  users: AttendeeUserRow | AttendeeUserRow[] | null;
};

function getAttendeeUser(users: AttendeeRow["users"]): AttendeeUserRow | null {
  if (!users) {
    return null;
  }

  return Array.isArray(users) ? (users[0] ?? null) : users;
}

async function loadUserListingCountsAtEvent(
  supabase: SupabaseClient,
  eventId: string,
  userIds: string[],
) {
  const counts = new Map<string, number>();

  if (userIds.length === 0) {
    return counts;
  }

  const { data } = await supabase
    .from("listings")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("status", "active")
    .in("user_id", userIds);

  for (const row of data ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  return counts;
}

async function loadUserWishlistCounts(
  supabase: SupabaseClient,
  userIds: string[],
) {
  const counts = new Map<string, number>();

  if (userIds.length === 0) {
    return counts;
  }

  const { data } = await supabase
    .from("wishlist_items")
    .select("user_id")
    .in("user_id", userIds);

  for (const row of data ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  return counts;
}

function buildCollectorProfile(
  user: AttendeeUserRow,
  options: {
    isCurrentlyAtEvent: boolean;
    listingCount: number;
    wishlistCount: number;
    matchScore?: number | null;
    matchReason?: string | null;
  },
): EventCollectorProfile {
  return {
    userId: user.id,
    displayName: user.display_name?.trim() || user.email,
    email: user.email,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    isVendor: user.is_vendor,
    vendorStandNumber: user.vendor_stand_number,
    isCurrentlyAtEvent: options.isCurrentlyAtEvent,
    listingCount: options.listingCount,
    wishlistCount: options.wishlistCount,
    matchScore: options.matchScore ?? null,
    matchReason: options.matchReason ?? null,
    collectorLevel: null,
  };
}

export async function loadEventAttendees(
  supabase: SupabaseClient,
  eventId: string,
  viewerUserId?: string | null,
): Promise<EventCollectorProfile[]> {
  const { data: attendeeRows } = await supabase
    .from("event_attendees")
    .select(
      "is_currently_at_event, users(id, display_name, email, avatar_url, bio, is_vendor, vendor_stand_number)",
    )
    .eq("event_id", eventId)
    .eq("is_attending", true);

  const attendees: Array<{
    user: AttendeeUserRow;
    isCurrentlyAtEvent: boolean;
  }> = [];

  for (const row of (attendeeRows ?? []) as AttendeeRow[]) {
    const user = getAttendeeUser(row.users);
    if (!user) {
      continue;
    }

    attendees.push({
      user,
      isCurrentlyAtEvent: row.is_currently_at_event,
    });
  }

  const userIds = attendees.map((entry) => entry.user.id);
  const [listingCounts, wishlistCounts] = await Promise.all([
    loadUserListingCountsAtEvent(supabase, eventId, userIds),
    loadUserWishlistCounts(supabase, userIds),
  ]);

  let viewerWishlist: WishlistRow[] = [];
  let eventListings: ListingRow[] = [];

  if (viewerUserId) {
    const [{ data: wishlistRows }, { data: listingsRows }] = await Promise.all([
      supabase
        .from("wishlist_items")
        .select("card_name, card_ref, set_name, tcg_api_card_id")
        .eq("user_id", viewerUserId),
      supabase
        .from("listings")
        .select(
          "id, event_id, user_id, type, card_name, card_ref, card_number, language, tcg_api_card_id, set_name",
        )
        .eq("event_id", eventId)
        .eq("status", "active"),
    ]);

    viewerWishlist = (wishlistRows ?? []) as WishlistRow[];
    eventListings = (listingsRows ?? []) as ListingRow[];
  }

  const profiles = attendees.map(({ user, isCurrentlyAtEvent }) => {
    let matchScore: number | null = null;
    let matchReason: string | null = null;

    if (viewerUserId && viewerUserId !== user.id && viewerWishlist.length > 0) {
      const theirListings = eventListings.filter(
        (listing) =>
          listing.user_id === user.id &&
          (listing.type === "sale" || listing.type === "trade"),
      );

      let sharedMatches = 0;
      for (const wishlistItem of viewerWishlist) {
        if (theirListings.some((listing) => listingsMatchWishlist(listing, wishlistItem))) {
          sharedMatches += 1;
        }
      }

      if (sharedMatches > 0) {
        matchScore = Math.min(100, sharedMatches * 20);
        matchReason = `${sharedMatches} shared interest${sharedMatches === 1 ? "" : "s"}`;
      }
    }

    return buildCollectorProfile(user, {
      isCurrentlyAtEvent,
      listingCount: listingCounts.get(user.id) ?? 0,
      wishlistCount: wishlistCounts.get(user.id) ?? 0,
      matchScore,
      matchReason,
    });
  });

  profiles.sort((a, b) => {
    if (a.isCurrentlyAtEvent !== b.isCurrentlyAtEvent) {
      return a.isCurrentlyAtEvent ? -1 : 1;
    }

    return b.listingCount - a.listingCount;
  });

  return profiles;
}

export async function loadEventVendors(
  supabase: SupabaseClient,
  eventId: string,
): Promise<EventVendorProfile[]> {
  const { data: listingRows } = await supabase
    .from("listings")
    .select(
      "user_id, users!inner(id, display_name, email, avatar_url, bio, is_vendor, vendor_stand_number)",
    )
    .eq("event_id", eventId)
    .eq("status", "active")
    .eq("users.is_vendor", true);

  const vendorMap = new Map<
    string,
    {
      user: AttendeeUserRow;
      listingCount: number;
    }
  >();

  for (const row of listingRows ?? []) {
    const user = getAttendeeUser(
      (row as { users: AttendeeUserRow | AttendeeUserRow[] }).users,
    );
    if (!user) {
      continue;
    }

    const existing = vendorMap.get(user.id);
    if (existing) {
      existing.listingCount += 1;
      continue;
    }

    vendorMap.set(user.id, { user, listingCount: 1 });
  }

  const { data: vendorAttendees } = await supabase
    .from("event_attendees")
    .select(
      "users!inner(id, display_name, email, avatar_url, bio, is_vendor, vendor_stand_number)",
    )
    .eq("event_id", eventId)
    .eq("is_attending", true);

  for (const row of (vendorAttendees ?? []) as Array<{ users: AttendeeRow["users"] }>) {
    const user = getAttendeeUser(row.users);
    if (!user?.is_vendor || vendorMap.has(user.id)) {
      continue;
    }

    vendorMap.set(user.id, { user, listingCount: 0 });
  }

  const listingCounts = await loadUserListingCountsAtEvent(
    supabase,
    eventId,
    [...vendorMap.keys()],
  );

  return [...vendorMap.values()]
    .map(({ user }) => ({
      userId: user.id,
      displayName: user.display_name?.trim() || user.email,
      avatarUrl: user.avatar_url,
      standNumber: user.vendor_stand_number,
      listingCount: listingCounts.get(user.id) ?? 0,
      description: user.bio,
    }))
    .sort((a, b) => {
      const standA = a.standNumber ?? "";
      const standB = b.standNumber ?? "";
      if (standA && standB) {
        return standA.localeCompare(standB, undefined, { numeric: true });
      }

      return b.listingCount - a.listingCount;
    });
}

export async function loadEventSocialRecommendations(
  supabase: SupabaseClient,
  eventId: string,
  viewerUserId: string,
  limit = 6,
): Promise<EventCollectorProfile[]> {
  const attendees = await loadEventAttendees(supabase, eventId, viewerUserId);

  const scored = attendees
    .filter((profile) => profile.userId !== viewerUserId)
    .map((profile) => {
      const interestScore = profile.matchScore ?? 0;
      const activityScore = profile.listingCount * 2 + Math.min(profile.wishlistCount, 5);
      const totalScore = interestScore * 3 + activityScore;

      let matchReason = profile.matchReason;
      if (!matchReason && profile.listingCount > 0) {
        matchReason = `${profile.listingCount} active listing${profile.listingCount === 1 ? "" : "s"}`;
      } else if (!matchReason && profile.wishlistCount > 0) {
        matchReason = `${profile.wishlistCount} wishlist item${profile.wishlistCount === 1 ? "" : "s"}`;
      }

      return {
        ...profile,
        matchReason,
        _score: totalScore,
      };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);

  return scored.map(({ _score: _, ...profile }) => profile);
}

export async function loadEventVendorDetail(
  supabase: SupabaseClient,
  eventId: string,
  vendorUserId: string,
) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select(
      "id, display_name, email, avatar_url, bio, location, favorite_pokemon, is_vendor, vendor_stand_number, created_at",
    )
    .eq("id", vendorUserId)
    .maybeSingle();

  if (userError || !user || !user.is_vendor) {
    return null;
  }

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, event_id, user_id, type, card_name, trade_for, status, condition, set_name, notes, language, tcg_api_card_id, card_number, set_id, collection_item_id, created_at, updated_at",
    )
    .eq("event_id", eventId)
    .eq("user_id", vendorUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const activeListings = listings ?? [];
  const saleTradeListings = activeListings.filter(
    (listing) => listing.type === "sale" || listing.type === "trade",
  );
  const wantListings = activeListings.filter((listing) => listing.type === "want");

  return {
    user,
    saleTradeListings,
    wantListings,
    listingCount: activeListings.length,
  };
}
