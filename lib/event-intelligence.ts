import {
  getListingOwnerVendor,
  rankEventSocialRecommendations,
  type EventCollectorProfile,
  type EventPersonalDashboard,
  type EventPresence,
  type EventStats,
  type EventVendorProfile,
  type EventViewerWishlistItem,
  type ListingOwnerVendor,
} from "@/lib/event-experience";
import {
  cardsShareIdentity,
  getEventCardIdentityKey,
  isExactTcgIdentityMatch,
} from "@/lib/event-card-identity";
import {
  buildIntelLogContext,
  logEventIntelligencePhase,
  serializeIntelError,
} from "@/lib/event-intelligence-log";
import { shouldEmphasizeCheckIn, type EventTimingState } from "@/lib/event-timing";
import {
  getTopMatchReasons,
  type MatchScoreItem,
} from "@/lib/match-score";

export const WISHLIST_OPPORTUNITIES_LIMIT = 8;
export const PEOPLE_TO_MEET_LIMIT = 6;
export const RELEVANT_VENDORS_LIMIT = 6;
export const OFFERABLE_ITEMS_LIMIT = 6;
export const RECENT_LISTINGS_LIMIT = 8;
export const NEXT_ACTIONS_LIMIT = 3;

export type EventListingIntelRow = {
  id: string;
  user_id: string;
  type: "want" | "trade" | "sale";
  card_name: string;
  card_ref: string | null;
  set_name: string | null;
  condition: string | null;
  tcg_api_card_id: string | null;
  card_number: string | null;
  collection_item_id: string | null;
  created_at: string;
  users: ListingOwnerVendor | ListingOwnerVendor[] | null;
};

export type WishlistOpportunity = {
  listingId: string;
  cardName: string;
  setName: string | null;
  listingType: "trade" | "sale";
  condition: string | null;
  tcgApiCardId: string | null;
  collectionItemId: string | null;
  ownerId: string;
  ownerLabel: string;
  isVendor: boolean;
  standNumber: string | null;
  isOwnerCheckedIn: boolean;
  createdAt: string;
  exactMatch: boolean;
  sellerMatchScore: number;
};

export type RelevantVendor = {
  vendor: EventVendorProfile;
  wishlistMatchCount: number;
  topItems: string[];
  matchScore: number | null;
  matchLabel: string | null;
  isMutual: boolean;
  isCheckedIn: boolean;
  reasons: string[];
};

export type OfferableItem = {
  cardKey: string;
  cardName: string;
  setName: string | null;
  tcgApiCardId: string | null;
  source: "listing" | "collection";
  interestedCollectorCount: number;
  interestedCollectorLabel: string;
  topCollectorId: string | null;
  topCollectorName: string | null;
  showTopCollector: boolean;
  topMatchScore: number;
  hasActiveListing: boolean;
};

export type RecentEventListing = {
  listingId: string;
  cardName: string;
  setName: string | null;
  listingType: "want" | "trade" | "sale";
  tcgApiCardId: string | null;
  collectionItemId: string | null;
  ownerId: string;
  ownerLabel: string;
  isVendor: boolean;
  standNumber: string | null;
  createdAt: string;
  isWishlistMatch: boolean;
};

export type EventMomentum = {
  attendeeCount: number;
  checkedInCount: number;
  activeListingCount: number;
  vendorCount: number;
  wishlistMatchCount: number;
  recentListingCount: number;
  attendeeCountIsEstimated: boolean;
};

export type NextBestAction = {
  id: string;
  message: string;
  href: string;
};

export type EventIntelligence = {
  isPersonalized: boolean;
  wishlistOpportunities: WishlistOpportunity[];
  peopleToMeet: EventCollectorProfile[];
  relevantVendors: RelevantVendor[];
  itemsYouCanOffer: OfferableItem[];
  recentEventListings: RecentEventListing[];
  eventMomentum: EventMomentum;
  nextBestActions: NextBestAction[];
  eventTimingState: EventTimingState;
  highlightedPeopleIds: string[];
  highlightedVendorIds: string[];
};

