"use client";

import { useState } from "react";

import {
  CollectionItemImageField,
  SealedConditionSelect,
  SealedProductTypeSelect,
} from "@/components/CollectionItemSealedFields";
import { LanguageSelect } from "@/components/LanguageSelect";

type ItemKind = "card" | "sealed";

export type EditableCollectionItem = {
  id: string;
  item_kind: ItemKind;
  card_name: string;
  set_name: string | null;
  condition: string | null;
  notes: string | null;
  language: string | null;
  quantity: number;
  sealed_product_type: string | null;
  image_url: string | null;
};

type EditCollectionItemFormProps = {
  item: EditableCollectionItem;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

export function EditCollectionItemForm({
  item,
  updateAction,
  deleteAction,
}: EditCollectionItemFormProps) {
  const [itemKind, setItemKind] = useState<ItemKind>(item.item_kind);
  const isSealed = itemKind === "sealed";

  return (
    <>
      <form action={updateAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`item-kind-${item.id}`}
              className="text-sm font-medium"
            >
              Item kind
            </label>
            <select
              id={`item-kind-${item.id}`}
              name="item_kind"
              required
              value={itemKind}
              onChange={(event) =>
                setItemKind(event.target.value as ItemKind)
              }
              className={inputClassName}
            >
              <option value="card">Card</option>
              <option value="sealed">Sealed</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`quantity-${item.id}`}
              className="text-sm font-medium"
            >
              Quantity
            </label>
            <input
              id={`quantity-${item.id}`}
              name="quantity"
              type="number"
              min={1}
              defaultValue={item.quantity}
              required
              className={inputClassName}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`card-name-${item.id}`}
            className="text-sm font-medium"
          >
            {isSealed ? "Product name" : "Card name"}
          </label>
          <input
            id={`card-name-${item.id}`}
            name="card_name"
            type="text"
            required
            defaultValue={item.card_name}
            className={inputClassName}
          />
        </div>

        {isSealed ? (
          <div className="space-y-2">
            <label
              htmlFor={`sealed-product-type-${item.id}`}
              className="text-sm font-medium"
            >
              Product type
            </label>
            <SealedProductTypeSelect
              id={`sealed-product-type-${item.id}`}
              required
              defaultValue={item.sealed_product_type ?? ""}
              className={inputClassName}
            />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`set-name-${item.id}`}
              className="text-sm font-medium"
            >
              Set name
            </label>
            <input
              id={`set-name-${item.id}`}
              name="set_name"
              type="text"
              defaultValue={item.set_name ?? ""}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`condition-${item.id}`}
              className="text-sm font-medium"
            >
              {isSealed ? "Sealed condition" : "Condition"}
            </label>
            {isSealed ? (
              <SealedConditionSelect
                id={`condition-${item.id}`}
                defaultValue={item.condition ?? ""}
                className={inputClassName}
              />
            ) : (
              <input
                id={`condition-${item.id}`}
                name="condition"
                type="text"
                defaultValue={item.condition ?? ""}
                className={inputClassName}
              />
            )}
          </div>
        </div>

        {isSealed ? (
          <CollectionItemImageField
            id={`image-url-${item.id}`}
            defaultValue={item.image_url ?? ""}
            inputClassName={inputClassName}
          />
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor={`language-${item.id}`}
            className="text-sm font-medium"
          >
            Language
          </label>
          <LanguageSelect
            id={`language-${item.id}`}
            defaultValue={item.language ?? ""}
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`notes-${item.id}`} className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id={`notes-${item.id}`}
            name="notes"
            rows={3}
            defaultValue={item.notes ?? ""}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Save changes
          </button>
        </div>
      </form>

      <form action={deleteAction} className="mt-2">
        <button
          type="submit"
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </form>
    </>
  );
}
