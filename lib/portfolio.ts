import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getItemUniqueKey,
  hasRepresentativeImage,
  isGradedCondition,
  normalizeRarity,
  normalizeSetName,
  percentOf,
  UNKNOWN_SET_LABEL,
} from "@/lib/portfolio-normalize";

/** Minimal row shape for in-memory portfolio aggregation. */
export type PortfolioCollectionRow = {
  id: string;
  item_kind: "card" | "sealed";
  card_name: string;
  card_ref: string;
  set_name: string | null;
  condition: string | null;
  notes: string | null;
  quantity: number;
  tcg_api_card_id: string | null;
  card_number: string | null;
  image_url: string | null;
  sealed_product_type: string | null;
  visibility: "public" | "private";
  is_featured: boolean;
  created_at: string;
};

export type PortfolioTotals = {
  totalItems: number;
  uniqueItems: number;
  totalQuantity: number;
  cards: number;
  sealed: number;
  graded: number;
  publicItems: number;
  privateItems: number;
  featuredItems: number;
  wishlistCount: number;
  activeListingsCount: number;
};

export type PortfolioCategoryBreakdown = {
  id: "cards" | "sealed" | "graded" | "other";
  label: string;
  itemCount: number;
  quantity: number;
  percentage: number;
};

export type PortfolioSetSummary = {
  setName: string;
  uniqueItems: number;
  totalQuantity: number;
  percentage: number;
  representativeItemId: string | null;
  representativeTcgApiCardId: string | null;
  representativeImageUrl: string | null;
};

export type PortfolioRaritySummary = {
  rarity: string;
  itemCount: number;
  quantity: number;
  percentage: number;
};

export type PortfolioItemPreview = {
  id: string;
  card_name: string;
  set_name: string | null;
  quantity: number;
  item_kind: "card" | "sealed";
  visibility: "public" | "private";
  is_featured: boolean;
  created_at: string;
  tcg_api_card_id: string | null;
  image_url: string | null;
};

export type PortfolioHealthSignal = {
  id: string;
  label: string;
  count: number;
  percentage: number;
  actionLabel?: string;
  actionHref?: string;
};

export type PortfolioData = {
  totals: PortfolioTotals;
  categoryBreakdown: PortfolioCategoryBreakdown[];
  topSets: PortfolioSetSummary[];
  allSets: PortfolioSetSummary[];
  allSetsCount: number;
  rarityBreakdown: PortfolioRaritySummary[];
  hasRarityData: boolean;
  recentItems: PortfolioItemPreview[];
  featuredItems: PortfolioItemPreview[];
  collectionHealth: PortfolioHealthSignal[];
  valueExtensionReady: boolean;
};

export const PORTFOLIO_SELECT =
  "id, item_kind, card_name, card_ref, set_name, condition, notes, quantity, tcg_api_card_id, card_number, image_url, sealed_product_type, visibility, is_featured, created_at";

export const PORTFOLIO_TOP_SETS_LIMIT = 8;
export const PORTFOLIO_RECENT_LIMIT = 8;
export const PORTFOLIO_FEATURED_LIMIT = 8;

/**
 * Scaling note: aggregation runs in memory over one lightweight SELECT per owner.
 * Practical for collections up to a few thousand rows. Larger collections may
 * need SQL-side aggregates or materialized summaries later.
 */
