import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateCollectorMatchScore,
  type MatchScoreResult,
} from "@/lib/match-score";
import {
  loadMatchScoreBatchContext,
} from "@/lib/match-score-loader";
import {
  canViewProfileSection,
  isOwnProfile,
  type ProfileVisibilityContext,
} from "@/lib/profile-privacy";
import type { PublicUserProfile } from "@/lib/users";

export type ProfileTab =
  | "overview"
  | "collection"
  | "wishlist"
  | "listings"
  | "events"
  | "about";

const VALID_TABS: ProfileTab[] = [
  "overview",
  "collection",
  "wishlist",
  "listings",
  "events",
  "about",
];

export type ProfileUser = PublicUserProfile & {
  is_vendor?: boolean;
  vendor_stand_number?: string | null;
};

export type ProfileStats = {
  collectionCount: number | null;
  wishlistCount: number | null;
  listingsCount: number;
  completedTradesCount: number;
  eventsAttendedCount: number;
};

export type ProfileCollectionItem = {
  id: string;
  item_kind: "card" | "sealed";
  card_name: string;
  card_ref: string;
  set_name: string | null;
  condition: string | null;
  quantity: number;
  tcg_api_card_id: string | null;
  card_number: string | null;
  set_id: string | null;
  image_url: string | null;
  sealed_product_type: string | null;
  language: string | null;
  created_at: string;
  hasTradeListing: boolean;
};

export type ProfileWishlistItem = {
  id: string;
  card_name: string;
  card_ref: string;
  set_name: string | null;
  tcg_api_card_id: string | null;
  card_number: string | null;
  priority: number;
  created_at: string;
};

export type ProfileListingItem = {
  id: string;
  card_name: string;
  type: "want" | "trade" | "sale";
  status: "active" | "reserved" | "completed" | "removed";
  set_name: string | null;
  condition: string | null;
  tcg_api_card_id: string | null;
  card_number: string | null;
  collection_item_id: string | null;
  event_id: string;
  created_at: string;
  eventName: string | null;
};

export type ProfileEventActivity = {
  eventId: string;
  eventName: string;
  location: string;
  startDate: string;
  isAttending: boolean;
  isCurrentlyAtEvent: boolean;
};

export type ProfileCollectionFilters = {
  q?: string;
  kind?: "all" | "card" | "sealed";
  sort?: "newest" | "oldest" | "alphabetical" | "recently_added" | "quantity";
  page?: number;
};

export type ProfilePageData = {
  user: ProfileUser;
  visibility: ProfileVisibilityContext;
  isOwnProfile: boolean;
  stats: ProfileStats;
  featuredCollection: ProfileCollectionItem[];
  recentListings: ProfileListingItem[];
  wishlistHighlights: ProfileWishlistItem[];
  recentEvents: ProfileEventActivity[];
  collectionItems: ProfileCollectionItem[];
  collectionTotal: number;
  collectionPage: number;
  collectionPageSize: number;
  wishlistItems: ProfileWishlistItem[];
  listingItems: ProfileListingItem[];
  eventActivities: ProfileEventActivity[];
  matchScore: MatchScoreResult | null;
  matchEventId: string | null;
};

export const PROFILE_COLLECTION_PAGE_SIZE = 24;
export const FEATURED_COLLECTION_LIMIT = 8;
export const OVERVIEW_LISTINGS_LIMIT = 6;
export const OVERVIEW_WISHLIST_LIMIT = 6;
export const OVERVIEW_EVENTS_LIMIT = 6;

const COLLECTION_SELECT =
  "id, item_kind, card_name, card_ref, set_name, condition, quantity, tcg_api_card_id, card_number, set_id, image_url, sealed_product_type, language, created_at";

const WISHLIST_SELECT =
  "id, card_name, card_ref, set_name, tcg_api_card_id, card_number, priority, created_at";

const LISTING_SELECT = `
  id,
  card_name,
  type,
  status,
  set_name,
  condition,
  tcg_api_card_id,
  card_number,
  collection_item_id,
  event_id,
  created_at,
  events ( name )
`;

