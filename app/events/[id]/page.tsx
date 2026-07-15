import Link from "next/link";
import { notFound } from "next/navigation";

import { EventHero } from "@/components/EventHero";
import { EventListingFilters } from "@/components/EventListingFilters";
import { EventPersonalDashboard } from "@/components/EventPersonalDashboard";
import { EventPresenceControls } from "@/components/EventPresenceControls";
import { ListingInterest } from "@/components/ListingInterest";
import { MessageStatusAlert } from "@/components/MessageStatusAlert";
import { UserProfileLink } from "@/components/UserProfileLink";
import { VendorBadge } from "@/components/VendorBadge";
import {
  ListingCardThumbnail,
  ListingOfficialCardBadges,
} from "@/components/ListingOfficialCard";
import {
  getCollectionItemImageUrlsByIds,
  getListingThumbnailUrl,
} from "@/lib/collection-items";
import {
  getListingOwnerVendor,
  loadEventPersonalDashboard,
  loadEventPresence,
  loadEventStats,
  type EventRecord,
  type ListingOwnerVendor,
} from "@/lib/event-experience";
import {
  escapeIlikePattern,
  hasActiveListingFilters,
  LISTING_SORT_OPTIONS,
  parseListingFilters,
} from "@/lib/listing-filters";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";
import { createClient } from "@/lib/supabase/server";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  tcg_api_card_id: string | null;
  card_number: string | null;
  set_id: string | null;
  collection_item_id: string | null;
  created_at: string;
  updated_at: string;
  users: ListingOwnerVendor | ListingOwnerVendor[] | null;
};

const TYPE_LABELS: Record<Listing["type"], string> = {
  want: "Want",
  trade: "Trade",
  sale: "Sale",
};

