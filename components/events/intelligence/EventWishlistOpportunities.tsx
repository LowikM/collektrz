import Link from "next/link";

import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import {
  eventCardClassName,
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { EventIntelligenceEmptyState } from "@/components/events/intelligence/EventIntelligenceEmptyState";
import {
  ListingCardThumbnail,
  ListingOfficialCardBadges,
} from "@/components/ListingOfficialCard";
import { VendorBadge } from "@/components/VendorBadge";
import { getListingThumbnailUrl } from "@/lib/collection-items";
import type { WishlistOpportunity } from "@/lib/event-intelligence";

type EventWishlistOpportunitiesProps = {
  eventId: string;
  opportunities: WishlistOpportunity[];
  cardImagesById: Map<string, { small: string; large: string }>;
  collectionItemImagesById: Map<string, string>;
};

function formatListingType(type: "trade" | "sale") {
  return type === "sale" ? "Sale" : "Trade";
}

export function EventWishlistOpportunities({
  eventId,
  opportunities,
  cardImagesById,
  collectionItemImagesById,
}: EventWishlistOpportunitiesProps) {
  return (
    <section id="event-wishlist-opportunities" className="space-y-4 scroll-mt-24">
      <EventSectionHeader
        eyebrow="Wishlist"
        title="Available from your wishlist"
        description="Active sale and trade listings at this event that match cards you want."
        count={opportunities.length}
        countLabel={opportunities.length === 1 ? "match" : "matches"}
      />

      {opportunities.length === 0 ? (
        <EventIntelligenceEmptyState
          icon="💫"
          title="No wishlist matches yet"
          description="Add cards to your wishlist or activate want listings so we can surface matches when sellers list them."
          actionLabel="Manage wishlist"
          actionHref="/my-wishlist"
          secondaryActionLabel="Activate wishlist"
          secondaryActionHref={`/events/${eventId}/activate-wishlist`}
        />
      ) : (
        <ul
          className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-2"
          aria-label="Wishlist matches available at this event"
        >
          {opportunities.map((opportunity) => {
            const imageUrl = getListingThumbnailUrl(
              {
                tcg_api_card_id: opportunity.tcgApiCardId,
                collection_item_id: opportunity.collectionItemId,
              },
              cardImagesById,
              collectionItemImagesById,
            );

            return (
              <li
                key={opportunity.listingId}
                className={`${eventCardClassName} min-w-[min(88vw,340px)] shrink-0 snap-start sm:min-w-0`}
              >
                <div className="flex gap-3">
                  <ListingCardThumbnail
                    imageUrl={imageUrl}
                    cardName={opportunity.cardName}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        {formatListingType(opportunity.listingType)}
                      </span>
                      {opportunity.isVendor && opportunity.standNumber ? (
                        <VendorBadge standNumber={opportunity.standNumber} />
                      ) : null}
                      {opportunity.isOwnerCheckedIn ? (
                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                          Checked in
                        </span>
                      ) : null}
                      <ListingOfficialCardBadges
                        tcgApiCardId={opportunity.tcgApiCardId}
                        cardNumber={null}
                      />
                    </div>

                    <h3 className="mt-2 text-base font-semibold tracking-tight">
                      {opportunity.cardName}
                    </h3>
                    {opportunity.setName ? (
                      <p className="mt-1 text-sm text-zinc-500">{opportunity.setName}</p>
                    ) : null}
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {opportunity.ownerLabel}
                      {opportunity.condition ? ` · ${opportunity.condition}` : ""}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`#listing-${opportunity.listingId}`}
                        className={`${eventPrimaryButtonClassName} min-h-11 px-4 py-2.5`}
                        aria-label={`View listing for ${opportunity.cardName}`}
                      >
                        View listing
                      </Link>
                      <Link
                        href={`/messages?with=${opportunity.ownerId}`}
                        className={`${eventSecondaryButtonClassName} min-h-11 px-4 py-2.5`}
                        aria-label={`Message seller ${opportunity.ownerLabel}`}
                      >
                        Message seller
                      </Link>
                    </div>
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
