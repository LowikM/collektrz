import Link from "next/link";

import {
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

type FastAddSuccessProps = {
  cardName: string;
  quantity: number;
  incremented: boolean;
  onAddAnother: () => void;
  onAddSameCardAgain?: () => void;
  canAddSameCardAgain?: boolean;
  preferCamera?: boolean;
};

export function FastAddSuccess({
  cardName,
  quantity,
  incremented,
  onAddAnother,
  onAddSameCardAgain,
  canAddSameCardAgain = false,
  preferCamera = false,
}: FastAddSuccessProps) {
  return (
    <div
      className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900/40 dark:bg-green-950/30"
      role="status"
      aria-live="polite"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
        Success
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-green-950 dark:text-green-50">
        Card added successfully
      </h2>
      <p className="mt-2 text-sm text-green-900/80 dark:text-green-100/80">
        {cardName} is now in your collection
        {incremented ? " with an updated quantity" : ""}: {quantity}.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onAddAnother}
          className={profilePrimaryButtonClassName}
        >
          {preferCamera ? "Take another photo" : "Add another card"}
        </button>
        {canAddSameCardAgain && onAddSameCardAgain ? (
          <button
            type="button"
            onClick={onAddSameCardAgain}
            className={profileSecondaryButtonClassName}
          >
            Add same card again
          </button>
        ) : null}
        <Link href="/my-collection?view=collection" className={profileSecondaryButtonClassName}>
          View in collection
        </Link>
        <Link
          href="/my-collection?view=portfolio"
          className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
        >
          View portfolio
        </Link>
      </div>
    </div>
  );
}
