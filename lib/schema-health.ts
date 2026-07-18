/**
 * Privacy schema health check — run during deployment or CI, not per user request.
 *
 * Apply with: psql $DATABASE_URL -f supabase/scripts/verify-privacy-schema.sql
 * Or paste VERIFY_PRIVACY_SCHEMA_QUERY into the Supabase SQL editor.
 */

export const PRIVACY_SCHEMA_COLUMNS = {
  users: [
    "collection_visibility",
    "wishlist_visibility",
    "show_collection_stats",
    "show_portfolio_value",
  ],
  collection_items: ["visibility", "is_featured"],
  wishlist_items: ["visibility"],
} as const;

/** Single query: returns one row per missing column (empty = healthy). */
export const VERIFY_PRIVACY_SCHEMA_QUERY = `
SELECT table_name, column_name, 'missing' AS status
FROM (
  VALUES
    ('users', 'collection_visibility'),
    ('users', 'wishlist_visibility'),
    ('users', 'show_collection_stats'),
    ('users', 'show_portfolio_value'),
    ('collection_items', 'visibility'),
    ('collection_items', 'is_featured'),
    ('wishlist_items', 'visibility')
) AS required(table_name, column_name)
WHERE NOT EXISTS (
  SELECT 1
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = required.table_name
    AND c.column_name = required.column_name
)
ORDER BY table_name, column_name;
`;

export type PrivacySchemaHealthResult = {
  healthy: boolean;
  missing: Array<{ table_name: string; column_name: string }>;
};
