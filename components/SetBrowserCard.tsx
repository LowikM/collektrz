import { createCollectionItem } from "@/app/my-collection/actions";
import { createWishlistItem } from "@/app/my-wishlist/actions";
import type { PokemonTcgSetCard } from "@/lib/pokemon-tcg";
import {
  getSetCardStatus,
  matchesSetCardFilter,
  SET_CARD_STATUS_LABELS,
  type SetCardFilter,
  type SetCardStatus,
} from "@/lib/set-browser";
import { WISHLIST_PRIORITY_DEFAULT } from "@/lib/wishlist";

type SetBrowserCardProps = {
  card: PokemonTcgSetCard;
  setId: string;
  ownedIds: ReadonlySet<string>;
  wantedIds: ReadonlySet<string>;
  isSelected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  mode?: "grid" | "binder";
  statusFilter?: SetCardFilter;
};

const badgeBaseClassName =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide";

const badgeStyles: Record<SetCardStatus, string> = {
  owned:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/60 dark:text-green-300",
  wanted:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  "owned-wanted":
    "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
  missing:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
};

const badgeDotStyles: Record<SetCardStatus, string> = {
  owned: "bg-green-500 dark:bg-green-400",
  wanted: "bg-blue-500 dark:bg-blue-400",
  "owned-wanted": "bg-gradient-to-r from-green-500 to-blue-500",
  missing: "bg-amber-400 dark:bg-amber-300",
};

const buttonClassName =
  "rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900";

