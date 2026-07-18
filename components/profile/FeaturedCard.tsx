import Link from "next/link";

import {
  profileBadgeClassName,
  profileImageGradientClassName,
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
  profileShowcaseCardClassName,
  profileCardInteractiveClassName,
} from "@/components/profile/profile-styles";

type FeaturedCardProps = {
  id: string;
  name: string;
  setName: string | null;
  rarityLabel?: string | null;
  imageUrl: string | null;
  href: string;
  valuePlaceholder?: boolean;
  variant?: "default" | "showcase";
};

export function FeaturedCard({
  name,
  setName,
  rarityLabel,
  imageUrl,
  href,
  valuePlaceholder = true,
  variant = "default",
}: FeaturedCardProps) {
  const isShowcase = variant === "showcase";
  const cardClass = isShowcase
    ? profileShowcaseCardClassName
    : profileCardInteractiveClassName;

  return (
    <Link href={href} className={`group block overflow-hidden ${cardClass}`}>
      <div
        className={`relative overflow-hidden ${profileImageGradientClassName} ${
          isShowcase ? "aspect-[3/4.2] sm:aspect-[3/4]" : "aspect-[3/4]"
        }`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.06] sm:p-6"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm font-medium text-zinc-400">
            {name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur-sm">
            View card
          </span>
        </div>
      </div>
      <div className={`space-y-2 ${isShowcase ? "p-5 sm:p-6" : "p-4"}`}>
        <h3
          className={`font-semibold leading-snug text-zinc-900 dark:text-zinc-50 ${
            isShowcase
              ? "line-clamp-2 text-base sm:text-lg"
              : "line-clamp-2 text-sm"
          }`}
        >
          {name}
        </h3>
        {setName ? (
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {setName}
          </p>
        ) : null}
        {(rarityLabel || valuePlaceholder) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {rarityLabel ? (
              <span className={profileBadgeClassName}>{rarityLabel}</span>
            ) : null}
            {valuePlaceholder ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:bg-zinc-800">
                Value soon
              </span>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}

export function ListingPreviewCard({
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
      href="/events"
      className={`group flex gap-4 overflow-hidden ${profileCardInteractiveClassName} p-4 sm:p-5`}
    >
      <div className="relative shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-[5.5rem] w-14 object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[5.5rem] w-14 items-center justify-center text-xs text-zinc-400">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={profileBadgeClassName}>{type}</span>
          {tcgApiCardId ? (
            <span className={profileBadgeClassName}>Official</span>
          ) : null}
          {cardNumber ? (
            <span className={profileBadgeClassName}>#{cardNumber}</span>
          ) : null}
        </div>
        <h3 className="mt-2 truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {name}
        </h3>
        {setName ? (
          <p className="truncate text-sm text-zinc-500">{setName}</p>
        ) : null}
        {eventName ? (
          <p className="mt-1 truncate text-xs text-zinc-400">{eventName}</p>
        ) : null}
      </div>
    </Link>
  );
}
