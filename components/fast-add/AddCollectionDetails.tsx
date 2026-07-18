"use client";

import type { PokemonTcgCardSearchResult } from "@/lib/pokemon-tcg";
import {
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

type AddCollectionDetailsProps = {
  card: PokemonTcgCardSearchResult;
  quantity: number;
  showOnProfile: boolean;
  condition: string;
  notes: string;
  isSubmitting: boolean;
  onQuantityChange: (value: number) => void;
  onShowOnProfileChange: (value: boolean) => void;
  onConditionChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function AddCollectionDetails({
  card,
  quantity,
  showOnProfile,
  condition,
  notes,
  isSubmitting,
  onQuantityChange,
  onShowOnProfileChange,
  onConditionChange,
  onNotesChange,
  onSubmit,
  onBack,
}: AddCollectionDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Add details
        </p>
        <h2 className="mt-2 text-xl font-semibold">{card.name}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {card.set.name}
          {card.number ? ` · #${card.number}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Quantity</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) =>
              onQuantityChange(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
            }
            className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Condition</span>
          <input
            type="text"
            value={condition}
            onChange={(event) => onConditionChange(event.target.value)}
            placeholder="Near Mint, PSA 10…"
            className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={3}
          placeholder="Optional notes"
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <fieldset className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-medium">Profile visibility</legend>
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={showOnProfile}
            onChange={(event) => onShowOnProfileChange(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Show on public profile
        </label>
        <p className="mt-2 text-xs text-zinc-500">
          Leave unchecked to keep this card private. Private items never appear on your
          public profile.
        </p>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 border-t border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`${profilePrimaryButtonClassName} w-full sm:w-auto`}
          >
            {isSubmitting ? "Adding…" : "Add to collection"}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className={`${profileSecondaryButtonClassName} w-full sm:w-auto`}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
