"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ListingCardThumbnail,
  ListingOfficialCardBadges,
} from "@/components/ListingOfficialCard";
import {
  profileBadgeClassName,
  profileCardClassName,
  profileGhostButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";
import type { ProfileCollectionItem } from "@/lib/profile";

export type CollectionDisplayMode = "grid" | "compact" | "list";

const DISPLAY_MODE_KEY = "collektrz-collection-display-mode";

type CollectionGridProps = {
  items: ProfileCollectionItem[];
  cardImagesById: Map<string, { small: string; large: string }>;
  isOwnProfile: boolean;
  ownerId: string;
  ownerName: string;
  initialMode?: CollectionDisplayMode;
};

function getItemImageUrl(
  item: ProfileCollectionItem,
  cardImagesById: Map<string, { small: string; large: string }>,
) {
  if (item.image_url) {
    return item.image_url;
  }

  if (item.tcg_api_card_id) {
    return cardImagesById.get(item.tcg_api_card_id)?.small ?? null;
  }

  return null;
}

function getRarityLabel(item: ProfileCollectionItem) {
  if (item.item_kind === "sealed") {
    return item.sealed_product_type ?? "Sealed";
  }

  if (item.card_number) {
    return `#${item.card_number}`;
  }

  return item.tcg_api_card_id ? "Official" : null;
}

function CollectionItemCard({
  item,
  imageUrl,
  isOwnProfile,
  ownerId,
  ownerName,
  mode,
}: {
  item: ProfileCollectionItem;
  imageUrl: string | null;
  isOwnProfile: boolean;
  ownerId: string;
  ownerName: string;
  mode: CollectionDisplayMode;
}) {
  const href = isOwnProfile ? "/my-collection" : `/users/${ownerId}?tab=collection`;
  const rarityLabel = getRarityLabel(item);

  if (mode === "list") {
    return (
      <article className={`${profileCardClassName} flex gap-4 p-4`}>
        <ListingCardThumbnail imageUrl={imageUrl} cardName={item.card_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={profileBadgeClassName}>
              {item.item_kind === "sealed" ? "Sealed" : "Card"}
            </span>
            {item.hasTradeListing ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                Tradeable
              </span>
            ) : null}
            <ListingOfficialCardBadges
              tcgApiCardId={item.tcg_api_card_id}
              cardNumber={item.card_number}
            />
          </div>
          <h3 className="mt-1 text-base font-semibold">{item.card_name}</h3>
          {item.set_name ? (
            <p className="text-sm text-zinc-500">{item.set_name}</p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-500">
            Qty {item.quantity}
            {item.condition ? ` · ${item.condition}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link href={href} className={profileSecondaryButtonClassName}>
            Open
          </Link>
          {!isOwnProfile ? (
            <Link
              href={`/messages?with=${ownerId}`}
              className={profileGhostButtonClassName}
            >
              Message
            </Link>
          ) : null}
        </div>
      </article>
    );
  }

  const compact = mode === "compact";

  return (
    <article className={`group ${profileCardClassName} overflow-hidden`}>
      <Link href={href} className="block">
        <div
          className={`relative overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 ${
            compact ? "aspect-[4/5]" : "aspect-[3/4]"
          }`}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={item.card_name}
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-zinc-500">
              {item.card_name}
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {!isOwnProfile ? (
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                Private
              </span>
            ) : (
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                Public
              </span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-lg bg-white/95 px-2 py-1 text-[10px] font-medium text-zinc-800">
              Quick view
            </span>
          </div>
        </div>
      </Link>
      <div className={compact ? "space-y-1.5 p-3" : "space-y-2 p-4"}>
        <h3 className={`font-semibold leading-snug ${compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-sm"}`}>
          {item.card_name}
        </h3>
        {item.set_name ? (
          <p className="truncate text-xs text-zinc-500">{item.set_name}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          {rarityLabel ? (
            <span className={profileBadgeClassName}>{rarityLabel}</span>
          ) : null}
          <span className={profileBadgeClassName}>Qty {item.quantity}</span>
          {item.condition ? (
            <span className={profileBadgeClassName}>{item.condition}</span>
          ) : null}
          {item.hasTradeListing ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
              Trade
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href={href} className="text-xs font-medium text-zinc-600 hover:underline">
            Open
          </Link>
          {!isOwnProfile ? (
            <>
              <Link
                href={`/messages?with=${ownerId}`}
                className="text-xs font-medium text-zinc-600 hover:underline"
              >
                Message {ownerName.split(" ")[0]}
              </Link>
              <Link
                href={`/messages?with=${ownerId}`}
                className="text-xs font-medium text-zinc-600 hover:underline"
              >
                Trade
              </Link>
            </>
          ) : null}
          <span className="text-[10px] text-zinc-400">Value soon</span>
        </div>
      </div>
    </article>
  );
}

export function CollectionGrid({
  items,
  cardImagesById,
  isOwnProfile,
  ownerId,
  ownerName,
  initialMode = "grid",
}: CollectionGridProps) {
  const [mode, setMode] = useState<CollectionDisplayMode>(initialMode);

  useEffect(() => {
    const stored = window.localStorage.getItem(DISPLAY_MODE_KEY);
    if (stored === "grid" || stored === "compact" || stored === "list") {
      setMode(stored);
    }
  }, []);

  function updateMode(next: CollectionDisplayMode) {
    setMode(next);
    window.localStorage.setItem(DISPLAY_MODE_KEY, next);
  }

  const gridClassName = useMemo(() => {
    if (mode === "list") {
      return "grid gap-4";
    }

    if (mode === "compact") {
      return "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }

    return "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }, [mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">{items.length} items shown</p>
        <div className="inline-flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
          {(["grid", "compact", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateMode(option)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                mode === option
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              {option === "compact" ? "Compact" : option}
            </button>
          ))}
        </div>
      </div>

      <div className={gridClassName}>
        {items.map((item) => (
          <CollectionItemCard
            key={item.id}
            item={item}
            imageUrl={getItemImageUrl(item, cardImagesById)}
            isOwnProfile={isOwnProfile}
            ownerId={ownerId}
            ownerName={ownerName}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
}

export function CollectionDisplayModeToggle({
  mode,
  onChange,
}: {
  mode: CollectionDisplayMode;
  onChange: (mode: CollectionDisplayMode) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
      {(["grid", "compact", "list"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
            mode === option ? "bg-zinc-900 text-white" : "text-zinc-600"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
