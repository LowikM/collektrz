import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createCollectionItem } from "@/app/my-collection/actions";
import { AddCollectionItemForm } from "@/components/AddCollectionItemForm";
import {
  CollectionManageList,
  type ManageableCollectionItem,
} from "@/components/CollectionManageList";
import { CollectionViewNav } from "@/components/portfolio/CollectionViewNav";
import { PortfolioExperience } from "@/components/portfolio/PortfolioExperience";
import {
  describeCollectionFilters,
  filterCollectionItems,
  hasActiveCollectionFilters,
  parseCollectionListFilters,
} from "@/lib/collection-filters";
import { loadOwnerCollectionItems } from "@/lib/privacy-schema-queries";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";
import {
  collectPortfolioImageIds,
  loadPortfolioDataSafe,
} from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";

type MyCollectionSearchParams = {
  view?: string;
  kind?: string;
  set?: string;
  visibility?: string;
  graded?: string;
  raw?: string;
  sets?: string;
  error?: string;
  visibilityUpdated?: string;
  featuredUpdated?: string;
  allVisibilityUpdated?: string;
};

function resolveView(view: string | undefined): "portfolio" | "collection" {
  return view === "portfolio" ? "portfolio" : "collection";
}

export default async function MyCollectionPage({
  searchParams,
}: {
  searchParams: Promise<MyCollectionSearchParams>;
}) {
  const params = await searchParams;
  const {
    error: pageError,
    visibilityUpdated,
    featuredUpdated,
    allVisibilityUpdated,
  } = params;
  const activeView = resolveView(params.view);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const collectionFilters = parseCollectionListFilters(params);

  const [collectionLoad, portfolioResult] = await Promise.all([
    loadOwnerCollectionItems<ManageableCollectionItem>(supabase, user.id),
    activeView === "portfolio"
      ? loadPortfolioDataSafe(supabase, user.id)
      : Promise.resolve(null),
  ]);

  const allItems = collectionLoad.data;
  const collectionLoadError = collectionLoad.userMessage;
  const schemaDriftBanner = collectionLoad.schemaDrift
    ? collectionLoad.userMessage
    : null;
  const filteredItems = filterCollectionItems(allItems, collectionFilters);
  const filterDescription = describeCollectionFilters(collectionFilters);
  const showFilterBanner = hasActiveCollectionFilters(collectionFilters);

  const portfolioData =
    portfolioResult && portfolioResult.ok ? portfolioResult.data : null;
  const portfolioLoadError =
    portfolioResult && !portfolioResult.ok ? portfolioResult.userMessage : null;
  const portfolioSchemaDrift = Boolean(portfolioResult?.schemaDrift);

  const cardImagesById =
    activeView === "portfolio" && portfolioData
      ? await getCardImagesByIds(collectPortfolioImageIds(portfolioData))
      : new Map<string, { small: string; large: string }>();

  const maxWidthClass =
    activeView === "portfolio" ? "max-w-6xl" : "max-w-3xl";

  const showPortfolio =
    activeView === "portfolio" && portfolioData && !portfolioLoadError;

  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:py-12">
      <div className={`w-full space-y-8 ${maxWidthClass}`}>
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  My Collection
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                  {activeView === "portfolio"
                    ? "Portfolio insights built from the items you already track — organized for showcase and trading."
                    : "Save cards and sealed products you own. Mark items public to share them on your collector profile."}
                </p>
                <Link
                  href={`/users/${user.id}?tab=collection`}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                >
                  View public collection showcase →
                </Link>
              </div>
              <Link
                href="/my-collection/add"
                className="inline-flex min-h-11 items-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Fast Add
              </Link>
            </div>
          </div>

          <Suspense fallback={<div className="h-11" aria-hidden="true" />}>
            <CollectionViewNav activeView={activeView} />
          </Suspense>
        </div>

        {pageError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {pageError}
          </p>
        ) : null}

        {schemaDriftBanner && activeView !== "portfolio" ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            role="status"
          >
            {schemaDriftBanner}
          </p>
        ) : null}

        {portfolioSchemaDrift && activeView === "portfolio" ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            role="status"
          >
            Some portfolio privacy fields are temporarily unavailable while the
            database is being updated. Your items remain private.
          </p>
        ) : null}

        {visibilityUpdated ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Updated visibility for {visibilityUpdated} item
            {visibilityUpdated === "1" ? "" : "s"}.
          </p>
        ) : null}

        {featuredUpdated ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Updated featured status for {featuredUpdated} item
            {featuredUpdated === "1" ? "" : "s"}.
          </p>
        ) : null}

        {allVisibilityUpdated ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Updated visibility for all collection items.
          </p>
        ) : null}

        {activeView === "portfolio" && portfolioLoadError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {portfolioLoadError}
          </p>
        ) : null}

        {showPortfolio ? (
          <PortfolioExperience
            data={portfolioData}
            cardImagesById={cardImagesById}
            userId={user.id}
            showAllSets={params.sets === "all"}
          />
        ) : activeView === "portfolio" && portfolioLoadError ? null : (
          <>
            <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight">
                  Add to collection
                </h2>
                <Link
                  href="/my-collection/add"
                  className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Fast Add card
                </Link>
              </div>
              <div className="mt-4">
                <AddCollectionItemForm action={createCollectionItem} />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight">
                  Your items
                </h2>
                {showFilterBanner ? (
                  <Link
                    href="/my-collection?view=collection"
                    className="min-h-11 text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>

              {showFilterBanner ? (
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                  Showing filtered results: {filterDescription} (
                  {filteredItems.length} of {allItems.length})
                </p>
              ) : null}

              {collectionLoadError && !schemaDriftBanner ? (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  role="alert"
                >
                  {collectionLoadError}
                </p>
              ) : allItems.length === 0 && !collectionLoadError ? (
                <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                  No items in your collection yet.
                </p>
              ) : filteredItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                  No items match the current filters.
                </p>
              ) : (
                <CollectionManageList items={filteredItems} />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
