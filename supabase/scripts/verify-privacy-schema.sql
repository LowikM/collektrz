-- Verify Profile Privacy v1 schema (run manually after deploy or in CI against staging/production)
-- Expected: one row per check with ok = true

SELECT
  'users.collection_visibility' AS check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'collection_visibility'
  ) AS ok
UNION ALL
SELECT
  'users.wishlist_visibility',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'wishlist_visibility'
  )
UNION ALL
SELECT
  'users.show_collection_stats',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'show_collection_stats'
  )
UNION ALL
SELECT
  'users.show_portfolio_value',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'show_portfolio_value'
  )
UNION ALL
SELECT
  'collection_items.visibility',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'collection_items' AND column_name = 'visibility'
  )
UNION ALL
SELECT
  'collection_items.is_featured',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'collection_items' AND column_name = 'is_featured'
  )
UNION ALL
SELECT
  'wishlist_items.visibility',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wishlist_items' AND column_name = 'visibility'
  );
