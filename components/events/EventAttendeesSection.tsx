import Link from "next/link";

import { CollectorAttendeeCard } from "@/components/events/CollectorAttendeeCard";
import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import {
  ATTENDEE_PREVIEW_LIMIT,
  eventSecondaryButtonClassName,
  VIEW_ALL_ATTENDEES_THRESHOLD,
} from "@/components/events/event-styles";
import type { EventCollectorProfile } from "@/lib/event-experience";

type EventAttendeesSectionProps = {
  eventId: string;
  attendees: EventCollectorProfile[];
  showMatchScore?: boolean;
};

/**
 * "Who's Here" preview on the event page — attending collectors with
 * profile stats and quick chat actions.
 */
export function EventAttendeesSection({
  eventId,
  attendees,
  showMatchScore = false,
}: EventAttendeesSectionProps) {
  const preview = attendees.slice(0, ATTENDEE_PREVIEW_LIMIT);
  const showViewAll = attendees.length > VIEW_ALL_ATTENDEES_THRESHOLD;

  if (attendees.length === 0) {
    return (
      <section className="space-y-4">
        <EventSectionHeader
          eyebrow="Community"
          title="Who's Here"
          description="Collectors who marked themselves as attending this event."
          count={0}
          countLabel="attending"
        />
        <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center">
          <p className="text-sm text-zinc-600">
            No one has marked themselves as attending yet. Toggle &quot;I&apos;m
            attending&quot; above to appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <EventSectionHeader
        eyebrow="Community"
        title="Who's Here"
        description="Collectors who marked themselves as attending this event."
        count={attendees.length}
        countLabel="attending"
        action={
          showViewAll ? (
            <Link
              href={`/events/${eventId}/attendees`}
              className={eventSecondaryButtonClassName}
            >
              View all attendees
            </Link>
          ) : null
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        {preview.map((collector) => (
          <li key={collector.userId}>
            <CollectorAttendeeCard
              collector={collector}
              eventId={eventId}
              showMatchScore={showMatchScore}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
