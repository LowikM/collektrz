import Link from "next/link";

import type { EventRecord, EventStats } from "@/lib/event-experience";
import { eventStatCardClassName } from "@/components/events/event-styles";

type EventHeroProps = {
  event: EventRecord;
  stats: EventStats;
};

function formatEventDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const end = new Date(endDate).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (startDate.slice(0, 10) === endDate.slice(0, 10)) {
    return end;
  }

  return `${start} – ${end}`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className={eventStatCardClassName}>
      <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/80">
        {label}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] leading-snug text-white/55">{hint}</p>
      ) : null}
    </div>
  );
}

export function EventHero({ event, stats }: EventHeroProps) {
  const dateLabel = formatEventDateRange(event.start_date, event.end_date);

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 shadow-md">
      <div className="relative min-h-60 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700">
        {event.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- optional external event banner URL
          <img
            src={event.banner_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />

        <div className="relative flex min-h-60 flex-col justify-end p-6 sm:p-8">
          <Link
            href="/events"
            className="mb-4 inline-flex w-fit text-sm text-white/75 transition-colors hover:text-white"
          >
            ← All events
          </Link>

          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
              Collector Event
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {event.name}
            </h1>
            <p className="text-sm text-white/80 sm:text-base">
              {dateLabel} · {event.location}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Attendees"
              value={stats.attendeeCount}
              hint={
                stats.attendeeCountIsEstimated
                  ? "Estimated from listings"
                  : undefined
              }
            />
            <StatCard label="Listings" value={stats.listingCount} />
            <StatCard label="Wishlists" value={stats.wishlistCount} />
            <StatCard label="Vendors" value={stats.vendorCount} />
            <StatCard
              label="Checked in"
              value={stats.currentlyAtEventCount}
              hint="On the floor now"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
