import { MatchScoreCard } from "@/components/matches/MatchScoreCard";
import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import type { EventCollectorProfile } from "@/lib/event-experience";

type EventSocialSectionProps = {
  eventId: string;
  recommendations: EventCollectorProfile[];
  cardImagesById?: Map<string, { small: string; large: string }>;
};

/**
 * "Collectors you should meet" — ranked by centralized Match Score.
 */
export function EventSocialSection({
  eventId,
  recommendations,
  cardImagesById = new Map(),
}: EventSocialSectionProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <EventSectionHeader
        eyebrow="Social"
        title="Collectors you should meet"
        description="Ranked by Match Score — shared wishlists, listings, and event relevance."
      />

      <ul className="grid gap-4 lg:grid-cols-2">
        {recommendations.map((collector) =>
          collector.matchScoreResult ? (
            <li key={collector.userId}>
              <MatchScoreCard
                result={collector.matchScoreResult}
                otherUserId={collector.userId}
                otherUserName={collector.displayName}
                eventId={eventId}
                cardImagesById={cardImagesById}
              />
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
