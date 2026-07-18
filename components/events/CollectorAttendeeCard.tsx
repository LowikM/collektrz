import Link from "next/link";

import { MatchScoreCard } from "@/components/matches/MatchScoreCard";
import {
  eventCardClassName,
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { VendorBadge } from "@/components/VendorBadge";
import { getTopMatchReasons } from "@/lib/match-score";
import type { EventCollectorProfile } from "@/lib/event-experience";

type CollectorAttendeeCardProps = {
  collector: EventCollectorProfile;
  eventId?: string;
  showMatchScore?: boolean;
  compact?: boolean;
  cardImagesById?: Map<string, { small: string; large: string }>;
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

function InlineMatchScore({
  collector,
}: {
  collector: EventCollectorProfile;
}) {
  const result = collector.matchScoreResult;
  if (!result) {
    return null;
  }

  const showScore = result.confidence !== "insufficient" || result.score > 0;
  const topReasons = getTopMatchReasons(result, 1);

  return (
    <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
      {showScore ? (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums text-zinc-900">
            {result.score}%
          </span>
          <span className="text-xs font-medium text-zinc-600">{result.label}</span>
          {result.isMutual ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              Mutual
            </span>
          ) : null}
        </div>
      ) : null}
      {result.lowDataMessage ? (
        <p className="mt-1 text-xs text-zinc-500">{result.lowDataMessage}</p>
      ) : null}
      {topReasons[0] ? (
        <p className="mt-1 text-xs text-zinc-600">{topReasons[0]}</p>
      ) : null}
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
  cardImagesById,
}: CollectorAttendeeCardProps) {
  if (showMatchScore && collector.matchScoreResult && !compact) {
    return (
      <div className="space-y-3">
        <article className={eventCardClassName}>
          <div className="flex gap-3">
            <CollectorAvatar collector={collector} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold tracking-tight">
                  {collector.displayName}
                </h3>
                {collector.isVendor ? (
                  <VendorBadge standNumber={collector.vendorStandNumber} />
                ) : null}
                {collector.isCurrentlyAtEvent ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                    Checked in
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatChip label="Listings" value={collector.listingCount} />
                <StatChip label="Wishlist" value={collector.wishlistCount} />
              </div>
            </div>
          </div>
        </article>
        <MatchScoreCard
          result={collector.matchScoreResult}
          otherUserId={collector.userId}
          otherUserName={collector.displayName}
          eventId={eventId}
          cardImagesById={cardImagesById}
          compact
        />
      </div>
    );
  }

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
            {collector.isCurrentlyAtEvent ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                Checked in
              </span>
            ) : null}
          </div>

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

          {showMatchScore ? <InlineMatchScore collector={collector} /> : null}
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