export type BuildEventIntelligenceInput = {
  eventId: string;
  viewerUserId: string | null;
  stats: EventStats;
  presence: EventPresence | null;
  personalDashboard: EventPersonalDashboard | null;
  attendees: EventCollectorProfile[];
  vendors: EventVendorProfile[];
  eventListings: EventListingIntelRow[];
  eventTimingState: EventTimingState;
};

export function bucketInterestedCollectorCount(count: number): string {
  if (count <= 0) {
    return "";
  }

  if (count === 1) {
    return "Another collector may be interested";
  }

  if (count <= 3) {
    return "A few collectors may be interested";
  }

  return "Several collectors may be interested";
}

function listingMatchesWishlist(
  listing: EventListingIntelRow,
  wishlistItem: EventViewerWishlistItem,
) {
  return cardsShareIdentity(listing, wishlistItem);
}

function getOwnerLabel(listing: EventListingIntelRow) {
  const owner = getListingOwnerVendor(listing.users);
  if (!owner) {
    return "Unknown seller";
  }

  return owner.display_name?.trim() || owner.email;
}

function buildAttendeeMap(attendees: EventCollectorProfile[]) {
  return new Map(attendees.map((profile) => [profile.userId, profile]));
}

export function buildWishlistOpportunities(
  viewerUserId: string,
  viewerWishlist: EventViewerWishlistItem[],
  eventListings: EventListingIntelRow[],
  attendeeByUserId: Map<string, EventCollectorProfile>,
): WishlistOpportunity[] {
  if (viewerWishlist.length === 0) {
    return [];
  }

  const opportunities: WishlistOpportunity[] = [];
  const seenListingIds = new Set<string>();

  for (const listing of eventListings) {
    if (
      listing.user_id === viewerUserId ||
      (listing.type !== "sale" && listing.type !== "trade")
    ) {
      continue;
    }

    if (seenListingIds.has(listing.id)) {
      continue;
    }

    const matchedWishlist = viewerWishlist.find((item) =>
      listingMatchesWishlist(listing, item),
    );

    if (!matchedWishlist) {
      continue;
    }

    const owner = getListingOwnerVendor(listing.users);
    const attendee = attendeeByUserId.get(listing.user_id);
    const exactMatch = isExactTcgIdentityMatch(listing, matchedWishlist);
    const sellerMatchScore = attendee?.matchScoreResult?.score ?? 0;

    opportunities.push({
      listingId: listing.id,
      cardName: matchedWishlist.card_name,
      setName: matchedWishlist.set_name ?? listing.set_name,
      listingType: listing.type,
      condition: listing.condition,
      tcgApiCardId: listing.tcg_api_card_id,
      collectionItemId: listing.collection_item_id,
      ownerId: listing.user_id,
      ownerLabel: getOwnerLabel(listing),
      isVendor: owner?.is_vendor ?? false,
      standNumber: owner?.vendor_stand_number ?? null,
      isOwnerCheckedIn: attendee?.isCurrentlyAtEvent ?? false,
      createdAt: listing.created_at,
      exactMatch,
      sellerMatchScore,
    });

    seenListingIds.add(listing.id);
  }

  opportunities.sort((a, b) => {
    if (a.exactMatch !== b.exactMatch) {
      return a.exactMatch ? -1 : 1;
    }

    if (a.isOwnerCheckedIn !== b.isOwnerCheckedIn) {
      return a.isOwnerCheckedIn ? -1 : 1;
    }

    if (a.sellerMatchScore !== b.sellerMatchScore) {
      return b.sellerMatchScore - a.sellerMatchScore;
    }

    if (a.isVendor !== b.isVendor) {
      return a.isVendor ? -1 : 1;
    }

    const created = b.createdAt.localeCompare(a.createdAt);
    if (created !== 0) {
      return created;
    }

    return a.listingId.localeCompare(b.listingId);
  });

  return opportunities.slice(0, WISHLIST_OPPORTUNITIES_LIMIT);
}

