import Link from "next/link";

import {
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import type { EventMomentum } from "@/lib/event-intelligence";
import {
  getMomentumSubtitle,
  type EventTimingState,
} from "@/lib/event-timing";

type EventMomentumStripProps = {
  momentum: EventMomentum;
  eventTimingState: EventTimingState;
};

function MomentumStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function EventMomentumStrip({
  momentum,
  eventTimingState,
}: EventMomentumStripProps) {
  const subtitle = getMomentumSubtitle(
    eventTimingState,
    momentum.recentListingCount,
  );

  return (
    <section
      aria-label="Event momentum"
      className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/30 sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Event pulse
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>
        <Link
          href="#event-marketplace"
          className={eventSecondaryButtonClassName}
          aria-label="View event marketplace"
        >
          View marketplace
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MomentumStat
          label="Attendees"
          value={momentum.attendeeCount}
          hint={
            momentum.attendeeCountIsEstimated ? "Estimated from listings" : undefined
          }
        />
        <MomentumStat label="Checked in" value={momentum.checkedInCount} />
        <MomentumStat label="Active listings" value={momentum.activeListingCount} />
        <MomentumStat label="Vendors" value={momentum.vendorCount} />
        <MomentumStat
          label="Your wishlist hits"
          value={momentum.wishlistMatchCount}
        />
        <MomentumStat
          label="Recent listings"
          value={momentum.recentListingCount}
        />
      </div>
    </section>
  );
}
