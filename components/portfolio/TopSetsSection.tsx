import Link from "next/link";

import { buildCollectionFilterHref } from "@/lib/collection-filters";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  profileImageGradientClassName,
  profilePanelClassName,
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
  if (sets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        title="Top sets"
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sets.map((set) => {
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
              className={`${profilePanelClassName} block transition-colors hover:border-zinc-300 dark:hover:border-zinc-700`}
            >
              <div
                className={`mb-4 flex h-24 items-center justify-center overflow-hidden rounded-xl ${profileImageGradientClassName}`}
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="max-h-20 max-w-[4.5rem] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs font-medium text-zinc-400">No image</span>
                )}
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {set.setName}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {set.uniqueItems} unique · Qty {set.totalQuantity} · {set.percentage}%
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
