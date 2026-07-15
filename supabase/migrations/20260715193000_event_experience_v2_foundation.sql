-- Event Experience v2 (Phase 1) — banner, vendors, visitor presence.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS banner_url text;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_vendor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vendor_stand_number text;

CREATE TABLE IF NOT EXISTS public.event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  is_attending boolean NOT NULL DEFAULT true,
  is_currently_at_event boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_attendees_event_id_idx
  ON public.event_attendees (event_id);

CREATE INDEX IF NOT EXISTS event_attendees_user_id_idx
  ON public.event_attendees (user_id);

CREATE INDEX IF NOT EXISTS event_attendees_currently_at_idx
  ON public.event_attendees (event_id, is_currently_at_event)
  WHERE is_currently_at_event = true;

CREATE TRIGGER event_attendees_set_updated_at
BEFORE UPDATE ON public.event_attendees
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event attendance"
  ON public.event_attendees
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own attendance"
  ON public.event_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
  ON public.event_attendees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.event_attendees TO anon, authenticated;
GRANT INSERT, UPDATE ON public.event_attendees TO authenticated;