function buildListingSearchOrFilter(query: string) {
  const pattern = `%${escapeIlikePattern(query)}%`;
  const quotedPattern = `"${pattern.replace(/"/g, '""')}"`;

  return [
    `card_name.ilike.${quotedPattern}`,
    `set_name.ilike.${quotedPattern}`,
    `card_number.ilike.${quotedPattern}`,
    `language.ilike.${quotedPattern}`,
  ].join(",");
}

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const pageError =
    typeof resolvedSearchParams.error === "string"
      ? resolvedSearchParams.error
      : undefined;
  const wishlistActivated =
    typeof resolvedSearchParams.wishlistActivated === "string"
      ? resolvedSearchParams.wishlistActivated
      : undefined;
  const messageSent = resolvedSearchParams.messageSent === "1";
  const filters = parseListingFilters(resolvedSearchParams);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, name, location, start_date, end_date, join_code, banner_url, created_by, created_at",
    )
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const eventRecord = event as EventRecord;

  const [stats, presence, personalDashboard] = await Promise.all([
    loadEventStats(supabase, id),
    user ? loadEventPresence(supabase, id, user.id) : Promise.resolve(null),
    user
      ? loadEventPersonalDashboard(supabase, id, user.id, eventRecord.name)
      : Promise.resolve(null),
  ]);

  let listingsQuery = supabase
    .from("listings")
    .select(
      "id, event_id, user_id, type, card_name, trade_for, status, condition, set_name, notes, language, tcg_api_card_id, card_number, set_id, collection_item_id, created_at, updated_at, users(id, display_name, email, is_vendor, vendor_stand_number)",
    )
    .eq("event_id", id)
    .eq("status", "active");

  if (filters.type) {
    listingsQuery = listingsQuery.eq("type", filters.type);
  }

  if (filters.language) {
    listingsQuery = listingsQuery.eq("language", filters.language);
  }

  if (filters.condition) {
    listingsQuery = listingsQuery.eq("condition", filters.condition);
  }

  if (filters.official) {
    listingsQuery = listingsQuery.not("tcg_api_card_id", "is", null);
  }

  if (filters.q) {
    listingsQuery = listingsQuery.or(buildListingSearchOrFilter(filters.q));
  }

  const sort = LISTING_SORT_OPTIONS[filters.sort];
  listingsQuery = listingsQuery.order(sort.column, {
    ascending: sort.ascending,
  });

  const { data: listings, error: listingsError } = await listingsQuery;

  const activeListings = (listings ?? []) as Listing[];
  const cardImagesById = await getCardImagesByIds(
    activeListings
      .map((listing) => listing.tcg_api_card_id)
      .filter((listingId): listingId is string => Boolean(listingId)),
  );
  const collectionItemImagesById = await getCollectionItemImageUrlsByIds(
    supabase,
    activeListings
      .map((listing) => listing.collection_item_id)
      .filter((listingId): listingId is string => Boolean(listingId)),
  );
  const listingIds = activeListings.map((listing) => listing.id);

  const interestCountByListing = new Map<string, number>();
  const interestedListingIds = new Set<string>();

  if (listingIds.length > 0) {
    const { data: interests } = await supabase
      .from("listing_interests")
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

  const filtersActive = hasActiveListingFilters(filters);

  return (
    <div className="flex flex-1 justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl space-y-8">
        <EventHero event={eventRecord} stats={stats} />

        {user && presence ? (
          <EventPresenceControls eventId={id} presence={presence} />
        ) : null}

        {user && personalDashboard ? (
          <EventPersonalDashboard
            eventId={id}
            userId={user.id}
            dashboard={personalDashboard}
          />
        ) : (
          <section className="rounded-2xl border border-dashed border-zinc-300 px-6 py-8 text-center dark:border-zinc-700">
            <h2 className="text-lg font-semibold tracking-tight">
              Sign in for your personal event dashboard
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Track listings you&apos;re bringing, wishlist matches, and trader
              overlap for this event.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Marketplace</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Browse active listings from collectors and vendors at this event.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/events/${eventRecord.id}/new-listing`}
                className="inline-flex rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Create listing
              </Link>
              <Link
                href={`/events/${eventRecord.id}/activate-wishlist`}
                className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Activate wishlist
              </Link>
            </div>
          </div>

          <EventListingFilters eventId={eventRecord.id} filters={filters} />

          <MessageStatusAlert messageSent={messageSent} />

          {wishlistActivated ? (
            <p
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
              role="status"
            >
              Activated {wishlistActivated} wishlist item
              {wishlistActivated === "1" ? "" : "s"} as want listings.
            </p>
          ) : null}

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
            <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {filtersActive
                ? "No listings match your filters."
                : "No listings yet."}
            </p>
          ) : (
            <ul className="grid gap-4">
              {activeListings.map((listing) => {
                const imageUrl = getListingThumbnailUrl(
                  listing,
                  cardImagesById,
                  collectionItemImagesById,
                );
                const owner = getListingOwnerVendor(listing.users);

                return (
                  <li key={listing.id}>
                    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="flex gap-3">
                        <ListingCardThumbnail
                          imageUrl={imageUrl}
                          cardName={listing.card_name}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start gap-2">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                              {TYPE_LABELS[listing.type]}
                            </span>
                            {owner?.is_vendor ? (
                              <VendorBadge
                                standNumber={owner.vendor_stand_number}
                              />
                            ) : null}
                            <ListingOfficialCardBadges
                              tcgApiCardId={listing.tcg_api_card_id}
                              cardNumber={listing.card_number}
                            />
                            <h3 className="text-base font-semibold tracking-tight">
                              {listing.card_name}
                            </h3>
                          </div>

                          <dl className="mt-3 space-y-2 text-sm">
                            <div>
                              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                                Listed by
                              </dt>
                              <dd>
                                {owner ? (
                                  <UserProfileLink
                                    userId={listing.user_id}
                                    user={owner}
                                  />
                                ) : (
                                  "Unknown user"
                                )}
                              </dd>
                            </div>
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
                            listingId={listing.id}
                            listingOwnerId={listing.user_id}
                            listingCardName={listing.card_name}
                            currentUserId={user?.id ?? null}
                            isInterested={interestedListingIds.has(listing.id)}
                            interestCount={
                              interestCountByListing.get(listing.id) ?? 0
                            }
                          />
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
