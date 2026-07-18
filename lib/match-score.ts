/**
 * Match Score privacy (Profile Privacy v1):
 *
 * - Other collectors' private collection/wishlist rows are never loaded
 *   (enforced by Supabase RLS). Match scoring only sees public wishlist items
 *   for other users, plus public event listings.
 * - The viewer's own collection is used for "you have for them" matches and
 *   is only rendered back to that same viewer.
 * - Match reasons never claim ownership from hidden inventory (e.g. no
 *   "They own X" copy). Listing-based overlaps remain explicit.
 * - Private inventory does not affect scores shown to other collectors.
 */

export type MatchScoreItem = {
  cardKey: string;
  cardName: string;
  setName: string | null;
  tcgApiCardId: string | null;
  cardNumber: string | null;
  source: "listing" | "wishlist" | "collection";
};

export type MatchScoreBreakdown = {
  theyHaveForYou: number;
  youHaveForThem: number;
  sharedInterests: number;
  eventRelevance: number;
  activity: number;
};

export type MatchScoreEventSignals = {
  eventId: string;
  bothAttending: boolean;
  bothCheckedIn: boolean;
  otherIsAttending: boolean;
  otherIsCheckedIn: boolean;
};

export type MatchScoreConfidence = "high" | "medium" | "low" | "insufficient";

export type MatchScoreResult = {
  score: number;
  label: string;
  isMutual: boolean;
  confidence: MatchScoreConfidence;
  reasons: string[];
  theyHaveForYou: MatchScoreItem[];
  youHaveForThem: MatchScoreItem[];
  sharedInterests: string[];
  eventSignals: MatchScoreEventSignals;
  breakdown: MatchScoreBreakdown;
  lowDataMessage: string | null;
};

export type MatchScoreCardRef = {
  card_name: string;
  card_ref: string;
  set_name: string | null;
  tcg_api_card_id: string | null;
  card_number?: string | null;
};

export type MatchScoreListing = MatchScoreCardRef & {
  id: string;
  user_id: string;
  type: "want" | "trade" | "sale";
};

export type MatchScoreWishlistItem = MatchScoreCardRef;

export type MatchScoreCollectionItem = MatchScoreCardRef & {
  item_kind: "card" | "sealed";
};

export type MatchScoreAttendance = {
  isAttending: boolean;
  isCheckedIn: boolean;
};

export type MatchScoreBatchContext = {
  eventId: string;
  viewerUserId: string;
  viewerWishlist: MatchScoreWishlistItem[];
  viewerListings: MatchScoreListing[];
  viewerCollection: MatchScoreCollectionItem[];
  viewerAttendance: MatchScoreAttendance;
  listingsByUser: Map<string, MatchScoreListing[]>;
  wishlistsByUser: Map<string, MatchScoreWishlistItem[]>;
  attendanceByUser: Map<string, MatchScoreAttendance>;
};

export const MATCH_SCORE_CAPS = {
  theyHaveForYou: 40,
  youHaveForThem: 35,
  sharedInterests: 10,
  eventRelevance: 10,
  activity: 5,
  total: 100,
} as const;

/** Points awarded by unique card-match count (index = count, capped at 4+). */
export const THEY_HAVE_TIER_POINTS = [0, 18, 28, 36, 40] as const;
export const YOU_HAVE_TIER_POINTS = [0, 16, 24, 31, 35] as const;

const PREVIEW_ITEM_LIMIT = 4;

export function getCardKey(
  tcgApiCardId: string | null | undefined,
  cardRef: string,
): string {
  if (tcgApiCardId) {
    return `tcg:${tcgApiCardId}`;
  }

  return `ref:${cardRef}`;
}

export function cardsMatch(
  a: MatchScoreCardRef,
  b: MatchScoreCardRef,
): boolean {
  if (a.tcg_api_card_id && b.tcg_api_card_id) {
    return a.tcg_api_card_id === b.tcg_api_card_id;
  }

  return a.card_ref === b.card_ref;
}

