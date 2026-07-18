import { Suspense } from "react";

import { CollectionFilters, CollectionPagination } from "@/components/profile/CollectionFilters";
import { CollectionGrid } from "@/components/profile/CollectionGrid";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { canViewProfileSection, getPrivateSectionMessage } from "@/lib/profile-privacy";
import type { ProfilePageData } from "@/lib/profile";
import { getUserDisplayLabel } from "@/lib/users";

type ProfileCollectionTabProps = {
  data: ProfilePageData;
  cardImagesById: Map<string, { small: string; large: string }>;
  userId: string;
  filters: {
    q?: string;
    kind?: string;
    sort?: string;
  };
};

export function ProfileCollectionTab({
  data,
  cardImagesById,
  userId,
  filters,
}: ProfileCollectionTabProps) {
  const canCollection = canViewProfileSection("collection", data.visibility);
  const displayName = getUserDisplayLabel(data.user);
  const totalPages = Math.max(
    1,
    Math.ceil(data.collectionTotal / data.collectionPageSize),
  );

  if (!canCollection) {
    return (
      <ProfileEmptyState
        title="Private collection"
        description={getPrivateSectionMessage("collection")}
        actionLabel="Start chat"
        actionHref={`/messages?with=${userId}`}
        icon="🔒"
      />
    );
  }

  return (
    <div className="space-y-4">
      <ProfileSectionHeader
        title="Collection showcase"
        description={`Browse ${displayName}'s cards and sealed products.`}
        actionLabel={data.isOwnProfile ? "Manage collection" : undefined}
        actionHref={data.isOwnProfile ? "/my-collection" : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Suspense fallback={null}>
          <CollectionFilters
            userId={userId}
            initialQuery={filters.q}
            initialKind={filters.kind ?? "all"}
            initialSort={filters.sort ?? "newest"}
          />
        </Suspense>

        <div>
          {data.collectionItems.length > 0 ? (
            <>
              <CollectionGrid
                items={data.collectionItems}
                cardImagesById={cardImagesById}
                isOwnProfile={data.isOwnProfile}
                ownerId={userId}
                ownerName={displayName}
              />
              <CollectionPagination
                page={data.collectionPage}
                totalPages={totalPages}
                userId={userId}
              />
            </>
          ) : (
            <ProfileEmptyState
              title="Start building your collection"
              description="Save cards and sealed products you own for faster listing and a beautiful public showcase."
              actionLabel="Add to collection"
              actionHref="/my-collection"
              icon="🃏"
            />
          )}
        </div>
      </div>
    </div>
  );
}
