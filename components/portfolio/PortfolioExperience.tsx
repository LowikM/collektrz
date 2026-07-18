import { CollectionBreakdown } from "@/components/portfolio/CollectionBreakdown";
import { CollectionHealth } from "@/components/portfolio/CollectionHealth";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import {
  FeaturedPortfolioSection,
  RecentAdditions,
} from "@/components/portfolio/RecentAdditions";
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
  userId,
  showAllSets = false,
}: PortfolioExperienceProps) {
  if (data.totals.totalItems === 0) {
    return (
      <ProfileEmptyState
        title="Your portfolio is empty"
        description="Start adding items to see your portfolio take shape — breakdowns, top sets, and showcase readiness appear as your collection grows."
        actionLabel="Add to collection"
        actionHref="/my-collection?view=collection"
        secondaryActionLabel="View public profile"
        secondaryActionHref={`/users/${userId}?tab=overview`}
        icon="🃏"
      />
    );
  }

  return (
    <div className="space-y-12 sm:space-y-14">
      <PortfolioHero totals={data.totals} />

      {data.categoryBreakdown.length > 0 ? (
        <ProfileSection className="space-y-5">
          <CollectionBreakdown
            breakdown={data.categoryBreakdown}
            totalItems={data.totals.totalItems}
          />
        </ProfileSection>
      ) : null}

      <ProfileSection alt className="space-y-5">
        <TopSetsSection
          sets={showAllSets ? data.allSets : data.topSets}
          allSetsCount={data.allSetsCount}
          cardImagesById={cardImagesById}
          showAll={showAllSets}
        />
        {data.topSets.length === 0 ? (
          <ProfileEmptyState
            title="No set breakdown yet"
            description="Add set information to your items to unlock top-set insights."
            actionLabel="Review collection"
            actionHref="/my-collection?view=collection"
            icon="📊"
          />
        ) : null}
      </ProfileSection>

      <ProfileSection className="space-y-5">
        <RarityBreakdown
          breakdown={data.rarityBreakdown}
          hasRarityData={data.hasRarityData}
        />
      </ProfileSection>

      <ProfileSection alt className="space-y-5">
        <RecentAdditions items={data.recentItems} cardImagesById={cardImagesById} />
      </ProfileSection>

      <ProfileSection className="space-y-5">
        <FeaturedPortfolioSection
          items={data.featuredItems}
          cardImagesById={cardImagesById}
        />
      </ProfileSection>

      <ProfileSection alt className="space-y-5">
        <CollectionHealth signals={data.collectionHealth} />
      </ProfileSection>
    </div>
  );
}
