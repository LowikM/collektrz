-- Message replies and read state.

ALTER TABLE public.messages
  ADD COLUMN read_at timestamptz,
  ADD COLUMN parent_message_id uuid REFERENCES public.messages (id) ON DELETE SET NULL;

CREATE INDEX messages_parent_message_id_idx
  ON public.messages (parent_message_id);

CREATE INDEX messages_unread_recipient_idx
  ON public.messages (recipient_id, read_at)
  WHERE read_at IS NULL;

CREATE POLICY "Recipients can mark messages read"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

GRANT UPDATE ON public.messages TO authenticated;
