import Link from "next/link";

import { expressInterest } from "@/app/events/[id]/actions";

type ListingInterestProps = {
  eventId: string;
  listingId: string;
  listingOwnerId: string;
  currentUserId: string | null;
  isInterested: boolean;
  interestCount: number;
};

export function ListingInterest({
  eventId,
  listingId,
  listingOwnerId,
  currentUserId,
  isInterested,
  interestCount,
}: ListingInterestProps) {
  const isOwner = currentUserId === listingOwnerId;
  const interestLabel =
    interestCount === 1 ? "1 interested" : `${interestCount} interested`;

  if (isOwner) {
    return interestCount > 0 ? (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{interestLabel}</p>
    ) : null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {interestCount > 0 ? (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {interestLabel}
        </span>
      ) : null}

      {isInterested ? (
        <span className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Interested
        </span>
      ) : currentUserId ? (
        <form action={expressInterest.bind(null, eventId, listingId)}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            I&apos;m interested
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          I&apos;m interested
        </Link>
      )}
    </div>
  );
}
