import Link from "next/link";

import { ProfileQrCode } from "@/components/ProfileQrCode";
import { UserProfileLink } from "@/components/UserProfileLink";
import type { EventPersonalDashboard } from "@/lib/event-experience";
import {
  getMatchCategoryDescription,
  MATCH_CATEGORY_LABELS,
} from "@/lib/listing-matches";
import { getPublicProfileUrl } from "@/lib/site-url";

type EventPersonalDashboardProps = {
  eventId: string;
  userId: string;
  dashboard: EventPersonalDashboard;
};

const panelClassName =
  "rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950";

export function EventPersonalDashboard({
  eventId,
  userId,
  dashboard,
}: EventPersonalDashboardProps) {
  const profileUrl = getPublicProfileUrl(userId);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Your event
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Personal dashboard
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/events/${eventId}/new-listing`}
            className="inline-flex rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Add listing
          </Link>
          <Link
            href={`/events/${eventId}/activate-wishlist`}
            className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Activate wishlist
          </Link>
          <Link
            href="/my-matches"
            className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            All matches
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="grid gap-4 md:grid-cols-3">
          <article className={panelClassName}>
            <h3 className="text-sm font-semibold tracking-tight">
              Listings you&apos;re bringing
            </h3>
            {dashboard.bringingListings.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                No sale or trade listings yet for this event.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dashboard.bringingListings.map((listing) => (
                  <li
                    key={listing.id}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                  >
                    <p className="font-medium">{listing.card_name}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {listing.type}
                      {listing.set_name ? ` · ${listing.set_name}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={panelClassName}>
            <h3 className="text-sm font-semibold tracking-tight">
              Wishlist matches
            </h3>
            {dashboard.wishlistMatches.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                No one at this event is offering cards from your wishlist yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dashboard.wishlistMatches.map((match) => (
                  <li
                    key={match.id}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                  >
                    <p className="font-medium">{match.card_name}</p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {match.listing_type} listing by{" "}
                      <Link
                        href={`/users/${match.owner_id}`}
                        className="font-medium hover:underline"
                      >
                        {match.owner_label}
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={panelClassName}>
            <h3 className="text-sm font-semibold tracking-tight">
              Traders matching your interests
            </h3>
            {dashboard.traderMatches.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                No trader overlap yet. Activate your wishlist or add listings to
                improve matches.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dashboard.traderMatches.map((match) => (
                  <li
                    key={match.id}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                  >
                    <p className="font-medium">
                      {MATCH_CATEGORY_LABELS[match.category]}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {match.otherUser ? (
                        <UserProfileLink
                          userId={match.otherUserId}
                          user={match.otherUser}
                        />
                      ) : (
                        "Unknown collector"
                      )}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {getMatchCategoryDescription(match)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        <ProfileQrCode url={profileUrl} />
      </div>
    </section>
  );
}
