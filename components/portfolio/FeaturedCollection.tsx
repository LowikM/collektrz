import Link from "next/link";

import { PortfolioEmptyState } from "@/components/portfolio/PortfolioEmptyState";
import { FadeInSection } from "@/components/portfolio/PortfolioMotion";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  profileBadgeClassName,
  profileImageGradientClassName,
  profileShowcaseCardClassName,
} from "@/components/profile/profile-styles";
import {
  getPortfolioItemImageUrl,
  type PortfolioItemPreview,
} from "@/lib/portfolio";

type FeaturedCollectionProps = {
  items: PortfolioItemPreview[];
  cardImagesById: Map<string, { small: string; large: string }>;
};

function FeaturedShowcaseCard({
  item,
  cardImagesById,
  featured = false,
}: {
  item: PortfolioItemPreview;
  cardImagesById: Map<string, { small: string; large: string }>;
  featured?: boolean;
}) {
  const imageUrl = getPortfolioItemImageUrl(item, cardImagesById);

  return (
    <article
      className={`group relative shrink-0 snap-start overflow-hidden ${profileShowcaseCardClassName} ${
        featured ? "w-[min(85vw,280px)] sm:w-[320px]" : "w-full"
      }`}
    >
      <div
        className={`relative aspect-[3/4] overflow-hidden ${profileImageGradientClassName}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.card_name}
            className="h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-400">
            {item.card_name}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/40 to-transparent p-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href="/my-collection?view=collection"
            className="inline-flex min-h-9 items-center rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-white"
          >
            View Collection
          </Link>
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Featured
          </span>
          {item.visibility === "public" ? (
            <span className={profileBadgeClassName}>Public</span>
          ) : (
            <span className={profileBadgeClassName}>Private</span>
          )}
        </div>
      </div>
      <div className="space-y-1 p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {item.card_name}
        </h3>
        {item.set_name ? (
          <p className="truncate text-sm text-zinc-500">{item.set_name}</p>
        ) : null}
      </div>
    </article>
  );
}

export function FeaturedCollection({
  items,
  cardImagesById,
}: FeaturedCollectionProps) {
  return (
    <FadeInSection delayMs={80}>
      <section className="space-y-5">
        <ProfileSectionHeader
          title="Featured Collection"
          description="The highlights visitors see first on your collector profile."
          actionLabel={items.length > 0 ? "Manage collection" : undefined}
          actionHref={
            items.length > 0 ? "/my-collection?view=collection" : undefined
          }
        />

        {items.length > 0 ? (
          <>
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
              {items.map((item) => (
                <FeaturedShowcaseCard
                  key={item.id}
                  item={item}
                  cardImagesById={cardImagesById}
                  featured
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Private featured items stay hidden from public profiles until
              marked public.
            </p>
          </>
        ) : (
          <PortfolioEmptyState
            icon="⭐"
            title="Featured Collection"
            description="Highlight your favourite cards so visitors immediately see the best part of your collection."
            actionLabel="Go to Collection"
            actionHref="/my-collection?view=collection"
          />
        )}
      </section>
    </FadeInSection>
  );
}

export { FeaturedShowcaseCard };
