import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RecordRecentSetVisit } from "@/components/RecordRecentSetVisit";
import { SetBrowserGrid } from "@/components/SetBrowserGrid";
import { SetCompletionStatsPanel } from "@/components/SetCompletionStatsPanel";
import { SetLoadErrorPanel } from "@/components/SetLoadErrorPanel";
import { getUserFacingLoadError, logDatabaseError } from "@/lib/db-errors";
import { formatSetReleaseDate } from "@/lib/pokemon-tcg";
import {
  getSetCardsErrorMessage,
  loadSetDetail,
} from "@/lib/set-detail";
import { computeSetCompletionStats } from "@/lib/set-browser";
import { createClient } from "@/lib/supabase/server";

type SetDetailPageProps = {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{
    error?: string;
    added?: string;
    bulk?: string;
    alreadyOwned?: string;
    alreadyWished?: string;
  }>;
};

function parseCountParam(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function getSetErrorTitle(category: string) {
  switch (category) {
    case "not_found":
      return "Set not found";
    case "configuration":
      return "Configuration missing";
    case "timeout":
      return "Request timed out";
    default:
      return "Card catalog temporarily unavailable";
  }
}

export default async function SetDetailPage({
  params,
  searchParams,
}: SetDetailPageProps) {
  const { setId } = await params;
  const {
    error: pageError,
    added,
    bulk,
    alreadyOwned,
    alreadyWished,
  } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const detail = await loadSetDetail(setId);

  if (detail.status === "not_found") {
    notFound();
  }

  if (detail.status === "error") {
    return (
      <div className="flex flex-1 justify-center px-4 py-12">
        <RecordRecentSetVisit setId={setId} />
        <div className="w-full max-w-6xl space-y-8">
          <Link
            href="/sets"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            ← Back to Set Browser
          </Link>
          {pageError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              {pageError}
            </p>
          ) : null}
          <SetLoadErrorPanel
            title={getSetErrorTitle(detail.category)}
            message={detail.message}
            setId={detail.requestedId}
            retryable={detail.retryable}
          />
        </div>
      </div>
    );
  }

  const { set, cards, cardsPartialFailure } = detail;

  const [{ data: collectionRows, error: collectionError }, { data: wishlistRows, error: wishlistError }] =
    await Promise.all([
      supabase
        .from("collection_items")
        .select("tcg_api_card_id")
        .eq("user_id", user.id)
        .eq("set_id", set.id)
        .not("tcg_api_card_id", "is", null),
      supabase
        .from("wishlist_items")
        .select("tcg_api_card_id")
        .eq("user_id", user.id)
        .eq("set_id", set.id)
        .not("tcg_api_card_id", "is", null),
    ]);

  if (collectionError) {
    logDatabaseError("set-detail.collection-status", collectionError, {
      userId: user.id,
      setId: set.id,
    });
  }

  if (wishlistError) {
    logDatabaseError("set-detail.wishlist-status", wishlistError, {
      userId: user.id,
      setId: set.id,
    });
  }

  const ownedIds = (collectionRows ?? [])
    .map((row) => row.tcg_api_card_id)
    .filter((id): id is string => Boolean(id));
  const wantedIds = (wishlistRows ?? [])
    .map((row) => row.tcg_api_card_id)
    .filter((id): id is string => Boolean(id));

  const bulkAddedCount = parseCountParam(added);
  const bulkAlreadyOwnedCount = parseCountParam(alreadyOwned);
  const bulkAlreadyWishedCount = parseCountParam(alreadyWished);

  const ownedIdSet = new Set(ownedIds);
  const wantedIdSet = new Set(wantedIds);
  const completionStats =
    cards.length > 0
      ? computeSetCompletionStats(cards, ownedIdSet, wantedIdSet)
      : null;

  const collectionStatusError = collectionError
    ? getUserFacingLoadError("collection", collectionError)
    : null;
  const wishlistStatusError = wishlistError
    ? getUserFacingLoadError("wishlist", wishlistError)
    : null;

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <RecordRecentSetVisit setId={setId} />
      <div className="w-full max-w-6xl space-y-8">
        <div className="space-y-2">
          <Link
            href="/sets"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            ← Back to Set Browser
          </Link>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {set.images.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={set.images.logo}
                  alt=""
                  className="h-12 w-auto max-w-[140px] object-contain"
                />
              ) : null}
              {set.images.symbol ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={set.images.symbol}
                  alt=""
                  className="h-10 w-10 object-contain"
                />
              ) : null}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {set.name}
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {set.series || "Unknown series"} ·{" "}
                  {formatSetReleaseDate(set.releaseDate)} · {set.total} cards
                </p>
              </div>
            </div>
          </div>
        </div>

        {bulk === "collection" ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Added {bulkAddedCount} card{bulkAddedCount === 1 ? "" : "s"} to your
            Collection.
            {bulkAlreadyOwnedCount > 0
              ? ` ${bulkAlreadyOwnedCount} were already owned.`
              : null}
          </p>
        ) : null}

        {bulk === "wishlist" ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Added {bulkAddedCount} card{bulkAddedCount === 1 ? "" : "s"} to your
            Wishlist.
            {bulkAlreadyWishedCount > 0
              ? ` ${bulkAlreadyWishedCount} were already wished.`
              : null}
          </p>
        ) : null}

        {added === "collection" && bulk !== "collection" ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Card added to your collection.
          </p>
        ) : null}

        {added === "wishlist" && bulk !== "wishlist" ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Card added to your wishlist.
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

        {cardsPartialFailure ? (
          <div className="space-y-3">
            <p
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              role="alert"
            >
              {getSetCardsErrorMessage(cardsPartialFailure)}
            </p>
            <Link
              href={`/sets/${encodeURIComponent(set.id)}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/60"
            >
              Retry loading cards
            </Link>
          </div>
        ) : null}

        {collectionStatusError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {collectionStatusError}
          </p>
        ) : null}

        {wishlistStatusError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {wishlistStatusError}
          </p>
        ) : null}

        {completionStats ? (
          <SetCompletionStatsPanel stats={completionStats} />
        ) : null}

        {!cardsPartialFailure && cards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/20">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No cards found for this set
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              The Pokémon TCG API returned an empty card list. Try again later or
              pick a different set.
            </p>
          </div>
        ) : null}

        {cards.length > 0 ? (
          <SetBrowserGrid
            cards={cards}
            setId={set.id}
            ownedIds={ownedIds}
            wantedIds={wantedIds}
          />
        ) : null}
      </div>
    </div>
  );
}
