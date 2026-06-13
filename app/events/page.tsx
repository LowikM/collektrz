import { EventCard, type Event } from "@/components/EventCard";
import { createClient } from "@/lib/supabase/server";

export default async function EventsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, name, location, start_date, end_date")
    .order("start_date", { ascending: true });

  const events = (data ?? []) as Event[];

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Browse upcoming Pokémon trading events.
          </p>
        </div>

        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            Could not load events: {error.message}
          </p>
        ) : events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            No events yet. Check back soon.
          </p>
        ) : (
          <ul className="grid gap-4">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
