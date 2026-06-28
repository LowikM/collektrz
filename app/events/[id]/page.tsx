import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingInterest } from "@/components/ListingInterest";
import { createClient } from "@/lib/supabase/server";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

type Listing = {
  id: string;
  event_id: string;
  user_id: string;
  type: "want" | "trade" | "sale";
  card_name: string;
  trade_for: string | null;
  status: string;
  condition: string | null;
  set_name: string | null;
  notes: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
};

const TYPE_LABELS: Record<Listing["type"], string> = {
  want: "Want",
  trade: "Trade",
  sale: "Sale",
};

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const { id } = await params;
  const { error: pageError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, name, location, start_date, end_date, join_code, created_by, created_at",
    )
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select(
      "id, event_id, user_id, type, card_name, trade_for, status, condition, set_name, notes, language, created_at, updated_at",
    )
    .eq("event_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const activeListings = (listings ?? []) as Listing[];
  const listingIds = activeListings.map((listing) => listing.id);

  const interestCountByListing = new Map<string, number>();
  const interestedListingIds = new Set<string>();

  if (listingIds.length > 0) {
    const { data: interests } = await supabase
      .from("interests")
      .select("listing_id, user_id")
      .in("listing_id", listingIds);

    for (const interest of interests ?? []) {
      interestCountByListing.set(
        interest.listing_id,
        (interestCountByListing.get(interest.listing_id) ?? 0) + 1,
      );

      if (user && interest.user_id === user.id) {
        interestedListingIds.add(interest.listing_id);
      }
    }
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-4">
          <Link
            href="/events"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            ← Back to events
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {event.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {event.location}
            </p>
          </div>

          <dl className="grid gap-4 rounded-xl border border-zinc-200 p-6 text-sm dark:border-zinc-800 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Start date
              </dt>
              <dd className="mt-1">{formatEventDate(event.start_date)}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                End date
              </dt>
              <dd className="mt-1">{formatEventDate(event.end_date)}</dd>
            </div>
          </dl>

          <Link
            href={`/events/${event.id}/new-listing`}
            className="inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Create Listing
          </Link>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Listings</h2>

          {pageError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              {pageError}
            </p>
          ) : null}

          {listingsError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              Could not load listings: {listingsError.message}
            </p>
          ) : activeListings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No listings yet.
            </p>
          ) : (
            <ul className="grid gap-4">
              {activeListings.map((listing) => (
                <li key={listing.id}>
                  <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        {TYPE_LABELS[listing.type]}
                      </span>
                      <h3 className="text-base font-semibold tracking-tight">
                        {listing.card_name}
                      </h3>
                    </div>

                    <dl className="mt-3 space-y-2 text-sm">
                      {listing.set_name ? (
                        <div>
                          <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                            Set
                          </dt>
                          <dd>{listing.set_name}</dd>
                        </div>
                      ) : null}
                      {listing.condition ? (
                        <div>
                          <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                            Condition
                          </dt>
                          <dd>{listing.condition}</dd>
                        </div>
                      ) : null}
                      {listing.language ? (
                        <div>
                          <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                            Language
                          </dt>
                          <dd>{listing.language}</dd>
                        </div>
                      ) : null}
                      {listing.trade_for ? (
                        <div>
                          <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                            Trade for
                          </dt>
                          <dd>{listing.trade_for}</dd>
                        </div>
                      ) : null}
                      {listing.notes ? (
                        <div>
                          <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                            Notes
                          </dt>
                          <dd className="leading-6">{listing.notes}</dd>
                        </div>
                      ) : null}
                    </dl>

                    <ListingInterest
                      eventId={event.id}
                      listingId={listing.id}
                      listingOwnerId={listing.user_id}
                      currentUserId={user?.id ?? null}
                      isInterested={interestedListingIds.has(listing.id)}
                      interestCount={interestCountByListing.get(listing.id) ?? 0}
                    />
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
