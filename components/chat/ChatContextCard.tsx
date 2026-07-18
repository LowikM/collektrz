import Link from "next/link";

import { chatActionButtonClassName } from "@/components/chat/chat-styles";
import {
  getListingStatusLabel,
  getListingTypeLabel,
  type ListingContext,
} from "@/lib/chat-context";

type ChatContextCardProps = {
  context: ListingContext;
};

function formatPrice(targetPrice: string | null, listingType: ListingContext["listingType"]) {
  if (!targetPrice) {
    return null;
  }

  const value = Number.parseFloat(targetPrice);
  if (Number.isNaN(value)) {
    return null;
  }

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);

  return listingType === "sale" ? formatted : `Target ${formatted}`;
}

export function ChatContextCard({ context }: ChatContextCardProps) {
  const priceLabel = formatPrice(context.targetPrice, context.listingType);
  const listingHref = `/events/${context.eventId}`;

  return (
    <div className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {context.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- listing thumbnail from API or collection
          <img
            src={context.imageUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
            aria-hidden="true"
          >
            Listing
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{context.cardName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span>{getListingTypeLabel(context.listingType)}</span>
            {priceLabel ? <span>{priceLabel}</span> : null}
            {context.condition ? <span>{context.condition}</span> : null}
            <span>{getListingStatusLabel(context.status)}</span>
            {context.eventName ? <span>{context.eventName}</span> : null}
          </div>
        </div>

        <Link href={listingHref} className={chatActionButtonClassName}>
          View listing
        </Link>
      </div>
    </div>
  );
}