export function resolveProfileTab(
  tab?: string | null,
  view?: string | null,
): ProfileTab {
  const raw = tab ?? view ?? "overview";

  if (VALID_TABS.includes(raw as ProfileTab)) {
    return raw as ProfileTab;
  }

  return "overview";
}

function getEventName(events: { name: string } | { name: string }[] | null) {
  if (!events) {
    return null;
  }

  return Array.isArray(events) ? (events[0]?.name ?? null) : events.name;
}

type ListingRowRecord = {
  id: string;
  card_name: string;
  type: ProfileListingItem["type"];
  status: ProfileListingItem["status"];
  set_name: string | null;
  condition: string | null;
  tcg_api_card_id: string | null;
  card_number: string | null;
  collection_item_id: string | null;
  event_id: string;
  created_at: string;
  events: { name: string } | { name: string }[] | null;
};

function mapListingRow(row: ListingRowRecord): ProfileListingItem {
  return {
    id: row.id,
    card_name: row.card_name,
    type: row.type,
    status: row.status,
    set_name: row.set_name ?? null,
    condition: row.condition ?? null,
    tcg_api_card_id: row.tcg_api_card_id ?? null,
    card_number: row.card_number ?? null,
    collection_item_id: row.collection_item_id ?? null,
    event_id: row.event_id,
    created_at: row.created_at,
    eventName: getEventName(row.events),
  };
}

async function loadProfileUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, display_name, bio, location, favorite_pokemon, avatar_url, is_vendor, vendor_stand_number, created_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ProfileUser;
}

