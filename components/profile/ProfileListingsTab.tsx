import Link from "next/link";

import { ListingPreviewCard } from "@/components/profile/FeaturedCard";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import type { ProfilePageData } from "@/lib/profile";
import { getListingThumbnailUrl } from "@/lib/collection-items";

type ProfileListingsTabProps = {
  data: ProfilePageData;
  cardImagesById: Map<string, { small: string; large: string }>;
  userId: string;
};

export function ProfileListingsTab({
  data,
  cardImagesById,
  userId,
}: ProfileListingsTabProps) {
  return (
    <div className="space-y-4">
      <ProfileSectionHeader
        title="Listings"
        description="Active marketplace listings from this collector."
        actionLabel={data.isOwnProfile ? "Manage listings" : undefined}
        actionHref={data.isOwnProfile ? "/my-listings" : undefined}
      />

      {data.listingItems.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.listingItems.map((listing) => (
            <div key={listing.id} className="space-y-2">
              <ListingPreviewCard
                id={listing.id}
                name={listing.card_name}
                setName={listing.set_name}
                type={listing.type}
                imageUrl={getListingThumbnailUrl(listing, cardImagesById, new Map())}
                tcgApiCardId={listing.tcg_api_card_id}
                cardNumber={listing.card_number}
                eventName={listing.eventName}
              />
              <Link
                href={`/events/${listing.event_id}`}
                className={`block text-center text-xs font-medium text-zinc-500 hover:underline ${profilePanelClassName} py-2`}
              >
                View at {listing.eventName ?? "event"}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <ProfileEmptyState
          title="No active listings"
          description="Create a listing at an event to start trading with collectors nearby."
          actionLabel={data.isOwnProfile ? "Create your first listing" : "Browse events"}
          actionHref={data.isOwnProfile ? "/events" : "/events"}
          icon="📋"
        />
      )}
    </div>
  );
}
