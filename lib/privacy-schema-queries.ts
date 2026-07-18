import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getUserFacingLoadError,
  isMissingColumnError,
  logDatabaseError,
  SCHEMA_DRIFT_BANNER,
} from "@/lib/db-errors";
import {
  DEFAULT_PROFILE_PRIVACY_SETTINGS,
  type ProfilePrivacySettings,
} from "@/lib/profile-privacy";

export const USER_PROFILE_PRIVACY_SELECT =
  "collection_visibility, wishlist_visibility, show_collection_stats, show_portfolio_value";

export const USER_PROFILE_BASE_SELECT =
  "id, email, display_name, bio, location, favorite_pokemon, avatar_url, created_at";

export const COLLECTION_ITEM_PRIVACY_SELECT = "visibility, is_featured";

export const COLLECTION_ITEM_BASE_SELECT =
  "id, item_kind, card_name, card_ref, set_name, condition, notes, language, tcg_api_card_id, card_number, set_id, quantity, sealed_product_type, image_url, created_at, updated_at";

export const WISHLIST_ITEM_PRIVACY_SELECT = "visibility";

export const WISHLIST_ITEM_BASE_SELECT =
  "id, card_name, card_ref, set_name, language, notes, tcg_api_card_id, card_number, set_id, priority, created_at, updated_at";

export type SchemaAwareLoadResult<T> = {
  data: T;
  error: string | null;
  schemaDrift: boolean;
  userMessage: string | null;
};

/** Safe private defaults when privacy columns are unavailable — never public. */
export function privateCollectionItemDefaults() {
  return {
    visibility: "private" as const,
    is_featured: false,
  };
}

export function privateWishlistItemDefaults() {
  return {
    visibility: "private" as const,
  };
}

export function getPrivacySettingsFallback(): ProfilePrivacySettings {
  return { ...DEFAULT_PROFILE_PRIVACY_SETTINGS };
}

export async function loadUserPrivacySettings(
  supabase: SupabaseClient,
  userId: string,
): Promise<SchemaAwareLoadResult<ProfilePrivacySettings>> {
  const { data, error } = await supabase
    .from("users")
    .select(USER_PROFILE_PRIVACY_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (!error && data) {
    return {
      data: {
        collection_visibility:
          data.collection_visibility ??
          DEFAULT_PROFILE_PRIVACY_SETTINGS.collection_visibility,
        wishlist_visibility:
          data.wishlist_visibility ??
          DEFAULT_PROFILE_PRIVACY_SETTINGS.wishlist_visibility,
        show_collection_stats:
          data.show_collection_stats ??
          DEFAULT_PROFILE_PRIVACY_SETTINGS.show_collection_stats,
        show_portfolio_value:
          data.show_portfolio_value ??
          DEFAULT_PROFILE_PRIVACY_SETTINGS.show_portfolio_value,
      },
      error: null,
      schemaDrift: false,
      userMessage: null,
    };
  }

  if (error && isMissingColumnError(error)) {
    logDatabaseError("users.privacy-settings", error, { userId });
    return {
      data: getPrivacySettingsFallback(),
      error: error.message,
      schemaDrift: true,
      userMessage: SCHEMA_DRIFT_BANNER,
    };
  }

  if (error) {
    logDatabaseError("users.privacy-settings", error, { userId });
    return {
      data: getPrivacySettingsFallback(),
      error: error.message,
      schemaDrift: false,
      userMessage: getUserFacingLoadError("profile", error),
    };
  }

  return {
    data: getPrivacySettingsFallback(),
    error: null,
    schemaDrift: false,
    userMessage: null,
  };
}

export function applyCollectionPrivacyDefaults<T extends Record<string, unknown>>(
  rows: T[],
): Array<T & { visibility: "private"; is_featured: boolean }> {
  return rows.map((row) => ({
    ...row,
    ...privateCollectionItemDefaults(),
  }));
}

export function applyWishlistPrivacyDefaults<T extends Record<string, unknown>>(
  rows: T[],
): Array<T & { visibility: "private" }> {
  return rows.map((row) => ({
    ...row,
    ...privateWishlistItemDefaults(),
  }));
}

export async function loadOwnerCollectionItems<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  userId: string,
): Promise<SchemaAwareLoadResult<T[]>> {
  const fullSelect = `${COLLECTION_ITEM_BASE_SELECT}, ${COLLECTION_ITEM_PRIVACY_SELECT}`;
  const full = await supabase
    .from("collection_items")
    .select(fullSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!full.error) {
    return {
      data: (full.data ?? []) as T[],
      error: null,
      schemaDrift: false,
      userMessage: null,
    };
  }

  if (isMissingColumnError(full.error)) {
    logDatabaseError("collection_items.owner-list", full.error, { userId });

    const legacy = await supabase
      .from("collection_items")
      .select(COLLECTION_ITEM_BASE_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (legacy.error) {
      logDatabaseError("collection_items.owner-list-legacy", legacy.error, {
        userId,
      });
      return {
        data: [],
        error: legacy.error.message,
        schemaDrift: true,
        userMessage: getUserFacingLoadError("collection", legacy.error),
      };
    }

    return {
      data: applyCollectionPrivacyDefaults(legacy.data ?? []) as T[],
      error: full.error.message,
      schemaDrift: true,
      userMessage: SCHEMA_DRIFT_BANNER,
    };
  }

  logDatabaseError("collection_items.owner-list", full.error, { userId });
  return {
    data: [],
    error: full.error.message,
    schemaDrift: false,
    userMessage: getUserFacingLoadError("collection", full.error),
  };
}

export async function loadOwnerWishlistItems<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  userId: string,
): Promise<SchemaAwareLoadResult<T[]>> {
  const fullSelect = `${WISHLIST_ITEM_BASE_SELECT}, ${WISHLIST_ITEM_PRIVACY_SELECT}`;
  const full = await supabase
    .from("wishlist_items")
    .select(fullSelect)
    .eq("user_id", userId)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (!full.error) {
    return {
      data: (full.data ?? []) as T[],
      error: null,
      schemaDrift: false,
      userMessage: null,
    };
  }

  if (isMissingColumnError(full.error)) {
    logDatabaseError("wishlist_items.owner-list", full.error, { userId });

    const legacy = await supabase
      .from("wishlist_items")
      .select(WISHLIST_ITEM_BASE_SELECT)
      .eq("user_id", userId)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (legacy.error) {
      logDatabaseError("wishlist_items.owner-list-legacy", legacy.error, {
        userId,
      });
      return {
        data: [],
        error: legacy.error.message,
        schemaDrift: true,
        userMessage: getUserFacingLoadError("wishlist", legacy.error),
      };
    }

    return {
      data: applyWishlistPrivacyDefaults(legacy.data ?? []) as T[],
      error: full.error.message,
      schemaDrift: true,
      userMessage: SCHEMA_DRIFT_BANNER,
    };
  }

  logDatabaseError("wishlist_items.owner-list", full.error, { userId });
  return {
    data: [],
    error: full.error.message,
    schemaDrift: false,
    userMessage: getUserFacingLoadError("wishlist", full.error),
  };
}

export { SCHEMA_DRIFT_BANNER };
