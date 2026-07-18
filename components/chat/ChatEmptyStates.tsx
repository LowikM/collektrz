import Link from "next/link";

import { chatPrimaryButtonClassName } from "@/components/chat/chat-styles";

const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900";

export function NoConversationsEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
        <svg
          aria-hidden="true"
          className="h-8 w-8 text-zinc-500 dark:text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.75c0 2.485 4.03 4.5 9 4.5s9-2.015 9-4.5S17.97 9.75 12 9.75 3 11.765 3 14.25m18 0V17.25c0 2.485-4.03 4.5-9 4.5s-9-2.015-9-4.5V14.25"
          />
        </svg>
      </div>

      <div className="max-w-sm space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">
          No conversations yet
        </h3>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Start chatting with collectors from a listing, match, or event to
          coordinate trades and sales.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/my-listings" className={chatPrimaryButtonClassName}>
          Browse listings
        </Link>
        <Link href="/my-matches" className={secondaryButtonClassName}>
          View matches
        </Link>
        <Link href="/events" className={secondaryButtonClassName}>
          Find events
        </Link>
      </div>
    </div>
  );
}

export function NoSelectionEmptyState({
  invalidSelection = false,
}: {
  invalidSelection?: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
        <svg
          aria-hidden="true"
          className="h-10 w-10 text-zinc-400 dark:text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
      </div>

      <div className="max-w-sm space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">
          {invalidSelection
            ? "Conversation not found"
            : "Select a conversation to start chatting"}
        </h3>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {invalidSelection
            ? "This collector has no message history with you yet."
            : "Pick a collector from the sidebar to continue your marketplace conversation."}
        </p>
      </div>
    </div>
  );
}

export function SearchNoResultsEmptyState({
  onClearSearch,
}: {
  onClearSearch: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center dark:border-zinc-700">
      <p className="text-sm font-medium">No conversations found</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Try a different name or message preview.
      </p>
      <button
        type="button"
        onClick={onClearSearch}
        className={`${chatPrimaryButtonClassName} mt-4`}
      >
        Clear search
      </button>
    </div>
  );
}
