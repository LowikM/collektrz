import type { ChatMessage } from "@/lib/conversations";

export type ListingContext = {
  listingId: string;
  cardName: string;
  listingType: "want" | "trade" | "sale";
  status: string;
  condition: string | null;
  targetPrice: string | null;
  eventId: string;
  eventName: string | null;
  tcgApiCardId: string | null;
  collectionItemId: string | null;
  imageUrl: string | null;
};

type RawListingEmbed = {
  id: string;
  card_name: string;
  type: "want" | "trade" | "sale";
  status: string;
  condition: string | null;
  target_price: string | null;
  tcg_api_card_id: string | null;
  collection_item_id: string | null;
  event_id: string;
  events: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};

export type RawMessageWithListing = {
  listing_id: string | null;
  created_at: string;
  listings: RawListingEmbed | RawListingEmbed[] | null;
};

function getEmbeddedListing(
  listings: RawMessageWithListing["listings"],
): RawListingEmbed | null {
  if (!listings) {
    return null;
  }

  return Array.isArray(listings) ? (listings[0] ?? null) : listings;
}

function getEventName(events: RawListingEmbed["events"]) {
  if (!events) {
    return null;
  }

  const event = Array.isArray(events) ? events[0] : events;
  return event?.name ?? null;
}

export function extractListingContextFromMessage(
  row: RawMessageWithListing,
  imageUrl: string | null,
): ListingContext | null {
  if (!row.listing_id) {
    return null;
  }

  const listing = getEmbeddedListing(row.listings);
  if (!listing) {
    return null;
  }

  return {
    listingId: listing.id,
    cardName: listing.card_name,
    listingType: listing.type,
    status: listing.status,
    condition: listing.condition,
    targetPrice: listing.target_price,
    eventId: listing.event_id,
    eventName: getEventName(listing.events),
    tcgApiCardId: listing.tcg_api_card_id,
    collectionItemId: listing.collection_item_id,
    imageUrl,
  };
}

export function getConversationListingContext(
  messages: Array<ChatMessage & { listingContext?: ListingContext | null }>,
): ListingContext | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const context = messages[index]?.listingContext;
    if (context) {
      return context;
    }
  }

  return null;
}

export function getListingTypeLabel(type: ListingContext["listingType"]) {
  switch (type) {
    case "want":
      return "Want listing";
    case "trade":
      return "Trade listing";
    case "sale":
      return "Sale listing";
  }
}

export function getListingStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
