import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  bucketInterestedCollectorCount,
  buildNextBestActions,
  buildRelevantVendors,
  buildVendorRecommendationReasons,
  buildWishlistOpportunities,
  dedupeNextBestActions,
  type EventListingIntelRow,
} from "./event-intelligence.ts";
import { getEventTimingState, shouldEmphasizeCheckIn } from "./event-timing.ts";

function makeListing(
  overrides: Partial<EventListingIntelRow> & { id: string; user_id: string },
): EventListingIntelRow {
  return {
    type: "sale",
    card_name: "Pikachu",
    card_ref: "set-a:pikachu",
    set_name: "Base Set",
    condition: "Near Mint",
    tcg_api_card_id: "base1-58",
    card_number: "58",
    collection_item_id: null,
    created_at: "2026-07-01T10:00:00.000Z",
    users: null,
    ...overrides,
  };
}

describe("wishlist opportunities", () => {
  const wishlist = [
    {
      card_name: "Pikachu",
      card_ref: "set-a:pikachu",
      set_name: "Base Set",
      tcg_api_card_id: "base1-58",
    },
  ];

  it("excludes viewer own listings", () => {
    const listings = [
      makeListing({ id: "l1", user_id: "viewer", type: "sale" }),
    ];

    const result = buildWishlistOpportunities(
      "viewer",
      wishlist,
      listings,
      new Map(),
    );

    assert.equal(result.length, 0);
  });

  it("deduplicates by listing id", () => {
    const listings = [
      makeListing({ id: "l1", user_id: "seller", type: "sale" }),
    ];

    const result = buildWishlistOpportunities(
      "viewer",
      wishlist,
      [...listings, ...listings],
      new Map(),
    );

    assert.equal(result.length, 1);
  });

  it("ranks exact matches above checked-in non-exact sellers", () => {
    const listings = [
      makeListing({
        id: "exact-not-checked-in",
        user_id: "seller-a",
        tcg_api_card_id: "base1-58",
        created_at: "2026-07-01T09:00:00.000Z",
      }),
      makeListing({
        id: "fallback-checked-in",
        user_id: "seller-b",
        tcg_api_card_id: null,
        card_ref: "set-a:pikachu",
        created_at: "2026-07-01T12:00:00.000Z",
      }),
    ];

    const attendees = new Map([
      [
        "seller-b",
        {
          userId: "seller-b",
          displayName: "Seller B",
          isCurrentlyAtEvent: true,
          matchScoreResult: { score: 90 } as never,
        } as never,
      ],
    ]);

    const result = buildWishlistOpportunities(
      "viewer",
      wishlist,
      listings,
      attendees,
    );

    assert.equal(result[0]?.listingId, "exact-not-checked-in");
    assert.equal(result[0]?.exactMatch, true);
  });

  it("uses seller match score when check-in status is equal", () => {
    const listings = [
      makeListing({
        id: "low-match",
        user_id: "seller-a",
        created_at: "2026-07-02T10:00:00.000Z",
      }),
      makeListing({
        id: "high-match",
        user_id: "seller-b",
        created_at: "2026-07-01T10:00:00.000Z",
      }),
    ];

    const attendees = new Map([
      [
        "seller-a",
        {
          userId: "seller-a",
          isCurrentlyAtEvent: false,
          matchScoreResult: { score: 10 } as never,
        } as never,
      ],
      [
        "seller-b",
        {
          userId: "seller-b",
          isCurrentlyAtEvent: false,
          matchScoreResult: { score: 80 } as never,
        } as never,
      ],
    ]);

    const result = buildWishlistOpportunities(
      "viewer",
      wishlist,
      listings,
      attendees,
    );

    assert.equal(result[0]?.listingId, "high-match");
  });
});

describe("vendor ranking", () => {
  it("does not include checked-in vendors without meaningful matches", () => {
    const vendors = [
      {
        userId: "vendor-1",
        displayName: "Checked In Vendor",
        avatarUrl: null,
        standNumber: "B12",
        listingCount: 50,
        description: null,
      },
    ];

    const attendees = [
      {
        userId: "vendor-1",
        displayName: "Checked In Vendor",
        isCurrentlyAtEvent: true,
        matchScoreResult: { score: 10, label: "Low", isMutual: false } as never,
      } as never,
    ];

    const result = buildRelevantVendors(vendors, attendees, [], "viewer");

    assert.equal(result.length, 0);
  });

  it("prioritizes wishlist matches over check-in alone", () => {
    const vendors = [
      {
        userId: "vendor-wishlist",
        displayName: "Wishlist Vendor",
        avatarUrl: null,
        standNumber: "A1",
        listingCount: 2,
        description: null,
      },
      {
        userId: "vendor-checked-in",
        displayName: "Checked In Vendor",
        avatarUrl: null,
        standNumber: "B1",
        listingCount: 100,
        description: null,
      },
    ];

    const opportunities = [
      {
        listingId: "l1",
        cardName: "Pikachu",
        setName: "Base Set",
        listingType: "sale" as const,
        condition: null,
        tcgApiCardId: "base1-58",
        collectionItemId: null,
        ownerId: "vendor-wishlist",
        ownerLabel: "Wishlist Vendor",
        isVendor: true,
        standNumber: "A1",
        isOwnerCheckedIn: false,
        createdAt: "2026-07-01T10:00:00.000Z",
        exactMatch: true,
        sellerMatchScore: 0,
      },
    ];

    const attendees = [
      {
        userId: "vendor-checked-in",
        displayName: "Checked In Vendor",
        isCurrentlyAtEvent: true,
        matchScoreResult: { score: 60, label: "Good", isMutual: false } as never,
      } as never,
    ];

    const result = buildRelevantVendors(
      vendors,
      attendees,
      opportunities,
      "viewer",
    );

    assert.equal(result[0]?.vendor.userId, "vendor-wishlist");
  });

  it("builds supported recommendation reasons only", () => {
    const reasons = buildVendorRecommendationReasons({
      wishlistMatchCount: 3,
      matchScore: 70,
      isMutual: true,
      isCheckedIn: true,
      standNumber: "B12",
    });

    assert.match(reasons[0] ?? "", /3 cards from your wishlist/);
    assert.ok(reasons.some((reason) => reason.includes("Strong collector match")));
    assert.ok(reasons.some((reason) => reason.includes("stand B12")));
  });
});

