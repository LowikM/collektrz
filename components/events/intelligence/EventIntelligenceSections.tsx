import type { EventIntelligence } from "@/lib/event-intelligence";

import { EventIntelligenceSignIn } from "@/components/events/intelligence/EventIntelligenceEmptyState";
import { EventItemsYouCanOffer } from "@/components/events/intelligence/EventItemsYouCanOffer";
import { EventMomentumStrip } from "@/components/events/intelligence/EventMomentumStrip";
import { EventNextBestActions } from "@/components/events/intelligence/EventNextBestActions";
import { EventPeopleToMeet } from "@/components/events/intelligence/EventPeopleToMeet";
import { EventRecentActivity } from "@/components/events/intelligence/EventRecentActivity";
import { EventRelevantVendors } from "@/components/events/intelligence/EventRelevantVendors";
import { EventWishlistOpportunities } from "@/components/events/intelligence/EventWishlistOpportunities";

type EventIntelligenceSectionsProps = {
  eventId: string;
  intelligence: EventIntelligence;
  isLoggedIn: boolean;
  cardImagesById: Map<string, { small: string; large: string }>;
  collectionItemImagesById: Map<string, string>;
};

export function EventIntelligenceSections({
  eventId,
  intelligence,
  isLoggedIn,
  cardImagesById,
  collectionItemImagesById,
}: EventIntelligenceSectionsProps) {
  return (
    <div className="space-y-8">
      {isLoggedIn ? (
        <EventNextBestActions actions={intelligence.nextBestActions} />
      ) : null}

      <EventMomentumStrip
        momentum={intelligence.eventMomentum}
        eventTimingState={intelligence.eventTimingState}
      />

      {isLoggedIn ? (
        <>
          <EventWishlistOpportunities
            eventId={eventId}
            opportunities={intelligence.wishlistOpportunities}
            cardImagesById={cardImagesById}
            collectionItemImagesById={collectionItemImagesById}
          />

          <EventPeopleToMeet
            eventId={eventId}
            people={intelligence.peopleToMeet}
            cardImagesById={cardImagesById}
          />

          <EventRelevantVendors
            eventId={eventId}
            vendors={intelligence.relevantVendors}
          />

          <EventItemsYouCanOffer eventId={eventId} items={intelligence.itemsYouCanOffer} />
        </>
      ) : (
        <EventIntelligenceSignIn />
      )}

      <EventRecentActivity
        eventId={eventId}
        listings={intelligence.recentEventListings}
        eventTimingState={intelligence.eventTimingState}
        cardImagesById={cardImagesById}
        collectionItemImagesById={collectionItemImagesById}
      />
    </div>
  );
}