export function buildVendorRecommendationReasons(entry: {
  wishlistMatchCount: number;
  matchScore: number | null;
  isMutual: boolean;
  isCheckedIn: boolean;
  standNumber: string | null;
}): string[] {
  const reasons: string[] = [];

  if (entry.wishlistMatchCount > 0) {
    reasons.push(
      `${entry.wishlistMatchCount} card${entry.wishlistMatchCount === 1 ? "" : "s"} from your wishlist`,
    );
  }

  if (entry.matchScore !== null && entry.matchScore >= 55) {
    reasons.push("Strong collector match");
  } else if (entry.isMutual) {
    reasons.push("Mutual match potential");
  }

  if (entry.isCheckedIn && entry.standNumber) {
    reasons.push(`Checked in at stand ${entry.standNumber}`);
  } else if (entry.isCheckedIn) {
    reasons.push("Checked in now");
  } else if (entry.standNumber) {
    reasons.push(`Stand ${entry.standNumber}`);
  }

  return reasons.slice(0, 3);
}

export function buildRelevantVendors(
  vendors: EventVendorProfile[],
  attendees: EventCollectorProfile[],
  wishlistOpportunities: WishlistOpportunity[],
  viewerUserId: string,
): RelevantVendor[] {
  const attendeeByUserId = buildAttendeeMap(attendees);
  const wishlistMatchesByVendor = new Map<string, string[]>();

  for (const opportunity of wishlistOpportunities) {
    if (!opportunity.isVendor) {
      continue;
    }

    const items = wishlistMatchesByVendor.get(opportunity.ownerId) ?? [];
    if (!items.includes(opportunity.cardName)) {
      items.push(opportunity.cardName);
    }

    wishlistMatchesByVendor.set(opportunity.ownerId, items);
  }

  const ranked = vendors
    .filter((vendor) => vendor.userId !== viewerUserId)
    .map((vendor) => {
      const attendee = attendeeByUserId.get(vendor.userId);
      const match = attendee?.matchScoreResult;
      const topItems = (wishlistMatchesByVendor.get(vendor.userId) ?? []).slice(
        0,
        3,
      );

      const rankScore =
        topItems.length * 10_000 +
        (match?.score ?? 0) +
        (match?.isMutual ? 50 : 0) +
        (attendee?.isCurrentlyAtEvent ? 20 : 0);

      const reasons = buildVendorRecommendationReasons({
        wishlistMatchCount: topItems.length,
        matchScore: match?.score ?? null,
        isMutual: match?.isMutual ?? false,
        isCheckedIn: attendee?.isCurrentlyAtEvent ?? false,
        standNumber: vendor.standNumber,
      });

      return {
        vendor,
        wishlistMatchCount: topItems.length,
        topItems,
        matchScore: match?.score ?? null,
        matchLabel: match?.label ?? null,
        isMutual: match?.isMutual ?? false,
        isCheckedIn: attendee?.isCurrentlyAtEvent ?? false,
        reasons,
        rankScore,
      };
    })
    .filter(
      (entry) =>
        entry.wishlistMatchCount > 0 || (entry.matchScore ?? 0) >= 40,
    )
    .sort(
      (a, b) =>
        b.rankScore - a.rankScore ||
        a.vendor.userId.localeCompare(b.vendor.userId),
    )
    .slice(0, RELEVANT_VENDORS_LIMIT);

  return ranked.map(({ rankScore: _rankScore, ...entry }) => entry);
}

