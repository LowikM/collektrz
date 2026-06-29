-- Contact flow MVP: one-way messages between users.

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings (id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_body_not_empty CHECK (char_length(trim(body)) > 0)
);

CREATE INDEX messages_recipient_id_idx
  ON public.messages (recipient_id);

CREATE INDEX messages_sender_id_idx
  ON public.messages (sender_id);

CREATE INDEX messages_listing_id_idx
  ON public.messages (listing_id);

CREATE INDEX messages_created_at_idx
  ON public.messages (created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view messages they sent"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view messages they received"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

GRANT SELECT, INSERT ON public.messages TO authenticated;
