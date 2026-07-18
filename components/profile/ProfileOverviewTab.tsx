import Link from "next/link";

import { FeaturedCard, ListingPreviewCard } from "@/components/profile/FeaturedCard";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import { canViewProfileSection } from "@/lib/profile-privacy";
import type { ProfilePageData } from "@/lib/profile";
import { getUserDisplayLabel } from "@/lib/users";
import { getListingThumbnailUrl } from "@/lib/collection-items";

type ProfileOverviewTabProps = {
  data: ProfilePageData;
  cardImagesById: Map<string, { small: string; large: string }>;
  userId: string;
};

function getCollectionImageUrl(
  item: ProfilePageData["featuredCollection"][number],
  cardImagesById: Map<string, { small: string; large: string }>,
) {
  if (item.image_url) {
    return item.image_url;
  }

  if (item.tcg_api_card_id) {
    return cardImagesById.get(item.tcg_api_card_id)?.small ?? null;
  }

  return null;
}

export async function ProfileOverviewTab({
  data,
  cardImagesById,
  userId,
}: ProfileOverviewTabProps) {
  const canCollection = canViewProfileSection("collection", data.visibility);
  const canWishlist = canViewProfileSection("wishlist", data.visibility);
  const displayName = getUserDisplayLabel(data.user);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <ProfileSectionHeader
          title="Featured collection"
          description="Highlights from this collector's showcase."
          actionLabel="View all"
          actionHref={`/users/${userId}?tab=collection`}
        />
        {canCollection && data.featuredCollection.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {data.featuredCollection.map((item) => (
              <FeaturedCard
                key={item.id}
                id={item.id}
                name={item.card_name}
                setName={item.set_name}
                rarityLabel={
                  item.card_number
                    ? `#${item.card_number}`
                    : item.item_kind === "sealed"
                      ? "Sealed"
                      : null
                }
                imageUrl={getCollectionImageUrl(item, cardImagesById)}
                href={
                  data.isOwnProfile
                    ? "/my-collection"
                    : `/users/${userId}?tab=collection`
                }
              />
            ))}
          </div>
        ) : (
          <ProfileEmptyState
            title={
              canCollection ? "No featured cards yet." : "Collection is private"
            }
            description={
              canCollection
                ? "Add cards to your collection and the newest pieces will appear here."
                : "This collector has not shared their collection publicly yet."
            }
            actionLabel={data.isOwnProfile ? "Start building your collection" : undefined}
            actionHref={data.isOwnProfile ? "/my-collection" : undefined}
            icon="🃏"
          />
        )}
      </section>

      <section className="space-y-4">
        <ProfileSectionHeader
          title="Recent listings"
          description="Active marketplace listings from this collector."
          actionLabel="View listings"
          actionHref={`/users/${userId}?tab=listings`}
        />
        {data.recentListings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.recentListings.map((listing) => (
              <ListingPreviewCard
                key={listing.id}
                id={listing.id}
                name={listing.card_name}
                setName={listing.set_name}
                type={listing.type}
                imageUrl={getListingThumbnailUrl(
                  listing,
                  cardImagesById,
                  new Map(),
                )}
                tcgApiCardId={listing.tcg_api_card_id}
                cardNumber={listing.card_number}
                eventName={listing.eventName}
              />
            ))}
          </div>
        ) : (
          <ProfileEmptyState
            title="No active listings"
            description="Create a listing at your next event to show traders what you have available."
            actionLabel={data.isOwnProfile ? "Create your first listing" : undefined}
            actionHref={data.isOwnProfile ? "/events" : undefined}
            icon="📋"
          />
        )}
      </section>

      <section className="space-y-4">
        <ProfileSectionHeader
          title="Wishlist highlights"
          actionLabel="View wishlist"
          actionHref={`/users/${userId}?tab=wishlist`}
        />
        {canWishlist && data.wishlistHighlights.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.wishlistHighlights.map((item) => (
              <FeaturedCard
                key={item.id}
                id={item.id}
                name={item.card_name}
                setName={item.set_name}
                rarityLabel={item.card_number ? `#${item.card_number}` : null}
                imageUrl={
                  item.tcg_api_card_id
                    ? (cardImagesById.get(item.tcg_api_card_id)?.small ?? null)
                    : null
                }
                href={data.isOwnProfile ? "/my-wishlist" : `/users/${userId}?tab=wishlist`}
                valuePlaceholder={false}
              />
            ))}
          </div>
        ) : (
          <ProfileEmptyState
            title={
              canWishlist ? "Wishlist is empty" : "Wishlist is private"
            }
            description={
              canWishlist
                ? "Add cards to your wishlist so other collectors know what you are looking for."
                : "This collector keeps their wishlist private."
            }
            actionLabel={data.isOwnProfile ? "Add cards to your wishlist" : undefined}
            actionHref={data.isOwnProfile ? "/my-wishlist" : undefined}
            icon="⭐"
          />
        )}
      </section>

      <section className="space-y-4">
        <ProfileSectionHeader
          title="Recent event activity"
          actionLabel="View events"
          actionHref={`/users/${userId}?tab=events`}
        />
        {data.recentEvents.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.recentEvents.map((event) => (
              <li key={event.eventId}>
                <Link
                  href={`/events/${event.eventId}`}
                  className={`block ${profilePanelClassName} transition-colors hover:border-zinc-300`}
                >
                  <p className="font-semibold">{event.eventName}</p>
                  <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {new Date(event.startDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {event.isCurrentlyAtEvent ? " · Here now" : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ProfileEmptyState
            title="No events yet"
            description="Join an event to trade in person and build your collector story."
            actionLabel="Browse events"
            actionHref="/events"
            icon="📍"
          />
        )}
      </section>

      <section className="space-y-4">
        <ProfileSectionHeader title="Recent trades" description="Trade history coming soon." />
        <ProfileEmptyState
          title="Trade history coming soon"
          description={`Completed trades will appear here once ${displayName} finishes more deals.`}
          icon="🤝"
        />
      </section>

      <section className="space-y-4">
        <ProfileSectionHeader title="Collector stats" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ProfileStatCard label="Collection" value={data.stats.collectionCount ?? "—"} />
          <ProfileStatCard label="Wishlist" value={data.stats.wishlistCount ?? "—"} />
          <ProfileStatCard label="Listings" value={data.stats.listingsCount} />
          <ProfileStatCard label="Completed trades" value={data.stats.completedTradesCount} />
          <ProfileStatCard label="Events attended" value={data.stats.eventsAttendedCount} />
        </div>
      </section>
    </div>
  );
}
