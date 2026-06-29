-- My Wishlist (Phase 1): permanent wanted cards, separate from collection.

CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  card_name text NOT NULL,
  card_ref text NOT NULL,
  set_name text,
  language text,
  notes text,
  tcg_api_card_id text,
  card_number text,
  set_id text,
  priority integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_items_priority_range CHECK (priority >= 1 AND priority <= 5)
);

CREATE INDEX wishlist_items_user_id_idx
  ON public.wishlist_items (user_id);

CREATE INDEX wishlist_items_user_id_card_ref_idx
  ON public.wishlist_items (user_id, card_ref);

CREATE INDEX wishlist_items_user_id_tcg_api_card_id_idx
  ON public.wishlist_items (user_id, tcg_api_card_id);

CREATE TRIGGER wishlist_items_set_updated_at
BEFORE UPDATE ON public.wishlist_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own wishlist items"
  ON public.wishlist_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON public.wishlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON public.wishlist_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON public.wishlist_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
