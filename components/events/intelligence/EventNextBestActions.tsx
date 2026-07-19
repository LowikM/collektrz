import Link from "next/link";

import { eventPanelClassName } from "@/components/events/event-styles";
import type { NextBestAction } from "@/lib/event-intelligence";

type EventNextBestActionsProps = {
  actions: NextBestAction[];
};

export function EventNextBestActions({ actions }: EventNextBestActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" aria-label="Suggested next steps">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          For you
        </p>
        <h2 className="text-lg font-semibold tracking-tight">Next best actions</h2>
      </div>

      <ul className="grid gap-3">
        {actions.map((action) => (
          <li key={action.id}>
            <Link
              href={action.href}
              className={`${eventPanelClassName} flex min-h-11 items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700`}
            >
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {action.message}
              </span>
              <span className="shrink-0 text-sm font-semibold text-zinc-500">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
