import Link from "next/link";

import {
  ListingCardThumbnail,
  ListingOfficialCardBadges,
} from "@/components/ListingOfficialCard";
import { profileBadgeClassName, profileCardClassName } from "@/components/profile/profile-styles";

type FeaturedCardProps = {
  id: string;
  name: string;
  setName: string | null;
  rarityLabel?: string | null;
  imageUrl: string | null;
  href: string;
  valuePlaceholder?: boolean;
};

export function FeaturedCard({
  name,
  setName,
  rarityLabel,
  imageUrl,
  href,
  valuePlaceholder = true,
}: FeaturedCardProps) {
  return (
    <Link href={href} className={`group block ${profileCardClassName} overflow-hidden`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">
            {name}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-12 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <p className="text-xs font-medium text-white/90">Quick view</p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{name}</h3>
        {setName ? (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{setName}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          {rarityLabel ? (
            <span className={profileBadgeClassName}>{rarityLabel}</span>
          ) : null}
          {valuePlaceholder ? (
            <span className="rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-400 dark:bg-zinc-900">
              Value soon
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

type FeaturedCardCompactProps = {
  name: string;
  setName: string | null;
  imageUrl: string | null;
};

export function FeaturedCardCompact({
  name,
  setName,
  imageUrl,
}: FeaturedCardCompactProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <ListingCardThumbnail imageUrl={imageUrl} cardName={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {setName ? (
          <p className="truncate text-xs text-zinc-500">{setName}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ListingPreviewCard({
  id,
  name,
  setName,
  type,
  imageUrl,
  tcgApiCardId,
  cardNumber,
  eventName,
}: {
  id: string;
  name: string;
  setName: string | null;
  type: string;
  imageUrl: string | null;
  tcgApiCardId: string | null;
  cardNumber: string | null;
  eventName: string | null;
}) {
  return (
    <Link
      href={`/events`}
      className={`flex gap-3 ${profileCardClassName} p-3`}
    >
      <ListingCardThumbnail imageUrl={imageUrl} cardName={name} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={profileBadgeClassName}>{type}</span>
          <ListingOfficialCardBadges
            tcgApiCardId={tcgApiCardId}
            cardNumber={cardNumber}
          />
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold">{name}</h3>
        {setName ? (
          <p className="truncate text-xs text-zinc-500">{setName}</p>
        ) : null}
        {eventName ? (
          <p className="mt-1 truncate text-xs text-zinc-400">{eventName}</p>
        ) : null}
      </div>
    </Link>
  );
}