function aggregateOfferableItems(
  attendees: EventCollectorProfile[],
  viewerUserId: string,
  eventListings: EventListingIntelRow[],
): OfferableItem[] {
  const grouped = new Map<
    string,
    {
      item: MatchScoreItem;
      collectors: Array<{
        userId: string;
        name: string;
        score: number;
      }>;
    }
  >();

  for (const attendee of attendees) {
    if (attendee.userId === viewerUserId || !attendee.matchScoreResult) {
      continue;
    }

    for (const item of attendee.matchScoreResult.youHaveForThem) {
      const group = grouped.get(item.cardKey) ?? {
        item,
        collectors: [],
      };

      if (group.collectors.some((collector) => collector.userId === attendee.userId)) {
        continue;
      }

      group.collectors.push({
        userId: attendee.userId,
        name: attendee.displayName,
        score: attendee.matchScoreResult.score,
      });

      grouped.set(item.cardKey, group);
    }
  }

  const viewerListingKeys = new Set(
    eventListings
      .filter(
        (listing) =>
          listing.user_id === viewerUserId &&
          (listing.type === "sale" || listing.type === "trade"),
      )
      .map((listing) => getEventCardIdentityKey(listing))
      .filter((key): key is string => Boolean(key)),
  );

  return [...grouped.values()]
    .map(({ item, collectors }) => {
      collectors.sort((a, b) => b.score - a.score);
      const top = collectors[0];

      return {
        cardKey: item.cardKey,
        cardName: item.cardName,
        setName: item.setName,
        tcgApiCardId: item.tcgApiCardId,
        source: item.source === "listing" ? "listing" : "collection",
        interestedCollectorCount: collectors.length,
        interestedCollectorLabel: bucketInterestedCollectorCount(collectors.length),
        topCollectorId: top?.userId ?? null,
        topCollectorName: top?.name ?? null,
        showTopCollector: collectors.length >= 2,
        topMatchScore: top?.score ?? 0,
        hasActiveListing: viewerListingKeys.has(item.cardKey),
      } satisfies OfferableItem;
    })
    .sort(
      (a, b) =>
        b.interestedCollectorCount - a.interestedCollectorCount ||
        b.topMatchScore - a.topMatchScore,
    )
    .slice(0, OFFERABLE_ITEMS_LIMIT);
}

function buildRecentListings(
  eventListings: EventListingIntelRow[],
  excludedListingIds: Set<string>,
  wishlistListingIds: Set<string>,
): RecentEventListing[] {
  return [...eventListings]
    .filter((listing) => !excludedListingIds.has(listing.id))
    .sort(
      (a, b) =>
        b.created_at.localeCompare(a.created_at) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, RECENT_LISTINGS_LIMIT)
    .map((listing) => {
      const owner = getListingOwnerVendor(listing.users);

      return {
        listingId: listing.id,
        cardName: listing.card_name,
        setName: listing.set_name,
        listingType: listing.type,
        tcgApiCardId: listing.tcg_api_card_id,
        collectionItemId: listing.collection_item_id,
        ownerId: listing.user_id,
        ownerLabel: getOwnerLabel(listing),
        isVendor: owner?.is_vendor ?? false,
        standNumber: owner?.vendor_stand_number ?? null,
        createdAt: listing.created_at,
        isWishlistMatch: wishlistListingIds.has(listing.id),
      };
    });
}

function countRecentListings(eventListings: EventListingIntelRow[], hours = 24) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;

  return eventListings.filter((listing) => {
    const created = Date.parse(listing.created_at);
    return !Number.isNaN(created) && created >= cutoff;
  }).length;
}

export function dedupeNextBestActions(
  actions: Array<NextBestAction & { priority: number }>,
): NextBestAction[] {
  const seenHrefs = new Set<string>();
  const result: NextBestAction[] = [];

  for (const action of actions.sort((a, b) => b.priority - a.priority)) {
    if (seenHrefs.has(action.href)) {
      continue;
    }

    seenHrefs.add(action.href);
    const { priority: _priority, ...nextAction } = action;
    result.push(nextAction);

    if (result.length >= NEXT_ACTIONS_LIMIT) {
      break;
    }
  }

  return result;
}