function StatusBadge({ status }: { status: SetCardStatus }) {
  return (
    <span className={`${badgeBaseClassName} ${badgeStyles[status]}`}>
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${badgeDotStyles[status]}`}
        aria-hidden="true"
      />
      {SET_CARD_STATUS_LABELS[status]}
    </span>
  );
}

function getGridCardClass(isSelected: boolean) {
  const base =
    "shadow-sm transition-[box-shadow,background-color,border-color]";

  if (isSelected) {
    return `${base} border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/35 shadow-md dark:border-blue-400 dark:bg-blue-950/25 dark:ring-blue-400/35`;
  }

  return `${base} border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700`;
}

function getBinderBorderClass(status: SetCardStatus, isSelected: boolean) {
  let base = "shadow-sm transition-[box-shadow,background-color,border-color]";

  switch (status) {
    case "owned":
      base += " border-green-500 bg-green-50/20 dark:border-green-400 dark:bg-green-950/10";
      break;
    case "wanted":
      base += " border-blue-500 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/10";
      break;
    case "owned-wanted":
      base +=
        " border-green-500 bg-green-50/15 ring-2 ring-blue-500/25 dark:border-green-400 dark:bg-green-950/10 dark:ring-blue-400/25";
      break;
    case "missing":
      base +=
        " border-dashed border-zinc-300 bg-zinc-50/80 dark:border-zinc-600 dark:bg-zinc-900/50";
      break;
  }

  if (isSelected) {
    base +=
      " ring-2 ring-blue-500/40 shadow-md dark:ring-blue-400/40";
  }

  return base;
}

function BinderFilteredSlot({ cardNumber }: { cardNumber: string }) {
  return (
    <article
      className="flex h-full min-h-[300px] flex-col rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/70 p-4 dark:border-zinc-700/90 dark:bg-zinc-900/40"
      aria-hidden="true"
    >
      <span className="font-mono text-xs font-semibold tabular-nums text-zinc-400 dark:text-zinc-500">
        #{cardNumber}
      </span>
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-2 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white/80 text-zinc-400 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2.628 1.601C5.028 1.347 7.547 1 10 1s4.973.347 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037a.75.75 0 0 1-.557.724l-5.453 1.454a.75.75 0 0 1-.938-.938l1.454-5.453a.75.75 0 0 1 .724-.557H14.25a.75.75 0 0 0 .53-.22L17.47 9.53a.75.75 0 0 0 .22-.53V4.342a.75.75 0 0 0-.628-.74C14.572 3.347 12.253 3 10 3S5.428 3.347 2.628 3.899A.75.75 0 0 0 2 4.641v2.288c0 .598.237 1.17.659 1.591l4.682 4.682c.22.22.342.522.342.838v3.037a.75.75 0 0 1-.557.724l-5.453 1.454a.75.75 0 0 1-.938-.938l1.454-5.453a.75.75 0 0 1 .724-.557h3.045c.316 0 .618-.122.838-.342l4.682-4.682A2.25 2.25 0 0 0 17.25 6.929V4.341a.75.75 0 0 0-.628-.74Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Hidden by filter
          </p>
          <p className="text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
            Switch to All to show this card
          </p>
        </div>
      </div>
    </article>
  );
}

export function SetBrowserCard({
  card,
  setId,
  ownedIds,
  wantedIds,
  isSelected = false,
  onSelectChange,
  mode = "grid",
  statusFilter = "all",
}: SetBrowserCardProps) {
  const status = getSetCardStatus(ownedIds, wantedIds, card.id);
  const isOwned = ownedIds.has(card.id);
  const isWanted = wantedIds.has(card.id);
  const returnPath = `/sets/${setId}`;
  const matchesFilter = matchesSetCardFilter(
    statusFilter,
    card.id,
    ownedIds,
    wantedIds,
  );

  if (mode === "binder" && statusFilter !== "all" && !matchesFilter) {
    return <BinderFilteredSlot cardNumber={card.number} />;
  }

  const borderClassName =
    mode === "binder"
      ? getBinderBorderClass(status, isSelected)
      : getGridCardClass(isSelected);

  const showBinderWantedBadge = mode === "binder" && status === "owned-wanted";
  const isBinderMissing = status === "missing" && mode === "binder";

  return (
    <article
      className={`flex h-full flex-col rounded-xl border p-4 ${borderClassName}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <label
          className={`flex min-w-0 items-center gap-2.5 rounded-md py-0.5 pr-1 transition-colors ${
            isSelected ? "text-blue-700 dark:text-blue-300" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(event) => onSelectChange?.(event.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-zinc-300 accent-blue-600 dark:border-zinc-600 dark:accent-blue-400"
            aria-label={`Select ${card.name}`}
          />
          <span className="font-mono text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
            #{card.number}
          </span>
        </label>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {showBinderWantedBadge ? (
            <span className={`${badgeBaseClassName} ${badgeStyles.wanted}`}>
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${badgeDotStyles.wanted}`}
                aria-hidden="true"
              />
              Wanted
            </span>
          ) : null}
          {mode === "grid" ? (
            <StatusBadge status={status} />
          ) : status !== "owned-wanted" ? (
            <StatusBadge status={status} />
          ) : null}
        </div>
      </div>

      <div className="mb-4 flex flex-1 flex-col items-center">
        {card.images.small ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.images.small}
            alt=""
            className={`h-auto w-full max-w-[132px] rounded-md ${
              isBinderMissing ? "opacity-55 grayscale" : ""
            }`}
          />
        ) : (
          <div
            className={`flex h-36 w-full max-w-[132px] items-center justify-center rounded-md text-xs text-zinc-500 ${
              isBinderMissing
                ? "border border-dashed border-zinc-300 bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-800/80"
                : "bg-zinc-100 dark:bg-zinc-900"
            }`}
          >
            No image
          </div>
        )}
        <h3
          className={`mt-3 line-clamp-2 text-center text-sm font-semibold leading-snug ${
            isBinderMissing
              ? "text-zinc-500 dark:text-zinc-400"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {card.name}
        </h3>
      </div>

      <div className="mt-auto space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <form action={createCollectionItem}>
          <input type="hidden" name="return_path" value={returnPath} />
          <input type="hidden" name="item_kind" value="card" />
          <input type="hidden" name="quantity" value="1" />
          <input type="hidden" name="card_name" value={card.name} />
          <input type="hidden" name="set_name" value={card.set.name} />
          <input type="hidden" name="tcg_api_card_id" value={card.id} />
          <input type="hidden" name="card_number" value={card.number} />
          <input type="hidden" name="set_id" value={card.set.id} />
          <button
            type="submit"
            disabled={isOwned}
            className={`${buttonClassName} w-full`}
          >
            Add to Collection
          </button>
        </form>

        <form action={createWishlistItem}>
          <input type="hidden" name="return_path" value={returnPath} />
          <input type="hidden" name="card_name" value={card.name} />
          <input type="hidden" name="set_name" value={card.set.name} />
          <input type="hidden" name="tcg_api_card_id" value={card.id} />
          <input type="hidden" name="card_number" value={card.number} />
          <input type="hidden" name="set_id" value={card.set.id} />
          <input
            type="hidden"
            name="priority"
            value={WISHLIST_PRIORITY_DEFAULT}
          />
          <button
            type="submit"
            disabled={isWanted}
            className={`${buttonClassName} w-full`}
          >
            Add to Wishlist
          </button>
        </form>
      </div>
    </article>
  );
}
