import Link from "next/link";
import { redirect } from "next/navigation";

import {
  createCollectionItem,
  deleteCollectionItem,
  updateCollectionItem,
} from "@/app/my-collection/actions";
import { AddCollectionItemForm } from "@/components/AddCollectionItemForm";
import {
  CollectionItemImagePlaceholder,
} from "@/components/CollectionItemSealedFields";
import {
  EditCollectionItemForm,
  type EditableCollectionItem,
} from "@/components/EditCollectionItemForm";
import { createClient } from "@/lib/supabase/server";

type ItemKind = "card" | "sealed";

type CollectionItem = EditableCollectionItem & {
  card_ref: string;
  tcg_api_card_id: string | null;
  card_number: string | null;
  set_id: string | null;
  created_at: string;
  updated_at: string;
};

const ITEM_KIND_LABELS: Record<ItemKind, string> = {
  card: "Card",
  sealed: "Sealed",
};

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CollectionItemThumbnail({
  item,
}: {
  item: CollectionItem;
}) {
  if (item.item_kind === "sealed") {
    if (item.image_url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- user-provided external product URLs
        <img
          src={item.image_url}
          alt={item.card_name}
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-lg border border-zinc-200 object-contain dark:border-zinc-800"
        />
      );
    }

    return <CollectionItemImagePlaceholder size="md" />;
  }

  return null;
}

export default async function MyCollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: pageError } = await searchParams;
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
      "id, item_kind, card_name, card_ref, set_name, condition, notes, language, tcg_api_card_id, card_number, set_id, quantity, sealed_product_type, image_url, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (data ?? []) as CollectionItem[];

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Collection</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Save cards and sealed products you own for faster listing later.
          </p>
          <Link
            href={`/users/${user.id}?tab=collection`}
            className="mt-3 inline-flex text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            View public collection showcase →
          </Link>
        </div>

        {pageError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {pageError}
          </p>
        ) : null}

        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold tracking-tight">
            Add to collection
          </h2>
          <AddCollectionItemForm action={createCollectionItem} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your items</h2>

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              Could not load collection: {error.message}
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No items in your collection yet.
            </p>
          ) : (
            <ul className="grid gap-4">
              {items.map((item) => {
                const updateItem = updateCollectionItem.bind(null, item.id);
                const deleteItem = deleteCollectionItem.bind(null, item.id);
                const isSealed = item.item_kind === "sealed";

                return (
                  <li key={item.id}>
                    <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="mb-4 flex gap-4">
                        {isSealed ? (
                          <CollectionItemThumbnail item={item} />
                        ) : null}

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start gap-2">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                              {ITEM_KIND_LABELS[item.item_kind]}
                            </span>
                            {isSealed && item.sealed_product_type ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                {item.sealed_product_type}
                              </span>
                            ) : null}
                            {item.language ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                {item.language}
                              </span>
                            ) : null}
                            {!isSealed && item.tcg_api_card_id ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                Official card
                              </span>
                            ) : null}
                            {!isSealed && item.card_number ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                #{item.card_number}
                              </span>
                            ) : null}
                            {!isSealed && item.set_id ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                {item.set_id}
                              </span>
                            ) : null}
                          </div>

                          <div>
                            <h3 className="text-base font-medium tracking-tight">
                              {item.card_name}
                            </h3>
                            {item.set_name ? (
                              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                Set: {item.set_name}
                              </p>
                            ) : null}
                            {item.condition ? (
                              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                Condition: {item.condition}
                              </p>
                            ) : null}
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                              Added {formatDateTime(item.created_at)} · Qty{" "}
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>

                      <EditCollectionItemForm
                        item={item}
                        updateAction={updateItem}
                        deleteAction={deleteItem}
                      />
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