describe("next best actions", () => {
  it("deduplicates actions with the same href", () => {
    const result = dedupeNextBestActions([
      {
        id: "a",
        message: "First",
        href: "#same",
        priority: 100,
      },
      {
        id: "b",
        message: "Second",
        href: "#same",
        priority: 90,
      },
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "a");
  });

  it("suppresses check-in prompts when the event is not live", () => {
    const actions = buildNextBestActions({
      eventId: "event-1",
      presence: { isAttending: true, isCurrentlyAtEvent: false },
      eventTimingState: "upcoming",
      wishlistOpportunityCount: 0,
      offerableItemCount: 0,
      peopleToMeet: [],
      viewerWishlistCount: 1,
      hasListings: true,
    });

    assert.equal(actions.some((action) => action.id === "check-in"), false);
  });

  it("limits to three distinct actions", () => {
    const actions = buildNextBestActions({
      eventId: "event-1",
      presence: { isAttending: true, isCurrentlyAtEvent: false },
      eventTimingState: "live",
      wishlistOpportunityCount: 2,
      offerableItemCount: 2,
      peopleToMeet: [
        {
          userId: "user-2",
          displayName: "Alex",
          isCurrentlyAtEvent: true,
          matchScoreResult: { score: 80 } as never,
        } as never,
      ],
      viewerWishlistCount: 0,
      hasListings: false,
    });

    assert.ok(actions.length <= 3);
    assert.equal(new Set(actions.map((action) => action.href)).size, actions.length);
  });
});

describe("event timing", () => {
  it("detects live, upcoming, and ended states", () => {
    assert.equal(
      getEventTimingState(
        { start_date: "2026-07-01T00:00:00.000Z", end_date: "2026-07-31T23:59:59.000Z" },
        new Date("2026-07-15T12:00:00.000Z"),
      ),
      "live",
    );
    assert.equal(
      getEventTimingState(
        { start_date: "2026-08-01T00:00:00.000Z", end_date: "2026-08-02T00:00:00.000Z" },
        new Date("2026-07-15T12:00:00.000Z"),
      ),
      "upcoming",
    );
    assert.equal(
      getEventTimingState(
        { start_date: "2026-06-01T00:00:00.000Z", end_date: "2026-06-02T00:00:00.000Z" },
        new Date("2026-07-15T12:00:00.000Z"),
      ),
      "ended",
    );
  });

  it("only emphasizes check-in during live events", () => {
    assert.equal(shouldEmphasizeCheckIn("live"), true);
    assert.equal(shouldEmphasizeCheckIn("ended"), false);
  });
});

describe("offerable privacy labels", () => {
  it("buckets collector counts without exposing exact private totals", () => {
    assert.equal(bucketInterestedCollectorCount(1), "Another collector may be interested");
    assert.equal(bucketInterestedCollectorCount(2), "A few collectors may be interested");
    assert.equal(bucketInterestedCollectorCount(5), "Several collectors may be interested");
  });
});

describe("large fixture safety", () => {
  it("keeps wishlist opportunity previews bounded with many listings", () => {
    const listings = Array.from({ length: 500 }, (_, index) =>
      makeListing({
        id: `listing-${index}`,
        user_id: `seller-${index}`,
        tcg_api_card_id: index % 2 === 0 ? "base1-58" : `other-${index}`,
        created_at: new Date(Date.UTC(2026, 6, 1, 0, index)).toISOString(),
      }),
    );

    const result = buildWishlistOpportunities(
      "viewer",
      [
        {
          card_name: "Pikachu",
          card_ref: "set-a:pikachu",
          set_name: "Base Set",
          tcg_api_card_id: "base1-58",
        },
      ],
      listings,
      new Map(),
    );

    assert.ok(result.length <= 8);
  });
});
