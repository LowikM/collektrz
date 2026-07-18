-- Profile Privacy v1
-- Adds profile-level and item-level visibility controls with secure RLS.
--
-- Safety: all new columns default to private/false in the same transaction
-- as policy updates, so existing rows are never exposed.
--
-- Rollback (manual, in reverse order):
--   REVOKE SELECT ON public.collection_items, public.wishlist_items FROM anon;
--   DROP POLICY "Public collection items are viewable when owner shares collection" ON public.collection_items;
--   DROP POLICY "Public wishlist items are viewable when owner shares wishlist" ON public.wishlist_items;
--   CREATE POLICY owner-only SELECT policies (see 20260613120000 / 20260628180000);
--   DROP INDEXes added here;
--   ALTER TABLE public.collection_items DROP COLUMN visibility, DROP COLUMN is_featured;
--   ALTER TABLE public.wishlist_items DROP COLUMN visibility;
--   ALTER TABLE public.users DROP COLUMN collection_visibility, DROP COLUMN wishlist_visibility,
--     DROP COLUMN show_collection_stats, DROP COLUMN show_portfolio_value;
--   DROP TYPE public.profile_item_visibility;
--   DROP TYPE public.profile_section_visibility;

BEGIN;

CREATE TYPE public.profile_section_visibility AS ENUM ('public', 'private');
CREATE TYPE public.profile_item_visibility AS ENUM ('public', 'private');

ALTER TABLE public.users
  ADD COLUMN collection_visibility public.profile_section_visibility NOT NULL DEFAULT 'private',
  ADD COLUMN wishlist_visibility public.profile_section_visibility NOT NULL DEFAULT 'private',
  ADD COLUMN show_collection_stats boolean NOT NULL DEFAULT true,
  ADD COLUMN show_portfolio_value boolean NOT NULL DEFAULT false;

ALTER TABLE public.collection_items
  ADD COLUMN visibility public.profile_item_visibility NOT NULL DEFAULT 'private',
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.wishlist_items
  ADD COLUMN visibility public.profile_item_visibility NOT NULL DEFAULT 'private';

CREATE INDEX collection_items_public_profile_idx
  ON public.collection_items (user_id, visibility, is_featured, created_at DESC)
  WHERE visibility = 'public';

CREATE INDEX collection_items_featured_idx
  ON public.collection_items (user_id, is_featured, created_at DESC)
  WHERE is_featured = true;

CREATE INDEX wishlist_items_public_profile_idx
  ON public.wishlist_items (user_id, visibility, created_at DESC)
  WHERE visibility = 'public';

DROP POLICY IF EXISTS "Users can select their own collection items"
  ON public.collection_items;

CREATE POLICY "Users can select their own collection items"
  ON public.collection_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

COMMIT;
