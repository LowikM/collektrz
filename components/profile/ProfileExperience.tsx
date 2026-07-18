import { Suspense } from "react";

import { ProfileAboutTab } from "@/components/profile/ProfileAboutTab";
import { ProfileCollectionTab } from "@/components/profile/ProfileCollectionTab";
import { ProfileEventsTab } from "@/components/profile/ProfileEventsTab";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileListingsTab } from "@/components/profile/ProfileListingsTab";
import { ProfileOverviewTab } from "@/components/profile/ProfileOverviewTab";
import {
  ProfileTabsSkeleton,
  ProfileOverviewSkeleton,
  CollectionGridSkeleton,
} from "@/components/profile/ProfileSkeletons";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileWishlistTab } from "@/components/profile/ProfileWishlistTab";
import type { ProfilePageData, ProfileTab } from "@/lib/profile";

type ProfileExperienceProps = {
  data: ProfilePageData;
  activeTab: ProfileTab;
  userId: string;
  profileUrl: string;
  cardImagesById: Map<string, { small: string; large: string }>;
  collectionFilters: {
    q?: string;
    kind?: string;
    sort?: string;
  };
};

function TabSkeleton({ activeTab }: { activeTab: ProfileTab }) {
  if (activeTab === "collection") {
    return <CollectionGridSkeleton />;
  }

  return <ProfileOverviewSkeleton />;
}

function ProfileTabPanel({
  data,
  activeTab,
  userId,
  cardImagesById,
  collectionFilters,
}: Omit<ProfileExperienceProps, "profileUrl">) {
  switch (activeTab) {
    case "collection":
      return (
        <ProfileCollectionTab
          data={data}
          cardImagesById={cardImagesById}
          userId={userId}
          filters={collectionFilters}
        />
      );
    case "wishlist":
      return (
        <ProfileWishlistTab
          data={data}
          cardImagesById={cardImagesById}
          userId={userId}
        />
      );
    case "listings":
      return (
        <ProfileListingsTab
          data={data}
          cardImagesById={cardImagesById}
          userId={userId}
        />
      );
    case "events":
      return <ProfileEventsTab data={data} />;
    case "about":
      return <ProfileAboutTab data={data} />;
    case "overview":
    default:
      return (
        <ProfileOverviewTab
          data={data}
          cardImagesById={cardImagesById}
          userId={userId}
        />
      );
  }
}

export function ProfileExperience({
  data,
  activeTab,
  userId,
  profileUrl,
  cardImagesById,
  collectionFilters,
}: ProfileExperienceProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:space-y-10 sm:py-10">
      <ProfileHero
        user={data.user}
        stats={data.stats}
        visibility={data.visibility}
        isOwnProfile={data.isOwnProfile}
        profileUrl={profileUrl}
        matchScore={data.matchScore}
        matchEventId={data.matchEventId}
        cardImagesById={cardImagesById}
      />

      <Suspense fallback={<ProfileTabsSkeleton />}>
        <ProfileTabs activeTab={activeTab} userId={userId} />
      </Suspense>

      <div className="min-h-[12rem]">
        <Suspense fallback={<TabSkeleton activeTab={activeTab} />}>
          <ProfileTabPanel
            data={data}
            activeTab={activeTab}
            userId={userId}
            cardImagesById={cardImagesById}
            collectionFilters={collectionFilters}
          />
        </Suspense>
      </div>
    </div>
  );
}
