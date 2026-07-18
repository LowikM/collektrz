"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  profileBadgeClassName,
  profileCardInteractiveClassName,
  profileImageGradientClassName,
  profileQtyBadgeClassName,
  profileSecondaryButtonClassName,
  profileTradeBadgeClassName,
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
  const firstName = ownerName.split(" ")[0];

  if (mode === "list") {
    return (
      <article
        className={`group flex gap-5 ${profileCardInteractiveClassName} p-5`}
      >
        <div className="relative shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={item.card_name}
              className="h-24 w-[4.5rem] object-contain"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.hasTradeListing ? (
              <span className={profileTradeBadgeClassName}>Trade</span>
            ) : null}
            <span className={profileQtyBadgeClassName}>×{item.quantity}</span>
            {rarityLabel ? (
              <span className={profileBadgeClassName}>{rarityLabel}</span>
            ) : null}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {item.card_name}
          </h3>
          {item.set_name ? (
            <p className="text-sm text-zinc-500">{item.set_name}</p>
          ) : null}
          {item.condition ? (
            <p className="mt-1 text-xs text-zinc-400">{item.condition}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 opacity-100 sm:opacity-80 sm:transition-opacity sm:group-hover:opacity-100">
          <Link href={href} className={profileSecondaryButtonClassName}>
            Open
          </Link>
          {!isOwnProfile ? (
            <Link
              href={`/messages?with=${ownerId}`}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
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
    <article className={`group overflow-hidden ${profileCardInteractiveClassName}`}>
      <Link href={href} className="block">
        <div
          className={`relative overflow-hidden ${profileImageGradientClassName} ${
            compact ? "aspect-[4/5]" : "aspect-[3/4]"
          }`}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={item.card_name}
              className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.05] sm:p-5"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-400">
              {item.card_name}
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            <span className={profileQtyBadgeClassName}>×{item.quantity}</span>
            {item.hasTradeListing ? (
              <span className={profileTradeBadgeClassName}>Trade</span>
            ) : null}
            {item.is_featured ? (
              <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                Featured
              </span>
            ) : null}
          </div>

          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex w-full flex-wrap justify-center gap-2">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm">
                Quick view
              </span>
              {!isOwnProfile ? (
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm">
                  Message {firstName}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      <div className={compact ? "space-y-1.5 p-4" : "space-y-2 p-5"}>
        <h3
          className={`font-semibold leading-snug text-zinc-900 dark:text-zinc-50 ${
            compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-base"
          }`}
        >
          {item.card_name}
        </h3>
        {item.set_name ? (
          <p className="truncate text-sm text-zinc-500">{item.set_name}</p>
        ) : null}
        {rarityLabel || item.condition ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {rarityLabel ? (
              <span className={profileBadgeClassName}>{rarityLabel}</span>
            ) : null}
            {item.condition ? (
              <span className={profileBadgeClassName}>{item.condition}</span>
            ) : null}
          </div>
        ) : null}
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
      return "grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4";
    }

    return "grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3";
  }, [mode]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">{items.length} items</p>
        <div
          className="inline-flex rounded-full border border-zinc-200 bg-zinc-50/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/50"
          role="group"
          aria-label="Collection display mode"
        >
          {(["grid", "compact", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateMode(option)}
              className={`min-h-9 rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                mode === option
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
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
