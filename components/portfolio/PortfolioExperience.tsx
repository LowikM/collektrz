import { CollectionBreakdown } from "@/components/portfolio/CollectionBreakdown";
import { CollectionHealth } from "@/components/portfolio/CollectionHealth";
import { FeaturedCollection } from "@/components/portfolio/FeaturedCollection";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { RecentAdditions } from "@/components/portfolio/RecentAdditions";
import { RarityBreakdown } from "@/components/portfolio/RarityBreakdown";
import { TopSetsSection } from "@/components/portfolio/TopSetsSection";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSection } from "@/components/profile/ProfileSectionHeader";
import type { PortfolioData } from "@/lib/portfolio";

type PortfolioExperienceProps = {
  data: PortfolioData;
  cardImagesById: Map<string, { small: string; large: string }>;
  userId: string;
  showAllSets?: boolean;
};

export function PortfolioExperience({
  data,
  cardImagesById,
  showAllSets = false,
}: PortfolioExperienceProps) {
  if (data.totals.totalItems === 0) {
    return (
      <ProfileEmptyState
        title="Your portfolio is empty"
        description="Start adding items to see your portfolio take shape — breakdowns, top sets, and showcase readiness appear as your collection grows."
        actionLabel="Fast Add card"
        actionHref="/my-collection/add"
        secondaryActionLabel="Add manually"
        secondaryActionHref="/my-collection?view=collection"
        icon="🃏"
      />
    );
  }

  return (
    <div className="space-y-14 sm:space-y-16">
      <PortfolioHero totals={data.totals} />

      <ProfileSection className="space-y-5">
        <FeaturedCollection
          items={data.featuredItems}
          cardImagesById={cardImagesById}
        />
      </ProfileSection>

      <ProfileSection alt className="space-y-5">
        <RecentAdditions
          items={data.recentItems}
          cardImagesById={cardImagesById}
        />
      </ProfileSection>

      {data.categoryBreakdown.length > 0 || data.totals.sealed === 0 ? (
        <ProfileSection className="space-y-5">
          <CollectionBreakdown
            breakdown={data.categoryBreakdown}
            totalItems={data.totals.totalItems}
            totals={data.totals}
          />
        </ProfileSection>
      ) : null}

      <ProfileSection alt className="space-y-5">
        <TopSetsSection
          sets={showAllSets ? data.allSets : data.topSets}
          allSetsCount={data.allSetsCount}
          cardImagesById={cardImagesById}
        />
      </ProfileSection>

      <ProfileSection className="space-y-5">
        <RarityBreakdown
          breakdown={data.rarityBreakdown}
          hasRarityData={data.hasRarityData}
        />
      </ProfileSection>

      <ProfileSection alt className="space-y-5">
        <CollectionHealth signals={data.collectionHealth} totals={data.totals} />
      </ProfileSection>
    </div>
  );
}
