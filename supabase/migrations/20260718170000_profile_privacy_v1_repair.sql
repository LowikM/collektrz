-- Profile Privacy v1 — idempotent repair migration
--
-- Use when production is missing columns from 20260718160000_profile_privacy_v1.sql
-- (migration not applied, wrong project, or partial failure).
--
-- Safe to run multiple times. Preserves existing data; new columns default private/false.
--
-- After applying, reload PostgREST schema cache:
--   NOTIFY pgrst, 'reload schema';
-- Or restart Supabase API / run supabase db push on the correct project.

BEGIN;

DO $$
BEGIN
  CREATE TYPE public.profile_section_visibility AS ENUM ('public', 'private');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.profile_item_visibility AS ENUM ('public', 'private');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS collection_visibility public.profile_section_visibility,
  ADD COLUMN IF NOT EXISTS wishlist_visibility public.profile_section_visibility,
  ADD COLUMN IF NOT EXISTS show_collection_stats boolean,
  ADD COLUMN IF NOT EXISTS show_portfolio_value boolean;

UPDATE public.users
SET
  collection_visibility = COALESCE(collection_visibility, 'private'::public.profile_section_visibility),
  wishlist_visibility = COALESCE(wishlist_visibility, 'private'::public.profile_section_visibility),
  show_collection_stats = COALESCE(show_collection_stats, true),
  show_portfolio_value = COALESCE(show_portfolio_value, false)
WHERE
  collection_visibility IS NULL
  OR wishlist_visibility IS NULL
  OR show_collection_stats IS NULL
  OR show_portfolio_value IS NULL;

ALTER TABLE public.users
  ALTER COLUMN collection_visibility SET DEFAULT 'private'::public.profile_section_visibility,
  ALTER COLUMN wishlist_visibility SET DEFAULT 'private'::public.profile_section_visibility,
  ALTER COLUMN show_collection_stats SET DEFAULT true,
  ALTER COLUMN show_portfolio_value SET DEFAULT false;

ALTER TABLE public.users
  ALTER COLUMN collection_visibility SET NOT NULL,
  ALTER COLUMN wishlist_visibility SET NOT NULL,
  ALTER COLUMN show_collection_stats SET NOT NULL,
  ALTER COLUMN show_portfolio_value SET NOT NULL;

ALTER TABLE public.collection_items
  ADD COLUMN IF NOT EXISTS visibility public.profile_item_visibility,
  ADD COLUMN IF NOT EXISTS is_featured boolean;

UPDATE public.collection_items
SET
  visibility = COALESCE(visibility, 'private'::public.profile_item_visibility),
  is_featured = COALESCE(is_featured, false)
WHERE visibility IS NULL OR is_featured IS NULL;

ALTER TABLE public.collection_items
  ALTER COLUMN visibility SET DEFAULT 'private'::public.profile_item_visibility,
  ALTER COLUMN is_featured SET DEFAULT false;

ALTER TABLE public.collection_items
  ALTER COLUMN visibility SET NOT NULL,
  ALTER COLUMN is_featured SET NOT NULL;

ALTER TABLE public.wishlist_items
  ADD COLUMN IF NOT EXISTS visibility public.profile_item_visibility;

UPDATE public.wishlist_items
SET visibility = COALESCE(visibility, 'private'::public.profile_item_visibility)
WHERE visibility IS NULL;

ALTER TABLE public.wishlist_items
  ALTER COLUMN visibility SET DEFAULT 'private'::public.profile_item_visibility;

ALTER TABLE public.wishlist_items
  ALTER COLUMN visibility SET NOT NULL;

CREATE INDEX IF NOT EXISTS collection_items_public_profile_idx
  ON public.collection_items (user_id, visibility, is_featured, created_at DESC)
  WHERE visibility = 'public'::public.profile_item_visibility;

CREATE INDEX IF NOT EXISTS collection_items_featured_idx
  ON public.collection_items (user_id, is_featured, created_at DESC)
  WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS wishlist_items_public_profile_idx
  ON public.wishlist_items (user_id, visibility, created_at DESC)
  WHERE visibility = 'public'::public.profile_item_visibility;

DROP POLICY IF EXISTS "Users can select their own collection items"
  ON public.collection_items;

CREATE POLICY "Users can select their own collection items"
  ON public.collection_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public collection items are viewable when owner shares collection"
  ON public.collection_items;

CREATE POLICY "Public collection items are viewable when owner shares collection"
  ON public.collection_items
  FOR SELECT
  TO anon, authenticated
  USING (
    visibility = 'public'::public.profile_item_visibility
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = collection_items.user_id
        AND u.collection_visibility = 'public'::public.profile_section_visibility
    )
  );

DROP POLICY IF EXISTS "Users can select their own wishlist items"
  ON public.wishlist_items;

CREATE POLICY "Users can select their own wishlist items"
  ON public.wishlist_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public wishlist items are viewable when owner shares wishlist"
  ON public.wishlist_items;

CREATE POLICY "Public wishlist items are viewable when owner shares wishlist"
  ON public.wishlist_items
  FOR SELECT
  TO anon, authenticated
  USING (
    visibility = 'public'::public.profile_item_visibility
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = wishlist_items.user_id
        AND u.wishlist_visibility = 'public'::public.profile_section_visibility
    )
  );

GRANT SELECT ON public.collection_items TO anon;
GRANT SELECT ON public.wishlist_items TO anon;

NOTIFY pgrst, 'reload schema';

COMMIT;
