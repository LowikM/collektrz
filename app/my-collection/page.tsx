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
import { PortfolioSkeleton } from "@/components/portfolio/PortfolioSkeleton";
import {
  describeCollectionFilters,
  filterCollectionItems,
  hasActiveCollectionFilters,
  parseCollectionListFilters,
} from "@/lib/collection-filters";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";
import {
  collectPortfolioImageIds,
  loadPortfolioData,
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

  const [{ data, error }, portfolioData] = await Promise.all([
    supabase
      .from("collection_items")
      .select(
        "id, item_kind, card_name, card_ref, set_name, condition, notes, language, tcg_api_card_id, card_number, set_id, quantity, sealed_product_type, image_url, created_at, updated_at, visibility, is_featured",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    activeView === "portfolio"
      ? loadPortfolioData(supabase, user.id)
      : Promise.resolve(null),
  ]);

  const allItems = (data ?? []) as ManageableCollectionItem[];
  const filteredItems = filterCollectionItems(allItems, collectionFilters);
  const filterDescription = describeCollectionFilters(collectionFilters);
  const showFilterBanner = hasActiveCollectionFilters(collectionFilters);

  const cardImagesById =
    activeView === "portfolio" && portfolioData
      ? await getCardImagesByIds(collectPortfolioImageIds(portfolioData))
      : new Map<string, { small: string; large: string }>();

  const maxWidthClass =
    activeView === "portfolio" ? "max-w-6xl" : "max-w-3xl";

  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:py-12">
      <div className={`w-full space-y-8 ${maxWidthClass}`}>
        <div className="space-y-5">
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

        {activeView === "portfolio" && portfolioData ? (
          <PortfolioExperience
            data={portfolioData}
            cardImagesById={cardImagesById}
            userId={user.id}
            showAllSets={params.sets === "all"}
          />
        ) : (
          <>
            <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold tracking-tight">
                Add to collection
              </h2>
              <AddCollectionItemForm action={createCollectionItem} />
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

              {error ? (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  role="alert"
                >
                  Could not load collection: {error.message}
                </p>
              ) : allItems.length === 0 ? (
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
