-- Pokémon sealed products MVP: optional product type and image URL on collection items.

ALTER TABLE public.collection_items
  ADD COLUMN IF NOT EXISTS sealed_product_type text,
  ADD COLUMN IF NOT EXISTS image_url text;
