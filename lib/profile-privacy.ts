/**
 * Central visibility decisions for profile sections.
 * When database privacy fields are added, only this module should change.
 */

export type ProfileVisibilitySection =
  | "email"
  | "collection"
  | "wishlist"
  | "listings"
  | "stats"
  | "values"
  | "events";

export type ProfileVisibilityContext = {
  viewerId: string | null;
  ownerId: string;
};

export function isOwnProfile(context: ProfileVisibilityContext): boolean {
  return Boolean(context.viewerId && context.viewerId === context.ownerId);
}

/**
 * Returns whether the viewer may see a profile section's full content.
 * Defaults are conservative until dedicated privacy columns exist.
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
      return own;
    case "wishlist":
      return own;
    case "listings":
      return true;
    case "stats":
      return true;
    case "values":
      return own;
    case "events":
      return true;
    default:
      return false;
  }
}

/**
 * Whether aggregate stat counts for a section should be shown.
 * Public profiles may show listing/event counts; collection/wishlist counts stay hidden.
 */
export function canViewProfileStat(
  stat: "collection" | "wishlist" | "listings" | "completedTrades" | "events",
  context: ProfileVisibilityContext,
): boolean {
  const own = isOwnProfile(context);

  switch (stat) {
    case "collection":
    case "wishlist":
      return own;
    case "listings":
    case "completedTrades":
    case "events":
      return true;
    default:
      return false;
  }
}

export function getPrivateSectionMessage(
  section: "collection" | "wishlist",
): string {
  if (section === "collection") {
    return "This collector keeps their collection private.";
  }

  return "This collector keeps their wishlist private.";
}
