import Link from "next/link";

import {
  eventCardClassName,
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { VendorBadge } from "@/components/VendorBadge";
import type { EventCollectorProfile } from "@/lib/event-experience";

type CollectorAttendeeCardProps = {
  collector: EventCollectorProfile;
  eventId?: string;
  showMatchScore?: boolean;
  compact?: boolean;
};

function CollectorAvatar({
  collector,
  size = "md",
}: {
  collector: EventCollectorProfile;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm";

  if (collector.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-provided avatar URLs
      <img
        src={collector.avatarUrl}
        alt=""
        className={`rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-700 ${sizeClass}`}
      aria-hidden="true"
    >
      {collector.displayName.charAt(0).toUpperCase()}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-2.5 py-1.5 text-center">
      <p className="text-sm font-semibold tabular-nums text-zinc-900">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
    </div>
  );
}

/**
 * Premium collector card for event attendee lists, social recommendations,
 * and the full attendees directory.
 */
export function CollectorAttendeeCard({
  collector,
  eventId,
  showMatchScore = false,
  compact = false,
}: CollectorAttendeeCardProps) {
  const profileHref = `/users/${collector.userId}`;
  const chatHref = `/messages?with=${collector.userId}`;
  const vendorHref =
    eventId && collector.isVendor
      ? `/events/${eventId}/vendors/${collector.userId}`
      : profileHref;

  return (
    <article className={eventCardClassName}>
      <div className={`flex gap-3 ${compact ? "items-center" : "items-start"}`}>
        <CollectorAvatar collector={collector} size={compact ? "md" : "lg"} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {collector.displayName}
            </h3>
            {collector.isVendor ? (
              <VendorBadge standNumber={collector.vendorStandNumber} />
            ) : null}
            {collector.collectorLevel ? (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                {collector.collectorLevel}
              </span>
            ) : null}
            {collector.isCurrentlyAtEvent ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                Checked in
              </span>
            ) : null}
          </div>

          {collector.matchReason ? (
            <p className="mt-1 text-xs text-zinc-500">{collector.matchReason}</p>
          ) : null}

          {!compact ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatChip label="Listings" value={collector.listingCount} />
              <StatChip label="Wishlist" value={collector.wishlistCount} />
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-zinc-500">
              {collector.listingCount} listing
              {collector.listingCount === 1 ? "" : "s"} · {collector.wishlistCount}{" "}
              wishlist
            </p>
          )}

          {showMatchScore && collector.matchScore !== null ? (
            <p className="mt-2 text-xs font-medium text-zinc-600">
              Match score: {collector.matchScore}%
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={collector.isVendor ? vendorHref : profileHref}
          className={eventSecondaryButtonClassName}
        >
          View profile
        </Link>
        <Link href={chatHref} className={eventPrimaryButtonClassName}>
          Chat
        </Link>
      </div>
    </article>
  );
}
