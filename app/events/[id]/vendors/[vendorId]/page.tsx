import Link from "next/link";
import { notFound } from "next/navigation";

import { SendMessageForm } from "@/components/SendMessageForm";
import {
  ListingCardThumbnail,
  ListingOfficialCardBadges,
} from "@/components/ListingOfficialCard";
import {
  eventPanelClassName,
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import { VendorBadge } from "@/components/VendorBadge";
import {
  getCollectionItemImageUrlsByIds,
  getListingThumbnailUrl,
} from "@/lib/collection-items";
import {
  loadEventVendorDetail,
  type EventRecord,
} from "@/lib/event-experience";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";
import { getUserDisplayLabel } from "@/lib/users";
import { createClient } from "@/lib/supabase/server";

type EventVendorPageProps = {
  params: Promise<{ id: string; vendorId: string }>;
};

const TYPE_LABELS = {
  want: "Want",
  trade: "Trade",
  sale: "Sale",
} as const;

export default async function EventVendorPage({ params }: EventVendorPageProps) {
  const { id, vendorId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  const vendorDetail = await loadEventVendorDetail(supabase, id, vendorId);

  if (!vendorDetail) {
    notFound();
  }

  const { user: vendor, saleTradeListings, wantListings } = vendorDetail;
  const allListings = [...saleTradeListings, ...wantListings];

  const cardImagesById = await getCardImagesByIds(
    allListings
      .map((listing) => listing.tcg_api_card_id)
      .filter((cardId): cardId is string => Boolean(cardId)),
  );
  const collectionItemImagesById = await getCollectionItemImageUrlsByIds(
    supabase,
    allListings
      .map((listing) => listing.collection_item_id)
      .filter((itemId): itemId is string => Boolean(itemId)),
  );

  const displayName = getUserDisplayLabel(vendor);
  const chatHref = `/messages?with=${vendor.id}`;

  return (
    <div className="flex flex-1 justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl space-y-8">
        <Link
          href={`/events/${id}`}
          className="inline-flex text-sm text-zinc-600 transition-colors hover:text-zinc-900"
        >
          ← Back to {event.name}
        </Link>

        <section className={eventPanelClassName}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {vendor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-provided avatar URLs
              <img
                src={vendor.avatar_url}
                alt=""
                className="h-24 w-24 rounded-2xl border border-zinc-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-2xl font-semibold text-zinc-600">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {displayName}
                </h1>
                <VendorBadge standNumber={vendor.vendor_stand_number} />
              </div>

              {vendor.bio ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                  {vendor.bio}
                </p>
              ) : null}

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-xl bg-zinc-50 px-3 py-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Stand
                  </dt>
                  <dd className="mt-0.5 font-semibold">
                    {vendor.vendor_stand_number ?? "TBA"}
                  </dd>
                </div>
                <div className="rounded-xl bg-zinc-50 px-3 py-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Listings
                  </dt>
                  <dd className="mt-0.5 font-semibold">{allListings.length}</dd>
                </div>
                <div className="rounded-xl bg-zinc-50 px-3 py-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Wishlist requests
                  </dt>
                  <dd className="mt-0.5 font-semibold">{wantListings.length}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/users/${vendor.id}`} className={eventSecondaryButtonClassName}>
                  View profile
                </Link>
                <Link href={chatHref} className={eventPrimaryButtonClassName}>
                  Chat
                </Link>
              </div>

              {user && user.id !== vendor.id ? (
                <div className="mt-4 max-w-md">
                  <SendMessageForm recipientId={vendor.id} />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Inventory</h2>
          {saleTradeListings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600">
              No sale or trade listings yet.
            </p>
          ) : (
            <ul className="grid gap-4">
              {saleTradeListings.map((listing) => {
                const imageUrl = getListingThumbnailUrl(
                  listing,
                  cardImagesById,
                  collectionItemImagesById,
                );

                return (
                  <li key={listing.id}>
                    <article className={eventPanelClassName}>
                      <div className="flex gap-3">
                        <ListingCardThumbnail
                          imageUrl={imageUrl}
                          cardName={listing.card_name}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-zinc-700">
                              {TYPE_LABELS[listing.type as keyof typeof TYPE_LABELS]}
                            </span>
                            <ListingOfficialCardBadges
                              tcgApiCardId={listing.tcg_api_card_id}
                              cardNumber={listing.card_number}
                            />
                            <h3 className="text-base font-semibold">
                              {listing.card_name}
                            </h3>
                          </div>
                          {listing.set_name ? (
                            <p className="mt-1 text-sm text-zinc-600">
                              {listing.set_name}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Wishlist requests
          </h2>
          {wantListings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600">
              No active want listings from this vendor.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {wantListings.map((listing) => {
                const imageUrl = getListingThumbnailUrl(
                  listing,
                  cardImagesById,
                  collectionItemImagesById,
                );

                return (
                  <li key={listing.id}>
                    <article className={eventPanelClassName}>
                      <div className="flex gap-3">
                        <ListingCardThumbnail
                          imageUrl={imageUrl}
                          cardName={listing.card_name}
                        />
                        <div>
                          <h3 className="font-semibold">{listing.card_name}</h3>
                          {listing.set_name ? (
                            <p className="mt-1 text-sm text-zinc-600">
                              {listing.set_name}
                            </p>
                          ) : null}
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
