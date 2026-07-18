import { FeaturedCard } from "@/components/profile/FeaturedCard";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  getEmptySectionMessage,
  getNoPublicItemsMessage,
  getPrivateSectionMessage,
  getWishlistSectionState,
} from "@/lib/profile-privacy";
import type { ProfilePageData } from "@/lib/profile";

type ProfileWishlistTabProps = {
  data: ProfilePageData;
  cardImagesById: Map<string, { small: string; large: string }>;
  userId: string;
};

export function ProfileWishlistTab({
  data,
  cardImagesById,
  userId,
}: ProfileWishlistTabProps) {
  const sectionState = getWishlistSectionState(data.visibility, {
    totalItemsForViewer: data.wishlistItems.length,
    isOwner: data.isOwnProfile,
  });

  if (sectionState === "private") {
    return (
      <ProfileEmptyState
        title="Wishlist not shared"
        description={getPrivateSectionMessage("wishlist")}
        actionLabel="Start chat"
        actionHref={`/messages?with=${userId}`}
        icon="🔒"
      />
    );
  }

  return (
    <div className="space-y-4">
      <ProfileSectionHeader
        title="Wishlist"
        description="Cards this collector is actively looking for."
        actionLabel={data.isOwnProfile ? "Manage wishlist" : undefined}
        actionHref={data.isOwnProfile ? "/my-wishlist" : undefined}
      />

      {sectionState === "visible" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.wishlistItems.map((item) => (
            <FeaturedCard
              key={item.id}
              id={item.id}
              name={item.card_name}
              setName={item.set_name}
              rarityLabel={item.card_number ? `#${item.card_number}` : "Want"}
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
            sectionState === "empty"
              ? "Wishlist is empty"
              : "No public wishlist items yet"
          }
          description={
            sectionState === "empty"
              ? getEmptySectionMessage("wishlist")
              : getNoPublicItemsMessage("wishlist")
          }
          actionLabel={data.isOwnProfile ? "Add cards to your wishlist" : undefined}
          actionHref={data.isOwnProfile ? "/my-wishlist" : undefined}
          icon="⭐"
        />
      )}
    </div>
  );
}
