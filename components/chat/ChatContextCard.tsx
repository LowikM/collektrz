import Link from "next/link";

import {
  chatContextButtonClassName,
  chatFocusRingClassName,
  chatStatusBadgeClassName,
} from "@/components/chat/chat-styles";
import {
  getListingStatusLabel,
  getListingTypeLabel,
  type ListingContext,
} from "@/lib/chat-context";

type ChatContextCardProps = {
  context: ListingContext;
};

function formatPrice(
  targetPrice: string | null,
  listingType: ListingContext["listingType"],
) {
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

function StatusBadge({ children }: { children: React.ReactNode }) {
  return <span className={chatStatusBadgeClassName}>{children}</span>;
}

export function ChatContextCard({ context }: ChatContextCardProps) {
  const priceLabel = formatPrice(context.targetPrice, context.listingType);
  const listingHref = `/events/${context.eventId}`;

  return (
    <div className="border-b border-zinc-200/80 bg-white px-4 py-3.5 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4">
        {context.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- listing thumbnail from API or collection
          <img
            src={context.imageUrl}
            alt=""
            className="h-[72px] w-[72px] shrink-0 rounded-2xl border border-zinc-200 object-cover shadow-sm"
          />
        ) : (
          <div
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500 shadow-sm"
            aria-hidden="true"
          >
            Listing
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-zinc-900">
            {context.cardName}
          </p>

          {priceLabel ? (
            <p className="mt-0.5 text-sm font-medium text-zinc-800">
              {priceLabel}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge>{getListingTypeLabel(context.listingType)}</StatusBadge>
            <StatusBadge>{getListingStatusLabel(context.status)}</StatusBadge>
            {context.condition ? (
              <StatusBadge>{context.condition}</StatusBadge>
            ) : null}
            {context.eventName ? (
              <span className="truncate text-xs text-zinc-500">
                {context.eventName}
              </span>
            ) : null}
          </div>
        </div>

        <Link
          href={listingHref}
          className={`${chatContextButtonClassName} ${chatFocusRingClassName}`}
        >
          View listing
        </Link>
      </div>
    </div>
  );
}
