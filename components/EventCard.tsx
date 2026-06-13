import Link from "next/link";

export type Event = {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
};

type EventCardProps = {
  event: Event;
};

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatEventDates(startDate: string, endDate: string) {
  const start = formatEventDate(startDate);
  const end = formatEventDate(endDate);

  if (start === end) {
    return start;
  }

  return `${start} – ${end}`;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            <Link href={`/events/${event.id}`} className="hover:underline">
              {event.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {formatEventDates(event.start_date, event.end_date)} ·{" "}
            {event.location}
          </p>
        </div>

        <Link
          href={`/events/${event.id}`}
          className="inline-block text-sm font-medium hover:underline"
        >
          View event →
        </Link>
      </div>
    </article>
  );
}
