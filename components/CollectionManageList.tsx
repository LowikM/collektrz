"use client";

import { useState } from "react";

import {
  bulkSetCollectionFeatured,
  bulkSetCollectionVisibility,
  setAllCollectionVisibility,
  updateCollectionItemFeatured,
  updateCollectionItemVisibility,
} from "@/app/my-collection/privacy-actions";
import {
  deleteCollectionItem,
  updateCollectionItem,
} from "@/app/my-collection/actions";
import {
  CollectionItemImagePlaceholder,
} from "@/components/CollectionItemSealedFields";
import {
  EditCollectionItemForm,
  type EditableCollectionItem,
} from "@/components/EditCollectionItemForm";
import {
  ITEM_VISIBILITY_LABELS,
  type ItemVisibility,
} from "@/lib/item-visibility";

type ItemKind = "card" | "sealed";

export type ManageableCollectionItem = EditableCollectionItem & {
  card_ref: string;
  tcg_api_card_id: string | null;
  card_number: string | null;
  set_id: string | null;
  created_at: string;
  updated_at: string;
  visibility: ItemVisibility;
  is_featured: boolean;
};

type CollectionManageListProps = {
  items: ManageableCollectionItem[];
};

const ITEM_KIND_LABELS: Record<ItemKind, string> = {
  card: "Card",
  sealed: "Sealed",
};

const badgeClassName =
  "rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

const toolbarButtonClassName =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900";

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CollectionItemThumbnail({ item }: { item: ManageableCollectionItem }) {
  if (item.item_kind === "sealed") {
    if (item.image_url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.card_name}
          className="h-[4.875rem] w-14 shrink-0 rounded object-contain"
        />
      );
    }

    return <CollectionItemImagePlaceholder size="sm" />;
  }

  return null;
}

function ItemPrivacyMenu({ item }: { item: ManageableCollectionItem }) {
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
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <form action={updateCollectionItemVisibility}>
            <input type="hidden" name="collection_item_id" value={item.id} />
            <input type="hidden" name="visibility" value="public" />
            <button type="submit" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
              Make public
            </button>
          </form>
          <form action={updateCollectionItemVisibility}>
            <input type="hidden" name="collection_item_id" value={item.id} />
            <input type="hidden" name="visibility" value="private" />
            <button type="submit" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
              Make private
            </button>
          </form>
          <form action={updateCollectionItemFeatured}>
            <input type="hidden" name="collection_item_id" value={item.id} />
            <input type="hidden" name="is_featured" value={item.is_featured ? "0" : "1"} />
            <button
              type="submit"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              {item.is_featured ? "Remove from featured" : "Feature on profile"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function CollectionManageList({ items }: CollectionManageListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectedCount = selectedIds.size;

  function toggleItem(itemId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }

  function handleAllVisibilitySubmit(
    event: React.FormEvent<HTMLFormElement>,
    visibility: ItemVisibility,
  ) {
    const message =
      visibility === "public"
        ? "Make every collection item public? Public items may appear on your profile."
        : "Make every collection item private and remove featured highlights?";

    if (!window.confirm(message)) {
      event.preventDefault();
      return;
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelectedIds(new Set(items.map((item) => item.id)))} className={toolbarButtonClassName}>
            Select all
          </button>
          <button type="button" onClick={() => setSelectedIds(new Set())} className={toolbarButtonClassName}>
            Select none
          </button>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedCount} selected</p>

        <div className="flex flex-wrap gap-2">
          <form action={bulkSetCollectionVisibility}>
            {items.map((item) =>
              selectedIds.has(item.id) ? (
                <input key={`public-${item.id}`} type="hidden" name="collection_item_ids" value={item.id} />
              ) : null,
            )}
            <input type="hidden" name="visibility" value="public" />
            <button type="submit" disabled={selectedCount === 0} className={toolbarButtonClassName}>
              Make selected public
            </button>
          </form>
          <form action={bulkSetCollectionVisibility}>
            {items.map((item) =>
              selectedIds.has(item.id) ? (
                <input key={`private-${item.id}`} type="hidden" name="collection_item_ids" value={item.id} />
              ) : null,
            )}
            <input type="hidden" name="visibility" value="private" />
            <button type="submit" disabled={selectedCount === 0} className={toolbarButtonClassName}>
              Make selected private
            </button>
          </form>
          <form action={bulkSetCollectionFeatured}>
            {items.map((item) =>
              selectedIds.has(item.id) ? (
                <input key={`feature-${item.id}`} type="hidden" name="collection_item_ids" value={item.id} />
              ) : null,
            )}
            <input type="hidden" name="is_featured" value="1" />
            <button type="submit" disabled={selectedCount === 0} className={toolbarButtonClassName}>
              Feature selected
            </button>
          </form>
          <form action={bulkSetCollectionFeatured}>
            {items.map((item) =>
              selectedIds.has(item.id) ? (
                <input key={`unfeature-${item.id}`} type="hidden" name="collection_item_ids" value={item.id} />
              ) : null,
            )}
            <input type="hidden" name="is_featured" value="0" />
            <button type="submit" disabled={selectedCount === 0} className={toolbarButtonClassName}>
              Remove from featured
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <form action={setAllCollectionVisibility} onSubmit={(event) => handleAllVisibilitySubmit(event, "public")}>
            <input type="hidden" name="visibility" value="public" />
            <input type="hidden" name="confirm_all" value="yes" />
            <button type="submit" className={toolbarButtonClassName}>
              Make all public
            </button>
          </form>
          <form action={setAllCollectionVisibility} onSubmit={(event) => handleAllVisibilitySubmit(event, "private")}>
            <input type="hidden" name="visibility" value="private" />
            <input type="hidden" name="confirm_all" value="yes" />
            <button type="submit" className={toolbarButtonClassName}>
              Make all private
            </button>
          </form>
        </div>
      </div>

      <ul className="grid gap-4">
        {items.map((item) => {
          const updateItem = updateCollectionItem.bind(null, item.id);
          const deleteItem = deleteCollectionItem.bind(null, item.id);
          const isSealed = item.item_kind === "sealed";

          return (
            <li key={item.id}>
              <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-4 flex gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={(event) => toggleItem(item.id, event.target.checked)}
                    aria-label={`Select ${item.card_name}`}
                    className="mt-2"
                  />
                  {isSealed ? <CollectionItemThumbnail item={item} /> : null}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start gap-2">
                      <span className={badgeClassName}>{ITEM_KIND_LABELS[item.item_kind]}</span>
                      <span className={badgeClassName}>{ITEM_VISIBILITY_LABELS[item.visibility]}</span>
                      {item.is_featured ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          Featured
                        </span>
                      ) : null}
                      {isSealed && item.sealed_product_type ? (
                        <span className={badgeClassName}>{item.sealed_product_type}</span>
                      ) : null}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-medium tracking-tight">{item.card_name}</h3>
                        {item.set_name ? (
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Set: {item.set_name}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-zinc-500">Added {formatDateTime(item.created_at)} · Qty {item.quantity}</p>
                      </div>
                      <ItemPrivacyMenu item={item} />
                    </div>
                  </div>
                </div>
                <EditCollectionItemForm item={item} updateAction={updateItem} deleteAction={deleteItem} />
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
