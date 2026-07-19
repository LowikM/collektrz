import Link from "next/link";

import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import {
  eventCardClassName,
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { EventIntelligenceEmptyState } from "@/components/events/intelligence/EventIntelligenceEmptyState";
import type { OfferableItem } from "@/lib/event-intelligence";

type EventItemsYouCanOfferProps = {
  eventId: string;
  items: OfferableItem[];
};

export function EventItemsYouCanOffer({
  eventId,
  items,
}: EventItemsYouCanOfferProps) {
  return (
    <section id="event-items-you-can-offer" className="space-y-4 scroll-mt-24">
      <EventSectionHeader
        eyebrow="Your inventory"
        title="You may have what others want"
        description="Cards from your collection or listings that match what other attendees are looking for. Based on public wants and Match Score signals only."
        count={items.length}
        countLabel="opportunities"
      />

      {items.length === 0 ? (
        <EventIntelligenceEmptyState
          icon="📤"
          title="No offer opportunities yet"
          description="Add collection cards or create listings, then activate your wishlist so Match Score can find overlap with other collectors."
          actionLabel="Add listing"
          actionHref={`/events/${eventId}/new-listing`}
          secondaryActionLabel="My collection"
          secondaryActionHref="/my-collection"
        />
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.cardKey} className={eventCardClassName}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{item.cardName}</h3>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.source}
                    </span>
                    {item.hasActiveListing ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Listed
                      </span>
                    ) : null}
                  </div>
                  {item.setName ? (
                    <p className="mt-1 text-sm text-zinc-500">{item.setName}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.interestedCollectorLabel}
                    {item.showTopCollector && item.topCollectorName
                      ? ` · strongest match: ${item.topCollectorName} (${item.topMatchScore}%)`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!item.hasActiveListing ? (
                    <Link
                      href={`/events/${eventId}/new-listing`}
                      className={`${eventPrimaryButtonClassName} min-h-11 px-4 py-2.5`}
                    >
                      Create listing
                    </Link>
                  ) : null}
                  {item.topCollectorId && item.showTopCollector ? (
                    <Link
                      href={`/messages?with=${item.topCollectorId}`}
                      className={`${eventSecondaryButtonClassName} min-h-11 px-4 py-2.5`}
                      aria-label={`Message ${item.topCollectorName ?? "collector"}`}
                    >
                      Message
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
