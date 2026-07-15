import { updateEventPresence } from "@/app/events/[id]/actions";
import type { EventPresence } from "@/lib/event-experience";

type EventPresenceControlsProps = {
  eventId: string;
  presence: EventPresence;
};

const buttonClassName =
  "rounded-xl border px-4 py-2 text-sm font-medium transition-colors";

export function EventPresenceControls({
  eventId,
  presence,
}: EventPresenceControlsProps) {
  const updatePresence = updateEventPresence.bind(null, eventId);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Your presence</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Let other collectors know your plans. Live check-in sync comes in a
            later phase.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={updatePresence}>
            <input type="hidden" name="presence_action" value="attending" />
            <input
              type="hidden"
              name="is_attending"
              value={presence.isAttending ? "false" : "true"}
            />
            <button
              type="submit"
              className={`${buttonClassName} ${
                presence.isAttending
                  ? "border-foreground bg-foreground text-background"
                  : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              }`}
            >
              {presence.isAttending ? "Attending ✓" : "Mark attending"}
            </button>
          </form>

          <form action={updatePresence}>
            <input type="hidden" name="presence_action" value="currently_at" />
            <input
              type="hidden"
              name="is_currently_at_event"
              value={presence.isCurrentlyAtEvent ? "false" : "true"}
            />
            <button
              type="submit"
              disabled={!presence.isAttending && !presence.isCurrentlyAtEvent}
              className={`${buttonClassName} ${
                presence.isCurrentlyAtEvent
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-300 bg-white hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              }`}
            >
              {presence.isCurrentlyAtEvent ? "Here now ✓" : "Check in here"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
