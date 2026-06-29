import { redirect } from "next/navigation";

import {
  createWishlistItem,
  deleteWishlistItem,
  updateWishlistItem,
} from "@/app/my-wishlist/actions";
import { AddWishlistItemForm } from "@/components/AddWishlistItemForm";
import { LanguageSelect } from "@/components/LanguageSelect";
import { PrioritySelect } from "@/components/PrioritySelect";
import { WISHLIST_PRIORITY_LABELS } from "@/lib/wishlist";
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
};

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function MyWishlistPage({
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
    .from("wishlist_items")
    .select(
      "id, card_name, card_ref, set_name, language, notes, tcg_api_card_id, card_number, set_id, priority, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  const items = (data ?? []) as WishlistItem[];

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Wishlist</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Keep a permanent list of cards you want. Event listings from your
            wishlist are coming in a later phase.
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

        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold tracking-tight">
            Add to wishlist
          </h2>
          <AddWishlistItemForm action={createWishlistItem} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your wishlist</h2>

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              Could not load wishlist: {error.message}
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No cards on your wishlist yet.
            </p>
          ) : (
            <ul className="grid gap-4">
              {items.map((item) => {
                const updateItem = updateWishlistItem.bind(null, item.id);
                const deleteItem = deleteWishlistItem.bind(null, item.id);

                return (
                  <li key={item.id}>
                    <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="mb-4 flex flex-wrap items-start gap-2">
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                          {WISHLIST_PRIORITY_LABELS[item.priority] ??
                            `Priority ${item.priority}`}
                        </span>
                        {item.language ? (
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                            {item.language}
                          </span>
                        ) : null}
                        {item.tcg_api_card_id ? (
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                            Official card
                          </span>
                        ) : null}
                        {item.card_number ? (
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                            #{item.card_number}
                          </span>
                        ) : null}
                        {item.set_id ? (
                          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                            {item.set_id}
                          </span>
                        ) : null}
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          Added {formatDateTime(item.created_at)}
                        </p>
                      </div>

                      <form action={updateItem} className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor={`wishlist-card-name-${item.id}`}
                            className="text-sm font-medium"
                          >
                            Card name
                          </label>
                          <input
                            id={`wishlist-card-name-${item.id}`}
                            name="card_name"
                            type="text"
                            required
                            defaultValue={item.card_name}
                            className={inputClassName}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor={`wishlist-set-name-${item.id}`}
                              className="text-sm font-medium"
                            >
                              Set name
                            </label>
                            <input
                              id={`wishlist-set-name-${item.id}`}
                              name="set_name"
                              type="text"
                              defaultValue={item.set_name ?? ""}
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor={`wishlist-priority-${item.id}`}
                              className="text-sm font-medium"
                            >
                              Priority
                            </label>
                            <PrioritySelect
                              id={`wishlist-priority-${item.id}`}
                              defaultValue={item.priority}
                              className={inputClassName}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`wishlist-language-${item.id}`}
                            className="text-sm font-medium"
                          >
                            Language
                          </label>
                          <LanguageSelect
                            id={`wishlist-language-${item.id}`}
                            defaultValue={item.language ?? ""}
                            className={inputClassName}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`wishlist-notes-${item.id}`}
                            className="text-sm font-medium"
                          >
                            Notes
                          </label>
                          <textarea
                            id={`wishlist-notes-${item.id}`}
                            name="notes"
                            rows={3}
                            defaultValue={item.notes ?? ""}
                            className={inputClassName}
                          />
                        </div>

                        <button
                          type="submit"
                          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                        >
                          Save changes
                        </button>
                      </form>

                      <form action={deleteItem} className="mt-2">
                        <button
                          type="submit"
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          Delete
                        </button>
                      </form>
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
