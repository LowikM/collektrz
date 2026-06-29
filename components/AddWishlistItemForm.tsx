"use client";

import { useState } from "react";

import {
  CardSearchCombobox,
  type CardSearchResult,
} from "@/components/CardSearchCombobox";
import { LanguageSelect } from "@/components/LanguageSelect";
import { PrioritySelect } from "@/components/PrioritySelect";

type EntryMode = "search" | "manual";

type AddWishlistItemFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

const toggleButtonClassName =
  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors";

export function AddWishlistItemForm({ action }: AddWishlistItemFormProps) {
  const [entryMode, setEntryMode] = useState<EntryMode>("search");
  const [selectedCard, setSelectedCard] = useState<CardSearchResult | null>(
    null,
  );
  const [cardName, setCardName] = useState("");
  const [setName, setSetName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [setId, setSetId] = useState("");
  const [tcgApiCardId, setTcgApiCardId] = useState("");

  const showSearchMode = entryMode === "search";

  function clearSelectedCardFields() {
    setSelectedCard(null);
    setCardName("");
    setSetName("");
    setCardNumber("");
    setSetId("");
    setTcgApiCardId("");
  }

  function handleEntryModeChange(mode: EntryMode) {
    setEntryMode(mode);
    clearSelectedCardFields();
  }

  function handleSelectCard(card: CardSearchResult) {
    setSelectedCard(card);
    setCardName(card.name);
    setSetName(card.set.name ?? "");
    setCardNumber(card.number ?? "");
    setSetId(card.set.id ?? "");
    setTcgApiCardId(card.id);
  }

  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="space-y-2">
        <span className="text-sm font-medium">How to add this card</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleEntryModeChange("search")}
            className={`${toggleButtonClassName} ${
              entryMode === "search"
                ? "border-foreground bg-foreground text-background"
                : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            }`}
          >
            Search official Pokémon cards
          </button>
          <button
            type="button"
            onClick={() => handleEntryModeChange("manual")}
            className={`${toggleButtonClassName} ${
              entryMode === "manual"
                ? "border-foreground bg-foreground text-background"
                : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            }`}
          >
            Enter manually
          </button>
        </div>
      </div>

      {showSearchMode ? (
        <>
          <div className="space-y-2">
            <label htmlFor="create-wishlist-card-search" className="text-sm font-medium">
              Find a card <span className="text-red-600">*</span>
            </label>
            <CardSearchCombobox
              inputId="create-wishlist-card-search"
              inputClassName={inputClassName}
              selectedCard={selectedCard}
              onSelect={handleSelectCard}
              onClear={clearSelectedCardFields}
            />
          </div>
          <input type="hidden" name="card_name" value={cardName} required />
          <input type="hidden" name="card_number" value={cardNumber} />
          <input type="hidden" name="set_id" value={setId} />
          <input type="hidden" name="tcg_api_card_id" value={tcgApiCardId} />
        </>
      ) : (
        <div className="space-y-2">
          <label htmlFor="create-wishlist-card-name" className="text-sm font-medium">
            Card name <span className="text-red-600">*</span>
          </label>
          <input
            id="create-wishlist-card-name"
            name="card_name"
            type="text"
            required
            className={inputClassName}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="create-wishlist-set-name" className="text-sm font-medium">
            Set name
          </label>
          <input
            id="create-wishlist-set-name"
            name="set_name"
            type="text"
            value={setName}
            onChange={(event) => setSetName(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="create-wishlist-priority" className="text-sm font-medium">
            Priority <span className="text-red-600">*</span>
          </label>
          <PrioritySelect
            id="create-wishlist-priority"
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="create-wishlist-language" className="text-sm font-medium">
          Language
        </label>
        <LanguageSelect id="create-wishlist-language" className={inputClassName} />
      </div>

      <div className="space-y-2">
        <label htmlFor="create-wishlist-notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="create-wishlist-notes"
          name="notes"
          rows={3}
          className={inputClassName}
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Add to wishlist
      </button>
    </form>
  );
}
