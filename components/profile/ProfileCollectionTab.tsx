import { Suspense } from "react";

import { CollectionFilters, CollectionPagination } from "@/components/profile/CollectionFilters";
import { CollectionGrid } from "@/components/profile/CollectionGrid";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  getCollectionSectionState,
  getEmptySectionMessage,
  getNoPublicItemsMessage,
  getPrivateSectionMessage,
} from "@/lib/profile-privacy";
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
  const displayName = getUserDisplayLabel(data.user);
  const sectionState = getCollectionSectionState(data.visibility, {
    totalItemsForViewer: data.collectionTotal,
    isOwner: data.isOwnProfile,
  });
  const totalPages = Math.max(
    1,
    Math.ceil(data.collectionTotal / data.collectionPageSize),
  );

  if (sectionState === "private") {
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
    <div className="space-y-6">
      <ProfileSectionHeader
        title="Collection showcase"
        description={
          data.isOwnProfile
            ? "Manage which items are public on your collector profile."
            : `Browse public cards and sealed products shared by ${displayName}.`
        }
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
          {sectionState === "visible" ? (
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
              title={
                sectionState === "empty"
                  ? "Start building your collection"
                  : "No public collection items yet"
              }
              description={
                sectionState === "empty"
                  ? getEmptySectionMessage("collection")
                  : getNoPublicItemsMessage("collection")
              }
              actionLabel={data.isOwnProfile ? "Add to collection" : undefined}
              actionHref={data.isOwnProfile ? "/my-collection" : undefined}
              icon="🃏"
            />
          )}
        </div>
      </div>
    </div>
  );
}
