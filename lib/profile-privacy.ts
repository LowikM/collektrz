/**
 * Central visibility decisions for profile sections and items.
 * Database RLS enforces row access; this module drives UI and query intent.
 */

import type { ItemVisibility, SectionVisibility } from "@/lib/item-visibility";

export type ProfileVisibilitySection =
  | "email"
  | "collection"
  | "wishlist"
  | "listings"
  | "stats"
  | "values"
  | "events";

export type ProfilePrivacySettings = {
  collection_visibility: SectionVisibility;
  wishlist_visibility: SectionVisibility;
  show_collection_stats: boolean;
  show_portfolio_value: boolean;
};

export const DEFAULT_PROFILE_PRIVACY_SETTINGS: ProfilePrivacySettings = {
  collection_visibility: "private",
  wishlist_visibility: "private",
  show_collection_stats: true,
  show_portfolio_value: false,
};

export type ProfileVisibilityContext = {
  viewerId: string | null;
  ownerId: string;
  settings: ProfilePrivacySettings;
};

export type ProfileSectionAccessState =
  | "private"
  | "empty"
  | "no_public_items"
  | "visible";

export function isOwnProfile(context: ProfileVisibilityContext): boolean {
  return Boolean(context.viewerId && context.viewerId === context.ownerId);
}

export function isCollectionShared(settings: ProfilePrivacySettings): boolean {
  return settings.collection_visibility === "public";
}

export function isWishlistShared(settings: ProfilePrivacySettings): boolean {
  return settings.wishlist_visibility === "public";
}

/**
 * Whether the viewer may open a profile section tab.
 * Public sections are browsable even when no public items exist yet.
 */
export function canViewProfileSection(
  section: ProfileVisibilitySection,
  context: ProfileVisibilityContext,
): boolean {
  const own = isOwnProfile(context);

  switch (section) {
    case "email":
      return own;
    case "collection":
      return own || isCollectionShared(context.settings);
    case "wishlist":
      return own || isWishlistShared(context.settings);
    case "listings":
      return true;
    case "stats":
      return true;
    case "values":
      return own || context.settings.show_portfolio_value;
    case "events":
      return true;
    default:
      return false;
  }
}

/**
 * Whether aggregate stat counts for a section should be shown on the profile.
 */
export function canViewProfileStat(
  stat: "collection" | "wishlist" | "listings" | "completedTrades" | "events",
  context: ProfileVisibilityContext,
): boolean {
  const own = isOwnProfile(context);

  if (own) {
    return true;
  }

  switch (stat) {
    case "collection":
      return (
        isCollectionShared(context.settings) &&
        context.settings.show_collection_stats
      );
    case "wishlist":
      return (
        isWishlistShared(context.settings) &&
        context.settings.show_collection_stats
      );
    case "listings":
    case "completedTrades":
    case "events":
      return true;
    default:
      return false;
  }
}

export function canViewPortfolioValue(context: ProfileVisibilityContext): boolean {
  if (isOwnProfile(context)) {
    return true;
  }

  return context.settings.show_portfolio_value;
}

export function isPublicItemVisibleOnProfile(
  itemVisibility: ItemVisibility,
  sectionVisibility: SectionVisibility,
): boolean {
  return sectionVisibility === "public" && itemVisibility === "public";
}

export function canFeatureItemOnProfile(
  itemVisibility: ItemVisibility,
  sectionVisibility: SectionVisibility,
): boolean {
  return isPublicItemVisibleOnProfile(itemVisibility, sectionVisibility);
}

export function getCollectionSectionState(
  context: ProfileVisibilityContext,
  options: {
    totalItemsForViewer: number;
    isOwner: boolean;
  },
): ProfileSectionAccessState {
  if (!canViewProfileSection("collection", context)) {
    return "private";
  }

  if (options.totalItemsForViewer === 0) {
    if (options.isOwner) {
      return "empty";
    }

    return "no_public_items";
  }

  return "visible";
}

export function getWishlistSectionState(
  context: ProfileVisibilityContext,
  options: {
    totalItemsForViewer: number;
    isOwner: boolean;
  },
): ProfileSectionAccessState {
  if (!canViewProfileSection("wishlist", context)) {
    return "private";
  }

  if (options.totalItemsForViewer === 0) {
    if (options.isOwner) {
      return "empty";
    }

    return "no_public_items";
  }

  return "visible";
}

export function getFeaturedSectionState(
  context: ProfileVisibilityContext,
  featuredCount: number,
): ProfileSectionAccessState {
  if (!canViewProfileSection("collection", context)) {
    return "private";
  }

  if (featuredCount === 0) {
    return isOwnProfile(context) ? "empty" : "no_public_items";
  }

  return "visible";
}

export function getPrivateSectionMessage(
  section: "collection" | "wishlist",
): string {
  if (section === "collection") {
    return "This collector keeps their collection private.";
  }

  return "This collector keeps their wishlist private.";
}

export function getNoPublicItemsMessage(section: "collection" | "wishlist"): string {
  if (section === "collection") {
    return "This collector has not shared any public collection items yet.";
  }

  return "This collector has not shared any public wishlist items yet.";
}

export function getEmptySectionMessage(section: "collection" | "wishlist"): string {
  if (section === "collection") {
    return "Start building your collection to create a public showcase.";
  }

  return "Add cards to your wishlist to share what you are looking for.";
}

export function getNoFeaturedMessage(isOwner: boolean): string {
  if (isOwner) {
    return "Feature public collection items to highlight them on your profile.";
  }

  return "This collector has not featured any public cards yet.";
}
