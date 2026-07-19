import Link from "next/link";

import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import {
  eventCardClassName,
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { EventIntelligenceEmptyState } from "@/components/events/intelligence/EventIntelligenceEmptyState";
import { VendorBadge } from "@/components/VendorBadge";
import type { EventCollectorProfile } from "@/lib/event-experience";
import { getTopMatchReasons } from "@/lib/event-intelligence";

type EventPeopleToMeetProps = {
  eventId: string;
  people: EventCollectorProfile[];
  cardImagesById: Map<string, { small: string; large: string }>;
};

function PersonAvatar({ person }: { person: EventCollectorProfile }) {
  if (person.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.avatarUrl}
        alt=""
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {person.displayName.charAt(0).toUpperCase()}
    </div>
  );
}

export function EventPeopleToMeet({
  eventId,
  people,
}: EventPeopleToMeetProps) {
  return (
    <section className="space-y-4">
      <EventSectionHeader
        eyebrow="Social"
        title="People to meet"
        description="Top collector matches ranked by Match Score, check-in status, and event overlap."
        count={people.length}
        countLabel="recommended"
        action={
          <Link
            href={`/events/${eventId}/attendees`}
            className={eventSecondaryButtonClassName}
          >
            View all
          </Link>
        }
      />

      {people.length === 0 ? (
        <EventIntelligenceEmptyState
          icon="🤝"
          title="No strong matches yet"
          description="Activate your wishlist, add listings, and mark yourself attending to improve recommendations."
          actionLabel="Activate wishlist"
          actionHref={`/events/${eventId}/activate-wishlist`}
          secondaryActionLabel="Add listing"
          secondaryActionHref={`/events/${eventId}/new-listing`}
        />
      ) : (
        <ul
          className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-2 lg:overflow-visible"
          aria-label="Recommended collectors to meet"
        >
          {people.map((person) => {
            const result = person.matchScoreResult;
            const reasons = result ? getTopMatchReasons(result, 2) : [];

            return (
              <li
                key={person.userId}
                className={`${eventCardClassName} min-w-[min(88vw,360px)] shrink-0 snap-start lg:min-w-0`}
              >
                <div className="flex gap-3">
                  <PersonAvatar person={person} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{person.displayName}</h3>
                      {result ? (
                        <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                          {result.score}% · {result.label}
                        </span>
                      ) : null}
                      {result?.isMutual ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                          <span aria-hidden="true">↔ </span>
                          Mutual
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <span aria-hidden="true">→ </span>
                          One-way
                        </span>
                      )}
                      {person.isCurrentlyAtEvent ? (
                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                          <span aria-hidden="true">● </span>
                          Checked in
                        </span>
                      ) : null}
                      {person.isVendor && person.vendorStandNumber ? (
                        <VendorBadge standNumber={person.vendorStandNumber} />
                      ) : null}
                    </div>

                    {reasons.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {reasons.map((reason) => (
                          <li key={reason}>• {reason}</li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/messages?with=${person.userId}`}
                        className={`${eventPrimaryButtonClassName} min-h-11 px-4 py-2.5`}
                        aria-label={`Chat with ${person.displayName}`}
                      >
                        Chat
                      </Link>
                      <Link
                        href={`/users/${person.userId}?event=${eventId}`}
                        className={`${eventSecondaryButtonClassName} min-h-11 px-4 py-2.5`}
                        aria-label={`View ${person.displayName} profile`}
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
