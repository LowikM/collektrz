"use client";

import { useState } from "react";

import { LanguageSelect } from "@/components/LanguageSelect";
import { PrioritySelect } from "@/components/PrioritySelect";
import {
  bulkDeleteWishlistItems,
  bulkSetWishlistPriority,
  deleteWishlistItem,
  updateWishlistItem,
} from "@/app/my-wishlist/actions";
import {
  bulkSetWishlistVisibility,
  setAllWishlistVisibility,
  updateWishlistItemVisibility,
} from "@/app/my-wishlist/privacy-actions";
import { WISHLIST_PRIORITY_LABELS } from "@/lib/wishlist";
import {
  ITEM_VISIBILITY_LABELS,
  type ItemVisibility,
} from "@/lib/item-visibility";

export type WishlistItemRow = {
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
  visibility: ItemVisibility;
};

type WishlistManageListProps = {
  items: WishlistItemRow[];
};

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

const badgeClassName =
  "rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

const toolbarButtonClassName =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900";

const bulkPrioritySelectClassName =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function WishlistPrivacyMenu({ item }: { item: WishlistItemRow }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        aria-label={`Privacy options for ${item.card_name}`}
      >
        ⋯
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <form action={updateWishlistItemVisibility}>
            <input type="hidden" name="wishlist_item_id" value={item.id} />
            <input type="hidden" name="visibility" value="public" />
            <button type="submit" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
              Make public
            </button>
          </form>
          <form action={updateWishlistItemVisibility}>
            <input type="hidden" name="wishlist_item_id" value={item.id} />
            <input type="hidden" name="visibility" value="private" />
            <button type="submit" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
              Make private
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function WishlistManageList({ items }: WishlistManageListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const selectedCount = selectedIds.size;

  function toggleItem(itemId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }

      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  function selectNone() {
    setSelectedIds(new Set());
  }

  function handleBulkDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (selectedCount === 0) {
      event.preventDefault();
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedCount} selected wishlist item${selectedCount === 1 ? "" : "s"}? This cannot be undone.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  function handleAllVisibilitySubmit(
    event: React.FormEvent<HTMLFormElement>,
    visibility: ItemVisibility,
  ) {
    const message =
      visibility === "public"
        ? "Make every wishlist item public? Public items may appear on your profile."
        : "Make every wishlist item private?";

    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAll}
            className={toolbarButtonClassName}
          >
            Select all
          </button>
          <button
            type="button"
            onClick={selectNone}
            className={toolbarButtonClassName}
          >
            Select none
          </button>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {selectedCount} selected
        </p>

        <form
          action={bulkSetWishlistPriority}
          className="flex flex-wrap items-end gap-2"
        >
          {items.map((item) =>
            selectedIds.has(item.id) ? (
              <input
                key={`priority-${item.id}`}
                type="hidden"
                name="wishlist_item_ids"
                value={item.id}
              />
            ) : null,
          )}
          <div className="space-y-1">
            <label htmlFor="bulk-priority" className="text-sm font-medium">
              Set priority
            </label>
            <PrioritySelect
              id="bulk-priority"
              name="bulk_priority"
              className={bulkPrioritySelectClassName}
            />
          </div>
          <button
            type="submit"
            disabled={selectedCount === 0}
            className={toolbarButtonClassName}
          >
            Apply to selected
          </button>
        </form>

        <form action={bulkDeleteWishlistItems} onSubmit={handleBulkDeleteSubmit}>
          {items.map((item) =>
            selectedIds.has(item.id) ? (
              <input
                key={`delete-${item.id}`}
                type="hidden"
                name="wishlist_item_ids"
                value={item.id}
              />
            ) : null,
          )}
          <button
            type="submit"
            disabled={selectedCount === 0}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
          >
            Delete selected
          </button>
        </form>

        <form action={bulkSetWishlistVisibility}>
          {items.map((item) =>
            selectedIds.has(item.id) ? (
              <input key={`public-${item.id}`} type="hidden" name="wishlist_item_ids" value={item.id} />
            ) : null,
          )}
          <input type="hidden" name="visibility" value="public" />
          <button type="submit" disabled={selectedCount === 0} className={toolbarButtonClassName}>
            Make selected public
          </button>
        </form>

        <form action={bulkSetWishlistVisibility}>
          {items.map((item) =>
            selectedIds.has(item.id) ? (
              <input key={`private-${item.id}`} type="hidden" name="wishlist_item_ids" value={item.id} />
            ) : null,
          )}
          <input type="hidden" name="visibility" value="private" />
          <button type="submit" disabled={selectedCount === 0} className={toolbarButtonClassName}>
            Make selected private
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <form action={setAllWishlistVisibility} onSubmit={(event) => handleAllVisibilitySubmit(event, "public")}>
          <input type="hidden" name="visibility" value="public" />
          <input type="hidden" name="confirm_all" value="yes" />
          <button type="submit" className={toolbarButtonClassName}>
            Make all public
          </button>
        </form>
        <form action={setAllWishlistVisibility} onSubmit={(event) => handleAllVisibilitySubmit(event, "private")}>
          <input type="hidden" name="visibility" value="private" />
          <input type="hidden" name="confirm_all" value="yes" />
          <button type="submit" className={toolbarButtonClassName}>
            Make all private
          </button>
        </form>
      </div>

      <ul className="grid gap-4">
        {items.map((item) => (
          <li key={item.id}>
            <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="mb-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={(event) =>
                    toggleItem(item.id, event.target.checked)
                  }
                  aria-label={`Select ${item.card_name}`}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1 flex flex-wrap items-start gap-2">
                  <span className={badgeClassName}>
                    {WISHLIST_PRIORITY_LABELS[item.priority] ??
                      `Priority ${item.priority}`}
                  </span>
                  <span className={badgeClassName}>
                    {ITEM_VISIBILITY_LABELS[item.visibility]}
                  </span>
                  {item.language ? (
                    <span className={badgeClassName}>{item.language}</span>
                  ) : null}
                  {item.tcg_api_card_id ? (
                    <span className={badgeClassName}>Official card</span>
                  ) : null}
                  {item.card_number ? (
                    <span className={badgeClassName}>#{item.card_number}</span>
                  ) : null}
                  {item.set_id ? (
                    <span className={badgeClassName}>{item.set_id}</span>
                  ) : null}
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Added {formatDateTime(item.created_at)}
                  </p>
                  <WishlistPrivacyMenu item={item} />
                </div>
              </div>

              <form action={updateWishlistItem} className="space-y-4">
                <input type="hidden" name="wishlist_item_id" value={item.id} />
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

              <form action={deleteWishlistItem} className="mt-2">
                <input type="hidden" name="wishlist_item_id" value={item.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </form>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
