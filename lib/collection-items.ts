import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCollectionItemImageUrlsByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const imageUrlsById = new Map<string, string>();

  if (uniqueIds.length === 0) {
    return imageUrlsById;
  }

  const { data } = await supabase
    .from("collection_items")
    .select("id, image_url")
    .in("id", uniqueIds);

  for (const row of data ?? []) {
    if (row.image_url) {
      imageUrlsById.set(row.id, row.image_url);
    }
  }

  return imageUrlsById;
}

export function getListingThumbnailUrl(
  listing: {
    tcg_api_card_id: string | null;
    collection_item_id?: string | null;
  },
  cardImagesById: Map<string, { small: string; large: string }>,
  collectionItemImagesById: Map<string, string>,
): string | null {
  if (listing.tcg_api_card_id) {
    return cardImagesById.get(listing.tcg_api_card_id)?.small ?? null;
  }

  if (listing.collection_item_id) {
    return collectionItemImagesById.get(listing.collection_item_id) ?? null;
  }

  return null;
}