export function buildNextBestActions(input: {
  eventId: string;
  presence: EventPresence | null;
  eventTimingState: EventTimingState;
  wishlistOpportunityCount: number;
  offerableItemCount: number;
  peopleToMeet: EventCollectorProfile[];
  viewerWishlistCount: number;
  hasListings: boolean;
}): NextBestAction[] {
  const actions: Array<NextBestAction & { priority: number }> = [];

  if (input.wishlistOpportunityCount > 0) {
    actions.push({
      id: "wishlist-matches",
      message: `${input.wishlistOpportunityCount} wishlist card${input.wishlistOpportunityCount === 1 ? "" : "s"} ${input.wishlistOpportunityCount === 1 ? "is" : "are"} available — view matches`,
      href: `#event-wishlist-opportunities`,
      priority: 100,
    });
  }

  if (input.offerableItemCount > 0) {
    actions.push({
      id: "offer-cards",
      message: `You have ${input.offerableItemCount} card${input.offerableItemCount === 1 ? "" : "s"} other attendees want — review offers`,
      href: `#event-items-you-can-offer`,
      priority: 90,
    });
  }

  const topCheckedIn = input.peopleToMeet.find(
    (person) =>
      person.isCurrentlyAtEvent &&
      person.matchScoreResult &&
      person.matchScoreResult.score >= 55,
  );

  if (topCheckedIn) {
    actions.push({
      id: "strong-match-chat",
      message: `Your strongest checked-in match is ${topCheckedIn.displayName} — start chat`,
      href: `/messages?with=${topCheckedIn.userId}`,
      priority: 85,
    });
  }

  if (
    shouldEmphasizeCheckIn(input.eventTimingState) &&
    input.presence?.isAttending &&
    !input.presence.isCurrentlyAtEvent
  ) {
    actions.push({
      id: "check-in",
      message: "You are attending but not checked in — check in now",
      href: `#event-presence`,
      priority: 80,
    });
  }

  if (input.viewerWishlistCount === 0) {
    actions.push({
      id: "add-wishlist",
      message: "Add items to your wishlist to improve event recommendations",
      href: "/my-wishlist",
      priority: 40,
    });
  } else if (!input.hasListings) {
    actions.push({
      id: "create-listing",
      message: "Create listings so other collectors know what you are offering",
      href: `/events/${input.eventId}/new-listing`,
      priority: 50,
    });
  }

  return dedupeNextBestActions(actions);
}

