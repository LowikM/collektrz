import { redirect } from "next/navigation";

import { createWishlistItem } from "@/app/my-wishlist/actions";
import { AddWishlistItemForm } from "@/components/AddWishlistItemForm";
import { WishlistManageList } from "@/components/WishlistManageList";
import { loadOwnerWishlistItems } from "@/lib/privacy-schema-queries";
import { createClient } from "@/lib/supabase/server";

type WishlistItem = {
  id: string;
  card_name: string;
  card_ref: string;
  set_name: string | null;
  language: string | null;
  notes: string | null;
  tcg_api_card_id: string | null;
  card_number: string | null;
  set_id: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  visibility: "public" | "private";
};

export default async function MyWishlistPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    deleted?: string;
    priorityUpdated?: string;
    visibilityUpdated?: string;
    allVisibilityUpdated?: string;
  }>;
}) {
  const {
    error: pageError,
    deleted,
    priorityUpdated,
    visibilityUpdated,
    allVisibilityUpdated,
  } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const wishlistLoad = await loadOwnerWishlistItems<WishlistItem>(
    supabase,
    user.id,
  );
  const items = wishlistLoad.data;
  const loadError = wishlistLoad.userMessage;
  const schemaDriftBanner = wishlistLoad.schemaDrift
    ? wishlistLoad.userMessage
    : null;
  const fatalLoadError =
    loadError && !wishlistLoad.schemaDrift ? loadError : null;

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Wishlist</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Keep a permanent list of cards you want, then activate selected items
            for an event to create want listings.
          </p>
        </div>

        {pageError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {pageError}
          </p>
        ) : null}

        {schemaDriftBanner ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            role="status"
          >
            {schemaDriftBanner}
          </p>
        ) : null}

        {deleted ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Deleted {deleted} wishlist item{deleted === "1" ? "" : "s"}.
          </p>
        ) : null}

        {priorityUpdated ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Updated priority for {priorityUpdated} wishlist item
            {priorityUpdated === "1" ? "" : "s"}.
          </p>
        ) : null}

        {visibilityUpdated ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Updated visibility for {visibilityUpdated} wishlist item
            {visibilityUpdated === "1" ? "" : "s"}.
          </p>
        ) : null}

        {allVisibilityUpdated ? (
          <p
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            Updated visibility for all wishlist items.
          </p>
        ) : null}

        {!fatalLoadError ? (
          <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold tracking-tight">
              Add to wishlist
            </h2>
            <AddWishlistItemForm action={createWishlistItem} />
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your wishlist</h2>

          {fatalLoadError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              {fatalLoadError}
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No cards on your wishlist yet.
            </p>
          ) : (
            <WishlistManageList items={items} />
          )}
        </section>
      </div>
    </div>
  );
}
