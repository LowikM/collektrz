import { FeaturedCard } from "@/components/profile/FeaturedCard";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { canViewProfileSection, getPrivateSectionMessage } from "@/lib/profile-privacy";
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
  const canWishlist = canViewProfileSection("wishlist", data.visibility);

  if (!canWishlist) {
    return (
      <ProfileEmptyState
        title="Private wishlist"
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

      {data.wishlistItems.length > 0 ? (
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
          title="Wishlist is empty"
          description="Add cards you want to collect and activate them at events."
          actionLabel="Add cards to your wishlist"
          actionHref="/my-wishlist"
          icon="⭐"
        />
      )}
    </div>
  );
}