export function buildEventIntelligence(
  input: BuildEventIntelligenceInput,
): EventIntelligence {
  const started = Date.now();
  const attendeeByUserId = buildAttendeeMap(input.attendees);
  const isPersonalized = Boolean(input.viewerUserId);

  let wishlistOpportunities: WishlistOpportunity[] = [];
  let peopleToMeet: EventCollectorProfile[] = [];
  let relevantVendors: RelevantVendor[] = [];
  let itemsYouCanOffer: OfferableItem[] = [];

  if (input.viewerUserId && input.personalDashboard) {
    wishlistOpportunities = buildWishlistOpportunities(
      input.viewerUserId,
      input.personalDashboard.viewerWishlist,
      input.eventListings,
      attendeeByUserId,
    );

    peopleToMeet = rankEventSocialRecommendations(
      input.attendees,
      input.viewerUserId,
      input.eventId,
      PEOPLE_TO_MEET_LIMIT,
    ).filter((profile) => profile.matchScoreResult);

    relevantVendors = buildRelevantVendors(
      input.vendors,
      input.attendees,
      wishlistOpportunities,
      input.viewerUserId,
    );

    itemsYouCanOffer = aggregateOfferableItems(
      input.attendees,
      input.viewerUserId,
      input.eventListings,
    );
  }

  const wishlistListingIds = new Set(
    wishlistOpportunities.map((item) => item.listingId),
  );

  const recentEventListings = buildRecentListings(
    input.eventListings,
    wishlistListingIds,
    wishlistListingIds,
  );

  const eventMomentum: EventMomentum = {
    attendeeCount: input.stats.attendeeCount,
    checkedInCount: input.stats.currentlyAtEventCount,
    activeListingCount: input.stats.listingCount,
    vendorCount: input.stats.vendorCount,
    wishlistMatchCount: wishlistOpportunities.length,
    recentListingCount: countRecentListings(input.eventListings),
    attendeeCountIsEstimated: input.stats.attendeeCountIsEstimated,
  };

  const nextBestActions = isPersonalized
    ? buildNextBestActions({
        eventId: input.eventId,
        presence: input.presence,
        eventTimingState: input.eventTimingState,
        wishlistOpportunityCount: wishlistOpportunities.length,
        offerableItemCount: itemsYouCanOffer.length,
        peopleToMeet,
        viewerWishlistCount:
          input.personalDashboard?.viewerWishlist.length ?? 0,
        hasListings: (input.personalDashboard?.bringingListings.length ?? 0) > 0,
      })
    : [];

  const durationMs = Date.now() - started;

  logEventIntelligencePhase(
    "build",
    "success",
    buildIntelLogContext({
      eventId: input.eventId,
      viewerUserId: input.viewerUserId,
      phase: "build",
      durationMs,
      inputRows: {
        listings: input.eventListings.length,
        attendees: input.attendees.length,
        vendors: input.vendors.length,
      },
      sectionCounts: {
        wishlistOpportunities: wishlistOpportunities.length,
        peopleToMeet: peopleToMeet.length,
        relevantVendors: relevantVendors.length,
        itemsYouCanOffer: itemsYouCanOffer.length,
        recentEventListings: recentEventListings.length,
        nextBestActions: nextBestActions.length,
      },
    }),
  );

  return {
    isPersonalized,
    wishlistOpportunities,
    peopleToMeet,
    relevantVendors,
    itemsYouCanOffer,
    recentEventListings,
    eventMomentum,
    nextBestActions,
    eventTimingState: input.eventTimingState,
    highlightedPeopleIds: peopleToMeet.map((person) => person.userId),
    highlightedVendorIds: relevantVendors.map((entry) => entry.vendor.userId),
  };
}

export function buildEventIntelligenceSafe(
  input: BuildEventIntelligenceInput,
): EventIntelligence {
  try {
    return buildEventIntelligence(input);
  } catch (error) {
    const serialized = serializeIntelError(error);

    logEventIntelligencePhase(
      "build",
      "failure",
      buildIntelLogContext({
        eventId: input.eventId,
        viewerUserId: input.viewerUserId,
        phase: "build",
        durationMs: 0,
        failureCategory: serialized.failureCategory,
        supabaseCode: serialized.supabaseCode,
      }),
    );

    return {
      isPersonalized: Boolean(input.viewerUserId),
      wishlistOpportunities: [],
      peopleToMeet: [],
      relevantVendors: [],
      itemsYouCanOffer: [],
      recentEventListings: buildRecentListings(
        input.eventListings,
        new Set(),
        new Set(),
      ),
      eventMomentum: {
        attendeeCount: input.stats.attendeeCount,
        checkedInCount: input.stats.currentlyAtEventCount,
        activeListingCount: input.stats.listingCount,
        vendorCount: input.stats.vendorCount,
        wishlistMatchCount: 0,
        recentListingCount: countRecentListings(input.eventListings),
        attendeeCountIsEstimated: input.stats.attendeeCountIsEstimated,
      },
      nextBestActions: [],
      eventTimingState: input.eventTimingState,
      highlightedPeopleIds: [],
      highlightedVendorIds: [],
    };
  }
}

export { getTopMatchReasons };