export async function loadPortfolioData(
  supabase: SupabaseClient,
  userId: string,
): Promise<PortfolioData> {
  const [
    { data: rows, error },
    { count: wishlistCount },
    { count: activeListingsCount },
  ] = await Promise.all([
    supabase
      .from("collection_items")
      .select(PORTFOLIO_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("wishlist_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  if (error) {
    throw error;
  }

  const items = (rows ?? []) as PortfolioCollectionRow[];
  return buildPortfolioData(items, wishlistCount ?? 0, activeListingsCount ?? 0);
}

export function buildPortfolioData(
  items: PortfolioCollectionRow[],
  wishlistCount: number,
  activeListingsCount: number,
): PortfolioData {
  const totalItems = items.length;
  const uniqueKeys = new Set(items.map(getItemUniqueKey));
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  let cards = 0;
  let sealed = 0;
  let graded = 0;
  let publicItems = 0;
  let featuredItems = 0;

  for (const item of items) {
    if (item.item_kind === "sealed") {
      sealed += 1;
    } else {
      cards += 1;
    }

    if (isGradedCondition(item.condition)) {
      graded += 1;
    }

    if (item.visibility === "public") {
      publicItems += 1;
    }

    if (item.is_featured) {
      featuredItems += 1;
    }
  }

  const privateItems = totalItems - publicItems;
  const nonGradedCards = Math.max(0, cards - graded);

  const categoryBreakdown = [
    {
      id: "cards" as const,
      label: "Cards",
      itemCount: nonGradedCards,
      quantity: sumQuantity(items.filter((item) => item.item_kind === "card" && !isGradedCondition(item.condition))),
      percentage: percentOf(nonGradedCards, totalItems),
    },
    {
      id: "sealed" as const,
      label: "Sealed",
      itemCount: sealed,
      quantity: sumQuantity(items.filter((item) => item.item_kind === "sealed")),
      percentage: percentOf(sealed, totalItems),
    },
    {
      id: "graded" as const,
      label: "Graded",
      itemCount: graded,
      quantity: sumQuantity(items.filter((item) => isGradedCondition(item.condition))),
      percentage: percentOf(graded, totalItems),
    },
  ].filter((entry) => entry.itemCount > 0) satisfies PortfolioCategoryBreakdown[];

  const topSets = buildTopSets(items, totalItems);
  const rarityBreakdown = buildRarityBreakdown(items);
  const collectionHealth = buildCollectionHealth(items, totalItems);

  const recentItems = items.slice(0, PORTFOLIO_RECENT_LIMIT).map(toItemPreview);
  const featuredItemsList = items
    .filter((item) => item.is_featured)
    .slice(0, PORTFOLIO_FEATURED_LIMIT)
    .map(toItemPreview);

  return {
    totals: {
      totalItems,
      uniqueItems: uniqueKeys.size,
      totalQuantity,
      cards,
      sealed,
      graded,
      publicItems,
      privateItems,
      featuredItems,
      wishlistCount,
      activeListingsCount,
    },
    categoryBreakdown,
    topSets: topSets.sets,
    allSets: topSets.all,
    allSetsCount: topSets.allSetsCount,
    rarityBreakdown,
    hasRarityData: rarityBreakdown.length > 0,
    recentItems,
    featuredItems: featuredItemsList,
    collectionHealth,
    valueExtensionReady: false,
  };
}

function sumQuantity(rows: PortfolioCollectionRow[]): number {
  return rows.reduce((sum, row) => sum + row.quantity, 0);
}

function toItemPreview(item: PortfolioCollectionRow): PortfolioItemPreview {
  return {
    id: item.id,
    card_name: item.card_name,
    set_name: item.set_name,
    quantity: item.quantity,
    item_kind: item.item_kind,
    visibility: item.visibility,
    is_featured: item.is_featured,
    created_at: item.created_at,
    tcg_api_card_id: item.tcg_api_card_id,
    image_url: item.image_url,
  };
}

function buildTopSets(items: PortfolioCollectionRow[], totalItems: number) {
  const map = new Map<
    string,
    {
      uniqueKeys: Set<string>;
      quantity: number;
      representative: PortfolioCollectionRow | null;
    }
  >();

  for (const item of items) {
    const setName = normalizeSetName(item.set_name);
    const group = map.get(setName) ?? {
      uniqueKeys: new Set<string>(),
      quantity: 0,
      representative: null,
    };

    group.uniqueKeys.add(getItemUniqueKey(item));
    group.quantity += item.quantity;

    if (
      !group.representative ||
      hasRepresentativeImage(item) && !hasRepresentativeImage(group.representative)
    ) {
      group.representative = item;
    }

    map.set(setName, group);
  }

  const sorted = [...map.entries()]
    .map(([setName, group]) => ({
      setName,
      uniqueItems: group.uniqueKeys.size,
      totalQuantity: group.quantity,
      percentage: percentOf(group.uniqueKeys.size, totalItems),
      representativeItemId: group.representative?.id ?? null,
      representativeTcgApiCardId: group.representative?.tcg_api_card_id ?? null,
      representativeImageUrl: group.representative?.image_url ?? null,
    }))
    .sort((a, b) => {
      if (a.setName === UNKNOWN_SET_LABEL && b.setName !== UNKNOWN_SET_LABEL) {
        return 1;
      }

      if (b.setName === UNKNOWN_SET_LABEL && a.setName !== UNKNOWN_SET_LABEL) {
        return -1;
      }

      return b.uniqueItems - a.uniqueItems || b.totalQuantity - a.totalQuantity;
    });

  return {
    sets: sorted.slice(0, PORTFOLIO_TOP_SETS_LIMIT),
    all: sorted,
    allSetsCount: sorted.length,
  };
}

function buildRarityBreakdown(items: PortfolioCollectionRow[]): PortfolioRaritySummary[] {
  const map = new Map<string, { itemCount: number; quantity: number }>();

  let withRarity = 0;

  for (const item of items) {
    const rarity = normalizeRarity(item.notes, item.condition);

    if (!rarity) {
      continue;
    }

    withRarity += 1;
    const group = map.get(rarity) ?? { itemCount: 0, quantity: 0 };
    group.itemCount += 1;
    group.quantity += item.quantity;
    map.set(rarity, group);
  }

  if (withRarity === 0) {
    return [];
  }

  const withoutRarity = items.length - withRarity;

  if (withoutRarity > 0) {
    map.set("Unknown", {
      itemCount: withoutRarity,
      quantity: sumQuantity(
        items.filter((item) => !normalizeRarity(item.notes, item.condition)),
      ),
    });
  }

  return [...map.entries()]
    .map(([rarity, group]) => ({
      rarity,
      itemCount: group.itemCount,
      quantity: group.quantity,
      percentage: percentOf(group.itemCount, items.length),
    }))
    .sort((a, b) => {
      if (a.rarity === "Unknown") {
        return 1;
      }

      if (b.rarity === "Unknown") {
        return -1;
      }

      return b.itemCount - a.itemCount;
    });
}

function buildCollectionHealth(
  items: PortfolioCollectionRow[],
  totalItems: number,
): PortfolioHealthSignal[] {
  if (totalItems === 0) {
    return [];
  }

  const missingSet = items.filter((item) => !item.set_name?.trim()).length;
  const missingImage = items.filter((item) => !hasRepresentativeImage(item)).length;
  const missingRarity = items.filter(
    (item) => !normalizeRarity(item.notes, item.condition),
  ).length;
  const publicItems = items.filter((item) => item.visibility === "public").length;

  const duplicateGroups = new Map<string, number>();
  for (const item of items) {
    const key = getItemUniqueKey(item);
    duplicateGroups.set(key, (duplicateGroups.get(key) ?? 0) + 1);
  }

  const duplicateItems = [...duplicateGroups.values()].filter((count) => count > 1).length;

  const signals: PortfolioHealthSignal[] = [
    {
      id: "images",
      label: "Items with images",
      count: totalItems - missingImage,
      percentage: percentOf(totalItems - missingImage, totalItems),
    },
    {
      id: "set-info",
      label: "Items with set information",
      count: totalItems - missingSet,
      percentage: percentOf(totalItems - missingSet, totalItems),
    },
    {
      id: "rarity",
      label: "Items with rarity notes",
      count: totalItems - missingRarity,
      percentage: percentOf(totalItems - missingRarity, totalItems),
    },
    {
      id: "public-showcase",
      label: "Items configured for public showcase",
      count: publicItems,
      percentage: percentOf(publicItems, totalItems),
      actionLabel: "Manage visibility",
      actionHref: "/my-collection?view=collection",
    },
  ];

  if (missingSet > 0) {
    signals.push({
      id: "missing-set",
      label: "Items missing set information",
      count: missingSet,
      percentage: percentOf(missingSet, totalItems),
      actionLabel: "Review collection",
      actionHref: "/my-collection?view=collection",
    });
  }

  if (duplicateItems > 0) {
    signals.push({
      id: "duplicates",
      label: "Duplicate entries (same card reference)",
      count: duplicateItems,
      percentage: percentOf(duplicateItems, totalItems),
      actionLabel: "Review collection",
      actionHref: "/my-collection?view=collection",
    });
  }

  return signals;
}

export function collectPortfolioImageIds(data: PortfolioData): string[] {
  const ids = new Set<string>();

  for (const item of [
    ...data.recentItems,
    ...data.featuredItems,
    ...data.topSets,
  ]) {
    if ("tcg_api_card_id" in item && item.tcg_api_card_id) {
      ids.add(item.tcg_api_card_id);
    }

    if ("representativeTcgApiCardId" in item && item.representativeTcgApiCardId) {
      ids.add(item.representativeTcgApiCardId);
    }
  }

  return [...ids];
}

export function getPortfolioItemImageUrl(
  item: PortfolioItemPreview,
  cardImagesById: Map<string, { small: string; large: string }>,
): string | null {
  if (item.image_url) {
    return item.image_url;
  }

  if (item.tcg_api_card_id) {
    return cardImagesById.get(item.tcg_api_card_id)?.small ?? null;
  }

  return null;
}