export function capScoreComponent(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function tierPointsForCount(
  count: number,
  tiers: readonly number[],
): number {
  if (count <= 0) {
    return 0;
  }

  return tiers[Math.min(count, tiers.length - 1)] ?? 0;
}

export function getMatchScoreLabel(score: number): string {
  if (score >= 90) {
    return "Exceptional match";
  }

  if (score >= 75) {
    return "Excellent match";
  }

  if (score >= 55) {
    return "Good match";
  }

  if (score >= 30) {
    return "Possible match";
  }

  if (score >= 1) {
    return "Limited match";
  }

  return "No clear match yet";
}

function isOfferListing(type: MatchScoreListing["type"]) {
  return type === "sale" || type === "trade";
}

function isWantListing(type: MatchScoreListing["type"]) {
  return type === "want";
}

function toMatchItem(
  source: MatchScoreItem["source"],
  card: MatchScoreCardRef,
): MatchScoreItem {
  return {
    cardKey: getCardKey(card.tcg_api_card_id, card.card_ref),
    cardName: card.card_name,
    setName: card.set_name,
    tcgApiCardId: card.tcg_api_card_id,
    cardNumber: card.card_number ?? null,
    source,
  };
}

function addUniqueItem(map: Map<string, MatchScoreItem>, item: MatchScoreItem) {
  if (!map.has(item.cardKey)) {
    map.set(item.cardKey, item);
  }
}

function findTheyHaveForYou(
  context: MatchScoreBatchContext,
  otherUserId: string,
): Map<string, MatchScoreItem> {
  const matches = new Map<string, MatchScoreItem>();
  const otherListings = context.listingsByUser.get(otherUserId) ?? [];
  const theirOffers = otherListings.filter((listing) => isOfferListing(listing.type));

  const viewerWants: MatchScoreCardRef[] = [
    ...context.viewerWishlist,
    ...context.viewerListings.filter((listing) => isWantListing(listing.type)),
  ];

  for (const want of viewerWants) {
    for (const offer of theirOffers) {
      if (cardsMatch(want, offer)) {
        addUniqueItem(matches, toMatchItem("listing", offer));
      }
    }
  }

  return matches;
}

function findYouHaveForThem(
  context: MatchScoreBatchContext,
  otherUserId: string,
): Map<string, MatchScoreItem> {
  const matches = new Map<string, MatchScoreItem>();
  const otherWishlist = context.wishlistsByUser.get(otherUserId) ?? [];
  const otherListings = context.listingsByUser.get(otherUserId) ?? [];
  const theirWants: MatchScoreCardRef[] = [
    ...otherWishlist,
    ...otherListings.filter((listing) => isWantListing(listing.type)),
  ];

  const viewerOffers: Array<{ source: MatchScoreItem["source"]; card: MatchScoreCardRef }> = [
    ...context.viewerListings
      .filter((listing) => isOfferListing(listing.type))
      .map((listing) => ({ source: "listing" as const, card: listing })),
    ...context.viewerCollection
      .filter((item) => item.item_kind === "card")
      .map((item) => ({ source: "collection" as const, card: item })),
  ];

  for (const want of theirWants) {
    for (const offer of viewerOffers) {
      if (cardsMatch(want, offer.card)) {
        addUniqueItem(matches, toMatchItem(offer.source, offer.card));
      }
    }
  }

  return matches;
}

function findSharedInterests(
  context: MatchScoreBatchContext,
  otherUserId: string,
): string[] {
  const viewerSets = new Set<string>();
  const otherSets = new Set<string>();

  for (const item of context.viewerWishlist) {
    if (item.set_name) {
      viewerSets.add(item.set_name);
    }
  }

  for (const listing of context.viewerListings) {
    if (listing.set_name) {
      viewerSets.add(listing.set_name);
    }
  }

  const otherWishlist = context.wishlistsByUser.get(otherUserId) ?? [];
  const otherListings = context.listingsByUser.get(otherUserId) ?? [];

  for (const item of otherWishlist) {
    if (item.set_name) {
      otherSets.add(item.set_name);
    }
  }

  for (const listing of otherListings) {
    if (listing.set_name) {
      otherSets.add(listing.set_name);
    }
  }

  return [...viewerSets].filter((setName) => otherSets.has(setName)).sort();
}

function scoreSharedInterests(sharedSets: string[]): number {
  if (sharedSets.length === 0) {
    return 0;
  }

  return capScoreComponent(sharedSets.length * 3, MATCH_SCORE_CAPS.sharedInterests);
}

function scoreEventRelevance(
  context: MatchScoreBatchContext,
  otherUserId: string,
): { points: number; signals: MatchScoreEventSignals } {
  const otherAttendance =
    context.attendanceByUser.get(otherUserId) ?? {
      isAttending: false,
      isCheckedIn: false,
    };

  const signals: MatchScoreEventSignals = {
    eventId: context.eventId,
    bothAttending:
      context.viewerAttendance.isAttending && otherAttendance.isAttending,
    bothCheckedIn:
      context.viewerAttendance.isCheckedIn && otherAttendance.isCheckedIn,
    otherIsAttending: otherAttendance.isAttending,
    otherIsCheckedIn: otherAttendance.isCheckedIn,
  };

  let points = 0;

  if (signals.bothAttending) {
    points += 5;
  } else if (otherAttendance.isAttending) {
    points += 3;
  }

  if (signals.bothCheckedIn) {
    points += 5;
  }

  return {
    points: capScoreComponent(points, MATCH_SCORE_CAPS.eventRelevance),
    signals,
  };
}

function scoreActivity(
  context: MatchScoreBatchContext,
  otherUserId: string,
  hasCardOverlap: boolean,
): number {
  let points = 0;

  const viewerHasData =
    context.viewerWishlist.length > 0 ||
    context.viewerListings.length > 0 ||
    context.viewerCollection.length > 0;

  const otherWishlist = context.wishlistsByUser.get(otherUserId) ?? [];
  const otherListings = context.listingsByUser.get(otherUserId) ?? [];
  const otherHasData = otherWishlist.length > 0 || otherListings.length > 0;

  if (viewerHasData) {
    points += 2;
  }

  if (otherHasData) {
    points += 2;
  }

  if (hasCardOverlap) {
    points += 1;
  }

  return capScoreComponent(points, MATCH_SCORE_CAPS.activity);
}

function determineConfidence(
  context: MatchScoreBatchContext,
  otherUserId: string,
  theyHaveCount: number,
  youHaveCount: number,
  sharedCount: number,
  rawScore: number,
): MatchScoreConfidence {
  const viewerHasData =
    context.viewerWishlist.length > 0 ||
    context.viewerListings.length > 0 ||
    context.viewerCollection.length > 0;

  const otherWishlist = context.wishlistsByUser.get(otherUserId) ?? [];
  const otherListings = context.listingsByUser.get(otherUserId) ?? [];
  const otherHasData = otherWishlist.length > 0 || otherListings.length > 0;

  if (!viewerHasData) {
    return "insufficient";
  }

  if (theyHaveCount === 0 && youHaveCount === 0 && sharedCount === 0) {
    if (!otherHasData && rawScore <= MATCH_SCORE_CAPS.eventRelevance) {
      return "insufficient";
    }

    return rawScore > 0 ? "low" : "insufficient";
  }

  if (theyHaveCount > 0 && youHaveCount > 0) {
    return "high";
  }

  if (theyHaveCount + youHaveCount >= 2) {
    return "high";
  }

  return "medium";
}

function buildLowDataMessage(
  confidence: MatchScoreConfidence,
  context: MatchScoreBatchContext,
): string | null {
  if (confidence !== "insufficient") {
    return null;
  }

  const viewerHasWishlist = context.viewerWishlist.length > 0;
  const viewerHasListings = context.viewerListings.length > 0;

  if (!viewerHasWishlist && !viewerHasListings) {
    return "Add items to your wishlist or create listings to improve recommendations.";
  }

  return "Not enough overlap yet to calculate a meaningful match score.";
}

function buildReasons(
  theyHave: MatchScoreItem[],
  youHave: MatchScoreItem[],
  sharedSets: string[],
  signals: MatchScoreEventSignals,
  isMutual: boolean,
): string[] {
  const reasons: string[] = [];

  if (theyHave.length > 0) {
    reasons.push(
      `They listed ${theyHave.length} card${theyHave.length === 1 ? "" : "s"} from your wishlist.`,
    );
  }

  if (youHave.length > 0) {
    reasons.push(
      `You listed ${youHave.length} card${youHave.length === 1 ? "" : "s"} they are looking for.`,
    );
  }

  if (isMutual) {
    reasons.push("This is a two-way trade opportunity.");
  }

  for (const setName of sharedSets.slice(0, 2)) {
    reasons.push(`You both collect ${setName}.`);
  }

  if (signals.bothCheckedIn) {
    reasons.push("You are both checked in at this event.");
  } else if (signals.bothAttending) {
    reasons.push("You are both attending this event.");
  }

  return reasons.slice(0, 5);
}

export function calculateCollectorMatchScore(
  context: MatchScoreBatchContext,
  otherUserId: string,
): MatchScoreResult {
  if (otherUserId === context.viewerUserId) {
    return emptyMatchScore(context.eventId);
  }

  const theyHaveMap = findTheyHaveForYou(context, otherUserId);
  const youHaveMap = findYouHaveForThem(context, otherUserId);
  const theyHaveForYou = [...theyHaveMap.values()].sort((a, b) =>
    a.cardName.localeCompare(b.cardName),
  );
  const youHaveForThem = [...youHaveMap.values()].sort((a, b) =>
    a.cardName.localeCompare(b.cardName),
  );
  const sharedInterests = findSharedInterests(context, otherUserId);

  const breakdown: MatchScoreBreakdown = {
    theyHaveForYou: tierPointsForCount(
      theyHaveForYou.length,
      THEY_HAVE_TIER_POINTS,
    ),
    youHaveForThem: tierPointsForCount(
      youHaveForThem.length,
      YOU_HAVE_TIER_POINTS,
    ),
    sharedInterests: scoreSharedInterests(sharedInterests),
    eventRelevance: 0,
    activity: 0,
  };

  const { points: eventPoints, signals } = scoreEventRelevance(
    context,
    otherUserId,
  );
  breakdown.eventRelevance = eventPoints;

  const hasCardOverlap = theyHaveForYou.length > 0 || youHaveForThem.length > 0;
  breakdown.activity = scoreActivity(context, otherUserId, hasCardOverlap);

  const rawScore =
    breakdown.theyHaveForYou +
    breakdown.youHaveForThem +
    breakdown.sharedInterests +
    breakdown.eventRelevance +
    breakdown.activity;

  const isMutual = theyHaveForYou.length > 0 && youHaveForThem.length > 0;
  const confidence = determineConfidence(
    context,
    otherUserId,
    theyHaveForYou.length,
    youHaveForThem.length,
    sharedInterests.length,
    rawScore,
  );

  let score = capScoreComponent(rawScore, MATCH_SCORE_CAPS.total);

  if (
    confidence === "insufficient" &&
    theyHaveForYou.length === 0 &&
    youHaveForThem.length === 0
  ) {
    score = 0;
  }

  const label = getMatchScoreLabel(score);
  const reasons = buildReasons(
    theyHaveForYou,
    youHaveForThem,
    sharedInterests,
    signals,
    isMutual,
  );

  return {
    score,
    label,
    isMutual,
    confidence,
    reasons,
    theyHaveForYou,
    youHaveForThem,
    sharedInterests,
    eventSignals: signals,
    breakdown,
    lowDataMessage: buildLowDataMessage(confidence, context),
  };
}

export function emptyMatchScore(eventId: string): MatchScoreResult {
  return {
    score: 0,
    label: "No clear match yet",
    isMutual: false,
    confidence: "insufficient",
    reasons: [],
    theyHaveForYou: [],
    youHaveForThem: [],
    sharedInterests: [],
    eventSignals: {
      eventId,
      bothAttending: false,
      bothCheckedIn: false,
      otherIsAttending: false,
      otherIsCheckedIn: false,
    },
    breakdown: {
      theyHaveForYou: 0,
      youHaveForThem: 0,
      sharedInterests: 0,
      eventRelevance: 0,
      activity: 0,
    },
    lowDataMessage: null,
  };
}

export function previewMatchItems(items: MatchScoreItem[], limit = PREVIEW_ITEM_LIMIT) {
  return {
    preview: items.slice(0, limit),
    remaining: Math.max(0, items.length - limit),
  };
}

export function getTopMatchReasons(result: MatchScoreResult, limit = 2): string[] {
  return result.reasons.slice(0, limit);
}

export function collectTcgApiCardIdsFromResults(
  results: Array<MatchScoreResult | null | undefined>,
): string[] {
  const ids = new Set<string>();

  for (const result of results) {
    if (!result) {
      continue;
    }

    for (const item of [...result.theyHaveForYou, ...result.youHaveForThem]) {
      if (item.tcgApiCardId) {
        ids.add(item.tcgApiCardId);
      }
    }
  }

  return [...ids];
}

/**
 * Sort key for recommendations: primary = score, secondary = check-in tie-break.
 */
export function compareMatchScores(
  a: MatchScoreResult,
  b: MatchScoreResult,
  aCheckedIn = false,
  bCheckedIn = false,
): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  if (Number(b.isMutual) !== Number(a.isMutual)) {
    return Number(b.isMutual) - Number(a.isMutual);
  }

  if (aCheckedIn !== bCheckedIn) {
    return aCheckedIn ? -1 : 1;
  }

  const aOverlap = a.theyHaveForYou.length + a.youHaveForThem.length;
  const bOverlap = b.theyHaveForYou.length + b.youHaveForThem.length;

  return bOverlap - aOverlap;
}

