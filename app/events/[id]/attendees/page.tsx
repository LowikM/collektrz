import Link from "next/link";
import { notFound } from "next/navigation";

import { CollectorAttendeeCard } from "@/components/events/CollectorAttendeeCard";
import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import { eventSecondaryButtonClassName } from "@/components/events/event-styles";
import {
  loadEventAttendees,
  type EventRecord,
} from "@/lib/event-experience";
import { collectTcgApiCardIdsFromResults } from "@/lib/match-score";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";
import { createClient } from "@/lib/supabase/server";

type EventAttendeesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventAttendeesPage({
  params,
}: EventAttendeesPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, location, start_date, end_date, join_code, banner_url")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const eventRecord = event as EventRecord;
  const attendees = await loadEventAttendees(supabase, id, user?.id ?? null);
  const cardImagesById = await getCardImagesByIds(
    collectTcgApiCardIdsFromResults(
      attendees.map((profile) => profile.matchScoreResult),
    ),
  );

  return (
    <div className="flex flex-1 justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl space-y-6">
        <Link
          href={`/events/${id}`}
          className="inline-flex text-sm text-zinc-600 transition-colors hover:text-zinc-900"
        >
          ← Back to {eventRecord.name}
        </Link>

        <EventSectionHeader
          eyebrow="Community"
          title="Who's Here"
          description="All collectors who marked themselves as attending this event."
          count={attendees.length}
          countLabel="attending"
        />

        {attendees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center">
            <p className="text-sm text-zinc-600">
              No attendees yet. Mark yourself as attending on the event page to
              appear here.
            </p>
            <Link
              href={`/events/${id}`}
              className={`${eventSecondaryButtonClassName} mt-4`}
            >
              Go to event
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {attendees.map((collector) => (
              <li key={collector.userId}>
                <CollectorAttendeeCard
                  collector={collector}
                  eventId={id}
                  showMatchScore={Boolean(user)}
                  cardImagesById={cardImagesById}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
