import Link from "next/link";

import { AnimatedProgressBar, FadeInSection } from "@/components/portfolio/PortfolioMotion";
import { PortfolioEmptyState } from "@/components/portfolio/PortfolioEmptyState";
import { buildCollectionFilterHref } from "@/lib/collection-filters";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  profileImageGradientClassName,
  profileShowcaseCardClassName,
} from "@/components/profile/profile-styles";
import type { PortfolioSetSummary } from "@/lib/portfolio";
import { UNKNOWN_SET_LABEL } from "@/lib/portfolio-normalize";

type TopSetsSectionProps = {
  sets: PortfolioSetSummary[];
  allSetsCount: number;
  cardImagesById: Map<string, { small: string; large: string }>;
  showAll?: boolean;
};

function getSetImageUrl(
  set: PortfolioSetSummary,
  cardImagesById: Map<string, { small: string; large: string }>,
) {
  if (set.representativeImageUrl) {
    return set.representativeImageUrl;
  }

  if (set.representativeTcgApiCardId) {
    return cardImagesById.get(set.representativeTcgApiCardId)?.small ?? null;
  }

  return null;
}

export function TopSetsSection({
  sets,
  allSetsCount,
  cardImagesById,
  showAll = false,
}: TopSetsSectionProps) {
  return (
    <FadeInSection delayMs={200}>
      <section className="space-y-5">
        <ProfileSectionHeader
          title="Top Sets"
          description="Sets with the strongest presence in your collection."
          actionLabel={
            !showAll && allSetsCount > sets.length ? "View all sets" : undefined
          }
          actionHref={
            !showAll && allSetsCount > sets.length
              ? "/my-collection?view=portfolio&sets=all"
              : undefined
          }
        />

        {sets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sets.map((set, index) => {
              const imageUrl = getSetImageUrl(set, cardImagesById);
              const isUnknown = set.setName === UNKNOWN_SET_LABEL;

              return (
                <Link
                  key={set.setName}
                  href={
                    isUnknown
                      ? buildCollectionFilterHref({})
                      : buildCollectionFilterHref({ set: set.setName })
                  }
                  className={`group block overflow-hidden ${profileShowcaseCardClassName}`}
                >
                  <div
                    className={`relative flex h-32 items-center justify-center overflow-hidden ${profileImageGradientClassName}`}
                  >
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt=""
                        className="max-h-24 max-w-[5rem] object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs font-medium text-zinc-400">
                        No image
                      </span>
                    )}
                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-zinc-800 shadow-sm dark:bg-zinc-900/90 dark:text-zinc-100">
                      {set.percentage}%
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {set.setName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {set.uniqueItems} card{set.uniqueItems === 1 ? "" : "s"} · Qty{" "}
                      {set.totalQuantity}
                    </p>
                    <AnimatedProgressBar
                      percentage={set.percentage}
                      className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                      barClassName="h-full rounded-full bg-zinc-800 dark:bg-zinc-200"
                      delayMs={index * 80}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <PortfolioEmptyState
            icon="📊"
            title="No set breakdown yet"
            description="Add set information to your items to unlock top-set insights and collection depth."
            actionLabel="Review collection"
            actionHref="/my-collection?view=collection"
            compact
          />
        )}
      </section>
    </FadeInSection>
  );
}
