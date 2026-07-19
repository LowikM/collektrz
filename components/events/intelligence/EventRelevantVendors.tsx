import Link from "next/link";

import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import {
  eventCardClassName,
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { EventIntelligenceEmptyState } from "@/components/events/intelligence/EventIntelligenceEmptyState";
import { VendorBadge } from "@/components/VendorBadge";
import type { RelevantVendor } from "@/lib/event-intelligence";

type EventRelevantVendorsProps = {
  eventId: string;
  vendors: RelevantVendor[];
};

function VendorAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function EventRelevantVendors({
  eventId,
  vendors,
}: EventRelevantVendorsProps) {
  return (
    <section className="space-y-4">
      <EventSectionHeader
        eyebrow="Vendors"
        title="Vendors worth visiting"
        description="Ranked by wishlist overlap, Match Score, check-in status, and stand relevance — not raw listing volume."
        count={vendors.length}
        countLabel="recommended"
      />

      {vendors.length === 0 ? (
        <EventIntelligenceEmptyState
          icon="🏪"
          title="No vendor recommendations yet"
          description="Add wishlist cards or check back when vendors with relevant inventory are checked in."
          actionLabel="Browse vendors"
          actionHref={`#event-vendors`}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {vendors.map(({ vendor, topItems, reasons, isCheckedIn }) => (
            <li key={vendor.userId} className={eventCardClassName}>
              <div className="flex gap-3">
                <VendorAvatar name={vendor.displayName} avatarUrl={vendor.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{vendor.displayName}</h3>
                    {vendor.standNumber ? (
                      <VendorBadge standNumber={vendor.standNumber} />
                    ) : null}
                    {isCheckedIn ? (
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                        <span aria-hidden="true">● </span>
                        Checked in
                      </span>
                    ) : null}
                  </div>

                  {reasons.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {reasons.map((reason) => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>
                  ) : null}

                  {topItems.length > 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">
                      Matches include: {topItems.join(", ")}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/events/${eventId}/vendors/${vendor.userId}`}
                      className={`${eventPrimaryButtonClassName} min-h-11 px-4 py-2.5`}
                      aria-label={`View ${vendor.displayName} stand${vendor.standNumber ? ` ${vendor.standNumber}` : ""}`}
                    >
                      View stand
                    </Link>
                    <Link
                      href={`/messages?with=${vendor.userId}`}
                      className={`${eventSecondaryButtonClassName} min-h-11 px-4 py-2.5`}
                      aria-label={`Message ${vendor.displayName}`}
                    >
                      Message
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
