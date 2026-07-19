import Link from "next/link";

import { FeaturedCollection } from "@/components/portfolio/FeaturedCollection";
import { PortfolioEmptyState } from "@/components/portfolio/PortfolioEmptyState";
import { FadeInSection } from "@/components/portfolio/PortfolioMotion";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  profileImageGradientClassName,
  profileQtyBadgeClassName,
  profileShowcaseCardClassName,
} from "@/components/profile/profile-styles";
import {
  getPortfolioItemImageUrl,
  type PortfolioItemPreview,
} from "@/lib/portfolio";

const RECENT_ADDITIONS_LIMIT = 6;

type RecentAdditionsProps = {
  items: PortfolioItemPreview[];
  cardImagesById: Map<string, { small: string; large: string }>;
};

function formatAddedDate(date: string) {
  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) {
    return "Recently";
  }

  return new Date(parsed).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RecentCard({
  item,
  cardImagesById,
}: {
  item: PortfolioItemPreview;
  cardImagesById: Map<string, { small: string; large: string }>;
}) {
  const imageUrl = getPortfolioItemImageUrl(item, cardImagesById);

  return (
    <Link
      href="/my-collection?view=collection"
      className={`group block shrink-0 snap-start overflow-hidden ${profileShowcaseCardClassName} w-[min(72vw,220px)] sm:w-auto`}
    >
      <div
        className={`relative aspect-[3/4] overflow-hidden ${profileImageGradientClassName}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.card_name}
            className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-zinc-400">
            {item.card_name}
          </div>
        )}
        <span
          className={`absolute right-3 top-3 ${profileQtyBadgeClassName} bg-white/90 shadow-sm dark:bg-zinc-900/90`}
        >
          ×{item.quantity}
        </span>
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-zinc-900/85 px-3 py-2 text-center text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
          View Collection
        </div>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {item.card_name}
        </h3>
        <p className="truncate text-xs text-zinc-500">
          {item.set_name ?? "Set unknown"}
        </p>
        <p className="text-[11px] text-zinc-400">
          Added {formatAddedDate(item.created_at)}
        </p>
      </div>
    </Link>
  );
}

export function RecentAdditions({ items, cardImagesById }: RecentAdditionsProps) {
  const visibleItems = items.slice(0, RECENT_ADDITIONS_LIMIT);

  return (
    <FadeInSection delayMs={120}>
      <section className="space-y-5">
        <ProfileSectionHeader
          title="Recent Additions"
          description="The newest pieces added to your collection."
          actionLabel="Fast Add"
          actionHref="/my-collection/add"
        />

        {visibleItems.length > 0 ? (
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-6">
            {visibleItems.map((item) => (
              <RecentCard
                key={item.id}
                item={item}
                cardImagesById={cardImagesById}
              />
            ))}
          </div>
        ) : (
          <PortfolioEmptyState
            icon="🃏"
            title="No recent additions"
            description="Add cards to your collection and they'll appear here as your latest picks."
            actionLabel="Fast Add card"
            actionHref="/my-collection/add"
            secondaryActionLabel="View collection"
            secondaryActionHref="/my-collection?view=collection"
            compact
          />
        )}
      </section>
    </FadeInSection>
  );
}

/** @deprecated Use FeaturedCollection — kept for any external imports */
export function FeaturedPortfolioSection(props: RecentAdditionsProps) {
  return <FeaturedCollection {...props} />;
}

export function PortfolioItemLinkGrid({
  items,
  cardImagesById,
  emptyMessage,
}: RecentAdditionsProps & { emptyMessage?: string }) {
  if (items.length === 0 && emptyMessage) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <RecentCard key={item.id} item={item} cardImagesById={cardImagesById} />
      ))}
    </div>
  );
}
