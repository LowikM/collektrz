import type { CollectionDuplicateInfo } from "@/app/my-collection/add/actions";
import {
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

type DuplicateCardDialogProps = {
  existing: CollectionDuplicateInfo;
  requestedQuantity: number;
  onIncreaseQuantity: () => void;
  onAddSeparate: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export function DuplicateCardDialog({
  existing,
  requestedQuantity,
  onIncreaseQuantity,
  onAddSeparate,
  onCancel,
  isSubmitting = false,
}: DuplicateCardDialogProps) {
  return (
    <div
      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
      role="dialog"
      aria-labelledby="duplicate-card-title"
    >
      <h2 id="duplicate-card-title" className="text-lg font-semibold">
        You already own this card
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {existing.card_name}
        {existing.set_name ? ` — ${existing.set_name}` : ""} is already in your collection
        with quantity {existing.quantity}.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onIncreaseQuantity}
          disabled={isSubmitting}
          className={profilePrimaryButtonClassName}
        >
          Increase quantity (+{requestedQuantity})
        </button>
        <button
          type="button"
          onClick={onAddSeparate}
          disabled={isSubmitting}
          className={profileSecondaryButtonClassName}
        >
          Add as separate item
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
