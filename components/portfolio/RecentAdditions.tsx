import Link from "next/link";

import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  profileBadgeClassName,
  profileCardInteractiveClassName,
  profileImageGradientClassName,
  profileQtyBadgeClassName,
} from "@/components/profile/profile-styles";
import {
  getPortfolioItemImageUrl,
  type PortfolioItemPreview,
} from "@/lib/portfolio";

type RecentAdditionsProps = {
  items: PortfolioItemPreview[];
  cardImagesById: Map<string, { small: string; large: string }>;
};

function formatAddedDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PortfolioItemTile({
  item,
  cardImagesById,
}: {
  item: PortfolioItemPreview;
  cardImagesById: Map<string, { small: string; large: string }>;
}) {
  const imageUrl = getPortfolioItemImageUrl(item, cardImagesById);

  return (
    <article className={`overflow-hidden ${profileCardInteractiveClassName}`}>
      <div className={`relative aspect-[3/4] ${profileImageGradientClassName}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.card_name}
            className="h-full w-full object-contain p-4"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-zinc-400">
            {item.card_name}
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          <span className={profileQtyBadgeClassName}>×{item.quantity}</span>
          <span className={profileBadgeClassName}>
            {item.visibility === "public" ? "Public" : "Private"}
          </span>
          {item.is_featured ? (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              Featured
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold">{item.card_name}</h3>
        {item.set_name ? (
          <p className="truncate text-xs text-zinc-500">{item.set_name}</p>
        ) : null}
        <p className="text-xs text-zinc-400">Added {formatAddedDate(item.created_at)}</p>
      </div>
    </article>
  );
}

export function RecentAdditions({ items, cardImagesById }: RecentAdditionsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        title="Recent additions"
        description="The newest pieces added to your collection."
        actionLabel="Fast Add"
        actionHref="/my-collection/add"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <PortfolioItemTile
            key={item.id}
            item={item}
            cardImagesById={cardImagesById}
          />
        ))}
      </div>
    </section>
  );
}

export function FeaturedPortfolioSection({
  items,
  cardImagesById,
}: RecentAdditionsProps) {
  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        title="Featured on profile"
        description="Featured public items appear on your collector profile and QR page. Use the item menu in Collection to feature cards."
        actionLabel="Manage collection"
        actionHref="/my-collection?view=collection"
      />
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <PortfolioItemTile
              key={item.id}
              item={item}
              cardImagesById={cardImagesById}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No featured items yet. Feature public collection items to highlight them
          on your profile.
        </p>
      )}
      <p className="text-xs text-zinc-500">
        Private featured items stay hidden from public profiles until marked
        public.
      </p>
    </section>
  );
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
        <Link key={item.id} href="/my-collection?view=collection">
          <PortfolioItemTile item={item} cardImagesById={cardImagesById} />
        </Link>
      ))}
    </div>
  );
}