export function buildMatchScoreFromTradeMatch(
  match: {
    eventId: string;
    theyHaveForMe: Array<{
      cardKey: string;
      cardName: string;
      setName: string | null;
      tcgApiCardId: string | null;
      cardNumber: string | null;
    }>;
    iHaveForThem: Array<{
      cardKey: string;
      cardName: string;
      setName: string | null;
      tcgApiCardId: string | null;
      cardNumber: string | null;
    }>;
  },
): MatchScoreResult {
  const theyHaveForYou: MatchScoreItem[] = match.theyHaveForMe.map((card) => ({
    cardKey: card.cardKey,
    cardName: card.cardName,
    setName: card.setName,
    tcgApiCardId: card.tcgApiCardId,
    cardNumber: card.cardNumber,
    source: "listing" as const,
  }));

  const youHaveForThem: MatchScoreItem[] = match.iHaveForThem.map((card) => ({
    cardKey: card.cardKey,
    cardName: card.cardName,
    setName: card.setName,
    tcgApiCardId: card.tcgApiCardId,
    cardNumber: card.cardNumber,
    source: "listing" as const,
  }));

  const sharedSetNames = [
    ...new Set(
      theyHaveForYou
        .map((item) => item.setName)
        .filter((setName): setName is string => Boolean(setName)),
    ),
  ].filter((setName) =>
    youHaveForThem.some((item) => item.setName === setName),
  );

  const breakdown: MatchScoreBreakdown = {
    theyHaveForYou: tierPointsForCount(
      theyHaveForYou.length,
      THEY_HAVE_TIER_POINTS,
    ),
    youHaveForThem: tierPointsForCount(
      youHaveForThem.length,
      YOU_HAVE_TIER_POINTS,
    ),
    sharedInterests: scoreSharedInterests(sharedSetNames),
    eventRelevance: 5,
    activity: theyHaveForYou.length > 0 || youHaveForThem.length > 0 ? 3 : 0,
  };

  const isMutual = theyHaveForYou.length > 0 && youHaveForThem.length > 0;
  const score = capScoreComponent(
    breakdown.theyHaveForYou +
      breakdown.youHaveForThem +
      breakdown.sharedInterests +
      breakdown.eventRelevance +
      breakdown.activity,
    MATCH_SCORE_CAPS.total,
  );

  const signals: MatchScoreEventSignals = {
    eventId: match.eventId,
    bothAttending: true,
    bothCheckedIn: false,
    otherIsAttending: true,
    otherIsCheckedIn: false,
  };

  return {
    score,
    label: getMatchScoreLabel(score),
    isMutual,
    confidence:
      theyHaveForYou.length > 0 && youHaveForThem.length > 0
        ? "high"
        : theyHaveForYou.length + youHaveForThem.length >= 2
          ? "high"
          : "medium",
    reasons: buildReasons(
      theyHaveForYou,
      youHaveForThem,
      sharedSetNames,
      signals,
      isMutual,
    ),
    theyHaveForYou,
    youHaveForThem,
    sharedInterests: sharedSetNames,
    eventSignals: signals,
    breakdown,
    lowDataMessage: null,
  };
}

