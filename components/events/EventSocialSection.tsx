import { CollectorAttendeeCard } from "@/components/events/CollectorAttendeeCard";
import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import type { EventCollectorProfile } from "@/lib/event-experience";

type EventSocialSectionProps = {
  eventId: string;
  recommendations: EventCollectorProfile[];
};

/**
 * "Collectors you should meet" — simple interest/activity ranking today,
 * ready for Match Score in a future sprint.
 */
export function EventSocialSection({
  eventId,
  recommendations,
}: EventSocialSectionProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <EventSectionHeader
        eyebrow="Social"
        title="Collectors you should meet"
        description="Suggested based on shared interests, active listings, and wishlists at this event."
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((collector) => (
          <li key={collector.userId}>
            <CollectorAttendeeCard
              collector={collector}
              eventId={eventId}
              showMatchScore
              compact
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
