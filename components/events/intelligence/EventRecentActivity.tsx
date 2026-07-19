import Link from "next/link";

import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import {
  eventCardClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { EventIntelligenceEmptyState } from "@/components/events/intelligence/EventIntelligenceEmptyState";
import {
  ListingCardThumbnail,
  ListingOfficialCardBadges,
} from "@/components/ListingOfficialCard";
import { VendorBadge } from "@/components/VendorBadge";
import { getListingThumbnailUrl } from "@/lib/collection-items";
import type { RecentEventListing } from "@/lib/event-intelligence";
import {
  getRecentActivityDescription,
  type EventTimingState,
} from "@/lib/event-timing";

type EventRecentActivityProps = {
  eventId: string;
  listings: RecentEventListing[];
  eventTimingState: EventTimingState;
  cardImagesById: Map<string, { small: string; large: string }>;
  collectionItemImagesById: Map<string, string>;
};

const TYPE_LABELS = {
  want: "Want",
  trade: "Trade",
  sale: "Sale",
} as const;

function formatRelativeTime(date: string) {
  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) {
    return "Recently";
  }

  const diffMs = Date.now() - parsed;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (hours < 1) {
    return "Just added";
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function EventRecentActivity({
  eventId,
  listings,
  eventTimingState,
  cardImagesById,
  collectionItemImagesById,
}: EventRecentActivityProps) {
  return (
    <section className="space-y-4">
      <EventSectionHeader
        eyebrow="Activity"
        title="New at this event"
        description={getRecentActivityDescription(eventTimingState)}
        action={
          <Link
            href="#event-marketplace"
            className={eventSecondaryButtonClassName}
            aria-label="View full event marketplace"
          >
            View marketplace
          </Link>
        }
      />

      {listings.length === 0 ? (
        <EventIntelligenceEmptyState
          icon="🆕"
          title="No recent listings"
          description="Be the first to add inventory, or check back as the marketplace grows."
          actionLabel="Create listing"
          actionHref={`/events/${eventId}/new-listing`}
        />
      ) : (
        <ul
          className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4"
          aria-label="Recently added event listings"
        >
          {listings.map((listing) => {
            const imageUrl = getListingThumbnailUrl(
              {
                tcg_api_card_id: listing.tcgApiCardId,
                collection_item_id: listing.collectionItemId,
              },
              cardImagesById,
              collectionItemImagesById,
            );

            return (
              <li
                key={listing.listingId}
                className={`${eventCardClassName} min-w-[min(78vw,260px)] shrink-0 snap-start sm:min-w-0`}
              >
                <div className="flex flex-col gap-3">
                  <ListingCardThumbnail
                    imageUrl={imageUrl}
                    cardName={listing.cardName}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {TYPE_LABELS[listing.listingType]}
                      </span>
                      {listing.isWishlistMatch ? (
                        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                          <span aria-hidden="true">★ </span>
                          Wishlist match
                        </span>
                      ) : null}
                      {listing.isVendor && listing.standNumber ? (
                        <VendorBadge standNumber={listing.standNumber} />
                      ) : null}
                      <ListingOfficialCardBadges
                        tcgApiCardId={listing.tcgApiCardId}
                        cardNumber={null}
                      />
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-semibold">
                      {listing.cardName}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {listing.ownerLabel} · {formatRelativeTime(listing.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
