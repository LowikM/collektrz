import Link from "next/link";

import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import type { ProfilePageData } from "@/lib/profile";

type ProfileEventsTabProps = {
  data: ProfilePageData;
};

export function ProfileEventsTab({ data }: ProfileEventsTabProps) {
  return (
    <div className="space-y-4">
      <ProfileSectionHeader
        title="Events attended"
        description="Trading events this collector has joined."
      />

      {data.eventActivities.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.eventActivities.map((event) => (
            <li key={event.eventId}>
              <Link
                href={`/events/${event.eventId}`}
                className={`block ${profilePanelClassName} transition-colors hover:border-zinc-300`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{event.eventName}</p>
                    <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
                    <p className="mt-2 text-xs text-zinc-400">
                      {new Date(event.startDate).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {event.isCurrentlyAtEvent ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Here now
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ProfileEmptyState
          title="No events yet"
          description="Join an event to meet collectors and build your trading network."
          actionLabel="Browse events"
          actionHref="/events"
          icon="📍"
        />
      )}
    </div>
  );
}