async function loadProfileStats(
  supabase: SupabaseClient,
  userId: string,
  visibility: ProfileVisibilityContext,
): Promise<ProfileStats> {
  const canCollection = canViewProfileSection("collection", visibility);
  const canWishlist = canViewProfileSection("wishlist", visibility);

  const [
    collectionResult,
    wishlistResult,
    listingsResult,
    completedResult,
    eventsResult,
  ] = await Promise.all([
    canCollection
      ? supabase
          .from("collection_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      : Promise.resolve({ count: null }),
    canWishlist
      ? supabase
          .from("wishlist_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      : Promise.resolve({ count: null }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("event_attendees")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_attending", true),
  ]);

  return {
    collectionCount: collectionResult.count,
    wishlistCount: wishlistResult.count,
    listingsCount: listingsResult.count ?? 0,
    completedTradesCount: completedResult.count ?? 0,
    eventsAttendedCount: eventsResult.count ?? 0,
  };
}

async function loadTradeListingCollectionIds(
  supabase: SupabaseClient,
  userId: string,
  collectionItemIds: string[],
): Promise<Set<string>> {
  if (collectionItemIds.length === 0) {
    return new Set();
  }

  const { data } = await supabase
    .from("listings")
    .select("collection_item_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .in("collection_item_id", collectionItemIds);

  return new Set(
    (data ?? [])
      .map((row) => row.collection_item_id)
      .filter(Boolean) as string[],
  );
}

function enrichCollectionItems(
  rows: Array<Record<string, unknown>>,
  tradeIds: Set<string>,
): ProfileCollectionItem[] {
  return rows.map((row) => ({
    id: row.id as string,
    item_kind: row.item_kind as ProfileCollectionItem["item_kind"],
    card_name: row.card_name as string,
    card_ref: row.card_ref as string,
    set_name: (row.set_name as string | null) ?? null,
    condition: (row.condition as string | null) ?? null,
    quantity: row.quantity as number,
    tcg_api_card_id: (row.tcg_api_card_id as string | null) ?? null,
    card_number: (row.card_number as string | null) ?? null,
    set_id: (row.set_id as string | null) ?? null,
    image_url: (row.image_url as string | null) ?? null,
    sealed_product_type: (row.sealed_product_type as string | null) ?? null,
    language: (row.language as string | null) ?? null,
    created_at: row.created_at as string,
    hasTradeListing: tradeIds.has(row.id as string),
  }));
}

async function loadCollectionItems(
  supabase: SupabaseClient,
  userId: string,
  options: ProfileCollectionFilters,
  visibility: ProfileVisibilityContext,
): Promise<{ items: ProfileCollectionItem[]; total: number }> {
  if (!canViewProfileSection("collection", visibility)) {
    return { items: [], total: 0 };
  }

  const page = Math.max(1, options.page ?? 1);
  const from = (page - 1) * PROFILE_COLLECTION_PAGE_SIZE;
  const to = from + PROFILE_COLLECTION_PAGE_SIZE - 1;

  let query = supabase
    .from("collection_items")
    .select(COLLECTION_SELECT, { count: "exact" })
    .eq("user_id", userId);

  if (options.kind === "card") {
    query = query.eq("item_kind", "card");
  } else if (options.kind === "sealed") {
    query = query.eq("item_kind", "sealed");
  }

  if (options.q?.trim()) {
    query = query.ilike("card_name", `%${options.q.trim()}%`);
  }

  switch (options.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "alphabetical":
      query = query.order("card_name", { ascending: true });
      break;
    case "quantity":
      query = query.order("quantity", { ascending: false });
      break;
    case "recently_added":
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return { items: [], total: 0 };
  }

  const rows = data ?? [];
  const tradeIds = await loadTradeListingCollectionIds(
    supabase,
    userId,
    rows.map((row) => row.id),
  );

  return {
    items: enrichCollectionItems(rows, tradeIds),
    total: count ?? 0,
  };
}

async function loadWishlistItems(
  supabase: SupabaseClient,
  userId: string,
  visibility: ProfileVisibilityContext,
  limit?: number,
): Promise<ProfileWishlistItem[]> {
  if (!canViewProfileSection("wishlist", visibility)) {
    return [];
  }

  let query = supabase
    .from("wishlist_items")
    .select(WISHLIST_SELECT)
    .eq("user_id", userId)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  return (data ?? []) as ProfileWishlistItem[];
}

async function loadListingItems(
  supabase: SupabaseClient,
  userId: string,
  options?: { limit?: number; activeOnly?: boolean },
): Promise<ProfileListingItem[]> {
  let query = supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.activeOnly) {
    query = query.eq("status", "active");
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data } = await query;
  return (data ?? []).map((row) => mapListingRow(row as ListingRowRecord));
}

async function loadEventActivities(
  supabase: SupabaseClient,
  userId: string,
  limit?: number,
): Promise<ProfileEventActivity[]> {
  let query = supabase
    .from("event_attendees")
    .select(
      "is_attending, is_currently_at_event, events ( id, name, location, start_date )",
    )
    .eq("user_id", userId)
    .eq("is_attending", true)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;

  return (data ?? [])
    .map((row) => {
      const event = Array.isArray(row.events) ? row.events[0] : row.events;
      if (!event) {
        return null;
      }

      return {
        eventId: event.id as string,
        eventName: event.name as string,
        location: event.location as string,
        startDate: event.start_date as string,
        isAttending: row.is_attending,
        isCurrentlyAtEvent: row.is_currently_at_event,
      };
    })
    .filter(Boolean) as ProfileEventActivity[];
}

async function resolveProfileEventId(
  supabase: SupabaseClient,
  viewerId: string,
  targetId: string,
  explicitEventId?: string | null,
): Promise<string | null> {
  if (explicitEventId) {
    return explicitEventId;
  }

  const { data: targetListings } = await supabase
    .from("listings")
    .select("event_id")
    .eq("user_id", targetId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  const eventIds = [
    ...new Set((targetListings ?? []).map((row) => row.event_id)),
  ];

  if (eventIds.length === 0) {
    return null;
  }

  const { data: sharedAttendance } = await supabase
    .from("event_attendees")
    .select("event_id")
    .eq("user_id", viewerId)
    .in("event_id", eventIds)
    .eq("is_attending", true)
    .limit(1);

  if (sharedAttendance?.[0]?.event_id) {
    return sharedAttendance[0].event_id;
  }

  const { data: viewerListings } = await supabase
    .from("listings")
    .select("event_id")
    .eq("user_id", viewerId)
    .in("event_id", eventIds)
    .eq("status", "active")
    .limit(1);

  return viewerListings?.[0]?.event_id ?? eventIds[0] ?? null;
}

async function loadProfileMatchScore(
  supabase: SupabaseClient,
  viewerId: string,
  targetId: string,
  eventId: string | null,
): Promise<MatchScoreResult | null> {
  if (!eventId || viewerId === targetId) {
    return null;
  }

  const context = await loadMatchScoreBatchContext(
    supabase,
    eventId,
    viewerId,
    [targetId],
  );

  return calculateCollectorMatchScore(context, targetId);
}

export async function loadProfilePageData(
  supabase: SupabaseClient,
  targetUserId: string,
  viewerUserId: string | null,
  options?: {
    eventId?: string | null;
    collectionFilters?: ProfileCollectionFilters;
    activeTab?: ProfileTab;
  },
): Promise<ProfilePageData | null> {
  const user = await loadProfileUser(supabase, targetUserId);

  if (!user) {
    return null;
  }

  const visibility: ProfileVisibilityContext = {
    viewerId: viewerUserId,
    ownerId: targetUserId,
  };
  const own = isOwnProfile(visibility);
  const activeTab = options?.activeTab ?? "overview";
  const collectionFilters = options?.collectionFilters ?? {};

  const stats = await loadProfileStats(supabase, targetUserId, visibility);

  const needsFullCollection = activeTab === "collection";
  const needsFeatured =
    activeTab === "overview" || activeTab === "collection";

  const [
    featuredResult,
    collectionResult,
    recentListings,
    wishlistHighlights,
    recentEvents,
    allWishlist,
    allListings,
    allEvents,
    matchEventId,
  ] = await Promise.all([
    needsFeatured
      ? loadCollectionItems(
          supabase,
          targetUserId,
          { sort: "newest", page: 1 },
          visibility,
        ).then((result) => result.items.slice(0, FEATURED_COLLECTION_LIMIT))
      : Promise.resolve([]),
    needsFullCollection
      ? loadCollectionItems(
          supabase,
          targetUserId,
          collectionFilters,
          visibility,
        )
      : Promise.resolve({ items: [], total: 0 }),
    loadListingItems(supabase, targetUserId, {
      limit: OVERVIEW_LISTINGS_LIMIT,
      activeOnly: true,
    }),
    loadWishlistItems(
      supabase,
      targetUserId,
      visibility,
      OVERVIEW_WISHLIST_LIMIT,
    ),
    loadEventActivities(supabase, targetUserId, OVERVIEW_EVENTS_LIMIT),
    activeTab === "wishlist"
      ? loadWishlistItems(supabase, targetUserId, visibility)
      : Promise.resolve([]),
    activeTab === "listings"
      ? loadListingItems(supabase, targetUserId, { activeOnly: true })
      : Promise.resolve([]),
    activeTab === "events"
      ? loadEventActivities(supabase, targetUserId)
      : Promise.resolve([]),
    own || !viewerUserId
      ? Promise.resolve(null)
      : resolveProfileEventId(
          supabase,
          viewerUserId,
          targetUserId,
          options?.eventId,
        ),
  ]);

  let matchScore: MatchScoreResult | null = null;

  if (viewerUserId && !own && matchEventId) {
    matchScore = await loadProfileMatchScore(
      supabase,
      viewerUserId,
      targetUserId,
      matchEventId,
    );
  }

  return {
    user,
    visibility,
    isOwnProfile: own,
    stats,
    featuredCollection: featuredResult,
    recentListings,
    wishlistHighlights,
    recentEvents,
    collectionItems: collectionResult.items,
    collectionTotal: collectionResult.total,
    collectionPage: collectionFilters.page ?? 1,
    collectionPageSize: PROFILE_COLLECTION_PAGE_SIZE,
    wishlistItems: allWishlist,
    listingItems: allListings,
    eventActivities: allEvents,
    matchScore,
    matchEventId,
  };
}
