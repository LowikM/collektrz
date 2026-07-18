import Link from "next/link";
import { redirect } from "next/navigation";

import { createCollectionItem } from "@/app/my-collection/actions";
import { AddCollectionItemForm } from "@/components/AddCollectionItemForm";
import {
  CollectionManageList,
  type ManageableCollectionItem,
} from "@/components/CollectionManageList";
import { createClient } from "@/lib/supabase/server";

export default async function MyCollectionPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    visibilityUpdated?: string;
    featuredUpdated?: string;
    allVisibilityUpdated?: string;
  }>;
}) {
  const {
    error: pageError,
    visibilityUpdated,
    featuredUpdated,
    allVisibilityUpdated,
  } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("collection_items")
    .select(
      "id, item_kind, card_name, card_ref, set_name, condition, notes, language, tcg_api_card_id, card_number, set_id, quantity, sealed_product_type, image_url, created_at, updated_at, visibility, is_featured",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (data ?? []) as ManageableCollectionItem[];

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Collection</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Save cards and sealed products you own. Mark items public to share
            them on your collector profile.
          </p>
          <Link
            href={`/users/${user.id}?tab=collection`}
            className="mt-3 inline-flex text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            View public collection showcase →
          </Link>
        </div>

        {pageError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" role="alert">
            {pageError}
          </p>
        ) : null}

        {visibilityUpdated ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300" role="status">
            Updated visibility for {visibilityUpdated} item{visibilityUpdated === "1" ? "" : "s"}.
          </p>
        ) : null}

        {featuredUpdated ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300" role="status">
            Updated featured status for {featuredUpdated} item{featuredUpdated === "1" ? "" : "s"}.
          </p>
        ) : null}

        {allVisibilityUpdated ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300" role="status">
            Updated visibility for all collection items.
          </p>
        ) : null}

        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold tracking-tight">Add to collection</h2>
          <AddCollectionItemForm action={createCollectionItem} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your items</h2>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" role="alert">
              Could not load collection: {error.message}
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No items in your collection yet.
            </p>
          ) : (
            <CollectionManageList items={items} />
          )}
        </section>
      </div>
    </div>
  );
}
