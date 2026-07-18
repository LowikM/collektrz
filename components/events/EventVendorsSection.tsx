import Link from "next/link";

import { EventSectionHeader } from "@/components/events/EventSectionHeader";
import {
  eventCardClassName,
} from "@/components/events/event-styles";
import { VendorBadge } from "@/components/VendorBadge";
import type { EventVendorProfile } from "@/lib/event-experience";

type EventVendorsSectionProps = {
  eventId: string;
  vendors: EventVendorProfile[];
};

function VendorCard({
  vendor,
  eventId,
}: {
  vendor: EventVendorProfile;
  eventId: string;
}) {
  return (
    <Link
      href={`/events/${eventId}/vendors/${vendor.userId}`}
      className={`${eventCardClassName} block`}
    >
      <div className="flex items-start gap-3">
        {vendor.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-provided avatar URLs
          <img
            src={vendor.avatarUrl}
            alt=""
            className="h-14 w-14 rounded-2xl border border-zinc-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-600">
            {vendor.displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {vendor.displayName}
            </h3>
            <VendorBadge standNumber={vendor.standNumber} />
          </div>

          <p className="mt-1 text-sm text-zinc-600">
            {vendor.listingCount} listing{vendor.listingCount === 1 ? "" : "s"}
          </p>

          {vendor.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
              {vendor.description}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/**
 * Vendor stands directory on the event page. Each card links to a dedicated
 * vendor page with listings and contact options.
 */
export function EventVendorsSection({
  eventId,
  vendors,
}: EventVendorsSectionProps) {
  if (vendors.length === 0) {
    return (
      <section className="space-y-4">
        <EventSectionHeader
          eyebrow="Marketplace"
          title="Vendor Stands"
          description="Official vendors with stands at this event."
          count={0}
          countLabel="vendors"
        />
        <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center">
          <p className="text-sm text-zinc-600">
            No vendor stands listed for this event yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <EventSectionHeader
        eyebrow="Marketplace"
        title="Vendor Stands"
        description="Browse vendor booths, inventory, and wishlist requests."
        count={vendors.length}
        countLabel="vendors"
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        {vendors.map((vendor) => (
          <li key={vendor.userId}>
            <VendorCard vendor={vendor} eventId={eventId} />
          </li>
        ))}
      </ul>
    </section>
  );
}
