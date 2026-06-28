-- Optional Pokémon TCG API metadata for collection items and listings.
-- Snapshotted on listings; no image URLs stored (images come from API when needed).

ALTER TABLE public.collection_items
  ADD COLUMN tcg_api_card_id text,
  ADD COLUMN card_number text,
  ADD COLUMN set_id text;

ALTER TABLE public.listings
  ADD COLUMN tcg_api_card_id text,
  ADD COLUMN card_number text,
  ADD COLUMN set_id text;
